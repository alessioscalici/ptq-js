window.ptq = (function(){ 
    'use strict';

/**
 *
 * The Action class contains the data for handling symbol actions like starting new subscanners, track indenting
 * and ignoring symbols. 
 * 
 * 
 * @param {TerminalSymbol} symbol the target symbol (the action is triggered when this symbol is recognized)
 *
 *
 * @property {TerminalSymbol} symbol the action trigger symbol
 * @property {boolean} ignore if true, ignore the token
 * @property {boolean} pushback if true, push back the token 
 * @property {SubScanner} gotoTarget if defined, start the new SubScanner (non nested, just jumps to it)
 * @property {SubScanner} start if defined, start the new nested SubScanner
 * @property {boolean} end if true, ends the current SubScanner and resume to the previous one (if nested)
 * @property {boolean} indent if true, consider this token as indentation
 * 
 * 
 * @constructor
 * @author Alessio Scalici
 */
var Action = function(symbol) {

    this.symbol = symbol;
    this.ignore = false;
    this.pushback = false;
    this.gotoTarget = null;
    this.start = null;
    this.end = false;
    this.indent = false;
};
/**
 *
 * 
 *  Deserialize a parser / scanner, from an hex-encoded PTQ output
 *
 *
 * 
 * @param {string} is the hexadecimal serialized Ptq string
 * @constructor
 * @author Alessio Scalici
 */
var Deserializer = function(is){
    this.is = new InputStream(is);
};


/**
 *  Reads the next number in the stream and throws an exception if the number
 *  does not match the parameter
 *
 * 
 * @param {number} cnst the expected next number in the stream
 */
Deserializer.prototype.assertConst = function(cnst){
    var c = this.readHTF8();
    if (c !== cnst) {
        throw ("Error reading stream (expected "+cnst+", read "+c+")");
    }
};


/**
 * Reads the next positive integer from the stream in HTF8 format. 
 * HTF8 is a permissive version of UTF8 (also accepts illegal code points), it is used to
 * better compress the input
 *
 * 
 * @throws {string} 'Deserializer: stream is finished' if the stream is finished
 * @throws {string} 'Deserializer: unexpected continuation byte' if an unexpected coninuation byte is found
 * @throws {string} 'Illegal start byte: <HEX>' if an illegal start byte is found
 */
Deserializer.prototype.readHTF8 = function(){
    if (!this.is.hasNext()) {
        throw 'Deserializer: stream is finished';
    }

    var b = this.is.read();
    if ((b & 0x80) === 0) {
        return b;
    }
    if ((b & 0x40) === 0) {
        throw 'Deserializer: unexpected continuation byte';
    }

    var res = 0;
    var mask0 = 0x20;
    var mask1 = 0x1F;
    for (var mult = 1; mult < 6; ++mult) {
        res = (res << 6) | (this.is.read() & 0x3F);
        if ((b & mask0) === 0) {
            return res | ((b & mask1) << (6*mult));
        }
        mask0 >>>= 1;
        mask1 >>>= 1;
    }
    throw 'Illegal start byte: '+ b.toString(16);
};



/**
 *  Reads the next ASCII string from the stream
 */
Deserializer.prototype.readString = function() {
    var size = this.readHTF8();
    var res = '';
    for (var i=0; i<size; ++i) {
        res += String.fromCharCode(this.is.read());
    }
    return res;
};

/**
 *  Reads the application stream fixed header (in the beginning of the PTQ stream)
 *
 * 
 * @throws {string} 'Deserializer: Illegal header' if the header isn't correct
 */
Deserializer.prototype.readHeader = function() {
    if (this.is.read() !== 80 || this.is.read() !== 84 || this.is.read() !== 81 || this.is.read() !== 30) {
        throw 'Deserializer: Illegal header';
    }
};



/**
 *  Reads the application informations section, and checks if the minimum version the stream requires
 *  matches the current library version
 *
 * 
 * @throws {string} an exception thrown if the version required from PTQ stream is incorrect
 */
Deserializer.prototype.readInfoSection = function () {


    this.assertConst(PtqFileConst.BEGIN_INFO_SECTION);


    this.name = this.readString();


    this.assertConst(PtqFileConst.BYTE_RECORD_SEPARATOR);


    this.iRequiredMajorVersion = this.readHTF8();
    this.iRequiredMinorVersion = this.readHTF8();
    this.iRequiredPatchVersion = this.readHTF8();

    if ((this.iRequiredMajorVersion > ptq.MAJOR_VERSION) ||
        (this.iRequiredMajorVersion === ptq.MAJOR_VERSION && this.iRequiredMinorVersion > ptq.MINOR_VERSION) ||
        (this.iRequiredMajorVersion === ptq.MAJOR_VERSION && this.iRequiredMinorVersion === ptq.MINOR_VERSION && this.iRequiredPatchVersion > ptq.PATCH_VERSION)
    ) {
        throw 'Version required: ' + this.iRequiredMajorVersion + '.' + this.iRequiredMinorVersion + '.' + this.iRequiredPatchVersion;
    }


    this.assertConst(PtqFileConst.BYTE_RECORD_SEPARATOR);
};



// =============================== SCANNER READING ============================== //



/**
 *  Reads the entire scanner section
 *  
 * @return {Scanner} the deserialized scanner
 */
Deserializer.prototype.readScannerSection = function() {

    this.assertConst(PtqFileConst.BEGIN_SCANNER_SECTION);

    this.readCharacterSetSection();
    this.readTerminalSection();
    this.readDfaSection();


    this.assertConst(PtqFileConst.BYTE_RECORD_SEPARATOR);


    var scan = new Scanner(this.dfas, this.dfas[0].name, this.symbols);
    scan.indentBased = this.containsIndentFlag;


    scan.init(this.dfas, this.dfas[0].name, this.symbols);
    scan.firstIgnoredIndex = this.publicSymbolTableLength;
    return scan;
};


/**
 *  Reads the character set section
 * 
 */
Deserializer.prototype.readCharacterSetSection = function() {

    this.assertConst(PtqFileConst.BEGIN_CHARACTER_SET_SECTION);

    var iSetCount = this.readHTF8();

    this.assertConst(PtqFileConst.BYTE_UNIT_SEPARATOR);

    this.characterSets = [];

    for (var i=0; i<iSetCount; ++i) {

        var iRangeCount = this.readHTF8();

        this.assertConst(PtqFileConst.BYTE_UNIT_SEPARATOR);


        var curSet = [];

        for (var j=0; j<iRangeCount; ++j)
        {
            var iStart = this.readHTF8();
            var iEnd = this.readHTF8();

            for (var k=iStart; k<=iEnd; ++k)
            {
                if (k<0 || k>0x10FFFF || (k>=0xD800 && k<= 0xDFFF)) {
                    throw ("Error reading Character Set section: invalid Unicode code point 0x"+k.toString(16));
                }
                curSet.push(k);
            }
        }
        this.characterSets.push(curSet);
    }
};

/**
 *  Reads the terminal table section
 */
Deserializer.prototype.readTerminalSection = function() {

    this.assertConst(PtqFileConst.BEGIN_TERMINAL_SECTION);


    var iCount = this.readHTF8();


    this.assertConst(PtqFileConst.BYTE_UNIT_SEPARATOR);


    this.publicSymbolTableLength = this.readHTF8();


    this.assertConst(PtqFileConst.BYTE_UNIT_SEPARATOR);



    this.symbols = [];

    for (var i=0; i<iCount; ++i)
    {
        var symbol = new TerminalSymbol(this.readString(), i);
        var aux = this.readString();
        if (aux.length) {
            symbol.setDisplayName(aux);
        }

        this.symbols.push(symbol);
    }
};

/**
 *  Reads the SubScanners section
 */
Deserializer.prototype.readDfaSection = function() {

    this.assertConst(PtqFileConst.BEGIN_DFA_SECTION);

    var i,
        iCount = this.readHTF8();

    this.assertConst(PtqFileConst.BYTE_UNIT_SEPARATOR);


    this.dfas = [];

    this.targetActionList = [];

    for (i = 0; i < iCount; ++i) {
        this.dfas.push(this.readSingleDfa());
    }


    for (i = 0; i < this.targetActionList.length; ++i) {

        var ar = this.targetActionList[i],
            action = ar[1],
            sourceDfa = this.dfas[ar[0]],
            targetDfa = this.dfas[ar[3]],
            triggerSymbol = this.symbols[ar[2]];

        if (action === PtqFileConst.DFA_ACTION_BEGIN) {
            sourceDfa.upsertAction(triggerSymbol).start = targetDfa;
        }
        else if (action === PtqFileConst.DFA_ACTION_GOTO) {
            sourceDfa.upsertAction(triggerSymbol).gotoTarget = targetDfa;
        }

    }
};


/**
 *  Reads a single SubScanner section
 */
Deserializer.prototype.readSingleDfa = function() {


    this.assertConst(PtqFileConst.BEGIN_SINGLE_DFA);

    var i,
        name = this.readString();

    // read state subsection
    this.assertConst(PtqFileConst.BEGIN_DFA_STATE_SECTION);


    var iCountStates = this.readHTF8();


    this.assertConst(PtqFileConst.BYTE_UNIT_SEPARATOR);


    var states = [];
    for (i = 0; i < iCountStates; ++i) {
        states.push(new State());
    }

    var iCountFinal = this.readHTF8();


    this.assertConst(PtqFileConst.BYTE_UNIT_SEPARATOR);

    for (i = 0; i < iCountFinal; ++i) {
        var iStateIndex = this.readHTF8(),
            iSymbolIndex = this.readHTF8();
        states[iStateIndex].acceptedSymbol = this.symbols[iSymbolIndex];
    }


    // read edge subsection
    this.assertConst(PtqFileConst.BEGIN_DFA_EDGE_SECTION);

    var iCountEdges = this.readHTF8();

    this.assertConst(PtqFileConst.BYTE_UNIT_SEPARATOR);

    var edges = []; // new ArrayList<ArrayList<Edge>>(iCountStates);
    for (i = 0; i < iCountStates; ++i) {
        edges.push([]);
    }
    for (i = 0; i < iCountEdges; ++i) {
        var iSrc = this.readHTF8();
        var iDst = this.readHTF8();
        var iSet = this.readHTF8();

        edges[iSrc].push(new Edge(
            states[iSrc],
            states[iDst],
            this.characterSets[iSet]
        ));

    }

    for (i = 0; i < iCountStates; ++i) {
        states[i].edges = edges[i];
    }



    // read action subsection
    this.assertConst(PtqFileConst.BEGIN_DFA_ACTION_SECTION);

    var iCountActions = this.readHTF8();


    this.assertConst(PtqFileConst.BYTE_UNIT_SEPARATOR);

    var act = null,
        actMap = {},
        indentFlag = false;

    for (i = 0; i < iCountActions; ++i) {
        var iType = this.readHTF8(),
            iSymbolIndex2 = this.readHTF8(),
            iTarget;

        if (actMap[iSymbolIndex2]) {
            act = actMap[iSymbolIndex2];
        }
        else {
            act = new Action(this.symbols[iSymbolIndex2]);
            actMap[iSymbolIndex2] = act;
        }

        switch (iType) {

            case PtqFileConst.DFA_ACTION_IGNORE:
                act.ignore = true;
                break;

            case PtqFileConst.DFA_ACTION_PUSHBACK:
                act.pushback = true;
                break;

            case PtqFileConst.DFA_ACTION_END:
                act.end = true;
                break;

            case PtqFileConst.DFA_ACTION_INDENT:
                act.indent = true;
                indentFlag = true;
                this.containsIndentFlag = true;
                break;

            case PtqFileConst.DFA_ACTION_BEGIN:
            case PtqFileConst.DFA_ACTION_GOTO:
                iTarget = this.readHTF8();

                var arAction = [];
                arAction.push(this.dfas.length); // dfa index
                arAction.push(iType);            // action type
                arAction.push(iSymbolIndex2);     // symbol index
                arAction.push(iTarget);          // action target
                this.targetActionList.push(arAction);
                break;

            default:
                break;
        }
    }

    var res = new SubScanner(name, states[0]);
    res.indentBased = indentFlag;


    var keys = [];
    for (var key in actMap) {
        if (actMap.hasOwnProperty(key)) {
            res.setAction(actMap[key]);
        }
    }

    return res;

};



// =============================== PARSER READING ============================== //


/**
 *  Reads the parser section of the stream
 * 
 * @return {Parser} the deserialized parser
 */
Deserializer.prototype.readParserSection = function() {

    this.assertConst(PtqFileConst.BEGIN_PARSER_SECTION);


    this.parserType = this.readHTF8();


    this.assertConst(PtqFileConst.BYTE_RECORD_SEPARATOR);


    // AbstractSymbol[]
    var symbolTable = this.readSymbolTableSection();

    var startSymbol = this.readHTF8();

    this.assertConst(PtqFileConst.BYTE_RECORD_SEPARATOR);

    // GrammarRule[]
    var ruleTable = this.readRuleTableSection(symbolTable);



    switch (this.parserType) {
        case PtqFileConst.PARSER_TYPE_LR0:
        case PtqFileConst.PARSER_TYPE_SLR:
        case PtqFileConst.PARSER_TYPE_LR1:
        case PtqFileConst.PARSER_TYPE_LALR1:
        case PtqFileConst.PARSER_TYPE_LRED1:

            // LRAction[][]
            var lrTable = this.readLR1TableSection();

            return new Parser(lrTable, ruleTable, symbolTable, startSymbol, this.scanner);

        default:
            throw 'Unknown parser type';

    }

};



/**
 *  Reads the symbol table section
 * 
 * @return {AbstractSymbol[]} the symbol table
 */
Deserializer.prototype.readSymbolTableSection = function () {


    this.assertConst(PtqFileConst.BEGIN_SYMBOL_SECTION);

    var iSymbolCount = this.readHTF8();

    this.assertConst(PtqFileConst.BYTE_UNIT_SEPARATOR);


    var i,
        iFstNonTerminalIndex = this.readHTF8(),

        // TerminalSymbol[]
        scannerSymbolTable = this.scanner.getPublicSymbolTable(),

        // AbstractSymbol[]
        symbolTable = [];

    for (i = 0; i < iFstNonTerminalIndex; ++i) {
        symbolTable.push(scannerSymbolTable[i]);
    }

    for (i = iFstNonTerminalIndex; i < iSymbolCount; ++i) {
        symbolTable.push(new NonTerminalSymbol(this.readString(), i));
    }

    this.assertConst(PtqFileConst.BYTE_RECORD_SEPARATOR);

    return symbolTable;
};


/**
 *  Reads the rule table section
 * 
 * @param {AbstractSymbol[]} symbolTable the previously read symbol table
 * @return {GrammarRule[]} the rule table
 */
Deserializer.prototype.readRuleTableSection = function(symbolTable) {


    this.assertConst(PtqFileConst.BEGIN_RULE_SECTION);

    var iRuleCount = this.readHTF8();

    this.assertConst(PtqFileConst.BYTE_UNIT_SEPARATOR);


    // GrammarRule[]
    var ruleTable = [];

    for (var i = 0; i < iRuleCount; ++i) {

        var iRuleLength = this.readHTF8();

        // AbstractSymbol[]
        var tail = [];

        var iHeadIndex = this.readHTF8();
        if (iHeadIndex >= symbolTable.length) {
            throw 'The stream contains corrupt data (index out of bounds)';
        }

        if (!(symbolTable[iHeadIndex] instanceof NonTerminalSymbol)) {
            throw 'The stream contains corrupt data (head of rule is terminal)';
        }

        for (var j = 1; j < iRuleLength; ++j) {

            var iSymbolIndex = this.readHTF8();

            if (iSymbolIndex >= symbolTable.length) {
                throw 'The stream contains corrupt data (index out of bounds)';
            }

            tail.push(symbolTable[iSymbolIndex]);
        }
        ruleTable.push(new GrammarRule(i, symbolTable[iHeadIndex], tail));
    }

    this.assertConst(PtqFileConst.BYTE_RECORD_SEPARATOR);

    return ruleTable;
};

/**
 *  Reads the LR action-goto table section
 * 
 * @return {LRAction[]} the LR action-goto table (square matrix)
 */
Deserializer.prototype.readLR1TableSection = function () {

    this.assertConst(PtqFileConst.BEGIN_TABLE_SECTION);

    var iRows = this.readHTF8();

    this.assertConst(PtqFileConst.BYTE_UNIT_SEPARATOR);


    var iCols = this.readHTF8();

    this.assertConst(PtqFileConst.BYTE_UNIT_SEPARATOR);


    var iActionCount = this.readHTF8();

    this.assertConst(PtqFileConst.BYTE_UNIT_SEPARATOR);

    
    var i,
        lrTable = []; // LRAction[][]

    for (i = 0; i < iRows; ++i) {
        lrTable.push([]);
    }

    for (i = 0; i < iActionCount; ++i) {
        var iRow = this.readHTF8(),
            iCol = this.readHTF8(),

            action = LRActionType.get(this.readHTF8());

        switch (action.code) {
            case LRActionType.NONE.code:
                break;
            case LRActionType.ACCEPT.code:
                lrTable[iRow][iCol] = new LRAction(action);
                break;
            case LRActionType.SHIFT.code:
            case LRActionType.GOTO.code:
            case LRActionType.REDUCE.code:
                var iTarget = this.readHTF8();
                lrTable[iRow][iCol] = new LRAction(action, iTarget);
                break;
            default:
                throw 'Error reading LR1 section: undefined LRAction';
        }

    }

    this.assertConst(PtqFileConst.BYTE_RECORD_SEPARATOR);

    return lrTable;
};




/**
 * Deserialize a complete PTQ stream (with header information)
 *
 * @param {string} is the hexadecimal serialized PTQ string
 * @return {Parser|Scanner} the resulting parser or scanner
 */
Deserializer.prototype.deserialize = function() {


    this.readHeader();
    this.readInfoSection();


    this.scanner = this.readScannerSection();


    this.scanner.name = this.name;


    if (this.is.hasNext()) {
        return this.readParserSection();
    }

    return this.scanner;
};



/**
 * 
 * Represents an edge of a scanner DFA, linking
 * two DFA states and labelled with the accepted inputs.
 * 
 * 
 * @param {State} sourceState the source state
 * @param {State} targetState the state this edge points to
 * @param {number[]} codePointSet a Set containing the inputs accepted by this edge
 *
 *
 * @property {State} sourceState the source DFA state
 * @property {State} targetState the target DFA state
 * @property {number[]} ranges (number[][]) ranges The inputs accepted by this edge
 * 
 * 
 * @constructor
 * @author Alessio Scalici
 */
var Edge = function(sourceState, targetState, codePointSet) {


    this.sourceState = sourceState;
    this.targetState = targetState;


    if (codePointSet) {

        /*
         * The inputs accepted by this edge. They are represented this way:
         * this matrix is Nx2, every row represents a continuous range of integers.
         * Here's an example:
         * [0][3]
         * [12][12]
         * [18][20]
         *
         * accepts the following inputs:
         * [0][1][2][3][12][18][19][20]
         *
         * this allows memory saving because edge accepted inputs trend to be contiguous
         */
        this.ranges = this.getRanges(codePointSet);
    }
};


/**
 * Turns an integer Set in ranges representation
 * 
 * @param {number[]} cpset the integer set
 * @return the ranges representation of the input set
 */
Edge.prototype.getRanges = function(cpset) {


    if (!cpset || !cpset.length) {
        return [];
    }

    var na,
        res = [],
        ar = cpset.slice(),
        a = ar[0],
        b = ar[0];

    for (var j=1; j<ar.length; ++j) {
        if (ar[j] === b+1) {
            b = ar[j];
            continue;
        }
        na = [];
        na.push(a);
        na.push(b);

        res.push(na);
        a = ar[j];
        b = ar[j];
    }

    na = [];
    na.push(a);
    na.push(b);
    res.push(na);

    return res;
};


/**
 * Returns true if the integer i is accepted by this edge, false otherwise
 *
 * @param {number} i the input to check
 * @return {boolean} true if the integer i is accepted by this edge, false otherwise
 */
Edge.prototype.accepts = function(i) {
    var imin = 0;
    var imax = this.ranges.length-1;
    while (imax >= imin) {
        var imid = (imin + imax) >>> 1; // (imin + imax) / 2

        if (this.ranges[imid][1] <  i) {
            imin = imid + 1;
        }
        else if (this.ranges[imid][0] > i ) {
            imax = imid - 1;
        }
        else {
            return true;
        }
    }
    // not found
    return false;
};
/**
 * 
 * Contains informations about errors occurred during the recognition/parsing process.
 * Informations are: the error type, the last token recognized by the scanner, a list of expected symbols
 * (if syntax error)
 * 
 * 
 * @param {ErrorType} type the error type
 * @param {TerminalNode} lastToken the last recognized token
 * @param {object} [expectedSymbols] a set of expected symbols (if syntax error) (symbol name -> symbol)
 *
 *
 * @property {ErrorType} the error type
 * @property {TerminalNode} the last recognized token
 * @property {object} [expectedSymbols] a set of expected symbols (if syntax error) (symbol name -> symbol)
 * 
 * 
 * @constructor
 * @author Alessio Scalici
 */
var ErrorReport = function(type, lastToken, expectedSymbols) {

    this.type = type;
    this.lastToken = lastToken;
    this.expectedSymbols = expectedSymbols;

};


/*
 * An error string representation
 * 
 * @return {string} a string representation of the error
 */
ErrorReport.prototype.toString = function () {

    var res = (this.type ? this.type.toString() : 'null');

    if (this.lastToken && this.lastToken.pos) {
        res += ' (' + this.lastToken.pos.line + ', ' + this.lastToken.pos.col + ')';
    }

    if (this.expectedSymbols)
    {
        res += ' ->';
        for (var k in this.expectedSymbols) {
            if (this.expectedSymbols.hasOwnProperty(k)) {
                res += ' ' + this.expectedSymbols[k].name;
            }

        }
    }
    return res;
};
/**
 * 
 * An error type enumerator.
 * This indicates the error type in the error report
 * 
 * 
 * @param {string} name the enum element name
 * @param {number} code the enum element numeric code
 *
 *
 * @property {string} name the enum element name
 * @property {number} name the enum element numeric code
 *
 * 
 * 
 * @constructor
 * @author Alessio Scalici
 */
var ErrorType = function(name, code)  {

    this.name = name;
    this.code = code;
};


/** A warning, reports a non-blocking error */
ErrorType.WARNING = new ErrorType('WARNING', 0);

/** A reader error, occurs when the source is not encoded properly or with the correct charset */
ErrorType.ENCODING_ERROR = new ErrorType('ENCODING_ERROR', 1);

/**  A scanner error, it occurs when a token is not recognized */
ErrorType.LEXICAL_ERROR = new ErrorType('LEXICAL_ERROR', 2);

/** A parser error, it occurs when the scanner recognizes an unexpected token */
ErrorType.SYNTAX_ERROR = new ErrorType('SYNTAX_ERROR', 3);


/**
 * Returns the name of the enum element
 * 
 * @return {string} the name of the enum element
 */
ErrorType.prototype.toString = function () {
    return this.name;
};
/**
 * 
 * Contains methods to calculate first sets, used in Parser error reporting (expected symbols)
 * 
 * @constructor
 * @author Alessio Scalici
 */
var GrammarProcessor = function() {


};


/**
 * Process the symbols first sets, used to report expected symbols when a syntax error occurs
 * 
 * @param {GrammarRule[]} ruleTable the grammar rule table
 * @param {Symbol[]} symbolTable the symbol table
 * 
 * @return {object} the First Sets map (symbol index -> Symbol[])
 */
GrammarProcessor.processFirstSets = function (ruleTable, symbolTable) {

    var addAll = function (target, symbols) {
        var changed = false;
        for (var i = 0; i < symbols.length; ++i) {
            if (!target[symbols[i].index]) {
                changed = true;
            }
            target[symbols[i].index] = symbols[i];
        }
        return changed;
    };

    var i, j, k, iFirstNonTerminal = 2;

    for (i = 0; i < symbolTable.length; ++i) {
        if (symbolTable[i] instanceof NonTerminalSymbol) {
            iFirstNonTerminal = i;
            break;
        }
    }
    var nTerm = iFirstNonTerminal;
    var nNonTerm = symbolTable.length - iFirstNonTerminal;

    var fiSets = {};


    var epsilon = new TerminalSymbol("EPSILON", symbolTable.length);

    // for every symbol, initialize an empty set
    for (i = 0; i < symbolTable.length; ++i) {
        fiSets[i] = {};
    }
    fiSets[epsilon.index] = {};



    addAll(fiSets[epsilon.index], [epsilon]);

    for (i = 0; i < iFirstNonTerminal; ++i) { // STEP 1 (terminals)
        addAll(fiSets[i], [symbolTable[i]]);
    }

    for (i = iFirstNonTerminal; i < symbolTable.length; ++i) { // STEP 2 (non-terminals)

        for (j = 0; j < ruleTable.length; ++j) {
            if (symbolTable[i].equals(ruleTable[j].head)) {
                if (ruleTable[j].isEpsilon()) {
                    addAll(fiSets[i], [epsilon]);
                }
            }
        }
    }

    var changed = true; // STEP 3
    while (changed) {
        changed = false;

        for (i = iFirstNonTerminal; i < symbolTable.length; ++i) {
            for (j = 0; j < ruleTable.length; ++j) {
                if (symbolTable[i].equals(ruleTable[j].head)) {

                    for (k = 0; k < ruleTable[j].tail.length; ++k) {

                        if (addAll(fiSets[i], fiSets[i])) {
                            changed = true;
                        }
                        if (!fiSets[i][epsilon.index]) {
                            break;
                        }
                    }
                }
            }
        }
    }

    var mapFunc = function (key) { 
        return obj[key]; 
    };

    var fiKeys = Object.keys(fiSets);
    for (i = 0; i < fiKeys.length; ++i) {
        var obj = fiSets[fiKeys[i]];
        fiSets[fiKeys[i]] = Object.keys(obj).map(mapFunc);
    }

    return fiSets;
};
/**
 * 
 * A rule (production) of a context-free grammar
 *
 * @param {number} index the rule's index
 * @param {NonTerminalSymbol} head the rule's LHS
 * @param {Symbol[]} tail the rule's RHS
 *
 *
 * @property {number} index the index of the rule, this must be unique among rules in the same grammar
 * @property {NonTerminalSymbol} head the rule left-hand side
 * @property {Symbol[]} tail the rule right-hand side (empty for epsilon-rules)
 * 
 * 
 * @constructor
 * @author Alessio Scalici
 */
var GrammarRule = function(index, head, tail) {

    this.index = index;
    this.head = head;
    this.tail = tail;
};


/**
 * Returns true if this is an epsilon-rule (or lambda-rule), false otherwise
 * 
 * @return {boolean} true if this is an epsilon-rule (or lambda-rule), false otherwise
 */
GrammarRule.prototype.isEpsilon = function () {
    return (this.tail.length === 0);
};


/**
 * Returns a string representation of the rule
 * 
 * @return {string} a string representation of the rule
 */
GrammarRule.prototype.toString = function () {
    var res = this.head.toString() + ' ::= ';
    for (var i=0; i<this.tail.length; ++i) {
        res += this.tail[i].toString() + ' ';
    }
    return res;
};


/**
 * Checks for equality
 * 
 * @param {object} the object to compare
 * 
 * @return {boolean} true if the object equals
 */
GrammarRule.prototype.equals = function (o) {
    if (o === this) {
        return true;
    }
    if (!(o instanceof GrammarRule)) {
        return false;
    }
    if (this.tail.length !== o.tail.length) {
        return false;
    }

    for (var i=0; i<this.tail.length; ++i) {
        if (!this.tail[i].equals(o.tail[i])) {
            return false;
        }
    }
    return ((!this.head && !o.head) || this.head && this.head.equals(o.head));
};
/**
 * 
 * This object takes an hexadecimal-encoded PTQ output, and reads from it as a stream.
 *
 * @param {string} str the hexadecimal-encoded PTQ output string
 *
 * 
 * @property {string} str the hexadecimal string
 * @property {number} i the current string index
 * 
 * 
 * @constructor
 * @author Alessio Scalici
 */
var InputStream = function(str){
  if (str.length % 2 !== 0) {
    throw 'InputStream: str must be even';
  }

  this.str = str;
  this.i = 0;
};


/**
 * Read the next byte from the stream (2 hexadecimal characters)
 * 
 * @return {number} -1 if the stream is finished, the next byte otherwise
 */
InputStream.prototype.read = function(){
  if (!this.hasNext()) {
    return -1;
  }
  var res = parseInt(this.str.substring(this.i, this.i+2), 16);
  this.i = this.i + 2;
  return res - 128; // PTQ HEX adaption
};


/**
 * Return true if a .read() call would return a byte, false if the stream has finished and a .read() call would return -1
 * 
 * @return {boolean} true if a .read() call would return a byte, false if the stream has finished and a .read() call would return -1
 */
InputStream.prototype.hasNext = function(){
  return this.i < this.str.length;
};

/**
 * 
 * An LR parser action. Tells the parser to shift to the next token, reduce a rule, goto a state
 * or to accept the input.
 *
 * @param {LRActionType} actionType the LR action type
 * @param {number} targetIndex the LR action type
 *
 *
 * @property {LRActionType} type the action to take LRActionType(SHIFT,REDUCE,GOTO,ACCEPT,NONE)
 * @property {number} targetIndex the target rule index (if REDUCE)
 * 
 * 
 * @constructor
 * @author Alessio Scalici
 */
var LRAction = function(actionType, targetIndex) {

    this.type = actionType;
    this.targetIndex = (typeof targetIndex === 'number') ? targetIndex : -1;

};


/**
 * Returns a string representation of the action
 *
 * @return {string} a string representation of the action
 */
LRAction.prototype.toString = function () {
    if (this.targetIndex >= 0) {
        return this.type.toString() + ' ' + this.targetIndex;
    }
    return this.type.toString();
};
/**
 * 
 * An enum type that defines LR action types (SHIFT, REDUCE, GOTO, ACCEPT)
 * 
 * 
 * @param {string} name the enum element name
 * @param {number} code the enum element numeric code
 * 
 * @constructor
 * @author Alessio Scalici
 */
var LRActionType = function(name, code)  {
    this.name = name;
    this.code = code;
};

/** Do nothing, no action defined for this state-symbol */
LRActionType.NONE = new LRActionType('NONE', 0);

/** Goto another symbol */
LRActionType.GOTO = new LRActionType('GOTO', 1);

/** Shift to next symbol */
LRActionType.SHIFT = new LRActionType('SHIFT', 2);

/** Reduce the rule */
LRActionType.REDUCE = new LRActionType('REDUCE', 3);

/** Accepts the input */
LRActionType.ACCEPT = new LRActionType('ACCEPT', 4);


/**
 * Returns the code
 * 
 * @return {number} the code of the enum element
 */
// FIXME is it used somewhere?
LRActionType.prototype.toInt = function () {
    return this.code;
};


/**
 * Returns the name of the enum element
 * 
 * @return {string} the name of the enum element
 */
// FIXME is it used somewhere?
LRActionType.prototype.toString = function () {
    return this.name;
};


/**
 * Returns the enum element, given its code
 * 
 * @param {number} code the enum code
 * @return {LRActionType} the enum element, given its code
 */
// FIXME is it used somewhere?
LRActionType.get = function (code) {
    var ar = [
        LRActionType.NONE,
        LRActionType.GOTO,
        LRActionType.SHIFT,
        LRActionType.REDUCE,
        LRActionType.ACCEPT
    ];
    return ar[code];
};
/**
 * 
 * A parse tree non-terminal node.
 * It can have one or more child (nodes without child are terminal).
 * The root of a parse tree is always a non-terminal node
 * 
 * 
 * @param {GrammarRule} rule the rule reduced to create this node
 *
 *
 * @property {NonTerminalSymbol} symbol symbol represented by this node (the rule head)
 * @property {GrammarRule} rule the rule reduced to obtain this node
 * @property {TerminalNode|NonTerminalNode[]} children the children nodes
 * 
 * 
 * @constructor
 * @author Alessio Scalici
 */
var NonTerminalNode = function(rule)  {

    this.symbol = rule.head;
    this.rule = rule;
    this.children = [];
};


/**
 * Returns the calculated NonTerminalNode position (based on children TerminalNodes)
 * @return {Position} the calculated NonTerminalNode position
 */
NonTerminalNode.prototype.getPosition = function () {
    if (!this.children || !this.children.length)
    {
        if (this.parent) {
            var index = this.parent.children.indexOf(this);
            if (index < this.parent.children.length-1) {
                return this.parent.children[index +1].getPosition();
            }
            return new Position();
        } else {
            return new Position();
        }
    }

    return this.children[0].getPosition();
};


/**
 * Returns the calculated length position (based on children TerminalNodes)
 * @return {number} the calculated node length 
 */
NonTerminalNode.prototype.getLength = function () {

    if (!this.children || !this.children.length || !this.getPosition() || !this.children[this.children.length-1].getPosition()) {
        return 0;
    }
    var last = this.children[this.children.length-1];
    return last.getPosition().index + last.getLength() - this.getPosition().index;
};


/**
 * Adds a child node in the first position
 * 
 * @param {TerminalNode|NonTerminalNode} child the node to add as a child
 */
NonTerminalNode.prototype.addChildFirst = function (child) {
    this.children.unshift(child);
    child.parent = this;
};


/**
 * Adds a child node in the last position
 * 
 * @param {TerminalNode|NonTerminalNode} child the node to add as a child
 */
NonTerminalNode.prototype.addChildLast = function (child) {
    this.children.push(child);
    child.parent = this;
};


/**
 * Returns a string representation of the node
 * 
 * @param {string} a string representation of the node
 */
NonTerminalNode.prototype.toString = function () {
    var pos = this.getPosition();
    return this.rule.toString() + " ||  pos: " + pos.index + " (" + pos.line + "," + pos.col + "), len: " + this.getLength();
};


/**
 * Checks for equality
 * 
 * @param {object} the object to compare
 * 
 * @return {boolean} true if the object equals
 */
NonTerminalNode.prototype.equals = function (o) {
    if (o === this) {
        return true;
    }
    if (!(o instanceof NonTerminalNode)) {
        return false;
    }

    if (this.children.length !== o.children.length) {
        return false;
    }

    for (var i=0; i<this.children.length; ++i) {
        if (!this.children[i].equals(o.children[i])) {
            return false;
        }
    }
    return (!this.rule && !o.rule) || this.rule && this.rule.equals(o.rule);
};


/**
 * Returns a string representing the tree (human readable)
 * 
 * @return {string} a string representation of the tree
 */
NonTerminalNode.prototype.treeToString = function (deep) {

    deep = deep || 0;

    var t = function(deep){
        var s = '';
        for (var i = 0; i < deep; ++i) {
            s += i < deep - 1 ? '| ' : '|-';
        }
        s += '-';
        return s;
    };

    var str = '\n' + t(deep) + this.toString();
    if (this.children) {
        for (var i = 0; i < this.children.length; ++i) {
            
            if (this.children[i] instanceof NonTerminalNode) {
                str += this.children[i].treeToString(deep + 1);
            } else {
                str += '\n' + t(deep + 1) + this.children[i].toString();
            }
        }
    }
    return str;
};
/**
 * 
 * A grammar non-terminal symbol
 * 
 * 
 * @param {string} name the symbol name
 * @param {number} index the symbol index
 *
 *
 * @property {string} name the name of the symbol
 * @property {number} index the index of the symbol
 * 
 * 
 * @constructor
 * @author Alessio Scalici
 */
var NonTerminalSymbol = function(name, index)  {

    this.name = name;
    this.index = index;
};


/**
 * Returns a string representation of the symbol
 * 
 * @return {string} a string representation of the symbol
 */
NonTerminalSymbol.prototype.toString = function () {
    return '<' + this.name + '>';
};



/**
 * Every symbol has unique name, so symbols with the same name are the same symbol
 * 
 * @return {boolean} true if the parameter equals this instance
 */
NonTerminalSymbol.prototype.equals = function(o) {
    if (o === this) {
        return true;
    }
    if (!(o instanceof NonTerminalSymbol)) {
        return false;
    }
    return (this.name === o.name);
};
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
/**
 * 
 * A terminal node position. Provides informations about line, column, position of the first character
 * of the token
 *
 * @param {number} [line] the row
 * @param {number} [col] the column
 * @param {number} [index] the offset index
 *
 *
 * @property {number} line the line (row) number, 1-based
 * @property {number} col the column number, 1-based
 * @property {number} line the line (row) number, 0-based
 * 
 * 
 * @constructor
 * @author Alessio Scalici
 */
var Position = function(line, col, index) {

    this.line = line || 0;
    this.col = col || 0;
    this.index = index || 0;
};


/**
 * Check for equality
 *
 * @param {object} o the object to compare
 * 
 * @return {boolean} true if the parameter equals this instance
 */
Position.prototype.equals = function(o) {
    if (o === this) {
        return true;
    }
    if (!(o instanceof Position)) {
        return false;
    }
    return (this.line === o.line && this.col === o.col && this.index === o.index);
};


/**
 * Returns a string representation of the position
 * 
 * @return {string} a string representation of the position
 */
Position.prototype.toString = function(o) {
    return this.index + ' (' + this.line + ',' + this.col + ')';
};


/**
 * Clones this position, returning an equivalent one
 * 
 * @return {Position} a clone of this Position
 */
Position.prototype.clone = function() {
    return new Position(this.line, this.col, this.index);
};
/**
 * 
 * Constants used in the serialized PTQ streams
 * 
 * @readonly
 * @enum {number}
 * @author Alessio Scalici
 */
var PtqFileConst = {
    
    BYTE_RECORD_SEPARATOR : 30,
    BYTE_UNIT_SEPARATOR : 31,
    
    BEGIN_INFO_SECTION : 73,				// I
    BEGIN_SCANNER_SECTION : 83,				// S
    BEGIN_CHARACTER_SET_SECTION : 67,		// C
    BEGIN_TERMINAL_SECTION : 84,			// T
    BEGIN_DFA_SECTION : 68,					// D
    BEGIN_SINGLE_DFA : 68,					// d
    BEGIN_DFA_STATE_SECTION : 115,			// s
    BEGIN_DFA_EDGE_SECTION : 101,			// e
    BEGIN_DFA_ACTION_SECTION : 97,			// a
    
    DFA_ACTION_IGNORE : 105,				// i
    DFA_ACTION_NEWLINE : 110,				// n
    DFA_ACTION_PUSHBACK : 112,				// p
    DFA_ACTION_BEGIN : 115,				// s
    DFA_ACTION_END : 101,					// e
    DFA_ACTION_GOTO : 103,					// g
    DFA_ACTION_INDENT : 104,				// h
    
    // Parser
    
    BEGIN_PARSER_SECTION : 80,				// P
    
    PARSER_TYPE_LR0 : 121,					// y
    PARSER_TYPE_SLR : 120,					// x
    PARSER_TYPE_LR1 : 119,					// w
    PARSER_TYPE_LALR1 : 118,				// v
    PARSER_TYPE_LRED1 : 117,				// u
    
    BEGIN_SYMBOL_SECTION : 83,				// S
    BEGIN_RULE_SECTION : 82,				// R
    BEGIN_TABLE_SECTION : 84				// T
};
/**
 * 
 * The PTQ library object.
 * Contains information about the library (e.g. version) and global methods (deserialize)
 *
 * @property {number} MAJOR_VERSION the PTQ library major version
 * @property {number} MINOR_VERSION the PTQ library minor version
 * @property {number} PATCH_VERSION the PTQ library patch version
 * 
 * @namespace
 * @author Alessio Scalici
 */
var ptq = {

    MAJOR_VERSION : 1,
    MINOR_VERSION : 0,
    PATCH_VERSION : 0,


    /**
     * Deserialize the PTQ stream in input (encoded as an hexadecimal string), returning the resulting Parser or Scanner
     * 
     * @param  {string} is the PTQ stream, encoded as an hexadecimal string
     * 
     * @return {Scanner|Parser} the Scanner (or Parser) deserialized from the input string
     */
    deserialize : function (is) {
        var des = new Deserializer(is);
        return des.deserialize();
    }

};

/**
 * 
 * A source reader, provides a way to unread characters
 *
 * @param {string} source the source code to read
 *
 * @property {string} source the source string
 * @property {number} cnt the current index in the string 
 * 
 * @constructor
 * @author Alessio Scalici
 */
var PushbackReader = function(source) {

    this.source = source;
    this.cnt = 0;

};


/**
 * Returns the next codepoint in the source
 *
 * @return {number} the next codepoint in the source
 */
PushbackReader.prototype.read = function() {
    return this.source.charCodeAt(this.cnt++);
};


/**
 * Returns a string formed by the last amt read characters
 * 
 * @param {number} amt the number of characters to fetch
 * 
 * @return {string} a string formed by the last amt read characters
 */
//FIXME test with double character SS german
PushbackReader.prototype.lastString = function(amt) {
    return this.source.substring(this.cnt - amt, this.cnt);
};


/**
 * Un-reads a character. It will be re-read calling the read() method
 *
 * @param {number} amt the number of characters to unread
 * 
 */
PushbackReader.prototype.unread = function(amt) {
    amt = amt || 1;
    this.cnt -= amt;
};


/**
 * Resets the PushbackReader
 */
PushbackReader.prototype.reset = function() {
    this.cnt = 0;
};
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
/**
 * 
 * A special symbol index enumerator.
 * Special symbols like the error symbol or the end-of-stream symbol
 * 
 * 
 * @param {string} name the enum element name
 * @param {number} code the enum element numeric code
 *
 *
 * @property {string} name the enum element name
 * @property {number} code the enum element numeric code
 * 
 * 
 * @constructor
 * @author Alessio Scalici
 */
var SpecialSymbol = function(name, code)  {

    this.name = name;
    this.code = code;
};


/** The end-of-stream symbol, returnes when the end of the source text is reached by the scanner */
SpecialSymbol.EOS = new SpecialSymbol('EOS', 0);

/** The error symbol, returned if an unexpected token is found, or in case of indentation error */
SpecialSymbol.ERROR = new SpecialSymbol('ERROR', 1);

/** An indentation-based begin-block token */
SpecialSymbol.BEGIN = new SpecialSymbol('BEGIN', 2);

/** An indentation-based end-block token */
SpecialSymbol.END = new SpecialSymbol('END', 3);
/**
 *
 * A scanner DFA state, it has an edge collection that links it to
 * other states.
 * 
 * 
 * @param {TerminalSymbol} [acceptedSymbol] the symbol accepted by this state (if it's a final state). If not passed, the state will be non-final
 *
 *
 * @property {TerminalSymbol} acceptedSymbol the symbol accepted by this state. If this is not a final state, is null
 * @property {Edge[]} edges the outgoing DFA edges
 *
 * 
 * @constructor
 * @author Alessio Scalici
 */
var State = function(acceptedSymbol) {

    this.acceptedSymbol = acceptedSymbol || null;
    this.edges = null;

};


/**
 * Returns true if this is a final state, false otherwise
 * 
 * @return {boolean} true if this is a final state, false otherwise
 */
State.prototype.isFinal = function() {
    return !!this.acceptedSymbol;
};
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
/**
 * 
 * A terminal parse tree node
 *
 * @param {TerminalSymbol} symbol the symbol represented by this node
 *
 * @property {TerminalSymbol} symbol the symbol represented by this node
 * @property {string} data the recognized string
 * @property {Position} pos the token poisition in the text
 * 
 * @constructor
 * @author Alessio Scalici
 */
var TerminalNode = function(symbol)  {
    this.symbol = symbol;
    this.data = '';
    this.pos = new Position();
};


/**
 * Returns the TerminalNode position (pos property).
 * Consistent with NonTerminalNode
 * 
 * @return {Position} the TerminalNode position
 */
TerminalNode.prototype.getPosition = function () {
    return this.pos;
};


/**
 * Returns true if the token is an end-of-stream token
 * 
 * @return {boolean} true if this is the end-of-stream token
 */
TerminalNode.prototype.isEOS = function () {
    return this.symbol.index === SpecialSymbol.EOS.code;
};


/**
 * Returns true if the token is an error token
 * 
 * @return {boolean} true if this is the error token
 */
TerminalNode.prototype.isError = function () {
    return this.symbol.index === SpecialSymbol.ERROR.code;
};


/**
 * Returns the TerminalNode data length (the length of the recognized string).
 * Consistent with NonTerminalNode
 * 
 * @return {number} the TerminalNode data length
 */
TerminalNode.prototype.getLength = function () {

    return ((!this.data || this.data === '') ? 0 : this.data.length);
};


/**
 * Returns a string representation of this node
 * 
 * @return {string} a string representation of this node
 */
TerminalNode.prototype.toString = function () {
    return this.symbol.toString() + "[" + this.data + "] pos: " + this.pos.index + " (" + this.pos.line + "," + this.pos.col + "), len: " + this.getLength();
};


/**
 * Checks for equality
 * 
 * @param {object} the object to compare
 * 
 * @return {boolean} true if the object equals
 */
TerminalNode.prototype.equals = function (o) {
    if (o === this) {
        return true;
    }
    if (!(o instanceof TerminalNode)) {
        return false;
    }
    return (
        ((!this.symbol && !o.symbol) || this.symbol && this.symbol.equals(o.symbol)) &&
        ((!this.data && !o.data) || this.data && this.data === o.data) &&
        ((!this.pos && !o.pos) || this.pos && this.pos.equals(o.pos))
    );
};
/**
 * 
 * A terminal symbol
 * 
 * 
 * @param {string} name the symbol name
 * @param {number} index the symbol index
 *
 *
 * @property {string} name the name of the symbol
 * @property {number} index the index of the symbol
 * 
 * @constructor
 * @author Alessio Scalici
 */
var TerminalSymbol = function(name, index)  {

    this.name = name;
    this.index = index;
};


/**
 * Sets the display name
 * 
 * @param {string} disp the new display name
 */
//FIXME used??? turn to assignment to display property
TerminalSymbol.prototype.setDisplayName = function(disp) {
    this.display = disp;
};


/**
 * Gets the display name
 * 
 * @return {string} the display name
 */
TerminalSymbol.prototype.getDisplayName = function () {
    if (!this.display) {
        return this.name;
    }
    return this.display;
};


/**
 * Returns a string representation of this symbol
 * 
 * @return {string} a string representation of this symbol
 */
TerminalSymbol.prototype.toString = function () {
    return this.name;
};


/**
 * Every symbol has unique name, so symbols with the same name are the same symbol
 * 
 * @return {boolean} true if the parameter equals this instance
 */
TerminalSymbol.prototype.equals = function(o) {
    if (o === this) {
        return true;
    }
    if (!(o instanceof TerminalSymbol)) {
        return false;
    }
    return (this.name === o.name);
};

    ptq.ErrorType = ErrorType;
    return ptq;

})();