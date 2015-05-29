/**
 * 
 * An implementation of a LR1 parser.
 * It uses an action-goto table and a stack to implement the recognition
 * automaton. It can recognize LR1 grammars and build a parse tree
 *
 * @param {LRAction[]} lrTable the action-goto table (square matrix, LRAction[][])
 * @param {GrammarRule[]} ruleTable the grammar rule table
 * @param {Symbol[]} symbolTable the symbol table
 * @param {number} startIndex the root symbol index
 * @param {Scanner} scanner the source scanner
 *
 *
 * @property {LRAction[]} lrTable the action-goto table (square matrix, LRAction[][])
 * @property {GrammarRule[]} ruleTable the grammar rule table
 * @property {Symbol[]} symbolTable the symbol table
 * @property {number} startIndex the root symbol index
 * @property {Scanner} scanner the source scanner
 * @property {TerminalNode|NonTerminalNode[]} curNodeStack the current node stack, used during the parsing
 * @property {number[]} stateStack the stack of DFA state indexes used during the LR1 parsing
 * @property {string} name the parser name (the PTQ project name)
 * @property {ErrorReport} the error report. It is populated only when an error occurs during the parsing
 * 
 * 
 * @constructor
 * @author Alessio Scalici
 */
var Parser = function(lrTable, ruleTable, symbolTable, startIndex, scanner)  {
    this.lrTable = lrTable;             // the action-goto table
    this.ruleTable = ruleTable;         // the rule table
    this.symbolTable = symbolTable;     // the symbol table
    this.startIndex = startIndex;       // the start symbol index
    this.scanner = scanner;             // the source scanner

    this.curNodeStack = [];

    this.stateStack = [];
    this.stateStack.push(SpecialSymbol.EOS.code);

    this.name = scanner.name;
    
    this.reset();
};


/** Returned by the reduce() method if there are still rules to be reduced */
Parser.READY = 0;

/** Returned by the reduce() method if the input is accepted (the start rule is been reduced) */
Parser.ACCEPT = 1;

/** Returned by the reduce() method if an error occurred */
Parser.ERROR = 2;



/**
 * Resets the parser and the source scanner
 */
Parser.prototype.reset = function () {
    this.curNodeStack = [];
    this.stateStack = [];
    this.stateStack.push(SpecialSymbol.EOS.code);

    this.error = null;
    this.scanner.reset();

    this.tok = null;
};


/**
 * Returns the parse tree root node, or null if an encoding/lexical/syntax error occurred
 *
 * @param {string} [input] the source input. If not passed, the input set with the setSource() method is used.
 * 
 * @return {NonTerminalNode} the parse tree root node, or null if an encoding/lexical/syntax error occurred
 */
Parser.prototype.parse = function (input) {

    if (input) {
        this.reset();
        this.scanner.setSource(input);
    }

    if (!this.scanner.source) {
        throw 'Parser: source not set';
    }

    var rr;
    do {
        rr = this.reduce();

    } while (rr === Parser.READY);

    if (rr === Parser.ACCEPT) {
        return this.curNodeStack[0];
    }
    return null;
};


/**
 * Returns the current node (last reduced rule), if the parser is in accept state returns the root parse tree node
 * 
 * @return {NonTerminalNode} the current node (last reduced rule), if the parser is in accept state returns the root parse tree node
 */
Parser.prototype.getCurrentNode = function () {
    if (!this.curNodeStack) {
        return null;
    }
    return this.curNodeStack[this.curNodeStack.length - 1];
};


/**
 * Parse the input text until the next rule is reduced
 * 
 * @return {number} the result of the reduction. Can be Parser.READY (0), Parser.ACCEPT (1), Parser.ERROR (2)
 */
Parser.prototype.reduce = function() {
    if (!this.scanner.source) {
        throw 'Parser: source not set';
    }

    var me = this;
    var stateStackPeek = function() {
            return me.stateStack[me.stateStack.length - 1];
        },
        createSyntaxError = function() {
            var map = GrammarProcessor.processFirstSets(me.ruleTable, me.symbolTable);
            var set = {};
            var state = stateStackPeek();
            for (var i = 0; i < me.lrTable[state].length; ++i) {
                if (me.lrTable[state][i] && me.lrTable[state][i].type !== LRActionType.NONE) {
                    var symbols = map[me.symbolTable[i].index]; // FIXME maybe just map[i] ?
                    for (var j = 0; j < symbols.length; ++j) {
                        set[symbols[j].index] = symbols[j];
                    }
                }
            }
            var arr = [];
            for (var k in set) {
                if (set.hasOwnProperty(k)) {
                    arr.push(set[k]);
                }
            }
            return new ErrorReport(ErrorType.SYNTAX_ERROR, me.tok, arr);
        };

    //this.tok = null;
    while (true) {
        if (this.tok === null) {
            this.tok = this.scanner.scan();
        }

        if (this.tok.symbol.index === SpecialSymbol.ERROR.code) {
            this.error = new ErrorReport(ErrorType.LEXICAL_ERROR, this.tok);
            return Parser.ERROR;
        }

        var act = this.lrTable[stateStackPeek()][this.tok.symbol.index];
        if (!act) {
            this.error = createSyntaxError();
            return Parser.ERROR;
        }
        switch (act.type)
        {
            case LRActionType.SHIFT:

                this.stateStack.push(act.targetIndex);

                this.curNodeStack.push(this.tok);

                this.tok = null;
                break;
            case LRActionType.REDUCE:

                var rule = this.ruleTable[act.targetIndex],
                    state = 0;

                var nt = new NonTerminalNode(rule);
                for (var i=0; i<rule.tail.length; ++i) {
                    state = this.stateStack.pop();
                    nt.addChildFirst(this.curNodeStack.pop());
                }
                this.curNodeStack.push(nt);
                state = stateStackPeek();
                this.stateStack.push(this.lrTable[state][rule.head.index].targetIndex);

                return Parser.READY;

            case LRActionType.GOTO:
                // do nothing
                break;
            case LRActionType.ACCEPT:

                return Parser.ACCEPT;

            //case LRActionType.NONE:
            default:
                this.error = createSyntaxError();
                return Parser.ERROR;
        }
    }
};


/**
 * Returns the start symbol (the start rule head)
 * 
 * @return the start symbol
 */
Parser.prototype.getStartSymbol = function () {
    return this.symbolTable[this.startIndex];
};


/**
 * Return the source InputStream
 * @return the source InputStream
 */
Parser.prototype.getSource = function () {
    return this.scanner.source;
};


/**
 * Sets the source
 * 
 * @param {string} input the new source input string
 */
Parser.prototype.setSource = function (input) {
    this.scanner.setSource(input);
};