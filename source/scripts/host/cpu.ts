///<reference path="../globals.ts" />

/* ------------
     CPU.ts

     Requires global.ts.

     Routines for the host CPU simulation, NOT for the OS itself.
     In this manner, it's A LITTLE BIT like a hypervisor,
     in that the Document environment inside a browser is the "bare metal" (so to speak) for which we write code
     that hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using
     TypeScript/JavaScript in both the host and client environments.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

module TSOS {

    export class Cpu {

        constructor(public PC: number = 0,
                    public Acc: number = 0,
                    public Xreg: number = 0,
                    public Yreg: number = 0,
                    public Ireg: number = 0,
                    public Zflag: number = 0,
                    public isExecuting: boolean = false) {

        }

        public init(): void {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Ireg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
        }

        public fetch(): void {
            _MMU.moveToAddr(this.PC);
            this.Ireg = parseInt(_MMU.valueOfAddress(), 16);
            this.PC = this.PC + 1;
        }

        public decodeAndExecIns(): void {
            switch(this.Ireg) {
                case 0xA9:
                    _MMU.moveToAddr(this.PC);
                    this.Acc = parseInt(_MMU.valueOfAddress(), 16);
                    this.PC = this.PC + 1;
                    break;
                case 0xAD:
                    var memloc = "0000";
                    _MMU.moveToAddr(this.PC + 1);
                    memloc = _MMU.valueOfAddress();
                    _MMU.moveToAddr(this.PC);
                    memloc = memloc + _MMU.valueOfAddress();
                    _MMU.moveToAddr(parseInt(memloc, 16));
                    this.Acc = parseInt(_MMU.valueOfAddress(), 16);
                    this.PC = this.PC + 2;
                    break;
                case 0x8D:
                    var memloc = "0000";
                    _MMU.moveToAddr(this.PC + 1);
                    memloc = _MMU.valueOfAddress();
                    _MMU.moveToAddr(this.PC);
                    memloc = memloc + _MMU.valueOfAddress();
                    _MMU.moveToAddr(parseInt(memloc, 16));
                    _MMU.storeToAddress(this.Acc.toString(16));
                    this.PC = this.PC + 2;
                    break;
                case 0x6D:
                    var memloc = "0000";
                    _MMU.moveToAddr(this.PC + 1);
                    memloc = _MMU.valueOfAddress();
                    _MMU.moveToAddr(this.PC);
                    memloc = memloc + _MMU.valueOfAddress();
                    _MMU.moveToAddr(parseInt(memloc, 16));
                    this.Acc = this.Acc + parseInt(_MMU.valueOfAddress(), 16);
                    this.PC = this.PC + 2;
                    break;
                case 0xA2:
                    _MMU.moveToAddr(this.PC);
                    this.Xreg = parseInt(_MMU.valueOfAddress(), 16);
                    this.PC = this.PC + 1;
                    break;
                case 0xAE:
                    var memloc = "0000";
                    _MMU.moveToAddr(this.PC + 1);
                    memloc = _MMU.valueOfAddress();
                    _MMU.moveToAddr(this.PC);
                    memloc = memloc + _MMU.valueOfAddress();
                    _MMU.moveToAddr(parseInt(memloc, 16));
                    this.Xreg = parseInt(_MMU.valueOfAddress(), 16);
                    this.PC = this.PC + 2;
                    break;
                case 0xA0:
                    _MMU.moveToAddr(this.PC);
                    this.Yreg = parseInt(_MMU.valueOfAddress(), 16);
                    this.PC = this.PC + 1;
                    break;
                case 0xAC:
                    var memloc = "0000";
                    _MMU.moveToAddr(this.PC + 1);
                    memloc = _MMU.valueOfAddress();
                    _MMU.moveToAddr(this.PC);
                    memloc = memloc + _MMU.valueOfAddress();
                    _MMU.moveToAddr(parseInt(memloc, 16));
                    this.Yreg = parseInt(_MMU.valueOfAddress(), 16);
                    this.PC = this.PC + 2;
                    break;
                case 0xEA:
                    break;
                case 0x00:
                    this.isExecuting = false;
                    _CurPCB.saveCpuState();
                    break;
                case 0xEC:
                    var memloc = "0000";
                    _MMU.moveToAddr(this.PC + 1);
                    memloc = _MMU.valueOfAddress();
                    _MMU.moveToAddr(this.PC);
                    memloc = memloc + _MMU.valueOfAddress();
                    _MMU.moveToAddr(parseInt(memloc, 16));
                    if (this.Xreg === parseInt(_MMU.valueOfAddress(), 16)) {
                        this.Zflag = 1;
                    } else {
                        this.Zflag = 0;
                    }
                    this.PC = this.PC + 2;
                    break;
                case 0xD0:
                    if (this.Zflag === 0) {
                        _MMU.moveToAddr(this.PC);
                        this.PC = (this.PC + 1 + parseInt(_MMU.valueOfAddress(), 16)) % (_RamBlock);
                    } else {
                        this.PC = this.PC + 1;
                    }
                    break;
                case 0xEE:
                    var memloc = "0000";
                    _MMU.moveToAddr(this.PC + 1);
                    memloc = _MMU.valueOfAddress();
                    _MMU.moveToAddr(this.PC);
                    memloc = memloc + _MMU.valueOfAddress();
                    _MMU.moveToAddr(parseInt(memloc,16));
                    _MMU.storeToAddress((parseInt(_MMU.valueOfAddress(),16) + 1 ).toString(16));
                    this.PC = this.PC + 2;
                    break;
                case 0xFF:
                    _KernelInterruptQueue.enqueue(new Interrupt(SW_IRQ,"software syscall"));
                    break;
                default:
                    _KernelInterruptQueue.enqueue(new Interrupt(CPU_IRQ,"Unknown instruction: "
                                                                        + this.Ireg.toString(16)+"."));
            }
        }

        public cycle(): void {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
            if(this.isExecuting) {
                this.fetch();
                this.decodeAndExecIns();
                if(!this.isExecuting) {
                    _TerminatedQueue.enqueue(_CurPCB);
                    _MMU.blockReleased(_CurPCB.getBaseAddress());
                    _CurSchedulerClock = 0;
                    Control.hostPCB();
                    _KernelInterruptQueue.enqueue(new Interrupt(TIMER_IRQ,"Scheduler check"));
                }
            }
        }
    }
}
