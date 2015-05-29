/**
 * 
 * Contains the scanning algorythm and represents a single
 * scanner DFA. It also handles symbol actions like DFA start, end and switch, newlines
 * and ignoring symbols.
 *
 * @param {string} sName the name of SubScanner in the scanner specification
 * @param {State} oRootState the SubScanner initial state
 *
 *
 * @property {string} name the SubScanner name
 * @property {State} initialState the SubScanner initial state
 * @property {Scanner} parent the parent Scanner
 * @property {object} actions maps terminal symbol -> action
 * @property {number} tokenLength the current recognized token length 
 * 
 * 
 * @constructor
 * @author Alessio Scalici
 */
var SubScanner = function(sName, oRootState) {

    this.name = sName;
    this.initialState = oRootState;
    this.parent = null;
    this.actions = {};
    this.tokenLength = 0;

};


/**
 * Returns the action object associated with the specified symbol, if it
 * doesn't exist, it will be created before returning it
 * 
 * @param {TerminalSymbol} sym the teminal symbol
 * 
 * @return {Action} the action object associated with the specified symbol
 */
SubScanner.prototype.upsertAction = function(sym) {

    var act = this.actions[sym.name];

    if (!act) {
        act = new Action(sym);
        this.actions[sym.name] = act;
    }
    return act;
};


/**
 * Returns the Action object if this sub-scanner executes actions at the given symbol recognition,
 * null otherwise
 * 
 * @param {TerminalSymbol} sym the symbol
 * 
 * @return {Action} the Action object if this sub-scanner executes actions at the given symbol recognition,
 * null otherwise
 */
SubScanner.prototype.getAction = function(sym) {
    return this.actions[sym.name] || null;
};

/**
 * Sets an action for this sub-scanner. The related object is contained in the Action object
 * passed as argument
 * 
 * @param {Action} a the Action object
 */
SubScanner.prototype.setAction = function(a) {
    this.actions[a.symbol.name] = a;
};


/**
 * Returns the next state given the current state and an input.
 * If no state can be reached for this input, returns null
 * 
 * @param {State} curState the current DFA state
 * @param {number} cp the input code point
 * 
 * @return {State} the next state if the input is accepted, null otherwise
 */
SubScanner.prototype.nextState = function(curState, cp)
{
    for (var i=0; i<curState.edges.length; ++i) {
        if (curState.edges[i].accepts(cp)) {
            return curState.edges[i].targetState;
        }
    }
    return null;
};


/**
 * Recognizes the next token. If the recognized token has to be ignored
 * returns null, otherwise returns the token node. If a lexical error occurs, returns
 * the special error token.
 * 
 * @return {TerminalNode} the next token, null if the token has to be ignored, the special error token
 * if a lexical error occurs
 */
SubScanner.prototype.scan = function() {
    if (!this.parent) {
        throw ("parent cannot be null");
    }


    var res = null,     // TerminalNode
        dataIndex = 0,  // number
        curState = this.initialState, // State
        acceptedSymbol = this.parent.getSymbol(SpecialSymbol.ERROR.code), // TerminalSymbol
        // INDENT DELTA
        newlineFlag
        // INDENT DELTA END
        ;

    // INDENT DELTA
    if (this.indentBased) {
        newlineFlag = false;
    }
    // INDENT DELTA END

    this.parent.tokenBegin();


    // read the next character
    var prevChar = -1, // number
        curChar = this.parent.source.read();  // number // FIXME read() = parent.read()


    // check if there's no more characters in the stream
    if (!curChar) {

        // INDENT DELTA
        if (this.indentBased) {
            this.parent.closePendingBlocks();
        }
        // INDENT DELTA END

        res = new TerminalNode(this.parent.getSymbol(SpecialSymbol.EOS.code));
        res.data = '';
        return res;
    }

    while (curChar) {

        ++this.tokenLength;

        var next = this.nextState(curState, curChar); // State
        if (!next) {
            break; // exit loop
        } else {
            curState = next;
            if (curState.isFinal()) {
                // update token data
                this.parent.newCol(this.tokenLength - dataIndex);
                dataIndex = this.tokenLength;
                acceptedSymbol = curState.acceptedSymbol;
            }
        }

        // unicode newline
        if (curChar === 0xA || curChar === 0xD || curChar === 0xC || curChar === 0xB || curChar === 0x85 || curChar === 0x2028 || curChar === 0x2029)
        {
            if (!(prevChar === 0xD && curChar === 0xA)) {
                ++this.parent.curPos.line;
            }
            this.parent.curPos.col = Scanner.INITIAL_COL;

            // INDENT DELTA
            if (this.indentBased) {
                this.parent.indenting = true;
                newlineFlag = true;
            }
            // INDENT DELTA END
        }

        prevChar = curChar;
        curChar = this.parent.source.read(); // FIXME read() = parent.read()

    }// end for


    // retrieve action for this symbol
    var act = this.actions[acceptedSymbol.name];


    // INDENT DELTA
    if (this.indentBased && this.parent.indenting) {
        if (act && act.indent) {
            this.parent.level += dataIndex;
        } else  {
            if (!newlineFlag) {
                this.parent.processLevel();

                this.parent.indenting = false;
            }
            this.parent.level = 0;
        }
    }
    // INDENT DELTA END


    // action handling
    if(act)
    {
        if (act.pushback && (act.gotoTarget || act.start || act.end))
        {
            this.parent.source.unread(this.tokenLength);
            this.tokenLength = 0;

            this.parent.tokenReset();
            res = null; // ignore token
        } else {
            res = new TerminalNode(acceptedSymbol);
        }

        if (act.end) {
            this.parent.end();
        }
        if (act.start) {
            this.parent.begin(act.start);
        }
        if (act.gotoTarget) {
            this.parent.currentScanner = act.gotoTarget;
        }
    } else {
        res = new TerminalNode(acceptedSymbol);
    }


    if (res)
    {
        if (acceptedSymbol.index === SpecialSymbol.ERROR.code) {
            // unread the this.buffer data
            this.parent.source.unread(this.tokenLength);
            this.tokenLength = 0;

            this.parent.tokenReset();

            this.parent.newCol(1);
            res.data = String.fromCharCode(this.parent.source.read()); // FIXME read() = parent.read()
        } else  {
            // non error

            var n = this.tokenLength - dataIndex;
            this.parent.source.unread(n);
            this.tokenLength -= n; //pops last n elements from the 'buffer'

            res = new TerminalNode(acceptedSymbol);

            res.data = this.parent.source.lastString(this.tokenLength);
            
        }
    }

    this.tokenLength = 0;

    if (act && act.ignore) {
        return null; // ignore token
    }

    return res;
};