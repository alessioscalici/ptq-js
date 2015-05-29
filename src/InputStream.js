/**
 * 
 * This object takes an hexadecimal-encoded PTQ output, and reads from it as a stream.
 *
 * @param {string} str the hexadecimal-encoded PTQ output string
 *
 * 
 * @property {string} str the hexadecimal string
 * @property {number} i the current string index
 * 
 * 
 * @constructor
 * @author Alessio Scalici
 */
var InputStream = function(str){
  if (str.length % 2 !== 0) {
    throw 'InputStream: str must be even';
  }

  this.str = str;
  this.i = 0;
};


/**
 * Read the next byte from the stream (2 hexadecimal characters)
 * 
 * @return {number} -1 if the stream is finished, the next byte otherwise
 */
InputStream.prototype.read = function(){
  if (!this.hasNext()) {
    return -1;
  }
  var res = parseInt(this.str.substring(this.i, this.i+2), 16);
  this.i = this.i + 2;
  return res - 128; // PTQ HEX adaption
};


/**
 * Return true if a .read() call would return a byte, false if the stream has finished and a .read() call would return -1
 * 
 * @return {boolean} true if a .read() call would return a byte, false if the stream has finished and a .read() call would return -1
 */
InputStream.prototype.hasNext = function(){
  return this.i < this.str.length;
};
