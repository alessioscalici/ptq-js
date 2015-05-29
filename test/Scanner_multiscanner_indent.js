
/*


----------------------------------------------
main

    NEWLINE ^ \n | \r\n  $ -ignore
    INDENT  ^ \t | [ ]  $ -ignore -indent


    WORD  ^ [a-zA-Z]+  $

    GOTO    ^ goto  $ -goto goto // goes to goto after reading goto

    START   ^ start  $ -start start

    PUSHBACK    ^ pushback  $ -goto goto -pushback


----------------------------------------------
goto

    NEWLINE ^ {main.NEWLINE}  $ -ignore
    INDENT  ^ {main.INDENT}  $ -ignore -indent

    GOTO_WORD  ^ [a-zA-Z]+  $
    RETURN      ^ return  $  -goto main

----------------------------------------------
start
    NEWLINE ^ {main.NEWLINE}  $ -ignore
    INDENT  ^ {main.INDENT}  $ -ignore -indent

    START_WORD  ^ [a-zA-Z]+  $
    START   ^ start  $ -start start // nested
    STOP        ^ stop  $  -stop




 */
describe("Scanner_multiscanner_indent", function() {

    var scanner;

    

    beforeEach(function(){

        scanner = ptq.deserialize('d0d4d19ec993edf5ecf4e9f3e3e1eeeee5f2dfe9eee4e5eef49e8180809ed3c3a19f839fc1dae1f4f6fa819f8a8a839fc1dae1f3f5fa839fc1dae1f2f4fa839fc1dae1f1f3fa819f8d8d839fc1dae1eff1fa839fc1dae1eef0fa839fc1dae1edeffa839fc1dae1eaecfa839fc1dae1e7e9fa839fc1dae1e4e6fa839fc1dae1e2e4fa839fc1dae1e1e3fa829fc1dae2fa819fe1e1819fe2e2819fe3e3819fe5e5819fe7e7819fe8e8829f8989a0a0819febeb819feeee839fc1dae2eef0fa819fefef819ff0f0819ff2f2819ff3f3819ff4f4859fc1dae1e6e8eff1f2f4fa819ff5f5829fc1dae1fad48e9f8c9f85dfc5cfd3df8087dfc5d2d2cfd2df8087dfc2c5c7c9cedf8085dfc5cec4df8084c7cfd4cf84e7eff4ef89c7cfd4cfdfd7cfd2c48088d0d5d3c8c2c1c3cb88f0f5f3e8e2e1e3eb86d2c5d4d5d2ce86f2e5f4f5f2ee85d3d4c1d2d485f3f4e1f2f48ad3d4c1d2d4dfd7cfd2c48084d3d4cfd084f3f4eff084d7cfd2c48086c9cec4c5ced48087cec5d7ccc9cec580c4839fc484ede1e9eef3969f949f818b828b838b848c858d868b888b898b8a8b8b888c8b8d8b8e8b8f8b908b918b9286938b948b9584e5a89f88868e8d8e9480829a8186878085819386828b86a083889d8d868a90868c8686a08a86829192969186898e868d8785818084958c8d9c949599828680898a9b80839c80869e88898f808193828c9f9486878193998f868e9586a09091918986848c86838087858e8f909286a08f908f8a8b9d93949d838682e1879fe98ce88cf38481e98df086f38681f38882c484e7eff4eff38b9f899f828583858485858586878785888c89858a8de5929f838980818a81878292858988808a8182839d8689a08989a080898483849f87898b84859b80889582898284898480879b858697808185e1849fe98ce88cf38780e98dc485f3f4e1f2f4f38c9f8a9f818c8289838984898589868a87898888898d8b89e5949f8282a087828283829885869a808a8583859983848f8882a08b839d8682a0858286808195808b9c8a89818b828280828387889d84879b848284808981e1859fe98ce88ce58ae98df388829e');


    });



    it("should be of type Scanner", function() {
        expect(scanner instanceof Scanner).toBe(true);
    });

    it("should be index based", function() {
        expect(scanner.indentBased).toBe(true);
    });

    
    describe("-goto", function() {

        it("should goto the goto target scanner when reading a goto token", function() {


            scanner.setSource(' hello  goto  hello return hello');

            var expectedData = ['hello', 'goto', 'hello', 'return', 'hello'],
                expectedSymbolName = ['WORD', 'GOTO', 'GOTO_WORD', 'RETURN', 'WORD'];

            for (var i = 0, token = scanner.scan(); !token.isEOS(); ++i, token = scanner.scan()) {
                
                expect(token.data).toBe(expectedData[i]);
                expect(token.symbol.name).toBe(expectedSymbolName[i]);
            }
        });

        it("should have the correct current scanner data", function() {


            scanner.setSource(' hello  goto  return hello');

            scanner.scan();

            expect(scanner.currentScanner.name).toBe('main');

            scanner.scan();

            expect(scanner.currentScanner.name).toBe('goto');

            scanner.scan();

            expect(scanner.currentScanner.name).toBe('main');
        });
        


    });

    describe("-pushback", function() {

        it("should push back the token when jumping to the goto target scanner", function() {

            scanner.setSource(' hello  pushback  hello return hello');

            var expectedData = ['hello', 'pushback', 'hello', 'return', 'hello'],
                expectedSymbolName = ['WORD', 'GOTO_WORD', 'GOTO_WORD', 'RETURN', 'WORD'];

            for (var i = 0, token = scanner.scan(); !token.isEOS(); ++i, token = scanner.scan()) {
                expect(token.data).toBe(expectedData[i]);
                expect(token.symbol.name).toBe(expectedSymbolName[i]);
            }
        });

    });


    describe("-start -stop", function() {

        it("should nest multiple start and stop", function() {

            scanner.setSource(' hello  start  hello start hello stop hello stop hello');

            var expectedData = ['hello', 'start', 'hello', 'start', 'hello', 'stop', 'hello', 'stop', 'hello'],
                expectedSymbolName = ['WORD', 'START', 'START_WORD', 'START', 'START_WORD', 'STOP', 'START_WORD', 'STOP', 'WORD'];

            for (var i = 0, token = scanner.scan(); !token.isEOS(); ++i, token = scanner.scan()) {
                expect(token.data).toBe(expectedData[i]);
                expect(token.symbol.name).toBe(expectedSymbolName[i]);
            }
        });

    });


    describe("-indent - _BEGIN_ and _END_ blocks", function() {

        it("should create proper _BEGIN_ and _END_ tokens", function() {
            scanner.setSource(' levZero \n levZero \n   levOne \n   levOne \n    levTwo \n levZero')

            var expectedData = ['levZero', 'levZero', '', 'levOne', 'levOne', '', 'levTwo', '', '', 'levZero'],
                expectedSymbolName = ['WORD', 'WORD', '_BEGIN_', 'WORD', 'WORD', '_BEGIN_', 'WORD', '_END_', '_END_', 'WORD'];

            for (var i = 0, token = scanner.scan(); !token.isEOS(); ++i, token = scanner.scan()) {
                expect(token.data).toBe(expectedData[i]);
                expect(token.symbol.name).toBe(expectedSymbolName[i]);
            }
        });

        it("should create _END_ tokens to close pending opened blocks in the end of input", function() {
            scanner.setSource(' levZero \n levZero \n   levOne \n   levOne \n    levTwo')

            var expectedData = ['levZero', 'levZero', '', 'levOne', 'levOne', '', 'levTwo', '', ''],
                expectedSymbolName = ['WORD', 'WORD', '_BEGIN_', 'WORD', 'WORD', '_BEGIN_', 'WORD', '_END_', '_END_'];

            for (var i = 0, token = scanner.scan(); !token.isEOS(); ++i, token = scanner.scan()) {
                expect(token.data).toBe(expectedData[i]);
                expect(token.symbol.name).toBe(expectedSymbolName[i]);
            }
        });

        it("should create an _ERROR_ token if there is an indentation error", function() {

            // levError has a different indentation level (2) than the previous started blocks
            scanner.setSource(' levZero \n levZero \n   levOne \n  levError')

            var expectedData = ['levZero', 'levZero', '', 'levOne', '', '', 'levError'],
                expectedSymbolName = ['WORD', 'WORD', '_BEGIN_', 'WORD', '_ERROR_', '_END_', 'WORD']
                expectedLine = [1, 2, 3, 3, 4, 4, 4];

            for (var i = 0, token = scanner.scan(); !token.isEOS(); ++i, token = scanner.scan()) {
                expect(token.data).toBe(expectedData[i]);
                expect(token.symbol.name).toBe(expectedSymbolName[i]);
                expect(token.pos.line).toBe(expectedLine[i]);
            }
        });



    });

    describe("-indent - blocks and actions - ", function() {


        it("should handle actions after _BEGIN_ tokens", function() {
            scanner.setSource(' levZero \n levZero \n   goto \n   levOne \n    return \n levZero')

            var expectedData = ['levZero', 'levZero', '', 'goto', 'levOne', '', 'return', '', '', 'levZero'],
                expectedSymbolName = ['WORD', 'WORD', '_BEGIN_', 'GOTO', 'GOTO_WORD', '_BEGIN_', 'RETURN', '_END_', '_END_', 'WORD'];

            for (var i = 0, token = scanner.scan(); !token.isEOS(); ++i, token = scanner.scan()) {
                expect(token.data).toBe(expectedData[i]);
                expect(token.symbol.name).toBe(expectedSymbolName[i]);
            }
        });


        it("should handle actions after _END_ tokens", function() {
            scanner.setSource(' levZero \n  levOne \n goto \n levZero')

            var expectedData = ['levZero', '', 'levOne', '', 'goto', 'levZero'],
                expectedSymbolName = ['WORD', '_BEGIN_', 'WORD', '_END_', 'GOTO', 'GOTO_WORD'];

            for (var i = 0, token = scanner.scan(); !token.isEOS(); ++i, token = scanner.scan()) {
                expect(token.data).toBe(expectedData[i]);
                expect(token.symbol.name).toBe(expectedSymbolName[i]);
            }
        });




    });

});