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