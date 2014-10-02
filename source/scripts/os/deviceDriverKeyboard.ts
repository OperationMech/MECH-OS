///<reference path="deviceDriver.ts" />

/* ----------------------------------
   DeviceDriverKeyboard.ts

   Requires deviceDriver.ts

   The Kernel Keyboard Device Driver.
   ---------------------------------- */

module TSOS {

    // Extends DeviceDriver
    export class DeviceDriverKeyboard extends DeviceDriver {

        constructor() {
            // Override the base method pointers.
            super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
        }

        public krnKbdDriverEntry() {
            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
            this.status = "loaded";
            // More?
        }

        public krnKbdDispatchKeyPress(params) {
            // Parse the params.    TODO: Check that they are valid and osTrapError if not.
            var keyCode = params[0];
            var isShifted = params[1];
            _Kernel.krnTrace("Key code:" + keyCode + " shifted:" + isShifted);
            var chr = "";
            // Check to see if caps was pressed.
            if (keyCode == 20 && (this.status !== "capsOn")) {
                this.status = "capsOn";
            } else if (keyCode == 20 && (this.status === "capsOn")){
                this.status = "loaded";
            }
            // Check to see if we even want to deal with the key that was pressed.
            if (((keyCode >= 65) && (keyCode <= 90)) ||   // A..Z
                ((keyCode >= 97) && (keyCode <= 123))) {  // a..z {
                // Determine the character we want to display.
                // Assume it's lowercase...
                chr = String.fromCharCode(keyCode + 32);
                // ... then check the shift and caps key and re-adjust if necessary.
                if ((isShifted && (this.status !== "capsOn")) || (!isShifted && (this.status === "capsOn"))) {
                    chr = String.fromCharCode(keyCode);
                }
                // TODO: Check for caps-lock and handle as shifted if so.
                _KernelInputQueue.enqueue(chr);
            } else if (((keyCode >= 219) && (keyCode <= 222))||   // open brace, backslash, close brace, single quote
                       ((keyCode >=  48) && (keyCode <= 57)) ||   // digits
                       ((keyCode >= 190) && (keyCode <= 192))||   // period, forward slash, tilde
                        (keyCode == 188)                     ||   // comma
                        (keyCode == 173)                     ||   // dash
                        (keyCode ==  61)                     ||   // equal
                        (keyCode ==  59)                     ||   // semicolon
                        (keyCode ==  38)                     ||   // up arrow
                        (keyCode ==  40)                     ||   // down arrow
                        (keyCode ==  32)                     ||   // space
                        (keyCode ==  13)                     ||   // enter
                        (keyCode ==   8)                     ||   // backspace
                        (keyCode ==   9)) {                       // tab
                if(isShifted) {
                    switch(keyCode){
                      case 48:
                        chr = ")";
                        break;
                      case 49:
                        chr = "!";
                        break;
                      case 50:
                        chr = "@";
                        break;
                      case 51:
                        chr = "#";
                        break;
                      case 52:
                        chr = "$";
                        break;
                      case 53:
                        chr = "%";
                        break;
                      case 54:
                        chr = "^";
                        break;
                      case 55:
                        chr = "&";
                        break;
                      case 56:
                        chr = "*";
                        break;
                      case 57:
                        chr = "(";
                        break;
                      case 59:
                        chr = ":";
                        break;
                      case 61:
                        chr = "+";
                        break;
                      case 173:
                        chr = "_";
                        break;
                      case 188:
                        chr = "<";
                        break;
                      case 190:
                        chr = ">";
                        break;
                      case 191:
                        chr = "?";
                        break;
                      case 192:
                        chr = "~";
                        break;
                      case 219:
                        chr = "{";
                        break;
                      case 220:
                        chr = "|";
                        break;
                      case 221:
                        chr = "}";
                        break;
                      case 222:
                        chr = "\"";
                        break;
                      default:
                        chr = String.fromCharCode(keyCode);
                        break;
                    }
                } else {
                    if(keyCode == 38){
                        chr = "↑";
                    }else if(keyCode == 40) {
                        chr = "↓";
                    }else if(keyCode == 222) {
                        chr = "'";
                    } else {
                        chr = String.fromCharCode(keyCode);
                    }
                }
                _KernelInputQueue.enqueue(chr);
            }
        }
    }
}
