// changing() wrapper that adds this.changed to functions?

// I don't really understand what selected is. It's mainly just so that escape works.

function doNothing() {};

var debug = {};

var mixin = (function(){
	function getDependencies(args) {
		var cauldron = args;
		for (var i=args.length-1; i>=0; i--) {
			var dependencies = innerGetDependencies(args[i]);
			for (var j=0; j<dependencies.length; j++)
				if (cauldron.indexOf(dependencies[j])==-1)
					cauldron.push(dependencies[j]);
		}
		return cauldron;
	};
	function innerGetDependencies(item) {
		var cauldron = [];
		cauldron.push(item);
		for (var i=item.dependencies.length-1; i>=0; i--)
			if (cauldron.indexOf(item.dependencies[i])==-1)
				cauldron = cauldron.concat(innerGetDependencies(item.dependencies[i]));
		return cauldron;
	};
	return function() {
		var cauldron = getDependencies(Array.prototype.slice.call(arguments));
		var instance = {};
		for (var i=cauldron.length-1; i>=0; i--) {
			var product = cauldron[i](instance);
			for(var key in product)
				instance[key] = product[key];
		}
		instance.composition = cauldron;
		return instance;
	};
})();

String.prototype.toSpan= function(colour, background) {
	var span = '<span style="color:'+colour+
				'; background-color:'+background+'">';
	return span.concat(this.valueOf(), "</span>");
};

String.prototype.toTag= function(letter) {
	return "<" + letter + ">" + this.valueOf() + "</" + letter + ">";
};

// namespace
var PD = (function() {
	function innerFind(item, name) {
		for (var i=0; i<item.length; i++) {
			if (item[i].name===name) return item[i];
			var result = innerFind(item[i].subRegion, name);
			if (result)	return result;
		}
		return 0;
	};
	function find(name) {
		var result= innerFind(Terminal.subRegion, name);
		return result || console.log("item " + name + " found");
	};
	function bringToFront(item) {
		var subRegion = item.parent.subRegion;
		for (var i=0; i<subRegion.length; i++)
			if (subRegion[i].name===item.name)
				if (i!==subRegion.length-1) {
					subRegion.splice(i, 1);
					PD.pushRegion(item, item.parent);
					break;
				}
		if (item.parent.name==="Terminal") return;
		bringToFront(item.parent);
	};
	function select(item) {
		// fk it i dnt evn care nymore.
		// I have no rules about when I use changed() and I probably use it too much. I should really just get Object.observe to work
		item.changed();
		item.setBindings();
		bringToFront(item);
		PD.selected=item;
	};
	return {
		selected: {},
		debugMode: false,
		pushRegion: function(region, pushTo) {
			region.parent=pushTo;
			pushTo.subRegion.push(region);
			// if (region.selectable) {
			//    region.select();
			// }
		},
		findAndSelect: function(name) {
			var result = find(name);
			result.select();
		},
		// can only kill programs I think
		kill: function(item) {
			var subRegion = item.parent.subRegion;
			for (var i=0; i<subRegion.length; i++)
				if (subRegion[i]==item) {
					subRegion.splice(i, 1);
					item.parent.changed();
					break;
				}
			// WRONG. needs selection chain...
			if (openPrograms.length-1)
				openPrograms[openPrograms.length-2].select();
			activeProgram--;
			for (var i=0; i<openPrograms.length; i++)
				if (openPrograms[i]==item)
					openPrograms.splice(i, 1);
		},
		setSelected: function(item) {
			select(item);
		},
		// Maybe you can only press escape from a pop-up / contextual menu
		escape: function() {
			var item = PD.selected;
			if (item.hasOwnProperty("previouslySelected"))
				// what if kill?
				if (item.previouslySelected) select(item.previouslySelected);
				// hasOwnProperty? Really?
		},
		toggleDebugMode: function() {
			if (PD.debugMode) {
				PD.debugMode = false;
				debug.style.visibility = "hidden";
			} else {
				PD.debugMode = true;
				debug.style.visibility = "visible";
			}
		}
	}
})();

// This stuff should all be in the PD namespace but I cba

