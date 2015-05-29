/**
 * 
 * Constants used in the serialized PTQ streams
 * 
 * @readonly
 * @enum {number}
 * @author Alessio Scalici
 */
var PtqFileConst = {
    
    BYTE_RECORD_SEPARATOR : 30,
    BYTE_UNIT_SEPARATOR : 31,
    
    BEGIN_INFO_SECTION : 73,				// I
    BEGIN_SCANNER_SECTION : 83,				// S
    BEGIN_CHARACTER_SET_SECTION : 67,		// C
    BEGIN_TERMINAL_SECTION : 84,			// T
    BEGIN_DFA_SECTION : 68,					// D
    BEGIN_SINGLE_DFA : 68,					// d
    BEGIN_DFA_STATE_SECTION : 115,			// s
    BEGIN_DFA_EDGE_SECTION : 101,			// e
    BEGIN_DFA_ACTION_SECTION : 97,			// a
    
    DFA_ACTION_IGNORE : 105,				// i
    DFA_ACTION_NEWLINE : 110,				// n
    DFA_ACTION_PUSHBACK : 112,				// p
    DFA_ACTION_BEGIN : 115,				// s
    DFA_ACTION_END : 101,					// e
    DFA_ACTION_GOTO : 103,					// g
    DFA_ACTION_INDENT : 104,				// h
    
    // Parser
    
    BEGIN_PARSER_SECTION : 80,				// P
    
    PARSER_TYPE_LR0 : 121,					// y
    PARSER_TYPE_SLR : 120,					// x
    PARSER_TYPE_LR1 : 119,					// w
    PARSER_TYPE_LALR1 : 118,				// v
    PARSER_TYPE_LRED1 : 117,				// u
    
    BEGIN_SYMBOL_SECTION : 83,				// S
    BEGIN_RULE_SECTION : 82,				// R
    BEGIN_TABLE_SECTION : 84				// T
};