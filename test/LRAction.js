

describe("LRAction", function() {

    var action;

    beforeEach(function(){

        action = new LRAction(LRActionType.REDUCE, 70);
    });

    it("should be of type LRAction", function() {
        expect(action instanceof LRAction).toBe(true);
    });

    it("should set the internal properties", function() {

        expect(action.type).toBeDefined();
        expect(action.type instanceof LRActionType).toBe(true);


        expect(action.targetIndex).toBeDefined();
        expect(typeof action.targetIndex).toBe('number');

    });





    describe('.toString()', function(){

        it('should be action type name and target index', function() {
            expect(action.toString() === action.type.toString() + ' ' + action.targetIndex).toBe(true);
        });

        it('should be only action type name if target index is missing', function() {
            action = new LRAction(LRActionType.ACCEPT);
            expect(action.toString() === action.type.toString()).toBe(true);
        });
    });

});