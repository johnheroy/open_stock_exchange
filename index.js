var express = require('express');

var app = express();
app.engine('jade', require('jade').__express);
app.use(express.static(__dirname + '/public'));

// render home page
app.get('/', function(req, res) {
  res.render(__dirname + '/views/index.jade');
});

// latency test
app.get('/latency-test', function(req, res) {
  res.send((Math.random() * 100).toString());
});

// start the server
var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log('Listening on ' + port);
});