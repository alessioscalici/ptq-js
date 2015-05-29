/**
 * 
 * An enum type that defines LR action types (SHIFT, REDUCE, GOTO, ACCEPT)
 * 
 * 
 * @param {string} name the enum element name
 * @param {number} code the enum element numeric code
 * 
 * @constructor
 * @author Alessio Scalici
 */
var LRActionType = function(name, code)  {
    this.name = name;
    this.code = code;
};

/** Do nothing, no action defined for this state-symbol */
LRActionType.NONE = new LRActionType('NONE', 0);

/** Goto another symbol */
LRActionType.GOTO = new LRActionType('GOTO', 1);

/** Shift to next symbol */
LRActionType.SHIFT = new LRActionType('SHIFT', 2);

/** Reduce the rule */
LRActionType.REDUCE = new LRActionType('REDUCE', 3);

/** Accepts the input */
LRActionType.ACCEPT = new LRActionType('ACCEPT', 4);


/**
 * Returns the code
 * 
 * @return {number} the code of the enum element
 */
// FIXME is it used somewhere?
LRActionType.prototype.toInt = function () {
    return this.code;
};


/**
 * Returns the name of the enum element
 * 
 * @return {string} the name of the enum element
 */
// FIXME is it used somewhere?
LRActionType.prototype.toString = function () {
    return this.name;
};


/**
 * Returns the enum element, given its code
 * 
 * @param {number} code the enum code
 * @return {LRActionType} the enum element, given its code
 */
// FIXME is it used somewhere?
LRActionType.get = function (code) {
    var ar = [
        LRActionType.NONE,
        LRActionType.GOTO,
        LRActionType.SHIFT,
        LRActionType.REDUCE,
        LRActionType.ACCEPT
    ];
    return ar[code];
};