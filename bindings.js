// I think I might end up with a million of these but this is first iteration.

PD.unBoundKeys = [];
PD.terminalKeys = [];
PD.desktopKeys = [];

// composed keySet gets updated every time we setBindings.
// it is made of terminalKeys and desktopKeys.
PD.composedKeySet = [];

PD.activeKeySet = [];

PD.key = function() {
	this.normal = function(){doNothing()};
	this.shift = function(){doNothing()};
	this.alt = function(){doNothing()};
	this.ctrl = function(){doNothing()};
	this.shiftAlt = function(){doNothing()};
	this.shiftCtrl = function(){doNothing()};
	this.altCtrl = function(){doNothing()};
	this.shiftAltCtrl = function(){doNothing()};
	this.preventDefault = true;
	this.unBound = true;
};

PD.initKeys = function() {
	var unBoundKey = new PD.key();
	for (var i=0; i<=222; i++)
		PD.unBoundKeys[i] = unBoundKey;
	// This is shit but don't want activeKeySet to loose reference to composedKey
	for (var i=0; i<=222; i++)
		PD.composedKeySet[i] = unBoundKey;
	PD.terminalKeys = PD.createKeySet([]);
	PD.desktopKeys = PD.createKeySet([]);
	PD.activeKeySet = PD.composedKeySet;
};

PD.createKeySet = function(bindings) {
	// set all default keys to the unbound key object.
	var keySet = PD.unBoundKeys.slice();	
	for (var i=0; i<bindings.length; i++) {
		var binding = bindings[i];
		keySet[binding[0]] = {};
		PD.setBinding(binding, keySet);
	}
	// copy over terminal key set
	for (var i=0; i<PD.terminalKeys.length; i++)
		if (!PD.terminalKeys[i].unBound)
			keySet[i] = PD.terminalKeys[i];
	
	return keySet;
};

PD.setBindings = function(bindings, keySet) {
	for (var i=0; i<bindings.length; i++)
		PD.setBinding(bindings[i], keySet);
};

PD.setBinding = function(binding, keySet) {
	var keyCode = binding[0];
	var modifier = binding[1];
	var action = binding[2];
	
	// might do instanceOf unBoundKey instead
	// not right because should be if terminalKeys.modifier is not doNothing
	// I suppose if we put doNothing in a new object...

	var newKey = new PD.key();
	keySet[keyCode].unBound
	? newKey.unBound = false
	// not a new key at all
	: newKey = keySet[keyCode];
	
	switch(modifier) {
		case "normal":
			newKey.normal = action;
			break;
		case "shift":
			newKey.shift = action;
			break;
		case "alt":
			newKey.alt = action;
			break;
		case "ctrl":
			newKey.ctrl = action;
			break;
		case "shiftAlt":
			newKey.shiftAlt = action;
			break;
		case "shiftCtrl":
			newKey.shiftCtrl = action;
			break;
		case "altCtrl":
			newKey.altCtrl = action;
			break;
		case "shiftAltCtrl":
			newKey.shiftAltCtrl = action;
			break;
		case "preventDefault":
			newKey.preventDefault = action;
			break;
	}
	
	// equals itself why
	keySet[keyCode] = newKey;
	
	// Do we need to do this here?
	PD.updateComposedKeySet();
};

PD.updateComposedKeySet = function() {
	// write desktop, then overwrite with terminal?
	for (var i=0; i<PD.desktopKeys.length; i++)
		if (!PD.desktopKeys[i].unBound)
			PD.composedKeySet[i] = PD.desktopKeys[i];
	for (var i=0; i<PD.terminalKeys.length; i++)
		if (!PD.terminalKeys[i].unBound)
			PD.composedKeySet[i] = PD.terminalKeys[i];
}

