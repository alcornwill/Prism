// I'm going to set my bindings model straight.
// The select function of each region just sets bindings. It might as well be renamed to bindings. If something changes then at render time, all the select functions need to be called to set the bindings correctly, in the rendering order. I need to stop calling select at object creation. And when something goes out of scope (I'm not sure what that means) all the bindings need to be wiped. Each selectFunction just calls a bindings function here. It works because there is no cursor, and I don't want tabbing going on either, so you can't actually select anything without a binding. The function bound to the key can contain, by reference or not, the logic to perform anything. Yeah it shouldn't be called select. but FUCK ACTUALLY, why do we have selected? I do actually need it when I want to know if the selected object is s textregion. and SHIT, if everything were selected on creation, then the cursor would be selected last and then nothing would work. Maybe some things just aren't selectable... So we set the bindings regardless... but we still have to select the things that are selectable upon creation. And quite often a binding will just select a region, which will bring it to the front, set it as the selected object and set it's bindings again.

// one bindings to many terminals.
var PD = {
	selected: {},
	isType: function(item, type) {
		return item.__proto__.name===type
	}
};

// I have no idea if this is like ASCII or UTF-8 complient or something. I really need to read about it.
PD.save = function() {
	var buffer=PD.selected.encodedBuffer;
	var data="";
	for (var i=0; i<buffer.length; i++) {
		data+=buffer[i][0];
	}
	window.open('data:text/csv;charset=utf-8,' + encodeURIComponent(data));
};

PD.pushRegion = function(region, pushTo) {
	region.parent=pushTo;
	pushTo.subRegion.push(region);
	// region.setBindings();
	// if (region.selectable) {
	//    region.select();
	// }
};
	

// pass it a name. It finds the item, moves it to the top of it's stack, and selects it.
// should be called findAndSelect
(function() {
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
	// function findArrayContaining(name) {
		// var result= innerFind(terminal, terminal.subRegion, name).subRegion;
		// return result || console.log("item " + name + " found");
	// }
	function search(name) {
		var result= innerSearch(terminal.subRegion, name);
		return result || console.log("item " + name + " found");
	}
	function bringToFront(item, name) {
		var subRegion = item.parent.subRegion;
		for (var i=0; i<subRegion.length; i++) {
			if (subRegion[i].name===name) {
				subRegion.splice(i, 1);
				subRegion.push(item);
				// not setting bidnigs.
				item.parent.changed();
				break;
			}
		}
		if (item.parent.name==="Terminal") { return; }
		bringToFront(item.parent, item.parent.name);
	}
	// Fuck. Whenever you select something, it's supposed to bring the whole branch to the front, not just the selected item. I can do it but it's really thinky.
	PD.select= function(name) {
		var result = search(name);
		bringToFront(result, name);
		result.select();
	}
	PD.kill= function(name) {
		var result = search(name);
		var subRegion = result.parent.subRegion;
		
		for (var i=0; i<subRegion.length; i++) {
			if (subRegion[i].name===name) {
				var item = subRegion[i];
				subRegion.splice(i, 1);
				result.changed();
				return;
			}
		}
	}
})();

