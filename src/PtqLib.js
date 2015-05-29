/**
 * 
 * The PTQ library object.
 * Contains information about the library (e.g. version) and global methods (deserialize)
 *
 * @property {number} MAJOR_VERSION the PTQ library major version
 * @property {number} MINOR_VERSION the PTQ library minor version
 * @property {number} PATCH_VERSION the PTQ library patch version
 * 
 * @namespace
 * @author Alessio Scalici
 */
var ptq = {

    MAJOR_VERSION : 1,
    MINOR_VERSION : 0,
    PATCH_VERSION : 0,


    /**
     * Deserialize the PTQ stream in input (encoded as an hexadecimal string), returning the resulting Parser or Scanner
     * 
     * @param  {string} is the PTQ stream, encoded as an hexadecimal string
     * 
     * @return {Scanner|Parser} the Scanner (or Parser) deserialized from the input string
     */
    deserialize : function (is) {
        var des = new Deserializer(is);
        return des.deserialize();
    }

};
