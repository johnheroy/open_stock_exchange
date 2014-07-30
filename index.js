var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// static assets
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

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  })
});

// start the server
var port = Number(process.env.PORT || 5000);
http.listen(port, function() {
  console.log('Listening on ' + port);
});