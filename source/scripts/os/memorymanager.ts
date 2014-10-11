///<reference path="../globals.ts"/>

/*  ---------
 Mmu.ts

 Requires global.ts.

 Client memory manager translates addresses with respect to the base register of the Program in use.
 --------- */
module TSOS {
    export class Mmu {

        constructor(private baseAddr = 0,
                    private address = 0){

        }

        public init(): void {
            this.baseAddr = 0;
            this.address  = 0;
        }

        public setBaseAddr(addr): void {
            this.baseAddr = addr / 0x100;
        }

        public valueOfAddress(): string {
           if(_MA.readLoc(this.address + this.baseAddr) === "0x100"){
               return "00";
           }
           return _MA.readLoc(this.address + this.baseAddr);
        }

        public storeToAddress(storeS: string): void {
            _MA.writeLoc(this.address + this.baseAddr, storeS);
        }

        public eraseMemory(): void{
            _MA.clear();
        }

        public moveToAddr(offset): void {
           this.address = (offset % _RamBlock) + this.baseAddr;
        }
    }
}