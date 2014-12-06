///<reference path="../globals.ts"/>
/*  ---------
Disk.ts
Requires global.ts.
Host disk implementation.  Simulates a Physical Hard Drive.
--------- */
var TSOS;
(function (TSOS) {
    var Disk = (function () {
        function Disk(storage, dirCache, datCache, dirBlocks, datBlocks) {
            if (typeof dirCache === "undefined") { dirCache = "010"; }
            if (typeof datCache === "undefined") { datCache = "100"; }
            if (typeof dirBlocks === "undefined") { dirBlocks = 56; }
            if (typeof datBlocks === "undefined") { datBlocks = 192; }
            this.storage = storage;
            this.dirCache = dirCache;
            this.datCache = datCache;
            this.dirBlocks = dirBlocks;
            this.datBlocks = datBlocks;
        }
        Disk.prototype.testDiskDevice = function () {
            return "loaded";
        };

        Disk.prototype.init = function () {
            this.storage.localStorage.clear();
        };

        Disk.prototype.addToDisk = function (tsb, data) {
            if (this.storage.localStorage.getItem(tsb).split(" ")[0][0] > 1) {
                return false;
            } else {
                this.storage.localStorage.setItem(tsb, data);
                return true;
            }
        };

        Disk.prototype.removeFromDisk = function (tsb) {
            if (this.storage.localStorage.getItem(tsb).split(" ")[0][0] < 1) {
                return false;
            } else {
                this.storage.localStorage.removeItem(tsb);
                return true;
            }
        };

        Disk.prototype.retrieveFromDisk = function (tsb) {
            return this.storage.localStorage.getItem(tsb);
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
