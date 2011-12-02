
var AddPath = (function() {
	var hovering;
	var dragging;
	var draggingTo;
	var leftHome;

	return {
		Draw: Draw,
		Setup: Setup,
		Teardown: Teardown
	};

	function Setup() {
		Events.On('MouseMove', MouseMove);
		Events.On('MouseDown', MouseDown);
	}
	function Teardown() {
		Events.Off('MouseMove', MouseMove);
		Events.Off('MouseDown', MouseDown);
	}

	function MouseMove(point) {
		if (dragging) {
			draggingTo = point;
		}
		var state = GetStateAt(point);
		if (state) {
			SetHovering(state);
			SetCursor('crosshair');
		} else {
			SetHovering(null);
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
		if (state) {
			hovering = state;
			hovering.hover = true;
		} else {
			hovering = null;
		}
	}
	function SetDragging(state) {
		if (dragging) dragging.drag = false;
		if (state) {
			dragging = state;
			dragging.drag = true;
		} else {
			dragging = null;
			draggingTo = null;
		}
	}

	function Draw(ctx) {
		if (dragging && draggingTo) {
			var point = dragging.point;
			ctx.moveTo(point.x, point.y);
			ctx.lineTo(draggingTo.x, draggingTo.y);
			ctx.stroke();
		}
	}

})();
