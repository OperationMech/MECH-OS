///<reference path="../globals.ts"/>

/* ---------
Pcb.ts

Requires global.ts.

Client Process control block object.
--------- */
module TSOS{
  export class Pcb {
      constructor(public Id: number = -1,
      public Pr: number = 8,
      public baseAddr: number = 0,
      public PC: number = 0,
      public Acc: number = 0,
      public Xreg: number = 0,
      public Yreg: number = 0,
      public Ireg: number = 0,
      public Zflag: number = 0,
      public onDisk: number = 0) {
    }

    public init(): void {
      this.Id = -1;
      this.Pr = 8;
      this.baseAddr = 0;
      this.PC = 0;
      this.Acc = 0;
      this.Xreg = 0;
      this.Yreg = 0;
      this.Ireg = 0;
      this.Zflag = 0;
      this.onDisk = 0;
    }

  public setPcbId(idNum): void {
    this.Id = idNum;
  }

   public getPcbId(): number {
      return this.Id;
   }

   public saveCpuState(): void {
       this.PC = _CPU.PC;
       this.Acc = _CPU.Acc;
       this.Xreg = _CPU.Xreg;
       this.Yreg = _CPU.Yreg;
       this.Ireg = _CPU.Ireg;
       this.Zflag = _CPU.Zflag;
   }

   public restoreCpuState(): void{
       _CPU.PC = this.PC;
       _CPU.Acc = this.Acc;
       _CPU.Xreg = this.Xreg;
       _CPU.Yreg = this.Yreg;
       _CPU.Ireg = this.Ireg;
       _CPU.Zflag = this.Zflag;
   }

   public getBaseAddress():any {
      if(this.onDisk){
        return ". _ " + this.Id.toString(16);
      } else {
        return this.baseAddr;
      }
   }
   public setBaseAddress(inBaseAddr): void {
       if(inBaseAddr < 0){
         this.onDisk = 1;
       } else {
         this.baseAddr = inBaseAddr;
       }
   }

    public toString(): string {
      var output = "PID: " + this.Id.toString() + " Priority: " + this.Pr.toString(16)
        + " BaseAddr: " + this.baseAddr.toString(16) + " PC: " + this.PC.toString(16)
        + " Acc: " + this.Acc.toString(16) + " Xreg: " + this.Xreg.toString(16)
        + " Yreg: " + this.Yreg.toString(16) + " IReg: " + this.Ireg.toString(16)
        + " Zflag: " + this.Zflag.toString(16) + " LimitAddr: "
        + (this.baseAddr + _RamBlock -1).toString(16) + " isOnDisk: " + this.onDisk.toString(16);
      return output;
    }
 }
}
