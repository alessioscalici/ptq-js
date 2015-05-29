/*


 
----------------------------------------------
main

    WHITESPACE  ^ [:space:]+  $ -ignore

    HELLO   ^ hello  $

    WORLD   ^ world  $

    COMMA   ^ ,  $

    BANG    ^ !  $



 */

describe("Scanner_default", function() {

    var scanner;

    

    beforeEach(function(){

        scanner = ptq.deserialize('d0d4d19ec987e4e5e6e1f5ecf49e8180809ed3c38a9f819ff7f7819fe4e4829f898da0a0819fe5e5819fa1a1819ff2f2819fefef819fecec819facac819fe8e8d4879f869f85dfc5cfd3df8087dfc5d2d2cfd2df8084c2c1cec781a185c3cfcdcdc181ac85c8c5cccccf85e8e5ececef85d7cfd2ccc485f7eff2ece48ad7c8c9d4c5d3d0c1c3c580c4819fc484ede1e9eef38e9f859f82868482868387848a85e58e9f8085898086888282828381868d8a818b8887818c858082828c8d87858b83808380808484888987898786e1819fe9869e');


    });



    it("should be of type Scanner", function() {
        expect(scanner instanceof Scanner).toBe(true);
    });

    it("should NOT be index based", function() {
        expect(scanner.indentBased).toBeFalsy();
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


        it("should return the expected positions", function() {


            scanner.setSource(' hello, \nworld ! \n ! ');

            var expectedData = ['hello', ',', 'world', '!', '!'],
                expectedSymbolName = ['HELLO', 'COMMA', 'WORLD', 'BANG', 'BANG'],
                expectedIndex = [1, 6, 9, 15, 19],
                expectedLine = [1, 1, 2, 2, 3],
                expectedCol = [2, 7, 1, 7, 2];

            for (var i = 0, token = scanner.scan(); !token.isEOS(); ++i, token = scanner.scan()) {
                
                expect(token.data).toBe(expectedData[i]);
                expect(token.symbol.name).toBe(expectedSymbolName[i]);

                expect(token.pos.index).toBe(expectedIndex[i]);
                expect(token.pos.line).toBe(expectedLine[i]);
                expect(token.pos.col).toBe(expectedCol[i]);

            }
        });

        it("should return a burst of errors with the first unexpected character in case of error", function() {


            scanner.setSource(' hello, \nERRworld ! \n ! ');

            var expectedData = ['hello', ',', 'E','R','R', 'world', '!', '!'],
                expectedSymbolName = ['HELLO', 'COMMA', '_ERROR_','_ERROR_','_ERROR_', 'WORLD', 'BANG', 'BANG'],
                expectedIndex = [1, 6, 9, 10,11,12, 18, 22],
                expectedLine = [1, 1, 2, 2, 2, 2, 2, 3],
                expectedCol = [2, 7, 1,2,3, 4, 10, 2];

            for (var i = 0, token = scanner.scan(); !token.isEOS(); ++i, token = scanner.scan()) {

                //console.log(token.pos);
                
                expect(token.data).toBe(expectedData[i]);
                expect(token.symbol.name).toBe(expectedSymbolName[i]);

                expect(token.pos.index).toBe(expectedIndex[i]);
                expect(token.pos.line).toBe(expectedLine[i]);
                expect(token.pos.col).toBe(expectedCol[i]);

            }
        });


    });



});