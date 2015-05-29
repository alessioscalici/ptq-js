describe("Deserializer", function() {


    it("should be of type BaseDeserializer", function() {
        var bd = new Deserializer('');
        expect(bd instanceof Deserializer).toBe(true);
    });




    // it("should throw an error if an unexpected continuation byte is found", function() {
    //     try {
    //         var is = new InputStream('49A299A54E59');
    //         var bd = new BaseDeserializer(is);
    //         var str = '';
    //         while (is.hasNext())
    //             str += String.fromCharCode(bd.readHTF8());
    //     } catch (e) {
    //         expect(e).toBeDefined();
    //     }
    //     expect(str).toBe('I');
    // });

    

    
  // describe("should be able to parse HTF8 format -", function() {

  //   it("I♥NY", function() {
  //       var is = new InputStream('49E299A54E59');

  //       var bd = new BaseDeserializer(is);

  //       var str = '';
  //       while (is.hasNext())
  //           str += String.fromCharCode(bd.readHTF8());

  //       expect(str).toBe('I♥NY');
  //   });


  //   it("alchemical vinegar - 🜊 - U+1F70A ", function() {
  //       var is = new InputStream('f09f9c8affffffff');
  //       var bd = new BaseDeserializer(is);
  //       var cp = bd.readHTF8();
  //       expect(cp).toBe(parseInt('1F70A',16));
  //   });

  //   it("alchemical putrefaction - 🝤 - U+1F764 ", function() {
  //       var is = new InputStream('f09f9da4ffffffff');
  //       var bd = new BaseDeserializer(is);
  //       var cp = bd.readHTF8();
  //       expect(cp).toBe(parseInt('1F764',16));
  //   });

  //   it("alchemical sequence", function() {
  //       var is = new InputStream('f09f9c8af09f9da4ffffffff');
  //       var bd = new BaseDeserializer(is);

  //       var cp = bd.readHTF8();
  //       expect(cp).toBe(parseInt('1F70A',16));

  //       cp = bd.readHTF8();
  //       expect(cp).toBe(parseInt('1F764',16));
  //   });
  // });



describe("should deal with PTQ format", function() {

    xit("reading the scanner file", function() {
        var is = 'd0d4d19ec987e4e5e6e1f5ecf49e8180809ed3c38a9f819ff7f7819fe4e4829f898da0a0819fe5e5819fa1a1819ff2f2819fefef819fecec819facac819fe8e8d4879f869f85dfc5cfd3df8087dfc5d2d2cfd2df8084c2c1cec781a185c3cfcdcdc181ac85c8c5cccccf85e8e5ececef85d7cfd2ccc485f7eff2ece48ad7c8c9d4c5d3d0c1c3c580c4819fc484ede1e9eef38e9f859f82868482868387848a85e58e9f8085898086888282828381868d8a818b8887818c858082828c8d87858b83808380808484888987898786e1819fe9869e';
        var bd = new Deserializer(is);


        while (is.hasNext()) {
            var cp = bd.readHTF8(),
                str = String.fromCharCode(cp),
                hex = cp.toString(16);
            console.log(cp, hex, str);
        }

    });

  });


  // describe(".readString()", function() {

  //   it("should read the first number as the string length", function() {
  //       var is = new InputStream('04616263646566');
  //       var bd = new BaseDeserializer(is);
  //       var str = bd.readString();

  //       expect(str).toBe('abcd');
  //   });

  // });


    describe(".readHeader()", function() {

        it("should read the PTQ serialized format header", function() {

            var is = 'd0d4d19e';
            var bd = new Deserializer(is);

            var err = false;
            try {
                bd.readHeader();
            } catch (e) {
                err = true;
            }
            expect(err).toBe(false);
            
        });


        it("should throw an error if the header is not correct", function() {
            var is = 'd0d4dF9e';
            var bd = new Deserializer(is);

            var err = false;
            try {
                bd.readHeader();
            } catch (e) {
                err = true;
            }
            expect(err).toBe(true);
        });

    });


 
});





