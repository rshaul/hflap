
var SelectPath = (function() {
	var ctx = GetContext();

	return {
		Setup: Setup,
		Teardown: Teardown
	};

	function Setup() {
		Events.AddMouseOver(MouseOver);
		Events.AddClick(Click);
	}

	function MouseOver(point) {
		var paths = AllPaths();
		for (var i=0; i < paths.length; i++) {
		}
	}

	function GetPathHoveringAt(point) {
	}

	function IsHoveringOverPath(point, path) {
	}

	function AllPaths() {
		var all = [];
		for (var i=0; i < states.length; i++) {
			for (var j=0; j < states[i].paths; j++) {
				all.push(states[i].paths[j]);
			}
		}
		return all;
	}
})();