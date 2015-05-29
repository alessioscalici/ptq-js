

describe("Edge", function() {

    var edge,
        inputSet = [0,1,2,3,4,5,  23,24,25,26,  30,  35,36];

    

    beforeEach(function(){


        edge = new Edge(new State(), new State(), inputSet);
    });



    it("should be of type Edge", function() {
        expect(edge instanceof Edge).toBe(true);
    });

    it("should set the internal properties", function() {

        expect(edge.sourceState).toBeDefined();
        expect(edge.sourceState instanceof State).toBe(true);

        expect(edge.targetState).toBeDefined();
        expect(edge.targetState instanceof State).toBe(true);

        expect(edge.ranges).toBeDefined();
        expect(typeof edge.ranges).toBe('object');


    });

    describe(".getRanges()", function() {

        it("should return the correct number of ranges", function() {
            expect(edge.getRanges(inputSet).length).toBe(4);
        });

        it("should return the correct ranges", function() {

            var ranges = edge.getRanges(inputSet);
            expect(ranges[0][0]).toBe(0);
            expect(ranges[0][1]).toBe(5);

            expect(ranges[1][0]).toBe(23);
            expect(ranges[1][1]).toBe(26);

            expect(ranges[2][0]).toBe(30);
            expect(ranges[2][1]).toBe(30);

            expect(ranges[3][0]).toBe(35);
            expect(ranges[3][1]).toBe(36);
        });
    });

    describe(".accepts()", function() {

        it("should accept a value in the first range", function() {
            expect(edge.accepts(3)).toBe(true);
        });

        it("should accept a value in the last range", function() {
            expect(edge.accepts(36)).toBe(true);
        });

        it("should accept a value in a single value range", function() {
            expect(edge.accepts(30)).toBe(true);
        });

        it("should accept a value in a range border", function() {
            expect(edge.accepts(5)).toBe(true);
            expect(edge.accepts(23)).toBe(true);
        });


        it("should NOT accept a negative value", function() {
            expect(edge.accepts(-3)).toBe(false);
        });

        it("should NOT accept a value not in the ranges", function() {
            expect(edge.accepts(6)).toBe(false);
        });

    });

});