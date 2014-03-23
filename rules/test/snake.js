/* globals chai, describe, it, beforeEach */
"use strict";

if(!GameLogic){
	var GameLogic = require("../index");
}
if(typeof chai == "undefined"){
	var expect = require("chai").expect;
}else{
	var expect = chai.expect;
}

var Snake = GameLogic.Snake;

describe("Snake", function(){

	before(function(){
		this.game = new GameLogic.Game();
		this.snake = this.game.addSnake();
	});

	it("should be a MovingWorldObject", function(){
		expect(this.snake).to.be.an.instanceOf(GameLogic.MovingWorldObject);
	});

	it("should have maxLength", function(){
		expect(this.snake.maxLength).to.be.a("Number");
	});

	it("should have positions list", function(){
		expect(this.snake.positions).to.be.an("Array");
	});

	it("should respond to update", function(){
		expect(Snake).to.respondTo("update");
	});

	describe("#update", function(){
		it("should store past positions in speed = 1", function(){
			var snake = this.game.addSnake();
			snake.x = 0;
			snake.y = 0;
			snake.direction = GameLogic.MovingWorldObject.DIR.RIGHT;

			snake.update();
			expect(snake.positions).to.eql([
				[1, 0],
				[0, 0]
			]);

			snake.update();
			expect(snake.positions).to.eql([
				[2, 0],
				[1, 0],
				[0, 0]
			]);
		});

		it("should trim the snake to the maximum length", function(){
			var snake = this.game.addSnake();
			snake.x = 0;
			snake.y = 0;
			snake.direction = GameLogic.MovingWorldObject.DIR.RIGHT;
			snake.maxLength = 2;

			for(var i = 0; i < 3; i++){
				snake.update();
			}

			expect(snake.positions).to.eql([
				[3, 0],
				[2, 0]
			]);
		});
	});

	describe("#_wrapAround", function(){
		before(function(){
			this.game.state.width = 20;
			this.game.state.height = 20;
		});

		it("should wrap left", function(){
			var snake = this.game.addSnake();
			snake.x = 0;
			snake.y = 0;
			snake.direction = GameLogic.MovingWorldObject.DIR.LEFT;
			snake.update();

			expect(snake.x).to.eql(19);
			expect(snake.y).to.eql(0);
			expect(snake.positions).to.eql([
				[19, 0],
				[0, 0]
			]);
		});

		it("should wrap right", function(){
			var snake = this.game.addSnake();
			snake.x = 19;
			snake.y = 0;
			snake.direction = GameLogic.MovingWorldObject.DIR.RIGHT;
			snake.update();

			expect(snake.x).to.eql(0);
			expect(snake.y).to.eql(0);
			expect(snake.positions).to.eql([
				[0, 0],
				[19, 0]
			]);
		});

		it("should wrap top", function(){
			var snake = this.game.addSnake();
			snake.x = 0;
			snake.y = 0;
			snake.direction = GameLogic.MovingWorldObject.DIR.UP;
			snake.update();

			expect(snake.x).to.eql(0);
			expect(snake.y).to.eql(19);
			expect(snake.positions).to.eql([
				[0, 19],
				[0, 0]
			]);
		});

		it("should wrap bottom", function(){
			var snake = this.game.addSnake();
			snake.x = 0;
			snake.y = 19;
			snake.direction = GameLogic.MovingWorldObject.DIR.DOWN;
			snake.update();

			expect(snake.x).to.eql(0);
			expect(snake.y).to.eql(0);
			expect(snake.positions).to.eql([
				[0, 0],
				[0, 19]
			]);
		});

	});

	describe("#input", function(){

		before(function(){
			this.snake.direction = null;
		});

		it("should be a function", function(){
			expect(Snake).to.respondTo("input");
		});

		it("should accept left as input", function(){
			this.snake.input("left");
			this.snake.update();
			expect(this.snake.direction).to.eql(GameLogic.MovingWorldObject.DIR.LEFT);
		});

		it("should accept up as input", function(){
			this.snake.input("down");
			this.snake.update();
			expect(this.snake.direction).to.eql(GameLogic.MovingWorldObject.DIR.DOWN);
		});

		it("should accept right as input", function(){
			this.snake.input("right");
			this.snake.update();
			expect(this.snake.direction).to.eql(GameLogic.MovingWorldObject.DIR.RIGHT);
		});

		it("should accept down as input", function(){
			this.snake.input("down");
			this.snake.update();
			expect(this.snake.direction).to.eql(GameLogic.MovingWorldObject.DIR.DOWN);
		});

		it("should not allow moving in opposite direction", function(){
			this.snake.input("up");
			this.snake.update();
			expect(this.snake.direction).to.eql(GameLogic.MovingWorldObject.DIR.DOWN);
		});

		it("should not allow moving in opposite direction when two keys are pressed in the same tick", function(){
			expect(this.snake.direction).to.eql(GameLogic.MovingWorldObject.DIR.DOWN);
			this.snake.input("left");
			this.snake.input("up");
			this.snake.update();
			expect(this.snake.direction).to.eql(GameLogic.MovingWorldObject.DIR.LEFT);
		});

		it("should not error when invalid input is given", function(){
			this.snake.input("nonexistingkey");
			this.snake.update();
		});

	});

	describe("#isCollideWith", function(){
		it("should return true when colliding head to head", function(){
			var a = new Snake(this.game);
			a.positions = [[5, 5]];
			a.x = 5;
			a.y = 5;

			var b = new Snake(this.game);
			b.positions = [[5, 5]];
			b.x = 5;
			b.y = 5;

			expect(a.isCollideWith(b)).to.be.true;
			expect(b.isCollideWith(a)).to.be.true;
		});
		it("should return false when not colliding head to head", function(){
			var a = new Snake(this.game);
			a.positions = [[5, 3]];
			a.x = 5;
			a.y = 3;

			var b = new Snake(this.game);
			b.positions = [[7, 8]];
			b.x = 7;
			b.y = 8;

			expect(a.isCollideWith(b)).to.be.false;
			expect(b.isCollideWith(a)).to.be.false;
		});

		it("should return true when colliding head on body", function(){
			var a = new Snake(this.game);
			a.positions = [[5, 5], [5, 4], [5, 3], [5, 2]];
			a.x = 5;
			a.y = 5;

			var b = new Snake(this.game);
			b.positions = [[5, 3], [4, 3], [3, 3], [2, 3]];
			b.x = 5;
			b.y = 3;

			expect(a.isCollideWith(b)).to.be.true;
			expect(b.isCollideWith(a)).to.be.true;
		});
		it("should return true on colliding head on with other object", function(){
			var snake = new Snake(this.game);
			snake.x = 0;
			snake.y = 0;
			var object = new GameLogic.WorldObject(this.game);
			object.x = 0;
			object.y = 0;
			expect(snake.isCollideWith(object)).to.be.true;
		});
		it("should return false on not colliding head on with other object", function(){
			var snake = new Snake(this.game);
			snake.x = 0;
			snake.y = 0;
			var object = new GameLogic.WorldObject(this.game);
			object.x = 0;
			object.y = 1;
			expect(snake.isCollideWith(object)).to.be.false;
		});
		it("should return true when self colliding", function(){
			var a = new Snake(this.game);
			a.positions = [[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]];
			a.x = 0;
			a.y = 0;

			expect(a.isCollideWith(a)).to.be.true;
		});
		it("should return false when moving and not self colliding", function(){
			var a = new Snake(this.game);
			a.x = 0;
			a.y = 0;
			a.direction = GameLogic.MovingWorldObject.DIR.RIGHT;
			a.update();

			expect(a.isCollideWith(a)).to.be.false;
		});
	});

	describe("#reset", function(){
		it("should reset x, y", function(){
			this.snake.x = -1;
			this.snake.y = -1;
			this.snake.reset();

			expect(this.snake.x).to.not.eql(-1);
			expect(this.snake.y).to.not.eql(-1);
		});

		it("should reset maxLength", function(){
			this.snake.maxLength = 1;
			this.snake.reset();

			expect(this.snake.maxLength).to.eql(Snake.DEFAULT_MAX_LENGTH);
		});

		it("should reset tails", function(){
			this.snake.update();
			this.snake.update();
			this.snake.update();
			this.snake.reset();

			expect(this.snake.positions).to.have.length(0);
		});

		it("should emit reset action", function(done){
			var snake = this.game.addSnake();
			snake.on("reset", done);
			snake.reset();
		});
	});

	describe("#onCollide", function(){

		it("should reset if the target is deadly", function(done){
			var object = new GameLogic.WorldObject(this.game);
			object.deadly = true;
			this.snake.once("reset", done);
			this.snake.emit("collision", object);
		});

		it("should not reset if the target is not deadly", function(done){
			var snake = this.game.addSnake();
			var object = new GameLogic.WorldObject(this.game);
			object.deadly = false;
			snake.once("reset", done);
			snake.emit("collision", object);
			// done will be double fired if reset is emitted
			done();
		});

		it("should make the snake goes longer when collecting a powerup", function(){
			var snake = this.game.addSnake();
			var object = new GameLogic.Powerup(this.game);
			var initialLength = snake.maxLength;
			snake.emit("collision", object);
			expect(snake.maxLength).to.eql(initialLength + object.growth);
		});

		it("should make the snake goes longer by specified size when collecting a powerup", function(){
			var snake = this.game.addSnake();
			var object = new GameLogic.Powerup(this.game);
			object.growth = 5;
			var initialLength = snake.maxLength;
			snake.emit("collision", object);
			expect(snake.maxLength).to.eql(initialLength + 5);
		});
	});

});