var charRatio = {x: 9.5, y: 18.5}; // pulled these numbers out of my ass
var terminalOffset = {x: 0, y: 0};

var framerate = 32;  // fixed 30fps

// One day this will inherit from ScreenRegion, but there's some cirular dependency shit going on and I don't give a fuck right now. I guess some modules are like child modules of Terminal. On the whole, ScreenRegions and WindowRegions are pretty stupid now so I might kill them.
function TerminalModule(instance) {
	var that = instance;
	
	var lines=[];
	var container={};
	// wtf everything fucks up when you zoom in and out
	var pxWidth= 500;
	var pxHeight= 500;
	function updateOffset(x, y) {
		terminalOffset.x = Math.round(x/charRatio.x)+1;
		terminalOffset.y = Math.round(y/charRatio.y);
	}
	return Terminal= {
		name: "Terminal",
		subRegion: [],
		activeBuffer: 0,
		hasChanged: true,
		bindings: [],
	
		// should be pxWidth/charRatio instead of 500 and then round the actual div dimentions to be multiples of these constants.
		width: Math.round(pxWidth/charRatio.x),
		height: Math.round(pxHeight/charRatio.y),
		setBindings: function() {
			PD.setBindings(that.bindings, PD.terminalKeys);
		},
		altMode: false,
		toggleAltMode: function() {
			that.altMode = true;
			that.reDraw();
		},
		realign: function () {
			var w=window.innerWidth;
			var h=window.innerHeight;
			container.style.width=pxWidth;
			container.style.height=pxHeight;
			var offsetY = (h/2)-(pxHeight/2);
			var offsetX = (w/2)-(pxWidth/2);
			container.style.top= offsetY+"px";
			container.style.left= offsetX+"px";
			updateOffset(offsetX, offsetY);
		},
		init: (function() {
			function constructDivs() {
				for (var y=0; y<that.height; y++) {
					var node=document.createElement("DIV");
					node.id="line"+y;
					container.appendChild(node);
					lines[y]=node;
				}
			};
			return function () {
				container=document.getElementById("terminal");
				that.realign();
				constructDivs();
				PD.initKeys();
				crappyTest();
				debug = document.getElementById("debug");
				setInterval(that.update, framerate);
			};
		})(),
		update: (function() {
			function getLine(y) {
				var line="";
				var offset=y*that.width;
				for (var i=offset; i<offset+that.width; i++)
					line+=that.buffer.buffer[i];
				return line;
			};
			function partialReDraw(toDraw) {
				drawRegion(0, toDraw, false);
				that.hasChanged=false;
			};
			// Don't like plopping this here but don't like breaking it out either.
			that.reDraw = function() {
				drawRegion(0, that.subRegion[that.activeBuffer], true);
			};
			// The time has come to address what happends when things overflow
			function render(offset, toDraw) {
				var i=offset;
				for (var y=0; y<toDraw.height; y++) {
					for (var x=0; x<toDraw.width; x++) {
						var element = toDraw.buffer[toDraw.getPointer(x, y)];
						if (toDraw.composition.indexOf(EncodedTextRegionModule)!=-1)
							that.buffer.buffer[i]=element;
						else that.buffer.buffer[i]=element.toSpan(toDraw.colour, toDraw.background);
						i++;
					}
					i+=that.buffer.width-toDraw.width;
				}
				toDraw.hasChanged=false;
			}
			// implement paul blart here
			function drawRegion(offset, toDraw, parentChanged) {
				var thisChanged=false;
				if (toDraw.hasChanged==true||parentChanged==true) {
					toDraw.update();
					if (!toDraw.visible) return;
					offset+=(toDraw.y*that.width)+toDraw.x;
					thisChanged=true;
					render(offset, toDraw);
				} else offset+=(toDraw.y*that.width)+toDraw.x; // gay
				for (var i=0; i<toDraw.subRegion.length; i++)
					drawRegion(offset, toDraw.subRegion[i], thisChanged);
			};
			return function () {
				if (!that.hasChanged) return;
				partialReDraw(that.subRegion[that.activeBuffer]);
				for (var y=0; y<that.height; y++)
					lines[y].innerHTML=getLine(y);
			};
		})()
	};
};

