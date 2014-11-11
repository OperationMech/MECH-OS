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
                    private block0InUse = false,
                    private block1InUse = false,
                    private block2InUse = false){

        }

        public init(): void {
            this.baseAddr = 0;
            this.address  = 0;
            this.block0InUse = false;
            this.block1InUse = false;
            this.block2InUse = false;
        }

        public updateBaseAddr(addr): void {
            this.baseAddr = addr;
        }

        public getBaseAddr(): number {
            return this.baseAddr;
        }

        public blockStored(): void {
            if(!this.block0InUse) {
                this.block0InUse = true;
                this.baseAddr = 0;
            } else if(!this.block1InUse) {
                this.block1InUse = true;
                this.baseAddr = 0x100;
            } else if(!this.block2InUse) {
                this.block2InUse = true;
                this.baseAddr = 0x200;
            } else {
                // call disk IRQ and create swap file
            }
        }

        public blockReleased(addr): void {
            if(addr === 0x000){
                this.block0InUse = false;
            } else if(addr === 0x100) {
                this.block1InUse = false;
            } else if(addr === 0x200) {
                this.block2InUse = false;
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