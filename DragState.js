var DragState = (function () {
	var dragging = null;
	var hovering = null;
	var delta;
	
	return {
		Setup: Setup,
		Teardown: Teardown,
	};

	function Setup() {
		Events.On('MouseMove', MouseMove);
		Events.On('MouseDown', StartDragState);
	}
	function Teardown() {
		Events.Off('MouseMove', MouseMove);
		Events.Off('MouseDown', StartDragState);
		SetDragging(null);
		SetHovering(null);
	}

	function MouseMove(point) {
		if (dragging) {
			point.x += delta.x;
			point.y += delta.y;
			dragging.point = GetStatePoint(point);
		} else {
			var state = GetStateAt(point);
			if (CanDrag(point, state)) {
				SetCursor('move');
				SetHovering(state);
			} else if (hovering) {
				SetHovering(null);
			}
		}
	}

	function StartDragState(point) {
		var state = GetStateAt(point);
		if (CanDrag(point, state)) {
			SetDragging(state);
 			delta = GetDelta(state.point, point);
			Events.One('MouseUp', function() {
				SetDragging(null);
			});
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
		}
	}

	function CanDrag(point, state) {
		if (!state) return false;
		var circle = state.circle();
		return circle.distanceTo(point) <= circle.radius;
	}

	function GetDelta(point1, point2) {
		return {
			x: point1.x - point2.x,
			y: point1.y - point2.y
		};
	}

})();
