
var SelectPath = (function() {

	var selected;
	var infoBox = $('#pathInfo');
	var fromState = $('#fromState');
	var toState = $('#toState');
	var on = $('#on');
	var remove = $('#removePath');

	return {
		Setup: Setup,
		Teardown: Teardown,
		Select: Select
	};

	function DrawEvent(action) {
		return function() {
			action.apply(this, arguments);
			Application.Draw();
		}
	}

	function Setup() {
		Events.On('MouseOver', MouseOver);
		Events.On('Click', Click);
		Events.On('StateChange', RefreshStateText);
		Events.On('StateRemove', StateRemove);
		on.on('keydown', function(e) { e.stopPropagation(); });
		on.on('keyup', DrawEvent(OnChanged));
		remove.on('click', DrawEvent(RemoveSelected));
	}

	function Teardown() {
		Events.Off('MouseOver', MouseOver);
		Events.Off('Click', Click);
		Events.Off('StateChange', RefreshStateText);
		Events.Off('StateRemove', StateRemove);
		on.off('keyup');
		remove.off('click');
	}

	function MouseOver(point) {
		var paths = AllPaths();
		for (var i=0; i < paths.length; i++) {
		}
	}

	function RefreshStateText() {
		if (selected) {
			fromState.text(selected.source.label());
			toState.text(selected.destination.label());
		}
	}

	function GetPathHoveringAt(point) {
	}

	function IsHoveringOverPath(point, path) {
	}

	function Click() {
	}

	function OnChanged() {
		selected.on = on.val();
	}

	function RemoveSelected() {
		for (var i=0; i < DFA.states.length; i++) {
			var state = DFA.states[i];
			for (var j=0; j < state.paths.length; j++) {
				if (state.paths[j] == selected) {
					state.paths.splice(j, 1);
					j--;
				}
			}
		}
	}

	function Select(path) {
		selected = path;
		if (path) {
			infoBox.show();
			on.val(path.on);
			RefreshStateText();
		} else {
			infoBox.hide();
		}
	}

	function StateRemove(state) {
		if (selected) {
			if (selected.source == state || selected.destination == state) {
				Select(null);
			}
		}
	}
})();
