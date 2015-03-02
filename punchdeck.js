function doNothing() {};

var terminal={};

(function () {
	var pxWidth=500;
	var pxHeight=500;

	terminal.width=52; // could be determined programmatically
	terminal.height=28; 

	terminal.subRegion=[];
	terminal.activeBuffer = 0;
	
	terminal.init=function () {
		terminal.terminal=document.getElementById("terminal");
		constructDivs();
		terminal.realign();
		bindings.initKeys();
		crappyTest();
		terminal.startTimer();
		setInterval(terminal.update, 32); // fixed 30fps
	};

	terminal.startTimer = (function() {
		var timer;
		return function() {
			clearInterval(timer);
			var cursor=terminal.getCursor();
			if (cursor) {
				cursor.visible=true;
			}
			timer=setInterval(toggleCursor, 350);
		};
	})();

	terminal.getCursor = function() {
		if (terminal.selected.__proto__.name==="TextRegion") {
			return terminal.selected.subRegion[0];
		}
		else {
			return 0; // can I make this more better?
		}
	}
	
	function toggleCursor() {
		var cursor=terminal.getCursor();
		if (cursor) {
			cursor.visible
			? cursor.visible=false
			: cursor.visible=true;
			cursor.hasChanged=true;
			terminal.selected.hasChanged=true; // this is fucking stupid.
		}
	}

	terminal.realign=function () {
		var w=window.innerWidth;
		var h=window.innerHeight;

		terminal.terminal.style.top=((h/2)-(pxWidth/2))+"px";
		terminal.terminal.style.left=((w/2)-(pxHeight/2))+"px";
	};

	var lines=[];

	function constructDivs() {
		for (var y=0; y<terminal.height; y++) {
			var node=document.createElement("DIV");
			node.id="line"+y;
			terminal.terminal.appendChild(node);
			lines[y]=node;
		}
	};

	terminal.update=function () {
		terminal.getCursor().update(); // this is fucking silly
		draw(terminal.subRegion[terminal.activeBuffer]);
		for (var y=0; y<terminal.height; y++) {
			lines[y].innerHTML=getLine(y);
		}
	}

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
	}

	// text regions should not be rendered like this if we are going to have control characters. We need a separate buffer for storing encoded text.
	// Also implement paul blart here
	function drawRegion(offset, toDraw) {
		offset+=(toDraw.y*terminal.width)+toDraw.x;
		
		if (toDraw.hasChanged===true) {
			var i=offset;
			for (var y=0; y<toDraw.height; y++) {
				for (var x=0; x<toDraw.width; x++) {
					textBuffer.buffer[i]='<font color="blue">'+toDraw.buffer[(y*toDraw.width)+x]+"</font>";
					i++;
				}
				i+=textBuffer.width-toDraw.width;
			}

			toDraw.hasChanged=false;
		}
		
		for (i=0; i<toDraw.subRegion.length; i++) {
			if (toDraw.subRegion[i].visible) {
				drawRegion(offset, toDraw.subRegion[i]);
			}
		}
	}

	terminal.selected={};

	// searches through hierarchy to call select of matching region name
	terminal.select=function (name) {
		var item=terminal.search(name);
		item.select();
	}

	// depth first search
	terminal.search=function (name) {
		var result = innerSearch(terminal.subRegion, name);
		return result || (function() {console.log("item not found")})();
	}

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

	terminal.reDraw = function() {
		for (i=0; i<terminal.subRegion.length; i++) {
			innerReDraw(terminal.subRegion[i]);
		}
	}

	function innerReDraw(item) {
		item.hasChanged=true;
		for (var i=0; i<item.subRegion.length; i++) {
			innerReDraw(item.subRegion[i]);
		}
	}
})();

// Region //
// this might need closuring / namespacing. This whole thing might need closuring / namespacing.
function Region(name, width, height, x, y) {
	this.name = name || (function() {
							console.log("unnamed region");
							return "ERROR"; }
						)();
	this.width = width || 0;
	this.height = height || 0;
	this.x = x || 0; // too abstracted
	this.y = y || 0;
	this.initChar='\u00a0'; // if '' then transparent
	this.visible=true;
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
};

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

function ScreenRegion(name) {
	this.name=name;
	this.initChar='\u2593';
	this.buffer=[];
	this.subRegion=[];
};

