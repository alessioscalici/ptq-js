describe("Parser", function() {

    var parser;

    

    beforeEach(function(){

        var des = new Deserializer('d0d4d19ec987e4e5e6e1f5ecf49e8180809ed3c38a9f819ff7f7819fe4e4829f898da0a0819fe5e5819fa1a1819ff2f2819fefef819fecec819fe8e8819facacd4879f869f85dfc5cfd3df8087dfc5d2d2cfd2df8084c2c1cec781a185c3cfcdcdc181ac85c8c5cccccf85e8e5ececef85d7cfd2ccc485f7eff2ece48ad7c8c9d4c5d3d0c1c3c580c4819fc484ede1e9eef38e9f859f81838282838689858d84e58e9f8b8c878687858a8b87858686878887888981808382848a838081898c8d86808580838382808284808488e1819fe9869ed0f79ed3879f8685f3f4e1f2f49e869ed2839f838684858486848385838686829ed4879f889f8d9f8084828280868181818084818282868283828382858284838582858480838084828380858083818582838186808382868283829e');
        parser = des.deserialize();

    });



    it("should be of type Parser", function() {
        expect(parser instanceof Parser).toBe(true);
    });

    
     describe(".parse()", function() {

        it("should return a non terminal node", function() {


            var root = parser.parse(' hello, world!! ');

            expect(root instanceof NonTerminalNode).toBe(true);

        });



        describe("- errors -", function() {

            it("should return a falsy and report a LEXICAL error", function() {

                var root = parser.parse(' hello, ERRworld!! ');

                expect(root).toBeFalsy();

                var err = parser.error;

                expect(err).toBeDefined();
                expect(err.type).toBe(ErrorType.LEXICAL_ERROR);

                expect(err.lastToken).toBeDefined();
                expect(err.lastToken.isError()).toBe(true);
                expect(err.lastToken.data).toBe('E');

                expect(err.expectedSymbols).toBeFalsy(); // only populated for SYNTAX errors

            });


            it("should return a falsy and report a SYNTAX error", function() {

                var root = parser.parse(' hello , , world!! ');

                expect(root).toBeFalsy();

                var err = parser.error;

                expect(err).toBeDefined();
                expect(err.type).toBe(ErrorType.SYNTAX_ERROR);

                expect(err.lastToken).toBeDefined();
                expect(err.lastToken.symbol.name).toBe('COMMA');
                expect(err.lastToken.data).toBe(',');
                expect(err.lastToken.pos.index).toBe(9);
                expect(err.lastToken.pos.line).toBe(1);
                expect(err.lastToken.pos.col).toBe(10);

                expect(err.expectedSymbols).toBeDefined();
                expect(err.expectedSymbols.length).toBe(1);
                expect(err.expectedSymbols[0].name).toBe('WORLD');

            });


            it("should return a falsy and report a SYNTAX error with two expected symbols", function() {

                var root = parser.parse(' hello hello , world!! ');

                expect(root).toBeFalsy();

                var err = parser.error;

                expect(err).toBeDefined();
                expect(err.type).toBe(ErrorType.SYNTAX_ERROR);

                expect(err.lastToken).toBeDefined();
                expect(err.lastToken.symbol.name).toBe('HELLO');
                expect(err.lastToken.data).toBe('hello');
                expect(err.lastToken.pos.index).toBe(7);
                expect(err.lastToken.pos.line).toBe(1);
                expect(err.lastToken.pos.col).toBe(8);

                expect(err.expectedSymbols).toBeDefined();
                expect(err.expectedSymbols.length).toBe(2);

                
                expect(err.expectedSymbols[0].name).toBe('COMMA');
                expect(err.expectedSymbols[1].name).toBe('WORLD');

            });


            it("should return an error report with a toString() method", function() {

                var root = parser.parse(' hello , ');

                expect(root).toBeFalsy();

                var err = parser.error;

                expect(err).toBeDefined();
                expect(err.toString()).toBe('SYNTAX_ERROR (1, 10) -> WORLD');

            });

        });


    });



});