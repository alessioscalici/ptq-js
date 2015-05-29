describe("IndentBasedScanner", function() {

    var scanner;

    

    beforeEach(function(){

        var parser = ptq.deserialize('d0d4d19ec986e9eee4e5eef49e8180809ed3c38c9f819fa1a1819ff2f2819fe4e4819fe5e5819ff7f7819fe8e8829f8989a0a0819f8a8a819facac819fecec819f8d8d819fefefd48a9f889f85dfc5cfd3df8087dfc5d2d2cfd2df8087dfc2c5c7c9cedf8085dfc5cec4df8084c2c1cec781a185c3cfcdcdc181ac85c8c5cccccf85e8e5ececef85d7cfd2ccc485f7eff2ece486c9cec4c5ced48087cec5d7ccc9cec580c4819fc484ede1e9eef3909f869f82858589868887848b878f86e5919f808385898a898e8f8b8082888087808a8b828d8e8980818a808484838c8386868681858784888b8c8d89808587808686888981e1839fe988e888e9899ed0f79ed3899f8885f3f4e1f2f49e889ed2839f838886878488868587838888849ed4879f8a9f8d9f8086828180888182818582848187828582808482848283838083828384838284878286858083808584838086808381868483819e');
        scanner = parser.scanner;
    });



    it("should be of type Scanner", function() {
        expect(scanner instanceof Scanner).toBe(true);
    });

    it("should be indent based", function() {
        expect(scanner.indentBased).toBe(true);
    });

    
    describe(".scan()", function() {

        it("should return the expected sequence of tokens", function() {


            scanner.setSource(' hello, world!! ');

            var expectedData = ['hello', ',', 'world', '!', '!'],
                expectedSymbolName = ['HELLO', 'COMMA', 'WORLD', 'BANG', 'BANG'];

            for (var i = 0, token = scanner.scan(); !token.isEOS(); ++i, token = scanner.scan()) {
                
                expect(token.data).toBe(expectedData[i]);
                expect(token.symbol.name).toBe(expectedSymbolName[i]);
            }
        });


        it("should return the expected _BEGIN_ and _END_ tokens", function() {


            scanner.setSource(' hello \n   world!');

            var expectedSymbolName = ['HELLO', '_BEGIN_', 'WORLD', 'BANG', '_END_'];

            for (var i = 0, token = scanner.scan(); !token.isEOS(); ++i, token = scanner.scan()) {
                
                expect(token.symbol.name).toBe(expectedSymbolName[i]);
            }
        });



    });



});