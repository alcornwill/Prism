var keys = [];

function key()
{
	this.normal = function(){fannyBlast()};
	this.shift = function(){fannyBlast()};
	this.alt = function(){fannyBlast()};
	this.ctrl = function(){fannyBlast()};
	this.shiftAlt = function(){fannyBlast()};
	this.shiftCtrl = function(){fannyBlast()};
	this.altCtrl = function(){fannyBlast()};
	this.shiftAltCtrl = function(){fannyBlast()};
	this.preventDefault = true
}

function initKeys()
{
	for (var i=0; i<=222; i++)
	{
		keys[i] = new key();
	}
}

function textEditorBindings()
{
	alphaNumericBindings();

	// Backspace
	keys[8].normal = function(){backspace()};
	keys[8].shift = function(){backspace()};
	
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
	keys[32].normal = function(){hPrint('\u00a0')};
	keys[32].shift = function(){hPrint('\u00a0')};
	
	// Page Up
	keys[33].normal = function(){pageUp()};
	
	// Page Down
	keys[34].normal = function(){pageDown()};
	
	// End
	keys[35].normal = function(){end()};
	
	// Home
	keys[36].normal = function(){home()};
	
	// Left Arrow
	keys[37].normal = function(){moveCursor(-1, 0)}; // Don't do this in real life
	
	// Up Arrow
	keys[38].normal = function(){moveCursor(0, -1)};
	
	// Right Arrow
	keys[39].normal = function(){moveCursor(1, 0)};
	
	// Down Arrow
	keys[40].normal = function(){moveCursor(0, 1)};
	
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
	
	// Semi-colon
	keys[186].normal = function(){hPrint(';')};
	keys[186].shift = function(){hPrint(':')};
	
	// Equals
	keys[187].normal = function(){hPrint('=')};
	keys[187].shift = function(){hPrint('+')};
	
	// Comma
	keys[188].normal = function(){hPrint(',')};
	keys[188].shift = function(){hPrint('<')};
	
	// Hyphen
	keys[189].normal = function(){hPrint('-')};
	keys[189].shift = function(){hPrint('_')};
	
	// Full Stop
	keys[190].normal = function(){hPrint('.')};
	keys[190].shift = function(){hPrint('>')};
	
	// Forward Slash
	keys[191].normal = function(){hPrint('/')};
	keys[191].shift = function(){hPrint('?')};
	
	// Apostrophe
	keys[192].normal = function(){hPrint('\'')};
	keys[192].shift = function(){hPrint('@')};
	
	// Open Bracket
	keys[219].normal = function(){hPrint('[')};
	keys[219].shift = function(){hPrint('{')};
	
	// Back Slash
	keys[220].normal = function(){hPrint('\\')};
	keys[220].shift = function(){hPrint('|')};
	
	// Close Bracket
	keys[221].normal = function(){hPrint(']')};
	keys[221].shift = function(){hPrint('}')};
	
	// Hash
	keys[222].normal = function(){hPrint('#')};
	keys[222].shift = function(){hPrint('~')};
}

