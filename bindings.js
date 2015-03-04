// one bindings to many terminals.
var bindings = {}; // namespace

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

	bindings.initKeys = function() {
		for (var i=0; i<=222; i++)
		{
			keys[i] = new key();
		}
	}

	bindings.getCursor = function() {
		if (terminal.selected.__proto__.name==="EditableTextRegion") {
			return terminal.selected.subRegion[0];
		}
		else {
			return 0; // can I make this more better?
		}
	}
	
	bindings.observed=[];
	
	bindings.updateObserved = function() {
		if (!bindings.observed.length) {return}
		for (var i=0; i<bindings.observed.length; i++) {
			if (bindings.observed[i].hasChanged) {
				bindings.observed[i].update();
			}
		}
	};
	
	var toggleCapsLock = (function() {
		var capsLock=false;
		return function() {
			capsLock
			? (function() { alphaNumeric(); capsLock = false; })()
			: (function() { capsLockBindings(); capsLock = true; })();
		}
	})();
 
	bindings.insertMode=true;
	var toggleInsertMode = function () {
		var cursor=bindings.getCursor();
		bindings.insertMode
		? (function () {
			cursor.buffer[0]='_';
			bindings.insertMode=false; })() // bindings.startTimer()?
		: (function () {
			cursor.buffer[0]='\u2588';
			bindings.insertMode=true; })();
	};
	
	bindings.startTimer = (function() {
		var timer;
		function toggleCursor() {
			var cursor=bindings.getCursor();
			if (cursor) {
				cursor.visible
				? cursor.visible=false
				: cursor.visible=true;
				cursor.hasChanged=true;
				terminal.selected.hasChanged=true; // this is fucking stupid.
			}
		}
		return function() {
			clearInterval(timer);
			var cursor=bindings.getCursor();
			if (cursor) {
				cursor.visible=true;
			}
			timer=setInterval(toggleCursor, 350);
		};
	})();

	bindings.textEditor = function() {
		alphaNumeric();
		punctuation();
	}
	
	bindings.colourMode = "none";
	bindings.background = "none";
	bindings.underlined = false;
	bindings.bold = false;
	bindings.italics = false;
	
	bindings.toggleUnderlined = function() {
		bindings.underlined
		? bindings.underlined=false
		: bindings.underlined=true;
	}
	
	bindings.toggleBold = function() {
		bindings.bold
		? bindings.bold=false
		: bindings.bold=true;
	}
	
	bindings.toggleItalics = function() {
		bindings.italics
		? bindings.italics=false
		: bindings.italics=true;
	}
	
	bindings.metaButtonBindings = function() {
		keys[77].alt = function(){terminal.select("MetaButtonContextMenu")};
	}
	
	bindings.contextMenuBindings = function() {
		// really not sure about this
		resetTextBindings();
		keys[27].normal = function(){escape()};
		// more alt + letter bindings go here
		// cursor keys
	}
	
	bindings.control = function() {
		// Backspace
		keys[8].normal = function(){terminal.selected.backspace()};
		keys[8].shift = function(){terminal.selected.backspace()};
		
		// Tab
		keys[9].normal = function(){terminal.selected.print('\t')};
		
		// Enter
		keys[13].normal = function(){terminal.selected.print('\n')};
		keys[13].shift = function(){terminal.selected.print('\n')};
		
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
		keys[32].normal = function(){terminal.selected.print(' ')};
		keys[32].shift = function(){terminal.selected.print(' ')};
		
		// Page Up
		keys[33].normal = function(){terminal.selected.pageUp()}; // not implemented until we do scroll
		
		// Page Down
		keys[34].normal = function(){terminal.selected.pageDown()};
		
		// End
		keys[35].normal = function(){terminal.selected.end()};
		
		// Home
		keys[36].normal = function(){terminal.selected.home()};
		
		// Left Arrow
		keys[37].normal = function(){terminal.selected.cursorLeft()};
		
		// Up Arrow
		keys[38].normal = function(){terminal.selected.cursorUp()};
		
		// Right Arrow
		keys[39].normal = function(){terminal.selected.cursorRight()};
		
		// Down Arrow
		keys[40].normal = function(){terminal.selected.cursorDown()};
		
		// Insert
		keys[45].normal = function(){toggleInsertMode()};
		
		// Delete
		// keys[46]
		
		// Left Meta
		// keys[91]
		
		// Right Meta
		// keys[92]
		
		// Select
		keys[93].normal = function(){select()}; // dunno lol

		// Numpad 0
		keys[96].normal = function(){bindings.colourMode="none"};

		// Numpad 1
		keys[97].normal = function(){bindings.colourMode="red"};
		
		// Numpad 2
		keys[98].normal = function(){bindings.colourMode="green"};
		
		// Numpad 3
		keys[99].normal = function(){bindings.toggleUnderlined()};
		
		// Numpad 4
		keys[100].normal = function(){bindings.toggleBold()}
		
		// Numpad 5
		keys[101].normal = function(){bindings.toggleItalics()};
		
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
		keys[112].normal = function(){terminal.activeBuffer=0; terminal.subRegion[0].hasChanged=true;};
		
		// F2
		keys[113].normal = function(){terminal.activeBuffer=1; terminal.subRegion[1].hasChanged=true;};
		
		// F3
		keys[114].normal = function(){runAlpha()};
		
		// F4
		// keys[115]
		
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
		keys[186].normal = function(){terminal.selected.print(';')};
		keys[186].shift = function(){terminal.selected.print(':')};
		
		// Equals
		keys[187].normal = function(){terminal.selected.print('=')};
		keys[187].shift = function(){terminal.selected.print('+')};
		
		// Comma
		keys[188].normal = function(){terminal.selected.print(',')};
		keys[188].shift = function(){terminal.selected.print('<')};
		
		// Hyphen
		keys[189].normal = function(){terminal.selected.print('-')};
		keys[189].shift = function(){terminal.selected.print('_')};
		
		// Full Stop
		keys[190].normal = function(){terminal.selected.print('.')};
		keys[190].shift = function(){terminal.selected.print('>')};
		
		// Forward Slash
		keys[191].normal = function(){terminal.selected.print('/')};
		keys[191].shift = function(){terminal.selected.print('?')};
		
		// Apostrophe
		keys[192].normal = function(){terminal.selected.print('\'')};
		keys[192].shift = function(){terminal.selected.print('@')};
		
		// Open Bracket
		keys[219].normal = function(){terminal.selected.print('[')};
		keys[219].shift = function(){terminal.selected.print('{')};
		
		// Back Slash
		keys[220].normal = function(){terminal.selected.print('\\')};
		keys[220].shift = function(){terminal.selected.print('|')};
		
		// Close Bracket
		keys[221].normal = function(){terminal.selected.print(']')};
		keys[221].shift = function(){terminal.selected.print('}')};
		
		// Hash
		keys[222].normal = function(){terminal.selected.print('#')};
		keys[222].shift = function(){terminal.selected.print('~')};
	}

	function alphaNumeric() {
		keys[48].normal = function(){terminal.selected.print('0')};
		keys[48].shift = function(){terminal.selected.print(')')};
		
		keys[49].normal = function(){terminal.selected.print('1')};
		keys[49].shift = function(){terminal.selected.print('!')};
		keys[49].alt = function(){alphaNumeric()};
		
		keys[50].normal = function(){terminal.selected.print('2')};
		keys[50].shift = function(){terminal.selected.print('"')};
		keys[50].alt = function(){greek()};
		
		keys[51].normal = function(){terminal.selected.print('3')};
		keys[51].shift = function(){terminal.selected.print('\u00A3')};
		
		keys[52].normal = function(){terminal.selected.print('4')};
		keys[52].shift = function(){terminal.selected.print('$')};
		
		keys[53].normal = function(){terminal.selected.print('5')};
		keys[53].shift = function(){terminal.selected.print('%')};
		
		keys[54].normal = function(){terminal.selected.print('6')};
		keys[54].shift = function(){terminal.selected.print('^')};
		
		keys[55].normal = function(){terminal.selected.print('7')};
		keys[55].shift = function(){terminal.selected.print('&')};
		
		keys[56].normal = function(){terminal.selected.print('8')};
		keys[56].shift = function(){terminal.selected.print('*')};
		
		keys[57].normal = function(){terminal.selected.print('9')};
		keys[57].shift = function(){terminal.selected.print('(')};
		
		// A to Z
		keys[65].normal = function(){terminal.selected.print('a')};
		keys[65].shift = function(){terminal.selected.print('A')};
		
		keys[66].normal = function(){terminal.selected.print('b')};
		keys[66].shift = function(){terminal.selected.print('B')};
		
		keys[67].normal = function(){terminal.selected.print('c')};
		keys[67].shift = function(){terminal.selected.print('C')};
		
		keys[68].normal = function(){terminal.selected.print('d')};
		keys[68].shift = function(){terminal.selected.print('D')};
		
		keys[69].normal = function(){terminal.selected.print('e')};
		keys[69].shift = function(){terminal.selected.print('E')};
		
		keys[70].normal = function(){terminal.selected.print('f')};
		keys[70].shift = function(){terminal.selected.print('F')};
		
		keys[71].normal = function(){terminal.selected.print('g')};
		keys[71].shift = function(){terminal.selected.print('G')};
		
		keys[72].normal = function(){terminal.selected.print('h')};
		keys[72].shift = function(){terminal.selected.print('H')};
		
		keys[73].normal = function(){terminal.selected.print('i')};
		keys[73].shift = function(){terminal.selected.print('I')};
		
		keys[74].normal = function(){terminal.selected.print('j')};
		keys[74].shift = function(){terminal.selected.print('J')};
		
		keys[75].normal = function(){terminal.selected.print('k')};
		keys[75].shift = function(){terminal.selected.print('K')};
		
		keys[76].normal = function(){terminal.selected.print('l')};
		keys[76].shift = function(){terminal.selected.print('L')};
		
		keys[77].normal = function(){terminal.selected.print('m')};
		keys[77].shift = function(){terminal.selected.print('M')};
		
		keys[78].normal = function(){terminal.selected.print('n')};
		keys[78].shift = function(){terminal.selected.print('N')};
		
		keys[79].normal = function(){terminal.selected.print('o')};
		keys[79].shift = function(){terminal.selected.print('O')};
		
		keys[80].normal = function(){terminal.selected.print('p')};
		keys[80].shift = function(){terminal.selected.print('P')};
		
		keys[81].normal = function(){terminal.selected.print('q')};
		keys[81].shift = function(){terminal.selected.print('Q')};
		
		keys[82].normal = function(){terminal.selected.print('r')};
		keys[82].shift = function(){terminal.selected.print('R')};
		
		keys[83].normal = function(){terminal.selected.print('s')};
		keys[83].shift = function(){terminal.selected.print('S')};
		keys[83].ctrl = function(){save()};
		
		keys[84].normal = function(){terminal.selected.print('t')};
		keys[84].shift = function(){terminal.selected.print('T')};
		
		keys[85].normal = function(){terminal.selected.print('u')};
		keys[85].shift = function(){terminal.selected.print('U')};
		
		keys[86].normal = function(){terminal.selected.print('v')};
		keys[86].shift = function(){terminal.selected.print('V')};
		
		keys[87].normal = function(){terminal.selected.print('w')};
		keys[87].shift = function(){terminal.selected.print('W')};
		
		keys[88].normal = function(){terminal.selected.print('x')};
		keys[88].shift = function(){terminal.selected.print('X')};
		
		keys[89].normal = function(){terminal.selected.print('y')};
		keys[89].shift = function(){terminal.selected.print('Y')};
		
		keys[90].normal = function(){terminal.selected.print('z')};
		keys[90].shift = function(){terminal.selected.print('Z')};
	}

	function capsLockBindings() {
		keys[65].shift = function(){terminal.selected.print('a')};
		keys[65].normal = function(){terminal.selected.print('A')};
		
		keys[66].shift = function(){terminal.selected.print('b')};
		keys[66].normal = function(){terminal.selected.print('B')};
		
		keys[67].shift = function(){terminal.selected.print('c')};
		keys[67].normal = function(){terminal.selected.print('C')};
		
		keys[68].shift = function(){terminal.selected.print('d')};
		keys[68].normal = function(){terminal.selected.print('D')};
		
		keys[69].shift = function(){terminal.selected.print('e')};
		keys[69].normal = function(){terminal.selected.print('E')};
		
		keys[70].shift = function(){terminal.selected.print('f')};
		keys[70].normal = function(){terminal.selected.print('F')};
		
		keys[71].shift = function(){terminal.selected.print('g')};
		keys[71].normal = function(){terminal.selected.print('G')};
		
		keys[72].shift = function(){terminal.selected.print('h')};
		keys[72].normal = function(){terminal.selected.print('H')};
		
		keys[73].shift = function(){terminal.selected.print('i')};
		keys[73].normal = function(){terminal.selected.print('I')};
		
		keys[74].shift = function(){terminal.selected.print('j')};
		keys[74].normal = function(){terminal.selected.print('J')};
		
		keys[75].shift = function(){terminal.selected.print('k')};
		keys[75].normal = function(){terminal.selected.print('K')};
		
		keys[76].shift = function(){terminal.selected.print('l')};
		keys[76].normal = function(){terminal.selected.print('L')};
		
		keys[77].shift = function(){terminal.selected.print('m')};
		keys[77].normal = function(){terminal.selected.print('M')};
		
		keys[78].shift = function(){terminal.selected.print('n')};
		keys[78].normal = function(){terminal.selected.print('N')};
		
		keys[79].shift = function(){terminal.selected.print('o')};
		keys[79].normal = function(){terminal.selected.print('O')};
		
		keys[80].shift = function(){terminal.selected.print('p')};
		keys[80].normal = function(){terminal.selected.print('P')};
		
		keys[81].shift = function(){terminal.selected.print('q')};
		keys[81].normal = function(){terminal.selected.print('Q')};
		
		keys[82].shift = function(){terminal.selected.print('r')};
		keys[82].normal = function(){terminal.selected.print('R')};
		
		keys[83].shift = function(){terminal.selected.print('s')};
		keys[83].normal = function(){terminal.selected.print('S')};
		
		keys[84].shift = function(){terminal.selected.print('t')};
		keys[84].normal = function(){terminal.selected.print('T')};
		
		keys[85].shift = function(){terminal.selected.print('u')};
		keys[85].normal = function(){terminal.selected.print('U')};
		
		keys[86].shift = function(){terminal.selected.print('v')};
		keys[86].normal = function(){terminal.selected.print('V')};
		
		keys[87].shift = function(){terminal.selected.print('w')};
		keys[87].normal = function(){terminal.selected.print('W')};
		
		keys[88].shift = function(){terminal.selected.print('x')};
		keys[88].normal = function(){terminal.selected.print('X')};
		
		keys[89].shift = function(){terminal.selected.print('y')};
		keys[89].normal = function(){terminal.selected.print('Y')};
		
		keys[90].shift = function(){terminal.selected.print('z')};
		keys[90].normal = function(){terminal.selected.print('Z')};
	}
	
	function greek() {
		// Alpha
		keys[65].normal = function(){terminal.selected.print('\u03b1')};
		keys[65].shift = function(){terminal.selected.print('\u0391')};
		
		// Beta
		keys[66].normal = function(){terminal.selected.print('\u03b2')};
		keys[66].shift = function(){terminal.selected.print('\u0392')};
		
		// Psi
		keys[67].normal = function(){terminal.selected.print('\u03c7')};
		keys[67].shift = function(){terminal.selected.print('\u03a7')};
		
		// Delta
		keys[68].normal = function(){terminal.selected.print('\u03b4')};
		keys[68].shift = function(){terminal.selected.print('\u0394')};
		
		// Epsilon
		keys[69].normal = function(){terminal.selected.print('\u03b5')};
		keys[69].shift = function(){terminal.selected.print('\u0395')};
		
		// Phi
		keys[70].normal = function(){terminal.selected.print('\u03c5')};
		keys[70].shift = function(){terminal.selected.print('\u03a5')};
		
		// Gammma
		keys[71].normal = function(){terminal.selected.print('\u03b3')};
		keys[71].shift = function(){terminal.selected.print('\u0393')};
		
		// Eta
		keys[72].normal = function(){terminal.selected.print('\u03b7')};
		keys[72].shift = function(){terminal.selected.print('\u0397')};
		
		// Iota
		keys[73].normal = function(){terminal.selected.print('\u03b9')};
		keys[73].shift = function(){terminal.selected.print('\u0399')};
		
		// Xi
		keys[74].normal = function(){terminal.selected.print('\u03be')};
		keys[74].shift = function(){terminal.selected.print('\u039e')};
		
		// Kappa
		keys[75].normal = function(){terminal.selected.print('\u03ba')};
		keys[75].shift = function(){terminal.selected.print('\u039a')};
		
		// Lambda
		keys[76].normal = function(){terminal.selected.print('\u03bb')};
		keys[76].shift = function(){terminal.selected.print('\u039b')};
		
		// Mu
		keys[77].normal = function(){terminal.selected.print('\u03bc')};
		keys[77].shift = function(){terminal.selected.print('\u039c')};
		
		// Nu
		keys[78].normal = function(){terminal.selected.print('\u03bd')};
		keys[78].shift = function(){terminal.selected.print('\u039d')};
		
		// Omicron
		keys[79].normal = function(){terminal.selected.print('\u03bf')};
		keys[79].shift = function(){terminal.selected.print('\u039f')};
		
		// Pi
		keys[80].normal = function(){terminal.selected.print('\u03c0')};
		keys[80].shift = function(){terminal.selected.print('\u03a0')};
		
		keys[81].normal = function(){doNothing()};
		keys[81].shift = function(){doNothing()};
		
		// Rho
		keys[82].normal = function(){terminal.selected.print('\u03c1')};
		keys[82].shift = function(){terminal.selected.print('\u03a1')};
		
		// Sigma
		keys[83].normal = function(){terminal.selected.print('\u03c2')};
		keys[83].shift = function(){terminal.selected.print('\u03a3')};
		
		// Tau
		keys[84].normal = function(){terminal.selected.print('\u03c3')};
		keys[84].shift = function(){terminal.selected.print('\u0393')};
		
		// Theta
		keys[85].normal = function(){terminal.selected.print('\u03b8')};
		keys[85].shift = function(){terminal.selected.print('\u0398')};
		
		// Omega
		keys[86].normal = function(){terminal.selected.print('\u03c8')};
		keys[86].shift = function(){terminal.selected.print('\u03a8')};
		
		keys[87].normal = function(){doNothing()};
		keys[87].shift = function(){doNothing()};
		
		// Chi
		keys[88].normal = function(){terminal.selected.print('\u03c6')};
		keys[88].shift = function(){terminal.selected.print('\u03a6')};
		
		// Upsilon
		keys[89].normal = function(){terminal.selected.print('\u03c4')};
		keys[89].shift = function(){terminal.selected.print('\u03a4')};
		
		// Zeta
		keys[90].normal = function(){terminal.selected.print('\u03b6')};
		keys[90].shift = function(){terminal.selected.print('\u0396')};
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