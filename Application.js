
var Application = (function() {
	var canvas = document.getElementById('canvas');
	var ctx = canvas.getContext('2d');
	var canvasWidth, canvasHeight;
	var currentTool;

	var HoverStateStyle = '#DDDDFF';
	var DragStateStyle = '#AAAAFF';
	var HoverPathStyle = '#3333FF';

	SelectState.Setup();
	SelectPath.Setup();

	$(window).resize(Resize);
	Resize();

	$('#pointTool').click(GetToolHandler(PointTool));
	$('#stateTool').click(GetToolHandler(StateTool)).click();
	$('#pathTool').click(GetToolHandler(PathTool));
	$('#evaluateTool').click(GetToolHandler(EvaluateTool));

	return {
		Draw: Draw,
		GetDataUrl: GetDataUrl,
		canvas: canvas,
		ctx: ctx
	};

	function GetToolHandler(action) {
		return function() {
			$('#tools a').removeClass('selected');
			$(this).addClass('selected');
			currentTool = function() {
				Reset();
				Events.Off('MouseMove', Draw);
				Events.Off('MouseDown', Draw);
				action();
				Events.On('MouseMove', Draw);
				Events.On('MouseDown', Draw);
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
		HoverPath.Teardown();
		ShowEvaluate(false);
	}
	function PointTool() {
		DragState.Setup();
		HoverPath.Setup();
	}
	function StateTool() {
		DragState.Setup();
		AddState.Setup();
	}
	function PathTool() {
		AddPath.Setup();
		HoverPath.Setup();
	}
	function EvaluateTool() {
		ShowEvaluate(true);
	}

	function ShowEvaluate(show) {
		if (show) {
			$('#sideBarEdit').hide();
			$('#sideBarEvaluate').show();
		} else {
			$('#sideBarEdit').show();
			$('#sideBarEvaluate').hide();
		}
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

	function DrawPath(path) {
		ctx.save();
		if (path.hover) {
			ctx.fillStyle = HoverPathStyle;
			ctx.strokeStyle = HoverPathStyle;
		}
		if (path.isSelfLoop()) {
			DrawSelfLoopPath(path);
		} else {
			DrawLinearPath(path);
		}
		ctx.restore();

	}

	function DrawSelfLoopPath(path) {
		var state = path.source;
		DrawSelfLoopArrow(state);

		// Draw Text
		var curve = state.selfLoopCurve();
		var x = (curve.to.x + curve.from.x) / 2;
		var y = curve.cp1.y;
		ctx.fillText(path.keys().join(','), x, y);
	}
	function DrawSelfLoopArrow(state) {
		var curve = state.selfLoopCurve();

		ctx.beginPath();
		ctx.moveTo(curve.from.x, curve.from.y);
		ctx.bezierCurveTo(curve.cp1.x, curve.cp1.y, curve.cp2.x, curve.cp2.y, curve.to.x, curve.to.y);
		ctx.stroke();

		DrawArrowHead(curve.to, state.selfLoopAngle);
	}

	function DrawLinearPath(path) {
		var line = path.line();
		var from = line.from;
		var to = line.to;

		var flipLabel = false;
		//var flipLabel = (from.x > to.x);
		var labelAbove = true;

		var returnPath = path.returnPath();
		if (returnPath) {
			var returnPoint = returnPath.line().to;
			if (from.y == returnPoint.y) {
				labelAbove = from.x > returnPoint.x;
			} else {
				labelAbove = from.y < returnPoint.y;
			}
		}

		ctx.beginPath();
		ctx.moveTo(from.x, from.y);
		ctx.lineTo(to.x, to.y);
		ctx.stroke();
		DrawArrowHead(line.to, line.angle() + Math.PI);
		DrawPathLabel(path, flipLabel, labelAbove);

		function DrawPathLabel(path, flip, above) {
			var stateLine = new Line(path.source.point, path.destination.point);
			var angle = stateLine.angle();
			if (angle >= Math.PI * .5 && angle < Math.PI * 1.5) {
				angle += Math.PI;
			}
			ctx.save();
			var center = path.line().center();
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
	}

	function DrawArrowHead(point, angle) {
		var armAngle = Math.PI * .13;
		var length = DFA.stateRadius * 0.5;

		var arm1 = OnCircle(point, length, angle+armAngle);
		var arm2 = OnCircle(point, length, angle-armAngle);
		var end = OnCircle(point, length * 0.6, angle);

		ctx.beginPath();
		ctx.moveTo(arm1.x, arm1.y);
		ctx.lineTo(point.x, point.y);
		ctx.lineTo(arm2.x, arm2.y);
		ctx.lineTo(end.x, end.y);
		ctx.fill();
	}

	function DrawCircle(point, radius) {
		ctx.beginPath();
		ctx.arc(point.x, point.y, radius, 0, Math.PI*2, false);
		ctx.fill();
		ctx.stroke();
	}

	function DrawStartArrow(state) {
		var point = state.point;

		ctx.save();
		ctx.translate(point.x, point.y);
		if (IsLeftMost(state)) {
			ctx.rotate(0);
		} else if (IsRightMost(state)) {
			ctx.rotate(Math.PI);
		} else if (IsBottomMost(state)) {
			ctx.rotate(-Math.PI/2);
		} else {
			ctx.rotate(Math.PI/2);
		}

		// Draw as if positioned to left --> ( )
		// Draw Arrow
		var radius = state.circle().radius;
		var armAngle = Math.PI * .15;
		var armLength = radius * .5;
		var start = { x: radius * -1.15, y: 0 };
		var arm1 = OnCircle(start, armLength, Math.PI + armAngle);
		var arm2 = OnCircle(start, armLength, Math.PI - armAngle);
		var end = { x: start.x - armLength * 0.6, y: 0 };

		ctx.beginPath();
		ctx.moveTo(start.x, start.y);
		ctx.lineTo(arm1.x, arm1.y);
		ctx.lineTo(end.x, end.y);
		ctx.lineTo(arm2.x, arm2.y);
		ctx.fill();

		// Draw Tail
		var height = armLength * 0.12;
		var width = height * 3;
		var padding = width * 0.8;
		for (var i=0; i < 4; i++) {
			var x = end.x - (width * i) - (padding * i);
			var y = end.y;
			ctx.beginPath();
			ctx.moveTo(x, y - height);
			ctx.lineTo(x, y + height);
			ctx.lineTo(x-width, y + height);
			ctx.lineTo(x-width, y - height);
			ctx.fill();
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

	function DrawStates() {
		var radius = DFA.stateRadius;
		ctx.strokeStyle = 'black';
		ctx.textBaseline = 'middle';
		ctx.font = (radius * .66) + 'px sans-serif';
		ctx.textAlign = 'center';
		for (var i=0; i < DFA.states.length; i++) {
			var state = DFA.states[i];
			for (var j=0; j < state.paths.length; j++) {
				DrawPath(state.paths[j]);
			}
			if (state.previewSelfLoop) {
					DrawSelfLoopArrow(state);
			}
		}
		for (var i=0; i < DFA.states.length; i++) {
			var state = DFA.states[i];
			var point = state.point;

			if (state.drag) ctx.fillStyle = DragStateStyle;
			else if (state.hover) ctx.fillStyle = HoverStateStyle;
			else ctx.fillStyle = 'white';

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
	}
})();
