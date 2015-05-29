describe("State", function() {

    var state;

    

    beforeEach(function(){

        state = new State();
    });



    it("should be of type State", function() {
        expect(state instanceof State).toBe(true);
    });

    it("should be non-final by default", function() {

        expect(state.isFinal()).toBe(false);

    });

    it("should be final if it has an accepted symbol", function() {

        state.acceptedSymbol = new TerminalSymbol('name', 6);
        expect(state.isFinal()).toBe(true);

    });



});