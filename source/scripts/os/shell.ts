///<reference path="shellCommand.ts" />
///<reference path="userCommand.ts" />
///<reference path="../utils.ts" />

/* ------------
   Shell.ts

   The OS Shell - The "command line interface" (CLI) for the console.
   ------------ */

// TODO: Write a base class / prototype for system services and let Shell inherit from it.

module TSOS {
    export class Shell {
        // Properties
        public promptStr = ">";
        public commandList = [];
        public commandNames = [];
        public curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
        public apologies = "[sorry]";
        public statusMessage ="";

        constructor() {

        }

        public init() {
            var sc = null;
            //
            // Load the command list.

            // ver
            sc = new ShellCommand(this.shellVer,
                                  "ver",
                                  "- Displays the current version data.");
            this.commandList[this.commandList.length] = sc;
            this.commandNames[this.commandNames.length] = "ver";

            // help
            sc = new ShellCommand(this.shellHelp,
                                  "help",
                                  "- This is the help command. Seek help.");
            this.commandList[this.commandList.length] = sc;
            this.commandNames[this.commandNames.length] = "help";


            // shutdown
            sc = new ShellCommand(this.shellShutdown,
                                  "shutdown",
                                  "- Shuts down the virtual OS but leaves the underlying hardware simulation running.");
            this.commandList[this.commandList.length] = sc;
            this.commandNames[this.commandNames.length] = "shutdown";


            // cls
            sc = new ShellCommand(this.shellCls,
                                  "cls",
                                  "- Clears the screen and resets the cursor position.");
            this.commandList[this.commandList.length] = sc;
            this.commandNames[this.commandNames.length] = "cls";

            // date
            sc = new ShellCommand(this.shellDate,
                                  "date",
                                  "- Displays the current time in UTC date format.");
            this.commandList[this.commandList.length] = sc;
            this.commandNames[this.commandNames.length] = "date";

            // man <topic>
            sc = new ShellCommand(this.shellMan,
                                  "man",
                                  "<topic> - Displays the MANual page for <topic>.");
            this.commandList[this.commandList.length] = sc;
            this.commandNames[this.commandNames.length] = "man";

            // trace <on | off>
            sc = new ShellCommand(this.shellTrace,
                                  "trace",
                                  "<on | off> - Turns the OS trace on or off.");
            this.commandList[this.commandList.length] = sc;
            this.commandNames[this.commandNames.length] = "trace";

            // rot13 <string>
            sc = new ShellCommand(this.shellRot13,
                                  "rot13",
                                  "<string> - Does rot13 obfuscation on <string>.");
            this.commandList[this.commandList.length] = sc;
            this.commandNames[this.commandNames.length] = "rot13";

            // prompt <string>
            sc = new ShellCommand(this.shellPrompt,
                                  "prompt",
                                  "<string> - Sets the prompt.");
            this.commandList[this.commandList.length] = sc;
            this.commandNames[this.commandNames.length] = "prompt";

            // whereami
            sc = new ShellCommand(this.shellWhereAmI,
                                  "whereami",
                                  "- Displays your current location.");
            this.commandList[this.commandList.length] = sc;
            this.commandNames[this.commandNames.length] = "whereami";

            // override clockspeed
            sc = new ShellCommand(this.shellOverrideClockspeed,
                                  "overclock",
                                  "<low | normal | fast> - Sets the clockspeed; normal is default.");
            this.commandList[this.commandList.length] = sc;
            this.commandNames[this.commandNames.length] = "overclock";

            // status
            sc = new ShellCommand(this.shellStatus,
                                  "status",
                                  "<string> - Displays a status message in the host log.");
            this.commandList[this.commandList.length] = sc;
            this.commandNames[this.commandNames.length] = "status";

            // forcepanic
            sc = new ShellCommand(this.shellPanic,
                                  "forcepanic",
                                  "- Forces a shell panic bugcheck of 0xBADD.");
            this.commandList[this.commandList.length] = sc;
            this.commandNames[this.commandNames.length] = "forcepanic";

            // load
            sc = new ShellCommand(this.shellLoad,
                                  "load",
                                  "- Loads and validates the program input area.");
            this.commandList[this.commandList.length] = sc;
            this.commandNames[this.commandNames.length] = "load";

            // run
            sc = new ShellCommand(this.shellRun,
                "run",
                "- <pid> to run a loaded program.");
            this.commandList[this.commandList.length] = sc;
            this.commandNames[this.commandNames.length] = "run";

            // processes - list the running processes and their IDs
            sc = new ShellCommand(this.shellListProcesses,
                                  "ps",
                                  "- Lists all running processes and Kernel as pid 0.");
            this.commandList[this.commandList.length] = sc;
            this.commandNames[this.commandNames.length] = "ps";

            // kill <id> - kills the specified process id.
            sc = new ShellCommand(this.shellKillProc,
                                  "kill",
                                  "- <pid> to kill the process with the specified pid.");
            this.commandList[this.commandList.length] = sc;
            this.commandNames[this.commandNames.length] = "kill";

            // clearmem - clears ram.
            sc = new ShellCommand(this.shellClearMem,
                "clearmem",
                "- Clears all memory.");
            this.commandList[this.commandList.length] = sc;
            this.commandNames[this.commandNames.length] = "clearmem";

            //
            // Display the initial prompt.
            this.putPrompt();
        }

