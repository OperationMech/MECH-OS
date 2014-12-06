///<reference path="deviceDriver.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/* ----------------------------------
DeviceDriverDisk.ts
Requires deviceDriver.ts
The Kernel Disk Device Driver.
---------------------------------- */
var TSOS;
(function (TSOS) {
    // Extends DeviceDriver
    var DeviceDriverDisk = (function (_super) {
        __extends(DeviceDriverDisk, _super);
        function DeviceDriverDisk() {
            // Override the base method pointers.
            _super.call(this, this.krnDiskDriverEntry, this.krnDiskDriverCommand);
        }
        DeviceDriverDisk.prototype.krnDiskDriverEntry = function () {
            // Init routine for disk drive
            this.status = _DiskDrive.testDiskDevice();
        };

        DeviceDriverDisk.prototype.krnDiskDriverCommand = function (params) {
            var cmdToExecute = params[0];
            var cmdNumber = params[1];
            var filename = params[2];
            var data = params[3];

            switch (cmdToExecute) {
                case "read":
                    _StdOut.putText(this.ReadFromDisk(filename));
                    break;
                case "write":
                    _StdOut.putText("File Written: " + this.WriteToDisk(cmdNumber, data, filename).toString());
                    break;
                case "rToMemory":
                    this.ReadToMemory();
                    break;
                case "list":
                    break;
                case "delete":
                    this.DeleteRecord(filename);
                    break;
                case "format":
                    this.FormatDisk();
                    break;
                default:
                    _Kernel.krnTrace("Disk command unrecognized");
                    break;
            }
        };

        DeviceDriverDisk.prototype.WriteToDisk = function (cmdNum, data, filename) {
            if (typeof filename === "undefined") { filename = "._"; }
            return true;
        };

        DeviceDriverDisk.prototype.ReadToMemory = function () {
            return "";
        };

        DeviceDriverDisk.prototype.ReadFromDisk = function (filename) {
            var tsbSearch = "010";
            var Hold = _DiskDrive.retrieveFromDisk(tsbSearch).split(" ");
            var buffer = "";

            return buffer;
        };

        DeviceDriverDisk.prototype.DeleteRecord = function (filename) {
            return true;
        };

        DeviceDriverDisk.prototype.FormatDisk = function () {
            return true;
        };

        DeviceDriverDisk.prototype.ListFiles = function () {
            var strOut = "";
            return strOut;
        };
        return DeviceDriverDisk;
    })(TSOS.DeviceDriver);
    TSOS.DeviceDriverDisk = DeviceDriverDisk;
})(TSOS || (TSOS = {}));
