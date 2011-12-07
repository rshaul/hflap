
var SelectState = (function() {

	var selected;
	var infoBox = $('#stateInfo');
	var nameBox = $('#name');
	var startBox = $('#start');
	var acceptBox = $('#accept');
	var removeButton = $('#removeState');
	
	return {
		Setup: Setup,
		Teardown: Teardown,
		Select: Select
	};

	function DrawEvent(action) {
		return function(e) {
			action(e);
			Application.Draw();
		};
	}

	function Setup() {
		Events.On('MouseDown', MouseDown);
		Events.On('MouseUp', MouseUp);
		nameBox.on('keyup', DrawEvent(NameChanged));
		startBox.on('click', DrawEvent(StartChanged));
		acceptBox.on('click', DrawEvent(AcceptChanged));
		removeButton.on('click', DrawEvent(RemoveSelected));
	}
	function Teardown() {
		Events.Off('MouseDown', MouseDown);
		Events.Off('MouseUp', MouseUp);
		nameBox.off('keyup');
		startBox.off('click');
		acceptBox.off('accept');
		removeButton.off('click');
	}

	function MouseDown(point) {
		var state = GetStateAt(point);
		if (state) {
			Select(state);
		}
	}
	function MouseUp(point) {
		MouseDown(point);
	}

	function Select(state) {
		selected = state;
		if (state) {
			infoBox.show();
			nameBox.val(state.label());
			startBox.prop('checked', state.start);
			acceptBox.prop('checked', state.accept);
		} else {
			infoBox.hide();
		}
	}

	function NameChanged(e) {
		selected.label(nameBox.val());
		e.stopPropagation();
		return false;
	}

	function StartChanged() {
		for (var i=0; i < DFA.states.length; i++) {
			DFA.states[i].start = false;
		}
		selected.start = startBox.prop('checked');
	}

	function AcceptChanged() {
		selected.accept = acceptBox.prop('checked');
	}

	function RemoveSelected() {
		var states = DFA.states;
		for (var i=0; i < states.length; i++) {
			if (states[i] == selected) {
				states.splice(i, 1);
				i--;
			}
		}
		for (var i=0; i < states.length; i++) {
			for (var j=0; j < states[i].paths.length; j++) {
				var path = states[i].paths[j];
				if (path.destination == selected) {
					states[i].paths.splice(j, 1);
					j--;
				}
			}
		}
		Events.Trigger('StateRemove', selected);
		if (states.length == 0) {
			Select(null);
		} else {
			Select(states[states.length-1]);
		}
	}
})();

