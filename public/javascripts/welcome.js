// is this going to leak memory?
setInterval(function(){
  var start = new Date().getTime();
  $.ajax({
    type: 'GET',
    url: '/latency-test'
  }).done(function(msg){
    console.log('got response');
    var end = new Date().getTime();
    console.log('latency is: ' + (end - start) + ' ms');
    $('.latency').text((end - start) + ' ms');
  });
}, 1000);