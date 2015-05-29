/**
 * 
 * A rule (production) of a context-free grammar
 *
 * @param {number} index the rule's index
 * @param {NonTerminalSymbol} head the rule's LHS
 * @param {Symbol[]} tail the rule's RHS
 *
 *
 * @property {number} index the index of the rule, this must be unique among rules in the same grammar
 * @property {NonTerminalSymbol} head the rule left-hand side
 * @property {Symbol[]} tail the rule right-hand side (empty for epsilon-rules)
 * 
 * 
 * @constructor
 * @author Alessio Scalici
 */
var GrammarRule = function(index, head, tail) {

    this.index = index;
    this.head = head;
    this.tail = tail;
};


/**
 * Returns true if this is an epsilon-rule (or lambda-rule), false otherwise
 * 
 * @return {boolean} true if this is an epsilon-rule (or lambda-rule), false otherwise
 */
GrammarRule.prototype.isEpsilon = function () {
    return (this.tail.length === 0);
};


/**
 * Returns a string representation of the rule
 * 
 * @return {string} a string representation of the rule
 */
GrammarRule.prototype.toString = function () {
    var res = this.head.toString() + ' ::= ';
    for (var i=0; i<this.tail.length; ++i) {
        res += this.tail[i].toString() + ' ';
    }
    return res;
};


/**
 * Checks for equality
 * 
 * @param {object} the object to compare
 * 
 * @return {boolean} true if the object equals
 */
GrammarRule.prototype.equals = function (o) {
    if (o === this) {
        return true;
    }
    if (!(o instanceof GrammarRule)) {
        return false;
    }
    if (this.tail.length !== o.tail.length) {
        return false;
    }

    for (var i=0; i<this.tail.length; ++i) {
        if (!this.tail[i].equals(o.tail[i])) {
            return false;
        }
    }
    return ((!this.head && !o.head) || this.head && this.head.equals(o.head));
};