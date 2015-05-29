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