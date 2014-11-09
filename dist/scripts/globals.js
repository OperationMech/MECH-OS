/* ------------
Globals.ts
Global CONSTANTS and _Variables.
(Global over both the OS and Hardware Simulation / Host.)
This code references page numbers in the text book:
Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
------------ */
//
// Global "CONSTANTS" (There is currently no const or final or readonly type annotation in TypeScript.)
// TODO: Make a global object and use that instead of the "_" naming convention in the global namespace.
//
var APP_NAME = "MECH-OS";
var APP_VERSION = "0.16(007)";

var CPU_CLOCK_INTERVAL = 100;

var TIMER_IRQ = 0;

// NOTE: The timer is different from hardware/host clock pulses. Don't confuse these.
var KEYBOARD_IRQ = 1;

var CPU_IRQ = 2;

var MEM_IRQ = 3;

var SW_IRQ = 4;

//
// Global Variables
//
var _CPU;

var _OSclock = 0;

var _Mode = 0;

var _STEP = false;

var _EnableStepMode = false;

var _Canvas = null;
var _bCanvas = null;
var _DrawingContext = null;
var _bContext = null;
var _DefaultFontFamily = "system";
var _DefaultFontSize = 13;
var _FontHeightMargin = 4;
var _CpuArea = null;
var _MemoryArea = null;

var _Trace = true;

// The OS Kernel and its queues.
var _Kernel;
var _KernelInterruptQueue = null;
var _KernelBuffers = null;
var _KernelInputQueue = null;
var _ResidentQueue = null;
var _ReadyQueue = null;
var _TerminatedQueue = null;

// Standard input and output
var _StdIn = null;
var _StdOut = null;

// UI
var _Console;
var _OsShell;

// Memory
var _RamCapacity = 0x300;
var _RamBlock = 0x100;
var _MA;
var _MMU;

// Scheduler
var _SchedulerClockLimit = 6;
var _CurSchedulerClock = 0;

// Active Process control block
var _CurPCB = null;
var _PID = 1;

// At least this OS is not trying to kill you. (Yet.)
var _SarcasticMode = false;

// Global Device Driver Objects - page 12
var _krnKeyboardDriver = null;

var _hardwareClockID = null;

// For testing...
var _GLaDOS = null;
var Glados = null;

var onDocumentLoad = function () {
    TSOS.Control.hostInit();
};