PD.otherTextEditorBindings = function(that) {
	return [
		// Backspace
		[8, "normal", function(){that.backspace()}],
		[8, "shift", function(){that.backspace()}],
		
		// Tab
		[9, "normal", function(){that.print('\t')}],
		
		// Enter
		[13, "normal", function(){that.print('\r\n')}],
		[13, "shift", function(){that.print('\r\n')}],

		// Caps Lock
		[20, "normal", function(){that.toggleCapsLock()}],
		
		// Space
		[32, "normal", function(){that.print(' ')}],
		[32, "shift", function(){that.print(' ')}],
		
		// Page Up
		[33, "normal", function(){that.pageUp()}], // not implemented until we do scroll
		
		// Page Down
		[34, "normal", function(){that.pageDown()}],
		
		// End
		[35, "normal", function(){that.end()}],
		
		// Home
		[36, "normal", function(){that.home()}],
		
		// Left Arrow
		[37, "normal", function(){that.cursorLeft()}],
		
		// Up Arrow
		[38, "normal", function(){that.cursorUp()}],
		
		// Right Arrow
		[39, "normal", function(){that.cursorRight()}],
		
		// Down Arrow
		[40, "normal", function(){that.cursorDown()}],
		
		// Insert
		[45, "normal", function(){that.toggleInsertMode()}],

		// Delete
		[46, "normal", function(){that.deleteKey()}],

		// Numpad 0
		[96, "normal", function(){PD.colourMode="black"}],

		// Numpad 1
		[97, "normal", function(){PD.colourMode="red"}],
		
		// Numpad 2
		[98, "normal", function(){PD.colourMode="green"}],
		
		// Numpad 3
		[99, "normal", function(){PD.toggleUnderlined()}],
		
		// Numpad 4
		[100, "normal", function(){PD.toggleBold()}],
		
		// Numpad 5
		[101, "normal", function(){PD.toggleItalics()}],
		
		// Semi-colon
		[186, "normal", function(){that.print(';')}],
		[186, "shift", function(){that.print(':')}],
		
		// Equals
		[187, "normal", function(){that.print('=')}],
		[187, "shift", function(){that.print('+')}],
		
		// Comma
		[188, "normal", function(){that.print(',')}],
		[188, "shift", function(){that.print('<')}],
		
		// Hyphen
		[189, "normal", function(){that.print('-')}],
		[189, "shift", function(){that.print('_')}],
		
		// Full Stop
		[190, "normal", function(){that.print('.')}],
		[190, "shift", function(){that.print('>')}],
		
		// Forward Slash
		[191, "normal", function(){that.print('/')}],
		[191, "shift", function(){that.print('?')}],
		
		// Apostrophe
		[192, "normal", function(){that.print('\'')}],
		[192, "shift", function(){that.print('@')}],
		
		// Open Bracket
		[219, "normal", function(){that.print('[')}],
		[219, "shift", function(){that.print('{')}],
		
		// Back Slash
		[220, "normal", function(){that.print('\\')}],
		[220, "shift", function(){that.print('|')}],
		
		// Close Bracket
		[221, "normal", function(){that.print(']')}],
		[221, "shift", function(){that.print('}')}],
		
		// Hash
		[222, "normal", function(){that.print('#')}],
		[222, "shift", function(){that.print('~')}],

		// 0 to 9
		[48, "normal", function(){that.print('0')}],
		[48, "shift", function(){that.print(')')}],
		
		[49, "normal", function(){that.print('1')}],
		[49, "shift", function(){that.print('!')}],
		
		[50, "normal", function(){that.print('2')}],
		[50, "shift", function(){that.print('"')}],
		
		[51, "normal", function(){that.print('3')}],
		[51, "shift", function(){that.print('\u00A3')}],
		
		[52, "normal", function(){that.print('4')}],
		[52, "shift", function(){that.print('$')}],
		
		[53, "normal", function(){that.print('5')}],
		[53, "shift", function(){that.print('%')}],
		
		[54, "normal", function(){that.print('6')}],
		[54, "shift", function(){that.print('^')}],
		
		[55, "normal", function(){that.print('7')}],
		[55, "shift", function(){that.print('&')}],
		
		[56, "normal", function(){that.print('8')}],
		[56, "shift", function(){that.print('*')}],
		
		[57, "normal", function(){that.print('9')}],
		[57, "shift", function(){that.print('(')}]
	];
};

