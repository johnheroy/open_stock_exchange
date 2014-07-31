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
      shares: parseFloat($('.shares-entry').val()),
      limit: parseFloat($('.limit-entry').val()),
      type: type,
      latency: currentAverageLatency
    });
  };

  socket.on('new order book', function(book){
    // console.log(book);
    var buyOrders = book.buys;
    var sellOrders = book.sells;

    if (buyOrders[0] && sellOrders[0]){
      $('.current-bid-ask').text(buyOrders[0].limit + ' - ' + sellOrders[0].limit);  
    } else {
      $('.current-bid-ask').text('N/A');
    }
    

    var maxLengthBuys;
    if (buyOrders.length < 10){
      maxLengthBuys = buyOrders.length;
    } else {
      maxLengthBuys = 10;
    }
    for (var i = 1; i <= 10; i++){
      if (i <= maxLengthBuys){
        var orderText = buyOrders[i-1].shares + ' shares @ limit ' + buyOrders[i-1].limit;
        $('.buy-' + i).text(orderText);
      } else {
        $('.buy-' + i).text('');
      }
    }

    var maxLengthSells;
    if (sellOrders.length < 10){
      maxLengthSells = sellOrders.length;
    } else {
      maxLengthSells = 10;
    }
    for (var i = 1; i <= 10; i++){
      if (i <= maxLengthSells){
        var orderText = sellOrders[i-1].shares + ' shares @ limit ' + sellOrders[i-1].limit;
        $('.sell-' + i).text(orderText);
      } else {
        $('.sell-' + i).text('');
      }
    }    
  });

  socket.on('last trade', function(lastTrade){
    $('.last-trade').text(lastTrade);
  });

  socket.on('new order executed', function(order){
    $('.blank').text('* ' + order.shares + ' shares cleared at ' + order.price + ' *');
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
    title: 'What\'s latency all about?',
    content: 'In order to ensure that no single investor has an unfair advantage, we adjust your order submission based on your current one-way latency in milliseconds (average of last 5 measurements), which is the time it takes to send data from your computer to our server',
    placement: 'bottom'
  });

  $('.limit-popover').popover({
    title: 'What\'s a limit order?',
    content: 'A limit order is an order to buy/sell a set number of shares at a specified price or better. So if you want to buy 500 shares at a limit of 1.50, then you would accept any price less than or equal to 1.50, e.g. 1.49',
    placement: 'top'
  });

  $('.order-book-popover').popover({
    title: 'What\'s this?',
    content: 'This is a "limit order book", which represents all of the entered but unexecuted orders. The buy orders are in green and sell orders in red, from bottom to top in ascending price order. The last order executed is displayed in the middle yellow box. The current bid/ask spread is calculated based on the current disparity between the lowest sell order and highest buy order',
    placement: 'top'
  });
});


