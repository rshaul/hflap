
var HoverPath = (function() {
	var hovering;

	return {
		Setup: Setup,
		Teardown: Teardown
	};

	function Setup() {
		Events.On('MouseMove', MouseMove);
	}
	function Teardown() {
		Events.Off('MouseMove', MouseMove);
	}

	function MouseMove(point) {
		var margin = 25;
		var paths = AllPaths();
		SetHovering(null);
		if (!HasHoverState()) {
			for (var i=0; i < paths.length; i++) {
				var path = paths[i];
				var y = path.line().getY(point.x);
				if (Math.abs(y - point.y) <= margin) {
					SetHovering(path);
					SetCursor('pointer');
				}
			}
		}
	}

	function HasHoverState() {
		for (var i=0; i < DFA.states.length; i++) {
			if (DFA.states[i].hover) return true;
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
