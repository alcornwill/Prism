// could use eval for the command line program

// I have to draw a circle with Math stuff :^)

// need changing() wrapper that adds this.changed to functions

// I don't really understand what selected is. It's mainly just so that escape works. But it's really difficult to know what should be selectable when I don't have many scenarios yet.

function doNothing() {};

// I am in shock and denial about how well this works.
// You still can't have private static methods that access instance properties but it doesn't matter because you can have private instance methods that access instance properties and static properties. Not sure how it effects performance but I don't think it's harmful. It's probably less harmful that using prototypes.
function Mixin(){
	// build depency list
	var mixingPot = [];
	// should recursively get dependencies
	for (var i=arguments.length-1; i>=0; i--) {
		mixingPot = arguments[i].dependencies.concat(mixingPot);
		mixingPot.unshift(arguments[i]);
	}
	// should remove duplicates.
	// should save factory names in a list so that I don't have to do the duck test.
    var instance = {};
	for (var i=mixingPot.length-1; i>=0; i--) {
		// get product from factory, supplying a reference to the instance.
		var product = mixingPot[i](instance);
		for(var key in product)
			instance[key] = product[key];
	}
    return instance;
}

String.prototype.toSpan= function(colour, background) {
	var span = '<span style="color:'+colour+
				'; background-color:'+background+'">';
	return span.concat(this.valueOf(), "</span>");
};

String.prototype.toTag= function(letter) {
	return "<" + letter + ">" + this.valueOf() + "</" + letter + ">";
};

