
var Canvas = (function () {
	var canvas = document.getElementById('canvas');

	var canvasLeft = $(canvas).position().left;
	var canvasTop = $(canvas).position().top;

	var moveEvents = [];
	var clickEvents = [];
	var downEvents = [];

	canvas.addEventListener('mousemove', MouseMove);
	canvas.addEventListener('click', Click);
	canvas.addEventListener('mousedown', MouseDown);

	return {
		AddMouseMove: AddMouseMove,
		AddClick: AddClick,
		AddMouseDown: AddMouseDown,
		RemoveMouseMove: RemoveMouseMove,
		RemoveClick: RemoveClick,
		RemoveMouseDown: RemoveMouseDown,
		OneMouseUp: OneMouseUp
	};

	function AddMouseMove(action) {
		moveEvents.push(action);
	}
	function AddClick(action) {
		clickEvents.push(action);
	}
	function AddMouseDown(action) {
		downEvents.push(action);
	}


	function RemoveMouseMove(action) {
		Remove(action, moveEvents);
	}
	function RemoveClick(action) {
		Remove(action, clickEvents);
	}
	function RemoveMouseDown(action) {
		Remove(action, downEvents);
	}
	function Remove(action, events) {
		for (var i=0; i < events.length; i++) {
			if (events[i] == action) {
				events.splice(i, 1);
			}
		}
	}

	function OneMouseUp(action) {
		$(document).one('mouseup', function(e) {
			action(GetPoint(e));
		});
	}

	function GetPoint(e) {
		return {
			x: e.pageX - canvasLeft,
			y: e.pageY - canvasTop
		};
	}

	function Click(e) {
		DoEvents(e, clickEvents);
	}
	function MouseMove(e) {
		DoEvents(e, moveEvents);
	}
	function MouseDown(e) {
		DoEvents(e, downEvents);
	}

	function DoEvents(e, events) {
		var point = GetPoint(e);
		for (var i=0; i < events.length; i++) {
			events[i](point);
		}
	}
	
})();
