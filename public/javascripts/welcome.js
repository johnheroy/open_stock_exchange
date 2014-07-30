$(document).ready(function(){ 
  var socket = io();


  var last5latencies = new Array();
  // is this going to leak memory?
  setInterval(function(){
    var start = new Date().getTime();
    $.ajax({
      type: 'GET',
      url: '/latency-test'
    }).done(function(msg){
      var end = new Date().getTime();
      var latency = (end - start) / 2;
      console.log('got response ' + msg);
      console.log('last latency is: ' + latency);
      last5latencies.push(latency);
      if (last5latencies.length > 5) {
        last5latencies.shift();
      }
      var averageLatency = 0;
      for (var i = 0; i < last5latencies.length; i++) {
        averageLatency += (last5latencies[i] / last5latencies.length);
      }
      averageLatency = Math.round(averageLatency * 100) / 100;
      $('.latency').text(averageLatency + ' ms');
      console.log('last 5 latencies are: ' + last5latencies);
      console.log('average latency is: ' + averageLatency);
    });
  }, 1000);

  $('.latency-popover').popover({
    title: 'What\'s this?',
    content: 'In order to ensure that no single investor has an unfair advantage, we adjust your order submission based on your current one-way latency (calculated as average of last 5 measurements)',
    placement: 'bottom'
  });
});


