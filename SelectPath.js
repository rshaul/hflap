
var SelectPath = (function() {

	var selected;
	var infoBox = $('#pathInfo');
	var fromState = $('#fromState');
	var toState = $('#toState');
	var label = $('#label');
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
		Events.On('StateChange', RefreshStateText);
		Events.On('StateRemove', StateRemove);
		label.on('keyup', DrawEvent(LabelChanged));
		remove.on('click', DrawEvent(RemoveSelected));
	}

	function Teardown() {
		Events.Off('StateChange', RefreshStateText);
		Events.Off('StateRemove', StateRemove);
		label.off('keyup');
		remove.off('click');
	}

	function RefreshStateText() {
		if (selected) {
			fromState.text(selected.source.label());
			toState.text(selected.destination.label());
		}
	}

	function LabelChanged() {
		selected.label = label.val();
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
		Select(LastPath());
	}

	function LastPath() {
		for (var i=DFA.states.length-1; i >= 0; i--) {
			var state = DFA.states[i];
			for (var j=state.paths.length-1; j >= 0; j--) {
				return state.paths[j];
			}
		}
		return null;
	}

	function Select(path) {
		selected = path;
		if (path) {
			infoBox.show();
			label.val(path.label);
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