TerminalModule.dependencies = [];

var Terminal = mixin(TerminalModule);

function RegionModule(instance) {
	var that = instance;
	return Region = {
		// name is not mandatory anymore.
		name : "",
		width : 0,
		height : 0,
		x : 0,
		y : 0,
		initChar:'\u00a0', // if '' then transparent
		visible:true,
		colour:'5C80BF',
		background:'white',
		buffer:[],
		subRegion:[],
		bindings : [],
		// publishBindings?
		setBindings: function() {
			PD.setBindings(that.bindings, PD.desktopKeys);
		},
		selectFunction : function() {doNothing()},
		select : function() {
			that.selectFunction();
			PD.setSelected(that);
		},
		hydrate : function() {
			var length = that.width*that.height;
			for (var i=0; i<length; i++)
				that.buffer[i] = that.initChar;
		},
		hasChanged : true,
		changed : function() {
			Terminal.hasChanged=true;
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
			for (var key in arguments[0])
				that[key] = arguments[0][key];
		},
		kill: function() {
			PD.kill(that);
		}
	};
};

RegionModule.dependencies = [];

function ScreenRegionModule() {
	return ScreenRegion = {
		width: Terminal.width,
		height: Terminal.height,
		initChar:'\u2593'
	};
};

ScreenRegionModule.dependencies = [RegionModule];

// I wanted this to be mixed-in to Terminal but circular dependencies.
Terminal.buffer = mixin(ScreenRegionModule);
Terminal.buffer.set({ name: "TerminalBuffer", initChar: '\u2588' });
Terminal.buffer.hydrate();

// assumes that all windows are created fullscreen.
function WindowRegionModule(instance) {
	var that = instance;
	return WindowRegion = {
		initChar: '\u2591',
		width: Terminal.width,
		height: Terminal.height-2,
		y: 1,
		bindings: [
			// need window management bindings here
			[115, "normal", function(){that.kill()}]
		]
	};
};

WindowRegionModule.dependencies = [RegionModule];

function BoxRegionModule(instance) {
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
				for (var i=0; i<thisLength; i++)
					horizontalPrint(ch);
			};
			function verticalLine(x, y, ch, length) {
				var thisLength=length||that.height;
				pointerAt(x, y);
				for (var i=0; i<thisLength; i++)
					verticalPrint(ch);
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

BoxRegionModule.dependencies = [RegionModule];

var EncodedTextRegionModule = (function() {
	var tabSize= 4;
	// newLineMode ( \r\n or \n )
	
	return Module = function(instance) {
		var that = instance;
		var wrap= function(symbol) {
			var ch=symbol[0];
			var colour=symbol[1];
			var background=symbol[2];
			var underlined=symbol[3];
			var bold=symbol[4];
			var italics=symbol[5];
			
			if (underlined) ch=ch.toTag("u");
			if (bold) ch=ch.toTag("b");
			if (italics) ch=ch.toTag("i");
			return ch.toSpan(colour, background);
		};
		return EncodedTextRegion = {
			encodedBuffer: [],
			encodedPointer: 0,
			pointer: 0,
			hydrate : function() {
				var length = that.width*that.height;
				for (var i=0; i<length; i++)
					that.buffer[i] = that.initChar.toSpan(that.colour, that.background);
			},
			update: (function() {
				var helperPointer=0;
				var tab = function() {
					var x = that.getVector(helperPointer).x;
					for (var i=x%tabSize; i<tabSize; i++)
						printSpace();
				};
				var newLine = function() {
					for (var i=that.getVector(helperPointer).x; i<that.width; i++)
						printSpace();
				};
				// it looks weird that spaces arn't underlined. Can't fix it until token parsing.
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
						if (i+1===that.encodedPointer)
							that.pointer=helperPointer;
					}
				};
			})()
		};
	};
})();

EncodedTextRegionModule.dependencies = [RegionModule];

