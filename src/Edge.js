/**
 * 
 * Represents an edge of a scanner DFA, linking
 * two DFA states and labelled with the accepted inputs.
 * 
 * 
 * @param {State} sourceState the source state
 * @param {State} targetState the state this edge points to
 * @param {number[]} codePointSet a Set containing the inputs accepted by this edge
 *
 *
 * @property {State} sourceState the source DFA state
 * @property {State} targetState the target DFA state
 * @property {number[]} ranges (number[][]) ranges The inputs accepted by this edge
 * 
 * 
 * @constructor
 * @author Alessio Scalici
 */
var Edge = function(sourceState, targetState, codePointSet) {


    this.sourceState = sourceState;
    this.targetState = targetState;


    if (codePointSet) {

        /*
         * The inputs accepted by this edge. They are represented this way:
         * this matrix is Nx2, every row represents a continuous range of integers.
         * Here's an example:
         * [0][3]
         * [12][12]
         * [18][20]
         *
         * accepts the following inputs:
         * [0][1][2][3][12][18][19][20]
         *
         * this allows memory saving because edge accepted inputs trend to be contiguous
         */
        this.ranges = this.getRanges(codePointSet);
    }
};


/**
 * Turns an integer Set in ranges representation
 * 
 * @param {number[]} cpset the integer set
 * @return the ranges representation of the input set
 */
Edge.prototype.getRanges = function(cpset) {


    if (!cpset || !cpset.length) {
        return [];
    }

    var na,
        res = [],
        ar = cpset.slice(),
        a = ar[0],
        b = ar[0];

    for (var j=1; j<ar.length; ++j) {
        if (ar[j] === b+1) {
            b = ar[j];
            continue;
        }
        na = [];
        na.push(a);
        na.push(b);

        res.push(na);
        a = ar[j];
        b = ar[j];
    }

    na = [];
    na.push(a);
    na.push(b);
    res.push(na);

    return res;
};


/**
 * Returns true if the integer i is accepted by this edge, false otherwise
 *
 * @param {number} i the input to check
 * @return {boolean} true if the integer i is accepted by this edge, false otherwise
 */
Edge.prototype.accepts = function(i) {
    var imin = 0;
    var imax = this.ranges.length-1;
    while (imax >= imin) {
        var imid = (imin + imax) >>> 1; // (imin + imax) / 2

        if (this.ranges[imid][1] <  i) {
            imin = imid + 1;
        }
        else if (this.ranges[imid][0] > i ) {
            imax = imid - 1;
        }
        else {
            return true;
        }
    }
    // not found
    return false;
};