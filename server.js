


// Application server start
var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 8000));

app.use(express.static(__dirname + '/'));




// ngdocs
app.use('/docs', express.static(__dirname + '/docs'));

// reports
app.use('/report', express.static(__dirname + '/report'));


// views is directory for all template files
app.set('views', __dirname + '/build');


app.get('/', function(request, response) {
  response.sendFile(__dirname + '/index.html');
});



app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});