"use strict";
(function () {

	function $(selector) {
		let result = document.querySelectorAll(selector);
		return result.length > 1 ? result : result[0];
	}

	function ce(type, content) {
		let result = document.createElement(type);
		if (content) result.textContent = content;
		return result;
	}

	const ROWS = 7,
		COLUMNS = 18;

	window.addEventListener("load", function () {
		generateHTML(ROWS, COLUMNS);
	});

	function generateHTML(rowCount, columnCount) {
		let table = $("table");
		for (let row = 0; row < rowCount; row++) {
			let rowDOM = ce("tr");
			for (let col = 1; col <= columnCount; col++) {
				rowDOM.appendChild(ce("td", row * columnCount + col));
			}
			table.appendChild(rowDOM);
		}
	}

})();
