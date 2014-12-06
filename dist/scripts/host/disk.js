///<reference path="../globals.ts"/>
/*  ---------
Disk.ts
Requires global.ts.
Host disk implementation.  Simulates a Physical Hard Drive.
--------- */
var TSOS;
(function (TSOS) {
    var Disk = (function () {
        function Disk(storage) {
            this.storage = storage;
        }
        Disk.prototype.init = function () {
            this.storage.localStorage.clear();
        };

        Disk.prototype.addToDisk = function (tsb, data) {
            this.storage.localStorage.setItem(tsb, data);
        };

        Disk.prototype.removeFromDisk = function (tsb) {
            this.storage.localStorage.removeItem(tsb);
        };

        Disk.prototype.retrieveFromDisk = function (tsb) {
            this.storage.localStorage.getItem(tsb);
        };

        Disk.prototype.toString = function () {
            var strOut = "";
            var t = 0;
            while (t < 3) {
                var s = 0;
                while (s < 7) {
                    var b = 0;
                    while (b < 7) {
                        strOut = t + s + b + " " + this.storage.localStorage.getItem("" + t + s + b) + "\n" + strOut;
                        b = b + 1;
                    }
                    s = s + 1;
                }
                t = t + 1;
            }
            return strOut;
        };
        return Disk;
    })();
    TSOS.Disk = Disk;
})(TSOS || (TSOS = {}));
