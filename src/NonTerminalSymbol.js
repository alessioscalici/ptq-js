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