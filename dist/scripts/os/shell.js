///<reference path="shellCommand.ts" />
///<reference path="userCommand.ts" />
///<reference path="../utils.ts" />
/* ------------
Shell.ts
The OS Shell - The "command line interface" (CLI) for the console.
------------ */
// TODO: Write a base class / prototype for system services and let Shell inherit from it.
var TSOS;
(function (TSOS) {
    var Shell = (function () {
        function Shell() {
            // Properties
            this.promptStr = ">";
            this.commandList = [];
            this.commandNames = [];
            this.curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
            this.apologies = "[sorry]";
            this.statusMessage = "";
        }
        Shell.prototype.init = function () {
            var sc = null;

            //
            // Load the command list.
            // ver
            sc = new TSOS.ShellCommand(this.shellVer, "ver", "- Displays the current version data.");
            this.commandList[this.commandList.length] = sc;
            this.commandNames[this.commandNames.length] = "ver";

            // help
            sc = new TSOS.ShellCommand(this.shellHelp, "help", "- This is the help command. Seek help.");
            this.commandList[this.commandList.length] = sc;
            this.commandNames[this.commandNames.length] = "help";

            // shutdown
            sc = new TSOS.ShellCommand(this.shellShutdown, "shutdown", "- Shuts down the virtual OS but leaves the underlying hardware simulation running.");
            this.commandList[this.commandList.length] = sc;
            this.commandNames[this.commandNames.length] = "shutdown";

            // cls
            sc = new TSOS.ShellCommand(this.shellCls, "cls", "- Clears the screen and resets the cursor position.");
            this.commandList[this.commandList.length] = sc;
            this.commandNames[this.commandNames.length] = "cls";

            // date
            sc = new TSOS.ShellCommand(this.shellDate, "date", "- Displays the current time in UTC date format.");
            this.commandList[this.commandList.length] = sc;
            this.commandNames[this.commandNames.length] = "date";

            // man <topic>
            sc = new TSOS.ShellCommand(this.shellMan, "man", "<topic> - Displays the MANual page for <topic>.");
            this.commandList[this.commandList.length] = sc;
            this.commandNames[this.commandNames.length] = "man";

            // trace <on | off>
            sc = new TSOS.ShellCommand(this.shellTrace, "trace", "<on | off> - Turns the OS trace on or off.");
            this.commandList[this.commandList.length] = sc;
            this.commandNames[this.commandNames.length] = "trace";

            // rot13 <string>
            sc = new TSOS.ShellCommand(this.shellRot13, "rot13", "<string> - Does rot13 obfuscation on <string>.");
            this.commandList[this.commandList.length] = sc;
            this.commandNames[this.commandNames.length] = "rot13";

            // prompt <string>
            sc = new TSOS.ShellCommand(this.shellPrompt, "prompt", "<string> - Sets the prompt.");
            this.commandList[this.commandList.length] = sc;
            this.commandNames[this.commandNames.length] = "prompt";

            // whereami
            sc = new TSOS.ShellCommand(this.shellWhereAmI, "whereami", "- Displays your current location.");
            this.commandList[this.commandList.length] = sc;
            this.commandNames[this.commandNames.length] = "whereami";

            // override clockspeed
            sc = new TSOS.ShellCommand(this.shellOverrideClockspeed, "overclock", "<low | normal | fast> - Sets the clockspeed; normal is default.");
            this.commandList[this.commandList.length] = sc;
            this.commandNames[this.commandNames.length] = "overclock";

            // status
            sc = new TSOS.ShellCommand(this.shellStatus, "status", "<string> - Displays a status message in the host log.");
            this.commandList[this.commandList.length] = sc;
            this.commandNames[this.commandNames.length] = "status";

            // forcepanic
            sc = new TSOS.ShellCommand(this.shellPanic, "forcepanic", "- Forces a shell panic bugcheck of 0xBADD.");
            this.commandList[this.commandList.length] = sc;
            this.commandNames[this.commandNames.length] = "forcepanic";

            // load
            sc = new TSOS.ShellCommand(this.shellLoad, "load", "- Loads and validates the program input area.");
            this.commandList[this.commandList.length] = sc;
            this.commandNames[this.commandNames.length] = "load";

            // run
            sc = new TSOS.ShellCommand(this.shellRun, "run", "<pid | 'all'> -Run a loaded program.");
            this.commandList[this.commandList.length] = sc;
            this.commandNames[this.commandNames.length] = "run";

            // processes - list the running processes and their IDs
            sc = new TSOS.ShellCommand(this.shellListProcesses, "ps", "- Lists all running processes and Kernel as pid 0.");
            this.commandList[this.commandList.length] = sc;
            this.commandNames[this.commandNames.length] = "ps";

            // kill <id> - kills the specified process id.
            sc = new TSOS.ShellCommand(this.shellKillProc, "kill", "<pid> - Kill the process with the specified pid.");
            this.commandList[this.commandList.length] = sc;
            this.commandNames[this.commandNames.length] = "kill";

            // clearmem - clears ram.
            sc = new TSOS.ShellCommand(this.shellClearMem, "clearmem", "- Clears all memory.");
            this.commandList[this.commandList.length] = sc;
            this.commandNames[this.commandNames.length] = "clearmem";

            // quantum - <int> changes the round robin schedule clock ticks;
            sc = new TSOS.ShellCommand(this.shellQuantum, "quantum", "<int> - Set the scheduler clock ticks to the int specified.");
            this.commandList[this.commandList.length] = sc;
            this.commandNames[this.commandNames.length] = "quantum";

            // runall - wrapper for run all
            sc = new TSOS.ShellCommand(this.shellRunAll, "runall", "- Wrapper for run all.");
            this.commandList[this.commandList.length] = sc;
            this.commandNames[this.commandNames.length] = "runall";

            // Display the initial prompt.
            this.putPrompt();
        };

        Shell.prototype.putPrompt = function () {
            _StdOut.putText(this.promptStr);
        };

        Shell.prototype.handleInput = function (buffer) {
            _Kernel.krnTrace("Shell Command~" + buffer);

            //
            // Parse the input...
            //
            var userCommand = new TSOS.UserCommand();
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
                if (this.curses.indexOf("[" + TSOS.Utils.rot13(cmd) + "]") >= 0) {
                    this.execute(this.shellCurse);
                } else if (this.apologies.indexOf("[" + cmd + "]") >= 0) {
                    this.execute(this.shellApology);
                } else {
                    this.execute(this.shellInvalidCommand);
                }
            }
        };

        // args is an option parameter, ergo the ? which allows TypeScript to understand that
        Shell.prototype.execute = function (fn, args) {
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
        };

        Shell.prototype.parseInput = function (buffer) {
            var retVal = new TSOS.UserCommand();

            // 1. Remove leading and trailing spaces.
            buffer = TSOS.Utils.trim(buffer);

            // 2. Lower-case it.
            buffer = buffer.toLowerCase();

            // 3. Separate on spaces so we can determine the command and command-line args, if any.
            var tempList = buffer.split(" ");

            // 4. Take the first (zeroth) element and use that as the command.
            var cmd = tempList.shift();

            // 4.1 Remove any left-over spaces.
            cmd = TSOS.Utils.trim(cmd);

            // 4.2 Record it in the return value.
            retVal.command = cmd;

            for (var i in tempList) {
                var arg = TSOS.Utils.trim(tempList[i]);
                if (arg != "") {
                    retVal.args[retVal.args.length] = tempList[i];
                }
            }
            return retVal;
        };

        //
        // Shell Command Functions.  Again, not part of Shell() class per se', just called from there.
        //
        Shell.prototype.shellInvalidCommand = function () {
            _StdOut.putText("Invalid Command. ");
            if (_SarcasticMode) {
                _StdOut.putText("Duh. Go back to your Speak & Spell.");
            } else {
                _StdOut.putText("Type 'help' for, well... help.");
            }
        };

        Shell.prototype.shellCurse = function () {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putText("Bitch.");
            _SarcasticMode = true;
        };

        Shell.prototype.shellApology = function () {
            if (_SarcasticMode) {
                _StdOut.putText("Okay. I forgive you. This time.");
                _SarcasticMode = false;
            } else {
                _StdOut.putText("For what?");
            }
        };

        Shell.prototype.shellVer = function (args) {
            _StdOut.putText(APP_NAME + " version " + APP_VERSION);
        };

        Shell.prototype.shellHelp = function (args) {
            _StdOut.putText("Commands:");
            for (var i in _OsShell.commandList) {
                _StdOut.advanceLine();
                _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
            }
        };

        Shell.prototype.shellShutdown = function (args) {
            _StdOut.putText("Shutting down...");

            // Call Kernel shutdown routine.
            _Kernel.krnShutdown();
            // TODO: Stop the final prompt from being displayed.  If possible.  Not a high priority.  (Damn OCD!)
        };

        Shell.prototype.shellCls = function (args) {
            _StdOut.clearScreen();
            _StdOut.resetXY();
        };

        Shell.prototype.shellDate = function (args) {
            var currentTime = new Date(Date.now());
            _StdOut.putText("Current time: " + currentTime.toUTCString() + ".");
        };

        Shell.prototype.shellMan = function (args) {
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
        };

        Shell.prototype.shellTrace = function (args) {
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
        };

        Shell.prototype.shellRot13 = function (args) {
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putText(args.join(' ') + " = '" + TSOS.Utils.rot13(args.join(' ')) + "'");
            } else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        };

        Shell.prototype.shellPrompt = function (args) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            } else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        };

        Shell.prototype.shellWhereAmI = function (args) {
            _StdOut.putText("You are at: " + window.location.host.valueOf());
        };

        Shell.prototype.shellOverrideClockspeed = function (args) {
            if (args.length > 0) {
                var clockspeed = args[0];
                switch (clockspeed) {
                    case "high":
                        CPU_CLOCK_INTERVAL = 8;
                        clearInterval(_hardwareClockID);
                        _hardwareClockID = setInterval(TSOS.Devices.hostClockPulse, CPU_CLOCK_INTERVAL);
                        break;
                    case "normal":
                        CPU_CLOCK_INTERVAL = 100;
                        clearInterval(_hardwareClockID);
                        _hardwareClockID = setInterval(TSOS.Devices.hostClockPulse, CPU_CLOCK_INTERVAL);
                        break;
                    case "low":
                        CPU_CLOCK_INTERVAL = 1000;
                        clearInterval(_hardwareClockID);
                        _hardwareClockID = setInterval(TSOS.Devices.hostClockPulse, CPU_CLOCK_INTERVAL);
                        break;
                    case "step":
                        _EnableStepMode = true;
                        TSOS.Control.hostSingleStepInit();
                        break;
                    default:
                        _StdOut.putText("Invalid argument. Usage: overclock <low | normal | high | step>.");
                        break;
                }
            } else {
                _StdOut.putText("Usage: overclock <low | normal | high>.");
            }
        };

        Shell.prototype.shellStatus = function (args) {
            if (args.length > 0) {
                _OsShell.statusMessage = _OsShell.statusMessage + args[0] + " ";
                _Kernel.krnTrace(_OsShell.statusMessage);
            } else {
                _StdOut.putText("Usage: status <string> Please supply a string.");
            }
        };

        Shell.prototype.shellPanic = function (args) {
            _Kernel.krnTrapErrorSysfault("0xBADD");
        };

        Shell.prototype.shellLoad = function (args) {
            var program = document.getElementById("taProgramInput").value;
            var valid = "";
            var priority = 8;
            var i = 0;
            if (program.length > 0) {
                while (i < program.length) {
                    if ((program[i] >= "A" && program[i] <= "F") || (program[i] >= "a" && program[i] <= "f")) {
                        // assume caps for hex digits
                        valid += program[i].toUpperCase();
                    } else if (program[i] >= "0" && program[i] <= "9") {
                        //handle numbers
                        valid += program[i];
                    } else if (program[i] === " ") {
                        //eliminate spaces
                    } else {
                        _StdOut.putText("Program error not hex at character: " + i + ", " + program[i] + ".");
                        return;
                    }
                    i++;
                }
                if (valid.length % 2 !== 0) {
                    _StdOut.putText("Error instructions not even.");
                    return;
                }
            } else {
                _StdOut.putText("No program.");
                return;
            }
            if (_loadedPrograms > 2) {
                _StdOut.putText("Memory Full");
                return;
            }

            // Add valid program to memory here
            var localPCB = new TSOS.Pcb;
            localPCB.init();
            localPCB.setPcbId(_PID);
            _MMU.blockStored();
            _MMU.eraseBlock();
            localPCB.setBaseAddress(_MMU.getBaseAddr());
            i = 0;
            var k = 0;
            while (i < valid.length - 1) {
                var j = i + 1;
                _MMU.moveToAddr(k);
                k = k + 1;
                _MMU.storeToAddress(valid[i] + valid[j]);
                i = i + 2;
            }
            if (args.length > 0) {
                priority = parseInt(args[0]);
            }
            localPCB.Pr = priority;
            _StdOut.putText("PID: " + localPCB.getPcbId().toString() + " loaded");
            _ResidentQueue.enqueue(localPCB);
            TSOS.Control.hostMemory();
            TSOS.Control.hostQueues();
            _PID = _PID + 1;
        };

        Shell.prototype.shellRun = function (args) {
            var localPCB = new TSOS.Pcb;
            localPCB.init();
            if (args.length < 1) {
                _StdOut.putText("Usage: run <pid | 'all'>.");
            } else {
                if (args[0] === "all") {
                    while (0 < _ResidentQueue.getSize()) {
                        _ReadyQueue.enqueue(_ResidentQueue.dequeue());
                    }
                    if (_CPU.isExecuting) {
                        return;
                    }
                    if (_CurSchedulerMode === 2) {
                        _ReadyQueue.prioritize();
                    }
                    _CurPCB = _ReadyQueue.dequeue();
                    _CurPCB.restoreCpuState();
                    _MMU.updateBaseAddr(_CurPCB.getBaseAddress());
                    _CPU.isExecuting = true;
                } else {
                    for (var i = 0; i < _ResidentQueue.getSize(); i++) {
                        localPCB = _ResidentQueue.dequeue();
                        if (localPCB.Id === parseInt(args[0]) && !_CPU.isExecuting) {
                            localPCB.restoreCpuState();
                            _CurPCB = localPCB;
                            _MMU.updateBaseAddr(_CurPCB.getBaseAddress());
                            _CPU.isExecuting = true;
                            return;
                        } else if (localPCB.Id === parseInt(args[0]) && _CPU.isExecuting) {
                            _ReadyQueue.enqueue(localPCB);
                            if (_CurSchedulerMode === 2) {
                                _ReadyQueue.prioritize();
                            }
                            return;
                        } else {
                            _ResidentQueue.enqueue(localPCB);
                        }
                    }
                    _StdOut.putText("No program to run at designated pid.");
                }
            }
        };

        Shell.prototype.shellListProcesses = function (args) {
            _StdOut.putText("Processes running: isKernel   PID");
            _StdOut.advanceLine();
            _StdOut.putText("                       *       0");
            if (_CurPCB.getPcbId() < 0) {
                // no printing only advance line
                _StdOut.advanceLine();
            } else {
                _StdOut.advanceLine();
                _StdOut.putText("                               " + _CurPCB.getPcbId().toString());
                _StdOut.advanceLine();
            }
            for (var i = 0; i < _ReadyQueue.getSize(); i++) {
                _StdOut.putText("                               " + _ReadyQueue.q[i].getPcbId().toString());
                _StdOut.advanceLine();
            }
        };

        Shell.prototype.shellKillProc = function (args) {
            if (args.length < 1) {
                _StdOut.putText("Usage: kill <pid>.");
            } else {
                if (_CurPCB.Id === parseInt(args[0])) {
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(CPU_IRQ, "Process terminated by user"));
                } else if (_ReadyQueue.getSize() > 0) {
                    var localPCB;
                    var i = 0;
                    while (i < _ReadyQueue.getSize()) {
                        if (parseInt(args[0]) !== _ReadyQueue.q[i].getPcbId()) {
                            _ReadyQueue.enqueue(_ReadyQueue.dequeue());
                        } else {
                            localPCB = _ReadyQueue.dequeue();
                            _MMU.blockReleased(localPCB.getBaseAddress());
                            _TerminatedQueue.enqueue(localPCB);
                        }
                        i = i + 1;
                    }
                } else {
                    _StdOut.putText("Pid: " + parseInt(args[0]) + " is not running.");
                }
            }
        };

        Shell.prototype.shellClearMem = function (args) {
            _MMU.eraseMemory();
            TSOS.Control.hostMemory();
        };

        Shell.prototype.shellQuantum = function (args) {
            if (args.length > 0) {
                _SchedulerClockLimit = parseInt(args[0]);
            } else {
                _StdOut.putText("Usage: quantum <int>.");
            }
        };
        Shell.prototype.shellRunAll = function (args) {
            var localarr = [];
            localarr[0] = "all";
            _OsShell.shellRun(localarr);
        };

        Shell.prototype.shellCreateFile = function (args) {
        };

        Shell.prototype.shellReadFile = function (args) {
        };

        Shell.prototype.shellWriteFile = function (args) {
        };

        Shell.prototype.shellDeleteFile = function (args) {
        };

        Shell.prototype.shellFormatDrive = function (args) {
        };

        Shell.prototype.shellListDir = function (args) {
        };

        Shell.prototype.shellSetScheduleAlg = function (args) {
            if (args.length > 0) {
                switch (args[0]) {
                    case "rr":
                        _CurSchedulerMode = 0;
                        break;
                    case "fcfs":
                        _CurSchedulerMode = 1;
                        break;
                    case "priority":
                        _CurSchedulerMode = 2;
                        break;
                    default:
                        _StdOut.putText("Invalid argument. Usage: setschedule <rr|fcfs|priority>.");
                        break;
                }
            } else {
                _StdOut.putText("Usage: setschedule <rr|fcfs|priority>.");
            }
        };

        Shell.prototype.shellGetScheduleAlg = function (args) {
            if (_CurSchedulerMode === 0) {
                _StdOut.putText("Schedule: Round Robin");
            } else if (_CurSchedulerMode === 1) {
                _StdOut.putText("Schedule: First Come First Served");
            } else if (_CurSchedulerMode === 2) {
                _StdOut.putText("Schedule: Priority");
            } else {
                _StdOut.putText("Schedule: Something has gone horribly wrong!");
            }
        };
        return Shell;
    })();
    TSOS.Shell = Shell;
})(TSOS || (TSOS = {}));
