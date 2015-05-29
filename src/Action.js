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