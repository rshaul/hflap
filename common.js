function Circle(point, radius) {
	this.point = point;
	this.radius = radius;
}
Circle.prototype.contains = function(point) {
	return this.distanceTo(point) <= this.radius;
}
Circle.prototype.distanceTo = function(point) {
	return GetDistanceBetween(this.point, point);
}
Circle.prototype.overlaps = function(other) {
	var d = this.distanceTo(other.point);
	return d <= this.radius + other.radius;
}

function State() {
	this.id = 0;
	this.label = 'q0';
	this.point = {x:0, y:0};
	this.start = false;
	this.accept = false;
	this.drag = false;
	this.hover = false;
	this.paths = [];
}
State.prototype.circle = function() {
	return new Circle(this.point, stateRadius);
}

function Path() {
	this.source = null;
	this.destination = null;
	this.hover = false;
	this.active = false;
	this.keys = [];
}
Path.prototype.label = function() {
	return this.keys.join(' | ');
}

function GetDistanceBetween(p1, p2) {
	var dx = p2.x - p1.x;
	var dy = p2.y - p1.y;
	return Math.sqrt(dx*dx + dy*dy);
}

function GetStatePoint(point) {
	var canvas = $('#canvas');
	var maxX = canvas.width() - stateRadius + canvas[0].scrollLeft;
	var maxY = canvas.height() - stateRadius + canvas[0].scrollTop;
	return {
		x: Bound(point.x, stateRadius, maxX),
		y: Bound(point.y, stateRadius, maxY)
	};

	function Bound(value, min, max) {
		return Math.min(Math.max(value, min), max);
	}
}

function GetStateAt(point) {
	for (var i=states.length-1; i >= 0; i--) {
		var state = states[i];
		var circle = state.circle();
		if (circle.contains(point)) return state;
	}
	return null;
}

function SetCursor(cursor) {
	if (!cursor) cursor = '';
	$('#canvas').css('cursor', cursor);
}

function GetCanvas() {
	return document.getElementById('canvas');
}
function GetContext() {
	return GetCanvas().getContext('2d');
}

var states = [];
var stateRadius = 30;
var nodeRadius = 6;
