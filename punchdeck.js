// Easy way to change colour scheme?
// I want it to be like, classic 70s shades of beige with touches of red and blue.
// I also want to experiment with a white + primary colours scheme.

// I have to draw a circle with Math stuff :^)

// changing() wrapper that adds this.changed to functions?
// also, I've been using Terminal.reDraw if I can't be bothered to figure out how to changed something, which is dumb.

// I don't really understand what selected is. It's mainly just so that escape works.

function doNothing() {};

// I am in shock and denial about how well this works.
// You still can't have private static methods that access instance properties but it doesn't matter because you can have private instance methods that access instance properties and static properties.
// Not sure how mixins effect performance but I don't think it's harmful. It's probably less harmful that using prototypes.
var mixin = (function(){
	function getDependencies(args) {
		var mixingPot = args;
		for (var i=args.length-1; i>=0; i--) {
			var dependencies = innerGetDependencies(args[i]);
			for (var j=0; j<dependencies.length; j++)
				if (mixingPot.indexOf(dependencies[j])==-1)
					mixingPot.push(dependencies[j]);
		}
		return mixingPot;
	};
	function innerGetDependencies(item) {
		var mixingPot = [];
		mixingPot.push(item);
		for (var i=item.dependencies.length-1; i>=0; i--)
			if (mixingPot.indexOf(item.dependencies[i])==-1)
				mixingPot = mixingPot.concat(innerGetDependencies(item.dependencies[i]));
		return mixingPot;
	};
	return function() {
		var mixingPot = getDependencies(Array.prototype.slice.call(arguments));
		var instance = {};
		for (var i=mixingPot.length-1; i>=0; i--) {
			var product = mixingPot[i](instance);
			for(var key in product)
				instance[key] = product[key];
		}
		instance.composition = mixingPot;
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
		// fk it i dnt evn care nymore
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
			// I tried to use Object.observe once but it didn't work out.
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
			PD.debugMode
			? PD.debugMode = false
			: PD.debugMode = true;
			Terminal.reDraw();
		}
	}
})();

// This stuff should all be in the PD namespace but I cba

