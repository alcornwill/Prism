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

	function initKeys() {
		for (var i=0; i<=222; i++)
		{
			keys[i] = new key();
		}
	}

	bindings.initKeys = initKeys;
	
	function textEditor() {
		alphaNumeric();
		punctuation();
		control();
	}
	
	bindings.textEditor = textEditor;

	var toggleCapsLock = (function() {
		var capsLock=false;
		return function() {
			capsLock
			? (function() { alphaNumeric(); capsLock = false; })()
			: (function() { capsLockBindings(); capsLock = true; })();
		}
	})();
 
	var toggleInsertMode= (function () {
		var insertMode=true;
		return function () {
			var cursor=terminal.getCursor();
			insertMode
			? (function () {
				cursor.buffer[0]='_';
				insertMode=false; })() // terminal.startTimer()?
			: (function () {
				cursor.buffer[0]='\u2588';
				insertMode=true; })();
		};
	})();

	function control() {
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
		keys[32].normal = function(){terminal.selected.print('\u00a0')};
		keys[32].shift = function(){terminal.selected.print('\u00a0')};
		
		// Page Up
		keys[33].normal = function(){pageUp()};
		
		// Page Down
		keys[34].normal = function(){pageDown()};
		
		// End
		keys[35].normal = function(){terminal.selected.end()};
		
		// Home
		keys[36].normal = function(){terminal.selected.home()};
		
		// Left Arrow
		keys[37].normal = function(){terminal.selected.cursorLeft()}; // moveCursor(-1, 0) was nice
		
		// Up Arrow
		keys[38].normal = function(){terminal.selected.cursorUp()}; // doesn't update.
		
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
		keys[93].normal = function(){select()};

		// Numpad 0
		// keys[96]

		// Numpad 1
		// keys[97]
		
		// Numpad 2
		// keys[98]
		
		// Numpad 3
		// keys[99]
		
		// Numpad 4
		// keys[100]
		
		// Numpad 5
		// keys[101]
		
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
		keys[112].normal = function(){terminal.activeBuffer=0; terminal.reDraw();};
		
		// F2
		keys[113].normal = function(){terminal.activeBuffer=1; terminal.reDraw();};
		
		// F3
		// keys[114]
		
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
		// keys[122]
		
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
		
		keys[50].normal = function(){terminal.selected.print('2')};
		keys[50].shift = function(){terminal.selected.print('"')};
		
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