        public putPrompt() {
            _StdOut.putText(this.promptStr);
        }

        public handleInput(buffer) {
            _Kernel.krnTrace("Shell Command~" + buffer);
            //
            // Parse the input...
            //
            var userCommand = new UserCommand();
            userCommand = this.parseInput(buffer);
            // ... and assign the command and args to local variables.
            var cmd = userCommand.command;
            var args = userCommand.args;
            //
            // Determine the command and execute it.
            //
            // JavaScript may not support associative arrays in all browsers so we have to
            // iterate over the command list in attempt to find a match.  TODO: Is there a better way? Probably.
            var index = 0;
            var found = false;
            var fn = undefined;
            while (!found && index < this.commandList.length) {
                if (this.commandList[index].command === cmd) {
                    found = true;
                    fn = this.commandList[index].func;
                } else {
                    ++index;
                }
            }
            if (found) {
                this.execute(fn, args);
            } else {
                // It's not found, so check for curses and apologies before declaring the command invalid.
                if (this.curses.indexOf("[" + Utils.rot13(cmd) + "]") >= 0) {     // Check for curses. {
                    this.execute(this.shellCurse);
                } else if (this.apologies.indexOf("[" + cmd + "]") >= 0) {    // Check for apologies. {
                    this.execute(this.shellApology);
                } else { // It's just a bad command. {
                    this.execute(this.shellInvalidCommand);
                }
            }
        }

        // args is an option parameter, ergo the ? which allows TypeScript to understand that
        public execute(fn, args?) {
            // We just got a command, so advance the line...
            _StdOut.advanceLine();
            // ... call the command function passing in the args...
            fn(args);
            // Check to see if we need to advance the line again
            if (_StdOut.currentXPosition > 0) {
                _StdOut.advanceLine();
            }
            // ... and finally write the prompt again.
            this.putPrompt();
        }

        public parseInput(buffer) {
            var retVal = new UserCommand();

            // 1. Remove leading and trailing spaces.
            buffer = Utils.trim(buffer);

            // 2. Lower-case it.
            buffer = buffer.toLowerCase();

            // 3. Separate on spaces so we can determine the command and command-line args, if any.
            var tempList = buffer.split(" ");

            // 4. Take the first (zeroth) element and use that as the command.
            var cmd = tempList.shift();  // Yes, you can do that to an array in JavaScript.  See the Queue class.
            // 4.1 Remove any left-over spaces.
            cmd = Utils.trim(cmd);
            // 4.2 Record it in the return value.
            retVal.command = cmd;

            // 5. Now create the args array from what's left.
            for (var i in tempList) {
                var arg = Utils.trim(tempList[i]);
                if (arg != "") {
                    retVal.args[retVal.args.length] = tempList[i];
                }
            }
            return retVal;
        }

