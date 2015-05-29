#ptq-js <small>- the Javascript library for PTQ parsers</small>


###Getting started
1. Install via Bower: ```bower install ptq-js --save```
2. Include the script file in your project HTML ```<script src="bower_components/ptq-js/build/ptq.min.js"></script>```
3. That's it!

###Usage

Get your PTQ output encoded in an hexadecimal string, and use the string as argument for the **deserialize** method:

```javascript
// create a parser using the ptq.deserialize() method
var parser = ptq.deserialize('d0d4d19ec987e4e5e6e1f5ecf49e8180809ed3c38a9f819ff7f7819fe4e4829f898da0a0819fe5e5819fa1a1819ff2f2819fefef819fecec819fe8e8819facacd4879f869f85dfc5cfd3df8087dfc5d2d2cfd2df8084c2c1cec781a185c3cfcdcdc181ac85c8c5cccccf85e8e5ececef85d7cfd2ccc485f7eff2ece48ad7c8c9d4c5d3d0c1c3c580c4819fc484ede1e9eef38e9f859f81838282838689858d84e58e9f8b8c878687858a8b87858686878887888981808382848a838081898c8d86808580838382808284808488e1819fe9869ed0f79ed3879f8685f3f4e1f2f49e869ed2839f838684858486848385838686829ed4879f889f8d9f8084828280868181818084818282868283828382858284838582858480838084828380858083818582838186808382868283829e');

// parse 
var rootNode = parser.parse('hello, world!');
```

