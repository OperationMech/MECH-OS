///<reference path="../globals.ts"/>
/*  ---------
Mmu.ts
Requires global.ts.
Client memory manager translates addresses with respect to the base register of the Program in use.
--------- */
var TSOS;
(function (TSOS) {
    var Mmu = (function () {
        function Mmu(baseAddr, address, block0InUse, block1InUse, block2InUse) {
            if (typeof baseAddr === "undefined") { baseAddr = 0; }
            if (typeof address === "undefined") { address = 0; }
            if (typeof block0InUse === "undefined") { block0InUse = false; }
            if (typeof block1InUse === "undefined") { block1InUse = false; }
            if (typeof block2InUse === "undefined") { block2InUse = false; }
            this.baseAddr = baseAddr;
            this.address = address;
            this.block0InUse = block0InUse;
            this.block1InUse = block1InUse;
            this.block2InUse = block2InUse;
        }
        Mmu.prototype.init = function () {
            this.baseAddr = 0;
            this.address = 0;
            this.block0InUse = false;
            this.block1InUse = false;
            this.block2InUse = false;
        };

        Mmu.prototype.updateBaseAddr = function (addr) {
            this.baseAddr = addr;
        };

        Mmu.prototype.getBaseAddr = function () {
            return this.baseAddr;
        };

        Mmu.prototype.blockStored = function () {
            if (!this.block0InUse) {
                this.block0InUse = true;
                this.baseAddr = 0;
            } else if (!this.block1InUse) {
                this.block1InUse = true;
                this.baseAddr = 0x100;
            } else if (!this.block2InUse) {
                this.block2InUse = true;
                this.baseAddr = 0x200;
            } else {
                // not used
            }
            _loadedPrograms = _loadedPrograms + 1;
        };

        Mmu.prototype.blockReleased = function (addr) {
            if (addr === 0x000) {
                this.block0InUse = false;
            } else if (addr === 0x100) {
                this.block1InUse = false;
            } else if (addr === 0x200) {
                this.block2InUse = false;
            } else {
                // not used
            }
            _loadedPrograms = _loadedPrograms - 1;
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

        Mmu.prototype.eraseBlock = function () {
            for (var i = 0 + this.baseAddr; i < this.baseAddr + _RamBlock; i++) {
                _MA.writeLoc(i, "00");
            }
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
