///<reference path="../globals.ts"/>

/*  ---------
 Pcb.ts

 Requires global.ts.

 Client Process control block object.
 --------- */
module TSOS{
    export class Pcb {

        constructor(public Id: number       = 1,
                    public baseAddr: number = 0,
                    public PC:   number     = 0,
                    public Acc:  number     = 0,
                    public Xreg: number     = 0,
                    public Yreg: number     = 0,
                    public Ireg: number     = 0,
                    public Zflag: number    = 1) {

        }

        public init(): void {
            this.Id       = 1;
            this.baseAddr = 0;
            this.PC       = 0;
            this.Acc      = 0;
            this.Xreg     = 0;
            this.Yreg     = 0;
            this.Ireg     = 0;
            this.Zflag    = 1;
        }

        public setPcbId(idNum): void {
            this.Id = idNum;
        }

        public getPcbId(): number {
            return this.Id;
        }

        public saveCpuState(): void {
            this.PC    = _CPU.PC;
            this.Acc   = _CPU.Acc;
            this.Xreg  = _CPU.Xreg;
            this.Yreg  = _CPU.Yreg;
            this.Ireg  = _CPU.Ireg;
            this.Zflag = _CPU.Zflag;
    }

        public restoreCpuState(): void{
            _CPU.PC    = this.PC;
            _CPU.Acc   = this.Acc;
            _CPU.Xreg  = this.Xreg;
            _CPU.Yreg  = this.Yreg;
            _CPU.Ireg  = this.Ireg;
            _CPU.Zflag = this.Zflag;
        }

        public getBaseAddress(): number {
            return this.baseAddr;
        }

        public setBaseAddress(inBaseAddr): void {
            this.baseAddr = inBaseAddr;
        }

        public toString(): string {
            var output = "PID: " + this.Id.toString() + " BaseAddress: " + this.baseAddr.toString(16)
                        + " ProgramCounter: " + this.PC.toString(16) + " Accumulator: " + this.Acc.toString(16)
                        + " Xregister: " + this.Xreg.toString(16) + " Yregister: " + this.Yreg.toString(16)
                        + " InstructionRegister: " + this.Ireg.toString(16) + " Zflag: " + this.Zflag.toString(16);
            return output;
        }
    }
}