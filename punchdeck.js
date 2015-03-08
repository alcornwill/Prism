function doNothing() {};

var terminal= {
	name: "Terminal",

	subRegion: [],
	activeBuffer: 0,
	
	hasChanged: true,
	changed: function() {
		this.hasChanged=true;
	}
};

(function() {
	terminal.pxWidth= 500;
	terminal.pxHeight= 500;

	terminal.width= Math.floor(terminal.pxWidth/9.5);
	terminal.height= Math.floor(terminal.pxHeight/18.5);

	var lines=[];
	var container={};
	
	terminal.realign= function () {
		var w=window.innerWidth;
		var h=window.innerHeight;
		container.style.width=terminal.pxWidth;
		container.style.height=terminal.pxHeight;
		container.style.top=((h/2)-(terminal.pxHeight/2))+"px";
		container.style.left=((w/2)-(terminal.pxWidth/2))+"px";
	};
	terminal.init= (function() {
		function constructDivs() {
			for (var y=0; y<terminal.height; y++) {
				var node=document.createElement("DIV");
				node.id="line"+y;
				container.appendChild(node);
				lines[y]=node;
			}
		};
		
		return function () {
			container=document.getElementById("terminal");
			terminal.realign();
			constructDivs();
			PD.initKeys();
			crappyTest();
			PD.startTimer();
			setInterval(terminal.update, 32); // fixed 30fps
		};
	})();

	terminal.update = (function() {
		function getLine(y) {
			var line="";
			var offset=y*terminal.width;
			for (var i=offset; i<offset+terminal.width; i++) {
				line+=textBuffer.buffer[i];
			}
			return line;
		};
		function draw(toDraw) {
			drawRegion(0, toDraw);
		};
		function render(offset, toDraw) {
			var i=offset;
			for (var y=0; y<toDraw.height; y++) {
				for (var x=0; x<toDraw.width; x++) {
					var element = toDraw.buffer[toDraw.getPointer(x, y)];
					if (PD.isType(toDraw, "EditableTextRegion")||PD.isType(toDraw, "TextRegion")) {
						textBuffer.buffer[i]=element;
					} else {
						textBuffer.buffer[i]=PD.fontWrap(element, toDraw.colour, toDraw.background);
					}
					i++;
				}
				i+=textBuffer.width-toDraw.width;
			}
			toDraw.hasChanged=false;
		}
		// implement paul blart here
		function drawRegion(offset, toDraw, parentChanged) {
			var thisChanged=false;
			if (toDraw.hasChanged===true||parentChanged===true) {
				toDraw.update();
				offset+=(toDraw.y*terminal.width)+toDraw.x;
				thisChanged=true;
				render(offset, toDraw);
			} else {
				offset+=(toDraw.y*terminal.width)+toDraw.x; // gay
			}
			
			for (var i=0; i<toDraw.subRegion.length; i++) {
				if (toDraw.subRegion[i].visible) {
					drawRegion(offset, toDraw.subRegion[i], thisChanged);
				}
			}
		};
		return function () {
			if (!terminal.hasChanged) { return; }
			draw(terminal.subRegion[terminal.activeBuffer]);
			for (var y=0; y<terminal.height; y++) {
				lines[y].innerHTML=getLine(y);
			}
		};
	})();
})();

// this might need closuring / namespacing. This whole thing might need closuring / namespacing. I'm not sure how it will change though so I'm leavin it for now.
//I was thinking, since we have so many types of region, I could possibly just inject the features that I want into each one. Maybe.
// I guess we could pass in and store the reference to the parent every time we create a subRegion, so that we can traverse up the tree.
function Region(name, width, height, x, y) {
	this.name = name || (function() {
							console.log("unnamed region");
							return "ERROR"; }
						)();
	this.width = width || 0;
	this.height = height || 0;
	this.x = x || 0;
	this.y = y || 0;
	this.initChar='\u00a0'; // if '' then transparent
	this.visible=true;
	this.colour='#1D5FA1';
	this.background='#F7FCFF';
	this.selectFunction = function(){doNothing()};
	this.select = function() {
		PD.selected = this;
		this.selectFunction();
	}; 
	this.hydrate = function() {
		var length = this.width*this.height;
		for (var i=0; i<length; i++) {
			this.buffer[i] = this.initChar;
		}
	};
	this.hasChanged=true;
	this.changed = function() {
		terminal.hasChanged=true;
		this.hasChanged=true;
	}
	this.update=function() {doNothing()};
	this.getVector = function(i) {
		return {x: i%this.width, y: Math.floor(i/this.width)};
	}
	this.getPointer = function (x, y) {
		return (y*this.width)+x;
	}
};

