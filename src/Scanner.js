/**
 * 
 * Contains the scanning algorythm and represents a single
 * scanner DFA. It also handles symbol actions like DFA start, end and switch, newlines
 * and ignoring symbols.
 *
 * @param {string} name the Scanner name (the PTQ project name)
 *
 *
 *
 * @property {string} name the scanner name (project name)
 * @property {object} scanners maps SubScanner name -> SubScanner
 * @property {TerminalSymbol[]} arSymbolTable ordered array of symbols
 * @property {SubScanner} currentScanner the current SubScanner
 * @property {SubScanner} initialScanner the initial SubScanner
 * @property {SubScanner} initialScanner the initial SubScanner
 * @property {PushbackReader} source the source reader
 * @property {number} firstIgnoredIndex the index of the first symbol ignored by all of the SubScanners
 * @property {boolean} indenting (only for indentation driven scanners) true if the scanner is currently reading indenting tokens
 * @property {SubScanner[]} scannerStack the nested SubScanner stack
 * @property {Position} curPos the current Position
 * @property {Position} begPos the current token beginning Position
 * @property {number} level (only for indentation driven scanners) the current block indentation level
 * @property {number[]} levelStack (only for indentation driven scanners) a stack of nested blocks indentation levels
 * @property {TerminalNode[]} queue (only for indentation driven scanners) a queue of terminal nodes to be returned by the .scan() method
 * 
 * @constructor
 * @author Alessio Scalici
 */
var Scanner = function(name)  {

    this.name = name;
    this.scanners = {}; // FIXME USED?
    this.arSymbolTable = [];
    this.currentScanner = null;
    this.initialScanner = null;
    this.source = null;
    this.firstIgnoredIndex = -1;

    this.reset();
};


/** The first Position initial line, defaults to 1 */
Scanner.INITIAL_LINE = 1;

/** The first Position initial column, defaults to 1 */
Scanner.INITIAL_COL = 1;

/** The first Position initial index, defaults to 0 */
Scanner.INITIAL_POS = 0;



/**
 * Resets the parser to parse a new input string
 */
Scanner.prototype.reset = function() {

    this.curPos = new Position(Scanner.INITIAL_LINE, Scanner.INITIAL_COL, Scanner.INITIAL_POS);
    this.begPos = new Position(Scanner.INITIAL_LINE, Scanner.INITIAL_COL, Scanner.INITIAL_POS);

    this.scannerStack = [];
    this.source = null;
    this.currentScanner = this.initialScanner;

    if (this.indentBased) {
        this.indenting = true;
        this.level = 0;
        this.levelStack = [];
        this.queue = [];
    }
};


/**
 * Process indentation level before returning the recognized token
 * 
 */
Scanner.prototype.processLevel = function() {

    var me = this;
    var lastLevel = function(){
        return me.levelStack[me.levelStack.length-1];
    };


    if (this.levelStack.length === 0) {

        this.levelStack.push(this.level);

    } else {

        if (lastLevel() < this.level) {

            this.levelStack.push(this.level);
            this.queue.unshift(this.createBeginBlock());

        } else if (lastLevel() > this.level) {

            var prev = this.levelStack.pop();
            this.queue.unshift(this.createEndBlock());

            while (this.levelStack.length && lastLevel() > this.level) {
                prev = this.levelStack.pop();
                this.queue.unshift(this.createEndBlock());
                if (this.queue.length === 0) {
                    break;
                }
            }

            if ((this.queue.length !== 0 && lastLevel() !== this.level) || (this.levelStack.length === 0 && prev !== this.level)) {
                this.queue.unshift(this.createErrorBlock());
            }
        }
    }
};


/**
 * Close the pending opened blocks (at the end of input)
 */
Scanner.prototype.closePendingBlocks = function() {
    while (this.levelStack.length > 1) {
        this.levelStack.pop();
        this.queue.unshift(this.createEndBlock());
    }
};


/**
 * Create a special begin-block Terminal node (_BEGIN_)
 * 
 * @return {TerminalNode} a special begin-block Terminal node (_BEGIN_)
 */
Scanner.prototype.createBeginBlock = function() {
    return new TerminalNode(this.arSymbolTable[SpecialSymbol.BEGIN.code]);

};


/**
 * Create a special end-block Terminal node (_END_)
 * 
 * @return {TerminalNode} a special end-block Terminal node (_END_)
 */
Scanner.prototype.createEndBlock = function() {
    return new TerminalNode(this.arSymbolTable[SpecialSymbol.END.code]);
};


/**
 * Create a special indentation error Terminal node (_ERROR_)
 * 
 * @return {TerminalNode} a special indentation error Terminal node (_ERROR_)
 */
Scanner.prototype.createErrorBlock = function() {
    return new TerminalNode(this.arSymbolTable[SpecialSymbol.ERROR.code]);

};


