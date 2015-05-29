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