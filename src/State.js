/**
 *
 * A scanner DFA state, it has an edge collection that links it to
 * other states.
 * 
 * 
 * @param {TerminalSymbol} [acceptedSymbol] the symbol accepted by this state (if it's a final state). If not passed, the state will be non-final
 *
 *
 * @property {TerminalSymbol} acceptedSymbol the symbol accepted by this state. If this is not a final state, is null
 * @property {Edge[]} edges the outgoing DFA edges
 *
 * 
 * @constructor
 * @author Alessio Scalici
 */
var State = function(acceptedSymbol) {

    this.acceptedSymbol = acceptedSymbol || null;
    this.edges = null;

};


/**
 * Returns true if this is a final state, false otherwise
 * 
 * @return {boolean} true if this is a final state, false otherwise
 */
State.prototype.isFinal = function() {
    return !!this.acceptedSymbol;
};