/**
 * Recognizes the next token and returns the resulting TerminalNode.
 * If a lexical error occurs, returns an error token (TerminalNode whose .isError() method returns true).
 * If the stream is finished, return an end-of-stream token (TerminalNode whose .isEOS() method returns true).
 * 
 * @return {TerminalNode} the recognized token, or an error / EOS token
 */
Scanner.prototype.scan = function() {

    var res = null;

    do {

        if (this.indentBased) {

            if (this.queue.length === 0) {
                res = this.currentScanner.scan();
            }

            // during the scan, the queue could change!
            if (this.queue.length !== 0) {

                // TerminalNode
                var firstInQueue = this.queue.splice(0,1)[0];

                // Action
                var act = this.currentScanner.getAction(firstInQueue.symbol);

                if (act && (act.end || act.start || act.gotoTarget)) {
                    if (act.end) {
                        this.end();
                    }
                    if (act.start) {
                        this.begin(act.start);
                    }
                    if (act.gotoTarget) {
                        this.currentScanner = act.gotoTarget;
                    }

                    if (res) {// nulls last token

                        var data = res.data;
                        for (var i=0; i<data.length; ++i) {
                            this.source.unread(data.charCodeAt(i));
                        }
                        this.tokenReset();
                    }
                }
                else if (res) {// put token in queue

                    this.queue.push(res);
                }

                res = firstInQueue;
            }


        } else { // not indent based

            res = this.currentScanner.scan();

        }

    }
    while (!res);

    res.pos = this.begPos.clone();


    return res;
};


/**
 * Initializes the current Scanner
 *
 * @param {SubScanner[]} sSet the SubScanner set for this Scanner
 * @param {number} initial the initial SubScanner index
 * @param {TerminalSymbol[]} symbols the Scanner symbol table

 */
Scanner.prototype.init = function(sSet, initial, symbols) {

    this.arSymbolTable = symbols;

    // FIXME USED??? is it useful in the JS lib???
    this.firstIgnoredIndex = this.arSymbolTable.length;


    this.scanners = {};

    for (var i=0; i<sSet.length; ++i) {
        this.scanners[sSet[i].name] = sSet[i];
        sSet[i].parent = this;
    }
    this.initialScanner = this.scanners[initial];
    this.currentScanner = this.initialScanner;
};


/**
 * Returns the symbol given the name
 * 
 * @param {string} sName the symbol's name
 * @return {TerminalSymbol} the symbol given the name
 */
//FIXME find better method (no string)... USED???
Scanner.prototype.getSymbol = function(sName) {

    if (typeof sName === 'number') {
        return this.arSymbolTable[sName];
    }

    for (var i=0; i<this.arSymbolTable.length; ++i) {
        if (this.arSymbolTable[i].name === sName) {
            return this.arSymbolTable[i];
        }
    }

    throw "'" + sName + "' is not a symbol name";
};



/**
 * Starts a new nested SubScanner
 * 
 * @param {BaseSubScanner} ss the new nested SubScanner
 */
Scanner.prototype.begin = function(ss) {
    if (ss) {
        this.scannerStack.push(this.currentScanner);
        this.currentScanner = ss;
    }
};


/**
 * Terminates the current nested SubScanner and returns to the previous one.
 * If no SubScanner is in the stack (it wasn't started), returns
 */
Scanner.prototype.end = function() {
    if (!this.scannerStack.length) {
        return;
    }
    this.currentScanner = this.scannerStack.pop();
};


/**
 * Marks the token begin position
 */
Scanner.prototype.tokenBegin = function() {
    this.begPos = this.curPos.clone();
};


/**
 * Resets the current token position
 */
Scanner.prototype.tokenReset = function() {
    this.curPos = this.begPos.clone();
};


/**
 * Increase the current position
 * 
 * @param {number} amt the amount to increase the column number
 */
Scanner.prototype.newCol = function(amt) {
    this.curPos.col += amt;
    this.curPos.index += amt;
};


/**
 * Sets the input source string
 * 
 * @param {string} s the string containing the text to scan
 */
Scanner.prototype.setSource = function(s) {
    this.reset();
    this.source = new PushbackReader(s);
};


/**
 * Returns a partial symbol table, with just the
 * terminal symbols that are not ignored
 * 
 * @return {TerminalSymbol[]} a partial symbol table, with just the
 * terminal symbols that are not ignored
 */
// FIXME USED?
Scanner.prototype.getPublicSymbolTable = function() {
    return this.arSymbolTable.slice(0, this.firstIgnoredIndex);
};

/**
 * Returns the entire symbol table
 * 
 * @return {TerminalSymbol[]} the entire symbol table
 */
// FIXME USED?
Scanner.prototype.getInternalSymbolTable = function() {
    return this.arSymbolTable;
};