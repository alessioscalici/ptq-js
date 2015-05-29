describe("TerminalSymbol", function() {


    var s1,
        s1Name = 'name'
        s1Index = 0;

    beforeEach(function(){
        s1 = new TerminalSymbol(s1Name, s1Index);
    });

    it("should be of type TerminalSymbol", function() {
        expect(s1 instanceof TerminalSymbol).toBe(true);
    });

    it("should set the name and index properties", function() {
        expect(s1.name).toBe(s1Name);
        expect(s1.index).toBe(s1Index);
    });


    describe('.equals()', function(){


        it("should equal himself", function() {
            expect(s1.equals(s1)).toBe(true);
        });

        it("should equal another Terminal symbol with the same name", function() {
            var s2 = new TerminalSymbol(s1.name, 1);
            expect(s1.equals(s2)).toBe(true);
        });

        it("should not equal another Terminal symbol with the a different name", function() {
            var s2 = new TerminalSymbol('different name', 1);
            expect(s1.equals(s2)).toBe(false);
        });

        it("should not equal a falsy value", function() {
            expect(s1.equals()).toBe(false);
        });
    });


    it("toString() should return his name", function() {
        expect(s1.toString()).toBe(s1Name);
    });


    it("setDisplayName() should set the display property", function() {
        var display = 'Display name';
        s1.setDisplayName(display);
        expect(s1.display).toBe(display);
    });

    it("getDisplayName() should return the display name if set", function() {
        var display = 'Display name';
        s1.setDisplayName(display);
        expect(s1.getDisplayName()).toBe(display);
    });

    it("getDisplayName() should return the name if the display name is NOT set", function() {

        expect(s1.getDisplayName()).toBe(s1.name);
    });

});
