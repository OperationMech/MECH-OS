///<reference path="../globals.ts" />
/* ------------
CPU.ts
Requires global.ts.
Routines for the host CPU simulation, NOT for the OS itself.
In this manner, it's A LITTLE BIT like a hypervisor,
in that the Document environment inside a browser is the "bare metal" (so to speak) for which we write code
that hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using
TypeScript/JavaScript in both the host and client environments.
This code references page numbers in the text book:
Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
------------ */
var TSOS;
(function (TSOS) {
    var Cpu = (function () {
        function Cpu(PC, Acc, Xreg, Yreg, Ireg, Zflag, isExecuting) {
            if (typeof PC === "undefined") { PC = 0; }
            if (typeof Acc === "undefined") { Acc = 0; }
            if (typeof Xreg === "undefined") { Xreg = 0; }
            if (typeof Yreg === "undefined") { Yreg = 0; }
            if (typeof Ireg === "undefined") { Ireg = 0; }
            if (typeof Zflag === "undefined") { Zflag = 0; }
            if (typeof isExecuting === "undefined") { isExecuting = false; }
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Ireg = Ireg;
            this.Zflag = Zflag;
            this.isExecuting = isExecuting;
        }
        Cpu.prototype.init = function () {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Ireg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
        };

        Cpu.prototype.fetch = function () {
            _MMU.moveToAddr(this.PC);
            this.Ireg = parseInt(_MMU.valueOfAddress(), 16);
            this.PC = this.PC + 1;
        };

        Cpu.prototype.decodeAndExecIns = function () {
            switch (this.Ireg) {
                case 0xA9:
                    _MMU.moveToAddr(this.PC);
                    this.Acc = parseInt(_MMU.valueOfAddress(), 16);
                    this.PC = this.PC + 1;
                    break;
                case 0xAD:
                    var memloc = "0000";
                    _MMU.moveToAddr(this.PC + 1);
                    memloc = _MMU.valueOfAddress();
                    _MMU.moveToAddr(this.PC);
                    memloc = memloc + _MMU.valueOfAddress();
                    _MMU.moveToAddr(parseInt(memloc, 16));
                    this.Acc = parseInt(_MMU.valueOfAddress(), 16);
                    this.PC = this.PC + 2;
                    break;
                case 0x8D:
                    var memloc = "0000";
                    _MMU.moveToAddr(this.PC + 1);
                    memloc = _MMU.valueOfAddress();
                    _MMU.moveToAddr(this.PC);
                    memloc = memloc + _MMU.valueOfAddress();
                    _MMU.moveToAddr(parseInt(memloc, 16));
                    _MMU.storeToAddress(this.Acc.toString(16));
                    this.PC = this.PC + 2;
                    break;
                case 0x6D:
                    var memloc = "0000";
                    _MMU.moveToAddr(this.PC + 1);
                    memloc = _MMU.valueOfAddress();
                    _MMU.moveToAddr(this.PC);
                    memloc = memloc + _MMU.valueOfAddress();
                    _MMU.moveToAddr(parseInt(memloc, 16));
                    this.Acc = this.Acc + parseInt(_MMU.valueOfAddress(), 16);
                    this.PC = this.PC + 2;
                    break;
                case 0xA2:
                    _MMU.moveToAddr(this.PC);
                    this.Xreg = parseInt(_MMU.valueOfAddress(), 16);
                    this.PC = this.PC + 1;
                    break;
                case 0xAE:
                    var memloc = "0000";
                    _MMU.moveToAddr(this.PC + 1);
                    memloc = _MMU.valueOfAddress();
                    _MMU.moveToAddr(this.PC);
                    memloc = memloc + _MMU.valueOfAddress();
                    _MMU.moveToAddr(parseInt(memloc, 16));
                    this.Xreg = parseInt(_MMU.valueOfAddress(), 16);
                    this.PC = this.PC + 2;
                    break;
                case 0xA0:
                    _MMU.moveToAddr(this.PC);
                    this.Yreg = parseInt(_MMU.valueOfAddress(), 16);
                    this.PC = this.PC + 1;
                    break;
                case 0xAC:
                    var memloc = "0000";
                    _MMU.moveToAddr(this.PC + 1);
                    memloc = _MMU.valueOfAddress();
                    _MMU.moveToAddr(this.PC);
                    memloc = memloc + _MMU.valueOfAddress();
                    _MMU.moveToAddr(parseInt(memloc, 16));
                    this.Yreg = parseInt(_MMU.valueOfAddress(), 16);
                    this.PC = this.PC + 2;
                    break;
                case 0xEA:
                    break;
                case 0x00:
                    this.isExecuting = false;
                    _CurPCB.saveCpuState();
                    break;
                case 0xEC:
                    var memloc = "0000";
                    _MMU.moveToAddr(this.PC + 1);
                    memloc = _MMU.valueOfAddress();
                    _MMU.moveToAddr(this.PC);
                    memloc = memloc + _MMU.valueOfAddress();
                    _MMU.moveToAddr(parseInt(memloc, 16));
                    if (this.Xreg === parseInt(_MMU.valueOfAddress(), 16)) {
                        this.Zflag = 1;
                    } else {
                        this.Zflag = 0;
                    }
                    this.PC = this.PC + 2;
                    break;
                case 0xD0:
                    if (this.Zflag === 0) {
                        _MMU.moveToAddr(this.PC);
                        this.PC = (this.PC + 1 + parseInt(_MMU.valueOfAddress(), 16)) % (_RamBlock);
                    } else {
                        this.PC = this.PC + 1;
                    }
                    break;
                case 0xEE:
                    var memloc = "0000";
                    _MMU.moveToAddr(this.PC + 1);
                    memloc = _MMU.valueOfAddress();
                    _MMU.moveToAddr(this.PC);
                    memloc = memloc + _MMU.valueOfAddress();
                    _MMU.moveToAddr(parseInt(memloc, 16));
                    _MMU.storeToAddress((parseInt(_MMU.valueOfAddress(), 16) + 1).toString(16));
                    this.PC = this.PC + 2;
                    break;
                case 0xFF:
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(SW_IRQ, "software syscall"));
                    break;
                default:
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(CPU_IRQ, "Unknown instruction: " + this.Ireg.toString(16) + "."));
            }
        };

        Cpu.prototype.cycle = function () {
            _Kernel.krnTrace('CPU cycle');

            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
            if (this.isExecuting) {
                this.fetch();
                this.decodeAndExecIns();
                if (!this.isExecuting) {
                    _TerminatedQueue.enqueue(_CurPCB);
                    _CurPCB = null;
                    _CurSchedulerClock = 0;
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(TIMER_IRQ, "Schedule check"));
                }
            }
        };
        return Cpu;
    })();
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
