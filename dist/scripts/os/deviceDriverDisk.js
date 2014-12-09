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
                    _StdOut.advanceLine();
                    break;
                case "create":
                    _StdOut.putText("File created: " + this.CreateFile(cmdNumber, filename).toString());
                    _StdOut.advanceLine();
                    _StdOut.putText(">");
                    TSOS.Control.hostDisk();
                    break;
                case "write":
                    _StdOut.putText("File written: " + this.WriteToDisk(cmdNumber, data, filename).toString());
                    _StdOut.advanceLine();
                    _StdOut.putText(">");
                    TSOS.Control.hostDisk();
                    break;
                case "rToMemory":
                    this.ReadToMemory(filename);
                    TSOS.Control.hostDisk();
                    break;
                case "list":
                    _StdOut.putText("Files on disk:");
                    _StdOut.advanceLine();
                    _StdOut.putText("/");
                    _StdOut.advanceLine();
                    _StdOut.putText(this.ListFiles());
                    _StdOut.advanceLine();
                    _StdOut.putText(">");
                    break;
                case "delete":
                    this.DeleteRecord(cmdNumber, filename);
                    TSOS.Control.hostDisk();
                    break;
                case "format":
                    this.FormatDisk();
                    TSOS.Control.hostDisk();
                    break;
                default:
                    _Kernel.krnTrace("Disk command unrecognized");
                    break;
            }
        };

        DeviceDriverDisk.prototype.CreateFile = function (cmdNum, filename) {
            filename = cmdNum.toString(16) + _DiskDrive.datCache[0] + " " + _DiskDrive.datCache[1] + _DiskDrive.datCache[2] + " " + filename + " -";
            _DiskDrive.datCache = (parseInt(_DiskDrive.datCache, 8) + 1).toString(8);
            if (_DiskDrive.dirBlocks > 0) {
                _DiskDrive.addToDisk(_DiskDrive.dirCache, filename);
                _DiskDrive.dirCache = "0" + (parseInt(_DiskDrive.dirCache, 8) + 1).toString(8);
                _DiskDrive.dirBlocks = _DiskDrive.dirBlocks - 1;
                return true;
            } else {
                return false;
            }
        };

        DeviceDriverDisk.prototype.WriteToDisk = function (cmdNum, data, filename) {
            var tsbSearch = "010";
            for (var i = 56; i > _DiskDrive.dirBlocks; i--) {
                var Hold = _DiskDrive.retrieveFromDisk(tsbSearch).split(" ");
                var localName = "";
                for (var j = Hold.length - 3; j > 1; j--) {
                    localName = Hold[j] + " " + localName;
                }
                if (localName === filename) {
                    var localTSB = parseInt(Hold[0][1] + Hold[1], 8).toString(8);
                    if (_DiskDrive.datBlocks - (data.length / 62) > 0) {
                        var i = 0;
                        var numDatBlocks = (data.length / 62);
                        while (i < numDatBlocks) {
                            _DiskDrive.datBlocks = _DiskDrive.datBlocks - 1;
                            var localDatCache = _DiskDrive.datCache;
                            _DiskDrive.datCache = (parseInt(_DiskDrive.datCache, 8) + 1).toString(8);
                            var localData = "";
                            var j = i * 62;
                            while (j < i * 62 + 61) {
                                if (cmdNum === 1) {
                                    if (j < data.length) {
                                        localData = localData + data[j].charCodeAt(0).toString(16) + " ";
                                        j = j + 1;
                                    } else {
                                        localData = localData + " -";
                                        j = i * 62 + 61;
                                    }
                                } else {
                                    if (j < data.length) {
                                        localData = localData + data[j] + " ";
                                        j = j + 1;
                                    } else {
                                        localData = localData + " -";
                                        j = i * 62 + 61;
                                    }
                                }
                            }
                            i = i + 1;
                            if (i > numDatBlocks) {
                                localData = cmdNum.toString(16) + "-" + " " + "-" + "-" + " " + localData;
                                _DiskDrive.addToDisk(localTSB, localData);
                            } else {
                                localData = cmdNum.toString(16) + localDatCache[0] + " " + localDatCache[1] + localDatCache[2] + " " + localData;
                                _DiskDrive.addToDisk(localTSB, localData);
                                localTSB = localDatCache;
                            }
                        }
                    } else {
                        return false;
                    }
                    return true;
                }
            }
        };

        DeviceDriverDisk.prototype.ReadToMemory = function (filename) {
            var tsbSearch = "010";
            for (var i = 56; i > _DiskDrive.dirBlocks; i--) {
                var Hold = _DiskDrive.retrieveFromDisk(tsbSearch).split(" ");
                var localName = "";
                for (var j = Hold.length - 3; j > 1; j--) {
                    localName = Hold[j] + " " + localName;
                }
                if (localName === filename && "3" === Hold[0][0]) {
                    tsbSearch = parseInt(Hold[0][1] + Hold[1], 8).toString(8);
                    var data1 = [];
                    data1[0] = _DiskDrive.retrieveFromDisk(tsbSearch).split(" ");
                    while (data1[data1.length - 1][0][1] != "-") {
                        tsbSearch = parseInt(data1[data1.length - 1][0][1] + data1[data1.length - 1][1], 8).toString(8);
                        data1[data1.length] = _DiskDrive.retrieveFromDisk(tsbSearch).split(" ");
                    }
                    var j = data1.length - 1;
                    var Hold2 = [];
                    while (j > -1) {
                        for (var k = 1; k < data1[j].length; k++) {
                            Hold2 = Hold2 + data1[j][k];
                        }
                        j = j - 1;
                    }
                    for (j = 0; j < Hold2.length; j++) {
                        _MMU.moveToAddr(j);
                        _MMU.storeToAddress(Hold2[j]);
                    }
                } else {
                    tsbSearch = "0" + (parseInt(tsbSearch, 8) + 1).toString(8);
                }
            }
        };

        DeviceDriverDisk.prototype.ReadFromDisk = function (filename) {
            var tsbSearch = "010";
            var buffer = "";
            for (var i = 56; i > _DiskDrive.dirBlocks; i--) {
                var Hold = _DiskDrive.retrieveFromDisk(tsbSearch).split(" ");
                var localName = "";
                for (var j = Hold.length - 3; j > 1; j--) {
                    localName = Hold[j] + " " + localName;
                }
                if (localName === filename) {
                    tsbSearch = parseInt(Hold[0][1] + Hold[1], 8).toString(8);
                    var data1 = [];
                    data1[0] = _DiskDrive.retrieveFromDisk(tsbSearch).split(" ");
                    while (data1[data1.length - 1][0][1] != "-") {
                        tsbSearch = parseInt(data1[data1.length - 1][0][1] + data1[data1.length - 1][1], 8).toString(8);
                        data1[data1.length] = _DiskDrive.retrieveFromDisk(tsbSearch).split(" ");
                    }
                    var j = data1.length - 1;
                    while (j > -1) {
                        for (var k = data1[j].length - 2; k > 1; k--)
                            if (data1[j][k].charAt(0) === "-") {
                                // exclude but check for file end.
                            } else {
                                buffer = String.fromCharCode(parseInt(data1[j][k], 16)) + buffer;
                            }
                        j = j - 1;
                    }
                } else {
                    tsbSearch = "0" + (parseInt(tsbSearch, 8) + 1).toString(8);
                }
            }

            return buffer;
        };

        DeviceDriverDisk.prototype.DeleteRecord = function (cmdNum, filename) {
            var tsbSearch = "010";
            for (var i = 56; i > _DiskDrive.dirBlocks; i--) {
                var Hold = _DiskDrive.retrieveFromDisk(tsbSearch).split(" ");
                var localName = "";
                for (var j = Hold.length - 3; j > 1; j--) {
                    localName = Hold[j] + " " + localName;
                }
                if (localName === filename && cmdNum.toString(16) === Hold[0][0]) {
                    var localTSB = parseInt(Hold[0][1] + Hold[1], 8).toString(8);
                    var data1 = [];
                    data1[0] = _DiskDrive.retrieveFromDisk(tsbSearch).split(" ");
                    while (data1[data1.length - 1][0][1] != "-") {
                        localTSB = parseInt(data1[data1.length - 1][0][1] + data1[data1.length - 1][1], 8).toString(8);
                        data1[data1.length] = _DiskDrive.retrieveFromDisk(localTSB).split(" ");
                    }
                    var j = data1.length - 2;
                    while (j > 0) {
                        localTSB = data1[j][0][1] + data1[j][1];
                        _DiskDrive.deleteFromDisk(localTSB);
                        _DiskDrive.datBlocks = _DiskDrive.datBlocks + 1;
                        j--;
                    }
                    localTSB = data1[0][0][1] + data1[0][1];
                    _DiskDrive.deleteFromDisk(localTSB);
                    _DiskDrive.datBlocks = _DiskDrive.datBlocks + 1;
                    _DiskDrive.datCache = localTSB;
                } else {
                    tsbSearch = "0" + (parseInt(tsbSearch, 8) + 1).toString(8);
                }
            }
            _DiskDrive.deleteFromDisk(tsbSearch);
            _DiskDrive.dirBlocks = _DiskDrive.dirBlocks + 1;
            _DiskDrive.dirCache = tsbSearch;

            return true;
        };

        DeviceDriverDisk.prototype.FormatDisk = function () {
            var tsbSearch = "";
            var t = 0;
            while (t < 4) {
                var s = 0;
                while (s < 8) {
                    var b = 0;
                    while (b < 8) {
                        if (t === 0 && s === 0 && b === 0) {
                            tsbSearch = "000";
                        } else if (t === 0 && s === 0) {
                            tsbSearch = "00" + b;
                        } else if (t === 0) {
                            tsbSearch = "0" + s + b;
                        } else {
                            tsbSearch = "" + t + s + b;
                        }
                        _DiskDrive.removeFromDisk(tsbSearch);
                        b = b + 1;
                    }
                    s = s + 1;
                }
                t = t + 1;
            }
            _DiskDrive.datBlocks = 192;
            _DiskDrive.dirBlocks = 56;
            _DiskDrive.datCache = "010";
            _DiskDrive.dirCache = "100";
            _DiskDrive.isFormatted = true;
        };

        DeviceDriverDisk.prototype.ListFiles = function () {
            var tsbSearch = "010";
            var strOut = "";
            if (_DiskDrive.dirBlocks === 56) {
                return "  no files";
            }
            for (var i = 56; i > _DiskDrive.dirBlocks; i--) {
                var localDirBlock = _DiskDrive.retrieveFromDisk(tsbSearch).split(" ");
                if (localDirBlock[0][0][0] === "1" || localDirBlock[0][0][0] === "2") {
                    for (var j = localDirBlock.length - 1; j > 1; j--) {
                        if (localDirBlock[j].charAt(0) === "-") {
                            strOut = " " + strOut;
                        }
                        strOut = String.fromCharCode(parseInt(localDirBlock[j], 16)) + strOut;
                    }
                }
                tsbSearch = "0" + (parseInt(tsbSearch, 8) + 1).toString(8);
            }
            return "  " + strOut;
        };
        return DeviceDriverDisk;
    })(TSOS.DeviceDriver);
    TSOS.DeviceDriverDisk = DeviceDriverDisk;
})(TSOS || (TSOS = {}));