function ScreenRegion(name) {
	this.name=name;
	this.initChar='\u2593';
	this.buffer=[];
	this.subRegion=[];
};

ScreenRegion.prototype=new Region("ScreenRegion", terminal.width, terminal.height, 0, 0);

// this is stupid. it would be better if the whole terminal object was essentially a region, but I can't put this line at the top.
var textBuffer=new ScreenRegion("TextBuffer");
textBuffer.initChar='\u2588';
textBuffer.hydrate();

// assumes that all windows are created fullscreen.
function WindowRegion(name) {
	this.name=name;
	this.buffer=[];
	this.subRegion=[];
};

WindowRegion.prototype=new Region("WindowRegion", terminal.width, terminal.height-1, 0, 1);

var EditableTextRegion = {};
var TextRegion = {};

(function() {
	var letterWrap= function(text, letter) {
		return "<" + letter + ">" + text + "</" + letter + ">";
	};
	var wrap= function(symbol) {
		var ch=symbol[0];
		var colour=symbol[1];
		var background=symbol[2];
		var underlined=symbol[3];
		var bold=symbol[4];
		var italics=symbol[5];
		
		if (underlined) {ch=letterWrap(ch, "u")};
		if (bold) {ch=letterWrap(ch, "b")};
		if (italics) {ch=letterWrap(ch, "i")};
		return PD.fontWrap(ch, colour, background);
	};
	var updateFunction = function(that) {
			var helperPointer=0;
			var tab = function() {
				var x = that.getVector(helperPointer).x;
				for (var i=x%terminal.tabsize; i<terminal.tabsize; i++) {
					printSpace();
				}
			};
			var newLine = function() {
				for (var i=that.getVector(helperPointer).x; i<that.width; i++) {
					printSpace();
				}
			};
			// it looks weird that spaces arn't underlined. Fuck it, it's by design.
			var printSpace= function() {
				helperPrint(['\u00a0', PD.colourMode, PD.background, false, false, false]);
			};
			var helperPrint = function(symbol) {
				that.buffer[helperPointer]=wrap(symbol);
				helperPointer++;
			};
			var decode = function(symbol) {
				switch(symbol[0]) {
					case ' ':
						printSpace();
						break;
					case '\r\n':
						newLine();
						break;
					case '\t':
						tab();
						break;
					default:
						helperPrint(symbol);
				}
			};
			return function() {
				this.hydrate();
				helperPointer=0;
				this.pointer=0;
				for (var i=0; i<this.encodedBuffer.length; i++) {
					decode(this.encodedBuffer[i]);
					if (i+1===this.encodedPointer) {
						this.pointer=helperPointer;
					}
				}
			};
		};
	TextRegion = function(name, width, height, x, y) {
		this.name=name;
		this.width=width;
		this.height=height;
		this.x=x;
		this.y=y;
		this.buffer=[];
		this.encodedBuffer=[];
		this.pointer=0;
		this.subRegion=[];
		this.update=updateFunction(this);
		// fuck style for now. But I could work out a way of encoding it like \#FFFFFF or whatever. There's probably a standard for it in UTF8 or ASCII.
		this.printText = function(text) {
			for (var i=0; i<text.length; i++) {
				// for fucks sake microsoft
				if (text[i]!=="\r") { this.encodedBuffer.push([text[i], PD.colourMode, PD.background, false, false, false]); }
				else {
					this.encodedBuffer.push(["\r\n", PD.colourMode, PD.background, false, false, false]);
					i++;
				}
			}		
		}
	}
	function encode(symbol) {
		return [symbol, PD.colourMode, PD.background, PD.underlined, PD.bold, PD.italics];
	}
	EditableTextRegion = function(name, width, height, x, y) {
		this.name=name;
		this.width=width;
		this.height=height;
		this.x=x;
		this.y=y;
		this.buffer=[];
		this.encodedBuffer=[];
		this.encodedPointer=0;
		this.pointer=0;
		this.subRegion=[];
		this.selectFunction=function () { PD.textEditor() };
		// I could write some matrix methods to help going up / down in y.
		this.update=updateFunction(this);
		PD.pushRegion( (function (that) {
			var cursor=new VanillaRegion(that.name + "Cursor", 1, 1);
			cursor.visible=false;
			cursor.buffer[0]='\u2588';
			cursor.update=function () {
				var vector = that.getVector(that.pointer);
				cursor.x=vector.x;
				cursor.y=vector.y;
			};
			return cursor;
		})(this), this);
		this.cursorRight=function () {
			PD.startTimer();
			this.encodedPointer++;
			this.changed();
		}
		this.cursorLeft=function () {
			PD.startTimer();
			if (this.encodedPointer>0) {
				this.encodedPointer--;
			}
			this.changed();
		}
		this.print=function (symbol) {
			PD.insertMode
			? this.encodedBuffer.splice(this.encodedPointer, 0, encode(symbol))
			: this.encodedBuffer[this.encodedPointer]=encode(symbol);
			this.cursorRight();
		}
		this.backspace=function () {
			this.cursorLeft();
			if (this.encodedBuffer.length) {
				this.encodedBuffer.splice(this.encodedPointer, 1);
			}
			this.changed();
		}
	};
})();

