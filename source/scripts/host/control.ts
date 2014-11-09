///<reference path="../globals.ts" />
///<reference path="../os/canvastext.ts" />

/* ------------
     Control.ts

     Requires globals.ts.

     Routines for the hardware simulation, NOT for our client OS itself.
     These are static because we are never going to instantiate them, because they represent the hardware.
     In this manner, it's A LITTLE BIT like a hypervisor, in that the Document environment inside a browser
     is the "bare metal" (so to speak) for which we write code that hosts our client OS.
     But that analogy only goes so far, and the lines are blurred, because we are using TypeScript/JavaScript
     in both the host and client environments.

     This (and other host/simulation scripts) is the only place that we should see "web" code, such as
     DOM manipulation and event handling, and so on.  (Index.html is -- obviously -- the only place for markup.)

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

//
// Control Services
//
module TSOS {

    export class Control {

        public static hostInit(): void {
            // Get a global reference to the canvas.  TODO: Move this stuff into a Display Device Driver, maybe?
            _Canvas = <HTMLCanvasElement>document.getElementById('display');
            _bCanvas = <HTMLCanvasElement>document.getElementById('displayBSOD');

            // Get a global reference to the drawing context.
            _DrawingContext = _Canvas.getContext('2d');
            _bContext = _bCanvas.getContext('2d');

            // Enable the added-in canvas text functions (see canvastext.ts for provenance and details).
            CanvasTextFunctions.enable(_DrawingContext);   // Text functionality is now built in to the HTML5 canvas. But this is old-school, and fun.
            CanvasTextFunctions.enable(_bContext);         // Bluescreen canvas text context

            // Clear the log.
            // Use the TypeScript cast to HTMLDivElement.
            (<HTMLDivElement> document.getElementById("taHostLog")).textContent = "";
            (<HTMLDivElement> document.getElementById("taTime")).textContent = "";
            _CpuArea = <HTMLTableElement>document.getElementById("taCpu");
            _MemoryArea = <HTMLTableElement>document.getElementById("taMemoryArea");

            //Clear the program input.
            //Use TypeScript to cast HTMLInputElement.
            (<HTMLInputElement> document.getElementById("taProgramInput")).textContent = "";

            // Set focus on the start button.
            // Use the TypeScript cast to HTMLInputElement
            (<HTMLInputElement> document.getElementById("btnStartOS")).focus();

            // Check for our testing and enrichment core.
            if (typeof Glados === "function") {
                _GLaDOS = new Glados();
                _GLaDOS.init();
            }
        }

        public static hostSingleStepInit(): void {
            // Activate the single step button
            document.getElementById("btnStep").disabled = false;
            document.getElementById("btnStepExit").disabled = false;
        }

        public static hostPCB(): void {

        }

        public static hostQueues(): void {

        }

        public static hostMemory(): void {
            var memory = _MA.toString();
            var i = 0;
            var mstring= "";
            while(i < memory.length){
                var j = 0;
                if(i === 0){
                    mstring = " <table><tr><td>0x000<\/td>";
                }else if(i*16 < 0x100){
                    mstring = mstring + "<tr><td>0x0" + (i * 16).toString(16) + "<\/td>";
                } else {
                    mstring = mstring + "<tr><td>0x" + (i * 16).toString(16) + "<\/td>";
                }
                while(j < memory[i].length){
                    if(j === memory[i].length -1){
                        mstring = mstring + "<td>" + memory[i][j] + "<\/td><\/tr>";
                    }else {
                        mstring = mstring + "<td>" + memory[i][j] +"<\/td>";
                    }
                    j = j + 1;
                }
                i = i + 1;
            }
            mstring = mstring + "<\/table>";
            _MemoryArea.innerHTML = mstring;
        }

        public static hostCpu(): void {
            var string_row1 = "<tr>" +
                              "<td>PC|<\/td>" +
                              "<td>Ireg|<\/td>" +
                              "<td>Acc|<\/td>" +
                              "<td>Xreg|<\/td>" +
                              "<td>Yreg|<\/td>" +
                              "<td>Zflag<\/td><\/tr>";
            var string_row2 = "<tr>" +
                              "<td>&nbsp" + _CPU.PC.toString(16) + "|<\/td>" +
                              "<td>&nbsp" + _CPU.Ireg.toString(16) + "|<\/td>" +
                              "<td>&nbsp" + _CPU.Acc.toString(16) + "|<\/td>" +
                              "<td>&nbsp" + _CPU.Xreg.toString(16) + "|<\/td>" +
                              "<td>&nbsp" + _CPU.Yreg.toString(16) + "|<\/td>" +
                              "<td>&nbsp" + _CPU.Zflag.toString(16) + "<\/td>" +
                              "<\/tr>";
            _CpuArea.innerHTML = string_row1 + string_row2;
        }

        public static hostLog(msg: string, source: string = "?"): void {
            // Note the OS CLOCK.
            var clock:number = _OSclock;

            // Note the REAL clock in milliseconds since January 1, 1970.
            var now:number = new Date().getTime();

            // Build the log string.
            var curTime: Date = new Date(Date.now());
            var localTime: string = curTime.toLocaleString();
            var str:string = "({clock:" + clock + ", source:" + source + ", msg:" + msg + ", now:" + now + "})\n\n";

            // Update the log console.
            var taTime = (<HTMLDivElement> document.getElementById("taTime"));
            var taLog = (<HTMLDivElement> document.getElementById("taHostLog"));
            if(taLog.textContent.length < 10000){
                taLog.textContent = str + taLog.textContent.toString();
            } else {
                taLog.textContent = str + "- Log Refresh -";
            }
            taTime.textContent = localTime;
            // Optionally update a log database or some streaming service.
        }


        //
        // Host Events
        //
        public static hostBtnStartOS_click(btn): void {
            // Disable the (passed-in) start button...
            btn.disabled = true;

            // .. enable the Halt and Reset buttons ...
            document.getElementById("btnHaltOS").disabled = false;
            document.getElementById("btnReset").disabled = false;

            // .. set focus on the OS console display ...
            document.getElementById("display").focus();

            // ... Create and initialize the Memory Accessor
            _MA = new MemAlloc(new Memory());
            _MA.init();

            // ... Create and initialize the CPU (because it's part of the hardware)  ...
            _CPU = new Cpu();
            _CPU.init();

            this.hostMemory();

            // ... then set the host clock pulse ...
            _hardwareClockID = setInterval(Devices.hostClockPulse, CPU_CLOCK_INTERVAL);
            // .. and call the OS Kernel Bootstrap routine.
            _Kernel = new Kernel();
            _Kernel.krnBootstrap();
            this.hostPCB();
            this.hostQueues();
        }

        public static hostBtnHaltOS_click(btn): void {
            Control.hostLog("Emergency halt", "host");
            Control.hostLog("Attempting Kernel shutdown.", "host");
            // Call the OS shutdown routine.
            _Kernel.krnShutdown();
            // Stop the interval that's simulating our clock pulse.
            clearInterval(_hardwareClockID);
            // TODO: Is there anything else we need to do here?
        }

        public static hostBtnReset_click(btn): void {
            // The easiest and most thorough way to do this is to reload (not refresh) the document.
            location.reload(true);
            // That boolean parameter is the 'forceget' flag. When it is true it causes the page to always
            // be reloaded from the server. If it is false or not specified the browser may reload the
            // page from its cache, which is not what we want.
        }

        public static hostBtnStep_click(btn): void {
            _STEP = true;
        }

        public static hostBtnStepExit_click(btn): void {
            // Deactivate single step buttons
            document.getElementById("btnStep").disabled = true;
            btn.disabled = true;
            _EnableStepMode = false;
        }
    }
}
