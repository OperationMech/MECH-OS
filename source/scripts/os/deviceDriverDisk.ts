///<reference path="deviceDriver.ts" />

/* ----------------------------------
 DeviceDriverDisk.ts

 Requires deviceDriver.ts

 The Kernel Disk Device Driver.
 ---------------------------------- */
module TSOS {

    // Extends DeviceDriver
    export class DeviceDriverDisk extends DeviceDriver {

        constructor() {
            // Override the base method pointers.
            super(this.krnDiskDriverEntry, this.krnDiskDriverCommand);
        }

        public krnDiskDriverEntry() {
            // Init routine for disk drive
            this.status = _DiskDrive.testDiskDevice();

        }

        public krnDiskDriverCommand(params) {
            var cmdToExecute = params[0];
            var cmdNumber = params [1];
            var filename = params [2];
            var data = params[3];

            switch(cmdToExecute){
                case "read":
                    _StdOut.putText(this.ReadFromDisk(filename));
                    break;
                case "write":
                    _StdOut.putText("File Written: " + this.WriteToDisk(cmdNumber,data,filename).toString());
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


        }

        private WriteToDisk(cmdNum, data, filename = "._"): boolean {

            return true;
        }

        private ReadToMemory(): string {
            return "";
        }

        private ReadFromDisk(filename): string {
            var tsbSearch = "010";
            var Hold = _DiskDrive.retrieveFromDisk(tsbSearch).split(" ");
            var buffer = "";

            return buffer;
        }

        private DeleteRecord(filename): boolean {
            return true;
        }

        private FormatDisk(): boolean {
            return true;
        }

        private ListFiles(): string {
            var strOut = "";
            return strOut;
        }

    }
}