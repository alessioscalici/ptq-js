

describe("GrammarRule", function() {

    var rule;

    beforeEach(function(){
        rule = new GrammarRule(
            12,
            new NonTerminalSymbol('expr', 2),
            [new NonTerminalSymbol('number', 3), new TerminalSymbol('plusplus', 4)]
        );
    });

    it("should be of type GrammarRule", function() {
        expect(rule instanceof GrammarRule).toBe(true);
    });

    it("should set the internal properties", function() {

        expect(rule.index).toBeDefined();
        expect(typeof rule.index).toBe('number');

        expect(rule.head).toBeDefined();
        expect(rule.head instanceof NonTerminalSymbol).toBe(true);

        expect(rule.tail).toBeDefined();
        expect(typeof rule.tail).toBe('object');

    });


    describe('.equals()', function(){

        it('should equal itself', function() {
            expect(rule.equals(rule)).toBe(true);
        });

        it('should equal a position with the same properties', function() {
            var rule2 = new GrammarRule(rule.index, rule.head, rule.tail);
            expect(rule.equals(rule2)).toBe(true);
        });

        it('should NOT equal a non GrammarRule object', function() {
            expect(rule.equals()).toBe(false);
            expect(rule.equals({})).toBe(false);
            expect(rule.equals(true)).toBe(false);
            expect(rule.equals([1,2,3])).toBe(false);
        });


        it('should NOT equal a GrammarRule object with different head', function() {
            expect(rule.equals(new GrammarRule(rule.index, new NonTerminalSymbol('me', 45), rule.tail))).toBe(false);
        });

        it('should NOT equal a GrammarRule object with different tail', function() {
            expect(rule.equals(new GrammarRule(rule.index, rule.head, [new NonTerminalSymbol('number', 3), new TerminalSymbol('minusminus', 4)]))).toBe(false);
            expect(rule.equals(new GrammarRule(rule.index, rule.head, []))).toBe(false);

        });


    });


    describe('.isEpsilon()', function(){

        it('should return false if the rule has elements in the tail', function() {
            expect(rule.isEpsilon()).toBe(false);
        });

        it('should return true if the rule has NO elements in the tail', function() {
            rule.tail = [];
            expect(rule.isEpsilon()).toBe(true);
        });
    });

    describe('.toString()', function(){

        it('should match the right format', function() {
            expect(!!rule.toString().match(/<[a-zA-Z_0-9]+>\s::= (<?[a-zA-Z_0-9]+>?\s)*/)).toBe(true);
        });
    });

});