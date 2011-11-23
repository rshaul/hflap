function Circle(point, radius) {
	this.point = point;
	this.radius = radius;
}
Circle.prototype.contains = function(point) {
	return this.distanceTo(point) <= this.radius;
}
Circle.prototype.distanceTo = function(point) {
	var line = new Line(this.point, point);
	return line.length();
}
Circle.prototype.overlaps = function(other) {
	var d = this.distanceTo(other.point);
	return d <= this.radius + other.radius;
}


function Line(from, to) {
	this.from = from;
	this.to = to;
}
Line.prototype.angle = function () {
	var slope = (this.to.y - this.from.y) / (this.to.x - this.from.x);
	var angle = Math.atan(slope);
	if (this.from.x > this.to.x) angle += Math.PI;
	return angle;
}
Line.prototype.center = function() {
	return {
		x: (this.from.x + this.to.x) / 2,
		y: (this.from.y + this.to.y) / 2
	};
}
Line.prototype.length = function() {
	var dx = this.from.x - this.to.x;
	var dy = this.from.y - this.to.y;
	return Math.sqrt(dx*dx + dy*dy);
}

function State() {
	this.id = 0;
	this._label = 'q0';
	this.point = {x:0, y:0};
	this.start = false;
	this.accept = false;
	this.drag = false;
	this.hover = false;
	this.paths = [];
}
State.prototype.circle = function() {
	return new Circle(this.point, DFA.stateRadius);
}
State.prototype.label = function(setter) {
	if (setter !== undefined) {
		this._label = setter;
		Events.Trigger('StateChange', this);
	} else {
		return this._label;
	}
}

function Path() {
	this.source = null;
	this.destination = null;
	this.on = null;
	this.hover = false;
}
Path.prototype.keys = function() {
	if (!this.on) return [];
	var keys = this.on.split('');
	for (var i=0; i < keys.length; i++) {
		if (!IsValidKey(keys[i])) {
			keys.splice(i, 1);
			i--;
		}
	}
	return keys;
}
Path.prototype.line = function() {
	var line = new Line(this.source.point, this.destination.point);
	var angle = line.angle();
	var offset = this.returnPath() ? Math.PI * 0.04 : 0;
	var from = OnCircle(this.source.point, DFA.stateRadius, angle + offset);
	var to = OnCircle(this.destination.point, DFA.stateRadius, (angle + Math.PI) - offset);
	return new Line(from, to);
}
Path.prototype.returnPath = function() {
	for (var i=0; i < this.destination.paths.length; i++) {
		var check = this.destination.paths[i];
		if (check.destination == this.source) {
			return check;
		}
	}
	return null;
}

function OnCircle(point, radius, angle) {
	return {
		x: point.x + (radius * Math.cos(angle)),
		y: point.y + (radius * Math.sin(angle))
	};
}

function IsValidKey(key) {
	var k = C(key);
	if (k >= C('A') && k <= C('Z')) return true;
	if (k >= C('a') && k <= C('z')) return true;
	if (k >= C('0') && k <= C('9')) return true;
	return false;

	function C(s) {
		return s.charCodeAt(0);
	}
}

function GetStatePoint(point) {
	var radius = DFA.stateRadius;
	var canvas = $('#canvas');
	var maxX = canvas.width() - radius + canvas[0].scrollLeft;
	var maxY = canvas.height() - radius + canvas[0].scrollTop;
	return {
		x: Bound(point.x, radius, maxX),
		y: Bound(point.y, radius, maxY)
	};

	function Bound(value, min, max) {
		return Math.min(Math.max(value, min), max);
	}
}

function GetStateAt(point) {
	for (var i=DFA.states.length-1; i >= 0; i--) {
		var state = DFA.states[i];
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

var DFA = {
	states: [],
	stateRadius: 30
};

(function() {
	function GetPoint(e) {
		var pos = $('#canvas').position();
		return {
			x: e.pageX - pos.left,
			y: e.pageY - pos.top
		};
	}

	function MouseHandler(name) {
		return function(e) {
			Events.Trigger(name, GetPoint(e));
		}
	}

	var canvas = GetCanvas();
	canvas.addEventListener('mousemove', MouseHandler('MouseMove'));
	canvas.addEventListener('click', MouseHandler('Click'));
	canvas.addEventListener('mousedown', MouseHandler('MouseDown'));
	document.addEventListener('mouseup', MouseHandler('MouseUp'));
})();
