describe("InputStream", function() {




    it("should be of type InputStream", function() {
        var bd = new InputStream('');
        expect(bd instanceof InputStream).toBe(true);
    });

    it("should throw an error if initialized with an odd-length string", function() {

        var is;
        try {
            is = new InputStream('49E299A54E593');
        } catch (e) {
            expect(e).toBeDefined();
        }
        expect(is).toBeUndefined();

    });




    it("should return -1 if the stream ends", function() {

        var is = new InputStream('04ff');

        expect(is.read()).toBe(-124);
        expect(is.read()).toBe(127);
        expect(is.read()).toBe(-1);
    });






});