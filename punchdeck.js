function doNothing() {};

var terminal={}; // namespace

terminal.width=52; // could be determined programmatically
terminal.height=28; 

terminal.subRegion=[];
terminal.activeBuffer = 0;

terminal.selected={};

(function() {
	lines=[];

	terminal.init= (function() {
		function constructDivs() {
			for (var y=0; y<terminal.height; y++) {
				var node=document.createElement("DIV");
				node.id="line"+y;
				terminal.terminal.appendChild(node);
				lines[y]=node;
			}
		};
		
		return function () {
			terminal.terminal=document.getElementById("terminal");
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
		
		// text regions should not be rendered like this if we are going to have control characters. We need a separate buffer for storing encoded text.
		// Also implement paul blart here
		function drawRegion(offset, toDraw, parentChanged) {
			offset+=(toDraw.y*terminal.width)+toDraw.x;
			
			var thisChanged=false;
			if (toDraw.hasChanged===true||parentChanged===true) {
				thisChanged=true;
				var i=offset;
				for (var y=0; y<toDraw.height; y++) {
					for (var x=0; x<toDraw.width; x++) {
						// well this is fucking rediculess
						var text=
						'<font color="'+toDraw.colour+
						'" background-color="'+toDraw.background+'">';
						if (toDraw.underlined) { text+='<u>'; }
						if (toDraw.bold) { text+='<b>'; }
						if (toDraw.italic) { text+='<i>'; }
						text+=toDraw.buffer[(y*toDraw.width)+x] 
						if (toDraw.underlined) { text+='</u>'; }
						if (toDraw.bold) { text+='</b>'; }
						if (toDraw.italic) { text+='</i>'; }
						text += "</font>";
						
						textBuffer.buffer[i]=text;
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

terminal.realign= (function() {
	var pxWidth=500;
	var pxHeight=500;
	return function () {
		var w=window.innerWidth;
		var h=window.innerHeight;
		terminal.terminal.style.width=pxWidth;
		terminal.terminal.style.height=pxHeight;
		terminal.terminal.style.top=((h/2)-(pxWidth/2))+"px";
		terminal.terminal.style.left=((w/2)-(pxHeight/2))+"px";
	};
})();

// pass it a name. It finds the item, moves it to the top of it's stack, and selects it.
terminal.select= (function() {
	var cache=[];
	function innerSearch(item, name) {
		for (var i=0; i<item.length; i++) {
			if (item[i].name===name) {
				return item;
			}
			var result = innerSearch(item[i].subRegion, name);
			if (result) {
				return result;
			}
		}
		return 0;
	}
	return function (name) {
		for (var i=0; i<cache.length; i++) {
			if (cache[i].name===name) {
				return cache[i];
			}
		}
		var result = innerSearch(terminal.subRegion, name);
		if (result) {
			cache.push(result);
		}
		if (!result) {
			console.log("item " + name + " found");
			return;
		}
		for (var i=0; i<result.length; i++) {
			if (result[i].name===name) {
				var item = result[i];
				result.splice(i, 1);
				result.push(item);
				item.select();
				return;
			}
		}
	}
})();

terminal.search = (function() {
	var cache=[];
	function innerSearch(item, name) {
		for (var i=0; i<item.length; i++) {
			if (item[i].name===name) {
				return item[i];
			}
			var result = innerSearch(item[i].subRegion, name);
			if (result) {
				return result;
			}
		}
		return 0;
	}
	return function (name) {
		for (var i=0; i<cache.length; i++) {
			if (cache[i].name===name) {
				return cache[i];
			}
		}
		var result = innerSearch(terminal.subRegion, name);
		if (result) {
			cache.push(result);
		}
		return result || (function() {console.log("item " + name + " found")})();
	}
})();

terminal.hasChanged=true;

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
	this.underlined=false;
	this.bold=false;
	this.italic=false;
	this.selectFunction = function(){doNothing()};
	this.select = function() {
		terminal.selected = this;
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

function EditableTextRegion(name, width, height, x, y) {
	this.name=name;
	this.width=width;
	this.height=height;
	this.x=x;
	this.y=y;
	this.buffer=[];
	this.encodedBuffer=[];
	this.subRegion=[];
	this.selectFunction=function () { bindings.textEditor() };
	// I could write some matrix methods to help going up / down in y.
	this.update=(function(that) {
		var tab = function() {
			var x = that.pointer%that.width;
			for (var i=x%terminal.tabsize; i<terminal.tabsize; i++) {
				helperPrint('\u00a0');
			}
		};
		var newLine = function() {
			for (var i=that.pointer%that.width; i<that.width; i++) {
				helperPrint('\u00a0');
			}
		};
		var helperPrint = function(symbol) {
			that.buffer[that.pointer]=symbol;
			that.pointer++;
		};
		var decode = function(symbol) {
			switch(symbol) {
				case ' ':
					helperPrint('\u00a0');
					break;
				case '\n':
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
			this.pointer=0;
			this.anotherPointer=0;
			for (var i=0; i<this.encodedBuffer.length; i++) {
				decode(this.encodedBuffer[i]);
				if (i+1===this.encodedPointer) {
					this.anotherPointer=this.pointer;
				}
			}
		};
	})(this);
	this.subRegion.push((function (that) {
		var cursor=new MiniRegion(that.name + "Cursor", 1, 1);
		cursor.visible=false;
		cursor.buffer[0]='\u2588';
		cursor.update=function () {
			cursor.x=that.anotherPointer%that.width;
			cursor.y=Math.floor(that.anotherPointer/that.width);
		};
		return cursor;
	})(this));
	this.encodedPointer=0;
	this.pointer=0;
	this.anotherPointer=0;
	// could have a global object set to hasChanged, if nothing has changed don't redraw. also make it so that if something is redrawn, everything beneath it is redrawn too. then could get rid of reDraw.
	this.cursorRight=function () {
		bindings.startTimer();
		this.encodedPointer++;
		this.hasChanged=true; 
		this.subRegion[0].hasChanged=true; // this is fucking silly
	}
	this.cursorLeft=function () {
		bindings.startTimer();
		if (this.encodedPointer>0) {
			this.encodedPointer--;
		}
		this.hasChanged=true;
		this.subRegion[0].hasChanged=true;
	}
	this.print=function (symbol) {
		bindings.insertMode
		? this.encodedBuffer.splice(this.encodedPointer, 0, symbol)
		: this.encodedBuffer[this.encodedPointer]=symbol;
		this.cursorRight();
	}
	this.backspace=function () {
		this.cursorLeft();
		if (this.encodedBuffer.length) {
			this.encodedBuffer.splice(this.encodedPointer, 1);
		}
	}
};

EditableTextRegion.prototype = new Region("EditableTextRegion");

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
		alphaText.hydrate();
		return alphaText;
	})());
	alpha.hydrate();
	terminal.subRegion[terminal.activeBuffer].subRegion.push(alpha);
	terminal.select("AlphaText");
	bindings.observed.push(alpha.subRegion[0]);
	bindings.observed.push(alpha.subRegion[0].subRegion[0]);
}

function initLogin() {
	var login = new ScreenRegion("Login");
	login.initChar='\u00a0';
	login.hydrate();
	login.subRegion.push( (function() {
		var welcome = new MiniRegion("Welcome", 10, 3, 21, 7);
		welcome.buffer="Welcome to PunchDeck----------"; // won't be a problem with encoded text
		return welcome;
	})());
	login.selectFunction= function() {
		bindings.control();
	}
	terminal.subRegion.push(login);
	terminal.select("Login");
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
	
// function createContextMenu


terminal.tabsize=3;
