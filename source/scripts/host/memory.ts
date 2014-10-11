///<reference path="../globals.ts"/>

/*  ---------
    Memory.ts

    Requires global.ts.

    Host memory implementation.  Simulates Physical RAM.
    --------- */
module TSOS {

    export class Memory {

        constructor(private mem = []) {

        }

        public erase(): void {
            this.mem = [];
        }

        public init(): void {
            while (this.mem.length < _RamCapacity) {
                this.mem[this.mem.length] = "00"
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
