// Global Utils //
function doNothing() {};

// Console //
var console = {};

console.width = 500;
console.height = 500;

console.charsX = 52; // could be determined programmatically from the 
console.charsY = 28; // dimentions in pixels and the font dimentions.

console.init = function() {
	console.console = document.getElementById("console");
	console.construct();
	realign();
};

console.realign = function() {
	var w = window.innerWidth;
	var h = window.innerHeight;
	
	console.console.style.top = ((h / 2) - (console.width / 2)) + "px";
	console.console.style.left = ((w / 2) - (console.height / 2)) + "px";
};

console.lines = [];

console.construct = function() {
	for (var y=0; y<console.charsY; y++) {
		var node = document.createElement("DIV");
		node.id = "line" + y;	
		var textNode = document.createTextNode(console.getLine(y));
		node.appendChild(textNode);
		console.console.appendChild(node);
		node = document.getElementById("line" + y); // Do I need this?
		console.lines[y] = node;
	}
};

console.update = function() {
	for (var y=0; y<console.charsY; y++) {
		lines[0].nodeValue = document.createTextNode(console.getLine(y));
	}
}

console.getLine = function(y) {
	// Maybe I can recursivelly get the buffers of everything, in z order, and push it to another rendering buffer.
	// sequentially get lines from the render buffer.
};

function select // searches through hierarchy to call select of matching region name

function search // probably need this

/////////////////////////////////////////

// Region //
function region() {
	this.name = "unnamed";

	this.width = 0;
	this.height = 0;

	this.x = 0;
	this.y = 0;

	this.buffer = [];
	this.initChar = ''; // if '' then transparent

	this.subRegions = [];
	
	// this.visible?

	this.select = function(){doNothing()};

	this.initBuffer = function() {
		var length = console.charsX*console.charsY;
		for (var i=0; i<length; i++) {
			this.buffer[i] = this.initChar;
		}
		return this;
	};
	
	// this.matrix stuff
};

// Screen Buffers //
var screenBuffers = [];
var activeBuffer = 0;

// Screen Buffer //
function screenbuffer() {
	this.width = console.charsX;
	this.height = console.charsY;
	this.initChar = '\u00a0';
};

screenBuffer.prototype = new region();

// Window Region //
function windowRegion() {
	this.width = console.charsX;
	this.height = console.charsY-1;
	this.y = 1;
	this.constructAnchors = function() {
	// fuck this for now
	};
};

windowRegion.prototype = new region();

// Text Region //
function textRegion() {
	
};

textRegion.prototype = new region();

///////////////////////////////

// Alpha // (text editor)
var alpha.prototype = new windowRegion();

// Login //
var login.prototype = new screenBuffer();

// Desktop //
function initDesktop() {
	var desktop = new screenBuffer();
	desktop.name = "desktop";
	desktop.initChar = '\u2591';
	desktop.initBuffer();
	desktop.select = function(){bindings.desktop()};

	var menuItems = [
		{ name: "Meta", select: function(){doNothing()} }, // create context menu and select it, which will set the context menu bindings.
		{ name: "File", select: function(){doNothing()} },
		{ name: "Edit", select: function(){doNothing()} },
		{ name: "View", select: function(){doNothing()} },
		{ name: "Tools", select: function(){doNothing()} }
	];
	
	var menu = createDesktopMenu(menuItems);
	desktop.subRegions.push(menu);
	
	screenBuffers[1] = desktop;
}

// Desktop Utility // 
function createDesktopMenu(_items) {
	var length = _items.length;
	var menu = [];
	for (var i=0; i<length; i++) {
		var menuButton = new region();
		menuButton.name = _items[i].name + "Button";
		menuButton.buffer = _items[i].name;
		menuButton.select = _items[i].select;
		
		if (i!=0) {
			menuButton.x = menu[i-1].x.length+1;
		}
		menu[i] = menuButton;
	}
	for (var i=length-2; i>-1; i--) {
		menu[i].subRegion[0] = menu[i+1];
	}
	return menu[0];
}

function createContextMenu
