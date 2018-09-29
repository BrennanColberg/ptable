"use strict";
(function () {

	/***** GENERAL TOOLBOX METHODS *****/

	/**
	 * Boilerplate AJAX GET method, used to query for server files.
	 * @param {String} url Target URL to query
	 * @param {Function} onSuccess Function to call when the request comes in
	 */
	function ajaxGET(url, onSuccess) {
		fetch(url) // no credentials, querying GitHub raw user content
			.then(function (r) {
				if (r.status >= 200 && r.status < 300) return r.text();
				else return Promise.reject(
					new Error(r.status + ": " + r.statusText)
				);
			})
			.then(onSuccess)
			.catch(console.log);
	}

	/**
	 * DOM element creation shortcut.
	 * @param {String} tag HTML tag of the new element
	 * @param {String} textContent Text to put within the new element (optional)
	 * @param {Object} className class text ot assign to the new element
	 * @return {Object} Generated DOM element
	 */
	function ce(tag, textContent, className) {
		let element = document.createElement(tag);
		if (textContent) element.textContent = textContent;
		if (className) element.className = className;
		return element;
	}

	/**
	 * DOM element selection shortcut, inspired by jQuery.
	 * @param {String} selector CSS selector to query with
	 * @return {Object} Selected DOM element
	 */
	function $(selector) {
		let result = document.querySelectorAll(selector);
		return result.length > 1 ? result : result[0];
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

	// JSON of all elements
	var elements = undefined;

	window.addEventListener("load", function () {
		// querying someone else's elements data JSON because it exists so
		// why should I make my own?
		// Credit: https://github.com/Bowserinator
		ajaxGET("https://raw.githubusercontent.com/Bowserinator/Periodic-Table-JSON/master/PeriodicTableJSON.json", function (json) {
			elements = JSON.parse(json).elements;
			console.log(elements);
			fillTableHTML($("table")[0], NORMAL_LAYOUT);
			fillTableHTML($("table")[1], EXPANDED_LAYOUT);
		});
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
		let elementIndex = 0;
		for (let row = 0; row < rowCount; row++) {
			let rowDOM = ce("tr");
			let rowLayout = layout[row];
			let addedInvisibleCount = false;
			for (let col = 1; col <= columnCount; col++) {
				let isFrontElement = col <= rowLayout[0];
				let isBackElement = columnCount - col < rowLayout[1];
				// adds count for L/A series, etc (counted but can't see)
				if (!isFrontElement && !addedInvisibleCount && rowLayout[2]) {
					elementIndex += rowLayout[2];
					addedInvisibleCount = true;
				}
				rowDOM.appendChild((isFrontElement || isBackElement) ?
					generateElementHTML(elementIndex++) : // element
					ce("td") // non-element
				);
			}
			parentDOM.appendChild(rowDOM);
		}
	}

	function generateElementHTML(index) {
		let cellDOM = ce("td");
		cellDOM.className = "element";
		let number = index + 1;
		let symbol = elements[index].symbol;
		let name = elements[index].name;
		let mass = Math.round(elements[index].atomic_mass * 1000) / 1000;
		if (number) cellDOM.appendChild(ce("span", number, "number"));
		if (symbol) cellDOM.appendChild(ce("span", symbol, "symbol"));
		if (name) cellDOM.appendChild(ce("span", name, "name"));
		if (mass) cellDOM.appendChild(ce("span", mass, "mass"));
		console.log(cellDOM);
		return cellDOM;
	}

})();
