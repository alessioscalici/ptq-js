
/*

----------------------------------------------
main

    WHITESPACE  ^ [:space:]+  $ -ignore

    WORD        ^ [a-zA-Z]+  $

    GOTO        ^ goto  $ -goto goto // goes to goto after reading goto

    START       ^ start  $ -start start

    PUSHBACK    ^ pushback  $ -goto goto -pushback


----------------------------------------------
goto
    WHITESPACE  ^ {main.WHITESPACE}  $ -ignore

    GOTO_WORD   ^ [a-zA-Z]+  $
    RETURN      ^ return  $  -goto main

----------------------------------------------
start
    WHITESPACE  ^ {main.WHITESPACE}  $ -ignore

    START_WORD  ^ [a-zA-Z]+  $
    START       ^ start  $ -start start // nested
    STOP        ^ stop  $  -stop



 */
describe("Scanner_multiscanner", function() {

    var scanner;

    

    beforeEach(function(){

        scanner = ptq.deserialize('d0d4d19ec98cedf5ecf4e9f3e3e1eeeee5f29e8180809ed3c39f9f839fc1dae1f4f6fa839fc1dae1f3f5fa839fc1dae1f2f4fa839fc1dae1f1f3fa839fc1dae1eff1fa839fc1dae1eef0fa839fc1dae1edeffa839fc1dae1eaecfa839fc1dae1e7e9fa829f898da0a0839fc1dae1e4e6fa839fc1dae1e2e4fa839fc1dae1e1e3fa829fc1dae2fa819fe1e1819fe2e2819fe3e3819fe5e5819fe7e7819fe8e8819febeb819feeee839fc1dae2eef0fa819fefef819ff0f0819ff2f2819ff3f3819ff4f4859fc1dae1e6e8eff1f2f4fa819ff5f5829fc1dae1fad48b9f8a9f85dfc5cfd3df8087dfc5d2d2cfd2df8084c7cfd4cf84e7eff4ef89c7cfd4cfdfd7cfd2c48088d0d5d3c8c2c1c3cb88f0f5f3e8e2e1e3eb86d2c5d4d5d2ce86f2e5f4f5f2ee85d3d4c1d2d485f3f4e1f2f48ad3d4c1d2d4dfd7cfd2c48084d3d4cfd084f3f4eff084d7cfd2c4808ad7c8c9d4c5d3d0c1c3c580c4839fc484ede1e9eef3949f939f8189828983868489858986898789888989898a848b898c898d898e8a8f899089918992829389e5a69f908d81878d8d818d83868d8c93818e8d8d9e8f9097848d82838d9e928d9e91929786878f808e898182998b849d918d8590919b87888e808c9a8c939b808d9c858693898a948c8d81898d878a8d9e938d8d888d8b808b9882839b8f8d85808f928889908e8e89858d88828d8184859a8b8d80e1859ff38281f084f38481e98af38682c484e7eff4eff3899f889f818a8283838384838583868587838883e5909f84888382888187829186889e80879981818983888082839b87888a84859985888688889e83849d808883858695808189e1829ff38580e98ac485f3f4e1f2f4f38a9f899f818782878386848885878687878a88878987e5929f88818e82839b89868482868186869e87878983869e80878985889b88899788869681829980868281868389849885868180859a84869ee1839fe588e98af386829e');


    });



    it("should be of type Scanner", function() {
        expect(scanner instanceof Scanner).toBe(true);
    });

    it("should NOT be index based", function() {
        expect(scanner.indentBased).toBeFalsy();
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

});