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