/* global cc, GameLogic */
/* jshint unused:false */
"use strict";

window.GameScene = cc.Scene.extend({
	gridSize: [20, 20],

	objectsMap: {

	},

	onEnter: function() {
		this._super();
		this.addChild(cc.LayerColor.create(cc.c4b(150, 150, 150, 255)));
		this.setupGame();
	},

	setupGame: function(){
		this.game = new GameLogic.Game();
		this.schedule(this.gameStep.bind(this), this.game.state.updateRate / 1000, Infinity, 0);
		this.game.on("step", this.onGameStepped.bind(this));
		this.game.addSnake();

		// draw initial
		this.onGameStepped();
	},

	gameStep: function(){
		this.game.step();
	},

	onGameStepped: function(){
		this.syncFromEngine();
	},

	syncFromEngine: function(){
		console.log("sync");
		var self = this;

		var foundObjects = [];
		// check for updated objects
		this.game.objects.forEach(function(obj){
			var node;

			if(typeof obj.$id == "undefined"){
				node = self._createChildObject(obj);
			}

			foundObjects.push(obj.$id);

			node = self.objectsMap[obj.$id];
			node.syncFromEngine(obj);
		});

		// delete removed objects
		Object.keys(this.objectsMap).forEach(function(objId){
			if(foundObjects.indexOf(parseInt(objId)) == -1){
				self.removeChild(self.objectsMap[objId]);
				self.objectsMap[objId] = undefined;
			}
		});
	},

	_createChildObject: function(obj){
		obj.$id = this._generateId();
		var ObjectClass = WorldObjectNode;
		if(obj instanceof GameLogic.Snake){
			ObjectClass = SnakeNode;
		}
		var node = new ObjectClass();
		this.addChild(node);
		node.init();
		this.objectsMap[obj.$id] = node;

		return node;
	},

	_lastId: 1000,
	_generateId: function(){
		return this._lastId++;
	},

	toUIPosition: function(x, y){
		y = this.game.state.height - y + 1;
		return cc.p(x * this.gridSize[0], y * this.gridSize[1]);
	}
});