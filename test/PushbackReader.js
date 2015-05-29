
describe("PushbackReader", function() {

    var pb;

    

    beforeEach(function(){

        pb = new PushbackReader('abcdefghijklmnopqrstuvwxyz');
    });



    it("should be of type PushbackReader", function() {
        expect(pb instanceof PushbackReader).toBe(true);
    });

    

    describe(".read()", function() {

        it("should return the next letter in the source", function() {

            expect(pb.read()).toBe(97); // a
            expect(pb.read()).toBe(98); // b
            expect(pb.read()).toBe(99); // c
            expect(pb.read()).toBe(100); // d
        });


        it("should return the same letter after an unread", function() {

            expect(pb.read()).toBe(97); // a

            pb.unread();

            expect(pb.read()).toBe(97); // a again
            expect(pb.read()).toBe(98); // b
            expect(pb.read()).toBe(99); // c
            expect(pb.read()).toBe(100); // d
        });

        it("should return the same letter after a multiple unread", function() {

            expect(pb.read()).toBe(97); // a
            expect(pb.read()).toBe(98); // b

            pb.unread(2);

            expect(pb.read()).toBe(97); // a again
            expect(pb.read()).toBe(98); // b again
            expect(pb.read()).toBe(99); // c
            expect(pb.read()).toBe(100); // d
        });


    });


    describe(".reset()", function() {

        it("should keep the source", function() {
            var src = pb.source;
            pb.reset();
            expect(pb.source).toBe(src);
        });


        it("should start from the beginning", function() {

            expect(pb.read()).toBe(97); // a
            expect(pb.read()).toBe(98); // b
            expect(pb.read()).toBe(99); // c
            expect(pb.read()).toBe(100); // d

            pb.reset();

            expect(pb.read()).toBe(97); // a
            expect(pb.read()).toBe(98); // b
            expect(pb.read()).toBe(99); // c
            expect(pb.read()).toBe(100); // d

        });


        it("should reset unread information", function() {

            expect(pb.read()).toBe(97); // a
            expect(pb.read()).toBe(98); // b
            expect(pb.read()).toBe(99); // c
            expect(pb.read()).toBe(100); // d

            pb.unread(100);
            pb.reset();

            expect(pb.read()).toBe(97); // a
            expect(pb.read()).toBe(98); // b
            expect(pb.read()).toBe(99); // c
            expect(pb.read()).toBe(100); // d

        });


    });


});