
var HoverPath = (function() {
	var hovering;

	return {
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
		SetHovering(null);
	}

	function MouseDown(point) {
		if (hovering) {
			SelectPath.Select(hovering);
		}
	}

	function MouseMove(point) {
		SetHovering(null);
		var state = GetStateAt(point);
		if (!state) {
			var path = GetPathAt(point);
			if (path) {
				SetHovering(path);
				SetCursor('pointer');
			}
		}
	}

	function GetPathAt(point) {
		for (var i=0; i < DFA.states.length; i++) {
			var state = DFA.states[i];
			for (var j=0; j < state.paths.length; j++) {
				var path = state.paths[j];
				if (path.isSelfLoop()) {
					if (IsAtSelfLoop(point, state)) return path;
				} else {
					if (IsAtLinearPath(point, path)) return path;
				}
			}
		}
		return null;
	}

	function IsAtSelfLoop(point, state) {
		var curve = state.selfLoopCurve();
		// Cursor lies inside the bounds of the loop
		var minX = Math.min(curve.from.x, curve.cp1.x, curve.cp2.x, curve.to.x);
		var maxX = Math.max(curve.from.x, curve.cp1.x, curve.cp2.x, curve.to.x);
		var minY = Math.min(curve.from.y, curve.cp1.y, curve.cp2.y, curve.to.y);
		var maxY = Math.max(curve.from.y, curve.cp1.y, curve.cp2.y, curve.to.y);
		return (point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY);
	}

	function IsAtLinearPath(point, path) {
		var margin = 5;
		var line = path.line();
		// Cursor lies inside the bounds of the path
		var minX = Math.min(line.from.x, line.to.x);
		var maxX = Math.max(line.from.x, line.to.x);
		var minY = Math.min(line.from.y, line.to.y);
		var maxY = Math.max(line.from.y, line.to.y);
		if (point.x >= minX-margin && point.x <= maxX+margin && point.y >= minY-margin && point.y <= maxY+margin) {
			var y = line.getY(point.x);
			var x = line.getX(point.y);
			// Cursor lies along the equation given by the path
			if (Math.abs(y - point.y) <= margin || Math.abs(x - point.x) <= margin) {
				return true;
			}
		}
		return false;
	}

	function SetHovering(path) {
		if (hovering) hovering.hover = false;
		if (path) {
			hovering = path;
			hovering.hover = true;
		} else {
			hovering = null;
		}
	}
})();
