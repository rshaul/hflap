
function SelectState(point) {
	var state = GetStateAt(point);
	if (state) {
		Refresh();
	}

	function Refresh() {
		$('#info').show();
		var name = $('#name');
		name.val(state.label);
		name.off('keyup').on('keyup', NameChange);
		var start = $('#start');
		start.off('click').on('click', ToggleStart);
		start.prop('checked', state.start);
		var accept = $('#accept');
		accept.off('click').on('click', ToggleAccept);
		accept.prop('checked', state.accept);
		$('#remove').off('click').on('click', RemoveState);
	}

	function NameChange() {
		state.label = $(this).val();
		Draw();
	}
	function ToggleStart() {
		for (var i=0; i < states.length; i++) {
			states[i].start = false;
		}
		state.start = $(this).prop('checked');
		Draw();
	}
	function ToggleAccept() {
		state.accept = $(this).prop('checked');
		Draw();
	}
	function RemoveState() {
		for (var i=0; i < states.length; i++) {
			if (states[i] == state) {
				states.splice(i, 1);
			}
		}
		if (states.length == 0) {
			$('#info').hide();
		} else {
			state = states[states.length-1];
			Refresh();
		}
		Draw();
	}

	function Draw() {
		Application.Draw();
	}
}
