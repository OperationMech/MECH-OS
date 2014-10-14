///<reference path="../globals.ts"/>
/*  ---------
MemAlloc.ts
Requires global.ts.
Host memory accessor uses real ram size.
--------- */
var TSOS;
(function (TSOS) {
    var MemAlloc = (function () {
        function MemAlloc(memory) {
            this.memory = memory;
        }
        MemAlloc.prototype.init = function () {
            this.memory.init();
        };

        MemAlloc.prototype.clear = function () {
            this.memory.erase();
            this.memory.init();
        };

        MemAlloc.prototype.readLoc = function (pos) {
            var retval = "0x100";
            if (pos > _RamCapacity || pos < 0x00) {
                return retval;
            }
            return this.memory.read(pos);
        };

        MemAlloc.prototype.writeLoc = function (pos, storeval) {
            if (!this.memory.write(pos, storeval)) {
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(MEM_IRQ, "(" + pos.toString() + " " + storeval + ")"));
            }
        };

        MemAlloc.prototype.toString = function () {
            var i = 0;
            var output = new Array(_RamCapacity / 16 - 1);
            var modRam = _RamCapacity / 16;
            while (i < modRam) {
                output[i] = new Array(15);
                var j = 0;
                while (j < 16) {
                    output[i][j] = this.readLoc((i * 16) + j);
                    j = j + 1;
                }
                i = i + 1;
            }
            return output;
        };
        return MemAlloc;
    })();
    TSOS.MemAlloc = MemAlloc;
})(TSOS || (TSOS = {}));
