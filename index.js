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

// arrays for buy / sell orders, two-dimensional
var buyOrders = new Array();
var sellOrders = new Array();
var lastTrade; // update to last trade

// sockets
io.on('connection', function(socket){
  console.log('a user connected');
  io.emit('new order book', {
    buys: buyOrders,
    sells: sellOrders
  });
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });

  socket.on('new order', function(order){
    var timeReceived = new Date().getTime();
    console.log('new order received');
    console.log(order);

    // delay adding order inversely by the latency
    setTimeout(function(){
      addOrder(order, timeReceived);
      io.emit('new order book', {
        buys: buyOrders,
        sells: sellOrders
      });
      // matchOrders();
    }, (500 - order.latency));    
  });
});

var matchOrders = function(){
  // start matching orders in priority
};

var addOrder = function(order, timeReceived){
  var timePriority = timeReceived - order.latency;
  var orderObj = {
    shares: order.shares,
    limit: order.limit,
    time: timePriority
  };
  switch (order.type) {
    case 'buy':
      console.log('entering buy order');
      if (buyOrders.length === 0){
        buyOrders.push(orderObj);
        console.log(buyOrders);
      } else {
        var orderEntered = false;
        for (var i = 0; i < buyOrders.length; i++){
          if (order.limit > buyOrders[i].limit){
            buyOrders.splice(i, 0, orderObj);
            orderEntered = true;
            console.log(buyOrders);
            break;
          } else if (order.limit === buyOrders[i].limit){
            if (timePriority < buyOrders[i].time){
              buyOrders.splice(i, 0, orderObj);
              orderEntered = true;
              console.log(buyOrders);
              break;
            } // else move on
            //break;
          } else if (order.limit < buyOrders[i].limit){
            // move on
          }
        }
        if (!orderEntered) {
          buyOrders.push(orderObj); 
          console.log(buyOrders);  
        }
      }
      break;

    case 'sell':
      console.log('entering sell order');
      if (sellOrders.length === 0){
        sellOrders.push(orderObj);
        console.log(sellOrders);
      } else {
        var orderEntered = false;
        for (var i = 0; i < sellOrders.length; i++){
          if (order.limit < sellOrders[i].limit){
            sellOrders.splice(i, 0, orderObj);
            orderEntered = true;
            console.log(sellOrders);
            break;
          } else if (order.limit === sellOrders[i].limit){
            if (timePriority < sellOrders[i].time){
              sellOrders.splice(i, 0, orderObj);
              orderEntered = true;
              console.log(sellOrders);
              break;
            } // else move on
            //break;
          } else if (order.limit > sellOrders[i].limit){
            // move on
          }
        }
        if (!orderEntered) {
          sellOrders.push(orderObj); 
          console.log(sellOrders);  
        }
      }
      break;
  }
};

// start the server
var port = Number(process.env.PORT || 5000);
http.listen(port, function() {
  console.log('Listening on ' + port);
});