

describe("NonTerminalSymbol", function() {


    it("should be of type NonTerminalSymbol", function() {
        var bd = new NonTerminalSymbol('name', 0);
        expect(bd instanceof NonTerminalSymbol).toBe(true);
    });

    it("should set the name and index properties", function() {
        var bd = new NonTerminalSymbol('name', 0);
        expect(bd.name).toBe('name');
        expect(bd.index).toBe(0);
    });


    describe('.equals()', function(){

        var s1;

        beforeEach(function(){
            s1 = new NonTerminalSymbol('name', 0);
        });

        it("should equal himself", function() {
            expect(s1.equals(s1)).toBe(true);
        });

        it("should equal another NonTerminalSymbol with the same name", function() {
            var s2 = new NonTerminalSymbol(s1.name, 1);
            expect(s1.equals(s2)).toBe(true);
        });

        it("should not equal another NonTerminalSymbol with the a different name", function() {
            var s2 = new NonTerminalSymbol('different name', 1);
            expect(s1.equals(s2)).toBe(false);
        });

        it("should not equal a falsy value", function() {
            expect(s1.equals()).toBe(false);
        });
    });

    it("toString() should return his name surrounded by <>", function() {
        var name = 'name';
        var s1 = new NonTerminalSymbol(name, 0);
        expect(s1.toString()).toBe('<' + name + '>');
    });




});