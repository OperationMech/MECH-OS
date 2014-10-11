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
        Memory.prototype.erase = function () {
            this.mem = null;
        };

        Memory.prototype.init = function () {
            while (this.mem.length < _RamCapacity) {
                this.mem[this.mem.length] = parseInt("0x00", 16).toString();
            }
        };

        Memory.prototype.read = function (loc) {
            return this.mem[loc];
        };

        Memory.prototype.write = function (loc, value) {
            if (loc > _RamCapacity || loc < 0x00) {
                return false;
            }
            this.mem[loc] = value;
            return true;
        };
        return Memory;
    })();
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
