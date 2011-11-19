
var Application = (function() {
	var canvas = document.getElementById('canvas');
	var ctx = canvas.getContext('2d');
	var canvasWidth, canvasHeight;
	var currentTool;

	SelectState.Setup();

	Events.AddMouseMove(Draw);
	Events.AddMouseDown(Draw);

	$(window).resize(Resize);
	Resize();

	$('#pointTool').click(HandleTool(PointTool));
	$('#stateTool').click(HandleTool(StateTool)).click();
	$('#pathTool').click(HandleTool(PathTool));

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

	function DrawPath(path) {
		var ArrowHeadArmLength = DFA.stateRadius * 0.5;
		var ArrowHeadEndLength = ArrowHeadArmLength * 0.6;

		var sp = path.source.point;
		var dp = path.destination.point;
		var offset = 0;
		if (GetReturnPath(path)) {
			offset = Math.PI * 0.04;
		}
		var from = TrimRadius(sp, dp, 0, offset);
		var to = TrimRadius(dp, sp, 0, -offset);
		ctx.beginPath();
		ctx.moveTo(from.x, from.y);
		ctx.lineTo(to.x, to.y);
		ctx.stroke();
		DrawArrowHead(from, to);
		DrawSelfLoop(path);

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
		var size = radius*2;
		ctx.font = size + 'px sans-serif';
		var xoffset = radius;
		var yoffset = 1.9 * radius;

		if (IsLeftMost(state)) {
			ctx.textAlign = "right";
			ctx.fillText('⇢', point.x - xoffset, point.y, size*2);
		} else if (IsRightMost(state)) {
			ctx.textAlign = "left";
			ctx.fillText('⇠', point.x + xoffset, point.y, size*2);
		} else if (IsBottomMost(state)) {
			ctx.textAlign = "center";
			ctx.fillText('⇡', point.x, point.y + yoffset, size);
		} else {
			ctx.textAlign = "center";
			ctx.fillText('⇣', point.x, point.y - yoffset, size);
		}

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
		//var cp = OnCircle(state.point, DFA.stateRadius*4, Math.PI * -0.5);

		ctx.beginPath();
		ctx.moveTo(from.x, from.y);
		//ctx.quadraticCurveTo(cp.x, cp.y, to.x, to.y);
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
		ctx.strokeStyle = 'black';
		ctx.textBaseline = 'middle';
		for (var i=0; i < DFA.states.length; i++) {
			var state = DFA.states[i];
			var point = state.point;
			var radius = state.circle().radius;
			ctx.fillStyle = (state.hover) ? '#DDD' : '#FFF';
			ctx.fillStyle = (state.drag) ? '#AAA' : ctx.fillStyle;
			DrawCircle(point, radius);
			if (state.accept) {
				DrawCircle(point, radius * 0.87);
			}
			ctx.fillStyle = '#000';
			ctx.textAlign = 'center';
			ctx.font = (radius * .66) + 'px sans-serif';
			ctx.fillText(state.label, point.x, point.y, radius*2);
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
