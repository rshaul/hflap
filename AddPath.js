
var AddPath = (function() {
	var hovering;
	var previewSelfLoop;
	var dragging;
	var draggingTo;
	var leftHome;

	return {
		Setup: Setup,
		Teardown: Teardown,
		Draw: Draw
	};

	function Setup() {
		Events.On('MouseMove', MouseMove);
		Events.On('MouseDown', MouseDown);
	}
	function Teardown() {
		Events.Off('MouseMove', MouseMove);
		Events.Off('MouseDown', MouseDown);
		SetHovering(null);
		SetPreviewSelfLoop(null);
		SetDragging(null);
		leftHome = false;
	}

	function MouseMove(point) {
		if (dragging) {
			draggingTo = point;
		}
		var state = GetStateAt(point);
		if (state) {
			SetHovering(state);
			SetCursor('crosshair');
			if (leftHome && state == dragging) {
				SetPreviewSelfLoop(state);
			}
		} else {
			SetHovering(null);
			SetPreviewSelfLoop(null);
			leftHome = true;
		}
	}

	function MouseDown(point) {
		var state = GetStateAt(point);
		leftHome = false;
		if (state) {
			SetDragging(state);
			Events.One('MouseUp', function(point) {
				AddPath(point);
				SetDragging(null);
			});
		}
	}

	function HasPath(source, destination) {
		for (var i=0; i < source.paths.length; i++) {
			var path = source.paths[i];
			if (path.destination == destination) return true;
		}
		return false;
	}

	function AddPath(point) {
		var destination = GetStateAt(point);
		if (dragging && destination && leftHome) {
			if (!HasPath(dragging, destination)) {
				var path = new Path();
				path.source = dragging;
				path.destination = destination;
				dragging.paths.push(path);

				SelectPath.Select(path);
			}
		}
	}

	function SetHovering(state) {
		if (hovering) hovering.hover = false;
		hovering = state;
		if (hovering) {
			hovering.hover = true;
		}
	}
	function SetDragging(state) {
		if (dragging) dragging.drag = false;
		dragging = state;
		if (dragging) {
			dragging.drag = true;
		} else {
			draggingTo = null;
		}
	}
	function SetPreviewSelfLoop(state) {
		if (previewSelfLoop) previewSelfLoop.previewSelfLoop = false;
		previewSelfLoop = state;
		if (previewSelfLoop) {
			previewSelfLoop.previewSelfLoop = true;
		}
	}

	function Draw(ctx) {
		if (dragging && draggingTo) {
			var point = dragging.point;
			ctx.beginPath();
			ctx.moveTo(point.x, point.y);
			ctx.lineTo(draggingTo.x, draggingTo.y);
			ctx.stroke();
		}
	}

})();