var EditableTextRegionModule = (function() {
	var mouseIsDown = false;
	var timeout = false;
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
	// depreciated?
	var getCursor= function() {
		if (PD.selected.composition.indexOf(EditableTextRegionModule)!=-1)
			return PD.selected.subRegion[0];
		else return 0;
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
			if (cursor) cursor.visible=true;
			timer=setInterval(toggleCursor, 350);
		};
	})();
	function encode(symbol) {
		return [symbol, colourMode, background, underlined, bold, italics];
	};
	function innerGetOffset(item) {
		if (item.name=="Terminal") return {x: terminalOffset.x, y: terminalOffset.y};
		var vector = innerGetOffset(item.parent);
		vector.x += item.x;
		vector.y += item.y;
		return vector;
	};
	return Module = function(instance) {
		var that = instance;
		var highlightPointer = 0;
		var EditableTextRegion = {
			cursorAt: function (x, y) {
				// Kinda confusing that it's called getPointer. It's just the opposite of getVector. getIndex?
				// obviously retard
				that.encodedPointer=that.getPointer(x, y);
			},
			bindings: (function() {
				// Megashite
				var array = PD.otherTextEditorBindings(that).concat(PD.textEditorAtoZ(that));
				array.push([83, "ctrl", function(){that.save()}]);
				array.push([69, "ctrl", function(){that.execute()}]);
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
				if (that.encodedPointer>0)
					that.encodedPointer--;
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
				for (var i=0; i<that.encodedBuffer.length; i++)
					data+=that.encodedBuffer[i][0];
				window.open('data:text/csv;charset=utf-8,' + encodeURIComponent(data));
			},
			execute: function() {
				var data = "";
				for (var i=0; i<that.encodedBuffer.length; i++)
					data+=that.encodedBuffer[i][0];
				// nice if we had a printText... will need it for copy / paste
				debug.innerHTML = eval(data);
			},
			toggleCapsLock: (function() {
				return function() {
					if (capsLock) {
						capsLock = false;
						PD.setBindings(PD.textEditorAtoZ(PD.selected), PD.desktopKeys);
					} else {
						capsLock = true;
						PD.setBindings(PD.capsLockBindings(PD.selected), PD.desktopKeys);
					}
				}
			})(),
			toggleInsertMode: function () {
				var cursor=that.subRegion[0];
				if (insertMode) {
					cursor.buffer[0]='_';
					insertMode=false;
					startTimer();
					cursor.changed();
				} else {
					cursor.buffer[0]='\u2588';
					insertMode=true;
					startTimer();
					cursor.changed();
				}
			},
			mouseDown: function(e) {
				mouseIsDown = true;
				that.mouseClick(e);
			},
			mouseClick: function(e) {
				if (timeout) return;
				if (mouseIsDown) {
					var x = Math.round(e.clientX/charRatio.x);
					var y = Math.round(e.clientY/charRatio.y);
					debug.innerHTML = "Coordinates: (" + x + "," + y + ")";
					var vector = innerGetOffset(that);
					x-=vector.x;
					y-=vector.y;
					debug.innerHTML += "<br>Coordinates: (" + x + "," + y + ")";
					that.cursorAt(x, y);
					startTimer();
					that.changed();
					timeout = true;
					setInterval(function(){timeout=false}, framerate);
				}
			},
			mouseUp: function(e) {
				mouseIsDown = false;
			}
		};
		PD.pushRegion( (function () {
			var cursor = mixin(RegionModule);
			cursor.set({
				name: "Cursor",
				width: 1,
				height: 1,
				visible: false
			});
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

EditableTextRegionModule.dependencies = [EncodedTextRegionModule];

function TextRegionModule(instance) {
	var that = instance;
	return TextRegion = {
		// fuck style for now. But I could work out a way of encoding it like \#FFFFFF or whatever.
		printText: function(text) {
			text = text.toString();
			that.encodedBuffer = [];
			for (var i=0; i<text.length; i++) {
				// for fucks sake microsoft
				if (text[i]!=="\r") that.encodedBuffer.push([text[i], that.colour, that.background, false, false, false]);
				else {
					that.encodedBuffer.push(["\r\n", that.colour, that.background, false, false, false]);
					i++;
				}
			}		
		}
	};
};

TextRegionModule.dependencies = [EncodedTextRegionModule];

// Every button has a shortcut. I think the index should be chosen programmatically, and it might be easy. altBuffer should only be seen when the bindings are active.
// Still doesn't support funky greek letters.
// This should be an EncodedTextRegion but it can't be because it has a special update, so I could put the text inside the button and leave the button textless.
// What I want is to be able to go "here's the text and the index, hydrate with it". But I can't even encode stuff from text with encoded text regions yet anyway, so I guess it's fine for now. 
function ButtonRegionModule(instance) {
	var that = instance;
	return ButtonRegion = {
		index: 0,
		height: 1,
		update : function() {
			Terminal.altMode
			? that.buffer=that.altBuffer
			: that.buffer=that.bufferCache;
			that.changed();
		},
		hydrate: function() {
			that.width = that.name.length;
			var newBuffer=[];
			for (var i=0; i<that.name.length; i++)
				newBuffer[i]=that.name[i].toSpan(that.colour, that.background);
			that.buffer= newBuffer.slice();
			that.bufferCache = newBuffer.slice();
			
			for (var i=0; i<that.name.length; i++)
				if (i==that.index) {
					newBuffer[i]=that.name[i].toSpan(that.colour, that.background).toTag('u');
					break;
				}
			that.altBuffer = newBuffer.slice();
		}
	};
};

ButtonRegionModule.dependencies = [RegionModule];

function ScrollingRegionModule(instance) {
	var that = instance;
	function render(toDraw) {
		var i=0;
		for (var y=Math.abs(toDraw.y); y<toDraw.height; y++) {
			for (var x=Math.abs(toDraw.x); x<toDraw.width; x++) {
				if (x-Math.abs(toDraw.x)>=that.width||y-Math.abs(toDraw.y)>=that.height) continue;
				var element = toDraw.buffer[toDraw.getPointer(x, y)];
				// it should only render what is in the bounds of that.width and that.height.

				toDraw.composition.indexOf(EncodedTextRegionModule)!=-1
				? that.buffer[i]=element
				: that.buffer[i]=element.toSpan(toDraw.colour, toDraw.background);
				i++;
			}
		}
		toDraw.hasChanged=false;
	}
	function drawRegion(toDraw) {
		if (toDraw.hasChanged==true) {
			toDraw.update();
			// Doesn't care if invisible. Maybe I need another property.
			render(toDraw);
		}
	};
	var ScrollingRegion = {
		// You have to make the subRegion invisible. Only supports one subRegion. This totally doesn't handle non-overflowing subRegions.
		update: function() {
			var child = that.subRegion[2];
			var scrollBarX = that.subRegion[0].subRegion[0];
			var scrollBarY = that.subRegion[1].subRegion[0];

			var ratio = that.width/child.width;
			scrollBarX.width = Math.round(ratio*that.width-1);
			scrollBarX.hydrate();
			scrollBarX.x=Math.abs(Math.round(child.x*ratio));
			
			ratio = that.height/child.height;
			scrollBarY.height = Math.round(ratio*that.height-1);
			scrollBarY.hydrate();
			scrollBarY.y=Math.abs(Math.round(child.y*ratio));
			
			drawRegion(child);
		},
		scrollLeft: function() {
			var child = that.subRegion[2];
			if (child.x<0&&child.x>=that.width-child.width) {
				child.x++;
				child.hasChanged=true;
				that.changed();
			}
		},
		scrollRight: function() {
		var child = that.subRegion[2];
			if (child.x>that.width-child.width&&child.x<=0) {
				child.x--;
				child.hasChanged=true;
				that.changed();
			}
		},
		scrollUp: function() {
		var child = that.subRegion[2];
			if (child.y<0&&child.y>=that.height-child.height) {
				child.y++;
				child.hasChanged=true;
				that.changed();
			}
		},
		scrollDown: function() {
		var child = that.subRegion[2];
			if (child.y>that.height-child.height&&child.y<=0) {
				child.y--;
				child.hasChanged=true;
				that.changed();
			}
		}
	};
	ScrollingRegion.bindings = [
		[98, "normal", function(){that.scrollDown()}],
		[100, "normal", function(){that.scrollLeft()}],
		[102, "normal", function(){that.scrollRight()}],
		[104, "normal", function(){that.scrollUp()}]
	];
	return ScrollingRegion;
};

ScrollingRegionModule.dependencies = [RegionModule];

// Scripts //

function crappyTest() {
	initLogin();
	initDesktop();
	testBindings();
};

// A lot of this shit should be in PD but cba to scroll to the top all the time and namespaces are fucking gay.
var PID = 0;

function runProgram(program) {
	openPrograms.push(program);
	activeProgram = openPrograms.length-1;
	PID++;
	program.setBindings();
	program.hydrate();
	PD.pushRegion(program, Terminal.subRegion[Terminal.activeBuffer]);
	program.select();
	program.parent.changed();
};

function Alpha() {
	var alpha = mixin(WindowRegionModule);
	alpha.set({
		icon: '\u0391',
		select: function() {
			alpha.subRegion[0].select();
			alpha.changed();
		},
		menuItems: [
			{ 
				name: "File", 
				bindings: [],
				subRegion: []
			},
			{
				name: "Tools",
				bindings: [],
				subRegion: []
			}
		]
	});
	PD.pushRegion( (function() {
		var alphaText = mixin(EditableTextRegionModule);
		alphaText.set({
			width: 47,
			height: 23,
			x: 2,
			y: 1
		});
		setMouseBinding(alphaText);
		return alphaText;
	})(), alpha);
	runProgram(alpha);
};

function Beta() {
	var beta = mixin(WindowRegionModule);
	beta.set({
		icon: '\u0392',
		colour: '#8A8A8A',
		width: 30,
		height: 16,
		x: 15,
		y: 5,
		select: function() {
			beta.subRegion[0].select();
			beta.changed();
		},
		menuItems: []
	});
	PD.pushRegion( (function() {
		var betaText = mixin(EditableTextRegionModule);
		betaText.set({
			name: "BetaText",
			width: 26,
			height: 14,
			x: 2,
			y: 1
		});
		return betaText;
	})(), beta);
	runProgram(beta);
};

function Gamma() {
	var gamma = mixin(WindowRegionModule);
	gamma.set({
		icon: '\u0393',
		colour: '5B5E00',
		width: 45,
		select: function() {
			gamma.subRegion[0].select();
			gamma.changed();
		},
		menuItems: []
	});
	PD.pushRegion( (function() {
		var scrollRegionTest = mixin(ScrollingRegionModule);
		scrollRegionTest.set({
			width: 30,
			height:10,
			x: 3,
			y: 1
		});
		scrollRegionTest.hydrate();
		// These are required by ScrollingRegion... no way to enforce or abstract.
		PD.pushRegion((function() {
			var scrollBarXBackground = mixin(RegionModule);
			scrollBarXBackground.set({
				width: scrollRegionTest.width,
				height: 1,
				y: scrollRegionTest.height-1
			});
			scrollBarXBackground.hydrate();
			PD.pushRegion((function() {
				var scrollBarX = mixin(RegionModule);
				scrollBarX.set({
					initChar: '\u2588',
					height: 1,
				});
				scrollBarX.hydrate();
				return scrollBarX;
			})(), scrollBarXBackground);
			return scrollBarXBackground;
		})(), scrollRegionTest);
		PD.pushRegion((function() {
			var scrollBarYBackground = mixin(RegionModule);
			scrollBarYBackground.set({
				width: 1,
				height: scrollRegionTest.height,
				x: scrollRegionTest.width-1
			});
			scrollBarYBackground.hydrate();
			PD.pushRegion((function() {
				var scrollBarY = mixin(RegionModule);
				scrollBarY.set({
					initChar: '\u2588',
					width: 1,
				});
				scrollBarY.hydrate();
				return scrollBarY;
			})(), scrollBarYBackground);
			return scrollBarYBackground;
		})(), scrollRegionTest);
		// add invisible, overflowing subRegions
		PD.pushRegion( (function() {
			var overflowing = mixin(TextRegionModule);
			overflowing.set({
				width: 48,
				height: 18,
				visible: false
			})
			overflowing.printText("This is a test of scrolling this text will scroll loads \t\t\t This is wicked mate look how great this is I can't belive I'm actually seeing scrolling text pinch me I'm dreaming. \r\n Get a load of this scrolling text mate, you have no idea how it works do you? \t\tThis text is scrolling an unbeleiberble amount this can't be real. \t\t\t This text is still scrolling omg no way that's one for the history books I'm telling you mate get a load of this scrolling text. I still can't believe how much it's scrolling and that.\r\n Unreal.");
			return overflowing;
		})(), scrollRegionTest);
		return scrollRegionTest;
	})(), gamma);
	runProgram(gamma);
}

// This is really bad because you should only really put WindowRegions in ScreenRegions. I think. I could enforce this.
function initLogin() {
	var login = mixin(ScreenRegionModule);
	login.set({ name: "Login", initChar: '\u00a0' });
	login.hydrate();
	PD.pushRegion( (function() {
		var welcomeBox = mixin(BoxRegionModule);
		welcomeBox.set({width: 17, height: 5, x: 18, y: 2 });
		welcomeBox.hydrate();
		welcomeBox.decorate();
		PD.pushRegion( (function() {
			var welcome = mixin(TextRegionModule);
			welcome.set({width: 12, height: 1, x: 1, y: 2 });
			welcome.printText("\tWelcome");
			return welcome;
		})(), welcomeBox);
		return welcomeBox;
	})(), login);
	PD.pushRegion( (function() {
		var help = mixin(TextRegionModule);
		help.set({width: 42, height: 16, x: 5, y: 9 });
		help.printText("Help:\r\n\r\nF1 & F2 to switch buffers.\r\n\r\nYou can run programs from the Meta menu.\r\nTo select a menu item press:\r\nAlt + (underlined letter)\r\n\r\nTo switch program, press:\r\nAlt + Ctrl + (Left or Right cursor)\r\n\r\nTo scroll in Gamma use the Num Pad.");
		return help;
	})(), login);
	PD.pushRegion(login, Terminal);
};

var activeProgram = -1;

var openPrograms = [];

function initDesktop() {
	var desktop = mixin(ScreenRegionModule);
	desktop.name="Desktop";
	desktop.hydrate();
	PD.pushRegion(initDesktopMenu(), desktop);
	PD.pushRegion(desktop, Terminal);
	PD.pushRegion(createTaskBar(), desktop);
	desktop.select();
};

var programs = [
	// Why can't I just put a reference to Alpha here? :(
	{name: "Alpha", action: function(){Alpha()}, binding: 65},
	{name: "Beta", action: function(){Beta()}, binding: 66},
	{name: "Gamma", action: function(){Gamma()}, binding: 71}
];

function createMetaMenuItems() {
	var menuItems = [];
	for (var i=0; i<programs.length; i++)
		menuItems[i] = {
			name: programs[i].name,
			bindings: [[programs[i].binding, "normal", programs[i].action]]
		};
	return menuItems;
};

function initDesktopMenu() {
	var metaMenuItems = createMetaMenuItems();
	var menuItems = [ { 
			name: "Meta", 
			bindings: [
				// M
				[77, "alt", function(){PD.findAndSelect("MetaButtonContextMenu")}]
			],
			subRegion: [
				createMenu("MetaButtonContext", metaMenuItems, 0, 1)
			]
		}
	];
	return createTopBar("Desktop", menuItems);
};

function createTaskBar() {
// identical program instances should stack and be selected with a context menu, like in windows. I'm so not doing that.
	var taskBar = mixin(RegionModule);
	taskBar.set({
		name: "TaskBar",
		width: Terminal.width,
		height: 1,
		y: Terminal.height-1,
		initChar: '\u2588',
		update: function() {
			taskBar.subRegion = [];
			var totalWidth=0;
			for (var i=0; i<openPrograms.length; i++) {
				var icon = mixin(TextRegionModule);
				icon.width = 3;
				icon.height = 1;
				if (i!==0) {
					totalWidth += icon.width+1;
					icon.x = totalWidth;
				}
				if (i==activeProgram) icon.colour = "red";
				icon.printText('\u00a0' + openPrograms[i].icon + '\u00a0');
				PD.pushRegion(icon, taskBar);
			}
		},
		bindings: [
			[39, "altCtrl", function(){taskBar.cycleProgramRight()}],
			[37, "altCtrl", function(){taskBar.cycleProgramLeft()}]
		],
		cycleProgramRight: function(){
			activeProgram++;
			activeProgram = activeProgram % openPrograms.length;
			openPrograms[activeProgram].select();
			taskBar.changed();
		},
		cycleProgramLeft: function(){
			activeProgram--;
			activeProgram = activeProgram % openPrograms.length;
			openPrograms[activeProgram].select();
			taskBar.changed();
		}
	});
	taskBar.hydrate();
	taskBar.setBindings();
	return taskBar
};

function createTopBar(name, menuItems) {
	var menu = mixin(RegionModule);
	menu.set({
		name: name+"TopBar",
		width: 1,
		height: 1,
		update: function() {
			// This is pretty slow. only really needs to update if activeProgram has changed, and doesn't need to kill Meta. Hey, maybe I should use hasChanged on openPrograms? :)
			// get menuItems from openPrograms[activeProgram] and append them to menuItems
			menu.subRegion = [];
			var newMenuItems = menuItems.slice();
			if (activeProgram+1) {
				var itemsToAppend = openPrograms[activeProgram].menuItems;
				newMenuItems = newMenuItems.concat(itemsToAppend);
			}
			var totalWidth=0;
			for (var i=0; i<newMenuItems.length; i++) {
				PD.pushRegion( (function() { 
					var item= mixin(ButtonRegionModule);
					item.set({
						name: newMenuItems[i].name,
						bindings: newMenuItems[i].bindings
					});
					item.hydrate();
					item.setBindings();
					if (i!==0) {
						totalWidth += newMenuItems[i-1].name.length+1;
						item.x = totalWidth;
					}
					if (newMenuItems[i].subRegion.length)
						for (var j=0; j<newMenuItems[i].subRegion.length; j++)
							PD.pushRegion(newMenuItems[i].subRegion[j], item);
					return item;
				})(), menu);
				menu.width=totalWidth+newMenuItems[i].name.length+1;
			}
			menu.hydrate();
		}
	});
	menu.update(); // eek
	
	return menu;
};

// This should really be called a contextual menu. It shares some behaviour with a pop-up message.
function createMenu(name, menuItems, x, y) { 
	var menu= mixin(RegionModule);
	menu.set({
		name: name+"Menu",
		x: x,
		y: y,
		bindings: [[27, "normal", function(){PD.escape()}]]
	});
	var width=0;
	for (var i=0; i<menuItems.length; i++) {
		menu.bindings = menu.bindings.concat(menuItems[i].bindings);
		PD.pushRegion( (function() {
			var item= mixin(ButtonRegionModule);
			item.set({ name: menuItems[i].name, y: i});
			item.hydrate();
			if (item.width>width) width=item.width;
			return item;
		})(), menu);
	}
	menu.set({ 
		width: width,
		height: menuItems.length,
		update: function() {
			if (PD.selected===menu) {
				menu.visible=true;
				PD.activeKeySet=PD.createKeySet(menu.bindings);
			} else {
				menu.visible=false;
				PD.activeKeySet=PD.composedKeySet;
			}
		},
		selectFunction: function() {
			if (PD.selected!==menu)	menu.previouslySelected = PD.selected;
		},
		previouslySelected: 0
	});
	menu.hydrate();
	return menu;
};

function testBindings() {
	// Need more buffers
	Terminal.bindings = [
		[112, "normal", function(){Terminal.activeBuffer=0; Terminal.subRegion[0].changed();}],
		
		// F2
		[113, "normal", function(){Terminal.activeBuffer=1; Terminal.subRegion[1].changed();}],
		
		// F5
		[116, "preventDefault", false],
		
		// F11
		[122, "preventDefault", false],
		
		// F12
		[123, "preventDefault", false],
		
		// Alt
		[18, "alt", function(){Terminal.toggleAltMode()}],
		
		// F6
		[117, "normal", function(){PD.toggleDebugMode()}]
	];
	Terminal.setBindings();
};