///<reference path="../globals.ts"/>

/*  ---------
 Disk.ts

 Requires global.ts.

 Host disk implementation.  Simulates a Physical Hard Drive.
 --------- */
module TSOS {

    export class Disk {

        constructor( private storage: WindowLocalStorage) {

        }

        public init () {
            this.storage.localStorage.clear();
        }

        public addToDisk(tsb , data) {
            this.storage.localStorage.setItem(tsb , data);
        }

        public removeFromDisk(tsb) {
            this.storage.localStorage.removeItem(tsb);
        }

        public retrieveFromDisk(tsb){
            this.storage.localStorage.getItem(tsb);
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