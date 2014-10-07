///<reference path="../globals.ts"/>
/*  ---------
Memory.ts
Requires global.ts.
Host memory implementation.  Simulates Physical RAM.
--------- */
var TSOS;
(function (TSOS) {
    var Memory = (function () {
        function Memory(mem) {
            if (typeof mem === "undefined") { mem = null; }
            this.mem = mem;
        }
        Memory.prototype.init = function () {
            while (this.mem.length < _RamCapacity) {
                this.mem[this.mem.length] = parseInt("0", 16);
            }
        };

        Memory.prototype.read = function (loc) {
            var retval = 0x100;
            if (parseInt(loc, 16) > _RamCapacity || parseInt(loc, 16) < 0x00) {
                return retval;
            }
            retval = this.mem[parseInt(loc, 16)];
            return retval;
        };

        Memory.prototype.write = function (loc, value) {
            if (parseInt(loc, 16) > _RamCapacity || parseInt(loc, 16) < 0x00) {
                return false;
            }
            this.mem[parseInt(loc, 16)] = value;
            return true;
        };
        return Memory;
    })();
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
