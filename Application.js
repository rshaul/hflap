
var Application = (function() {
	var canvas = document.getElementById('canvas');
	var ctx = canvas.getContext('2d');
	var canvasWidth, canvasHeight;
	var currentTool;

	Canvas.AddMouseMove(Draw);
	Canvas.AddMouseDown(Draw);

	$(window).resize(Resize);
	Resize();

	$('#pointTool').click(HandleTool(PointTool)).click();
	$('#stateTool').click(HandleTool(StateTool));
	$('#pathTool').click(HandleTool(PathTool));

	return {
		Draw: Draw,
		GetDataUrl: GetDataUrl
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
		ctx.clearRect(0, 0, canvasWidth, canvasHeight);
		AddPath.Draw(ctx);
		DrawStates();
		AddState.Draw(ctx);
	}

	function Slope(p1, p2) {
		return (p2.y - p1.y) / (p2.x - p1.x);
	}
	function Middle(p1, p2) {
		return {
			x: (p1.x + p2.x) / 2,
			y: (p1.y + p2.y) / 2
		};
	}
	function ControlPoint(p1, p2) {
		var slope = Slope(p1, p2);
		var angle = Math.atan(slope);
		var normal = Math.PI - angle;
		var p = {
			x: 100 * Math.cos(normal),
			y: 100 * Math.sin(normal)
		};
		var middle = Middle(p1, p2);
		return {
			x: middle.x + p.x,
			y: middle.y + p.y
		};
	}

	function TrimRadius(p1, p2) {
		var slope = Slope(p1, p2);
		var angle = Math.atan(slope);
		var p = {
			x: stateRadius * Math.cos(angle),
			y: stateRadius * Math.sin(angle)
		};
		return {
			x: p1.x - p.x,
			y: p1.y - p.y
		};
	}

	function rad2deg(rad) {
		return rad * 180 / Math.PI;
	}

	function DrawArrow(path) {
		var sp = path.source.point;
		var dp = path.destination.point;
		var slope = Slope(sp, dp);
		var angle = Math.atan(slope);
		if (sp.x > dp.x) angle += Math.PI;
		var armAngle = Math.PI * .13;
		var armLength = stateRadius * .5;
		var start = {
			x: dp.x - (stateRadius * Math.cos(angle)),
			y: dp.y - (stateRadius * Math.sin(angle))
		};
		var arm1 = {
			x: start.x - (armLength * Math.cos(angle+armAngle)),
			y: start.y - (armLength * Math.sin(angle+armAngle))
		};
		var arm2 = {
			x: start.x - (armLength * Math.cos(angle-armAngle)),
			y: start.y - (armLength * Math.sin(angle-armAngle))
		};
		var end = {
			x: start.x - (0.6 * armLength * Math.cos(angle)),
			y: start.y - (0.6 * armLength * Math.sin(angle))
		}
		ctx.beginPath();
		ctx.moveTo(arm1.x, arm1.y);
		ctx.lineTo(start.x, start.y);
		ctx.lineTo(arm2.x, arm2.y);
		ctx.lineTo(end.x, end.y);
		ctx.fill();
	}

	function GetReturnPath(path) {
		for (var i=0; i < path.destination.paths.length; i++) {
			var check = path.destination.paths[i];
			if (check.destination = path.source) {
				return check;
			}
		}
		return null;
	}
	function DrawPaths(paths) {
		for (var i=0; i < paths.length; i++) {
			var path = paths[i];
			var sp = path.source.point;
			var dp = path.destination.point;
			//sp = TrimRadius(sp, dp);
			//dp = TrimRadius(dp, sp);
			//var cp = ControlPoint(sp, dp);
			ctx.beginPath();
			ctx.moveTo(sp.x, sp.y);
			//ctx.quadraticCurveTo(cp.x, cp.y, dp.x, dp.y);
			ctx.lineTo(dp.x, dp.y);
			ctx.stroke();
			DrawArrow(path);
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

	function DrawStates() {
		ctx.strokeStyle = 'black';
		ctx.textBaseline = 'middle';
		for (var i=0; i < states.length; i++) {
			var state = states[i];
			DrawPaths(state.paths);
		}
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
				ctx.textAlign = 'right';
				ctx.font = stateRadius*2 + 'px sans-serif';
				ctx.fillText('⇢', state.point.x - stateRadius, state.point.y, 60);
			}
		}
	}
})();
