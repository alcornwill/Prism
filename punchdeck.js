// Global Utils //
function doNothing() {};

// terminal //
var terminal = {};

terminal.pxWidth = 500;
terminal.pxHeight = 500;

terminal.width = 52; // could be determined programmatically from the 
terminal.height = 28; // dimentions in pixels and the font dimentions.

terminal.init = function() {
	terminal.terminal = document.getElementById("terminal");
	terminal.construct();
	terminal.realign();
	bindings.initKeys();
	crappyTest();
	startTimer();
};

function startTimer()
{
	clearInterval(timer);
	search("alphaCursor").visible = true;
	var timer = setInterval(toggleCursor, 350);
}

function toggleCursor()
{
	search("alphaCursor").visible
	? search("alphaCursor").visible = false
	: search("alphaCursor").visible = true;
	terminal.update();
}

terminal.realign = function() {
	var w = window.innerWidth;
	var h = window.innerHeight;
	
	terminal.terminal.style.top = ((h / 2) - (terminal.pxWidth / 2)) + "px";
	terminal.terminal.style.left = ((w / 2) - (terminal.pxHeight / 2)) + "px";
};

terminal.lines = [];

terminal.construct = function() {
	for (var y=0; y<terminal.height; y++) {
		var node = document.createElement("DIV");
		node.id = "line" + y;
		terminal.terminal.appendChild(node);
		terminal.lines[y] = node;
	}
};

terminal.update = function() {
	search("alphaCursor").update();
	draw(screenBuffers[activeBuffer]);
	for (var y=0; y<terminal.height; y++) {
		terminal.lines[y].innerHTML = terminal.getLine(y);
	}
}

terminal.getLine = function(y) {
	var line = "";
	var offset = y*terminal.width;
	for (var i=offset; i<offset+terminal.width; i++) {
		line += terminal.textBuffer.buffer[i];
	}
	return line;
};

function draw(toDraw) {
	drawRegion(0, toDraw);
}

function drawRegion(offset, toDraw) {
	// recursively get the buffers of everything, in z order, and push it to textBuffer.
	// for every line, copy the buffer by element.
	// at the end of the line, increate y and skip i by textBuffer.width - toDraw.width
	offset += (toDraw.y*terminal.width)+toDraw.x;
	var i=offset;
	for (var y=0; y<toDraw.height; y++) {
		for (var x=0; x<toDraw.width; x++) {
			terminal.textBuffer.buffer[i] = '<font color="blue">' + toDraw.buffer[(y*toDraw.width)+x] + "</font>"; // text regions should not be rendered like this if we are going to have control characters.
			i++;
		}
		i += terminal.textBuffer.width - toDraw.width;
	}
	
	for (var i=0; i<toDraw.subRegions.length; i++) {
		if (toDraw.subRegions[i].visible) {
			drawRegion(offset, toDraw.subRegions[i]);
		}
	}
}
terminal.textBuffer = new region();
terminal.textBuffer.width = terminal.width;
terminal.textBuffer.height = terminal.height;
terminal.textBuffer.initChar = '\u2588';
terminal.textBuffer.hydrate();

var selected = {};

// searches through hierarchy to call select of matching region name
function select(name) {
	var item = search(name);
	item.select();
}

// depth first search
function search(name) {
	return innerSearch(screenBuffers, name)
}

function innerSearch(item, name) {
	for (var i=0; i<item.length; i++) {
		if (item[i].name==name) {
			return item[i];
		}
		return innerSearch(item[i].subRegions, name);
	}
	console.log("item not found");
}
/////////////////////////////////////////

// Region //
function region() {
	this.name = "unnamed";

	this.width = 0; // too abstracted
	this.height = 0;

	this.x = 0; // too abstracted
	this.y = 0;

	this.buffer = [];
	this.initChar = '\u00a0'; // if '' then transparent

	this.subRegions = [];
	
	this.visible = true;
	this.outlined = false;
	
	this.selectFunction = function(){doNothing()};
	this.select = function(){ selected = this; this.selectFunction(); }; // adds this to global selected variable

	this.hydrate = function() {
		var length = this.width*this.height; // too abstracted (because width and height)
		for (var i=0; i<length; i++) {
			this.buffer[i] = this.initChar;
		}
	};
	
	// too abstracted
	this.cursor = 0;
	
	// matrix stuff
	
	// private
	this.m_cursorGet = function() {
		return {x: this.width % this.height, y: Math.floor(this.width / this.height)};
	}
	
	// private
	this.m_cursorSet = function(vec) {
		this.cursor = (vec.y * this.height) + vec.x;
	}
	
	this.cursorDown = function() {
		var vec = this.m_cursorGet();
		if (!vec.y<this.height) {
			vec.y++;
		}
		this.m_cursorSet(vec);
	}
	
	this.cursorUp = function() {
		var vec = this.m_cursorGet();
		if (!vec.y>0) {
			vec.y--;
		}
		this.m_cursorSet(vec);
	}
	
	this.cursorRight = function() {
		if (!this.cursor<this.buffer.length-1) {
			this.cursor++;
		}
	}
	
	this.cursorLeft = function() {
		if (this.cursor>0) {
			this.cursor--;
		}
	}
	
	this.print = function(ch) {
		this.buffer[this.cursor] = ch; // should be this.escape(ch)
		this.cursorRight();
		terminal.update(); // how can I solve this inheritance thing? I need some things to inherit "updating funciton". This is a cross cutting concern.
	}
	
	this.backspace = function() {
		this.cursorLeft();
		this.buffer[this.cursor] = this.initChar;
		terminal.update();
	}
	
	// this.newLine()
};

