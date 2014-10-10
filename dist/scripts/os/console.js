///<reference path="../globals.ts" />
/* ------------
Console.ts
Requires globals.ts
The OS Console - stdIn and stdOut by default.
Note: This is not the Shell.  The Shell is the "command line interface" (CLI) or interpreter for this console.
------------ */
var TSOS;
(function (TSOS) {
    var Console = (function () {
        function Console(currentFont, currentFontSize, currentXPosition, currentYPosition, buffer, cmdBufferPos, cmdBuffer, tabLoc) {
            if (typeof currentFont === "undefined") { currentFont = _DefaultFontFamily; }
            if (typeof currentFontSize === "undefined") { currentFontSize = _DefaultFontSize; }
            if (typeof currentXPosition === "undefined") { currentXPosition = 0; }
            if (typeof currentYPosition === "undefined") { currentYPosition = _DefaultFontSize; }
            if (typeof buffer === "undefined") { buffer = ""; }
            if (typeof cmdBufferPos === "undefined") { cmdBufferPos = 0; }
            if (typeof cmdBuffer === "undefined") { cmdBuffer = []; }
            if (typeof tabLoc === "undefined") { tabLoc = 0; }
            this.currentFont = currentFont;
            this.currentFontSize = currentFontSize;
            this.currentXPosition = currentXPosition;
            this.currentYPosition = currentYPosition;
            this.buffer = buffer;
            this.cmdBufferPos = cmdBufferPos;
            this.cmdBuffer = cmdBuffer;
            this.tabLoc = tabLoc;
        }
        Console.prototype.init = function () {
            this.clearScreen();
            this.resetXY();
        };

        Console.prototype.clearScreen = function () {
            _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
        };

        Console.prototype.scrollScreen = function () {
            var img = _DrawingContext.getImageData(0, _DefaultFontSize + _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) + _FontHeightMargin, _Canvas.width, _Canvas.height);
            this.clearScreen();
            _DrawingContext.putImageData(img, 0, 0);
        };

        Console.prototype.clearLine = function () {
            _DrawingContext.clearRect(0, this.currentYPosition - this.currentFontSize + _DrawingContext.fontDescent(this.currentFont, this.currentFontSize), _Canvas.width, this.currentYPosition);
            this.currentXPosition = 0;
        };

        Console.prototype.resetXY = function () {
            this.currentXPosition = 0;
            this.currentYPosition = this.currentFontSize;
        };

        Console.prototype.handleInput = function () {
            while (_KernelInputQueue.getSize() > 0) {
                // Get the next character from the kernel input queue.
                var chr = _KernelInputQueue.dequeue();

                // Retrieve previous entered commands.
                var pos = this.cmdBufferPos;
                var cmdBufferSize = this.cmdBuffer.length;
                if (chr === "↓" || chr === "↑") {
                    if (chr === "↑" && pos > 0) {
                        this.cmdBufferPos -= 1;
                        this.buffer = this.cmdBuffer[this.cmdBufferPos];
                        this.clearLine();
                        this.putText(">");
                        this.putText(this.buffer);
                    } else if (chr === "↓" && pos < cmdBufferSize) {
                        this.cmdBufferPos += 1;
                        this.buffer = this.cmdBuffer[this.cmdBufferPos];
                        this.clearLine();
                        this.putText(">");
                        this.putText(this.buffer);
                    } else {
                        this.buffer = this.cmdBuffer[this.cmdBufferPos];
                        this.clearLine();
                        this.putText(">");
                        this.putText(this.buffer);
                    }
                    // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).
                } else if (chr === String.fromCharCode(13)) {
                    // The enter key marks the end of a console command, so store the command then ...
                    if (this.buffer !== "") {
                        this.cmdBuffer[this.cmdBuffer.length] = this.buffer;
                        this.cmdBufferPos = this.cmdBuffer.length;
                    }

                    // ... tell the shell ...
                    _OsShell.handleInput(this.buffer);

                    // ... and reset our buffer.
                    this.buffer = "";
                } else if (chr === String.fromCharCode(9)) {
                    // The tab key is used to auto-insert a command.
                    // Check for 1 character in the buffer and command.
                    if (this.buffer.length > 0) {
                        var i = 0 + this.tabLoc;
                        while (i <= _OsShell.commandNames.length) {
                            var cmdbuffer = _OsShell.commandNames[i % _OsShell.commandNames.length];
                            if (this.buffer[0] === cmdbuffer[0]) {
                                this.buffer = cmdbuffer;
                                this.tabLoc = i + 1;
                                i = _OsShell.commandNames.length + 1;
                            } else if (i === _OsShell.commandNames.length - 1) {
                                this.tabLoc = (i + 1) % _OsShell.commandNames.length;
                                i = _OsShell.commandNames.length + 1;
                            } else {
                                i = i + 1;
                            }
                        }
                        this.clearLine();
                        this.putText(">");
                        this.putText(this.buffer);
                    }
                } else if (chr === String.fromCharCode(8)) {
                    // Backspace character which tells us to remove the previous key.
                    // Check if there is a command in the buffer
                    if (this.buffer.length > 0) {
                        this.removeText(this.buffer[this.buffer.length - 1]);

                        // remove from buffer
                        var newBuffer = "";
                        for (var i = 0; i < this.buffer.length - 1; i++) {
                            newBuffer += this.buffer[i];
                        }
                        this.buffer = newBuffer;
                    }
                } else {
                    // This is a "normal" character, so ...
                    // ... draw it on the screen...
                    this.putText(chr);

                    // ... and add it to our buffer.
                    this.buffer += chr;
                }
                // TODO: Write a case for Ctrl-C.
            }
        };

        Console.prototype.putText = function (text) {
            // My first inclination here was to write two functions: putChar() and putString().
            // Then I remembered that JavaScript is (sadly) untyped and it won't differentiate
            // between the two.  So rather than be like PHP and write two (or more) functions that
            // do the same thing, thereby encouraging confusion and decreasing readability, I
            // decided to write one function and use the term "text" to connote string or char.
            // UPDATE: Even though we are now working in TypeScript, char and string remain undistinguished.
            if (text !== "") {
                // Draw the text at the current X and Y coordinates.
                _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text);

                // Create a newline if an overflow is to occur
                if (text.length > 80) {
                    this.advanceLine();
                }

                // Move the current X position.
                var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
                this.currentXPosition = this.currentXPosition + offset;
            }
        };

        Console.prototype.removeText = function (text) {
            // Changed result of putText
            // UPDATE: Even though we are now working in TypeScript, char and string remain undistinguished.
            if (text !== "") {
                // Move current X position.
                var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
                this.currentXPosition = this.currentXPosition - offset;

                // Draw the text at the current X and Y coordinates.
                _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text, true);
            }
        };

        Console.prototype.advanceLine = function () {
            this.currentXPosition = 0;

            /*
            * Font size measures from the baseline to the highest point in the font.
            * Font descent measures from the baseline to the lowest point in the font.
            * Font height margin is extra spacing between the lines.
            */
            var descent = _DrawingContext.fontDescent(this.currentFont, this.currentFontSize);

            // TODO: Handle scrolling. (Project 1)
            // fixed this to make it actually scroll
            if (this.currentYPosition > 570) {
                this.scrollScreen();
            } else {
                this.currentYPosition += _DefaultFontSize + descent + _FontHeightMargin;
            }
        };
        return Console;
    })();
    TSOS.Console = Console;
})(TSOS || (TSOS = {}));
