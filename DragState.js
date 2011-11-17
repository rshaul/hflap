var DragState = (function () {
	var dragOffset = 0;
	var dragging = null;
	var hovering = null;
	var delta;
	
	return {
		Setup: Setup,
		Teardown: Teardown,
		DragOffset: DragOffset
	};

	function Setup() {
		Canvas.AddMouseMove(MouseMove);
		Canvas.AddMouseDown(MouseDown);
	}
	function Teardown() {
		Canvas.RemoveMouseMove(MouseMove);
		Canvas.RemoveMouseDown(MouseDown);
	}

	function DragOffset(setter) {
		if (setter !== undefined) {
			dragOffset = setter;
		} else {
			return dragOffset;
		}
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
				SetCursor();
				SetHovering(null);
			}
		}
	}

	function MouseDown(point) {
		SelectState(point);
		StartDragState(point);
	}

	function StartDragState(point) {
		var state = GetStateAt(point);
		if (CanDrag(point, state)) {
			SetDragging(state);
 			delta = GetDelta(state.point, point);
			Canvas.OneMouseUp(function() {
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
		var dragRadius = circle.radius + dragOffset;
		return circle.distanceTo(point) <= dragRadius;
	}

	function GetDelta(point1, point2) {
		return {
			x: point1.x - point2.x,
			y: point1.y - point2.y
		};
	}

})();
