
var Application = (function() {
	var canvas = document.getElementById('canvas');
	var ctx = canvas.getContext('2d');
	var canvasWidth, canvasHeight;
	var currentTool;

	SelectState.Setup();
	SelectPath.Setup();

	Events.On('MouseMove', Draw);
	Events.On('MouseDown', Draw);

	$(window).resize(Resize);
	Resize();

	$('#pointTool').click(HandleTool(PointTool));
	$('#stateTool').click(HandleTool(StateTool)).click();
	$('#pathTool').click(HandleTool(PathTool));

	var kevin = false;
	setTimeout(function() { kevin = true; }, 10000);

	return {
		Draw: Draw,
		GetDataUrl: GetDataUrl,
		canvas: canvas,
		ctx: ctx
	};

	function HandleTool(action) {
		return function () {
			$('#tools a').removeClass('selected');
			$(this).addClass('selected');
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
		var width = (DFA.stateRadius - 30) / 15;
		if (width < 1) width = 1;
		ctx.lineWidth = width;
		ctx.fillStyle = 'white';
		ctx.fillRect(0, 0, canvasWidth, canvasHeight);
		ctx.fillStyle = 'red';
		ctx.textBaseline = 'top';
		ctx.textAlign = 'left';
		ctx.font = '100px sans-serif';
		if (kevin) {
			ctx.fillText('KEVINKEVINKEVINKEVINKEVIN', 0, 0);
		}
		ctx.fillStyle = 'black';
		AddPath.Draw(ctx);
		DrawStates();
		AddState.Draw(ctx);
	}

	function rad2deg(rad) {
		return rad * 180 / Math.PI;
	}

	function GetAngle(p1, p2) {
		var slope = (p2.y - p1.y) / (p2.x - p1.x);
		var angle = Math.atan(slope);
		if (p1.x > p2.x) angle += Math.PI;
		return angle;
	}

	function DrawPathLabel(from, to, label, flip, above) {
		var center = {
			x: (from.x + to.x) / 2,
			y: (from.y + to.y) / 2
		}
		var angle = GetAngle(from, to);
		if (flip) {
			angle += Math.PI;
		}
		ctx.save();
		ctx.translate(center.x, center.y);
		ctx.rotate(angle);
		var yoffset;
		if (above) {
			ctx.textBaseline = 'bottom';
			yoffset = -3;
		} else {
			ctx.textBaseline = 'top';
			yoffset = 3;
		}
		ctx.fillText(label, 0, yoffset);
		ctx.restore();
	}

	function DrawPath(path) {
		var ArrowHeadArmLength = DFA.stateRadius * 0.5;
		var ArrowHeadEndLength = ArrowHeadArmLength * 0.6;

		var sp = path.source.point;
		var dp = path.destination.point;
		var flipLabel = (sp.x > dp.x);
		var returnPath = GetReturnPath(path);

		var labelAbove = true;
		var offset = 0;
		if (returnPath) {
			offset = Math.PI * 0.04;
		}
		var from = TrimRadius(sp, dp, 0, -offset);
		var to = TrimRadius(dp, sp, 0, offset);
		if (returnPath) {
			labelAbove = from.x < sp.y;
		}
		ctx.beginPath();
		ctx.moveTo(from.x, from.y);
		ctx.lineTo(to.x, to.y);
		ctx.stroke();
		DrawArrowHead(from, to);
		DrawPathLabel(from, to, path.keys().join(','), flipLabel, labelAbove);

		function TrimRadius(p1, p2, radiusOffset, angleOffset) {
			var angle = GetAngle(p1, p2) + angleOffset;
			var radius = DFA.stateRadius + radiusOffset;
			return {
				x: p1.x + (radius * Math.cos(angle)),
				y: p1.y + (radius * Math.sin(angle))
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

		function DrawArrowHead(from, to) {
			var angle = GetAngle(from, to);
			var armAngle = Math.PI * .13;
			var arm1 = {
				x: to.x - (ArrowHeadArmLength * Math.cos(angle+armAngle)),
				y: to.y - (ArrowHeadArmLength * Math.sin(angle+armAngle))
			};
			var arm2 = {
				x: to.x - (ArrowHeadArmLength * Math.cos(angle-armAngle)),
				y: to.y - (ArrowHeadArmLength * Math.sin(angle-armAngle))
			};
			var end = {
				x: to.x - (ArrowHeadEndLength * Math.cos(angle)),
				y: to.y - (ArrowHeadEndLength * Math.sin(angle))
			}
			ctx.beginPath();
			ctx.moveTo(arm1.x, arm1.y);
			ctx.lineTo(to.x, to.y);
			ctx.lineTo(arm2.x, arm2.y);
			ctx.lineTo(end.x, end.y);
			ctx.fill();
		}
	}

	function DrawCircle(point, radius) {
		ctx.beginPath();
		ctx.arc(point.x, point.y, radius, 0, Math.PI*2, false);
		ctx.fill();
		ctx.stroke();
	}

	function DrawStartArrow(state) {
		var point = state.point;
		var radius = state.circle().radius;

		ctx.save();
		ctx.font = radius*2 + 'px sans-serif';
		if (IsLeftMost(state)) {
			ctx.textBaseline = 'middle';
			ctx.textAlign = 'right';
			ctx.fillText('⇢', point.x - radius, point.y);
		} else if (IsRightMost(state)) {
			ctx.textBaseline = 'middle';
			ctx.textAlign = 'left';
			ctx.fillText('⇠', point.x + radius, point.y);
		} else if (IsBottomMost(state)) {
			ctx.textBaseline = 'top';
			ctx.textAlign = 'center';
			ctx.fillText('⇡', point.x, point.y + radius);
		} else {
			ctx.textBaseline = 'bottom';
			ctx.textAlign = 'center';
			ctx.fillText('⇣', point.x, point.y - radius);
		}
		ctx.restore();

		function IsLeftMost(state) {
			for (var i=0; i < DFA.states.length; i++) {
				if (DFA.states[i].point.x < state.point.x) return false;
			}
			return true;
		}
		function IsRightMost(state) {
			for (var i=0; i < DFA.states.length; i++) {
				if (DFA.states[i].point.x > state.point.x) return false;
			}
			return true;
		}
		function IsBottomMost(state) {
			for (var i=0; i < DFA.states.length; i++) {
				if (DFA.states[i].point.y > state.point.y) return false;
			}
			return true;
		}
	}

	function DrawSelfLoop(path) {
		var state = path.source;
		DrawSelfLoopFor(state);
	}

	function DrawSelfLoopFor(state) {
		var point = state.point;
		var radius = state.circle().radius;
		var from = OnCircle(point, radius, Math.PI * -0.7);
		var cp1 = OnCircle(point, radius*3, Math.PI * -0.55);
		var cp2 = OnCircle(point, radius*3, Math.PI * -0.45);
		var to = OnCircle(point, radius, Math.PI * -0.3);

		ctx.beginPath();
		ctx.moveTo(from.x, from.y);
		ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, to.x, to.y);
		ctx.stroke();

		function OnCircle(point, radius, angle) {
			return {
				x: point.x + (radius * Math.cos(angle)),
				y: point.y + (radius * Math.sin(angle))
			};
		}
	}


	function DrawStates() {
		var radius = DFA.stateRadius;
		ctx.strokeStyle = 'black';
		ctx.textBaseline = 'middle';
		ctx.font = (radius * .66) + 'px sans-serif';
		ctx.textAlign = 'center';
		for (var i=0; i < DFA.states.length; i++) {
			var state = DFA.states[i];
			var point = state.point;
			ctx.fillStyle = (state.hover) ? '#DDD' : '#FFF';
			ctx.fillStyle = (state.drag) ? '#AAA' : ctx.fillStyle;
			DrawCircle(point, radius);
			if (state.accept) {
				DrawCircle(point, radius * 0.87);
			}
			ctx.fillStyle = '#000';
			ctx.fillText(state.label(), point.x, point.y);
			if (state.start) {
				DrawStartArrow(state);
			}
		}
		for (var i=0; i < DFA.states.length; i++) {
			var state = DFA.states[i];
			for (var j=0; j < state.paths.length; j++) {
				DrawPath(state.paths[j]);
			}
		}
	}
})();
