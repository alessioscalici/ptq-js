describe('TerminalNode', function() {


    var node,
        symbol;

    beforeEach(function(){
        symbol = new TerminalSymbol('symbolName', 6);
        node = new TerminalNode(symbol);
    });

    it("should be of type TerminalNode", function() {
        expect(node instanceof TerminalNode).toBe(true);
    });

    it("should have symbol, data and pos properties", function() {
        expect(node.symbol).toBeDefined();
        expect(node.symbol instanceof TerminalSymbol).toBe(true);
        expect(node.data).toBeDefined();
        expect(typeof node.data).toBe('string');
        expect(node.pos).toBeDefined();
        expect(node.pos instanceof Position).toBe(true);
    });


    describe('.isError()', function() {
        it('should return false if the symbol is NOT the special ERROR symbol', function() {
            expect(node.isError()).toBe(false);
        });

        it('should return true if the symbol is the special ERROR symbol', function() {
            node = new TerminalNode(new TerminalSymbol('ERROR', SpecialSymbol.ERROR.code));
            expect(node.isError()).toBe(true);
        });
    });

    describe('.isEOS()', function() {
        it('should return false if the symbol is NOT the special EOS symbol', function() {
            expect(node.isEOS()).toBe(false);
        });

        it('should return true if the symbol is the special EOS symbol', function() {
            node = new TerminalNode(new TerminalSymbol('EOS', SpecialSymbol.EOS.code));
            expect(node.isEOS()).toBe(true);
        });
    });

    describe('.getLength()', function() {
        it('should return 0 if data is falsy', function() {
            node.data = undefined;
            expect(node.getLength()).toBe(0);
        });

        it('should return 0 if the symbol is the special EOS symbol', function() {
            node = new TerminalNode(new TerminalSymbol('EOS', SpecialSymbol.EOS.code));
            expect(node.getLength()).toBe(0);
        });

        it('should return the data string length', function() {
            node.data = 'pippo';
            expect(node.getLength()).toBe(node.data.length);
        });
    });


    describe('.toString()', function() {
        it('should return a string in the right format', function() {
            node.data = 'pippo';
            expect(node.toString()).toBe(node.symbol.toString()+"["+node.data+"] pos: "+node.pos.index+" ("+node.pos.line+","+node.pos.col+"), len: "+node.getLength());
        });
    });


    describe('.equals()', function(){


        it("should equal himself", function() {
            expect(node.equals(node)).toBe(true);
        });

        it("should equal another TerminalNode with the same data", function() {
            var node2 = new TerminalNode(symbol);
            expect(node.equals(node2)).toBe(true);
        });

        it("should not equal another TerminalNode with the a different symbol", function() {
            var node2 = new TerminalNode(new TerminalSymbol('aname', 77));
            expect(node.equals(node2)).toBe(false);
        });

        it("should not equal a non TerminalNode value", function() {
            expect(node.equals()).toBe(false);
            expect(node.equals({})).toBe(false);
            expect(node.equals(123)).toBe(false);
            expect(node.equals([5])).toBe(false);
        });
    });
});
