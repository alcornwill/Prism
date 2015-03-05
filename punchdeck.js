function doNothing() {};

var terminal= {
	width: 52,
	height: 27,  // could be determined programmatically
	
	subRegion: [],
	activeBuffer: 0,
	
	hasChanged: true,
	changed: function() {
		this.hasChanged=true;
	}
};

(function() {
	var lines=[];
	var container={};
	
	terminal.realign= (function() {
		var pxWidth=500;
		var pxHeight=500;
		return function () {
			var w=window.innerWidth;
			var h=window.innerHeight;
			container.style.width=pxWidth;
			container.style.height=pxHeight;
			container.style.top=((h/2)-(pxWidth/2))+"px";
			container.style.left=((w/2)-(pxHeight/2))+"px";
		};
	})(),
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
			bindings.initKeys();
			crappyTest();
			bindings.startTimer();
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
		// implement paul blart here
		function drawRegion(offset, toDraw, parentChanged) {
			offset+=(toDraw.y*terminal.width)+toDraw.x;
			
			var thisChanged=false;
			if (toDraw.hasChanged===true||parentChanged===true) {
				thisChanged=true;
				var i=offset;
				for (var y=0; y<toDraw.height; y++) {
					for (var x=0; x<toDraw.width; x++) {
						var element = toDraw.buffer[(y*toDraw.width)+x];
						if (bindings.isType(toDraw, "EditableTextRegion")) {
							textBuffer.buffer[i]=element;
						} else {
							textBuffer.buffer[i]=bindings.fontWrap(element, toDraw.colour, toDraw.background);
						}
						i++;
					}
					i+=textBuffer.width-toDraw.width;
				}

				toDraw.hasChanged=false;
			}
			
			for (i=0; i<toDraw.subRegion.length; i++) {
				if (toDraw.subRegion[i].visible) {
					drawRegion(offset, toDraw.subRegion[i], thisChanged);
				}
			}
		};
		
		return function () {
			if (!terminal.hasChanged) { return; }
			bindings.updateObserved();
			draw(terminal.subRegion[terminal.activeBuffer]);
			for (var y=0; y<terminal.height; y++) {
				lines[y].innerHTML=getLine(y);
			}
		};
	})();
})();

// this might need closuring / namespacing. This whole thing might need closuring / namespacing. I'm not sure how it will change though so I'm leavin it for now.
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
		bindings.selected = this;
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
		return bindings.fontWrap(ch, colour, background);
	};
	var updateFunction = function(that) {
			var helperPointer=0;
			var tab = function() {
				var x = helperPointer%that.width;
				for (var i=x%terminal.tabsize; i<terminal.tabsize; i++) {
					printSpace();
				}
			};
			var newLine = function() {
				for (var i=helperPointer%that.width; i<that.width; i++) {
					printSpace();
				}
			};
			// it looks weird that spaces arn't underlined. Fuck it, it's by design.
			var printSpace= function() {
				helperPrint(['\u00a0', bindings.colourMode, bindings.background, false, false, false]);
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
		this.printText = function(text) {
			for (var i=0; i<text.length; i++) {
				// for fucks sake microsoft
				if (text[i]!=="\r") { this.encodedBuffer.push([text[i], bindings.colourMode, bindings.background, false, false, false]); }
				else {
					this.encodedBuffer.push(["\r\n", bindings.colourMode, bindings.background, false, false, false]);
					i++;
				}
			}
			// // fuck style for now. But I could work out a way of encoding it like \#FFFFFF or whatever
			// for (var i=0; i<text.length; i++) {
				// if (text[i]!=="\\") { this.encodedBuffer[i]=text[i]; } else {
					// if (text.length!==i+1&&text[i+1]!=="\\") {
						// // for fucks sake microsoft
						// if (text[i+1]==="r") {
							// this.encodedBuffer[i]="\r\n";
							// i+=3;
						// } else {
							// this.encodedBuffer[i]="\\"+text[i+1];
							// i++;
						// }
					// } else {
						// this.encodedBuffer[i]="\\";
					// }
				// }
			// }		
		}
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
		this.selectFunction=function () { bindings.textEditor() };
		// I could write some matrix methods to help going up / down in y.
		this.update=updateFunction(this);
		this.subRegion.push((function (that) {
			var cursor=new MiniRegion(that.name + "Cursor", 1, 1);
			cursor.visible=false;
			cursor.buffer[0]='\u2588';
			cursor.update=function () {
				cursor.x=that.pointer%that.width;
				cursor.y=Math.floor(that.pointer/that.width);
			};
			return cursor;
		})(this));
		this.cursorRight=function () {
			bindings.startTimer();
			this.encodedPointer++;
			this.hasChanged=true; 
			this.subRegion[0].changed();
		}
		this.cursorLeft=function () {
			bindings.startTimer();
			if (this.encodedPointer>0) {
				this.encodedPointer--;
			}
			this.hasChanged=true;
			this.subRegion[0].changed();
		}
		this.print=function (symbol) {
			bindings.insertMode
			? this.encodedBuffer.splice(this.encodedPointer, 0, [symbol, bindings.colourMode, bindings.background, bindings.underlined, bindings.bold, bindings.italics])
			: this.encodedBuffer[this.encodedPointer]=[symbol, bindings.colourMode, bindings.background, bindings.underlined, bindings.bold, bindings.italics];
			this.cursorRight();
		}
		this.backspace=function () {
			this.cursorLeft();
			if (this.encodedBuffer.length) {
				this.encodedBuffer.splice(this.encodedPointer, 1);
			}
		}
	};
})();

