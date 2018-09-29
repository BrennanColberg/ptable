"use strict";
(function () {

	function $(selector) {
		let result = document.querySelectorAll(selector);
		return result.length > 1 ? result : result[0];
	}

	function ce(type, content, className) {
		let result = document.createElement(type);
		if (content) result.textContent = content;
		if (className) result.className = className;
		return result;
	}

	const NORMAL_LAYOUT = [
		[1, 1],
		[2, 6],
		[2, 6],
		[3, 15],
		[3, 15],
		[3, 15, 14],
		[3, 15, 14]
	]

	const EXPANDED_LAYOUT = [
		[1, 1],
		[2, 6],
		[2, 6],
		[3, 15],
		[3, 15],
		[17, 15],
		[17, 15]
	];

	window.addEventListener("load", function () {
		fillTableHTML($("table")[0], NORMAL_LAYOUT);
		fillTableHTML($("table")[1], EXPANDED_LAYOUT);
	});

	function fillTableHTML(parentDOM, layout) {
		// gets larger dimensions for iterator
		let rowCount = layout.length;
		let columnCount = 0;
		for (let i = 0; i < layout.length; i++) {
			let entry = layout[i];
			columnCount = Math.max(columnCount, entry[0] + entry[1]);
		}

		console.log(rowCount + " rows of " + columnCount);

		// iterates and creates DOM
		let counter = 1;
		for (let row = 0; row < rowCount; row++) {
			let rowDOM = ce("tr");
			let rowLayout = layout[row];
			let addedInvisibleCount = false;
			for (let col = 1; col <= columnCount; col++) {
				let isFrontElement = col <= rowLayout[0];
				let isBackElement = columnCount - col < rowLayout[1];
				// adds count for L/A series, etc (counted but can't see)
				if (!isFrontElement && !addedInvisibleCount && rowLayout[2]) {
					counter += rowLayout[2];
					addedInvisibleCount = true;
				}
				rowDOM.appendChild((isFrontElement || isBackElement) ?
					generateElementHTML(counter++) : // element
					ce("td") // non-element
				);
			}
			parentDOM.appendChild(rowDOM);
		}
	}

	function generateElementHTML(atomicNumber) {
		let cellDOM = ce("td");
		cellDOM.className = "element";
		cellDOM.appendChild(ce("span", atomicNumber, "number"));
		console.log(cellDOM);
		return cellDOM;
	}

})();