ScreenRegion.prototype=new Region("ScreenRegion", terminal.width, terminal.height, 0, 0);

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

function TextRegion(name, width, height, x, y) {
	this.name=name;
	this.width=width;
	this.height=height;
	this.x=x;
	this.y=y;
	this.buffer=[];
	this.subRegion=[];
	this.selectFunction=function () { bindings.textEditor() };
	this.subRegion.push((function (that) {
		var cursor=new MiniRegion(that.name + "Cursor", 1, 1);
		cursor.visible=false;
		cursor.buffer[0]='\u2588';
		cursor.update=function () {
			if (that.cursor<that.buffer.length) {
				cursor.x=that.cursor%that.width;
				cursor.y=Math.floor(that.cursor/that.width);
			}
		}
		return cursor;
	})(this));
	this.cursor=0;
	this.m_cursorGet=function () {
		return { x: this.width%this.height, y: Math.floor(this.width/this.height) };
	}
	this.m_cursorSet=function (vec) {
		this.cursor=(vec.y*this.height)+vec.x;
	}
	//this.cursorDown=function () {
	//	var vec=this.m_cursorGet();
	//	if (!vec.y<this.height) {
	//		vec.y++;
	//	}
	//	this.m_cursorSet(vec);
	//}

	//this.cursorUp=function () {
	//	var vec=this.m_cursorGet();
	//	if (!vec.y>0) {
	//		vec.y--;
	//	}
	//	this.m_cursorSet(vec);
	//}
	this.cursorRight=function () {
		terminal.startTimer();
		if (this.cursor<this.buffer.length) {
			this.cursor++;
		}
	}
	this.cursorLeft=function () {
		terminal.startTimer();
		if (this.cursor>0) {
			this.cursor--;
		}
	}
	this.print=function (ch) {
		if (this.cursor<this.buffer.length) {
			this.buffer[this.cursor]=ch; // should be this.escape(ch)
		}
		this.cursorRight();
		this.hasChanged=true; 
		this.subRegion[0].hasChanged=true; // this is fucking silly
	}
	this.backspace=function () {
		this.cursorLeft();
		this.buffer[this.cursor]=this.initChar;
		this.hasChanged=true;
		this.subRegion[0].hasChanged=true;
	}
	// this.newLine()
};

TextRegion.prototype = new Region("TextRegion");

///////////////////////////////
// this should just be json?

// crappy test
function crappyTest() {
	terminal.subRegion.push(initLogin());
	terminal.subRegion.push(initDesktop());
	runAlpha();
}
	
function runAlpha() {
	var alpha = new WindowRegion("Alpha");
	alpha.initChar='\u2591';
	alpha.subRegion.push((function() {
		var alphaText = new TextRegion("AlphaText", 30, 13, 2, 1);
		alphaText.hydrate();
		return alphaText;
	})());
	alpha.hydrate();
	terminal.subRegion[1].subRegion.push(alpha); // normally we would push it on the active buffer
	terminal.select("AlphaText");
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
	return login;
}

function initDesktop() {
	var desktop = new ScreenRegion("Desktop");
	desktop.hydrate();
	desktop.subRegion.push(initDesktopMenu());
	return desktop;
}

function initDesktopMenu() {
	// make sure when you select things they move above everything else, so that when you spawn a contextual menu it appears on top.
	var menuItems = [
		{ name: "Meta", selectFunction: function(){doNothing()} }, // create context menu and select it, which will set the context menu bindings.
		{ name: "File", selectFunction: function(){doNothing()} },
		{ name: "Edit", selectFunction: function(){doNothing()} },
		{ name: "View", selectFunction: function(){doNothing()} },
		{ name: "Tools", selectFunction: function(){doNothing()} }
	];
	
	var menu=new MiniRegion("DesktopMenu", 1, 1);
	var total=0;
	for (var i=0; i<menuItems.length; i++) {
		menu.subRegion.push( (function() { 
			var item = new MiniRegion(menuItems[i].name + "Button", menuItems[i].name.length, 1);
			item.selectFunction = menuItems[i].selectFunction;
			if (i!==0) {
				total += menuItems[i-1].name.length+1;
				item.x = total;
			}
			item.buffer=menuItems[i].name;
			return item;
			})()
		);
	}
	menu.width=total;
	menu.hydrate();
	return menu;
}

// function createContextMenu
