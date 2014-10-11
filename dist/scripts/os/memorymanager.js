///<reference path="../globals.ts"/>
/*  ---------
Mmu.ts
Requires global.ts.
Client memory manager translates addresses with respect to the base register of the Program in use.
--------- */
var TSOS;
(function (TSOS) {
    var Mmu = (function () {
        function Mmu(baseAddr, address) {
            if (typeof baseAddr === "undefined") { baseAddr = 0; }
            if (typeof address === "undefined") { address = 0; }
            this.baseAddr = baseAddr;
            this.address = address;
        }
        Mmu.prototype.init = function () {
            this.baseAddr = 0;
            this.address = 0;
        };

        Mmu.prototype.setBaseAddr = function (addr) {
            this.baseAddr = addr / 0x100;
        };

        Mmu.prototype.valueOfAddress = function () {
            if (_MA.readLoc(this.address + this.baseAddr) === "0x100") {
                return "00";
            }
            return _MA.readLoc(this.address + this.baseAddr);
        };

        Mmu.prototype.storeToAddress = function (storeS) {
            _MA.writeLoc(this.address + this.baseAddr, storeS);
        };

        Mmu.prototype.eraseMemory = function () {
            _MA.clear();
        };

        Mmu.prototype.moveToAddr = function (offset) {
            this.address = (offset % _RamBlock) + this.baseAddr;
        };
        return Mmu;
    })();
    TSOS.Mmu = Mmu;
})(TSOS || (TSOS = {}));
