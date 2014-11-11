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
                    private block0InUse = 0,
                    private block1InUse = 0,
                    private block2InUse = 0){

        }

        public init(): void {
            this.baseAddr = 0;
            this.address  = 0;
            this.block0InUse = 0;
            this.block1InUse = 0;
            this.block2InUse = 0;
        }

        public updateBaseAddr(addr): void {
            this.baseAddr = addr;
        }

        public getBaseAddr(): number {
            return this.baseAddr;
        }

        public blockStored(): void {
            if(!this.block0InUse) {
                this.block0InUse = 1;
                this.baseAddr = 0;
            } else if(!this.block1InUse) {
                this.block1InUse = 1;
                this.baseAddr = 0x100;
            } else if(!this.block2InUse) {
                this.block2InUse = 1;
                this.baseAddr = 0x200;
            } else {
                // call disk IRQ and create swap file
            }
        }

        public blockReleased(addr): void {
            if(addr === 0x000){
                this.block0InUse = 0;
            } else if(addr === 0x100) {
                this.block1InUse = 0;
            } else if(addr === 0x200) {
                this.block2InUse = 0;
            } else {
              // extra case?
            }
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

        public eraseBlock(): void {
            for(var i = 0 + this.baseAddr; i < this.baseAddr +_RamBlock; i++){
                _MA.writeLoc(i,"00");
            }
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