        //
        // Shell Command Functions.  Again, not part of Shell() class per se', just called from there.
        //
        public shellInvalidCommand() {
            _StdOut.putText("Invalid Command. ");
            if (_SarcasticMode) {
                _StdOut.putText("Duh. Go back to your Speak & Spell.");
            } else {
                _StdOut.putText("Type 'help' for, well... help.");
            }
        }

        public shellCurse() {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putText("Bitch.");
            _SarcasticMode = true;
        }

        public shellApology() {
           if (_SarcasticMode) {
              _StdOut.putText("Okay. I forgive you. This time.");
              _SarcasticMode = false;
           } else {
              _StdOut.putText("For what?");
           }
        }

        public shellVer(args) {
            _StdOut.putText(APP_NAME + " version " + APP_VERSION);
        }

        public shellHelp(args) {
            _StdOut.putText("Commands:");
            for (var i in _OsShell.commandList) {
                _StdOut.advanceLine();
                _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
            }
        }

        public shellShutdown(args) {
             _StdOut.putText("Shutting down...");
             // Call Kernel shutdown routine.
            _Kernel.krnShutdown();
            // TODO: Stop the final prompt from being displayed.  If possible.  Not a high priority.  (Damn OCD!)
        }

        public shellCls(args) {
            _StdOut.clearScreen();
            _StdOut.resetXY();
        }

        public shellDate(args) {
            var currentTime: Date = new Date(Date.now());
            _StdOut.putText("Current time: " + currentTime.toUTCString() + ".");
        }

        public shellMan(args) {
            if (args.length > 0) {
                var topic = args[0];
                switch (topic) {
                    case "help":
                        _StdOut.putText("Help displays a list of (hopefully) valid commands.");
                        break;
                    default:
                        _StdOut.putText("No manual entry for " + args[0] + ".");
                }
            } else {
                _StdOut.putText("Usage: man <topic>  Please supply a topic.");
            }
        }

        public shellTrace(args) {
            if (args.length > 0) {
                var setting = args[0];
                switch (setting) {
                    case "on":
                        if (_Trace && _SarcasticMode) {
                            _StdOut.putText("Trace is already on, dumbass.");
                        } else {
                            _Trace = true;
                            _StdOut.putText("Trace ON");
                        }

                        break;
                    case "off":
                        _Trace = false;
                        _StdOut.putText("Trace OFF");
                        break;
                    default:
                        _StdOut.putText("Invalid argument.  Usage: trace <on | off>.");
                }
            } else {
                _StdOut.putText("Usage: trace <on | off>");
            }
        }

        public shellRot13(args) {
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putText(args.join(' ') + " = '" + Utils.rot13(args.join(' ')) +"'");
            } else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        }