// namespace
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
	
	hasChanged: true,
	
	bindings: [],
	setBindings: function() {
		for (var i=0; i<terminal.bindings.length; i++) {
			PD.setBinding(terminal.bindings[i]);
		}
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
			if (toDraw.hasChanged==true||parentChanged==true) {
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

function RegionFactory(instance) {
	var that = instance;
	return Region = {
		name : "",
		width : 0,
		height : 0,
		x : 0,
		y : 0,
		initChar:'\u00a0', // if '' then transparent
		visible:true,
		colour:'#1D5FA1',
		background:'white',
		buffer:[],
		subRegion:[],
		bindings : [],
		setBindings: function() {
			for (var i=0; i<that.bindings.length; i++) {
				PD.setBinding(that.bindings[i]);
			}
		},
		selectFunction : function() {doNothing()},
		select : function() {
			that.selectFunction();
			PD.setSelected(that);
		},
		hydrate : function() {
			var length = that.width*that.height;
			for (var i=0; i<length; i++) {
				that.buffer[i] = that.initChar;
			}
		},
		hasChanged : true,
		changed : function() {
			terminal.hasChanged=true;
			that.hasChanged=true;
		},
		update:function() {doNothing()},
		getVector : function(i) {
			return {x: i%that.width, y: Math.floor(i/that.width)};
		},
		getPointer : function (x, y) {
			return (y*that.width)+x;
		},
		set: function() {
			for (var key in arguments[0]) {
				that[key] = arguments[0][key];
			}
		}
	};
};

RegionFactory.dependencies = [];

function ScreenRegionFactory(instance) {
	var that = instance;
	return ScreenRegion = {
		width: terminal.width,
		height: terminal.height,
		initChar:'\u2593'
	};
};

ScreenRegionFactory.dependencies = [RegionFactory];

// I wanted this to be higher up in terminal or something but closures.
var textBuffer = Mixin(ScreenRegionFactory);
textBuffer.set({ name: "TextBuffer", initChar: '\u2588' });
textBuffer.hydrate();

// assumes that all windows are created fullscreen.
function WindowRegionFactory(instance) {
	var that = instance;
	return WindowRegion = {
		width: terminal.width,
		height: terminal.height-1,
		y: 1
	};
};

WindowRegionFactory.dependencies = [RegionFactory];

// VanillaRegion is not a thing.

function BoxRegionFactory(instance) {
	var that = instance;
	return BoxRegion = {
		decorate : (function () {
			var pointer=0;
			function pointerAt(x, y) {
				pointer=that.getPointer(x, y);
			};
			function printAt(x, y, ch) {
				pointerAt(x, y);
				that.buffer[pointer]=ch;
			};
			function movePointer(x, y) {
				pointer+=that.getPointer(x, y);
			};
			function horizontalPrint(ch) {
				that.buffer[pointer]=ch;
				movePointer(1, 0); // autism
			};
			function verticalPrint(ch) {
				that.buffer[pointer]=ch;
				movePointer(0, 1);
			};
			function horizontalLine(x, y, ch, length) {
				var thisLength=length||that.width;
				pointerAt(x, y);
				for (var i=0; i<thisLength; i++) {
					horizontalPrint(ch);
				}
			};
			function verticalLine(x, y, ch, length) {
				var thisLength=length||that.height;
				pointerAt(x, y);
				for (var i=0; i<thisLength; i++) {
					verticalPrint(ch);
				}
			};
			return function() {
				horizontalLine(0, 0, '\u2500');
				verticalLine(0, 0, '\u2502');
				horizontalLine(0, that.height-1, '\u2500');
				verticalLine(that.width-1, 0, '\u2502');
				printAt(0, 0, '\u250C');
				printAt(that.width-1, 0, '\u2510');
				printAt(0, that.height-1, '\u2514');
				printAt(that.width-1, that.height-1, '\u2518');
			};
		})()
	};
}

BoxRegionFactory.dependencies = [RegionFactory];

var EncodedTextRegionFactory = (function() {
	var tabSize= 4;
	// newLineMode ( \r\n or \n )
	
	return Factory = function(instance) {
		var that = instance;
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
		return EncodedTextRegion = {
			encodedBuffer: [],
			encodedPointer: 0,
			pointer: 0,
			
			update: (function() {
				var helperPointer=0;
				var tab = function() {
					var x = that.getVector(helperPointer).x;
					for (var i=x%tabSize; i<tabSize; i++) {
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
					that.hydrate();
					helperPointer=0;
					that.pointer=0;
					for (var i=0; i<that.encodedBuffer.length; i++) {
						decode(that.encodedBuffer[i]);
						if (i+1===that.encodedPointer) {
							that.pointer=helperPointer;
						}
					}
				};
			})()
		};
	};
})();

EncodedTextRegionFactory.dependencies = [RegionFactory];

var EditableTextRegionFactory = (function() {
	var insertMode=true;
	var capsLock=false;
	var colourMode= '#1D5FA1';
	var background= "white";
	var underlined= false;
	var bold= false;
	var italics= false;
	var toggleUnderlined = function() {
		underlined
		? underlined=false
		: underlined=true;
	};
	var toggleBold = function() {
		bold
		? bold=false
		: bold=true;
	};
	var toggleItalics = function() {
		italics
		? italics=false
		: italics=true;
	};
	var getCursor= function() {
		//haxx
		if (PD.selected.hasOwnProperty("save")) {
			return PD.selected.subRegion[0];
		}
		else {
			return 0;
		}
	};
	var toggleInsertMode = function () {
		var cursor=getCursor();
		insertMode
		? (function () {
			cursor.buffer[0]='_';
			PD.insertMode=false; })() // PD.startTimer()?
		: (function () {
			cursor.buffer[0]='\u2588';
			PD.insertMode=true; })();
	};
	var startTimer = (function() {
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
	function encode(symbol) {
		return [symbol, colourMode, background, underlined, bold, italics];
	};
	return Factory = function(instance) {
		var that = instance;
		var EditableTextRegion = {
			bindings: (function() {
				// Megashite
				var array = PD.otherTextEditorBindings(that).concat(PD.textEditorAtoZ(that));
				array.push([83, "ctrl", function(){that.save()}]);
				return array;
			})(),
			// might need to use the BoxRegion matrix methods to help going up / down in y.
			cursorRight: function () {
				startTimer();
				that.encodedPointer++;
				that.changed();
			},
			cursorLeft: function () {
				startTimer();
				if (that.encodedPointer>0) {
					that.encodedPointer--;
				}
				that.changed();
			},
			print: function (symbol) {
				insertMode
				? that.encodedBuffer.splice(that.encodedPointer, 0, encode(symbol))
				: that.encodedBuffer[that.encodedPointer]=encode(symbol);
				that.cursorRight();
			},
			backspace: function () {
				that.cursorLeft();
				if (that.encodedBuffer.length&&that.encodedPointer>=0) {
					that.encodedBuffer.splice(that.encodedPointer, 1);
					that.changed();
				}
			},
			deleteKey: function() {
				if (that.encodedBuffer.length&&that.encodedPointer!==that.encodedBuffer.length) {
					that.encodedBuffer.splice(that.encodedPointer, 1);
					that.changed();
				}
			},
			save: function() {
				var data="";
				for (var i=0; i<that.encodedBuffer.length; i++) {
					data+=that.encodedBuffer[i][0];
				}
				window.open('data:text/csv;charset=utf-8,' + encodeURIComponent(data));
			},
			toggleCapsLock: (function() {
				return function() {
					capsLock
					? (function() {
						capsLock = false;
						PD.setBindings(PD.textEditorAtoZ(PD.selected));
					})()
					: (function() {
						capsLock = true;
						PD.setBindings(PD.capsLockBindings(PD.selected));
					})();
				}
			})()
		};
		PD.pushRegion( (function () {
			var cursor = Mixin(RegionFactory);
			cursor.set({name: "Cursor", width: 1, height: 1, visible: false});
			cursor.buffer[0]='\u2588';
			cursor.update=function () {
				var vector = that.getVector(that.pointer);
				cursor.x=vector.x;
				cursor.y=vector.y;
			};
			return cursor;
		})(), that);
		startTimer();
		return EditableTextRegion;
	};
})();

EditableTextRegionFactory.dependencies = [EncodedTextRegionFactory, RegionFactory];

function TextRegionFactory(instance) {
	var that = instance;
	return TextRegion = {
		// fuck style for now. But I could work out a way of encoding it like \#FFFFFF or whatever.
		printText: function(text) {
			for (var i=0; i<text.length; i++) {
				// for fucks sake microsoft
				if (text[i]!=="\r") { that.encodedBuffer.push([text[i], that.colour, that.background, false, false, false]); }
				else {
					that.encodedBuffer.push(["\r\n", that.colour, that.background, false, false, false]);
					i++;
				}
			}		
		}
	};
};

TextRegionFactory.dependencies = [EncodedTextRegionFactory, RegionFactory];

// Every button has a shortcut. I think the index should be chosen programmatically, and it might be easy. altBuffer should only be seen when the bindings are active.
// Still doesn't support funky greek letters.
// ie. all text should be encoded text duuuhhhh.
function ButtonRegionFactory(instance) {
	var that = instance;
	return ButtonRegion = {
		index: 0,
		height: 1,
		update : function() {
			PD.altMode
			? that.buffer=that.altBuffer
			: that.buffer=that.bufferCache;
			that.changed();
		},
		hydrate: function() {
			that.width = that.name.length;
			var newBuffer=[];
			for (var i=0; i<that.name.length; i++) {
				newBuffer[i]=that.name[i].toSpan(that.colour, that.background);
			}
			that.buffer= newBuffer.slice();
			that.bufferCache = newBuffer.slice();
			
			for (var i=0; i<that.name.length; i++) {
				if (i==that.index) {
					newBuffer[i]=that.name[i].toSpan(that.colour, that.background).toTag('u');
					break;
				}
			}
			that.altBuffer = newBuffer.slice();
		}
	};
};

ButtonRegionFactory.dependencies = [RegionFactory];

// Scripts //

// crappy test
function crappyTest() {
	initLogin();
	initDesktop();
	testBindings();
};
	
// I feel like a run(program) function is coming. it would create the program, select it.
function runAlpha() {
	var alpha = Mixin(WindowRegionFactory);
	alpha.set({ name: "Alpha", initChar: '\u2591' });
	PD.pushRegion( (function() {
		var alphaText = Mixin(EditableTextRegionFactory);
		alphaText.set({ name: "AlphaText", width: 24, height: 12, x: 2, y: 1 });
		return alphaText;
	})(), alpha);
	alpha.hydrate();
	PD.pushRegion(alpha, terminal.subRegion[terminal.activeBuffer])
	// Normally, run() would do this.
	PD.findAndSelect("AlphaText");
};

// This is really bad because you should only really put WindowRegions in ScreenRegions. I think. I could enforce this.
function initLogin() {
	var login = Mixin(ScreenRegionFactory);
	login.set({ name: "Login", initChar: '\u00a0' });
	login.hydrate();
	PD.pushRegion( (function() {
		var welcomeBox = Mixin(BoxRegionFactory);
		welcomeBox.set({ name: "WelcomeBox", width: 20, height: 7, x: 16, y: 7 });
		welcomeBox.hydrate();
		welcomeBox.decorate();
		welcomeBox.subRegion.push( (function() {
			var welcome = Mixin(TextRegionFactory);
			welcome.set({ name: "Welcome", width: 15, height: 3, x: 2, y: 2 });
			welcome.printText("\tWelcome\r\n  to PunchDeck\r\n---------------");
			return welcome;
		})());
		return welcomeBox;
	})(), login);
	PD.pushRegion(login, terminal);
};

function initDesktop() {
	var desktop = Mixin(ScreenRegionFactory);
	desktop.name="Desktop";
	desktop.hydrate();
	PD.pushRegion(initDesktopMenu(), desktop);
	PD.pushRegion(desktop, terminal);
	desktop.select();
};

function initDesktopMenu() {
	var menuItems = [ { 
			name: "Meta", 
			bindings: [
				// M
				[77, "alt", function(){PD.findAndSelect("MetaButtonContextMenu")}]
			],
			subRegions: [
				createMenu("MetaButtonContext", [
					{ name: "Alpha", bindings: [
						// A
						[65, "normal", function(){runAlpha()}]
					]},
					{ name: "Beta", bindings: [] },
					{ name: "Zeta", bindings: [] },
					{ name: "Eta", bindings: [] },
					{ name: "Theta", bindings: [] }
				], 0, 1)
			]
		}, {
			name: "File",
			bindings: [],
			subRegions: 0
		}, {
			name: "Edit",
			bindings: [],
			subRegions: 0
		}, {
			name: "View",
			bindings: [],
			subRegions: 0
		}, {
			name: "Tools",
			bindings: [],
			subRegions: 0
		}
	];
	
	return createTopBar("Desktop", menuItems);
};
	
// The menu items are composed by the desktop and the selected program.
function createTopBar(name, menuItems) {
	var menu = Mixin(RegionFactory);
	menu.set({name: name+"TopBar", width: 1, height: 1});
	var totalWidth=0;
	for (var i=0; i<menuItems.length; i++) {
		PD.pushRegion( (function() { 
			var item= Mixin(ButtonRegionFactory);
			item.set({ name: menuItems[i].name, bindings: menuItems[i].bindings});
			item.hydrate();
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
};

// This should really be called a contextual menu. It shares some behaviour with a pop-up message.
function createMenu(name, menuItems, x, y) { 
	var menu= Mixin(RegionFactory);
	menu.set({name: name+"Menu", x: x, y: y});
	var width=0;
	for (var i=0; i<menuItems.length; i++) {
		PD.pushRegion( (function() {
			var item= Mixin(ButtonRegionFactory);
			item.set({ name: menuItems[i].name, bindings: menuItems[i].bindings, y: i});
			item.hydrate();
			if (item.width>width) {
				width=item.width;
			}
			return item;
		})(), menu);
	}
	menu.set({ 
		width: width,
		height: menuItems.length,
		update: function() {
			PD.selected===menu
			? menu.visible=true
			: menu.visible=false;
		},
		selectFunction: function() {
			if (PD.selected!==menu) {
				menu.previouslySelected = PD.selected;
			}
		},
		previouslySelected: 0
	});
	menu.hydrate();
	return menu;
};

function testBindings() {
	// F1
	// should be terminal.setActiveBuffer
	terminal.bindings = [
	[112, "normal", function(){terminal.activeBuffer=0; terminal.subRegion[0].changed();}],
	
	// F2
	[113, "normal", function(){terminal.activeBuffer=1; terminal.subRegion[1].changed();}],
	
	// F4
	// can't have more than one instance
	[115, "normal", function(){PD.kill("Alpha")}],
	
	// F5
	[116, "preventDefault", false],
	
	// F11
	[122, "preventDefault", false],
	
	// F12
	[123, "preventDefault", false],
	
	// Escape
	[27, "normal", function(){PD.escape()}],
	
	// Alt
	// alt is alt.
	[18, "alt", function(){PD.toggleAltMode()}]
	];
	terminal.setBindings();
};