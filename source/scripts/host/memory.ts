///<reference path="../globals.ts"/>

/*  ---------
    Memory.ts

    Requires global.ts.

    Host memory implementation.  Simulates Physical RAM.
    --------- */
module TSOS {

    export class Memory {

        constructor(private mem: string[] = null) {

        }

        public erase(): void {
            this.mem = null;
        }

        public init(): void {
            while (this.mem.length < _RamCapacity) {
                this.mem[this.mem.length] = parseInt("0x00",16).toString();
            }
        }

        public read(loc): string {
            return this.mem[loc];
        }

        public write(loc, value: string): boolean {
            if(loc > _RamCapacity || loc < 0x00) {
                return false;
            }
            this.mem[loc] = value;
            return true;
        }
    }
}
