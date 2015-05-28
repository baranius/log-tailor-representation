var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var amqp = require('amqplib');

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){

	socket.on('dequeue', function(msg){
		io.emit('dequeue', 'Rabbit MQ Message : ' + msg);
	});

});

amqp.connect('amqp://sa:Sa123456@192.168.1.176').then(function(conn) {
  process.once('SIGINT', function() { conn.close(); });
  return conn.createChannel().then(function(ch) {
    
    var ok = ch.assertQueue('logging', {durable: false});
    
    ok = ok.then(function(_qok) {
      return ch.consume('logging', function(msg) {
        console.log(" [x] Received '%s'", msg.content.toString());
        io.emit('dequeue', msg.content.toString())
      }, {noAck: true});
    });
    
    return ok.then(function(_consumeOk) {
      console.log(' [*] Waiting for messages. To exit press CTRL+C');
    });
  });
}).then(null, console.warn);

http.listen(3000, function(){
	console.log("listening on *:3000");
});


