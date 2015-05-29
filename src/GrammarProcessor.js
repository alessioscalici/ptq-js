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