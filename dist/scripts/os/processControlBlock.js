///<reference path="../globals.ts"/>
/*  ---------
Pcb.ts
Requires global.ts.
Client Process control block object.
--------- */
var TSOS;
(function (TSOS) {
    var Pcb = (function () {
        function Pcb(Id, baseAddr, PC, Acc, Xreg, Yreg, Ireg, Zflag) {
            if (typeof Id === "undefined") { Id = 1; }
            if (typeof baseAddr === "undefined") { baseAddr = 0; }
            if (typeof PC === "undefined") { PC = 0; }
            if (typeof Acc === "undefined") { Acc = 0; }
            if (typeof Xreg === "undefined") { Xreg = 0; }
            if (typeof Yreg === "undefined") { Yreg = 0; }
            if (typeof Ireg === "undefined") { Ireg = 0; }
            if (typeof Zflag === "undefined") { Zflag = 1; }
            this.Id = Id;
            this.baseAddr = baseAddr;
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Ireg = Ireg;
            this.Zflag = Zflag;
        }
        Pcb.prototype.init = function () {
            this.Id = 1;
            this.baseAddr = 0;
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Ireg = 0;
            this.Zflag = 1;
        };

        Pcb.prototype.setPcbId = function (idNum) {
            this.Id = idNum;
        };

        Pcb.prototype.getPcbId = function () {
            return this.Id;
        };

        Pcb.prototype.saveCpuState = function (CPU) {
            this.PC = CPU.PC;
            this.Acc = CPU.Acc;
            this.Xreg = CPU.Xreg;
            this.Yreg = CPU.Yreg;
            this.Ireg = CPU.Ireg;
            this.Zflag = CPU.Zflag;
        };

        Pcb.prototype.restoreCpuState = function (CPU) {
            CPU.PC = this.PC;
            CPU.Acc = this.Acc;
            CPU.Xreg = this.Xreg;
            CPU.Yreg = this.Yreg;
            CPU.Ireg = this.Ireg;
            CPU.Zflag = this.Zflag;
        };

        Pcb.prototype.toString = function () {
            var space = " ";
            var output = space + this.PC.toString(16) + space + this.Acc.toString(16) + space + this.Xreg.toString(16) + space + this.Yreg.toString(16) + space + this.Ireg.toString(16) + space + this.Zflag.toString(16);
            return output;
        };
        return Pcb;
    })();
    TSOS.Pcb = Pcb;
})(TSOS || (TSOS = {}));
