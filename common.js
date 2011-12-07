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


function Curve() {
	this.from = null;
	this.cp1 = null;
	this.cp2 = null;
	this.to = null;
}


function Line(from, to) {
	this.from = from;
	this.to = to;
}
Line.prototype.slope = function() {
	return (this.to.y - this.from.y) / (this.to.x - this.from.x);
}
Line.prototype.getY = function(x) {
	var dx = x - this.from.x;
	return (this.slope() * dx) + this.from.y;
}
Line.prototype.getX = function(y) {
	var dy = y - this.from.y;
	return ((1 / this.slope()) * dy) + this.from.x;
}
Line.prototype.angle = function() {
	var angle = Math.atan(this.slope());
	if (this.from.x > this.to.x) {
		angle += Math.PI;
	} else if (angle < 0) {
		angle += Math.PI * 2;
	} 
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
	this.previewSelfLoop = false;
	this.selfLoopAngle = Math.PI * -0.5;
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
State.prototype.hasSelfLoop = function() {
	for (var i=0; i < this.paths.length; i++) {
		if (this.paths[i].isSelfLoop()) return true;
	}
	return false;
}
State.prototype.selfLoopCurve = function() {
	var point = this.point;
	var radius = DFA.stateRadius;
	var angle = this.selfLoopAngle;
	var curve = new Curve();
	curve.from = OnCircle(point, radius, angle - Math.PI * 0.2);
	curve.cp1 = OnCircle(point, radius*3, angle - Math.PI * 0.07);
	curve.cp2 = OnCircle(point, radius*3, angle + Math.PI * 0.07);
	curve.to = OnCircle(point, radius, angle + Math.PI * 0.2);
	return curve;
}

function Path() {
	this.source = null;
	this.destination = null;
	this.label = null;
	this.hover = false;
}
Path.prototype.isSelfLoop = function() {
	return this.source == this.destination;
}
Path.prototype.keys = function() {
	return ParseInput(this.label);
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

function ParseInput(input) {
	if (!input) return [];
	var keys = input.split('');
	for (var i=0; i < keys.length; i++) {
		if (!IsValidKey(keys[i])) {
			keys.splice(i, 1);
			i--;
		}
	}
	return keys;

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
}

function OnCircle(point, radius, angle) {
	return {
		x: point.x + (radius * Math.cos(angle)),
		y: point.y + (radius * Math.sin(angle))
	};
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

	function GetMouseHandler(name) {
		return function(e) {
			Events.Trigger(name, GetPoint(e));
		}
	}

	var canvas = GetCanvas();
	canvas.addEventListener('mousemove', GetMouseHandler('MouseMove'));
	canvas.addEventListener('click', GetMouseHandler('Click'));
	canvas.addEventListener('mousedown', GetMouseHandler('MouseDown'));
	document.addEventListener('mouseup', GetMouseHandler('MouseUp'));
	
	Events.On('MouseMove', function() { SetCursor(); });
	$('#input').on('keyup', function() { $('#result').html(''); });
})();