PD.textEditorAtoZ = function(that) {
	return [
		[65, "normal", function(){that.print('a')}],
		[65, "shift", function(){that.print('A')}],
		
		[66, "normal", function(){that.print('b')}],
		[66, "shift", function(){that.print('B')}],
		
		[67, "normal", function(){that.print('c')}],
		[67, "shift", function(){that.print('C')}],
		
		[68, "normal", function(){that.print('d')}],
		[68, "shift", function(){that.print('D')}],
		
		[69, "normal", function(){that.print('e')}],
		[69, "shift", function(){that.print('E')}],
		
		[70, "normal", function(){that.print('f')}],
		[70, "shift", function(){that.print('F')}],
		
		[71, "normal", function(){that.print('g')}],
		[71, "shift", function(){that.print('G')}],
		
		[72, "normal", function(){that.print('h')}],
		[72, "shift", function(){that.print('H')}],
		
		[73, "normal", function(){that.print('i')}],
		[73, "shift", function(){that.print('I')}],
		
		[74, "normal", function(){that.print('j')}],
		[74, "shift", function(){that.print('J')}],
		
		[75, "normal", function(){that.print('k')}],
		[75, "shift", function(){that.print('K')}],
		
		[76, "normal", function(){that.print('l')}],
		[76, "shift", function(){that.print('L')}],
		
		[77, "normal", function(){that.print('m')}],
		[77, "shift", function(){that.print('M')}],
		
		[78, "normal", function(){that.print('n')}],
		[78, "shift", function(){that.print('N')}],
		
		[79, "normal", function(){that.print('o')}],
		[79, "shift", function(){that.print('O')}],
		
		[80, "normal", function(){that.print('p')}],
		[80, "shift", function(){that.print('P')}],
		
		[81, "normal", function(){that.print('q')}],
		[81, "shift", function(){that.print('Q')}],
		
		[82, "normal", function(){that.print('r')}],
		[82, "shift", function(){that.print('R')}],
		
		[83, "normal", function(){that.print('s')}],
		[83, "shift", function(){that.print('S')}],
		
		[84, "normal", function(){that.print('t')}],
		[84, "shift", function(){that.print('T')}],
		
		[85, "normal", function(){that.print('u')}],
		[85, "shift", function(){that.print('U')}],
		
		[86, "normal", function(){that.print('v')}],
		[86, "shift", function(){that.print('V')}],
		
		[87, "normal", function(){that.print('w')}],
		[87, "shift", function(){that.print('W')}],
		
		[88, "normal", function(){that.print('x')}],
		[88, "shift", function(){that.print('X')}],
		
		[89, "normal", function(){that.print('y')}],
		[89, "shift", function(){that.print('Y')}],
		
		[90, "normal", function(){that.print('z')}],
		[90, "shift", function(){that.print('Z')}]
	];
};

PD.capsLockBindings = function(that) {
	return [
		[65, "shift", function(){that.print('a')}],
		[65, "normal", function(){that.print('A')}],
		
		[66, "shift", function(){that.print('b')}],
		[66, "normal", function(){that.print('B')}],
		
		[67, "shift", function(){that.print('c')}],
		[67, "normal", function(){that.print('C')}],
		
		[68, "shift", function(){that.print('d')}],
		[68, "normal", function(){that.print('D')}],
		
		[69, "shift", function(){that.print('e')}],
		[69, "normal", function(){that.print('E')}],
		
		[70, "shift", function(){that.print('f')}],
		[70, "normal", function(){that.print('F')}],
		
		[71, "shift", function(){that.print('g')}],
		[71, "normal", function(){that.print('G')}],
		
		[72, "shift", function(){that.print('h')}],
		[72, "normal", function(){that.print('H')}],
		
		[73, "shift", function(){that.print('i')}],
		[73, "normal", function(){that.print('I')}],
		
		[74, "shift", function(){that.print('j')}],
		[74, "normal", function(){that.print('J')}],
		
		[75, "shift", function(){that.print('k')}],
		[75, "normal", function(){that.print('K')}],
		
		[76, "shift", function(){that.print('l')}],
		[76, "normal", function(){that.print('L')}],
		
		[77, "shift", function(){that.print('m')}],
		[77, "normal", function(){that.print('M')}],
		
		[78, "shift", function(){that.print('n')}],
		[78, "normal", function(){that.print('N')}],
		
		[79, "shift", function(){that.print('o')}],
		[79, "normal", function(){that.print('O')}],
		
		[80, "shift", function(){that.print('p')}],
		[80, "normal", function(){that.print('P')}],
		
		[81, "shift", function(){that.print('q')}],
		[81, "normal", function(){that.print('Q')}],
		
		[82, "shift", function(){that.print('r')}],
		[82, "normal", function(){that.print('R')}],
		
		[83, "shift", function(){that.print('s')}],
		[83, "normal", function(){that.print('S')}],
		
		[84, "shift", function(){that.print('t')}],
		[84, "normal", function(){that.print('T')}],
		
		[85, "shift", function(){that.print('u')}],
		[85, "normal", function(){that.print('U')}],
		
		[86, "shift", function(){that.print('v')}],
		[86, "normal", function(){that.print('V')}],
		
		[87, "shift", function(){that.print('w')}],
		[87, "normal", function(){that.print('W')}],
		
		[88, "shift", function(){that.print('x')}],
		[88, "normal", function(){that.print('X')}],
		
		[89, "shift", function(){that.print('y')}],
		[89, "normal", function(){that.print('Y')}],
		
		[90, "shift", function(){that.print('z')}],
		[90, "normal", function(){that.print('Z')}]
	];
}