// One day this will inherit from ScreenRegion, but there's some cirular dependency shit going on and I don't give a fuck right now. I guess some modules are like child modules of Terminal. On the whole, ScreenRegions and WindowRegions are pretty stupid now so I might kill them.
function TerminalModule(instance) {
	var that = instance;
	
	var lines=[];
	var container={};
	var pxWidth= 500;
	var pxHeight= 500;
	return Terminal= {
		name: "Terminal",
		subRegion: [],
		activeBuffer: 0,
		hasChanged: true,
		bindings: [],
	
		width: Math.floor(pxWidth/9.5),
		height: Math.floor(pxHeight/18.5),
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
			container.style.top=((h/2)-(pxHeight/2))+"px";
			container.style.left=((w/2)-(pxWidth/2))+"px";
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
				setInterval(that.update, 32); // fixed 30fps
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
function WindowRegionModule() {
	return WindowRegion = {
		initChar: '\u2591',
		width: Terminal.width,
		height: Terminal.height-2,
		y: 1
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
	return Module = function(instance) {
		var that = instance;
		var EditableTextRegion = {
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
				// nice if we had a printText...
				debugText.printText(eval(data));
				debug.changed();
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
// What I want is to be able to go "here's the text and the index, hydrate with it". But I can't even encode stuff from text with encoded text regions yet anyway, it would be a lot easier with token parsing, so I guess it's fine for now. 
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

// Woah this is hard.
function ScrollingRegionModule(instance) {
	var that = instance;
	function render(toDraw) {
		var i=0;
		for (var y=Math.abs(toDraw.y); y<toDraw.height; y++) {
			for (var x=Math.abs(toDraw.x); x<toDraw.width; x++) {
				if (x-Math.abs(toDraw.x)>=that.width) continue;
				var element = toDraw.buffer[toDraw.getPointer(x, y)];
				// it should only render what is in the bounds of that.width and that.height. Of course! It never occured to me to think of that as the thing that's moving! lol
				// Clearly it doesn't start at y=0 and x=0.

				toDraw.composition.indexOf(EncodedTextRegionModule)!=-1
				? that.buffer[i]=element
				: that.buffer[i]=element.toSpan(toDraw.colour, toDraw.background);
				i++;
			}
		}
		toDraw.hasChanged=false;
	}
	// Only does x atm
	function drawRegion(toDraw) {
		if (toDraw.hasChanged==true) {
			toDraw.update();
			// Doesn't care if invisible. Maybe I need another property.
			render(toDraw);
		}
	};
	var ScrollingRegion = {
		// You have to make the subRegion invisible (and I guess any sub-subRegions, but I won't get into that yet). This totally doesn't handle non-overflowing subRegions.
		update: function() {
			var child = that.subRegion[1];
			var scrollBar = that.subRegion[0];
			// i cry evry tiem
			scrollBar.y = that.height-1;
			var ratio = that.width/child.width;
			scrollBar.width = Math.floor(ratio*that.width);
			scrollBar.hydrate();
			scrollBar.x=that.width+Math.floor(child.x*ratio)-scrollBar.width;
			
			drawRegion(child);
		},
		scrollRight: function() {
			var child = that.subRegion[1];
			if (child.x<0&&child.x>=that.width-child.width) {
				child.x++;
				child.hasChanged=true;
				that.changed();
			}
		},
		scrollLeft: function() {
		var child = that.subRegion[1];
			if (child.x>that.width-child.width&&child.x<=0) {
				child.x--;
				child.hasChanged=true;
				that.changed();
			}
		}
	};
	ScrollingRegion.bindings = [
		[100, "normal", function(){that.scrollLeft()}],
		[102, "normal", function(){that.scrollRight()}]
	];
	PD.pushRegion((function() {
		var scrollBar = mixin(RegionModule);
		scrollBar.set({
			initChar: '\u2588',
			height: 1
		});
		scrollBar.hydrate();
		return scrollBar;
	})(), that);
	return ScrollingRegion;
};

ScrollingRegionModule.dependencies = [RegionModule];

// Scripts //

// crappy test
function crappyTest() {
	initLogin();
	initDesktop();
	testBindings();
	debug.visible = true;
};

// A lot of this shit should be in PD but cba to scroll to the top all the time and namespaces are fucking gay.
var PID = 0;

function addProgram(program) {
	openPrograms.push(program);
	activeProgram = openPrograms.length-1;
	PID++;
};

// Some of this stuff can go in WindowRegion / it's own Module. Rename WindowRegion to ProgramRegion?
function Alpha() {
	var alpha = mixin(WindowRegionModule);
	addProgram(alpha);
	alpha.set({
		icon: '\u0391',
		select: function() {
			alpha.subRegion[0].select();
			alpha.changed();
		},
		bindings: [[115, "normal", function(){alpha.kill()}]],
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
			width: 24,
			height: 12,
			x: 2,
			y: 1
		});
		return alphaText;
	})(), alpha);
	alpha.setBindings();
	alpha.hydrate();
	PD.pushRegion(alpha, Terminal.subRegion[Terminal.activeBuffer]);
	alpha.select();
	alpha.parent.changed();
};

function Beta() {
	var beta = mixin(WindowRegionModule);
	addProgram(beta);
	beta.set({
		icon: '\u0392',
		colour: '#8A8A8A',
		select: function() {
			beta.subRegion[0].select();
			beta.changed();
		},
		bindings: [[115, "normal", function(){beta.kill()}]],
		menuItems: []
	});
	PD.pushRegion( (function() {
		var betaText = mixin(EditableTextRegionModule);
		betaText.set({
			name: "BetaText",
			width: 40,
			height: 7,
			x: 2,
			y: 16
		});
		return betaText;
	})(), beta);
	PD.pushRegion( (function() {
		var betaEval = mixin(TextRegionModule);
		betaEval.set({
			name: "BetaText",
			width: 40,
			height: 12,
			x: 2,
			y: 2
		});
		return betaEval;
	})(), beta);
	beta.setBindings();
	beta.hydrate();
	PD.pushRegion(beta, Terminal.subRegion[Terminal.activeBuffer]);
	beta.select();
	beta.parent.changed();
};

function Gamma() {
	var gamma = mixin(WindowRegionModule);
	addProgram(gamma);
	gamma.set({
		icon: '\u0393',
		colour: '5B5E00',
		select: function() {
			gamma.subRegion[0].select();
			gamma.changed();
		},
		bindings: [[115, "normal", function(){gamma.kill()}]],
		menuItems: []
	});
	PD.pushRegion( (function() {
		var scrollRegionTest = mixin(ScrollingRegionModule);
		scrollRegionTest.set({
			width: 30,
			height: 20,
			x: 3,
			y: 1
		});
		scrollRegionTest.hydrate();
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
	gamma.setBindings();
	gamma.hydrate();
	PD.pushRegion(gamma, Terminal.subRegion[Terminal.activeBuffer]);
	gamma.select();
	gamma.parent.changed();
}

// This is really bad because you should only really put WindowRegions in ScreenRegions. I think. I could enforce this.
function initLogin() {
	var login = mixin(ScreenRegionModule);
	login.set({ name: "Login", initChar: '\u00a0' });
	login.hydrate();
	PD.pushRegion( (function() {
		var welcomeBox = mixin(BoxRegionModule);
		welcomeBox.set({ name: "WelcomeBox", width: 20, height: 7, x: 16, y: 7 });
		welcomeBox.hydrate();
		welcomeBox.decorate();
		welcomeBox.subRegion.push( (function() {
			var welcome = mixin(TextRegionModule);
			welcome.set({ name: "Welcome", width: 15, height: 3, x: 2, y: 2 });
			welcome.printText("\tWelcome\r\n  to PunchDeck\r\n---------------");
			return welcome;
		})());
		return welcomeBox;
	})(), login);
	PD.pushRegion(login, Terminal);
};

var debugText = mixin(TextRegionModule);
debugText.set({
	width: 22,
	height: 1,
	x: 30,
	visible: false,
	colour: "black"
});

var debug = mixin(RegionModule);
debug.set({
	update: function() {
		PD.debugMode
		? debugText.visible=true
		: debugText.visible=false;
	}
});

PD.pushRegion(debugText, debug);

// identical program instances should stack and be selected with a context menu, like in windows. I'm so not doing that.
var taskBar = mixin(RegionModule);
taskBar.set({
	name: "TaskBar",
	width: Terminal.width,
	height: 1,
	y: Terminal.height-1,
	initChar: '\u2588',
	update: function() {
		// remove all buttons
		taskBar.subRegion = [];
		var totalWidth=0;
		// for each open program
		for (var i=0; i<openPrograms.length; i++) {
			// create a icon (in a similar way to top bar)
			var icon = mixin(TextRegionModule);
			icon.width = 3;
			icon.height = 1;
			if (i!==0) {
				totalWidth += icon.width+1;
				icon.x = totalWidth;
			}
			if (i==activeProgram) icon.colour = "red";
			icon.printText('\u00a0' + openPrograms[i].icon + '\u00a0');
			// and push the icon to taskBar
			PD.pushRegion(icon, taskBar);
		}
	}
});
taskBar.hydrate();


var activeProgram = -1;

// When we run any program, we need to give it a unique id. 
var openPrograms = [];

function cycleProgramRight() {
	activeProgram++;
	activeProgram = activeProgram % openPrograms.length;
	openPrograms[activeProgram].select();
	taskBar.changed();
}

function cycleProgramLeft() {
	activeProgram--;
	activeProgram = activeProgram % openPrograms.length;
	openPrograms[activeProgram].select();
	taskBar.changed();
}

function initDesktop() {
	var desktop = mixin(ScreenRegionModule);
	desktop.name="Desktop";
	desktop.hydrate();
	PD.pushRegion(initDesktopMenu(), desktop);
	PD.pushRegion(desktop, Terminal);
	PD.pushRegion(debug, desktop);
	PD.pushRegion(taskBar, desktop);
	desktop.select();
};

var programs = [
	// Why can't I just put a reference to Alpha here? :(
	{name: "Alpha", action: function(){Alpha()}, binding: 65},
	{name: "Beta", action: function(){Beta()}, binding: 66},
	{name: "Gamma", action: function(){Gamma()}, binding: 71}
];

// returns array of {name: , bindings:} bindings.
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

// The active program should add items to this menu.
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
	// F1
	// should be Terminal.setActiveBuffer
	Terminal.bindings = [
		[112, "normal", function(){Terminal.activeBuffer=0; Terminal.subRegion[0].changed();}],
		
		// F2
		[113, "normal", function(){Terminal.activeBuffer=1; Terminal.subRegion[1].changed();}],
		
		// F4
		// can't have more than one instance
		// Also this kills the menu item atm
		// [115, "normal", function(){PD.kill("Alpha")}],
		// [115, "normal", function(){PD.killActiveProgram()}],
		
		// F5
		[116, "preventDefault", false],
		
		// F11
		[122, "preventDefault", false],
		
		// F12
		[123, "preventDefault", false],
		
		// Alt
		[18, "alt", function(){Terminal.toggleAltMode()}],
		
		// F6
		[117, "normal", function(){PD.toggleDebugMode()}],
		
		// Right
		[39, "altCtrl", function(){cycleProgramRight()}],
		
		// Left
		[37, "altCtrl", function(){cycleProgramLeft()}]
	];
	Terminal.setBindings();
};