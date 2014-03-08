"use strict";

var EventEmitter = require("events").EventEmitter;
var MovingWorldObject = require("./movingworldobject");
var Snake = require("./snake");

var Game = function SnakeGame(){
	this.objects = [];
	this._snakes = [];
};
Game.STATES = {
	PREPARE: 0,
	IN_PROGRESS: 1,
	END: 2
};

require("util").inherits(Game, EventEmitter);

/**
 * Everything other clients need to sync up
 */
Game.prototype.state = {
	state: Game.STATES.PREPARE,
	powerUpCollected: 0,
	powerUpToEnd: 5,
	snakes: [],
	powerUp: [],
	width: 30,
	height: 20,
	updateRate: 500
};

Game.prototype.addSnake = function(snake){
	if(snake === undefined){
		snake = new Snake(this);
	}
	this.objects.push(snake);
	this._snakes.push(snake);
	return snake;
};

Game.prototype.step = function(){
	for(var index in this.objects){
		this.objects[index].update();
	}
	this.emit("step");
};

Game.prototype.getSnake = function(id){
	return this._snakes[id];
};

Game.prototype.input = function(player, input){
	var snake = this.getSnake(player);
	if(!snake){
		return;
	}

	snake.input(input);
};

module.exports = Game;