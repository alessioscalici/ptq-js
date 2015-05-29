describe("Parser_bnf", function() {

    var parser;

    

    beforeEach(function(){

        var des = new Deserializer('d0d4d19ec983e2eee69e8180809ed3c38a9f829f8989a0a0819f8a8a819fbaba849fb0b9c1dadfdfe1fa819fbcbc819ffcfc839fc1dadfdfe1fa819f8d8d819fbdbd819fbebed4899f889f85dfc5cfd3df8087dfc5d2d2cfd2df8086c1d3d3c9c7ce83bababd83c9c4c58082ccd481bc82cecc8084d0c9d0c581fc82d2d481be8ad7c8c9d4c5d3d0c1c3c580c4819fc484ede1e9eef38b9f899f808881878285838384888585878488868a82e58d9f808587848480808885808189808386808480858281808682808281808784838383898a88868982e1819fe9889ed0f79ed3909f8885d3f4e1f2f482eeec85eeeccff0f488d2f5ece5cce9f3f484d2f5ece588d2f5ece5d4e1e9ec87d2f5ece5c5f8f088d2f5ece5c9f4e5ed9e889ed2909f83888a8b83898589828985828980818a838a858a828b8c838b8b8c878c848387828e89818d828d8f838d8d8f828e8d868e8e8a868a8d828f83848f8483879ed49c9f919fe69f808483848085828380888182808a818181848286818b8185818c81878280848380838483838384838483848385828383868384838a818484808385848383858484838584858385848683858580838085848286858c819b868382888780838687848386888782898982828a8a8083898a83828f8a84828e8a8583898a8683898a8d818c8a8e818b8a8f818d8b8082968b8582958b8683848b8981948b8a81938c80838c8c83828f8c84828e8c85838c8c86838c8c8f81928d80838a8d83838a8d84838a8d85838a8d86838a8e8382908f80838e8f83838e8f84838e8f85838e8f86838e908782919180838f9183838f9184838f9185838f9186838f9280838b9283838b9284838b9285838b9286838b9386829894808388948483889580829695848382958582959586838495898197958a8184968083839684838397808381978483819880838498838384988483849885828398868384988a8199998083899983828f9984828e9985838999868389998d819a998f818d9a80838d9a83828f9a84828e9a85838d9a86838d9a8f81929b8083879b8483879e');
        parser = des.deserialize();

    });



    it("should be of type Parser", function() {
        expect(parser instanceof Parser).toBe(true);
    });

    
     describe(".parse()", function() {

        it("should return a non terminal node", function() {

            // FIXME check the lrTable resulting from the deserialization. modify PTQ to log this data
            var root = parser.parse(' <start> ::= SYMBOL ');
            expect(root instanceof NonTerminalNode).toBe(true);

        });


        it("should return a non terminal node for lex32 BNF grammar", function() {

            var text = '<start>\t\t\t::= <setDeclList> <lexerDeclList>\n\t|\t\t\t\t<lexerDeclList>\n\t\n\t\n\t\n\t\n\t\n\t|\t\t\t\t<scanProp> <start>\n\t\n<scanPropList>\t::= <scanProp>\n\t|\t\t\t\t<scanPropList> <scanProp>\n\t\n<scanProp>\t\t::= PROP_EOS\tIDE\n\t|\t\t\t\tPROP_ERROR\tIDE\n\t|\t\t\t\tPROP_BEGIN\tIDE\n\t|\t\t\t\tPROP_END\tIDE\n\n\n\n\n<setDeclList>\t::= <setDecl>\n\t|\t\t\t\t<setDeclList> <setDecl>\n\t\n<setDecl>\t\t::= IDE <set>\n\t|\t\t\t\tALPHABET <set>\n\t\n<lexerDeclList>\t::= <lexerDecl>\n\t|\t\t\t\t<lexerDeclList> <lexerDecl>\n\n<lexerDecl> \t::= BEGIN_LEX IDE  <lexerPropList> <tokenDeclList>\n\t|\t\t\t\t BEGIN_LEX IDE  <tokenDeclList> \n\n<lexerPropList>\t::= <lexerProp>\n\t|\t\t\t\t<lexerPropList> <lexerProp>\n\n<lexerProp>\t\t::=\tFP NUMBER\n\t|\t\t\t\tVP NUMBER\n\t|\t\t\t\tALPHABET   <set>\n\n<tokenDeclList>\t::= <tokenDecl>\n\t|\t\t\t\t<tokenDeclList> <tokenDecl>\n\n<tokenDecl>\t\t::=\tIDE   <regexp>\n\t|\t\t\t\tIDE   <regexp>  <tokPropertyList>\n\t|\t\t\t\tIDE   <tokPropertyList>\n\n<tokPropertyList> ::= <tokProperty>\n\t| <tokPropertyList> <tokProperty>\n\n<tokProperty> ::= \tPRIORITY NUMBER\n\t|\t\t\t\tSKIP\n\n\t|\t\t\t\tBEGIN IDE\n\t|\t\t\t\tEND\n\t|\t\t\t\tGOTO IDE\n\t|\t\t\t\tALPHABET   <set>\n\t|\t\t\t\tPUSHBACK\n\t|\t\t\t\tINDENT\n\n<regexp>\t\t::=\tRE_START <rePipeList> RE_END\n\n\n<rePipeList>\t::=\t<reElemList>\n\t|\t\t\t\t<rePipeList> PIPE <reElemList>\n\n<reElemList>\t::= <reElem> <kleene>\n\t| \t\t\t\t<reElemList> <reElem> <kleene>\n\n<reElem>\t\t::= CHAR\n\t|\t\t\t\tESC_CHAR\n\t|\t\t\t\tPOSIX_BRACK\n\t|\t\t\t\tHEX_CP\n\t|\t\t\t\tUNI_POS\n\t|\t\t\t\tUNI_NEG\n\t|\t\t\t\tESC_CLASS\n\t|\t\t\t\tESC_SPECIAL_CHAR\n\t|\t\t\t\tLP <rePipeList> RP\n\t|\t\t\t\t<set>\n\t|\t\t\t\tUSER_TOK\n\n\t\n<kleene>\t\t::=\t\n\t|\t\t\t\tPLUS\n\t|\t\t\t\tSTAR\n\t|\t\t\t\tQUESTION\n\t|\t\t\t\tPARM_KLEENE\n\n\n\n<set>\t\t\t::= LB <setElemList> RB\n\t|\t\t\t\tLB_CARET <setElemList> RB\n\n<setElemList>\t::=\t<setElem>\n\t|\t\t\t\t<setElemList> <setElem>\n\t\n<setElem>\t\t::= <setElemSingle>\n\t|\t\t\t\tESC_CLASS\n\t|\t\t\t\tPOSIX_BRACK\n\t|\t\t\t\tNEG_POSIX_BRACK\n\t|\t\t\t\tUNI_POS\n\t|\t\t\t\tUNI_NEG\n\t|\t\t\t\t<set>\n\t|\t\t\t\tMINUS_LB <setElemList> RB\n\t|\t\t\t\tMINUS_LB_CARET <setElemList> RB\n\t|\t\t\t\t<setElemSingle> MINUS <setElemSingle>\n\n<setElemSingle>\t::=\tCHAR\n\t|\t\t\t\tESC_CHAR\n\t|\t\t\t\tESC_SPECIAL_CHAR\n\t|\t\t\t\tHEX_CP\n\n\n<setElem>\t\t::=\tUSERSET_POS\n\t|\t\t\t\tUSERSET_NEG\n\n<reElem>\t\t::=\tUSERSET_POS\n\t|\t\t\t\tUSERSET_NEG\n\t|\t\t\t DOT';
            var root = parser.parse(text);
            expect(root instanceof NonTerminalNode).toBe(true);

        });


        it("should return a non terminal node for bnf BNF grammar", function() {

            var text = '<Start> ::= <nlOpt> <RuleList>\n\n<nl> ::= NL <nl>\n\t| NL\n\t| _EOS_\n\n<nlOpt> ::= \n\t| NL <nlOpt>\n\n\n<RuleList> ::= <Rule>\n\t| <RuleList> <Rule>\n\n<Rule> ::= LT IDE RT ASSIGN <RuleExp> <nl>\n\n<RuleTail> ::= \n\t| <RuleItem>\n\t| <RuleTail> <RuleItem> \n\n\n<RuleExp> ::= <RuleTail>\n\t| <RuleExp> <nlOpt> PIPE <nlOpt> <RuleTail> \n\n<RuleItem> ::= IDE\n\t| LT IDE RT';
            var root = parser.parse(text);
            expect(root instanceof NonTerminalNode).toBe(true);

        });
       


    });



});