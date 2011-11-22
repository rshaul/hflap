
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
})();
