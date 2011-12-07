
function Evaluate() {
	var start = GetStartState();
	if (!start) {
		Error('No start state');
		return;
	}
	if (CheckForMultiplePaths()) {
		return;
	}

	var input = ParseInput($('#input').val());
	var currentState = start;

	while (input.length > 0) {
		var next = GetNextState(currentState, input[0]);
		if (next) {
			currentState = next;
			input.shift();
		} else {
			break;
		}
	}

	if (input.length > 0) {
		Error('No path found for ' + input[0] + ' @ ' + currentState.label());
	} else {
		if (currentState.accept) {
			Result('ACCEPT', currentState);
		} else {
			Result('REJECT', currentState);
		}
	}

	function GetStartState() {
		for (var i=0; i < DFA.states.length; i++) {
			if (DFA.states[i].start) return DFA.states[i];
		}
		return null;
	}

	function GetNextState(currentState, token) {
		for (var i=0; i < currentState.paths.length; i++) {
			var path = currentState.paths[i];
			var keys = path.keys();
			if (Contains(keys, token)) {
				return path.destination;
			}
		}
		return null;
	}

	function CheckForMultiplePaths() {
		for (var i=0; i < DFA.states.length; i++) {
			var state = DFA.states[i];
			var check = [];
			for (var j=0; j < state.paths.length; j++) {
				var keys = state.paths[j].keys();
				for (var k=0; k < keys.length; k++) {
					var key = keys[k];
					if (Contains(check, key)) {
						Error('Multiple paths for ' + key + ' @ ' + state.label());
						return true;
					}
					check.push(key);
				}
			}
		}
		return false;
	}
	function Contains(arr, v) {
		for (var i=0; i < arr.length; i++) {
			if (arr[i] == v) return true;
		}
		return false;
	}

	function Error(msg) {
		$('#result').text('Error: ' + msg).addClass('error');
	}
	function Result(result, finalState) {
		$('#result').text(result).removeClass('error');
		var input = $('#input').val();
		if (input == '') input = 'ε';
		var log = '<div class="log">'
		log += '<div class="input">Input: ' + input + '</div>';
		log += '<div class="result">Result: ' + result + '</div>';
		log += '<div class="finalState">Final State: ' + finalState.label() + '</div>';
		log += '</div>';
		$('#logs').prepend(log);
	}
}
