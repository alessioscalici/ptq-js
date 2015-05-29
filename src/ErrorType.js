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