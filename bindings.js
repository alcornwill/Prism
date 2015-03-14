
var keys = [];
var altKeys = [];

var activeKeyBuffer = keys;

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
};

PD.initKeys = function() {
	for (var i=0; i<=222; i++)
	{
		keys[i] = new key();
		altKeys[i] = new key();
	}
};

PD.setTemporaryBindings = function(bindings) {
	for (var i=0; i<bindings.length; i++)
		PD.setTemporaryBinding(bindings[i]);
};

PD.setBindings= function(bindings) {
	for (var i=0; i<bindings.length; i++)
		PD.setBinding(bindings[i]);
};

PD.setTemporaryBinding = function(binding) {
	var key = binding[0];
	var modifier = binding[1];
	var action = binding[2];
	
	switch(modifier) {
		case "normal":
			altKeys[key].normal = action;
			break;
		case "shift":
			altKeys[key].shift = action;
			break;
		case "alt":
			altKeys[key].alt = action;
			break;
		case "ctrl":
			altKeys[key].ctrl = action;
			break;
		case "shiftAlt":
			altKeys[key].shiftAlt = action;
			break;
		case "shiftCtrl":
			altKeys[key].shiftCtrl = action;
			break;
		case "altCtrl":
			altKeys[key].altCtrl = action;
			break;
		case "shiftAltCtrl":
			altKeys[key].shiftAltCtrl = action;
			break;
		case "preventDefault":
			altKeys[key].preventDefault = action;
			break;
	}
};

PD.setBinding = function(binding) {
	var key = binding[0];
	var modifier = binding[1];
	var action = binding[2];
	
	switch(modifier) {
		case "normal":
			keys[key].normal = action;
			break;
		case "shift":
			keys[key].shift = action;
			break;
		case "alt":
			keys[key].alt = action;
			break;
		case "ctrl":
			keys[key].ctrl = action;
			break;
		case "shiftAlt":
			keys[key].shiftAlt = action;
			break;
		case "shiftCtrl":
			keys[key].shiftCtrl = action;
			break;
		case "altCtrl":
			keys[key].altCtrl = action;
			break;
		case "shiftAltCtrl":
			keys[key].shiftAltCtrl = action;
			break;
		case "preventDefault":
			keys[key].preventDefault = action;
			break;
	}
};

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
		[45, "normal", function(){toggleInsertMode()}],

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