function alphaNumericBindings()
{
	capsLock = false;

	keys[48].normal = function(){hPrint('0')};
	keys[48].shift = function(){hPrint(')')};
	
	keys[49].normal = function(){hPrint('1')};
	keys[49].shift = function(){hPrint('!')};
	
	keys[50].normal = function(){hPrint('2')};
	keys[50].shift = function(){hPrint('"')};
	
	keys[51].normal = function(){hPrint('3')};
	keys[51].shift = function(){hPrint('\u00A3')};
	
	keys[52].normal = function(){hPrint('4')};
	keys[52].shift = function(){hPrint('$')};
	
	keys[53].normal = function(){hPrint('5')};
	keys[53].shift = function(){hPrint('%')};
	
	keys[54].normal = function(){hPrint('6')};
	keys[54].shift = function(){hPrint('^')};
	
	keys[55].normal = function(){hPrint('7')};
	keys[55].shift = function(){hPrint('&')};
	
	keys[56].normal = function(){hPrint('8')};
	keys[56].shift = function(){hPrint('*')};
	
	keys[57].normal = function(){hPrint('9')};
	keys[57].shift = function(){hPrint('(')};
	
	// A to Z
	keys[65].normal = function(){hPrint('a')};
	keys[65].shift = function(){hPrint('A')};
	
	keys[66].normal = function(){hPrint('b')};
	keys[66].shift = function(){hPrint('B')};
	
	keys[67].normal = function(){hPrint('c')};
	keys[67].shift = function(){hPrint('C')};
	
	keys[68].normal = function(){hPrint('d')};
	keys[68].shift = function(){hPrint('D')};
	
	keys[69].normal = function(){hPrint('e')};
	keys[69].shift = function(){hPrint('E')};
	
	keys[70].normal = function(){hPrint('f')};
	keys[70].shift = function(){hPrint('F')};
	
	keys[71].normal = function(){hPrint('g')};
	keys[71].shift = function(){hPrint('G')};
	
	keys[72].normal = function(){hPrint('h')};
	keys[72].shift = function(){hPrint('H')};
	
	keys[73].normal = function(){hPrint('i')};
	keys[73].shift = function(){hPrint('I')};
	
	keys[74].normal = function(){hPrint('j')};
	keys[74].shift = function(){hPrint('J')};
	
	keys[75].normal = function(){hPrint('k')};
	keys[75].shift = function(){hPrint('K')};
	
	keys[76].normal = function(){hPrint('l')};
	keys[76].shift = function(){hPrint('L')};
	
	keys[77].normal = function(){hPrint('m')};
	keys[77].shift = function(){hPrint('M')};
	
	keys[78].normal = function(){hPrint('n')};
	keys[78].shift = function(){hPrint('N')};
	
	keys[79].normal = function(){hPrint('o')};
	keys[79].shift = function(){hPrint('O')};
	
	keys[80].normal = function(){hPrint('p')};
	keys[80].shift = function(){hPrint('P')};
	
	keys[81].normal = function(){hPrint('q')};
	keys[81].shift = function(){hPrint('Q')};
	
	keys[82].normal = function(){hPrint('r')};
	keys[82].shift = function(){hPrint('R')};
	
	keys[83].normal = function(){hPrint('s')};
	keys[83].shift = function(){hPrint('S')};
	keys[83].ctrl = function(){save()};
	
	keys[84].normal = function(){hPrint('t')};
	keys[84].shift = function(){hPrint('T')};
	
	keys[85].normal = function(){hPrint('u')};
	keys[85].shift = function(){hPrint('U')};
	
	keys[86].normal = function(){hPrint('v')};
	keys[86].shift = function(){hPrint('V')};
	
	keys[87].normal = function(){hPrint('w')};
	keys[87].shift = function(){hPrint('W')};
	
	keys[88].normal = function(){hPrint('x')};
	keys[88].shift = function(){hPrint('X')};
	
	keys[89].normal = function(){hPrint('y')};
	keys[89].shift = function(){hPrint('Y')};
	
	keys[90].normal = function(){hPrint('z')};
	keys[90].shift = function(){hPrint('Z')};
}

function capsLockBindings()
{
	capsLock = true;

	keys[65].normal = function(){hPrint('A')};
	keys[66].normal = function(){hPrint('B')};
	keys[67].normal = function(){hPrint('C')};
	keys[68].normal = function(){hPrint('D')};
	keys[69].normal = function(){hPrint('E')};
	keys[70].normal = function(){hPrint('F')};
	keys[71].normal = function(){hPrint('G')};
	keys[72].normal = function(){hPrint('H')};
	keys[73].normal = function(){hPrint('I')};
	keys[74].normal = function(){hPrint('J')};
	keys[75].normal = function(){hPrint('K')};
	keys[76].normal = function(){hPrint('L')};
	keys[77].normal = function(){hPrint('M')};
	keys[78].normal = function(){hPrint('N')};
	keys[79].normal = function(){hPrint('O')};
	keys[80].normal = function(){hPrint('P')};
	keys[81].normal = function(){hPrint('Q')};
	keys[82].normal = function(){hPrint('R')};
	keys[83].normal = function(){hPrint('S')};
	keys[84].normal = function(){hPrint('T')};
	keys[85].normal = function(){hPrint('U')};
	keys[86].normal = function(){hPrint('V')};
	keys[87].normal = function(){hPrint('W')};
	keys[88].normal = function(){hPrint('X')};
	keys[89].normal = function(){hPrint('Y')};
	keys[90].normal = function(){hPrint('Z')};
}
