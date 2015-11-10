
(function($) {

  var getErrorElem = function (errorRep) {

    var res =
    '<div class="node-error">' +
      '<div>' + errorRep.type.name + '</div>' +
      '<div> at line ' + errorRep.lastToken.pos.line + ', col ' + errorRep.lastToken.pos.col + '</div>' +


    '</div>';
    return res;
  },

  getTreeElem = function (node, deep) {



    if (node.rule) {
      res = '<div class="node-non-terminal ' + (node.parent ? '' : 'node-root') + '">';

      res += '<span class="node-symbol qtip-blue">' + node.symbol.name + '</span>';

    //  res += $("<div>").text(node.rule.toString()).html();
      // tooltip
      res +=  '<div class="tooltip">' +
                '<div>Symbol: <span>' + node.symbol.name + '</span></div>' +
                '<div>Rule: <span>' + $("<div>").text(node.rule.toString()).html() + '</span></div>' +
              '</div>'; // end tooltip

      for (var i = 0; i < node.children.length; ++i) {
        res += getTreeElem(node.children[i], deep + 1);
      }
      res += '</div>';
    } else {
      res = '<div class="node-terminal">';


      res += '<span class="node-symbol qtip-default">' + node.symbol.name + '</span>';

      res += '<span class="node-data">' + node.data + '</span>';


      // tooltip
      res +=  '<div class="tooltip qtip-blue">' +
                '<div>Symbol: <span>' + node.symbol.name + '</span></div>' +
                '<div>String: <span>' + node.data + '</span></div>' +
                '<div>Position: <span>line ' + node.pos.line + ', column ' + node.pos.col + '</span></div>' +
              '</div>'; // end tooltip

      res += '</div>';
    }

    return res;
  }
  ;

  $(function() {


    var exprParser = ptq.deserialize('d0d4d19ec984e5f8f0f29e8180809ed3c38a9f829f898da0a0819fa8a8819fa9a9819faaaa849fb0b9c1dadfdfe1fa819fabab819fadad819fb0b9839fc1dadfdfe1fa819fafafd48b9f8a9f85dfc5cfd3df8087dfc5d2d2cfd2df8083c4c9d681af8ac9c4c5ced4c9c6c9c5d28088ccc5c6d4dfd0c1d281a885cdc9ced5d381ad84cdd5ccd481aa86ced5cdc2c5d28084d0ccd5d381ab89d2c9c7c8d4dfd0c1d281a98ad7c8c9d4c5d3d0c1c3c580c4819fc484ede1e9eef38a9f899f8189828883858487858a8683878688848982e58c9f808487808580808989858580808285848487868684808182808688808881808386808783e1819fe98a9ed0f79ed38d9f8a84e5f8f0f284f4e5f2ed86e6e1e3f4eff29e8a9ed2899f848a8b888a848a8b858a828a8b848b8c868b848b8c828b828b8c848c848a89828c87828c839ed4919f8e9fcc9f808382848084828680878281808a8182808b8183808c8185818083878182838781858387818683878188838781898387828084838083828385828e8388828d838983828480838884828388848583888486838884888388848983888580838585828289858583858586828a8588838585898385868382848684828686878281868a8187868b8183868c818587898288888083868882838688858386888683868888838688898386898382848984828689878281898b818c898c81858a8382848a8482868a8782818a8b818b8a8c81858b8083838b8583838b8883838b8983838c8083848c8583848c8883848c8983848d8382848d8482868d8782818d8a81908d8b81838d8c81858e8382848e8482868e8782818e8a818f8e8b81838e8c81858f8083818f89838190808380908983809e');

    var parseDemo = function () {
      var input = $('#demo-expr .demo-input').val(),
        parseTree = exprParser.parse(input);
        console.log(parseTree, exprParser);

      if (parseTree) {
        $('#demo-expr .demo-output').html(getTreeElem(parseTree));

      } else {
        $('#demo-expr .demo-output').html(getErrorElem(exprParser.error));
      }
      console.log(exprParser.parse(input), exprParser);
    };

    $('#demo-expr .demo-input').on('input', parseDemo);


    parseDemo();



    // set tooltips
    $('.node-symbol').each(function() {

      var isTerminal = $(this).parent().hasClass('node-terminal');

      $(this).qtip({
        style: {
          classes: isTerminal ? 'qtip-default' : 'qtip-light'
        },
        content: {
          text: $(this).parent().find('.tooltip').html(),
          title: isTerminal ? 'Terminal node' : 'Non terminal node'
        },
        title: 'eded'
      });
    });


    // see grammar
    $('.toggle-grammar-btn').click(function() {
      var grammar = $(this).closest('.container').find('.row.grammar'),
        demo = $(this).closest('.container').find('.row.demo');
      if (grammar.hasClass('hidden')) {
        grammar.removeClass('hidden');
        demo.addClass('hidden');
        $(this).text('Show demo');
      } else {
        grammar.addClass('hidden');
        demo.removeClass('hidden');
        $(this).text('Show grammar');
      }
    });


  });
})(jQuery);