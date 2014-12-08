///<reference path="../globals.ts"/>
/* ---------
Pcb.ts
Requires global.ts.
Client Process control block object.
--------- */
var TSOS;
(function (TSOS) {
    var Pcb = (function () {
        function Pcb(Id, Pr, baseAddr, PC, Acc, Xreg, Yreg, Ireg, Zflag, onDisk) {
            if (typeof Id === "undefined") { Id = -1; }
            if (typeof Pr === "undefined") { Pr = 8; }
            if (typeof baseAddr === "undefined") { baseAddr = 0; }
            if (typeof PC === "undefined") { PC = 0; }
            if (typeof Acc === "undefined") { Acc = 0; }
            if (typeof Xreg === "undefined") { Xreg = 0; }
            if (typeof Yreg === "undefined") { Yreg = 0; }
            if (typeof Ireg === "undefined") { Ireg = 0; }
            if (typeof Zflag === "undefined") { Zflag = 0; }
            if (typeof onDisk === "undefined") { onDisk = 0; }
            this.Id = Id;
            this.Pr = Pr;
            this.baseAddr = baseAddr;
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Ireg = Ireg;
            this.Zflag = Zflag;
            this.onDisk = onDisk;
        }
        Pcb.prototype.init = function () {
            this.Id = -1;
            this.Pr = 8;
            this.baseAddr = 0;
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Ireg = 0;
            this.Zflag = 0;
            this.onDisk = 0;
        };

        Pcb.prototype.setPcbId = function (idNum) {
            this.Id = idNum;
        };

        Pcb.prototype.getPcbId = function () {
            return this.Id;
        };

        Pcb.prototype.saveCpuState = function () {
            this.PC = _CPU.PC;
            this.Acc = _CPU.Acc;
            this.Xreg = _CPU.Xreg;
            this.Yreg = _CPU.Yreg;
            this.Ireg = _CPU.Ireg;
            this.Zflag = _CPU.Zflag;
        };

        Pcb.prototype.restoreCpuState = function () {
            _CPU.PC = this.PC;
            _CPU.Acc = this.Acc;
            _CPU.Xreg = this.Xreg;
            _CPU.Yreg = this.Yreg;
            _CPU.Ireg = this.Ireg;
            _CPU.Zflag = this.Zflag;
        };

        Pcb.prototype.getBaseAddress = function () {
            if (this.onDisk) {
                return "._" + this.Id.toString(16);
            } else {
                return this.baseAddr;
            }
        };
        Pcb.prototype.setBaseAddress = function (inBaseAddr) {
            if (inBaseAddr < 0) {
                this.onDisk = 1;
            } else {
                this.baseAddr = inBaseAddr;
            }
        };

        Pcb.prototype.toString = function () {
            var output = "PID: " + this.Id.toString() + " Priority: " + this.Pr.toString(16) + " BaseAddr: " + this.baseAddr.toString(16) + " PC: " + this.PC.toString(16) + " Acc: " + this.Acc.toString(16) + " Xreg: " + this.Xreg.toString(16) + " Yreg: " + this.Yreg.toString(16) + " IReg: " + this.Ireg.toString(16) + " Zflag: " + this.Zflag.toString(16) + " LimitAddr: " + (this.baseAddr + _RamBlock - 1).toString(16) + " isOnDisk: " + this.onDisk.toString(16);
            return output;
        };
        return Pcb;
    })();
    TSOS.Pcb = Pcb;
})(TSOS || (TSOS = {}));
