"use strict";

var Powerup = function Powerup(){
	Powerup.super_.apply(this, arguments);
	this.on("collision", this.onCollide.bind(this));
};

require("util").inherits(Powerup, require("./worldobject"));

Powerup.prototype.deadly = false;
Powerup.prototype.growth = 1;

Powerup.prototype.onCollide = function(){
	this.world.removeChild(this);
};

module.exports = Powerup;