EditableTextRegion.prototype = new Region("EditableTextRegion");
TextRegion.prototype = new Region("TextRegion");

function MiniRegion(name, width, height, x, y) {
	this.name=name;
	this.width=width||0;
	this.height=height||0;
	this.x=x||0;
	this.y=y||0;
	this.buffer=[];
	this.subRegion=[];
};

MiniRegion.prototype=new Region("MiniRegion");

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

///////////////////////////////
// this should just be json?

// crappy test
function crappyTest() {
	initLogin();
	initDesktop();
}
	
// I feel like a run(program) function is coming. it would create the program, select it, and add it to the observe list. the program creation script would return a list of regions to observe?
function runAlpha() {
	var alpha = new WindowRegion("Alpha");
	alpha.initChar='\u2591';
	alpha.subRegion.push((function() {
		var alphaText = new EditableTextRegion("AlphaText", 24, 12, 2, 1);
		return alphaText;
	})());
	alpha.hydrate();
	terminal.subRegion[terminal.activeBuffer].subRegion.push(alpha);
	bindings.select("AlphaText");
	bindings.observed.push(alpha.subRegion[0]);
	bindings.observed.push(alpha.subRegion[0].subRegion[0]);
}

function initLogin() {
	var login = new ScreenRegion("Login");
	login.initChar='\u00a0';
	login.hydrate();
	login.subRegion.push( (function() {
		var welcome = new TextRegion("Welcome", 15, 3, 21, 7);
		welcome.printText("\tWelcome\r\n  to PunchDeck\r\n---------------");
		welcome.update();
		return welcome;
	})());
	login.selectFunction= function() {
		bindings.control();
	}
	terminal.subRegion.push(login);
	bindings.select("Login");
}

function initDesktop() {
	var desktop = new ScreenRegion("Desktop");
	desktop.hydrate();
	desktop.subRegion.push(initDesktopMenu());
	terminal.subRegion.push(desktop);
}

function initDesktopMenu() {
	// make sure when you select things they move above everything else (this should work now)
	var menuItems = [
		{ name: "Meta", selectFunction: function(){bindings.metaButtonBindings()} }, // create context menu and select it, which will set the context menu bindings.
		{ name: "File", selectFunction: function(){doNothing()} },
		{ name: "Edit", selectFunction: function(){doNothing()} },
		{ name: "View", selectFunction: function(){doNothing()} },
		{ name: "Tools", selectFunction: function(){doNothing()} }
	];
	
	return createHorizontalButtonList("Desktop", menuItems);
}

// I think there should just be one of these. ScreenBuffer owns it, and populates the Meta menu with a list of programs.
// each program can add their own items to the list.
function createHorizontalButtonList(name, menuItems) {
	var menu=new MiniRegion(name+"Menu", 1, 1);
	var total=0;
	for (var i=0; i<menuItems.length; i++) {
		menu.subRegion.push( (function() { 
			var item = new ButtonRegion(menuItems[i].name);
			item.selectFunction = menuItems[i].selectFunction;
			if (i!==0) {
				total += menuItems[i-1].name.length+1;
				item.x = total;
			}
			item.buffer=menuItems[i].name;
			item.select();
			return item;
			})()
		);
		menu.width=total+menuItems[i].name.length+1;
	}
	menu.hydrate();
	return menu;
}
	
function createContextMenu(name, menuItems) { };
	


terminal.tabsize=4;
