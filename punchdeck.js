function doNothing() {};

// could use eval for the command line program? Kinda takes the fun out of it because I was going to implement my own token parsing and make my own language. eval would be fun though.

// I have to draw a circle with Math stuff :^)

// I don't really understand what selected is. It's mainly just so that escape works. But it's really difficult to know what should be selectable and when I don't have many scenarios yet.

// PD is namespace
var PD = {
	selected: {}
};

PD.pushRegion = function(region, pushTo) {
	region.parent=pushTo;
	pushTo.subRegion.push(region);
	region.setBindings();
	pushTo.changed(); // might not need this
	// if (region.selectable) {
	//    region.select();
	// }
};

PD.altMode = false;

PD.toggleAltMode = function() {
	PD.altMode
	? (function(){
		PD.altMode = false;
		terminal.reDraw();
	})()
	: (function(){
		PD.altMode = true;
		terminal.reDraw();
	})();
};

(function() {
	function innerFind(item, name) {
		for (var i=0; i<item.length; i++) {
			if (item[i].name===name) {
				return item[i];
			}
			var result = innerFind(item[i].subRegion, name);
			if (result) {
				return result;
			}
		}
		return 0;
	};
	function find(name) {
		var result= innerFind(terminal.subRegion, name);
		return result || console.log("item " + name + " found");
	};
	function bringToFront(item) {
		var subRegion = item.parent.subRegion;
		for (var i=0; i<subRegion.length; i++) {
			if (subRegion[i].name===item.name) {
				if (i!==subRegion.length-1) {
					subRegion.splice(i, 1);
					PD.pushRegion(item, item.parent);
					break;
				}
			}
		}
		if (item.parent.name==="Terminal") { return; }
		bringToFront(item.parent);
	};
	function select(item) {
		bringToFront(item);
		PD.selected=item;
	};
	PD.findAndSelect= function(name) {
		var result = find(name);
		result.select();
	};
	PD.kill= function(name) {
		var result = find(name);
		var subRegion = result.parent.subRegion;
		for (var i=0; i<subRegion.length; i++) {
			if (subRegion[i].name===name) {
				subRegion.splice(i, 1);
				result.parent.changed();
				return;
			}
		}
	};
	(function() {
		var selectionHistory = [];
		PD.setSelected = function(item) {
			select(item);
			selectionHistory.push(item);
		};
		PD.escape = function() {
			if (selectionHistory.length>1) {
				selectionHistory.pop();
				// what if kill?
				select(selectionHistory[selectionHistory.length-1]);
			}
		};
	})();
})();

// This stuff wot I just closured ere is like, for EncodedTextRegion / EditableTextRegion stuff
(function() {
	PD.tabSize= 4;
	// PD.newLineMode
	
	// This could be string.prototype.wrap?
	PD.fontWrap = function(text, colour, background) {
		var font = 	'<span style="color:'+colour+
					'; background-color:'+background+'">';
		font += text;
		return font += "</span>";
	};
	PD.letterWrap= function(text, letter) {
		return "<" + letter + ">" + text + "</" + letter + ">";
	};
	PD.colourMode = '#1D5FA1';
	PD.background = "white";
	PD.underlined = false;
	PD.bold = false;
	PD.italics = false;

	PD.toggleUnderlined = function() {
		PD.underlined
		? PD.underlined=false
		: PD.underlined=true;
	};

	PD.toggleBold = function() {
		PD.bold
		? PD.bold=false
		: PD.bold=true;
	};

	PD.toggleItalics = function() {
		PD.italics
		? PD.italics=false
		: PD.italics=true;
	};

	PD.toggleCapsLock = (function() {
		var capsLock=false;
		return function() {
			capsLock
			? (function() {
				capsLock = false;
				PD.textEditorAtoZ(PD.selected);
			})()
			: (function() {
				capsLock = true;
				PD.capsLockBindings(PD.selected);
			})();
		}
	})();
})();

// This stuff should be in EditableTextRegion too.
(function() {
	var getCursor= function() {
		if (PD.selected instanceof EditableTextRegion) {
			return PD.selected.subRegion[0];
		}
		else {
			return 0;
		}
	};
	PD.insertMode=true;
	var toggleInsertMode = function () {
		var cursor=getCursor();
		PD.insertMode
		? (function () {
			cursor.buffer[0]='_';
			PD.insertMode=false; })() // PD.startTimer()?
		: (function () {
			cursor.buffer[0]='\u2588';
			PD.insertMode=true; })();
	};
	
	PD.startTimer = (function() {
		var timer;
		function toggleCursor() {
			var cursor=getCursor();
			if (cursor) {
				cursor.visible
				? cursor.visible=false
				: cursor.visible=true;
				PD.selected.changed();
			}
		};
		return function() {
			clearInterval(timer);
			var cursor=getCursor();
			if (cursor) {
				cursor.visible=true;
			}
			timer=setInterval(toggleCursor, 350);
		};
	})();
})();

