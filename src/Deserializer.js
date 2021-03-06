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