EditableTextRegion.prototype = new Region("EditableTextRegion");
TextRegion.prototype = new Region("TextRegion");

function VanillaRegion(name, width, height, x, y) {
	this.name=name;
	this.width=width||0;
	this.height=height||0;
	this.x=x||0;
	this.y=y||0;
	this.buffer=[];
	this.subRegion=[];
};

VanillaRegion.prototype=new Region("VanillaRegion");

// Every button has a shortcut. Needs an toggleAltMode method that toggles <u></u> around a chosen (or programmaticly chosen) letter.
// Does need to be encoded if you want to have funky greek letters.
// ie. all text should be encoded text duuuhhhh.
function ButtonRegion(name, x, y) {
	this.name=name+"Button";
	this.width=name.length;
	this.height=1;
	this.x=x||0;
	this.y=y||0;
	this.buffer=name;
	this.subRegion=[];
}

ButtonRegion.prototype=new Region("ButtonRegion");

function BoxRegion(name, width, height, x, y) {
	this.name=name;
	this.width=width;
	this.height=height;
	this.x=x||0;
	this.y=y||0;
	this.buffer=[];
	this.subRegion=[];
	// Beautiful.
	this.decorate = (function (that) {
		var pointer=0;
		function pointerAt(x, y) {
			pointer=that.getPointer(x, y);
		}
		function printAt(x, y, ch) {
			pointerAt(x, y);
			that.buffer[pointer]=ch;
		}
		function movePointer(x, y) {
			pointer+=that.getPointer(x, y);
		}
		function horizontalPrint(ch) {
			that.buffer[pointer]=ch;
			movePointer(1, 0); // autism
		}
		function verticalPrint(ch) {
			that.buffer[pointer]=ch;
			movePointer(0, 1);
		}
		function horizontalLine(x, y, ch, length) {
			var thisLength=length||that.width;
			pointerAt(x, y);
			for (var i=0; i<thisLength; i++) {
				horizontalPrint(ch);
			}
		}
		function verticalLine(x, y, ch, length) {
			var thisLength=length||that.height;
			pointerAt(x, y);
			for (var i=0; i<thisLength; i++) {
				verticalPrint(ch);
			}
		}
		return function() {
			horizontalLine(0, 0, '\u2500');
			verticalLine(0, 0, '\u2502');
			horizontalLine(0, that.height-1, '\u2500');
			verticalLine(that.width-1, 0, '\u2502');
			printAt(0, 0, '\u250C');
			printAt(that.width-1, 0, '\u2510');
			printAt(0, that.height-1, '\u2514');
			printAt(that.width-1, that.height-1, '\u2518');
		}
	})(this);
}

BoxRegion.prototype=new Region("BoxRegion");
		

///////////////////////////////
// this should just be json?

// crappy test
function crappyTest() {
	initLogin();
	initDesktop();
}
	
