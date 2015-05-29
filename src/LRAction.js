/**
 * 
 * An LR parser action. Tells the parser to shift to the next token, reduce a rule, goto a state
 * or to accept the input.
 *
 * @param {LRActionType} actionType the LR action type
 * @param {number} targetIndex the LR action type
 *
 *
 * @property {LRActionType} type the action to take LRActionType(SHIFT,REDUCE,GOTO,ACCEPT,NONE)
 * @property {number} targetIndex the target rule index (if REDUCE)
 * 
 * 
 * @constructor
 * @author Alessio Scalici
 */
var LRAction = function(actionType, targetIndex) {

    this.type = actionType;
    this.targetIndex = (typeof targetIndex === 'number') ? targetIndex : -1;

};


/**
 * Returns a string representation of the action
 *
 * @return {string} a string representation of the action
 */
LRAction.prototype.toString = function () {
    if (this.targetIndex >= 0) {
        return this.type.toString() + ' ' + this.targetIndex;
    }
    return this.type.toString();
};