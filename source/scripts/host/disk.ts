///<reference path="../globals.ts"/>

/*  ---------
 Disk.ts

 Requires global.ts.

 Host disk implementation.  Simulates a Physical Hard Drive.
 --------- */
module TSOS {

    export class Disk {

        constructor( private storage: WindowLocalStorage,
                     public dirCache = "010",
                     public datCache = "100",
                     public dirBlocks = 56,
                     public datBlocks = 192) {

        }

        public testDiskDevice(): string {
            return "loaded";
        }

        public init () {
            this.storage.localStorage.clear();
        }

        public addToDisk(tsb , data): boolean {
            if(this.storage.localStorage.getItem(tsb).split(" ")[0][0] > 1) {
                return false;
            } else {
                this.storage.localStorage.setItem(tsb , data);
                return true;
            }

        }

        public removeFromDisk(tsb):boolean {
            if(this.storage.localStorage.getItem(tsb).split(" ")[0][0] < 1){
                return false;
            } else {
                this.storage.localStorage.removeItem(tsb);
                return true;
            }
        }

        public retrieveFromDisk(tsb): string{
            return this.storage.localStorage.getItem(tsb);
        }

        public toString(): string {
            var strOut = "";
            var t = 0;
            while(t < 3) {
                var s = 0;
                while(s < 7) {
                    var b = 0;
                    while(b < 7) {
                        strOut = t + s + b + " " +
                                 this.storage.localStorage.getItem(""+ t + s + b) + "\n" + strOut;
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