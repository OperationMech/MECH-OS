///<reference path="../globals.ts"/>

/*  ---------
 Disk.ts

 Requires global.ts.

 Host disk implementation.  Simulates a Physical Hard Drive.
 --------- */
module TSOS {

    export class Disk {
        private storage = self.localStorage;
        public dirCache = "010";
        public datCache = "100";
        public dirBlocks = 56;
        public datBlocks = 192;
        constructor() {

        }

        public testDiskDevice(): string {
            return "loaded";
        }

        public init () {
            this.storage.clear();
        }

        public addToDisk(tsb , data): boolean {
            if(this.storage.getItem(tsb).split(" ")[0][0] > 0) {
                return false;
            } else {
                this.storage.setItem(tsb , data);
                return true;
            }

        }

        public deleteFromDisk(tsb) {
            var replaceData = this.storage.getItem(tsb);
            replaceData[0] = "0";
            this.storage.setItem(tsb,replaceData);
        }

        public removeFromDisk(tsb):boolean {
            if(this.storage.getItem(tsb).split(" ")[0][0] < 1){
                return false;
            } else if(this.storage.getItem(tsb) === null){
                this.storage.setItem(tsb, "0- -- -");
                return true;
            } else {
                _DiskDrive.deleteFromDisk(tsb);
                return true;
            }
        }

        public retrieveFromDisk(tsb): string{
            return this.storage.getItem(tsb);
        }

        public toString(): string {
            var strOut = "";
            var t = 0;
            while(t < 3) {
                var s = 0;
                while(s < 7) {
                    var b = 0;
                    while(b < 7) {
                        strOut = + strOut + t + s + b + " " +
                                 this.storage.getItem(""+ t + s + b) + "<br>" ;
                        b = b + 1;
                    }
                    s = s + 1;
                }
                t = t + 1;
            }
            return strOut;
        }
    }
}