// what about caps lock?
function greek() {
	return [
		// Space
		[32, "normal", function(){PD.selected.print('\u2022')}],
	
		// Alpha
		[65, "normal", function(){PD.selected.print('\u03b1')}],
		[65, "shift", function(){PD.selected.print('\u0391')}],
		
		// Beta
		[66, "normal", function(){PD.selected.print('\u03b2')}],
		[66, "shift", function(){PD.selected.print('\u0392')}],
		
		// Psi
		[67, "normal", function(){PD.selected.print('\u03c7')}],
		[67, "shift", function(){PD.selected.print('\u03a7')}],
		
		// Delta
		[68, "normal", function(){PD.selected.print('\u03b4')}],
		[68, "shift", function(){PD.selected.print('\u0394')}],
		
		// Epsilon
		[69, "normal", function(){PD.selected.print('\u03b5')}],
		[69, "shift", function(){PD.selected.print('\u0395')}],
		
		// Phi
		[70, "normal", function(){PD.selected.print('\u03c5')}],
		[70, "shift", function(){PD.selected.print('\u03a5')}],
		
		// Gammma
		[71, "normal", function(){PD.selected.print('\u03b3')}],
		[71, "shift", function(){PD.selected.print('\u0393')}],
		
		// Eta
		[72, "normal", function(){PD.selected.print('\u03b7')}],
		[72, "shift", function(){PD.selected.print('\u0397')}],
		
		// Iota
		[73, "normal", function(){PD.selected.print('\u03b9')}],
		[73, "shift", function(){PD.selected.print('\u0399')}],
		
		// Xi
		[74, "normal", function(){PD.selected.print('\u03be')}],
		[74, "shift", function(){PD.selected.print('\u039e')}],
		
		// Kappa
		[75, "normal", function(){PD.selected.print('\u03ba')}],
		[75, "shift", function(){PD.selected.print('\u039a')}],
		
		// Lambda
		[76, "normal", function(){PD.selected.print('\u03bb')}],
		[76, "shift", function(){PD.selected.print('\u039b')}],
		
		// Mu
		[77, "normal", function(){PD.selected.print('\u03bc')}],
		[77, "shift", function(){PD.selected.print('\u039c')}],
		
		// Nu
		[78, "normal", function(){PD.selected.print('\u03bd')}],
		[78, "shift", function(){PD.selected.print('\u039d')}],
		
		// Omicron
		[79, "normal", function(){PD.selected.print('\u03bf')}],
		[79, "shift", function(){PD.selected.print('\u039f')}],
		
		// Pi
		[80, "normal", function(){PD.selected.print('\u03c0')}],
		[80, "shift", function(){PD.selected.print('\u03a0')}],
		
		[81, "normal", function(){doNothing()}],
		[81, "shift", function(){doNothing()}],
		
		// Rho
		[82, "normal", function(){PD.selected.print('\u03c1')}],
		[82, "shift", function(){PD.selected.print('\u03a1')}],
		
		// Sigma
		[83, "normal", function(){PD.selected.print('\u03c2')}],
		[83, "shift", function(){PD.selected.print('\u03a3')}],
		
		// Tau
		[84, "normal", function(){PD.selected.print('\u03c3')}],
		[84, "shift", function(){PD.selected.print('\u0393')}],
		
		// Theta
		[85, "normal", function(){PD.selected.print('\u03b8')}],
		[85, "shift", function(){PD.selected.print('\u0398')}],
		
		// Omega
		[86, "normal", function(){PD.selected.print('\u03c8')}],
		[86, "shift", function(){PD.selected.print('\u03a8')}],
		
		[87, "normal", function(){doNothing()}],
		[87, "shift", function(){doNothing()}],
		
		// Chi
		[88, "normal", function(){PD.selected.print('\u03c6')}],
		[88, "shift", function(){PD.selected.print('\u03a6')}],
		
		// Upsilon
		[89, "normal", function(){PD.selected.print('\u03c4')}],
		[89, "shift", function(){PD.selected.print('\u03a4')}],
		
		// Zeta
		[90, "normal", function(){PD.selected.print('\u03b6')}],
		[90, "shift", function(){PD.selected.print('\u0396')}]
	];
};