// This stuff should all be in the PD namespace but I cba
// Planning to have multiple terminals one day.
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
			drawRegion(0, toDraw, false);
		};
		// Don't like plopping this here.
		terminal.reDraw = function() {
			drawRegion(0, terminal.subRegion[terminal.activeBuffer], true);
		};
		function render(offset, toDraw) {
			var i=offset;
			for (var y=0; y<toDraw.height; y++) {
				for (var x=0; x<toDraw.width; x++) {
					var element = toDraw.buffer[toDraw.getPointer(x, y)];
					// "duck test"
					if (toDraw.hasOwnProperty("encodedBuffer")||toDraw.hasOwnProperty("altBuffer")) {
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
	this.background='white';
	this.bindings = function(){doNothing()};
	this.setBindings = function(){
		this.bindings(this);
	};
	this.select = function() {
		PD.setSelected(this);
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
	var wrap= function(symbol) {
		var ch=symbol[0];
		var colour=symbol[1];
		var background=symbol[2];
		var underlined=symbol[3];
		var bold=symbol[4];
		var italics=symbol[5];
		
		if (underlined) {ch=PD.letterWrap(ch, "u")};
		if (bold) {ch=PD.letterWrap(ch, "b")};
		if (italics) {ch=PD.letterWrap(ch, "i")};
		return PD.fontWrap(ch, colour, background);
	};
	var updateFunction = function(that) {
			var helperPointer=0;
			var tab = function() {
				var x = that.getVector(helperPointer).x;
				for (var i=x%PD.tabSize; i<PD.tabSize; i++) {
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
				helperPrint(['\u00a0', "black", "white", false, false, false]);
			};
			var helperPrint = function(symbol) {
				that.buffer[helperPointer]=wrap(symbol);
				helperPointer++;
			};
			// This could be a map right?
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
		// fuck style for now. But I could work out a way of encoding it like \#FFFFFF or whatever.
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
		this.bindings=function (that) {
			// Backspace
			PD.setBinding(8, "normal", function(){that.backspace()});
			PD.setBinding(8, "shift", function(){that.backspace()});
			
			// Tab
			PD.setBinding(9, "normal", function(){that.print('\t')});
			
			// Enter
			PD.setBinding(13, "normal", function(){that.print('\r\n')});
			PD.setBinding(13, "shift", function(){that.print('\r\n')});

			// Caps Lock
			PD.setBinding(20, "normal", function(){PD.toggleCapsLock()});
			
			// Space
			PD.setBinding(32, "normal", function(){that.print(' ')});
			PD.setBinding(32, "shift", function(){that.print(' ')});
			
			// Page Up
			PD.setBinding(33, "normal", function(){that.pageUp()}); // not implemented until we do scroll
			
			// Page Down
			PD.setBinding(34, "normal", function(){that.pageDown()});
			
			// End
			PD.setBinding(35, "normal", function(){that.end()});
			
			// Home
			PD.setBinding(36, "normal", function(){that.home()});
			
			// Left Arrow
			PD.setBinding(37, "normal", function(){that.cursorLeft()});
			
			// Up Arrow
			PD.setBinding(38, "normal", function(){that.cursorUp()});
			
			// Right Arrow
			PD.setBinding(39, "normal", function(){that.cursorRight()});
			
			// Down Arrow
			PD.setBinding(40, "normal", function(){that.cursorDown()});
			
			// Insert
			PD.setBinding(45, "normal", function(){toggleInsertMode()});

			// Delete
			PD.setBinding(46, "normal", function(){that.deleteKey()});

			// Numpad 0
			PD.setBinding(96, "normal", function(){PD.colourMode="black"});

			// Numpad 1
			PD.setBinding(97, "normal", function(){PD.colourMode="red"});
			
			// Numpad 2
			PD.setBinding(98, "normal", function(){PD.colourMode="green"});
			
			// Numpad 3
			PD.setBinding(99, "normal", function(){PD.toggleUnderlined()});
			
			// Numpad 4
			PD.setBinding(100, "normal", function(){PD.toggleBold()});
			
			// Numpad 5
			PD.setBinding(101, "normal", function(){PD.toggleItalics()});
			
			// Semi-colon
			PD.setBinding(186, "normal", function(){that.print(';')});
			PD.setBinding(186, "shift", function(){that.print(':')});
			
			// Equals
			PD.setBinding(187, "normal", function(){that.print('=')});
			PD.setBinding(187, "shift", function(){that.print('+')});
			
			// Comma
			PD.setBinding(188, "normal", function(){that.print(',')});
			PD.setBinding(188, "shift", function(){that.print('<')});
			
			// Hyphen
			PD.setBinding(189, "normal", function(){that.print('-')});
			PD.setBinding(189, "shift", function(){that.print('_')});
			
			// Full Stop
			PD.setBinding(190, "normal", function(){that.print('.')});
			PD.setBinding(190, "shift", function(){that.print('>')});
			
			// Forward Slash
			PD.setBinding(191, "normal", function(){that.print('/')});
			PD.setBinding(191, "shift", function(){that.print('?')});
			
			// Apostrophe
			PD.setBinding(192, "normal", function(){that.print('\'')});
			PD.setBinding(192, "shift", function(){that.print('@')});
			
			// Open Bracket
			PD.setBinding(219, "normal", function(){that.print('[')});
			PD.setBinding(219, "shift", function(){that.print('{')});
			
			// Back Slash
			PD.setBinding(220, "normal", function(){that.print('\\')});
			PD.setBinding(220, "shift", function(){that.print('|')});
			
			// Close Bracket
			PD.setBinding(221, "normal", function(){that.print(']')});
			PD.setBinding(221, "shift", function(){that.print('}')});
			
			// Hash
			PD.setBinding(222, "normal", function(){that.print('#')});
			PD.setBinding(222, "shift", function(){that.print('~')});

			// 0 to 9
			PD.setBinding(48, "normal", function(){that.print('0')});
			PD.setBinding(48, "shift", function(){that.print(')')});
			
			PD.setBinding(49, "normal", function(){that.print('1')});
			PD.setBinding(49, "shift", function(){that.print('!')});
			
			PD.setBinding(50, "normal", function(){that.print('2')});
			PD.setBinding(50, "shift", function(){that.print('"')});
			
			PD.setBinding(51, "normal", function(){that.print('3')});
			PD.setBinding(51, "shift", function(){that.print('\u00A3')});
			
			PD.setBinding(52, "normal", function(){that.print('4')});
			PD.setBinding(52, "shift", function(){that.print('$')});
			
			PD.setBinding(53, "normal", function(){that.print('5')});
			PD.setBinding(53, "shift", function(){that.print('%')});
			
			PD.setBinding(54, "normal", function(){that.print('6')});
			PD.setBinding(54, "shift", function(){that.print('^')});
			
			PD.setBinding(55, "normal", function(){that.print('7')});
			PD.setBinding(55, "shift", function(){that.print('&')});
			
			PD.setBinding(56, "normal", function(){that.print('8')});
			PD.setBinding(56, "shift", function(){that.print('*')});
			
			PD.setBinding(57, "normal", function(){that.print('9')});
			PD.setBinding(57, "shift", function(){that.print('(')});
	
			PD.textEditorAtoZ(that);
			
			PD.setBinding(83, "ctrl", function(){that.save()});
		};
		// I could write some matrix methods to help going up / down in y. (have now, in BoxRegion. Move them)
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
			if (this.encodedBuffer.length&&this.encodedPointer!=0) {
				this.encodedBuffer.splice(this.encodedPointer, 1);
				this.changed();
			}
		}
		this.deleteKey=function() {
			if (this.encodedBuffer.length&&this.encodedPointer!==this.encodedBuffer.length) {
				this.encodedBuffer.splice(this.encodedPointer, 1);
				this.changed();
			}
		};
		// I have no idea if this is like ASCII or UTF-8 complient or something. I really need to read about it.
		this.save= function() {
			var data="";
			for (var i=0; i<this.encodedBuffer.length; i++) {
				data+=this.encodedBuffer[i][0];
			}
			window.open('data:text/csv;charset=utf-8,' + encodeURIComponent(data));
		};
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
function ButtonRegion(name, x, y, index) {
	this.name=name+"Button";
	this.width=name.length;
	this.height=1;
	this.x=x||0;
	this.y=y||0;
	this.buffer= name;
	this.bufferCache=name;
	this.altBuffer = "fuck you";
	this.subRegion=[];
	this.update = function() {
		if (PD.altMode) {
			this.buffer=this.altBuffer;
		} else {
			this.buffer=this.bufferCache;
		}
	};
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

// Scripts //

// crappy test
function crappyTest() {
	initLogin();
	initDesktop();
	testBindings();
}
	
// I feel like a run(program) function is coming. it would create the program, select it.
function runAlpha() {
	var alpha = new WindowRegion("Alpha");
	alpha.initChar='\u2591';
	PD.pushRegion( (function() {
		return new EditableTextRegion("AlphaText", 24, 12, 2, 1);
	})(), alpha);
	alpha.hydrate();
	PD.pushRegion(alpha, terminal.subRegion[terminal.activeBuffer])
	// Normally, run() would do this.
	PD.findAndSelect("AlphaText");
}

// This is really bad because you should only really put WindowRegions in ScreenRegions. I think. I could enforce this.
function initLogin() {
	var login = new ScreenRegion("Login");
	login.initChar='\u00a0';
	login.hydrate();
	PD.pushRegion( (function() {
		var welcomeBox = new BoxRegion("WelcomeBox", 20, 7, 16, 7);
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
	PD.pushRegion(login, terminal);
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
			bindings: function(){
				// M
				PD.setBinding(77, "alt", function(){PD.findAndSelect("MetaButtonContextMenu")})
			},
			subRegions: [
				createMenu("MetaButtonContext", [
					{ name: "Alpha", bindings: function(){
						// A
						PD.setBinding(65, "normal", function(){runAlpha()})
					} },
					{ name: "Beta", bindings: function(){doNothing()} },
					{ name: "Zeta", bindings: function(){doNothing()} },
					{ name: "Eta", bindings: function(){doNothing()} },
					{ name: "Theta", bindings: function(){doNothing()} }
				], 0, 1)
			]
		}, {
			name: "File",
			bindings: function(){doNothing()},
			subRegions: 0
		}, {
			name: "Edit",
			bindings: function(){doNothing()},
			subRegions: 0
		}, {
			name: "View",
			bindings: function(){doNothing()},
			subRegions: 0
		}, {
			name: "Tools",
			bindings: function(){doNothing()},
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
			item.bindings=menuItems[i].bindings;
			if (i!==0) {
				totalWidth += menuItems[i-1].name.length+1;
				item.x = totalWidth;
			}
			if (menuItems[i].subRegions) {
				for (var j=0; j<menuItems[i].subRegions.length; j++) {
					PD.pushRegion(menuItems[i].subRegions[j], item);
				}
			}
			return item;
		})(), menu);
		menu.width=totalWidth+menuItems[i].name.length+1;
	}
	menu.hydrate();
	return menu;
}

// for contextual menus update should be, if this!==PD.selected then turn invisible
function createMenu(name, menuItems, x, y) { 
	var menu=new VanillaRegion(name+"Menu", 0, 0, x, y);
	var width=0;
	for (var i=0; i<menuItems.length; i++) {
		PD.pushRegion( (function() {
			var item= new ButtonRegion(menuItems[i].name, 0, i);
			item.bindings=menuItems[i].bindings;
			if (item.width>width) {
				width=item.width;
			}
			return item;
		})(), menu);
	}
	menu.width=width;
	menu.height=menuItems.length;
	menu.bindings= function() {doNothing()};
	menu.hydrate();
	return menu;
};

function testBindings() {
	// F1
	// should be terminal.setActiveBuffer
	PD.setBinding(112, "normal", function(){terminal.activeBuffer=0; terminal.subRegion[0].changed();}); 
	
	// F2
	PD.setBinding(113, "normal", function(){terminal.activeBuffer=1; terminal.subRegion[1].changed();});
	
	// F4
	// can't have more than one instance
	PD.setBinding(115, "normal", function(){PD.kill("Alpha")});
	
	// F5
	PD.setBinding(116, "preventDefault", false);
	
	// F11
	PD.setBinding(122, "preventDefault", false);
	
	// F12
	PD.setBinding(123, "preventDefault", false);
	
	// Escape
	PD.setBinding(27, "normal", function(){PD.escape()});
	
	// Alt
	// alt is alt.
	PD.setBinding(18, "alt", function(){PD.toggleAltMode()});
}