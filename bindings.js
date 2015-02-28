var bindings = {};

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

bindings.textEditor = function() {
	bindings.alphaNumericBindings();
	bindings.punctuation();
	bindings.control();
}

bindings.control = function() {
	// Backspace
	keys[8].normal = function(){selected.backspace()};
	keys[8].shift = function(){selected.backspace()};
	
	// Tab
	//keys[9] Needs thought
	
	// Enter
	keys[13].normal = function(){newLine()};
	
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
	keys[32].normal = function(){selected.print('\u00a0')};
	keys[32].shift = function(){selected.print('\u00a0')};
	
	// Page Up
	keys[33].normal = function(){pageUp()};
	
	// Page Down
	keys[34].normal = function(){pageDown()};
	
	// End
	keys[35].normal = function(){end()};
	
	// Home
	keys[36].normal = function(){home()};
	
	// Left Arrow
	keys[37].normal = function(){selected.cursorLeft()}; // moveCursor(-1, 0) was nice
	
	// Up Arrow
	keys[38].normal = function(){selected.cursorUp()}; // doesn't update. no blink.
	
	// Right Arrow
	keys[39].normal = function(){selected.cursorRight()};
	
	// Down Arrow
	keys[40].normal = function(){selected.cursorDown()};
	
	// Insert
	keys[45].normal = function(){selected.toggleInsertMode()};
	
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
	keys[112].normal = function(){activeBuffer=0};
	
	// F2
	keys[113].normal = function(){activeBuffer=1};
	
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

bindings.punctuation = function() {
	// Semi-colon
	keys[186].normal = function(){selected.print(';')};
	keys[186].shift = function(){selected.print(':')};
	
	// Equals
	keys[187].normal = function(){selected.print('=')};
	keys[187].shift = function(){selected.print('+')};
	
	// Comma
	keys[188].normal = function(){selected.print(',')};
	keys[188].shift = function(){selected.print('<')};
	
	// Hyphen
	keys[189].normal = function(){selected.print('-')};
	keys[189].shift = function(){selected.print('_')};
	
	// Full Stop
	keys[190].normal = function(){selected.print('.')};
	keys[190].shift = function(){selected.print('>')};
	
	// Forward Slash
	keys[191].normal = function(){selected.print('/')};
	keys[191].shift = function(){selected.print('?')};
	
	// Apostrophe
	keys[192].normal = function(){selected.print('\'')};
	keys[192].shift = function(){selected.print('@')};
	
	// Open Bracket
	keys[219].normal = function(){selected.print('[')};
	keys[219].shift = function(){selected.print('{')};
	
	// Back Slash
	keys[220].normal = function(){selected.print('\\')};
	keys[220].shift = function(){selected.print('|')};
	
	// Close Bracket
	keys[221].normal = function(){selected.print(']')};
	keys[221].shift = function(){selected.print('}')};
	
	// Hash
	keys[222].normal = function(){selected.print('#')};
	keys[222].shift = function(){selected.print('~')};
}

bindings.alphaNumericBindings = function() {
	capsLock = false;

	keys[48].normal = function(){selected.print('0')};
	keys[48].shift = function(){selected.print(')')};
	
	keys[49].normal = function(){selected.print('1')};
	keys[49].shift = function(){selected.print('!')};
	
	keys[50].normal = function(){selected.print('2')};
	keys[50].shift = function(){selected.print('"')};
	
	keys[51].normal = function(){selected.print('3')};
	keys[51].shift = function(){selected.print('\u00A3')};
	
	keys[52].normal = function(){selected.print('4')};
	keys[52].shift = function(){selected.print('$')};
	
	keys[53].normal = function(){selected.print('5')};
	keys[53].shift = function(){selected.print('%')};
	
	keys[54].normal = function(){selected.print('6')};
	keys[54].shift = function(){selected.print('^')};
	
	keys[55].normal = function(){selected.print('7')};
	keys[55].shift = function(){selected.print('&')};
	
	keys[56].normal = function(){selected.print('8')};
	keys[56].shift = function(){selected.print('*')};
	
	keys[57].normal = function(){selected.print('9')};
	keys[57].shift = function(){selected.print('(')};
	
	// A to Z
	keys[65].normal = function(){selected.print('a')};
	keys[65].shift = function(){selected.print('A')};
	
	keys[66].normal = function(){selected.print('b')};
	keys[66].shift = function(){selected.print('B')};
	
	keys[67].normal = function(){selected.print('c')};
	keys[67].shift = function(){selected.print('C')};
	
	keys[68].normal = function(){selected.print('d')};
	keys[68].shift = function(){selected.print('D')};
	
	keys[69].normal = function(){selected.print('e')};
	keys[69].shift = function(){selected.print('E')};
	
	keys[70].normal = function(){selected.print('f')};
	keys[70].shift = function(){selected.print('F')};
	
	keys[71].normal = function(){selected.print('g')};
	keys[71].shift = function(){selected.print('G')};
	
	keys[72].normal = function(){selected.print('h')};
	keys[72].shift = function(){selected.print('H')};
	
	keys[73].normal = function(){selected.print('i')};
	keys[73].shift = function(){selected.print('I')};
	
	keys[74].normal = function(){selected.print('j')};
	keys[74].shift = function(){selected.print('J')};
	
	keys[75].normal = function(){selected.print('k')};
	keys[75].shift = function(){selected.print('K')};
	
	keys[76].normal = function(){selected.print('l')};
	keys[76].shift = function(){selected.print('L')};
	
	keys[77].normal = function(){selected.print('m')};
	keys[77].shift = function(){selected.print('M')};
	
	keys[78].normal = function(){selected.print('n')};
	keys[78].shift = function(){selected.print('N')};
	
	keys[79].normal = function(){selected.print('o')};
	keys[79].shift = function(){selected.print('O')};
	
	keys[80].normal = function(){selected.print('p')};
	keys[80].shift = function(){selected.print('P')};
	
	keys[81].normal = function(){selected.print('q')};
	keys[81].shift = function(){selected.print('Q')};
	
	keys[82].normal = function(){selected.print('r')};
	keys[82].shift = function(){selected.print('R')};
	
	keys[83].normal = function(){selected.print('s')};
	keys[83].shift = function(){selected.print('S')};
	keys[83].ctrl = function(){save()};
	
	keys[84].normal = function(){selected.print('t')};
	keys[84].shift = function(){selected.print('T')};
	
	keys[85].normal = function(){selected.print('u')};
	keys[85].shift = function(){selected.print('U')};
	
	keys[86].normal = function(){selected.print('v')};
	keys[86].shift = function(){selected.print('V')};
	
	keys[87].normal = function(){selected.print('w')};
	keys[87].shift = function(){selected.print('W')};
	
	keys[88].normal = function(){selected.print('x')};
	keys[88].shift = function(){selected.print('X')};
	
	keys[89].normal = function(){selected.print('y')};
	keys[89].shift = function(){selected.print('Y')};
	
	keys[90].normal = function(){selected.print('z')};
	keys[90].shift = function(){selected.print('Z')};
}

bindings.capsLockBindings = function() {
	capsLock = true;

	keys[65].normal = function(){selected.print('A')};
	keys[66].normal = function(){selected.print('B')};
	keys[67].normal = function(){selected.print('C')};
	keys[68].normal = function(){selected.print('D')};
	keys[69].normal = function(){selected.print('E')};
	keys[70].normal = function(){selected.print('F')};
	keys[71].normal = function(){selected.print('G')};
	keys[72].normal = function(){selected.print('H')};
	keys[73].normal = function(){selected.print('I')};
	keys[74].normal = function(){selected.print('J')};
	keys[75].normal = function(){selected.print('K')};
	keys[76].normal = function(){selected.print('L')};
	keys[77].normal = function(){selected.print('M')};
	keys[78].normal = function(){selected.print('N')};
	keys[79].normal = function(){selected.print('O')};
	keys[80].normal = function(){selected.print('P')};
	keys[81].normal = function(){selected.print('Q')};
	keys[82].normal = function(){selected.print('R')};
	keys[83].normal = function(){selected.print('S')};
	keys[84].normal = function(){selected.print('T')};
	keys[85].normal = function(){selected.print('U')};
	keys[86].normal = function(){selected.print('V')};
	keys[87].normal = function(){selected.print('W')};
	keys[88].normal = function(){selected.print('X')};
	keys[89].normal = function(){selected.print('Y')};
	keys[90].normal = function(){selected.print('Z')};
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