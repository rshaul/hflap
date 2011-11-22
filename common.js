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
Path.prototype.from = function() {
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

function GetAngle(p1, p2) {
	var slope = (p2.y - p1.y) / (p2.x - p1.x);
	var angle = Math.atan(slope);
	if (p1.x > p2.x) angle += Math.PI;
	return angle;
}

function GetDistanceBetween(p1, p2) {
	var dx = p2.x - p1.x;
	var dy = p2.y - p1.y;
	return Math.sqrt(dx*dx + dy*dy);
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
