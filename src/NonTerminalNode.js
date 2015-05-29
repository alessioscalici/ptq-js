/**
 * 
 * A parse tree non-terminal node.
 * It can have one or more child (nodes without child are terminal).
 * The root of a parse tree is always a non-terminal node
 * 
 * 
 * @param {GrammarRule} rule the rule reduced to create this node
 *
 *
 * @property {NonTerminalSymbol} symbol symbol represented by this node (the rule head)
 * @property {GrammarRule} rule the rule reduced to obtain this node
 * @property {TerminalNode|NonTerminalNode[]} children the children nodes
 * 
 * 
 * @constructor
 * @author Alessio Scalici
 */
var NonTerminalNode = function(rule)  {

    this.symbol = rule.head;
    this.rule = rule;
    this.children = [];
};


/**
 * Returns the calculated NonTerminalNode position (based on children TerminalNodes)
 * @return {Position} the calculated NonTerminalNode position
 */
NonTerminalNode.prototype.getPosition = function () {
    if (!this.children || !this.children.length)
    {
        if (this.parent) {
            var index = this.parent.children.indexOf(this);
            if (index < this.parent.children.length-1) {
                return this.parent.children[index +1].getPosition();
            }
            return new Position();
        } else {
            return new Position();
        }
    }

    return this.children[0].getPosition();
};


/**
 * Returns the calculated length position (based on children TerminalNodes)
 * @return {number} the calculated node length 
 */
NonTerminalNode.prototype.getLength = function () {

    if (!this.children || !this.children.length || !this.getPosition() || !this.children[this.children.length-1].getPosition()) {
        return 0;
    }
    var last = this.children[this.children.length-1];
    return last.getPosition().index + last.getLength() - this.getPosition().index;
};


/**
 * Adds a child node in the first position
 * 
 * @param {TerminalNode|NonTerminalNode} child the node to add as a child
 */
NonTerminalNode.prototype.addChildFirst = function (child) {
    this.children.unshift(child);
    child.parent = this;
};


/**
 * Adds a child node in the last position
 * 
 * @param {TerminalNode|NonTerminalNode} child the node to add as a child
 */
NonTerminalNode.prototype.addChildLast = function (child) {
    this.children.push(child);
    child.parent = this;
};


/**
 * Returns a string representation of the node
 * 
 * @param {string} a string representation of the node
 */
NonTerminalNode.prototype.toString = function () {
    var pos = this.getPosition();
    return this.rule.toString() + " ||  pos: " + pos.index + " (" + pos.line + "," + pos.col + "), len: " + this.getLength();
};


/**
 * Checks for equality
 * 
 * @param {object} the object to compare
 * 
 * @return {boolean} true if the object equals
 */
NonTerminalNode.prototype.equals = function (o) {
    if (o === this) {
        return true;
    }
    if (!(o instanceof NonTerminalNode)) {
        return false;
    }

    if (this.children.length !== o.children.length) {
        return false;
    }

    for (var i=0; i<this.children.length; ++i) {
        if (!this.children[i].equals(o.children[i])) {
            return false;
        }
    }
    return (!this.rule && !o.rule) || this.rule && this.rule.equals(o.rule);
};


/**
 * Returns a string representing the tree (human readable)
 * 
 * @return {string} a string representation of the tree
 */
NonTerminalNode.prototype.treeToString = function (deep) {

    deep = deep || 0;

    var t = function(deep){
        var s = '';
        for (var i = 0; i < deep; ++i) {
            s += i < deep - 1 ? '| ' : '|-';
        }
        s += '-';
        return s;
    };

    var str = '\n' + t(deep) + this.toString();
    if (this.children) {
        for (var i = 0; i < this.children.length; ++i) {
            
            if (this.children[i] instanceof NonTerminalNode) {
                str += this.children[i].treeToString(deep + 1);
            } else {
                str += '\n' + t(deep + 1) + this.children[i].toString();
            }
        }
    }
    return str;
};