var express = require('express');
var bodyParser = require('body-parser')
var ws = require('ws');
var app = express();
var wss = new ws.Server({port: 8080});

app.use('/', express.static(__dirname + '/htdocs'));
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
	res.sendFile( __dirname + '/htdocs/index.html');
});

wss.on('connection', function(websocket) {

	var messageJson = {
			type: 'userlist',
			fromId: 'server',
			toId: null,
			data: getConnectedClientsName()
	}
	wss.broadcast(JSON.stringify(messageJson));

	websocket.on('message', function(mes) {
		console.log('Incoming message: ' + mes);
		mes = JSON.parse(mes);
		wss.broadcast(JSON.stringify(mes));
	});
});

wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === ws.OPEN) {
      client.send(data);
    }
  });
};

function getConnectedClientsName() {
	var connectedClientNames = [];
	wss.clients.forEach(function each(client) {
    	if (client.readyState === ws.OPEN) {
    		connectedClientNames.push( (client.upgradeReq.url).substr(1) );
    	}
    });
    return connectedClientNames;
}

app.listen(8888);
