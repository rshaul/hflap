
var Application = (function() {
	var canvas = document.getElementById('canvas');
	var ctx = canvas.getContext('2d');
	var canvasWidth, canvasHeight;
	var currentTool;

	Events.AddMouseMove(Draw);
	Events.AddMouseDown(Draw);

	$(window).resize(Resize);
	Resize();

	$('#pointTool').click(HandleTool(PointTool)).click();
	$('#stateTool').click(HandleTool(StateTool));
	$('#pathTool').click(HandleTool(PathTool));

	return {
		Draw: Draw,
		GetDataUrl: GetDataUrl,
		canvas: canvas,
		ctx: ctx
	};

	function HandleTool(action) {
		return function () {
			currentTool = function() {
				Reset();
				action();
				Draw();
				return false;
			};
			currentTool();
		}
	}

	function GetDataUrl() {
		Reset();
		Draw();
		var url = canvas.toDataURL();
		currentTool();
		return url;
	}

	function Reset() {
		AddState.Teardown();
		AddPath.Teardown();
		DragState.Teardown();
	}
	function PointTool() {
		DragState.Setup();
	}
	function StateTool() {
		DragState.Setup();
		AddState.Setup();
	}
	function PathTool() {
		AddPath.Setup();
	}

	function Resize() {
		var c = $(canvas);
		canvasWidth = c.width();
		canvasHeight = c.height();
		c.attr('width', canvasWidth);
		c.attr('height', canvasHeight);
		Draw();
	}

	function Draw() {
		ctx.lineWidth = Math.ceil((stateRadius / 20) + 0.1);
		ctx.fillStyle = 'white';
		ctx.fillRect(0, 0, canvasWidth, canvasHeight);
		ctx.fillStyle = 'black';
		AddPath.Draw(ctx);
		DrawStates();
		AddState.Draw(ctx);
	}

	function ControlPointLength() {
		return stateRadius*1.5;
	}
	function ControlPoint(p1, p2) {
		var center = {
			x: (p2.x + p1.x) / 2,
			y: (p2.y + p1.y) / 2
		};
		var angle = GetAngle(p1, p2) + Math.PI / 2;
		var length = ControlPointLength();
		return {
			x: center.x + (length * Math.cos(angle)),
			y: center.y + (length * Math.sin(angle))
		};
	}
	function ControlPointAngle(p1, p2) {
		var length = ControlPointLength();
		var d = GetDistanceBetween(p1, p2) / 2;
		var angle = Math.atan(length / d);
		return angle;
	}

	function rad2deg(rad) {
		return rad * 180 / Math.PI;
	}

	function DrawArrowHead(from, to, rotate) {
		var angle = GetAngle(from, to) + rotate;
		var armAngle = Math.PI * .13;
		var armLength = stateRadius * .5;
		var arm1 = {
			x: to.x - (armLength * Math.cos(angle+armAngle)),
			y: to.y - (armLength * Math.sin(angle+armAngle))
		};
		var arm2 = {
			x: to.x - (armLength * Math.cos(angle-armAngle)),
			y: to.y - (armLength * Math.sin(angle-armAngle))
		};
		var end = {
			x: to.x - (0.6 * armLength * Math.cos(angle)),
			y: to.y - (0.6 * armLength * Math.sin(angle))
		}
		ctx.beginPath();
		ctx.moveTo(arm1.x, arm1.y);
		ctx.lineTo(to.x, to.y);
		ctx.lineTo(arm2.x, arm2.y);
		ctx.lineTo(end.x, end.y);
		ctx.fill();
	}

	function GetAngle(p1, p2) {
		var slope = (p2.y - p1.y) / (p2.x - p1.x);
		var angle = Math.atan(slope);
		if (p1.x > p2.x) angle += Math.PI;
		return angle;
	}

	function TrimRadius(p1, p2, angleOffset) {
		var angle = GetAngle(p1, p2) + angleOffset;
		return {
			x: p1.x + (stateRadius * Math.cos(angle + angleOffset)),
			y: p1.y + (stateRadius * Math.sin(angle + angleOffset))
		};
	}

	function GetReturnPath(path) {
		for (var i=0; i < path.destination.paths.length; i++) {
			var check = path.destination.paths[i];
			if (check.destination == path.source) {
				return check;
			}
		}
		return null;
	}
	function DrawStraightArrow(sp, dp) {
		var from = TrimRadius(sp, dp, 0);
		var to = TrimRadius(dp, sp, 0);
		ctx.beginPath();
		ctx.moveTo(from.x, from.y);
		ctx.lineTo(to.x, to.y);
		ctx.stroke();
		DrawArrowHead(from, to, 0);
	}
	function DrawCurvedArrow(sp, dp) {
		var offset = Math.PI * 0.04;
		var from = TrimRadius(sp, dp, offset);
		var to = TrimRadius(dp, sp, -offset);
		var cp = ControlPoint(from, to);
		ctx.beginPath();
		ctx.moveTo(from.x, from.y);
		ctx.lineTo(to.x, to.y);
		//ctx.quadraticCurveTo(cp.x, cp.y, to.x, to.y);
		ctx.stroke();
		DrawArrowHead(from, to, 0);
		//DrawArrowHead(from, to, -ControlPointAngle(from, to));
	}

	function DrawPaths(paths) {
		for (var i=0; i < paths.length; i++) {
			var path = paths[i];
			var sp = path.source.point;
			var dp = path.destination.point;
			var offset = 0;
			if (GetReturnPath(path)) {
				offset = Math.PI * 0.04;
			}
			var from = TrimRadius(sp, dp, offset);
			var to = TrimRadius(dp, sp, -offset);
			ctx.beginPath();
			ctx.moveTo(from.x, from.y);
			ctx.lineTo(to.x, to.y);
			ctx.stroke();
			DrawArrowHead(from, to);
		}
	}

	function DrawCircle(circle) {
		var point = circle.point;
		var radius = circle.radius;
		ctx.beginPath();
		ctx.arc(point.x, point.y, radius, 0, Math.PI*2, false);
		ctx.fill();
		ctx.stroke();
	}

	function IsLeftMost(state) {
		for (var i=0; i < states.length; i++) {
			if (states[i] != state && states[i].point.x < state.point.x) return false;
		}
		return true;
	}
	function IsRightMost(state) {
		for (var i=0; i < states.length; i++) {
			if (states[i] != state && states[i].point.x > state.point.x) return false;
		}
		return true;
	}
	function IsBottomMost(state) {
		for (var i=0; i < states.length; i++) {
			if (states[i] != state && states[i].point.y > state.point.y) return false;
		}
		return true;
	}
	function DrawStartArrow(state) {
		var size = stateRadius*2;
		ctx.font = size + 'px sans-serif';
		var offset = stateRadius;
		if (IsLeftMost(state)) {
			ctx.textAlign = "right";
			ctx.fillText('⇢', state.point.x - offset, state.point.y, size*2);
		} else if (IsRightMost(state)) {
			ctx.textAlign = "left";
			ctx.fillText('⇠', state.point.x + offset, state.point.y, size*2);
		} else if (IsBottomMost(state)) {
			ctx.textAlign = "center";
			ctx.fillText('⇡', state.point.x, state.point.y + 2*offset, size);
		} else {
			ctx.textAlign = "center";
			ctx.fillText('⇣', state.point.x, state.point.y - 2*offset, size);
		}
	}

	function DrawStates() {
		ctx.strokeStyle = 'black';
		ctx.textBaseline = 'middle';
		for (var i=0; i < states.length; i++) {
			var state = states[i];
			var circle = state.circle();
			ctx.fillStyle = (state.hover) ? '#DDD' : '#FFF';
			ctx.fillStyle = (state.drag) ? '#AAA' : ctx.fillStyle;
			DrawCircle(state.circle());
			if (state.accept) {
				circle.radius -= 4;
				DrawCircle(circle);
			}
			ctx.fillStyle = '#000';
			ctx.textAlign = 'center';
			ctx.font = '20px sans-serif';
			ctx.fillText(state.label, state.point.x, state.point.y, stateRadius*2);
			if (state.start) {
				DrawStartArrow(state);
			}
		}
		for (var i=0; i < states.length; i++) {
			var state = states[i];
			DrawPaths(state.paths);
		}
	}
})();
