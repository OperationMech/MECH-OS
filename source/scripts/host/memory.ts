///<reference path="../globals.ts"/>

/*  ---------
    Memory.ts

    Requires global.ts.

    Host memory implementation.  Simulates Physical RAM.
    --------- */
module TSOS {

    export class Memory {

        constructor(public mem : any = null){
        }

        public init(): void {
            while (this.mem.length < _RamCapacity){
                this.mem[this.mem.length] = parseInt("0",16);
            }
        }

        public read(loc): number {
            var retval = 0x100;
            if (parseInt(loc, 16) > _RamCapacity || parseInt(loc, 16) < 0x00) {
                return retval;
            }
            retval = this.mem[parseInt(loc, 16)];
            return retval;
        }

        public write(loc, value): boolean {
            if(parseInt(loc, 16) > _RamCapacity || parseInt(loc, 16) < 0x00) {
                return false;
            }
            this.mem[parseInt(loc,16)] = value;
            return true;
        }
    }
}
