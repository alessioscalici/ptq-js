describe("PtqLib", function() {


    it("should be an object", function() {
        expect(typeof ptq).toBe('object');
    });

    it("should have MAJOR_VERSION property", function() {
        expect(ptq.MAJOR_VERSION).toBeDefined();
        expect(typeof ptq.MAJOR_VERSION).toBe('number');
    });
    it("should have MINOR_VERSION property", function() {
        expect(ptq.MINOR_VERSION).toBeDefined();
        expect(typeof ptq.MINOR_VERSION).toBe('number');
    });
    it("should have PATCH_VERSION property", function() {
        expect(ptq.PATCH_VERSION).toBeDefined();
        expect(typeof ptq.PATCH_VERSION).toBe('number');
    });

});