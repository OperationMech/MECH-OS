///<reference path="../globals.ts"/>

/*  ---------
    MemAlloc.ts

    Requires global.ts.

    Host memory accessor uses real ram size.
    --------- */
module TSOS {

    export class MemAlloc {

        constructor(private memory: TSOS.Memory) {

        }

        public init(): void {
            this.memory.init();
        }

        public clear(): void {
            this.memory.erase();
            this.memory.init();
        }

        public readLoc(pos): string {
            var retval = "0x100";
            if (pos > _RamCapacity || pos < 0x00) {
                return retval;
            }
            return this.memory.read(pos);
        }

        public writeLoc(pos, storeval: string): void {
            if(!this.memory.write(pos, storeval)) {
                _KernelInterruptQueue.enqueue(new Interrupt(MEM_IRQ, "(" + pos.toString() + " " + storeval +")"));
            }
        }

        public toString(): string[][] {
            var i = 0;
            var output = [];
            while(i < _RamCapacity % 16){
                var j = 0;
                while(j < 16){
                    output[i][j] = this.readLoc((i*16)+j).toString();
                    j = j + 1;
                }
                i = i + 1;
            }
            return output;
        }
    }
}
