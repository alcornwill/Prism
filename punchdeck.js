function doNothing() {};

// could use eval for the command line program? Kinda takes the fun out of it because I was going to implement my own token parsing and make my own language. eval would be fun though.

// I have to draw a circle with Math stuff :^)

// need changing() wrapper that adds this.changed to functions

// I don't really understand what selected is. It's mainly just so that escape works. But it's really difficult to know what should be selectable and when I don't have many scenarios yet. It could just be a duck test thing.

String.prototype.toSpan= function(colour, background) {
	var span = '<span style="color:'+colour+
				'; background-color:'+background+'">';
	return span.concat(this.valueOf(), "</span>");
};

String.prototype.toTag= function(letter) {
	return "<" + letter + ">" + this.valueOf() + "</" + letter + ">";
};

// PD is namespace
var PD = {
	selected: {}
};

PD.pushRegion = function(region, pushTo) {
	region.parent=pushTo;
	pushTo.subRegion.push(region);
	region.setBindings();
	// I tried to use Object.observe once but it didn't work out.
	// if (region.selectable) {
	//    region.select();
	// }
};

PD.altMode = false;

PD.toggleAltMode = function() {
	PD.altMode = true;
	terminal.reDraw();
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
		// fk it i dnt evn care nymore
		item.changed();
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
	PD.setSelected = function(item) {
		select(item);
	};
	PD.escape = function() {
		var item = PD.selected;
		if (item.hasOwnProperty("previouslySelected")) {
			if (item.previouslySelected) {
				select(item.previouslySelected);
			}
		}
			// Here's how it should work. When we select a contextual menu, through it's binding, the contextual menu has a special selectFunction which saves PD.selected to this.previouslySelected or something. Then we just select previouslySelected here. This is assuming that we don't want to create and kill a contextual menu every time, which I think is fair. We might never want to kill anything at all.
			// terminal.reDraw(); // later I could work on a thing that only reDraws if an that exceeds it's parent region has changed, and only do parent.changed otherwise.
		
	};
})();

// This stuff should all be in the PD namespace but I cba
// Planning to have multiple terminals one day.
var terminal= {
	name: "Terminal",

	subRegion: [],
	activeBuffer: 0,
	
	hasChanged: true
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
			terminal.hasChanged=false;
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
						textBuffer.buffer[i]=element.toSpan(toDraw.colour, toDraw.background);
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
				if (!toDraw.visible) { return; }
				offset+=(toDraw.y*terminal.width)+toDraw.x;
				thisChanged=true;
				render(offset, toDraw);
			} else {
				offset+=(toDraw.y*terminal.width)+toDraw.x; // gay
			}
			
			for (var i=0; i<toDraw.subRegion.length; i++) {
				drawRegion(offset, toDraw.subRegion[i], thisChanged);
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

// I want to try composing regions out of modules. I like the constructors. I'm sure I'm not supposed to be using "that" everywhere but it seems like a really good solution.
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
	this.selectFunction = function() {doNothing()};
	this.select = function() {
		this.selectFunction();
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

// I wanted this to be higher up in terminal or something but closures.
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

// This stuff wot I just closured ere is like, for EncodedTextRegion / EditableTextRegion stuff
// I'm thinking I could return these things as a property of EncodingModule, so that I can compose regions out of it.
(function() {
	PD.tabSize= 4;
	// PD.newLineMode ( \r\n or \n )

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
		
		if (underlined) {ch=ch.toTag("u")};
		if (bold) {ch=ch.toTag("b")};
		if (italics) {ch=ch.toTag("i")};
		return ch.toSpan(colour, background);
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
			// just to be neat
			PD.otherTextEditorBindings(that);
			
			PD.textEditorAtoZ(that);
			
			PD.setBinding(83, "ctrl", function(){that.save()});
		};
		// might need to use the BoxRegion matrix methods to help going up / down in y.
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
			if (this.encodedBuffer.length&&this.encodedPointer>=0) {
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

// Every button has a shortcut. I think the index should be chosen programmatically, and it might be easy. altBuffer should only be seen when the bindings are active.
// Still doesn't support funky greek letters.
// ie. all text should be encoded text duuuhhhh.
function ButtonRegion(name, binding, x, y, index) {
	this.name=name+"Button";
	this.bindings=binding;
	this.width=name.length;
	this.height=1;
	this.x=x||0;
	this.y=y||0;
	this.buffer= (function(that) {
		var newBuffer=[];
		for (var i=0; i<name.length; i++) {
			newBuffer[i]=name[i].toSpan(that.colour, that.background);
		}
		return newBuffer;
	})(this);
	this.bufferCache=this.buffer;
	this.altBuffer = (function(that) {
		// clone
		var newBuffer=that.buffer.slice();
		for (var i=0; i<name.length; i++) {
			if (i==(index||0)) {
				newBuffer[i]=name[i].toSpan(that.colour, that.background).toTag('u');
				break;
			}
		}
		return newBuffer;
	})(this);
	this.subRegion=[];
	this.update = function() {
		PD.altMode
		? this.buffer=this.altBuffer
		: this.buffer=this.bufferCache;
		this.changed();
	};
}

ButtonRegion.prototype=new Region("ButtonRegion");

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
	desktop.select();
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
	
// The menu items are composed by the desktop and the selected program.
function createTopBar(name, menuItems) {
	var menu=new VanillaRegion(name+"TopBar", 1, 1);
	var totalWidth=0;
	for (var i=0; i<menuItems.length; i++) {
		PD.pushRegion( (function() { 
			var item= new ButtonRegion(menuItems[i].name, menuItems[i].bindings);
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

// This should really be called a contextual menu. It shares some behaviour with a pop-up message.
function createMenu(name, menuItems, x, y) { 
	var menu=new VanillaRegion(name+"Menu", 0, 0, x, y);
	var width=0;
	for (var i=0; i<menuItems.length; i++) {
		PD.pushRegion( (function() {
			var item= new ButtonRegion(menuItems[i].name, menuItems[i].bindings, 0, i);
			if (item.width>width) {
				width=item.width;
			}
			return item;
		})(), menu);
	}
	menu.width=width;
	menu.height=menuItems.length;
	menu.bindings= function() {doNothing()};
	menu.update = function() {
		PD.selected===menu
		? menu.visible=true
		: menu.visible=false;
	}
	menu.selectFunction = function() {
		if (PD.selected!==menu) {
			menu.previouslySelected = PD.selected;
		}
	};
	menu.previouslySelected=0;
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