window.onkeydown = checkKey;

window.onkeyup = checkEm;

// document.onmousemove = getMouseXY;

// function getMouseXY(e) {
	// var x = e.clientX;
	// var y = e.clientY;
	// debugText.printText("Coordinates: (" + x + "," + y + ")");
	// debug.changed();
// };

// I think it slows everything down if you hold down a key. not sure what I can do about that...
function checkKey(e) {
	if (PD.activeKeySet[e.keyCode].preventDefault)
	{
		e.preventDefault();
	}
	if (e.shiftKey && e.altKey && e.ctrlKey)
	{
		PD.activeKeySet[e.keyCode].shiftAltCtrl();
		return;
	}
	if (e.shiftKey && e.altKey)
	{
		PD.activeKeySet[e.keyCode].shiftAlt();
		return;
	}
	if (e.shiftKey && e.ctrlKey)
	{
		PD.activeKeySet[e.keyCode].shiftCtrl();
		return;
	}
	if (e.altKey && e.ctrlKey)
	{
		PD.activeKeySet[e.keyCode].altCtrl();
		return;
	}
	if (e.shiftKey)
	{
		PD.activeKeySet[e.keyCode].shift();
		return;
	}
	if (e.altKey)
	{
		PD.activeKeySet[e.keyCode].alt();
		return;
	}
	if (e.ctrlKey)
	{
		PD.activeKeySet[e.keyCode].ctrl();
		return;
	}
	PD.activeKeySet[e.keyCode].normal();
	return;
};

// :(
function checkEm(e) {
	if (e.keyCode==18) {
		Terminal.altMode = false;
		Terminal.reDraw();
	}
};

// Bindings store //

// Control //

// Backspace
// 8

// Tab
// 9

// Enter
// 13

// Shift
// 16

// Control
// 17

// Alt
// 18

// Caps Lock
// 20

// Escape
// 27

// Space
// 32

// Page Up
// 33

// Page Down
// 34

// End
// 35

// Home
// 36

// Left Arrow
// 37

// Up Arrow
// 38

// Right Arrow
// 39

// Down Arrow
// 40

// Insert
// 45

// Delete
// 46

// Left Meta
// 91

// Right Meta
// 92

// Select
// 93

// Numpad 0
// 96

// Numpad 1
// 97

// Numpad 2
// 98

// Numpad 3
// 99

// Numpad 4
// 100

// Numpad 5
// 101

// Numpad 6
// 102

// Numpad 7
// 103

// Numpad 8
// 104

// Numpad 9
// 105

// Multiply
// 106

// Add
// 107

// Subtract
// 109

// Decimal Point
// 110

// Divide
// 111

// F1
// 112

// F2
// 113

// F3
// 114

// F4
// 115

// F5
// 116

// F6
// 117

// F7
// 118

// F8
// 119

// F9
// 120

// F10
// 121

// F11
// 122

// F12
// 123

// Num Lock
// 144

// Scroll Lock
// 145

// Punctuation //

// Semi-colon
// 186

// Equals
// 187

// Comma
// 188

// Hyphen
// 189

// Full Stop
// 190

// Forward Slash
// 191

// Apostrophe
// 192

// Open Bracket
// 219

// Back Slash
// 220

// Close Bracket
// 221

// Hash
// 222

// Alphanumeric //

// 0 to 9

// 0
// 48

// 1
// 49

// 2
// 50

// 3
// 51

// 4
// 52

// 5
// 53

// 6
// 54

// 7
// 55

// 8
// 56

// 9
// 57

// A to Z

// A
// 65

// B
// 66

// C
// 67

// D
// 68

// E
// 69

// F
// 70

// G
// 71

// H
// 72

// I
// 73

// J
// 74

// K
// 75

// L
// 76

// M
// 77

// N
// 78

// O
// 79

// P
// 80

// Q
// 81

// R
// 82

// S
// 83

// T
// 84

// U
// 85

// V
// 86

// W
// 87

// X
// 88

// Y
// 89

// Z
// 90