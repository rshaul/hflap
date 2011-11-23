
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

	function DrawPathLabel(path, flip, above) {
		var center = path.line().center();
		var angle = path.line().angle();
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
		ctx.fillText(path.keys().join(','), 0, yoffset);
		ctx.restore();
	}

	function DrawPath(path) {
		var line = path.line();
		var from = line.from;
		var to = line.to;

		var flipLabel = (from.x > to.x);
		var labelAbove = true;
		if (path.returnPath()) {
			labelAbove = from.x < to.x;
		}

		ctx.beginPath();
		ctx.moveTo(from.x, from.y);
		ctx.lineTo(to.x, to.y);
		ctx.stroke();
		DrawArrowHead(line);
		DrawPathLabel(path, flipLabel, labelAbove);

		function DrawArrowHead(line) {
			var angle = line.angle() + Math.PI;
			var to = line.to;
			var armAngle = Math.PI * .13;
			var length = DFA.stateRadius * 0.5;

			var arm1 = OnCircle(to, length, angle+armAngle);
			var arm2 = OnCircle(to, length, angle-armAngle);
			var end = OnCircle(to, length * 0.6, angle);

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
