/* ------------
Kernel.ts
Requires globals.ts
Routines for the Operating System, NOT the host.
This code references page numbers in the text book:
Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
------------ */
var TSOS;
(function (TSOS) {
    var Kernel = (function () {
        function Kernel() {
        }
        //
        // OS Startup and Shutdown Routines
        //
        Kernel.prototype.krnBootstrap = function () {
            TSOS.Control.hostLog("bootstrap", "host"); // Use hostLog because we ALWAYS want this, even if _Trace is off.

            //Initialize the active PCB
            _CurPCB = new TSOS.Pcb();
            _CurPCB.init();

            // Initialize the MMU
            _MMU = new TSOS.Mmu();
            _MMU.init();

            // Initialize our global queues.
            _KernelInterruptQueue = new TSOS.Queue(); // A (currently) non-priority queue for interrupt requests (IRQs).
            _KernelBuffers = new Array(); // Buffers... for the kernel.
            _KernelInputQueue = new TSOS.Queue(); // Where device input lands before being processed out somewhere.
            _Console = new TSOS.Console(); // The command line interface / console I/O device.
            _ResidentQueue = new TSOS.Queue(); // Program residency queue
            _ReadyQueue = new TSOS.Queue(); // Program ready queue
            _TerminatedQueue = new TSOS.Queue(); // Program terminated queue

            // Initialize the console.
            _Console.init();

            // Initialize standard input and output to the _Console.
            _StdIn = _Console;
            _StdOut = _Console;

            // Load the Keyboard Device Driver
            this.krnTrace("Loading the keyboard device driver.");
            _krnKeyboardDriver = new TSOS.DeviceDriverKeyboard(); // Construct it.
            _krnKeyboardDriver.driverEntry(); // Call the driverEntry() initialization routine.
            this.krnTrace(_krnKeyboardDriver.status);

            //
            // ... more?
            //
            // Enable the OS Interrupts.  (Not the CPU clock interrupt, as that is done in the hardware sim.)
            this.krnTrace("Enabling the interrupts.");
            this.krnEnableInterrupts();

            // Launch the shell.
            this.krnTrace("Creating and Launching the shell.");
            _OsShell = new TSOS.Shell();
            _OsShell.init();

            // Finally, initiate testing.
            if (_GLaDOS) {
                _GLaDOS.afterStartup();
            }
        };

        Kernel.prototype.krnShutdown = function () {
            this.krnTrace("begin shutdown OS");

            // TODO: Check for running processes.  Alert if there are some, alert and stop.  Else...
            if (_CPU.isExecuting) {
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
        };

        Kernel.prototype.krnOnCPUClockPulse = function () {
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
            } else if (_CPU.isExecuting) {
                _CPU.cycle();

                // Printing functions
                TSOS.Control.hostPCB();
                TSOS.Control.hostQueues();
                TSOS.Control.hostMemory();
                TSOS.Control.hostCpu();
                if (_CurSchedulerClock > _SchedulerClockLimit - 2 && _ReadyQueue.getSize() > 0 && _CurSchedulerMode < 1) {
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(TIMER_IRQ, "Scheduler dispatch: context switch"));
                }
                if (_ReadyQueue.getSize() > 0) {
                    _CurSchedulerClock = (_CurSchedulerClock + 1) % _SchedulerClockLimit;
                } else {
                    // do not run a scheduler clock tick; only one process is running
                }
            } else {
                this.krnTrace("Idle");
            }
        };

        //
        // Interrupt Handling
        //
        Kernel.prototype.krnEnableInterrupts = function () {
            // Keyboard
            TSOS.Devices.hostEnableKeyboardInterrupt();
            // Put more here.
        };

        Kernel.prototype.krnDisableInterrupts = function () {
            // Keyboard
            TSOS.Devices.hostDisableKeyboardInterrupt();
            // Put more here.
        };

        Kernel.prototype.krnInterruptHandler = function (irq, params) {
            // This is the Interrupt Handler Routine.  Pages 8 and 560. {
            // Trace our entrance here so we can compute Interrupt Latency by analyzing the log file later on.  Page 766.
            this.krnTrace("Handling IRQ~" + irq);

            switch (irq) {
                case TIMER_IRQ:
                    this.krnTimerISR(); // Kernel built-in routine for timers (not the clock).
                    break;
                case KEYBOARD_IRQ:
                    _krnKeyboardDriver.isr(params); // Kernel mode device driver
                    _StdIn.handleInput();
                    break;
                case CPU_IRQ:
                    this.krnTrapErrorSoftfalt("CPU error detected. irq=" + irq + " params=[" + params + "]");
                    TSOS.Control.hostPCB();
                    _TerminatedQueue.enqueue(_CurPCB);
                    _MMU.blockReleased(_CurPCB.getBaseAddress());
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(TIMER_IRQ, "Check schedule for other processes."));
                    break;
                case MEM_IRQ:
                    this.krnTrapErrorSysfault("Hardware memory fault detected. params=[" + params + "]");
                    break;
                case SW_IRQ:
                    this.krnSysCall(_CPU.Yreg, _CPU.Xreg);
                    break;
                default:
                    this.krnTrapErrorSysfault("Invalid interrupt request. irq=" + irq + " params=[" + params + "]");
            }
        };

        Kernel.prototype.krnTimerISR = function () {
            // The built-in TIMER (not clock) Interrupt Service Routine (as opposed to an ISR coming from a device driver). {
            // Check multiprogramming parameters and enforce quanta here. Call the scheduler / context switch here if necessary.
            this.krnTrace("Context Switch in progress");
            if (!_CPU.isExecuting && _ReadyQueue.getSize() > 0) {
                _CurPCB = _ReadyQueue.dequeue();
                TSOS.Control.hostQueues();
                TSOS.Control.hostPCB();
                _CurPCB.restoreCpuState();
                _MMU.updateBaseAddr(_CurPCB.getBaseAddress());
                _CPU.isExecuting = true;
            } else if (_ReadyQueue.getSize() > 0) {
                _CurPCB.saveCpuState();
                TSOS.Control.hostPCB();
                _ReadyQueue.enqueue(_CurPCB);
                TSOS.Control.hostQueues();
                _CurPCB = _ReadyQueue.dequeue();
                TSOS.Control.hostQueues();
                TSOS.Control.hostPCB();
                _CurPCB.restoreCpuState();
                _MMU.updateBaseAddr(_CurPCB.getBaseAddress());
            } else {
                // do nothing in terms of context switch
            }
            this.krnTrace("Context Switch done");
            TSOS.Control.hostQueues();
            TSOS.Control.hostPCB();
            _CurSchedulerClock = 0;
        };

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
        Kernel.prototype.krnSysCall = function (val, type) {
            switch (type) {
                case 0x02:
                    var i = val;
                    var strOut = "";
                    _MMU.moveToAddr(i);
                    while (_MMU.valueOfAddress() != "00" && i < 0x100) {
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
        };

        //
        // OS Utility Routines
        //
        Kernel.prototype.krnTrace = function (msg) {
            // Check globals to see if trace is set ON.  If so, then (maybe) log the message.
            if (_Trace) {
                if (msg === "Idle") {
                    // We can't log every idle clock pulse because it would lag the browser very quickly.
                    if (_OSclock % 10 == 0) {
                        // Check the CPU_CLOCK_INTERVAL in globals.ts for an
                        // idea of the tick rate and adjust this line accordingly.
                        TSOS.Control.hostLog(msg, "OS");
                    }
                } else {
                    TSOS.Control.hostLog(msg, "OS");
                }
            }
        };

        Kernel.prototype.krnTrapErrorSoftfalt = function (msg) {
            TSOS.Control.hostLog("OS ERROR - TRAP: " + msg);

            // Stop CPU
            if (_CPU.isExecuting) {
                _CPU.isExecuting = false;
            }
        };

        Kernel.prototype.krnTrapErrorSysfault = function (msg) {
            TSOS.Control.hostLog("OS ERROR - TRAP: " + msg);

            // Display error on console, perhaps in some sort of colored screen. (Perhaps blue?)
            _Canvas.hidden = true;
            _bCanvas.hidden = false;
            _bContext.drawTextCenter(_DefaultFontFamily, _DefaultFontSize, 400, 300, msg, true);
            this.krnShutdown();
        };
        return Kernel;
    })();
    TSOS.Kernel = Kernel;
})(TSOS || (TSOS = {}));
