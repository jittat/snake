/* global cc, GameLogic */
/* jshint unused:false */
"use strict";

window.GameLayer = cc.Layer.extend({
	gridSize: [16, 16],
	map: "empty",
	server: "http://localhost:45634/primus",
	player: 0,

	objectsMap: {
	},

	tileset: {
		"dungeon": ["res/tiles.png", cc.rect(16, 16, 16, 16)],
		"brick": ["res/tiles.png", cc.rect(48, 0, 16, 16)],
	},

	init: function() {
		// ease debugging
		window.gamelayer = this;

		this.initGame();
		this.initLocalGame();
		// this.initNetworkGame();
	},

	initGame: function(){
		this.game = new GameLogic.Game();
		this.game.on("step", this.onGameStepped.bind(this));
		this.game.on("loadState", this.onLoadState.bind(this));
	},

	initLocalGame: function(){
		this.mode = GameLayer.MODES.LOCAL;
		this.schedule(this.gameStep.bind(this), this.game.state.updateRate / 1000, Infinity, 0);
		this.game.loadMap(this.map);
		this.player = 0;
		this.initMap();

		this.game.addSnake();
		this.game.addSnake();

		this.syncFromEngine();
	},

	initNetworkGame: function(){
		var self = this;
		this.mode = GameLayer.MODES.NETWORK;
		this.netcode = new Netcode(this.game);
		this.netcode.connect();
	},

	initMap: function(){
		this.setContentSize(this.game.state.width * this.gridSize[0], this.game.state.height * this.gridSize[1]);
		this.fillFloor();
	},

	gameStep: function(){
		this.game.step();
	},

	onLoadState: function(){
		this.removeAllChildren();
		this.initMap();
		this.syncFromEngine();
	},

	onGameStepped: function(){
		this.syncFromEngine();
	},

	fillFloor: function(){
		var mapName = this.game.state.map;
		var mapData = GameLogic.map[mapName];
		var tileset = this.tileset[mapData.tileset || "brick"];
		var groundNode = cc.SpriteBatchNode.create(tileset[0], this.game.state.width * this.game.state.height);
		for(var y=0; y<this.game.state.height; y++){
			for(var x=0; x<this.game.state.width; x++){
				var node = cc.Sprite.create.apply(null, tileset);
				node.setPosition(this.toUIPosition(x, y));
				groundNode.addChild(node);
			}
		}
		this.addChild(groundNode);
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

	input: function(key){
		switch(this.mode){
			case GameLayer.MODES.LOCAL:
				this.game.input(0, key);
				break;
			case GameLayer.MODES.NETWORK:
				this.netcode.input(key);
				break;
		}
	},

	_createChildObject: function(obj){
		obj.$id = this._generateId();
		var ObjectClass = WorldObjectNode;
		if(obj instanceof GameLogic.Snake){
			ObjectClass = SnakeNode;
		}else if(obj instanceof GameLogic.Powerup){
			ObjectClass = PowerupNode;
		}else if(obj instanceof GameLogic.Spawn){
			ObjectClass = SpawnNode;
		}
		var node = new ObjectClass();
		node.object = obj;
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
		y = this.game.state.height - y - 1;
		return cc.p(
			x * this.gridSize[0] + this.gridSize[0]/2,
			y * this.gridSize[1] + this.gridSize[1]/2
		);
	}
});

window.GameLayer.MODES = {
	"LOCAL": 0,
	"NETWORK": 1
};