PD.search= (function() {
	var cache=[];

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

PD.fontWrap = function(text, colour, background) {
	var font = 	'<font color="'+colour+
				'" background-color="'+background+'">';
	font += text;
	return font += "</font>";
};

(function() {
	var keys = [];

	function key() {
		this.normal = function(){doNothing()};
		this.shift = function(){doNothing()};
		this.alt = function(){doNothing()};
		this.ctrl = function(){doNothing()};
		this.shiftAlt = function(){doNothing()};
		this.shiftCtrl = function(){doNothing()};
		this.altCtrl = function(){doNothing()};
		this.shiftAltCtrl = function(){doNothing()};
		this.preventDefault = true
	}

	PD.initKeys = function() {
		for (var i=0; i<=222; i++)
		{
			keys[i] = new key();
		}
	}
	
	var toggleCapsLock = (function() {
		var capsLock=false;
		return function() {
			capsLock
			? (function() { alphaNumeric(); capsLock = false; })()
			: (function() { capsLockBindings(); capsLock = true; })();
		}
	})();
 	
	(function() {
		var getCursor= function() {
			if (PD.isType(PD.selected, "EditableTextRegion")) {
				return PD.selected.subRegion[0];
			}
			else {
				return 0; // can I make this more better?
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
			}
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

	PD.textEditor = function() {
		alphaNumeric();
		punctuation();
	}
	
	PD.colourMode = '#1D5FA1';
	PD.background = "green"; // doesn't work ¯\_(ツ)_/¯ 
	// shit I need this to do highlighting
	PD.underlined = false;
	PD.bold = false;
	PD.italics = false;
	
	PD.toggleUnderlined = function() {
		PD.underlined
		? PD.underlined=false
		: PD.underlined=true;
	}
	
	PD.toggleBold = function() {
		PD.bold
		? PD.bold=false
		: PD.bold=true;
	}
	
	PD.toggleItalics = function() {
		PD.italics
		? PD.italics=false
		: PD.italics=true;
	}
	
	PD.contextMenuBindings = function() {
		// really not sure about this
		resetTextBindings();
		keys[27].normal = function(){escape()};
		// more alt + letter bindings go here
		// cursor keys
	}
	
	PD.customBinding = function(key, modifier, theFunction) {
		switch(modifier) {
			case "normal":
				keys[key].normal = theFunction;
				break;
			case "shift":
				keys[key].shift = theFunction;
				break;
			case "alt":
				keys[key].alt = theFunction;
				break;
			case "ctrl":
				keys[key].ctrl = theFunction;
				break;
			case "shiftAlt":
				keys[key].shiftAlt = theFunction;
				break;
			case "shiftCtrl":
				keys[key].shiftCtrl = theFunction;
				break;
			case "altCtrl":
				keys[key].altCtrl = theFunction;
				break;
			case "shiftAltCtrl":
				keys[key].shiftAltCtrl = theFunction;
				break;
		}
	}	
	
	// PD.print and stuff?
	PD.controlBindings = function() {
		// Backspace
		keys[8].normal = function(){PD.selected.backspace()};
		keys[8].shift = function(){PD.selected.backspace()};
		
		// Tab
		keys[9].normal = function(){PD.selected.print('\t')};
		
		// Enter
		keys[13].normal = function(){PD.selected.print('\r\n')};
		keys[13].shift = function(){PD.selected.print('\r\n')};
		
		// Shift
		// keys[16]
		
		// Control
		// keys[17]
		
		// Alt
		// keys[18]
		
		// Caps Lock
		keys[20].normal = function(){toggleCapsLock()};
		
		// Escape
		keys[27].normal = function(){escape()};
		
		// Space
		keys[32].normal = function(){PD.selected.print(' ')};
		keys[32].shift = function(){PD.selected.print(' ')};
		
		// Page Up
		keys[33].normal = function(){PD.selected.pageUp()}; // not implemented until we do scroll
		
		// Page Down
		keys[34].normal = function(){PD.selected.pageDown()};
		
		// End
		keys[35].normal = function(){PD.selected.end()};
		
		// Home
		keys[36].normal = function(){PD.selected.home()};
		
		// Left Arrow
		keys[37].normal = function(){PD.selected.cursorLeft()};
		
		// Up Arrow
		keys[38].normal = function(){PD.selected.cursorUp()};
		
		// Right Arrow
		keys[39].normal = function(){PD.selected.cursorRight()};
		
		// Down Arrow
		keys[40].normal = function(){PD.selected.cursorDown()};
		
		// Insert
		keys[45].normal = function(){toggleInsertMode()};
		
		// Delete
		// keys[46]
		
		// Left Meta
		// keys[91]
		
		// Right Meta
		// keys[92]
		
		// Select
		// keys[93]

		// Numpad 0
		keys[96].normal = function(){PD.colourMode="black"};

		// Numpad 1
		keys[97].normal = function(){PD.colourMode="red"};
		
		// Numpad 2
		keys[98].normal = function(){PD.colourMode="green"};
		
		// Numpad 3
		keys[99].normal = function(){PD.toggleUnderlined()};
		
		// Numpad 4
		keys[100].normal = function(){PD.toggleBold()}
		
		// Numpad 5
		keys[101].normal = function(){PD.toggleItalics()};
		
		// Numpad 6
		// keys[102]
		
		// Numpad 7
		// keys[103]
		
		// Numpad 8
		// keys[104]
		
		// Numpad 9
		// keys[105]

		// Multiply
		// keys[106]
		
		// Add
		// keys[107]
		
		// Subtract
		// keys[109]
		
		// Decimal Point
		// keys[110]
		
		// Divide
		// keys[111]
		
		// F1
		keys[112].normal = function(){terminal.activeBuffer=0; terminal.subRegion[0].changed();};
		
		// F2
		keys[113].normal = function(){terminal.activeBuffer=1; terminal.subRegion[1].changed();};
		
		// F3
		keys[114].normal = function(){runAlpha()};
		
		// F4
		keys[115].normal = function(){PD.kill("Alpha")}; // can't have more than one instance
		
		// F5
		keys[116].preventDefault = false;
		
		// F6
		// keys[117]
		
		// F7
		// keys[118]
		
		// F8
		// keys[119]
		
		// F9
		// keys[120]
		
		// F10
		// keys[121]
		
		// F11
		keys[122].preventDefault = false;
		
		// F12
		keys[123].preventDefault = false;
		
		// Num Lock
		// keys[144]
		
		// Scroll Lock
		// keys[145]
	}

	function punctuation() {
		// Semi-colon
		keys[186].normal = function(){PD.selected.print(';')};
		keys[186].shift = function(){PD.selected.print(':')};
		
		// Equals
		keys[187].normal = function(){PD.selected.print('=')};
		keys[187].shift = function(){PD.selected.print('+')};
		
		// Comma
		keys[188].normal = function(){PD.selected.print(',')};
		keys[188].shift = function(){PD.selected.print('<')};
		
		// Hyphen
		keys[189].normal = function(){PD.selected.print('-')};
		keys[189].shift = function(){PD.selected.print('_')};
		
		// Full Stop
		keys[190].normal = function(){PD.selected.print('.')};
		keys[190].shift = function(){PD.selected.print('>')};
		
		// Forward Slash
		keys[191].normal = function(){PD.selected.print('/')};
		keys[191].shift = function(){PD.selected.print('?')};
		
		// Apostrophe
		keys[192].normal = function(){PD.selected.print('\'')};
		keys[192].shift = function(){PD.selected.print('@')};
		
		// Open Bracket
		keys[219].normal = function(){PD.selected.print('[')};
		keys[219].shift = function(){PD.selected.print('{')};
		
		// Back Slash
		keys[220].normal = function(){PD.selected.print('\\')};
		keys[220].shift = function(){PD.selected.print('|')};
		
		// Close Bracket
		keys[221].normal = function(){PD.selected.print(']')};
		keys[221].shift = function(){PD.selected.print('}')};
		
		// Hash
		keys[222].normal = function(){PD.selected.print('#')};
		keys[222].shift = function(){PD.selected.print('~')};
	}

	function alphaNumeric() {
		keys[48].normal = function(){PD.selected.print('0')};
		keys[48].shift = function(){PD.selected.print(')')};
		
		keys[49].normal = function(){PD.selected.print('1')};
		keys[49].shift = function(){PD.selected.print('!')};
		keys[49].alt = function(){alphaNumeric()};
		
		keys[50].normal = function(){PD.selected.print('2')};
		keys[50].shift = function(){PD.selected.print('"')};
		keys[50].alt = function(){greek()};
		
		keys[51].normal = function(){PD.selected.print('3')};
		keys[51].shift = function(){PD.selected.print('\u00A3')};
		
		keys[52].normal = function(){PD.selected.print('4')};
		keys[52].shift = function(){PD.selected.print('$')};
		
		keys[53].normal = function(){PD.selected.print('5')};
		keys[53].shift = function(){PD.selected.print('%')};
		
		keys[54].normal = function(){PD.selected.print('6')};
		keys[54].shift = function(){PD.selected.print('^')};
		
		keys[55].normal = function(){PD.selected.print('7')};
		keys[55].shift = function(){PD.selected.print('&')};
		
		keys[56].normal = function(){PD.selected.print('8')};
		keys[56].shift = function(){PD.selected.print('*')};
		
		keys[57].normal = function(){PD.selected.print('9')};
		keys[57].shift = function(){PD.selected.print('(')};
		
		// A to Z
		keys[65].normal = function(){PD.selected.print('a')};
		keys[65].shift = function(){PD.selected.print('A')};
		
		keys[66].normal = function(){PD.selected.print('b')};
		keys[66].shift = function(){PD.selected.print('B')};
		
		keys[67].normal = function(){PD.selected.print('c')};
		keys[67].shift = function(){PD.selected.print('C')};
		
		keys[68].normal = function(){PD.selected.print('d')};
		keys[68].shift = function(){PD.selected.print('D')};
		
		keys[69].normal = function(){PD.selected.print('e')};
		keys[69].shift = function(){PD.selected.print('E')};
		
		keys[70].normal = function(){PD.selected.print('f')};
		keys[70].shift = function(){PD.selected.print('F')};
		
		keys[71].normal = function(){PD.selected.print('g')};
		keys[71].shift = function(){PD.selected.print('G')};
		
		keys[72].normal = function(){PD.selected.print('h')};
		keys[72].shift = function(){PD.selected.print('H')};
		
		keys[73].normal = function(){PD.selected.print('i')};
		keys[73].shift = function(){PD.selected.print('I')};
		
		keys[74].normal = function(){PD.selected.print('j')};
		keys[74].shift = function(){PD.selected.print('J')};
		
		keys[75].normal = function(){PD.selected.print('k')};
		keys[75].shift = function(){PD.selected.print('K')};
		
		keys[76].normal = function(){PD.selected.print('l')};
		keys[76].shift = function(){PD.selected.print('L')};
		
		keys[77].normal = function(){PD.selected.print('m')};
		keys[77].shift = function(){PD.selected.print('M')};
		
		keys[78].normal = function(){PD.selected.print('n')};
		keys[78].shift = function(){PD.selected.print('N')};
		
		keys[79].normal = function(){PD.selected.print('o')};
		keys[79].shift = function(){PD.selected.print('O')};
		
		keys[80].normal = function(){PD.selected.print('p')};
		keys[80].shift = function(){PD.selected.print('P')};
		
		keys[81].normal = function(){PD.selected.print('q')};
		keys[81].shift = function(){PD.selected.print('Q')};
		
		keys[82].normal = function(){PD.selected.print('r')};
		keys[82].shift = function(){PD.selected.print('R')};
		
		keys[83].normal = function(){PD.selected.print('s')};
		keys[83].shift = function(){PD.selected.print('S')};
		keys[83].ctrl = function(){PD.save()};
		
		keys[84].normal = function(){PD.selected.print('t')};
		keys[84].shift = function(){PD.selected.print('T')};
		
		keys[85].normal = function(){PD.selected.print('u')};
		keys[85].shift = function(){PD.selected.print('U')};
		
		keys[86].normal = function(){PD.selected.print('v')};
		keys[86].shift = function(){PD.selected.print('V')};
		
		keys[87].normal = function(){PD.selected.print('w')};
		keys[87].shift = function(){PD.selected.print('W')};
		
		keys[88].normal = function(){PD.selected.print('x')};
		keys[88].shift = function(){PD.selected.print('X')};
		
		keys[89].normal = function(){PD.selected.print('y')};
		keys[89].shift = function(){PD.selected.print('Y')};
		
		keys[90].normal = function(){PD.selected.print('z')};
		keys[90].shift = function(){PD.selected.print('Z')};
	}

	function capsLockBindings() {
		keys[65].shift = function(){PD.selected.print('a')};
		keys[65].normal = function(){PD.selected.print('A')};
		
		keys[66].shift = function(){PD.selected.print('b')};
		keys[66].normal = function(){PD.selected.print('B')};
		
		keys[67].shift = function(){PD.selected.print('c')};
		keys[67].normal = function(){PD.selected.print('C')};
		
		keys[68].shift = function(){PD.selected.print('d')};
		keys[68].normal = function(){PD.selected.print('D')};
		
		keys[69].shift = function(){PD.selected.print('e')};
		keys[69].normal = function(){PD.selected.print('E')};
		
		keys[70].shift = function(){PD.selected.print('f')};
		keys[70].normal = function(){PD.selected.print('F')};
		
		keys[71].shift = function(){PD.selected.print('g')};
		keys[71].normal = function(){PD.selected.print('G')};
		
		keys[72].shift = function(){PD.selected.print('h')};
		keys[72].normal = function(){PD.selected.print('H')};
		
		keys[73].shift = function(){PD.selected.print('i')};
		keys[73].normal = function(){PD.selected.print('I')};
		
		keys[74].shift = function(){PD.selected.print('j')};
		keys[74].normal = function(){PD.selected.print('J')};
		
		keys[75].shift = function(){PD.selected.print('k')};
		keys[75].normal = function(){PD.selected.print('K')};
		
		keys[76].shift = function(){PD.selected.print('l')};
		keys[76].normal = function(){PD.selected.print('L')};
		
		keys[77].shift = function(){PD.selected.print('m')};
		keys[77].normal = function(){PD.selected.print('M')};
		
		keys[78].shift = function(){PD.selected.print('n')};
		keys[78].normal = function(){PD.selected.print('N')};
		
		keys[79].shift = function(){PD.selected.print('o')};
		keys[79].normal = function(){PD.selected.print('O')};
		
		keys[80].shift = function(){PD.selected.print('p')};
		keys[80].normal = function(){PD.selected.print('P')};
		
		keys[81].shift = function(){PD.selected.print('q')};
		keys[81].normal = function(){PD.selected.print('Q')};
		
		keys[82].shift = function(){PD.selected.print('r')};
		keys[82].normal = function(){PD.selected.print('R')};
		
		keys[83].shift = function(){PD.selected.print('s')};
		keys[83].normal = function(){PD.selected.print('S')};
		
		keys[84].shift = function(){PD.selected.print('t')};
		keys[84].normal = function(){PD.selected.print('T')};
		
		keys[85].shift = function(){PD.selected.print('u')};
		keys[85].normal = function(){PD.selected.print('U')};
		
		keys[86].shift = function(){PD.selected.print('v')};
		keys[86].normal = function(){PD.selected.print('V')};
		
		keys[87].shift = function(){PD.selected.print('w')};
		keys[87].normal = function(){PD.selected.print('W')};
		
		keys[88].shift = function(){PD.selected.print('x')};
		keys[88].normal = function(){PD.selected.print('X')};
		
		keys[89].shift = function(){PD.selected.print('y')};
		keys[89].normal = function(){PD.selected.print('Y')};
		
		keys[90].shift = function(){PD.selected.print('z')};
		keys[90].normal = function(){PD.selected.print('Z')};
	}
	
	function greek() {
		// Alpha
		keys[65].normal = function(){PD.selected.print('\u03b1')};
		keys[65].shift = function(){PD.selected.print('\u0391')};
		
		// Beta
		keys[66].normal = function(){PD.selected.print('\u03b2')};
		keys[66].shift = function(){PD.selected.print('\u0392')};
		
		// Psi
		keys[67].normal = function(){PD.selected.print('\u03c7')};
		keys[67].shift = function(){PD.selected.print('\u03a7')};
		
		// Delta
		keys[68].normal = function(){PD.selected.print('\u03b4')};
		keys[68].shift = function(){PD.selected.print('\u0394')};
		
		// Epsilon
		keys[69].normal = function(){PD.selected.print('\u03b5')};
		keys[69].shift = function(){PD.selected.print('\u0395')};
		
		// Phi
		keys[70].normal = function(){PD.selected.print('\u03c5')};
		keys[70].shift = function(){PD.selected.print('\u03a5')};
		
		// Gammma
		keys[71].normal = function(){PD.selected.print('\u03b3')};
		keys[71].shift = function(){PD.selected.print('\u0393')};
		
		// Eta
		keys[72].normal = function(){PD.selected.print('\u03b7')};
		keys[72].shift = function(){PD.selected.print('\u0397')};
		
		// Iota
		keys[73].normal = function(){PD.selected.print('\u03b9')};
		keys[73].shift = function(){PD.selected.print('\u0399')};
		
		// Xi
		keys[74].normal = function(){PD.selected.print('\u03be')};
		keys[74].shift = function(){PD.selected.print('\u039e')};
		
		// Kappa
		keys[75].normal = function(){PD.selected.print('\u03ba')};
		keys[75].shift = function(){PD.selected.print('\u039a')};
		
		// Lambda
		keys[76].normal = function(){PD.selected.print('\u03bb')};
		keys[76].shift = function(){PD.selected.print('\u039b')};
		
		// Mu
		keys[77].normal = function(){PD.selected.print('\u03bc')};
		keys[77].shift = function(){PD.selected.print('\u039c')};
		
		// Nu
		keys[78].normal = function(){PD.selected.print('\u03bd')};
		keys[78].shift = function(){PD.selected.print('\u039d')};
		
		// Omicron
		keys[79].normal = function(){PD.selected.print('\u03bf')};
		keys[79].shift = function(){PD.selected.print('\u039f')};
		
		// Pi
		keys[80].normal = function(){PD.selected.print('\u03c0')};
		keys[80].shift = function(){PD.selected.print('\u03a0')};
		
		keys[81].normal = function(){doNothing()};
		keys[81].shift = function(){doNothing()};
		
		// Rho
		keys[82].normal = function(){PD.selected.print('\u03c1')};
		keys[82].shift = function(){PD.selected.print('\u03a1')};
		
		// Sigma
		keys[83].normal = function(){PD.selected.print('\u03c2')};
		keys[83].shift = function(){PD.selected.print('\u03a3')};
		
		// Tau
		keys[84].normal = function(){PD.selected.print('\u03c3')};
		keys[84].shift = function(){PD.selected.print('\u0393')};
		
		// Theta
		keys[85].normal = function(){PD.selected.print('\u03b8')};
		keys[85].shift = function(){PD.selected.print('\u0398')};
		
		// Omega
		keys[86].normal = function(){PD.selected.print('\u03c8')};
		keys[86].shift = function(){PD.selected.print('\u03a8')};
		
		keys[87].normal = function(){doNothing()};
		keys[87].shift = function(){doNothing()};
		
		// Chi
		keys[88].normal = function(){PD.selected.print('\u03c6')};
		keys[88].shift = function(){PD.selected.print('\u03a6')};
		
		// Upsilon
		keys[89].normal = function(){PD.selected.print('\u03c4')};
		keys[89].shift = function(){PD.selected.print('\u03a4')};
		
		// Zeta
		keys[90].normal = function(){PD.selected.print('\u03b6')};
		keys[90].shift = function(){PD.selected.print('\u0396')};
	}
	
	resetTextBindings = function() {
		// I wonder if I could do this with a for loop lol
		keys[48].normal = function(){doNothing()};
		keys[48].shift = function(){doNothing()};
		keys[49].normal = function(){doNothing()};
		keys[49].shift = function(){doNothing()};
		keys[50].normal = function(){doNothing()};
		keys[50].shift = function(){doNothing()};
		keys[51].normal = function(){doNothing()};
		keys[51].shift = function(){doNothing()};
		keys[52].normal = function(){doNothing()};
		keys[52].shift = function(){doNothing()};
		keys[53].normal = function(){doNothing()};
		keys[53].shift = function(){doNothing()};
		keys[54].normal = function(){doNothing()};
		keys[54].shift = function(){doNothing()};
		keys[55].normal = function(){doNothing()};
		keys[55].shift = function(){doNothing()};
		keys[56].normal = function(){doNothing()};
		keys[56].shift = function(){doNothing()};
		keys[57].normal = function(){doNothing()};
		keys[57].shift = function(){doNothing()};
		keys[65].normal = function(){doNothing()};
		keys[65].shift = function(){doNothing()};
		keys[66].normal = function(){doNothing()};
		keys[66].shift = function(){doNothing()};
		keys[67].normal = function(){doNothing()};
		keys[67].shift = function(){doNothing()};
		keys[68].normal = function(){doNothing()};
		keys[68].shift = function(){doNothing()};
		keys[69].normal = function(){doNothing()};
		keys[69].shift = function(){doNothing()};
		keys[70].normal = function(){doNothing()};
		keys[70].shift = function(){doNothing()};
		keys[71].normal = function(){doNothing()};
		keys[71].shift = function(){doNothing()};
		keys[72].normal = function(){doNothing()};
		keys[72].shift = function(){doNothing()};
		keys[73].normal = function(){doNothing()};
		keys[73].shift = function(){doNothing()};
		keys[74].normal = function(){doNothing()};
		keys[74].shift = function(){doNothing()};
		keys[75].normal = function(){doNothing()};
		keys[75].shift = function(){doNothing()};
		keys[76].normal = function(){doNothing()};
		keys[76].shift = function(){doNothing()};
		keys[77].normal = function(){doNothing()};
		keys[77].shift = function(){doNothing()};
		keys[78].normal = function(){doNothing()};
		keys[78].shift = function(){doNothing()};
		keys[79].normal = function(){doNothing()};
		keys[79].shift = function(){doNothing()};
		keys[80].normal = function(){doNothing()};
		keys[80].shift = function(){doNothing()};
		keys[81].normal = function(){doNothing()};
		keys[81].shift = function(){doNothing()};
		keys[82].normal = function(){doNothing()};
		keys[82].shift = function(){doNothing()};
		keys[83].normal = function(){doNothing()};
		keys[83].shift = function(){doNothing()};
		keys[84].normal = function(){doNothing()};
		keys[84].shift = function(){doNothing()};
		keys[85].normal = function(){doNothing()};
		keys[85].shift = function(){doNothing()};
		keys[86].normal = function(){doNothing()};
		keys[86].shift = function(){doNothing()};
		keys[87].normal = function(){doNothing()};
		keys[87].shift = function(){doNothing()};
		keys[88].normal = function(){doNothing()};
		keys[88].shift = function(){doNothing()};
		keys[89].normal = function(){doNothing()};
		keys[89].shift = function(){doNothing()};
		keys[90].normal = function(){doNothing()};
		keys[90].shift = function(){doNothing()};
		keys[186].normal = function(){doNothing()};
		keys[186].shift = function(){doNothing()};
		keys[187].normal = function(){doNothing()};
		keys[187].shift = function(){doNothing()};
		keys[188].normal = function(){doNothing()};
		keys[188].shift = function(){doNothing()};
		keys[189].normal = function(){doNothing()};
		keys[189].shift = function(){doNothing()};
		keys[190].normal = function(){doNothing()};
		keys[190].shift = function(){doNothing()};
		keys[191].normal = function(){doNothing()};
		keys[191].shift = function(){doNothing()};
		keys[192].normal = function(){doNothing()};
		keys[192].shift = function(){doNothing()};
		keys[219].normal = function(){doNothing()};
		keys[219].shift = function(){doNothing()};
		keys[220].normal = function(){doNothing()};
		keys[220].shift = function(){doNothing()};
		keys[221].normal = function(){doNothing()};
		keys[221].shift = function(){doNothing()};
		keys[222].normal = function(){doNothing()};
		keys[222].shift = function(){doNothing()};
		keys[8].normal = function(){doNothing()};
		keys[8].shift = function(){doNothing()};
		keys[9].normal = function(){doNothing()};
		keys[13].normal = function(){doNothing()};
		keys[13].shift = function(){doNothing()};
		keys[32].normal = function(){doNothing()};
		keys[32].shift = function(){doNothing()};
		keys[33].normal = function(){doNothing()};
		keys[34].normal = function(){doNothing()};
		keys[35].normal = function(){doNothing()};
		keys[36].normal = function(){doNothing()};
		keys[37].normal = function(){doNothing()};
		keys[38].normal = function(){doNothing()};
		keys[39].normal = function(){doNothing()};
		keys[40].normal = function(){doNothing()};
	}

	window.onkeydown = checkKey;

	function checkKey(e)
	{
		if (keys[e.keyCode].preventDefault)
		{
			e.preventDefault();
		}
		if (e.shiftKey && e.altKey && e.ctrlKey)
		{
			keys[e.keyCode].shiftAltCtrl();
			return;
		}
		if (e.shiftKey && e.altKey)
		{
			keys[e.keyCode].shiftAlt();
			return;
		}
		if (e.shiftKey && e.ctrlKey)
		{
			keys[e.keyCode].shiftCtrl();
			return;
		}
		if (e.altKey && e.ctrlKey)
		{
			keys[e.keyCode].altCtrl();
			return;
		}
		if (e.shiftKey)
		{
			keys[e.keyCode].shift();
			return;
		}
		if (e.altKey)
		{
			keys[e.keyCode].alt();
			return;
		}
		if (e.ctrlKey)
		{
			keys[e.keyCode].ctrl();
			return;
		}
		keys[e.keyCode].normal();
		return;
	}
})();