describe("Deserializer (scanner)", function() {

    var des;


    describe('default hello world scanner', function(){

        beforeEach(function(){
            des = new Deserializer('d0d4d19ec987e4e5e6e1f5ecf49e8180809ed3c38a9f819ff7f7819fe4e4829f898da0a0819fe5e5819fa1a1819ff2f2819fefef819fecec819facac819fe8e8d4879f869f85dfc5cfd3df8087dfc5d2d2cfd2df8084c2c1cec781a185c3cfcdcdc181ac85c8c5cccccf85e8e5ececef85d7cfd2ccc485f7eff2ece48ad7c8c9d4c5d3d0c1c3c580c4819fc484ede1e9eef38e9f859f82868482868387848a85e58e9f8085898086888282828381868d8a818b8887818c858082828c8d87858b83808380808484888987898786e1819fe9869e');
        });


        it("should read the header", function() {

            // var or = 'd0d4d19ec987e4e5e6e1f5ecf49e8180809ed3c38a9f819ff7f7819fe4e4829f898da0a0819fe5e5819fa1a1819ff2f2819fefef819fecec819facac819fe8e8d4879f869f85dfc5cfd3df8087dfc5d2d2cfd2df8084c2c1cec781a185c3cfcdcdc181ac85c8c5cccccf85e8e5ececef85d7cfd2ccc485f7eff2ece48ad7c8c9d4c5d3d0c1c3c580c4819fc484ede1e9eef38e9f859f82868482868387848a85e58e9f8085898086888282828381868d8a818b8887818c858082828c8d87858b83808380808484888987898786e1819fe9869e';
            // var str = '';

            // for (var i=0; i<or.length; i += 2)
            //     str += (parseInt(or.substring(i,i+2), 16)-128).toString(16);

            // console.log(str);

            var err = false;
            try {
                des.readHeader();
            } catch (e) {
                console.log(e);
                err = true;
            }

            expect(err).toBe(false);

        });



        it("should read the info section", function() {

            des.readHeader();


            var err = false;
            try {
                des.readInfoSection();
            } catch (e) {
                console.log(e);
                err = true;
            }

            //console.log(des.name, des.iRequiredMajorVersion, des.iRequiredMinorVersion, des.iRequiredPatchVersion);

            expect(err).toBe(false);
            expect(des.name).toBe('default');
            expect(des.iRequiredMajorVersion).toBe(1);
            expect(des.iRequiredMinorVersion).toBe(0);
            expect(des.iRequiredPatchVersion).toBe(0);

        });


        it("should read the scanner section -", function() {

            des.readHeader();
            des.readInfoSection();

            var c = des.readHTF8();
            expect(c).toBe(PtqFileConst.BEGIN_SCANNER_SECTION);

        });


        it("should read the character set section", function() {

            des.readHeader();
            des.readInfoSection();

            des.readHTF8(); // BEGIN_SCANNER_SECTION


            var err = false;
            try {
                des.readCharacterSetSection();
            } catch (e) {
                console.log(e);
                err = true;
            }

            expect(err).toBe(false);
            expect(des.characterSets.length).toBe(10);


        });


        it("should read the terminal section", function() {
            des.readHeader();
            des.readInfoSection();

            des.readHTF8(); // BEGIN_SCANNER_SECTION
            des.readCharacterSetSection();

            var err = false;
            try {
                des.readTerminalSection();
            } catch (e) {
                console.log(e);
                err = true;
            }

            expect(err).toBe(false);
            expect(des.symbols.length).toBe(7);

        });


        it("should read the DFA section", function() {
            des.readHeader();
            des.readInfoSection();

            des.readHTF8(); // BEGIN_SCANNER_SECTION
            des.readCharacterSetSection();
            des.readTerminalSection();

            var err = false;
            try {
                des.readDfaSection();
            } catch (e) {
                console.log(e);
                err = true;
            }

            expect(err).toBe(false);
            expect(des.symbols.length).toBe(7);

        });



        it("should deserialize the scanner", function() {

            var scanner;
            var err = false;
            try {
                scanner = des.deserialize();
            } catch (e) {
                console.log(e);
                err = true;
            }

            expect(err).toBe(false);
            expect(scanner instanceof Scanner).toBe(true);

        });

    });




    // it("should be of type PushbackReader", function() {
    //     expect(pb instanceof PushbackReader).toBe(true);
    // });




});