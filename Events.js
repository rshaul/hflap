
/*
 * Didn't like how I couldn't pass exactly the
 * event arguments I wanted to jQuery.trigger()
 */
var Events = (function () {
	var events = {};
	var one = {};

	return {
		On: On,
		Off: Off,
		One: One,
		Trigger: Trigger,
	};

	function On(name, action) {
		if (events[name] === undefined) events[name] = [];
		events[name].push(action);
	}

	function Off(name, action) {
		if (events[name]) {
			for (var i=0; i < events[name].length; i++) {
				if (events[name][i] == action) {
					events[name].splice(i, 1);
				}
			}
		}
	}

	function One(name, action) {
		if (one[name] === undefined) one[name] = [];
		one[name].push(action);
	}

	function Trigger(name /*, event args, ...*/) {
		// copy arguments
		var args = [].slice.call(arguments);
		// Remove 'name'
		args.shift();
		if (events[name]) {
			for (var i=0; i < events[name].length; i++) {
				events[name][i].apply(document, args);
			}
		}
		if (one[name]) {
			for (var i=0; i < one[name].length; i++) {
				one[name][i].apply(document, args);
			}
			one[name] = [];
		}
	}
	
})();