// I feel like a run(program) function is coming. it would create the program, select it.
function runAlpha() {
	var alpha = new WindowRegion("Alpha");
	alpha.initChar='\u2591';
	PD.pushRegion( (function() {
		var alphaText = new EditableTextRegion("AlphaText", 24, 12, 2, 1);
		return alphaText;
	})(), alpha);
	alpha.hydrate();
	PD.pushRegion(alpha, terminal.subRegion[terminal.activeBuffer])
	PD.select("AlphaText");
}

function initLogin() {
	var login = new ScreenRegion("Login");
	login.initChar='\u00a0';
	login.hydrate();
	PD.pushRegion( (function() {
		var welcomeBox = new BoxRegion("WelcomeBox", 20, 7, 19, 5);
		welcomeBox.hydrate();
		welcomeBox.decorate();
		welcomeBox.subRegion.push( (function() {
			var welcome = new TextRegion("Welcome", 15, 3, 2, 2);
			welcome.printText("\tWelcome\r\n  to PunchDeck\r\n---------------");
			welcome.update();
			return welcome;
		})());
		return welcomeBox;
	})(), login);
	login.selectFunction= function() { PD.controlBindings(); }
	PD.pushRegion(login, terminal);
	PD.select("Login");
}

function initDesktop() {
	var desktop = new ScreenRegion("Desktop");
	desktop.hydrate();
	PD.pushRegion(initDesktopMenu(), desktop);
	PD.pushRegion(desktop, terminal);
}

function initDesktopMenu() {
	var menuItems = [ { 
			name: "Meta", 
			selectFunction: function(){ 
				PD.customBinding(77, "alt", function(){PD.select("MetaButtonContextMenu")})
			},
			subRegions: [
				createMenu("MetaButtonContext", [
					{ name: "Alpha", selectFunction: function(){doNothing()} },
					{ name: "Beta", selectFunction: function(){doNothing()} },
					{ name: "Zeta", selectFunction: function(){doNothing()} },
					{ name: "Eta", selectFunction: function(){doNothing()} },
					{ name: "Theta", selectFunction: function(){doNothing()} }
				], 0, 1)
			]
		}, {
			name: "File",
			selectFunction: function(){doNothing()},
			subRegions: 0
		}, {
			name: "Edit",
			selectFunction: function(){doNothing()},
			subRegions: 0
		}, {
			name: "View",
			selectFunction: function(){doNothing()},
			subRegions: 0
		}, {
			name: "Tools",
			selectFunction: function(){doNothing()},
			subRegions: 0
		}
	];
	
	return createTopBar("Desktop", menuItems);
}
	
// The menu items should change depending on the selected program.
// have a subRegions parameter?
function createTopBar(name, menuItems) {
	var menu=new VanillaRegion(name+"TopBar", 1, 1);
	var totalWidth=0;
	for (var i=0; i<menuItems.length; i++) {
		PD.pushRegion( (function() { 
			var item= new ButtonRegion(menuItems[i].name);
			item.selectFunction=menuItems[i].selectFunction;
			if (i!==0) {
				totalWidth += menuItems[i-1].name.length+1;
				item.x = totalWidth;
			}
			if (menuItems[i].subRegions) {
				for (var j=0; j<menuItems[i].subRegions.length; j++) {
					PD.pushRegion(menuItems[i].subRegions[j], item);
				}
			}
			item.select();
			return item;
		})(), menu);
		menu.width=totalWidth+menuItems[i].name.length+1;
	}
	menu.hydrate();
	return menu;
}

// doesn't turn invisible
function createMenu(name, menuItems, x, y) { 
	var menu=new VanillaRegion(name+"Menu", 0, 0, x, y);
	var width=0;
	for (var i=0; i<menuItems.length; i++) {
		PD.pushRegion( (function() {
			var item= new ButtonRegion(menuItems[i].name, 0, i);
			item.selectFunction=menuItems[i].selectFunction;
			if (item.width>width) {
				width=item.width;
			}
			item.select();
			return item;
		})(), menu);
	}
	menu.width=width;
	menu.height=menuItems.length;
	menu.selectFunction= function() {doNothing()};
	menu.select();
	menu.hydrate();
	return menu;
};

terminal.tabsize=4;
