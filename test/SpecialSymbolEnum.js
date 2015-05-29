

describe("SpecialSymbol", function() {


    it("have the fout properties defined", function() {

        expect(SpecialSymbol.EOS).toBeDefined();
        expect(SpecialSymbol.ERROR).toBeDefined();
        expect(SpecialSymbol.BEGIN).toBeDefined();
        expect(SpecialSymbol.END).toBeDefined();
    });

});