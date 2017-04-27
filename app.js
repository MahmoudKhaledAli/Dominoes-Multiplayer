/*eslint-env node*/

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------

// This application uses express as its web server
// for more info, see: http://expressjs.com
var express = require('express');

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');

// create a new express server
var app = express();

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

var boardState = [];
var firstMove = false;
var pieces = [];
var turn;
var allPieces = [[0,0],[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[1,1],[1,2],[1,3],[1,4],[1,5],[1,6],[2,2],[2,3],[2,4],[2,5],[2,6],[3,3],[3,4],[3,5],[3,6],[4,4],[4,5],[4,6],[5,5],[5,6],[6,6]];

//function to shuffle an array from stackoverflow Fisher-Yates Shuffle
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}


app.get("/start", function(request, response) {
	allPieces = shuffle(allPieces);
	pieces[0] = allPieces.slice(0,7);
	pieces[1] = allPieces.slice(7,14);
	pieces[2] = allPieces.slice(14,21);
	pieces[3] = allPieces.slice(21,28);
	turn = 0;
	boardState = [];
	firstMove = true;
	var board = "Dominoes: </br>";
	board += 'Board: </br>';
	board += "player1 pieces: "
	board += pieces[0] + '</br>';
	board += "player2 pieces: "
	board += pieces[1] + '</br>';
	board += "player3 pieces: "
	board += pieces[2] + '</br>';
	board += "player4 pieces: "
	board += pieces[3];
	board += "<form action=\"/play\"> Choose piece: <input type=\"text\" name=\"lname\"><br><input type=\"submit\" value=\"Submit\"></form>";
	//board += allPieces.length
	response.send(board);
});



app.get("/play", function(request, response) {
	var validMove = false;
	var playerHasMove = false;
	var playerWon = -1;
	if (firstMove) {
		boardState.push(pieces[turn][request.query.lname - 1]);
		pieces[turn].splice(request.query.lname - 1, 1);
		validMove = true;
		firstMove = false;
	}
	else if (turn == 0) {

		if (boardState[boardState.length - 1][1] == pieces[turn][request.query.lname - 1][0]) {
			boardState.push(pieces[turn][request.query.lname - 1]);
			pieces[turn].splice(request.query.lname - 1, 1);
			validMove = true;
		}
		else if (boardState[boardState.length -1][1] == pieces[turn][request.query.lname - 1][1]) {
			var temp = pieces[turn][request.query.lname - 1][0];
			pieces[turn][request.query.lname - 1][0] = pieces[turn][request.query.lname - 1][1];
			pieces[turn][request.query.lname - 1][1] = temp;
			boardState.push(pieces[turn][request.query.lname - 1]);
			pieces[turn].splice(request.query.lname - 1, 1);
			validMove = true;
		}
		else if (boardState[0][0] == pieces[turn][request.query.lname - 1][1]) {
			boardState.unshift(pieces[turn][request.query.lname - 1]);
			pieces[turn].splice(request.query.lname - 1, 1);
			validMove = true;
		}
		else if (boardState[0][0] == pieces[turn][request.query.lname - 1][0]) {
			var temp = pieces[turn][request.query.lname - 1][0];
			pieces[turn][request.query.lname - 1][0] = pieces[turn][request.query.lname - 1][1];
			pieces[turn][request.query.lname - 1][1] = temp;
			boardState.unshift(pieces[turn][request.query.lname - 1]);
			pieces[turn].splice(request.query.lname - 1, 1);
			validMove = true;
		}

	}
	else {
		validMove = true;
		for (var i = pieces[turn].length - 1; i >= 0; i--) {
			if (boardState[boardState.length -1][1] == pieces[turn][i][0]) {
				boardState.push(pieces[turn][i]);
				pieces[turn].splice(i, 1);
				break;
			}
			else if (boardState[boardState.length -1][1] == pieces[turn][i][1]) {
				var temp = pieces[turn][i][0];
				pieces[turn][i][0] = pieces[turn][i][1];
				pieces[turn][i][1] = temp;
				boardState.push(pieces[turn][i]);
				pieces[turn].splice(i, 1);
				break;
			}
			else if (boardState[0][0] == pieces[turn][i][1]) {
				boardState.unshift(pieces[turn][i]);
				pieces[turn].splice(i, 1);
				break;
			}
			else if (boardState[0][0] == pieces[turn][i][0]) {
				var temp = pieces[turn][i][0];
				pieces[turn][i][0] = pieces[turn][i][1];
				pieces[turn][i][1] = temp;
				boardState.unshift(pieces[turn][i]);
				pieces[turn].splice(i, 1);
				break;
			}
		}	
	}
	if (validMove) {
		if (pieces[turn].length == 0) {
			playerWon = turn;
		}
		turn = turn + 1;
		turn = turn % 4;
	}

	if (turn == 0) {
		for (var i = pieces[turn].length - 1; i >= 0; i--) {
			if (boardState[boardState.length -1][1] == pieces[turn][i][0]) {
				playerHasMove= true;
				break;
			}
			else if (boardState[boardState.length -1][1] == pieces[turn][i][1]) {
				playerHasMove = true;
				break;
			}
			else if (boardState[0][0] == pieces[turn][i][1]) {
				playerHasMove = true;
				break;
			}
			else if (boardState[0][0] == pieces[turn][i][0]) {
				playerHasMove = true;
				break;
			}
		}
	}

	var board = "";

	if (!playerHasMove && turn == 0) {
		turn = 1;
		board += "You didn't have a move</br>";
	}


	board += 'Board: </br>';
	board += boardState + '</br>';
	board += "player1 pieces: "
	board += pieces[0] + '</br>';
	board += "player2 pieces: "
	board += pieces[1] + '</br>';
	board += "player3 pieces: "
	board += pieces[2] + '</br>';
	board += "player4 pieces: "
	board += pieces[3] + '</br>';
	board += turn + 1 + "'s turn </br>";
	
	if (turn == 0) {
		board += "<form action=\"/play\"> Choose piece: <input type=\"text\" name=\"lname\"><br><input type=\"submit\" value=\"Next\"></form>";
	}
	else {
		board += "<form action=\"/play\"><input type=\"submit\" value=\"Next\"></form>";
	}
	
	if(playerWon != -1) {
		board += "Player " + turn + " won!";
	}


	//board += allPieces.length
	response.send(board);
});

// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {
  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});
