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
            this.isFormatted = false;
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
            this.storage.removeItem(tsb);
            this.storage.setItem(tsb, "0- -- -");
        };

        Disk.prototype.removeFromDisk = function (tsb) {
            if (this.storage.getItem(tsb) === null) {
                this.storage.setItem(tsb, "0- -- -");
                return true;
            } else if (this.storage.getItem(tsb).split(" ")[0][0] < 1) {
                return false;
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
            var tsb = "000";
            var t = 0;
            while (t < 4) {
                var s = 0;
                while (s < 8) {
                    var b = 0;
                    while (b < 8) {
                        if (t === 0 && s === 0 && b === 0) {
                            tsb = "000";
                        } else if (t === 0 && s === 0) {
                            tsb = "00" + b;
                        } else if (t === 0) {
                            tsb = "0" + s + b;
                        } else {
                            tsb = "" + t + s + b;
                        }
                        strOut = strOut + tsb + " " + this.storage.getItem(tsb) + "<br>";
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
