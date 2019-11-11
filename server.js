var express = require('express');
var app = express();
var path = require('path');
var http = require('http').Server(app);
var io = require('socket.io')(http);

const PAS = __dirname +'/src';

app.use(express.static( __dirname + '/dist'));
app.use(express.static( __dirname + '/picture'));

app.all('*', (req, res) => {
  res.sendFile(path.resolve(PAS, 'index.html'));
});

app.set('port', (process.env.PORT || 7001));

http.listen(app.get('port'), function(){
  console.log('listening on port',app.get('port'));
});

var players = {};

io.sockets.on('connection', function(socket){
  //добавление нового игрока
	socket.on('player1',function(){
		players[socket.id] = { enemy: '', first_hod: false,};

    let perem;
    for (var kay in players) {
      if (kay == socket.id && perem) {
        var hostile = players[perem]['enemy'];
        if (!hostile) {
          players[socket.id]['enemy'] = perem;
          players[perem]['enemy'] = socket.id;
          players[socket.id]['first_hod'] = true;
        }
      }
      perem = kay;
    }
    socket.emit('1_hod', players[socket.id]['first_hod']);
    if (players[socket.id]['enemy']) {
      socket.emit('enemy', true);
      io.to(players[socket.id]['enemy']).emit('enemy', true);
    }

	})
  // Смена хода
  socket.on('change_hod', function () {
    io.to(players[socket.id]['enemy']).emit('1_hod', true);
  })
  //передает противнику координаты кораблей для рассчета
  socket.on('coordinats', function (hostile, bordship) {
    var enemy = players[socket.id]['enemy'];

    io.to(players[socket.id]['enemy']).emit('coordinats', hostile, bordship);
  })
// передает противнику координаты выстрелов
  socket.on('shot', function (x, value) {
    io.to(players[socket.id]['enemy']).emit('shot', x, value);
  })
  //противник готов
  socket.on('i_ready', function (x) {
    io.to(players[socket.id]['enemy']).emit('i_ready', x);
  })

  socket.on('disconnect',function(state){

    delete players[socket.id];
  })

  socket.on('winner', function(winner) {
    io.to(players[socket.id]['enemy']).emit('winner', true);
  })
})
