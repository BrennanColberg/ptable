"use strict";

const MAX_ELECTRONEGATIVITY = 3.98;
const MIN_ELECTRONEGATIVITY = 0.79;

(function() {
	/***** GENERAL TOOLBOX METHODS *****/

	/**
	 * Boilerplate AJAX GET method, used to query for server files.
	 * @param {String} url Target URL to query
	 * @param {Function} onSuccess Function to call when the request comes in
	 */
	function ajaxGET(url, onSuccess) {
		fetch(url) // no credentials, querying GitHub raw user content
			.then(function(r) {
				if (r.status >= 200 && r.status < 300) return r.text();
				else return Promise.reject(new Error(r.status + ": " + r.statusText));
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

	// layout of the standard periodic table
	const LAYOUT = [
		[1, 0, 1],
		[2, 0, 6],
		[2, 0, 6],
		[3, 0, 15],
		[3, 0, 15],
		[3, 14, 15],
		[3, 14, 15]
	];

	// millisecond period between color updates
	const FADE_DELAY = 2000;

	// JSON of all elements
	let elements = undefined; // array
	let elementsMap = undefined; // map (name: element)
	// generated DOM elements
	let elementDOMs = [];
	// elements within a series
	let seriesDOMs = [];
	// index for fading colors
	let colorIndex = 0;
	// whether or not L/A series are hidden
	let seriesHidden = true;
	let colorMode = "Default"; // "Default" or "Electronegativity"

	window.addEventListener("load", function() {
		// querying someone else's elements data JSON because it exists so
		// why should I make my own?
		// Credit: https://github.com/Bowserinator
		ajaxGET(
			"https://raw.githubusercontent.com/Bowserinator/Periodic-Table-JSON/master/PeriodicTableJSON.json",
			function(json) {
				elements = JSON.parse(json).elements;
				elementsMap = {};
				elements.forEach(element => (elementsMap[element.name] = element));
				fillTableHTML($("table"), LAYOUT);
				updateColors();
				setInterval(updateColors, FADE_DELAY);
				document.documentElement.style.setProperty(
					"--fade-time",
					FADE_DELAY + "ms"
				);
			}
		);
		$("#toggleSeries").onclick = toggleSeries;
		$("#show-electronegativity").onclick = showElectronegativity;
		$("#hide-electronegativity").onclick = hideElectronegativity;
	});
	window.addEventListener("resize", updateElementSize);
	window.addEventListener("mousemove", updateTooltipPosition);

	function fillTableHTML(parentDOM, layout) {
		// gets larger dimensions for iterator
		let rowCount = layout.length;
		let columnCount = 0;
		let seriesLength = 0;
		for (let i = 0; i < layout.length; i++) {
			let entry = layout[i];
			columnCount = Math.max(columnCount, entry[0] + entry[2]);
			if (entry[2]) seriesLength = Math.max(seriesLength, entry[1]);
		}

		// iterates and creates DOM
		let elementIndex = 0;
		for (let row = 0; row < rowCount; row++) {
			let rowDOM = ce("tr");
			let rowLayout = layout[row];
			// generates left-aligned elements
			for (let col = 1; col <= rowLayout[0]; col++) {
				rowDOM.appendChild(generateElementHTML(elementIndex++));
			}
			// generates series (hidden)
			if (rowLayout[2]) {
				for (let col = 1; col <= rowLayout[1]; col++) {
					let cell = generateElementHTML(elementIndex++);
					markAsSeries(cell);
					rowDOM.appendChild(cell);
				}
			}
			// prints blank series cells for structure
			let seriesSpacers = seriesLength - rowLayout[1];
			for (let col = 1; col <= seriesSpacers; col++) {
				let cell = ce("td");
				markAsSeries(cell);
				rowDOM.appendChild(cell);
			}
			// prints blank cells for structure (always present)
			let spacers = columnCount - rowLayout[0] - rowLayout[2];
			for (let col = 1; col <= spacers; col++) {
				rowDOM.appendChild(ce("td"));
			}
			// generates right-aligned elements
			for (let col = 1; col <= rowLayout[2]; col++) {
				rowDOM.appendChild(generateElementHTML(elementIndex++));
			}
			parentDOM.appendChild(rowDOM);
		}
	}

	function generateElementHTML(index) {
		let cellDOM = ce("td");
		cellDOM.className = "element";
		let link = elements[index].source;
		let number = index + 1;
		let symbol = elements[index].symbol;
		let name = elements[index].name;
		let mass = Math.round(elements[index].atomic_mass * 1000) / 1000;
		let electronegativity = elements[index].electronegativity_pauling || "–";
		if (link)
			cellDOM.onclick = function() {
				window.location.href = link;
			};
		if (number) cellDOM.appendChild(ce("span", number, "number"));
		if (symbol) cellDOM.appendChild(ce("span", symbol, "symbol"));
		if (name) cellDOM.appendChild(ce("span", name, "name"));
		if (mass) cellDOM.appendChild(ce("span", mass, "data mass"));
		if (electronegativity)
			cellDOM.appendChild(
				ce("span", electronegativity, "data electronegativity")
			);
		cellDOM.onmouseenter = function() {
			startHover(this);
		};
		cellDOM.onmouseleave = function() {
			endHover(this);
		};
		elementDOMs.push(cellDOM);
		return cellDOM;
	}

	function markAsSeries(dom) {
		dom.classList.add("hidden");
		seriesDOMs.push(dom);
	}

	function updateColors() {
		if (colorMode === "Default") {
			colorIndex += 150;
			for (let i = 0; i < elementDOMs.length; i++) {
				const atomicIndex = i;
				const r = 118 - atomicIndex + colorIndex,
					g = atomicIndex + colorIndex * 1.1,
					b = atomicIndex * 2 + colorIndex * 1.2;
				setColor(elementDOMs[i], r, g, b, 125, 225);
			}
			document.documentElement.style.setProperty(
				"--electronegativity-display",
				"none"
			);
			document.documentElement.style.setProperty("--mass-display", "block");
		} else if (colorMode === "Electronegativity") {
			for (let i = 0; i < elementDOMs.length; i++) {
				const elementDOM = elementDOMs[i];
				const name = elementDOM.querySelector(".name").textContent;
				const element = elementsMap[name];
				const electronegativity = element.electronegativity_pauling;
				if (electronegativity) {
					const scaledEN = Math.floor(
						((electronegativity - MIN_ELECTRONEGATIVITY) /
							(MAX_ELECTRONEGATIVITY - MIN_ELECTRONEGATIVITY)) *
							255
					);
					setColor(elementDOMs[i], 255, 255 - scaledEN, 255 - scaledEN, 0, 255);
				} else {
					setColor(elementDOMs[i], 128, 128, 128, 125, 255);
				}
			}
			document.documentElement.style.setProperty(
				"--electronegativity-display",
				"block"
			);
			document.documentElement.style.setProperty("--mass-display", "none");
		}
	}

	/**
	 * Sets the color of an element in the DOM.
	 * @param {*} dom DOM element to set
	 * @param {Number} r ≡ red amount (mod 256)
	 * @param {Number} g ≡ green amount (mod 256)
	 * @param {Number} b ≡ blue amount (mod 256)
	 * @param {*} min bottom of range to map 0-255 R/G/B values into
	 * @param {*} max top of range ot map 0-255 R/G/B values into
	 */
	function setColor(dom, r, g, b, min = 0, max = 255) {
		function treatColorDigit(v) {
			let rotations = Math.floor(v / 256);
			if (rotations % 2 === 0 && rotations > 0) v %= 256;
			else if (rotations % 2 === 1) v = 255 - (v % 256);
			return Math.floor((v / 255) * (max - min) + min);
		}
		r = treatColorDigit(r);
		g = treatColorDigit(g);
		b = treatColorDigit(b);
		dom.style.backgroundColor = "rgb(" + r + ", " + g + ", " + b + ")";
	}

	// maintains 5vw because text size doesn't update otherwise
	function updateElementSize() {
		const size = window.innerWidth / (seriesHidden ? 20 : 35.7);
		document.documentElement.style.setProperty("--element-size", size + "px");
	}

	function updateTooltipPosition(event) {
		const tooltip = document.querySelector("#tooltip");
		tooltip.style.setProperty(
			"left",
			event.clientX - tooltip.clientWidth / 2 + "px"
		);
		tooltip.style.setProperty("top", event.clientY + 15 + "px");
	}

	function startHover(cellDOM) {
		const tooltip = document.querySelector("#tooltip");
		const elementContainer = tooltip.querySelector("#element");
		while (elementContainer.childElementCount)
			elementContainer.removeChild(elementContainer.firstChild);
		elementContainer.appendChild(cellDOM.cloneNode(true));
		tooltip.classList.remove("hidden");
	}

	function endHover(cellDOM) {
		const tooltip = document.querySelector("#tooltip");
		tooltip.classList.add("hidden");
	}

	/* BUTTON FUNCTIONS */

	function toggleSeries() {
		if (seriesHidden) {
			for (let i = 0; i < seriesDOMs.length; i++) {
				seriesDOMs[i].classList.remove("hidden");
			}
		} else {
			for (let i = 0; i < seriesDOMs.length; i++) {
				seriesDOMs[i].classList.add("hidden");
			}
		}
		seriesHidden = !seriesHidden;
		updateElementSize();
	}

	function showElectronegativity() {
		colorMode = "Electronegativity";
		$("#show-electronegativity").classList.add("hidden");
		$("#hide-electronegativity").classList.remove("hidden");
	}

	function hideElectronegativity() {
		colorMode = "Default";
		$("#show-electronegativity").classList.remove("hidden");
		$("#hide-electronegativity").classList.add("hidden");
	}
})();
