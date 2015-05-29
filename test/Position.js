

describe("Position", function() {

    var pos,
        posLine = 12,
        posCol = 50,
        posIndex = 105;

    beforeEach(function(){
        pos = new Position(posLine, posCol, posIndex);
    });

    it("should be of type Position", function() {
        expect(pos instanceof Position).toBe(true);
    });

    it("should set the internal properties", function() {

        expect(pos.line).toBe(posLine);
        expect(pos.col).toBe(posCol);
        expect(pos.index).toBe(posIndex);
    });


    describe('.equals()', function(){

        it('should equal itself', function() {
            expect(pos.equals(pos)).toBe(true);
        });

        it('should equal a position with the same properties', function() {
            var pos2 = new Position(posLine, posCol, posIndex);
            expect(pos.equals(pos2)).toBe(true);
        });

        it('should NOT equal a non Position object', function() {
            expect(pos.equals()).toBe(false);
            expect(pos.equals({})).toBe(false);
            expect(pos.equals(true)).toBe(false);
            expect(pos.equals([1,2,3])).toBe(false);
        });

        it('should NOT equal a Position object with different line', function() {
            expect(pos.equals(new Position(999, posCol, posIndex))).toBe(false);
        });

        it('should NOT equal a Position object with different column', function() {
            expect(pos.equals(new Position(posLine, 999, posIndex))).toBe(false);
        });

        it('should NOT equal a Position object with different ondex', function() {
            expect(pos.equals(new Position(posLine, posCol, 999))).toBe(false);
        });
    });


    it('.toString() should return index (line,col)', function() {
        expect(pos.toString()).toBe(pos.index + ' (' + pos.line + ',' + pos.col + ')');
    });

});