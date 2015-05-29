/**
 * 
 * A source reader, provides a way to unread characters
 *
 * @param {string} source the source code to read
 *
 * @property {string} source the source string
 * @property {number} cnt the current index in the string 
 * 
 * @constructor
 * @author Alessio Scalici
 */
var PushbackReader = function(source) {

    this.source = source;
    this.cnt = 0;

};


/**
 * Returns the next codepoint in the source
 *
 * @return {number} the next codepoint in the source
 */
PushbackReader.prototype.read = function() {
    return this.source.charCodeAt(this.cnt++);
};


/**
 * Returns a string formed by the last amt read characters
 * 
 * @param {number} amt the number of characters to fetch
 * 
 * @return {string} a string formed by the last amt read characters
 */
//FIXME test with double character SS german
PushbackReader.prototype.lastString = function(amt) {
    return this.source.substring(this.cnt - amt, this.cnt);
};


/**
 * Un-reads a character. It will be re-read calling the read() method
 *
 * @param {number} amt the number of characters to unread
 * 
 */
PushbackReader.prototype.unread = function(amt) {
    amt = amt || 1;
    this.cnt -= amt;
};


/**
 * Resets the PushbackReader
 */
PushbackReader.prototype.reset = function() {
    this.cnt = 0;
};