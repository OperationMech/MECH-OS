///<reference path="../globals.ts"/>
/*  ---------
Mmu.ts
Requires global.ts.
Client memory manager translates addresses with respect to the base register of the Program in use.
--------- */
var TSOS;
(function (TSOS) {
    var Mmu = (function () {
        function Mmu(baseAddr, address, blocksInUse) {
            if (typeof baseAddr === "undefined") { baseAddr = 0; }
            if (typeof address === "undefined") { address = 0; }
            if (typeof blocksInUse === "undefined") { blocksInUse = 0; }
            this.baseAddr = baseAddr;
            this.address = address;
            this.blocksInUse = blocksInUse;
        }
        Mmu.prototype.init = function () {
            this.baseAddr = 0;
            this.address = 0;
            this.blocksInUse = 0;
        };

        Mmu.prototype.setBaseAddr = function () {
            this.baseAddr = (this.blocksInUse % 3) * _RamBlock;
        };

        Mmu.prototype.getBaseAddr = function () {
            return this.baseAddr;
        };

        Mmu.prototype.blockStored = function () {
            this.blocksInUse = this.blocksInUse + 1;
        };

        Mmu.prototype.blockReleased = function () {
            this.blocksInUse = this.blocksInUse - 1;
        };

        Mmu.prototype.valueOfAddress = function () {
            if (_MA.readLoc(this.address) === "0x100") {
                return "00";
            }
            return _MA.readLoc(this.address);
        };

        Mmu.prototype.storeToAddress = function (storeS) {
            _MA.writeLoc(this.address, storeS);
        };

        Mmu.prototype.eraseMemory = function () {
            _MA.clear();
        };

        Mmu.prototype.moveToAddr = function (offset) {
            if (offset >= _RamBlock) {
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(CPU_IRQ, "Execution memory pool error."));
            } else {
                this.address = offset + this.baseAddr;
            }
        };
        return Mmu;
    })();
    TSOS.Mmu = Mmu;
})(TSOS || (TSOS = {}));
