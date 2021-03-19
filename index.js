var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);


var yCoordinates = {};

var lastUpdated = {};

var update;

var currID = 0;

var highScore = 0;
var currHighScore = 0;

var obstacles = [];

//Obstacle variables
var gapSize = 100;
var thickness = 10;
//Check the gap to make sure it's at a good height
var upperMax = 300;
var upperMin = 125;
var lowerMax = upperMax+gapSize;
var lowerMin = upperMin+gapSize; 

var addNewObstacles = setInterval(addObstacles,6500);

var moveObstacles = setInterval(moveObstacles,30);

function addObstacles() {
	//add upper one
	var tempObstacleHeight = Math.floor(Math.random() * (upperMax - upperMin) + upperMin);;

	obstacles.push([510,0,thickness,tempObstacleHeight])
	//console.log(tempObstacleHeight,upperMax,upperMin);
	//add lower one
	obstacles.push([510,tempObstacleHeight+gapSize,thickness,500-tempObstacleHeight+gapSize])
	//console.log(obstacles);

	//console.log("check");
	//add lower one

}

function moveObstacles() {
	for (var i = 0; i < obstacles.length; i ++) {
		obstacles[i][0] -= 1.5;
	}
}

app.get('/', function(req, res) {
	res.sendfile('Site/index.html');
});

io.on('connection', function(socket) {
	//console.log('A user connected');

	update = setInterval(updateAll,20)

	io.sockets.emit('getID',currID);
	currID += 1;

	socket.on('answer', function(data) {
		io.sockets.emit('answer', 'ANSWERED');
		console.log(data);
	});

	socket.on('yUpdate', function(data) {
		yCoordinates[data[0]] = data[1];
		lastUpdated[data[0]] = 0;
	}); 

	socket.on('currentScore', function(data) {
		if (data > currHighScore) {
			currHighScore = data;
		}
	}); 	

	function updateAll() {
		//console.log(yCoordinates);
		io.sockets.emit('yCoordinatesUpdate',yCoordinates);
		io.sockets.emit('obstacleUpdate',obstacles);
		io.sockets.emit("currBestScore",currHighScore);
		io.sockets.emit("bestScore",highScore);

		//last updated minus 1
		for (check in lastUpdated) {
			lastUpdated[check] -= 1;
			//console.log(lastUpdated[check]);
			if (lastUpdated[check] < -15) {
				//console.log(check);
				delete yCoordinates[check];
				//console.log(lastUpdated)
				//console.log("hello 2");
			}
		}
		//change score stuff
		if (currHighScore > highScore) {
			highScore = currHighScore;
		}
		
		currHighScore = 0;
		
		/*io.sockets.emit("currHighScore",currHighScore);
		; */
	

	}

});

http.listen(3000, function() {
	console.log('listening on port: 3000');
});