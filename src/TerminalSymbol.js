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