// Screen Buffers //
var screenBuffers = [];
var activeBuffer = 0;

// Screen Buffer //
function screenBuffer() {
	this.width = terminal.width;
	this.height = terminal.height;
	this.initChar = '\u2593';
};

screenBuffer.prototype = new region();

// Window Region //
function windowRegion() { // assumes that all windows are created fullscreen. Not a bad assumption.
	this.width = terminal.width;
	this.height = terminal.height-1;
	this.y = 1;
	this.constructAnchors = function(_this) {
		_this.subRegions.push( (function() {
			var anchor = new region();
			anchor.name = "anchor1";
			return anchor;
		})());
		_this.subRegions.push( (function() {
			var anchor = new region();
			anchor.name = "anchor2";
			anchor.x = Math.round(terminal.width / 2);
			return anchor;
		})());
		_this.subRegions.push( (function() {
			var anchor = new region();
			anchor.name = "anchor3";
			anchor.x = terminal.width;
			return anchor;
		})());
		_this.subRegions.push( (function() {
			var anchor = new region();
			anchor.name = "anchor4";
			anchor.y = Math.round(terminal.height / 2);
			return anchor;
		})());
		_this.subRegions.push( (function() {
			var anchor = new region();
			anchor.name = "anchor5";
			anchor.y = Math.round(terminal.height / 2);
			anchor.x = Math.round(terminal.width / 2);
			return anchor;
		})());
		_this.subRegions.push( (function() {
			var anchor = new region();
			anchor.name = "anchor6";
			anchor.y = Math.round(terminal.height / 2);
			anchor.x = terminal.width;
			return anchor;
		})());
		_this.subRegions.push( (function() {
			var anchor = new region();
			anchor.name = "anchor7";
			anchor.y = terminal.height;
			return anchor;
		})());
		_this.subRegions.push( (function() {
			var anchor = new region();
			anchor.name = "anchor8";
			anchor.y = terminal.height;
			anchor.x = Math.round(terminal.width / 2);
			return anchor;
		})());
		_this.subRegions.push( (function() {
			var anchor = new region();
			anchor.name = "anchor9";
			anchor.y = terminal.height;
			anchor.x = terminal.width;
			return anchor;
		})());
	};
};

windowRegion.prototype = new region();

// Text Region //
function textRegion() {
	this.selectFunction = function(){bindings.textEditor()};
};

textRegion.prototype = new region();

///////////////////////////////
// this should just be json

// crappy test

function crappyTest() {
	var workspace = new screenBuffer();
	workspace.name = "workspace";
	workspace.hydrate();
	screenBuffers.push(workspace);
	runAlpha();
	
	// need to figure out how to abstract this
	terminal.update();
}
	
function runAlpha() {
	// Alpha // (text editor)
	var alpha = new windowRegion();
	alpha.name = "alpha";
	alpha.initChar = '\u2591';
	alpha.constructAnchors(alpha);
	alpha.subRegions[0].subRegions.push( (function() {
		var alphaText = new textRegion();
		alphaText.name = "alphaText";
		alphaText.y = 1;
		alphaText.x = 2;
		alphaText.width = 45;
		alphaText.height = 25;
		alphaText.hydrate();
		alphaText.subRegions.push( (function(_this) {
			var cursor = new region();
			cursor.name = "alphaCursor";
			cursor.visible = false;
			cursor.width = 1;
			cursor.height = 1;
			cursor.buffer[0] = '\u2588';
			cursor.update = function() {
				cursor.x = _this.cursor % _this.width;
				cursor.y = Math.floor(_this.cursor / _this.width);
			}
			return cursor;
		})(alphaText));
		return alphaText;
	})());
	alpha.hydrate();
	screenBuffers[activeBuffer].subRegions.push(alpha);
	select("alphaText");
}

// Login //
var login = new screenBuffer();

// Desktop //
function initDesktop() {
	var desktop = new screenBuffer();
	desktop.name = "desktop";
	desktop.initChar = '\u2592';
	desktop.hydrate();
	desktop.selectFunction = function(){bindings.desktop()};

	var menuItems = [
		{ name: "Meta", selectFunction: function(){doNothing()} }, // create context menu and select it, which will set the context menu bindings.
		{ name: "File", selectFunction: function(){doNothing()} },
		{ name: "Edit", selectFunction: function(){doNothing()} },
		{ name: "View", selectFunction: function(){doNothing()} },
		{ name: "Tools", selectFunction: function(){doNothing()} }
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
		menuButton.selectFunction = _items[i].selectFunction;
		
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

// function createContextMenu
