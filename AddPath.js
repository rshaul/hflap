
var AddPath = (function() {
	var hovering;
	var dragging;
	var draggingTo;

	return {
		Draw: Draw,
		Setup: Setup,
		Teardown: Teardown
	};

	function Setup() {
		Events.AddMouseMove(MouseMove);
		Events.AddMouseDown(MouseDown);
	}
	function Teardown() {
		Events.RemoveMouseMove(MouseMove);
		Events.RemoveMouseDown(MouseDown);
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
			SetCursor();
		}
	}

	function MouseDown(point) {
		var state = GetStateAt(point);
		if (state) {
			SetDragging(state);
			Events.OneMouseUp(function(point) {
				AddPath(point);
				SetDragging(null);
			});
		}
	}

	function GetPath(source, destination) {
		for (var i=0; i < source.paths.length; i++) {
			var path = source.paths[i];
			if (path.destination == destination) return path;
		}
		return null;
	}

	function AddPath(point) {
		var destination = GetStateAt(point);
		if (dragging && destination) {
			if (!GetPath(dragging, destination)) {
				var path = new Path();
				path.source = dragging;
				path.destination = destination;
				dragging.paths.push(path);
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
