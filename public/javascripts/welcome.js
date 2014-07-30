// is this going to leak memory?
setInterval(function(){
  var start = new Date().getTime();
  $.ajax({
    type: 'GET',
    url: '/latency-test'
  }).done(function(msg){
    console.log('got response ' + msg);
    var end = new Date().getTime();
    console.log('latency is: ' + ((end - start) / 2) + ' ms');
    $('.latency').text(((end - start) / 2) + ' ms');
  });
}, 1000);