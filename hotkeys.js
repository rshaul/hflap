
(function() {

		$(document).on('keydown', DoKey);

		var Key = {
			A: 65,
			S: 83,
			D: 68,
			Equal: 187,
			Minus: 189
		};

		function DoKey(e) {
			switch (e.which) {
				case Key.A:
					$('#pointTool').click();
					break;
				case Key.S:
					$('#stateTool').click();
					break;
				case Key.D:
					$('#pathTool').click();
					break;
				case Key.Equal:
					IncreaseSize();
					break;
				case Key.Minus:
					DecreaseSize();
					break;
			}
		}
})();
