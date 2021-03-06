/* ------------
     Kernel.ts

     Requires globals.ts

     Routines for the Operating System, NOT the host.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

module TSOS {

    export class Kernel {
        //
        // OS Startup and Shutdown Routines
        //
        public krnBootstrap() {      // Page 8. {
            Control.hostLog("bootstrap", "host");  // Use hostLog because we ALWAYS want this, even if _Trace is off.

            //Initialize the active PCB
            _CurPCB = new TSOS.Pcb();
            _CurPCB.init();

            // Initialize the MMU
            _MMU = new TSOS.Mmu();
            _MMU.init();

            // Initialize our global queues.
            _KernelInterruptQueue = new Queue();  // A (currently) non-priority queue for interrupt requests (IRQs).
            _KernelBuffers = new Array();         // Buffers... for the kernel.
            _KernelInputQueue = new Queue();      // Where device input lands before being processed out somewhere.
            _Console = new Console();          // The command line interface / console I/O device.
            _ResidentQueue = new Queue();      // Program residency queue
            _ReadyQueue = new Queue();         // Program ready queue
            _TerminatedQueue = new Queue();    // Program terminated queue


            // Initialize the console.
            _Console.init();

            // Initialize standard input and output to the _Console.
            _StdIn  = _Console;
            _StdOut = _Console;

            // Load the Keyboard Device Driver
            this.krnTrace("Loading the keyboard device driver.");
            _krnKeyboardDriver = new DeviceDriverKeyboard();     // Construct it.
            _krnKeyboardDriver.driverEntry();                    // Call the driverEntry() initialization routine.
            this.krnTrace(_krnKeyboardDriver.status);

            // Load the Disk Device Driver
            this.krnTrace("Disk loading");
            _krnDiskDriver = new DeviceDriverDisk();
            _krnDiskDriver.driverEntry();
            this.krnTrace(_krnDiskDriver.status);
            //

            // Enable the OS Interrupts.  (Not the CPU clock interrupt, as that is done in the hardware sim.)
            this.krnTrace("Enabling the interrupts.");
            this.krnEnableInterrupts();

            // Launch the shell.
            this.krnTrace("Creating and Launching the shell.");
            _OsShell = new Shell();
            _OsShell.init();

            // Finally, initiate testing.
            if (_GLaDOS) {
                _GLaDOS.afterStartup();
            }
        }

        public krnShutdown() {
            this.krnTrace("begin shutdown OS");
            // TODO: Check for running processes.  Alert if there are some, alert and stop.  Else...
            if(_CPU.isExecuting){
                this.krnTrace("Programs running, terminating shutdown.");
                return;
            }
            // ... Disable the Interrupts.
            this.krnTrace("Disabling the interrupts.");
            this.krnDisableInterrupts();
            //
            // Unload the Device Drivers?
            // More?
            //
            this.krnTrace("end shutdown OS");
        }


        public krnOnCPUClockPulse() {
            /* This gets called from the host hardware sim every time there is a hardware clock pulse.
               This is NOT the same as a TIMER, which causes an interrupt and is handled like other interrupts.
               This, on the other hand, is the clock pulse from the hardware (or host) that tells the kernel
               that it has to look for interrupts and process them if it finds any.                           */

            // Check for an interrupt, are any. Page 560
            if (_KernelInterruptQueue.getSize() > 0) {
                // Process the first interrupt on the interrupt queue.
                // TODO: Implement a priority queue based on the IRQ number/id to enforce interrupt priority.
                var interrupt = _KernelInterruptQueue.dequeue();
                this.krnInterruptHandler(interrupt.irq, interrupt.params);
            } else if (_CPU.isExecuting) { // If there are no interrupts then run one CPU cycle if there is anything being processed.
                _CPU.cycle();
                // Printing functions
                Control.hostPCB();
                Control.hostQueues();
                Control.hostMemory();
                Control.hostCpu();
                if(_CurSchedulerClock > _SchedulerClockLimit - 2 && _ReadyQueue.getSize() > 0 && _CurSchedulerMode < 1 ){
                    _KernelInterruptQueue.enqueue(new Interrupt(TIMER_IRQ,"Scheduler dispatch: context switch"));
                }
                if(_ReadyQueue.getSize() > 0){
                    _CurSchedulerClock = (_CurSchedulerClock + 1) % _SchedulerClockLimit;
                }else {
                    // do not run a scheduler clock tick; only one process is running
                }
            } else {                      // If there are no interrupts and there is nothing being executed then just be idle.
                this.krnTrace("Idle");
            }
        }


        //
        // Interrupt Handling
        //
        public krnEnableInterrupts() {
            // Keyboard
            Devices.hostEnableKeyboardInterrupt();
            // Put more here.
        }

        public krnDisableInterrupts() {
            // Keyboard
            Devices.hostDisableKeyboardInterrupt();
            // Put more here.
        }

        public krnInterruptHandler(irq, params) {
            // This is the Interrupt Handler Routine.  Pages 8 and 560. {
            // Trace our entrance here so we can compute Interrupt Latency by analyzing the log file later on.  Page 766.
            this.krnTrace("Handling IRQ~" + irq);

            // Invoke the requested Interrupt Service Routine via Switch/Case rather than an Interrupt Vector.
            // TODO: Consider using an Interrupt Vector in the future.
            // Note: There is no need to "dismiss" or acknowledge the interrupts in our design here.
            //       Maybe the hardware simulation will grow to support/require that in the future.
            switch (irq) {
                case TIMER_IRQ:
                    this.krnTimerISR();              // Kernel built-in routine for timers (not the clock).
                    break;
                case KEYBOARD_IRQ:
                    _krnKeyboardDriver.isr(params);   // Kernel mode device driver
                    _StdIn.handleInput();
                    break;
                case CPU_IRQ:
                    this.krnTrapErrorSoftfalt("CPU error detected. irq=" + irq + " params=[" + params +"]");
                    Control.hostPCB();
                    _TerminatedQueue.enqueue(_CurPCB);
                    _MMU.blockReleased(_CurPCB.getBaseAddress());
                    _KernelInterruptQueue.enqueue(new Interrupt(TIMER_IRQ, "Check schedule for other processes."));
                    break;
                case MEM_IRQ:
                    this.krnTrapErrorSysfault("Hardware memory fault detected. params=[" + params + "]");
                    break;
                case SW_IRQ:
                    this.krnSysCall(_CPU.Yreg,_CPU.Xreg);
                    break;
                case DISK_IRQ:
                    _krnDiskDriver.isr(params);
                    break;
                default:
                    this.krnTrapErrorSysfault("Invalid interrupt request. irq=" + irq + " params=[" + params + "]");
            }
        }

        public krnTimerISR() {
            // The built-in TIMER (not clock) Interrupt Service Routine (as opposed to an ISR coming from a device driver). {
            // Check multiprogramming parameters and enforce quanta here. Call the scheduler / context switch here if necessary.
            this.krnTrace("Context Switch in progress");
            if(!_CPU.isExecuting && _ReadyQueue.getSize() > 0) {
                _CurPCB = _ReadyQueue.dequeue();
                _Kernel.krnSwapProcFromDisk();
                Control.hostQueues();
                Control.hostPCB();
                _CurPCB.restoreCpuState();
                _MMU.updateBaseAddr(_CurPCB.getBaseAddress());
                _CPU.isExecuting = true;
            } else if(_ReadyQueue.getSize() > 0) {
                _CurPCB.saveCpuState();
                Control.hostPCB();
                if(_ReadyQueue.q[0].onDisk === 1){
                    _Kernel.krnSwapProcToDisk();
                }
                _ReadyQueue.enqueue(_CurPCB);
                Control.hostQueues();
                _CurPCB = _ReadyQueue.dequeue();
                _Kernel.krnSwapProcFromDisk();
                Control.hostQueues();
                Control.hostPCB();
                _CurPCB.restoreCpuState();
                _MMU.updateBaseAddr(_CurPCB.getBaseAddress());
            } else {
                // do nothing in terms of context switch
            }
            this.krnTrace("Context Switch done");
            Control.hostQueues();
            Control.hostPCB();
            _CurSchedulerClock = 0;
        }

        public krnSwapProcToDisk(){
            if(!_DiskDrive.isFormatted){
                _StdOut.putText("Disk is not formatted.");
                return;
            }
            var fname = '.'.charCodeAt(0).toString(16) + " " +
                '_'.charCodeAt(0).toString(16) + " " + _CurPCB.Id.toString(16);

            var data = "";
            _MMU.updateBaseAddr(_CurPCB.getBaseAddress());
            var i = 0;
            while(i < _RamBlock){
                _MMU.moveToAddr(i);
                data = _MMU.valueOfAddress() + " " + data;
                i++;
            }
            _krnDiskDriver.isr(["create",3,fname,data]); // was forced to override these too slow otherwise
            _krnDiskDriver.isr(["write",3,fname,data]);  // was forced to override these too slow otherwise
            _MMU.blockReleased(_CurPCB.getBaseAddress());
            _CurPCB.setBaseAddress(-1);

        }

        public krnSwapProcFromDisk(){
            if(_CurPCB.onDisk != 1){
                return;
            }
            var fname = _CurPCB.getBaseAddress();
            _MMU.blockStored();
            _CurPCB.setBaseAddress(_MMU.getBaseAddr());
            _krnDiskDriver.isr(["rToMemory",3,fname,""]); // was forced to override these too slow otherwise
            _krnDiskDriver.isr(["delete",3,fname,""]);    // was forced to override these too slow otherwise
        }

        //
        // System Calls... that generate software interrupts via tha Application Programming Interface library routines.
        //
        // Some ideas:
        // - ReadConsole
        // - WriteConsole
        // - CreateProcess
        // - ExitProcess
        // - WaitForProcessToExit
        // - CreateFile
        // - OpenFile
        // - ReadFile
        // - WriteFile
        // - CloseFile
        private krnSysCall(val, type) {
            switch (type){
                case 0x02:
                   var i = val;
                   var strOut = "";
                   _MMU.moveToAddr(i);
                   while(_MMU.valueOfAddress() != "00" && i < 0x100) {
                       strOut = strOut + String.fromCharCode(parseInt(_MMU.valueOfAddress(), 16));
                       i = i + 1;
                       _MMU.moveToAddr(i);
                   }
                   _StdOut.putText(strOut);
                   _StdOut.advanceLine();
                   break;
                default:
                   _StdOut.putText(val.toString());
                   _StdOut.advanceLine();
            }

        }


        //
        // OS Utility Routines
        //
        public krnTrace(msg: string) {
             // Check globals to see if trace is set ON.  If so, then (maybe) log the message.
             if (_Trace) {
                if (msg === "Idle") {
                    // We can't log every idle clock pulse because it would lag the browser very quickly.
                    if (_OSclock % 10 == 0) {
                        // Check the CPU_CLOCK_INTERVAL in globals.ts for an
                        // idea of the tick rate and adjust this line accordingly.
                        Control.hostLog(msg, "OS");
                    }
                } else {
                    Control.hostLog(msg, "OS");
                }
             }
        }

        public krnTrapErrorSoftfalt(msg) {
            Control.hostLog("OS ERROR - TRAP: " + msg);
            // Stop CPU
            if(_CPU.isExecuting){
                _CPU.isExecuting = false;
            }
        }

        public krnTrapErrorSysfault(msg) {
            Control.hostLog("OS ERROR - TRAP: " + msg);
            // Display error on console, perhaps in some sort of colored screen. (Perhaps blue?)
            _Canvas.hidden = true;
            _bCanvas.hidden = false;
            _bContext.drawTextCenter(_DefaultFontFamily, _DefaultFontSize,400, 300,msg,true);
            this.krnShutdown();
        }
    }
}
