
var AddState = (function() {
	var follower;
	var color;

	return {
		Draw: Draw,
		Setup: Setup,
		Teardown: Teardown
	};

	function Setup() {
		Teardown();
		Events.On('MouseMove', MoveFollower);
		Events.On('Click', AddState);
	}
	function Teardown() {
		color = 'gray';
		follower = null;
		Events.Off('MouseMove', MoveFollower);
		Events.Off('Click', AddState);
	}

	function MoveFollower(point) {
		follower = GetStatePoint(point);
		color = OverlapsState(follower) ? 'red' : 'gray';
	}

	function AddState(point) {
		point = GetStatePoint(point);
		if (OverlapsState(point)) return;

		var state = new State();
		state.id = NewId();
		state.label(NewLabel());
		state.point = point;
		if (DFA.states.length == 0) state.start = true;
		DFA.states.push(state);

		SelectState.Select(state);
	}

	function LabelExists(label) {
		for (var i=0; i < DFA.states.length; i++) {
			if (DFA.states[i].label() == label) return true;
		}
		return false;
	}
	function NewLabel() {
		var count = NewId();
		while (LabelExists('q' + count)) count++;
		return 'q' + count;
	}
	function NewId() {
		var id = -1;
		for (var i=0; i < DFA.states.length; i++) {
			var state = DFA.states[i];
			if (state.id > id) id = state.id;
		}
		return id+1;
	}

	function OverlapsState(point) {
		var circle = new Circle(point, DFA.stateRadius);
		for (var i=0; i < DFA.states.length; i++) {
			var s = DFA.states[i];
			if (circle.overlaps(s.circle())) return true;
		}
		return false;
	}

	function Draw(ctx) {
		if (!follower) return;
		if (GetStateAt(follower)) return;
		var point = GetStatePoint(follower);
		var radius = DFA.stateRadius;
		ctx.strokeStyle = color;
		var segmentSize = 3;
		var circumference = Math.PI * radius*2;
		var numSegments = Math.round(circumference / segmentSize);
		if (numSegments % 2 == 1) numSegments--;
		var angleDelta = Math.PI*2 / numSegments;
		for (var i=0; i < numSegments; i++) {
			if (i % 2 == 0) {
				var start = i * angleDelta;
				var end = start+angleDelta;
				ctx.beginPath();
				ctx.arc(point.x, point.y, radius, start, end, false);
				ctx.stroke();
			}
		}
	}

})();
