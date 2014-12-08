///<reference path="../globals.ts"/>
/*  ---------
Disk.ts
Requires global.ts.
Host disk implementation.  Simulates a Physical Hard Drive.
--------- */
var TSOS;
(function (TSOS) {
    var Disk = (function () {
        function Disk() {
            this.storage = self.localStorage;
            this.dirCache = "010";
            this.datCache = "100";
            this.dirBlocks = 56;
            this.datBlocks = 192;
        }
        Disk.prototype.testDiskDevice = function () {
            return "loaded";
        };

        Disk.prototype.init = function () {
            this.storage.clear();
        };

        Disk.prototype.addToDisk = function (tsb, data) {
            if (this.storage.getItem(tsb).split(" ")[0][0] > 0) {
                return false;
            } else {
                this.storage.setItem(tsb, data);
                return true;
            }
        };

        Disk.prototype.deleteFromDisk = function (tsb) {
            var replaceData = this.storage.getItem(tsb);
            replaceData[0] = "0";
            this.storage.setItem(tsb, replaceData);
        };

        Disk.prototype.removeFromDisk = function (tsb) {
            if (this.storage.getItem(tsb).split(" ")[0][0] < 1) {
                return false;
            } else if (this.storage.getItem(tsb) === null) {
                this.storage.setItem(tsb, "0- -- -");
                return true;
            } else {
                _DiskDrive.deleteFromDisk(tsb);
                return true;
            }
        };

        Disk.prototype.retrieveFromDisk = function (tsb) {
            return this.storage.getItem(tsb);
        };

        Disk.prototype.toString = function () {
            var strOut = "";
            var t = 0;
            while (t < 3) {
                var s = 0;
                while (s < 7) {
                    var b = 0;
                    while (b < 7) {
                        strOut = +strOut + t + s + b + " " + this.storage.getItem("" + t + s + b) + "<br>";
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