resetTextBindings = function() {
	return [
		[8, "normal", function(){doNothing()}],
		[8, "shift", function(){doNothing()}],
		[9, "normal", function(){doNothing()}],
		[13, "normal", function(){doNothing()}],
		[13, "shift", function(){doNothing()}],
		[32, "normal", function(){doNothing()}],
		[32, "shift", function(){doNothing()}],
		[33, "normal", function(){doNothing()}],
		[34, "normal", function(){doNothing()}],
		[35, "normal", function(){doNothing()}],
		[36, "normal", function(){doNothing()}],
		[37, "normal", function(){doNothing()}],
		[38, "normal", function(){doNothing()}],
		[39, "normal", function(){doNothing()}],
		[40, "normal", function(){doNothing()}],
		[48, "normal", function(){doNothing()}],
		[48, "shift", function(){doNothing()}],
		[49, "normal", function(){doNothing()}],
		[49, "shift", function(){doNothing()}],
		[50, "normal", function(){doNothing()}],
		[50, "shift", function(){doNothing()}],
		[51, "normal", function(){doNothing()}],
		[51, "shift", function(){doNothing()}],
		[52, "normal", function(){doNothing()}],
		[52, "shift", function(){doNothing()}],
		[53, "normal", function(){doNothing()}],
		[53, "shift", function(){doNothing()}],
		[54, "normal", function(){doNothing()}],
		[54, "shift", function(){doNothing()}],
		[55, "normal", function(){doNothing()}],
		[55, "shift", function(){doNothing()}],
		[56, "normal", function(){doNothing()}],
		[56, "shift", function(){doNothing()}],
		[57, "normal", function(){doNothing()}],
		[57, "shift", function(){doNothing()}],
		[65, "normal", function(){doNothing()}],
		[65, "shift", function(){doNothing()}],
		[66, "normal", function(){doNothing()}],
		[66, "shift", function(){doNothing()}],
		[67, "normal", function(){doNothing()}],
		[67, "shift", function(){doNothing()}],
		[68, "normal", function(){doNothing()}],
		[68, "shift", function(){doNothing()}],
		[69, "normal", function(){doNothing()}],
		[69, "shift", function(){doNothing()}],
		[70, "normal", function(){doNothing()}],
		[70, "shift", function(){doNothing()}],
		[71, "normal", function(){doNothing()}],
		[71, "shift", function(){doNothing()}],
		[72, "normal", function(){doNothing()}],
		[72, "shift", function(){doNothing()}],
		[73, "normal", function(){doNothing()}],
		[73, "shift", function(){doNothing()}],
		[74, "normal", function(){doNothing()}],
		[74, "shift", function(){doNothing()}],
		[75, "normal", function(){doNothing()}],
		[75, "shift", function(){doNothing()}],
		[76, "normal", function(){doNothing()}],
		[76, "shift", function(){doNothing()}],
		[77, "normal", function(){doNothing()}],
		[77, "shift", function(){doNothing()}],
		[78, "normal", function(){doNothing()}],
		[78, "shift", function(){doNothing()}],
		[79, "normal", function(){doNothing()}],
		[79, "shift", function(){doNothing()}],
		[80, "normal", function(){doNothing()}],
		[80, "shift", function(){doNothing()}],
		[81, "normal", function(){doNothing()}],
		[81, "shift", function(){doNothing()}],
		[82, "normal", function(){doNothing()}],
		[82, "shift", function(){doNothing()}],
		[83, "normal", function(){doNothing()}],
		[83, "shift", function(){doNothing()}],
		[84, "normal", function(){doNothing()}],
		[84, "shift", function(){doNothing()}],
		[85, "normal", function(){doNothing()}],
		[85, "shift", function(){doNothing()}],
		[86, "normal", function(){doNothing()}],
		[86, "shift", function(){doNothing()}],
		[87, "normal", function(){doNothing()}],
		[87, "shift", function(){doNothing()}],
		[88, "normal", function(){doNothing()}],
		[88, "shift", function(){doNothing()}],
		[89, "normal", function(){doNothing()}],
		[89, "shift", function(){doNothing()}],
		[90, "normal", function(){doNothing()}],
		[90, "shift", function(){doNothing()}],
		[186, "normal", function(){doNothing()}],
		[186, "shift", function(){doNothing()}],
		[187, "normal", function(){doNothing()}],
		[187, "shift", function(){doNothing()}],
		[188, "normal", function(){doNothing()}],
		[188, "shift", function(){doNothing()}],
		[189, "normal", function(){doNothing()}],
		[189, "shift", function(){doNothing()}],
		[190, "normal", function(){doNothing()}],
		[190, "shift", function(){doNothing()}],
		[191, "normal", function(){doNothing()}],
		[191, "shift", function(){doNothing()}],
		[192, "normal", function(){doNothing()}],
		[192, "shift", function(){doNothing()}],
		[219, "normal", function(){doNothing()}],
		[219, "shift", function(){doNothing()}],
		[220, "normal", function(){doNothing()}],
		[220, "shift", function(){doNothing()}],
		[221, "normal", function(){doNothing()}],
		[221, "shift", function(){doNothing()}],
		[222, "normal", function(){doNothing()}],
		[222, "shift", function(){doNothing()}]
	];
};

window.onkeydown = checkKey;

window.onkeyup = checkEm;

// document.onmousemove = getMouseXY;

function getMouseXY(e) {
	var x = e.clientX;
	var y = e.clientY;
	debug.subRegion[0].printText("Coordinates: (" + x + "," + y + ")");
	debug.changed();
};

function checkKey(e) {
	if (activeKeyBuffer[e.keyCode].preventDefault)
	{
		e.preventDefault();
	}
	if (e.shiftKey && e.altKey && e.ctrlKey)
	{
		activeKeyBuffer[e.keyCode].shiftAltCtrl();
		return;
	}
	if (e.shiftKey && e.altKey)
	{
		activeKeyBuffer[e.keyCode].shiftAlt();
		return;
	}
	if (e.shiftKey && e.ctrlKey)
	{
		activeKeyBuffer[e.keyCode].shiftCtrl();
		return;
	}
	if (e.altKey && e.ctrlKey)
	{
		activeKeyBuffer[e.keyCode].altCtrl();
		return;
	}
	if (e.shiftKey)
	{
		activeKeyBuffer[e.keyCode].shift();
		return;
	}
	if (e.altKey)
	{
		activeKeyBuffer[e.keyCode].alt();
		return;
	}
	if (e.ctrlKey)
	{
		activeKeyBuffer[e.keyCode].ctrl();
		return;
	}
	activeKeyBuffer[e.keyCode].normal();
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