
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
		Events.AddMouseMove(MoveFollower);
		Events.AddClick(AddState);
	}
	function Teardown() {
		color = 'gray';
		follower = null;
		Events.RemoveMouseMove(MoveFollower);
		Events.RemoveClick(AddState);
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
		state.label = NewLabel();
		state.point = point;
		if (states.length == 0) state.start = true;
		states.push(state);
		SelectState(point);
	}

	function LabelExists(label) {
		for (var i=0; i < states.length; i++) {
			var state = states[i];
			if (state.label == label) return true;
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
		for (var i=0; i < states.length; i++) {
			var state = states[i];
			if (state.id > id) id = state.id;
		}
		return id+1;
	}

	function OverlapsState(point) {
		var circle = new Circle(point, stateRadius);
		for (var i=0; i < states.length; i++) {
			var s = states[i];
			if (circle.overlaps(s.circle())) return true;
		}
		return false;
	}

	function Draw(ctx) {
		if (!follower) return;
		if (GetStateAt(follower)) return;
		var point = GetStatePoint(follower);
		ctx.strokeStyle = color;
		var segmentSize = 3;
		var segments = Math.round(Math.PI * stateRadius*2 / segmentSize);
		if (segments % 2 == 1) segments--;
		var angle = Math.PI*2 / segments;
		for (var i=0; i < segments; i++) {
			if (i % 2 == 0) {
				var start = i * angle;
				var end = start+angle;
				ctx.beginPath();
				ctx.arc(point.x, point.y, stateRadius, start, end, false);
				ctx.stroke();
			}
		}
	}

})();
