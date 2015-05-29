

describe("NonTerminalNode", function() {

    var node, 
        rule,
        node2;

    var ideSymbol = new TerminalSymbol('ide', 3),
        plusplusSymbol = new TerminalSymbol('plusplus', 4);


    var initNode = function(rule) {

        var rule = new GrammarRule(
            12,
            new NonTerminalSymbol('expr', 2),
            [ideSymbol, plusplusSymbol]
        );

        var node = new NonTerminalNode(rule);

        var ideChild = new TerminalNode(ideSymbol);
        ideChild.pos = new Position(0,0,0);
        ideChild.data = 'pippo';

        var plusplusChild = new TerminalNode(plusplusSymbol);
        plusplusChild.pos = new Position(0,7,7);
        plusplusChild.data = '++';

        node.children = [ideChild, plusplusChild];

        return node;
    };

    beforeEach(function(){

        node = initNode();
        node2 = initNode();
    });



    it("should be of type NonTerminalNode", function() {
        expect(node instanceof NonTerminalNode).toBe(true);
    });

    it("should set the internal properties", function() {

        expect(node.rule).toBeDefined();
        expect(node.rule instanceof GrammarRule).toBe(true);


    });


    describe('.equals()', function(){

        it('should equal itself', function() {
            expect(node.equals(node)).toBe(true);
        });

        
        it('should equal an equivalent node (equivalent rule, equivalent children)', function() {
            expect(node.equals(node2)).toBe(true);
        });


        it('should NOT equal a non NonTerminalNode object', function() {
            expect(node.equals()).toBe(false);
            expect(node.equals({})).toBe(false);
            expect(node.equals(true)).toBe(false);
            expect(node.equals([1,2,3])).toBe(false);
            expect(node.equals(rule)).toBe(false);
        });


        it('should NOT equal an equivalent node if it has a different number of children', function() {
            var minusminusChild = new TerminalNode(ideSymbol);
            minusminusChild.pos = new Position(0,10, 9);
            minusminusChild.data = '--';

            node2.addChildLast(minusminusChild);
            expect(node.equals(node2)).toBe(false);
        });


        it('should NOT equal an equivalent node if it has a not equivalent child', function() {
            node2.children[1].symbol = new TerminalSymbol('minusminus', 5);
            expect(node.equals(node2)).toBe(false);
        });


    });

    describe('.toString()', function() {
        it('should return a string in the right format', function() {

            var pos = node.getPosition();
            expect(node.toString()).toBe(node.rule.toString()+" ||  pos: "+pos.index+" ("+pos.line+","+pos.col+"), len: "+node.getLength());
        });

    });


    describe('.getLength()', function(){

        it('should be from the index of the first child to the last child index+length', function() {

            var firstChildIndex = node.children[0].pos.index;
            var lastChildIndex = node.children[node.children.length-1].pos.index;
            var lastChildLength = node.children[node.children.length-1].getLength();

            var value = lastChildIndex + lastChildLength - firstChildIndex;

            expect(node.getLength()).toBe(value);
        });


        it('should return 0 for a lambda rule node (no children)', function() {

            node.children = undefined;

            expect(node.getLength()).toBe(0);

            node.children = [];

            expect(node.getLength()).toBe(0);
        });

    });



    describe('.getPosition()', function(){

        it('should return the first child position', function() {
            expect(node.getPosition().equals(node.children[0].getPosition())).toBe(true);
        });

        it('should return the 0 position if it has no child and no parent', function() {
            node.children = undefined;
            node.parent = undefined;
            expect(node.getPosition().equals(new Position())).toBe(true);
        });

        it('should return the next sibling position if it has no children, has a parent and has a next sibling', function() {
            node.children = undefined;
            node2.addChildFirst(node);
            expect(node.getPosition().equals(node2.children[1].getPosition())).toBe(true);
        });

        it('should return the 0 position if it has no children, has a parent and has NOT a next sibling', function() {
            node.children = undefined;
            node2.addChildLast(node);
            expect(node.getPosition().equals(new Position())).toBe(true);
        });

    });
    

    describe('.addChildFirst()', function(){

        var newChild;
        beforeEach(function(){
            newChild = new TerminalNode(new TerminalSymbol('aSymbol', 4));
            
        });

        it('should add a child in the beginning', function() {
            var prevSize = node.children.length;
            node.addChildFirst(newChild);
            expect(node.children.length).toBe(prevSize+1);
            expect(node.children[0]).toBe(newChild);
        });

        it('should set the parent of the child as this node', function() {

            node.addChildFirst(newChild);
            expect(newChild.parent).toBe(node);
        });

    });


    describe('.addChildLast()', function(){

        var newChild;
        beforeEach(function(){
            newChild = new TerminalNode(new TerminalSymbol('aSymbol', 4));
            
        });

        it('should add a child in the beginning', function() {
            var prevSize = node.children.length;
            node.addChildLast(newChild);
            expect(node.children.length).toBe(prevSize+1);
            expect(node.children[node.children.length-1]).toBe(newChild);
        });

        it('should set the parent of the child as this node', function() {

            node.addChildLast(newChild);
            expect(newChild.parent).toBe(node);
        });

    });


    describe('.treeToString()', function(){

        it('should return a string', function() {
            
            var str = node.treeToString();
            expect(typeof str).toBe('string');

        });


    });

});