        public shellPrompt(args) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            } else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        }

        public shellWhereAmI(args) {
            _StdOut.putText("You are at: " + window.location.host.valueOf());
        }

        public shellOverrideClockspeed (args) {
            if(args.length > 0) {
               var clockspeed = args[0];
               switch(clockspeed) {
                   case "high":
                      CPU_CLOCK_INTERVAL = 8;
                      clearInterval(_hardwareClockID);
                      _hardwareClockID = setInterval(Devices.hostClockPulse, CPU_CLOCK_INTERVAL);
                      break;
                   case "normal":
                      CPU_CLOCK_INTERVAL = 100;
                      clearInterval(_hardwareClockID);
                      _hardwareClockID = setInterval(Devices.hostClockPulse, CPU_CLOCK_INTERVAL);
                      break;
                   case "low":
                      CPU_CLOCK_INTERVAL = 1000;
                      clearInterval(_hardwareClockID);
                      _hardwareClockID = setInterval(Devices.hostClockPulse, CPU_CLOCK_INTERVAL);
                      break;
                   case "step":
                       _EnableStepMode = true;
                       Control.hostSingleStepInit();
                       break;
                   default:
                      _StdOut.putText("Invalid argument. Usage: overclock <low | normal | high | step>.");
                      break;
               }
            } else {
                _StdOut.putText("Usage: overclock <low | normal | high>.");
            }
        }

        public shellStatus(args) {
            if(args.length > 0){
                _OsShell.statusMessage = _OsShell.statusMessage + args[0]+" ";
                _Kernel.krnTrace(_OsShell.statusMessage);
            } else {
                _StdOut.putText("Usage: status <string> Please supply a string.");
            }
        }

        public shellPanic(args) {
            _Kernel.krnTrapErrorSysfault("0xBADD");
        }

        public shellLoad(args) {
            var program = (<HTMLInputElement> document.getElementById("taProgramInput")).value;
            var valid = "";
            var i = 0;
            if(program.length > 0 ) {
                while(i < program.length){
                    if((program[i] >= "A" && program[i] <= "F" ) || (program[i] >= "a" && program[i] <= "f")) {
                        // assume caps for hex digits
                        valid += program[i].toUpperCase();
                    } else if(program[i] >= "0" && program[i] <= "9") {
                        //handle numbers
                        valid += program[i];
                    } else if(program[i] === " "){
                        //eliminate spaces
                    } else {
                        _StdOut.putText("Program error not hex at character: " + i + ", " + program[i] + ".");
                    }
                    i++;
                }
                if(valid.length % 2 !== 0){
                    _StdOut.putText("Error instructions not even.");
                }
            } else {
                _StdOut.putText("No program.");
            }
            // Add valid program to memory here
            _CurPCB.init();
            _CurPCB.setPcbId(_PID);
            _MMU.blockStored();
            _MMU.eraseBlock();
            _CurPCB.setBaseAddress(_MMU.getBaseAddr());
            i = 0;
            var k = 0;
            while(i < valid.length -1) {
                var j = i + 1;
                _MMU.moveToAddr(k);
                k = k + 1;
                _MMU.storeToAddress(valid[i]+valid[j]);
                i = i + 2;
            }
            _StdOut.putText("PID: " + _CurPCB.getPcbId().toString());
            _ResidentQueue.enqueue(_CurPCB);
            _CurPCB.init();
            _PID = _PID + 1;
        }

        public shellRun(args) {
            if(args.length < 1){
                _StdOut.putText("Usage: run <pid | 'all'>.")
            } else if(args === "all") {
                for(var i = 0; i < _ResidentQueue.length; i++) {
                    _ReadyQueue.enqueue(_ResidentQueue.dequeue());
                }
                _CurPCB = _ReadyQueue.dequeue();
                _CurPCB.restoreCpuState();
                _CPU.isExecuting = true;
            } else {
                for(var i = 0; i < _ResidentQueue.getSize(); i++){
                    _CurPCB = _ResidentQueue.dequeue();
                    if(_CurPCB.Id === parseInt(args[0])) {
                        _CurPCB.restoreCpuState();
                        _CPU.isExecuting = true;
                        return;
                    }else {
                        _ResidentQueue.enqueue(_CurPCB);
                    }
                }
                _StdOut.putText("No program to run at designated pid.");
            }
        }

        public shellListProcesses(args) {
            _StdOut.putText("PIDs running:");
            _StdOut.putText("  0")
            _StdOut.putText("  " + _CurPCB.getPcbId().toString());
            for(var i = 0; i < _ReadyQueue.length; i++){
                _StdOut.putText("  " + _ReadyQueue.q[i].getPcbId().toString());
            }
        }

        public shellKillProc(args) {
            if(args < 1){
                _StdOut.putText("Usage: kill <pid>.");
            } else {

            }
        }

        public shellClearMem(args) {
            _MMU.eraseMemory();
        }
    }
}
