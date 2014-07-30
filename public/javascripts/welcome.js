$(document).ready(function(){ 
  var socket = io();

  $('.buy-button').on('click', function(){
    submitNewOrder('buy');
  });

  $('.sell-button').on('click', function(){
    submitNewOrder('sell');
  });

  var submitNewOrder = function(type){
    socket.emit('new order', {
      shares: $('.shares-entry').val(),
      limit: $('.limit-entry').val(),
      type: type,
      latency: currentAverageLatency
    });
  };

  socket.on('new order book', function(book){
    console.log(book);
    var buyOrders = book.buys;
    var sellOrders = book.sells;

    var maxLengthBuys;
    if (buyOrders.length < 10){
      maxLengthBuys = buyOrders.length;
    } else {
      maxLengthBuys = 10;
    }
    for (var i = 1; i <= maxLengthBuys; i++){
      var orderText = buyOrders[i-1].shares + ' shares @ limit ' + buyOrders[i-1].limit;
      $('.buy-' + i).text(orderText);
    }

    var maxLengthSells;
    if (sellOrders.length < 10){
      maxLengthSells = sellOrders.length;
    } else {
      maxLengthSells = 10;
    }
    for (var i = 1; i <= maxLengthSells; i++){
      var orderText = sellOrders[i-1].shares + ' shares @ limit ' + sellOrders[i-1].limit;
      $('.sell-' + i).text(orderText);
    }    
  });

  var last5latencies = new Array();
  var currentAverageLatency;
  // is this going to leak memory?
  setInterval(function(){
    var start = new Date().getTime();
    $.ajax({
      type: 'GET',
      url: '/latency-test'
    }).done(function(msg){
      var end = new Date().getTime();
      var latency = (end - start) / 2;
      // console.log('got response ' + msg);
      // console.log('last latency is: ' + latency);
      last5latencies.push(latency);
      if (last5latencies.length > 5) {
        last5latencies.shift();
      }
      var averageLatency = 0;
      for (var i = 0; i < last5latencies.length; i++) {
        averageLatency += (last5latencies[i] / last5latencies.length);
      }
      averageLatency = Math.round(averageLatency * 100) / 100;
      currentAverageLatency = averageLatency;
      $('.latency').text(averageLatency + ' ms');
      // console.log('last 5 latencies are: ' + last5latencies);
      // console.log('average latency is: ' + averageLatency);
    });
  }, 1000);

  $('.latency-popover').popover({
    title: 'What\'s this?',
    content: 'In order to ensure that no single investor has an unfair advantage, we adjust your order submission based on your current one-way latency (calculated as average of last 5 measurements)',
    placement: 'bottom'
  });
});


