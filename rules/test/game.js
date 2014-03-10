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
var Game = GameLogic.Game;

describe("Game", function(){

	it("should be a constructor", function(){
		expect(new Game()).to.be.an.instanceOf(Game);
	});

	it("should be an EventEmitter", function(){
		["emit", "once", "on"].forEach(function(item){
			expect(new Game()).to.respondTo(item);
		});
	});

	describe(".objects", function(){
		it("should have object storage", function(){
			expect((new Game()).objects).to.be.an("Array");
		});
	});

	describe(".state", function(){
		it("should have states", function(){
			expect((new Game()).state.state).to.be.a("Number");
		});

		it("should have screen size", function(){
			expect((new Game()).state.width).to.be.a("Number");
			expect((new Game()).state.width).to.be.gt(0);
			expect((new Game()).state.height).to.be.a("Number");
			expect((new Game()).state.height).to.be.gt(0);
		});

		it("should have data about powerup collected", function(){
			expect((new Game()).state.powerUpCollected).to.eql(0);
		});

		it("should have a number of powerup required for end game", function(){
			expect((new Game()).state.powerUpToEnd).to.be.a("Number");
		});
	});

	describe("#addSnake", function(){
		var game = new Game();

		it("should be able to execute", function(){
			expect(Game).to.respondTo("addSnake");
		});
		it("should return a Snake object", function(){
			expect(game.addSnake()).to.be.an.instanceOf(GameLogic.Snake);
		});
		it("should add the returned snake to objects array", function(){
			var returned = game.addSnake();
			expect(game.objects).to.include.members([returned]);
		});
	});

	describe("#getSnake", function(){
		before(function(){
			this.game = new Game();
			this.snake0 = this.game.addSnake();
			this.snake1 = this.game.addSnake();
			this.snake2 = this.game.addSnake();
		});

		it("should return a snake", function(){
			expect(this.game.getSnake(0)).to.eql(this.snake0);
			expect(this.game.getSnake(1)).to.eql(this.snake1);
			expect(this.game.getSnake(2)).to.eql(this.snake2);
		});
	});

	describe("#step", function(){

		before(function(){
			this.game = new Game();
			this.game.addSnake();
		});

		it("should be a function", function(){
			expect(Game).to.respondTo("step");
		});

		it("should call child's update function", function(done){
			var game = new Game();
			var MockWorldObject = new GameLogic.WorldObject(game);
			MockWorldObject.update = done;

			game.objects.push(MockWorldObject);
			game.step();
		});

		it("should make snake move", function(){
			var snakePos = this.game.objects[0].x;
			this.game.step();
			expect(this.game.objects[0].x).to.not.eql(snakePos);
		});

		it("should fire step event", function(next){
			this.game.once("step", next);
			this.game.step();
		});

		it("should check collision between objects and fire collision event", function(done){
			var game = new Game();

			var a = new GameLogic.WorldObject(game);
			a.x = 0;
			a.y = 0;
			game.objects.push(a);

			var b = new GameLogic.WorldObject(game);
			b.x = 0;
			b.y = 0;
			game.objects.push(b);

			var c = new GameLogic.WorldObject(game);
			c.x = 0;
			c.y = 1;
			game.objects.push(c);

			a.once("collision", function(obj){
				expect(obj).to.equal(b);
				done();
			});
			// c should not be called
			c.once("collision", function(){
				done(new Error("c was errornously collided"));
			});

			game.step();
		});
	});

	describe("#input", function(){

		before(function(){
			this.game = new Game();
			this.snake = this.game.addSnake();
			this.game.addSnake();
			this.game.addSnake();
			this.game.addSnake();
		});

		it("should be a function", function(){
			expect(Game).to.respondTo("input");
		});

		it("should give input to snake", function(done){
			this.snake.input = function(input){
				expect(input).to.eql("command");
				done();
			};
			this.game.input(0, "command");
		});

		it("should ignore if snake does not exists", function(){
			this.game.input(9999, "command");
		});

	});

});