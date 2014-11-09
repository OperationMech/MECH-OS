///<reference path="../globals.ts"/>

/*  ---------
 Mmu.ts

 Requires global.ts.

 Client memory manager translates addresses with respect to the base register of the Program in use.
 --------- */
module TSOS {
    export class Mmu {

        constructor(private baseAddr = 0,
                    private address = 0,
                    private blocksInUse = 0){

        }

        public init(): void {
            this.baseAddr = 0;
            this.address  = 0;
            this.blocksInUse = 0;
        }

        public setBaseAddr(): void {
            this.baseAddr = (this.blocksInUse%3) * _RamBlock;
        }

        getBaseAddr(): number {
            return this.baseAddr;
        }

        public blockStored(): void {
            this.blocksInUse = this.blocksInUse + 1;
        }

        public blockReleased(): void {
            this.blocksInUse = this.blocksInUse - 1;
        }

        public valueOfAddress(): string {
           if(_MA.readLoc(this.address) === "0x100"){
               return "00";
           }
           return _MA.readLoc(this.address);
        }

        public storeToAddress(storeS: string): void {
            _MA.writeLoc(this.address, storeS);
        }

        public eraseMemory(): void{
            _MA.clear();
        }

        public moveToAddr(offset): void {
           if(offset >= _RamBlock)
           {
               _KernelInterruptQueue.enqueue(new Interrupt(CPU_IRQ, "Execution memory pool error."));
           } else {
               this.address = offset + this.baseAddr;
           }
        }
    }
}