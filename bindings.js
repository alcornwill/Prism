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
	
	PD.contextMenuBindings = function() {
		// really not sure about this
		// Is it the respontiblity of the region to unbind()?
		resetTextBindings();
		PD.setBinding(27, "normal", function(){PD.escape()});
		// more alt + letter bindings go here
		// cursor keys
	}
	
	PD.setBinding = function(key, modifier, action) {
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
	}
	
	PD.otherTextEditorBindings = function(that) {
		// Backspace
		PD.setBinding(8, "normal", function(){that.backspace()});
		PD.setBinding(8, "shift", function(){that.backspace()});
		
		// Tab
		PD.setBinding(9, "normal", function(){that.print('\t')});
		
		// Enter
		PD.setBinding(13, "normal", function(){that.print('\r\n')});
		PD.setBinding(13, "shift", function(){that.print('\r\n')});

		// Caps Lock
		PD.setBinding(20, "normal", function(){PD.toggleCapsLock()});
		
		// Space
		PD.setBinding(32, "normal", function(){that.print(' ')});
		PD.setBinding(32, "shift", function(){that.print(' ')});
		
		// Page Up
		PD.setBinding(33, "normal", function(){that.pageUp()}); // not implemented until we do scroll
		
		// Page Down
		PD.setBinding(34, "normal", function(){that.pageDown()});
		
		// End
		PD.setBinding(35, "normal", function(){that.end()});
		
		// Home
		PD.setBinding(36, "normal", function(){that.home()});
		
		// Left Arrow
		PD.setBinding(37, "normal", function(){that.cursorLeft()});
		
		// Up Arrow
		PD.setBinding(38, "normal", function(){that.cursorUp()});
		
		// Right Arrow
		PD.setBinding(39, "normal", function(){that.cursorRight()});
		
		// Down Arrow
		PD.setBinding(40, "normal", function(){that.cursorDown()});
		
		// Insert
		PD.setBinding(45, "normal", function(){toggleInsertMode()});

		// Delete
		PD.setBinding(46, "normal", function(){that.deleteKey()});

		// Numpad 0
		PD.setBinding(96, "normal", function(){PD.colourMode="black"});

		// Numpad 1
		PD.setBinding(97, "normal", function(){PD.colourMode="red"});
		
		// Numpad 2
		PD.setBinding(98, "normal", function(){PD.colourMode="green"});
		
		// Numpad 3
		PD.setBinding(99, "normal", function(){PD.toggleUnderlined()});
		
		// Numpad 4
		PD.setBinding(100, "normal", function(){PD.toggleBold()});
		
		// Numpad 5
		PD.setBinding(101, "normal", function(){PD.toggleItalics()});
		
		// Semi-colon
		PD.setBinding(186, "normal", function(){that.print(';')});
		PD.setBinding(186, "shift", function(){that.print(':')});
		
		// Equals
		PD.setBinding(187, "normal", function(){that.print('=')});
		PD.setBinding(187, "shift", function(){that.print('+')});
		
		// Comma
		PD.setBinding(188, "normal", function(){that.print(',')});
		PD.setBinding(188, "shift", function(){that.print('<')});
		
		// Hyphen
		PD.setBinding(189, "normal", function(){that.print('-')});
		PD.setBinding(189, "shift", function(){that.print('_')});
		
		// Full Stop
		PD.setBinding(190, "normal", function(){that.print('.')});
		PD.setBinding(190, "shift", function(){that.print('>')});
		
		// Forward Slash
		PD.setBinding(191, "normal", function(){that.print('/')});
		PD.setBinding(191, "shift", function(){that.print('?')});
		
		// Apostrophe
		PD.setBinding(192, "normal", function(){that.print('\'')});
		PD.setBinding(192, "shift", function(){that.print('@')});
		
		// Open Bracket
		PD.setBinding(219, "normal", function(){that.print('[')});
		PD.setBinding(219, "shift", function(){that.print('{')});
		
		// Back Slash
		PD.setBinding(220, "normal", function(){that.print('\\')});
		PD.setBinding(220, "shift", function(){that.print('|')});
		
		// Close Bracket
		PD.setBinding(221, "normal", function(){that.print(']')});
		PD.setBinding(221, "shift", function(){that.print('}')});
		
		// Hash
		PD.setBinding(222, "normal", function(){that.print('#')});
		PD.setBinding(222, "shift", function(){that.print('~')});

		// 0 to 9
		PD.setBinding(48, "normal", function(){that.print('0')});
		PD.setBinding(48, "shift", function(){that.print(')')});
		
		PD.setBinding(49, "normal", function(){that.print('1')});
		PD.setBinding(49, "shift", function(){that.print('!')});
		
		PD.setBinding(50, "normal", function(){that.print('2')});
		PD.setBinding(50, "shift", function(){that.print('"')});
		
		PD.setBinding(51, "normal", function(){that.print('3')});
		PD.setBinding(51, "shift", function(){that.print('\u00A3')});
		
		PD.setBinding(52, "normal", function(){that.print('4')});
		PD.setBinding(52, "shift", function(){that.print('$')});
		
		PD.setBinding(53, "normal", function(){that.print('5')});
		PD.setBinding(53, "shift", function(){that.print('%')});
		
		PD.setBinding(54, "normal", function(){that.print('6')});
		PD.setBinding(54, "shift", function(){that.print('^')});
		
		PD.setBinding(55, "normal", function(){that.print('7')});
		PD.setBinding(55, "shift", function(){that.print('&')});
		
		PD.setBinding(56, "normal", function(){that.print('8')});
		PD.setBinding(56, "shift", function(){that.print('*')});
		
		PD.setBinding(57, "normal", function(){that.print('9')});
		PD.setBinding(57, "shift", function(){that.print('(')});
	};
	
	PD.textEditorAtoZ = function(that) {
		PD.setBinding(65, "normal", function(){that.print('a')});
		PD.setBinding(65, "shift", function(){that.print('A')});
		
		PD.setBinding(66, "normal", function(){that.print('b')});
		PD.setBinding(66, "shift", function(){that.print('B')});
		
		PD.setBinding(67, "normal", function(){that.print('c')});
		PD.setBinding(67, "shift", function(){that.print('C')});
		
		PD.setBinding(68, "normal", function(){that.print('d')});
		PD.setBinding(68, "shift", function(){that.print('D')});
		
		PD.setBinding(69, "normal", function(){that.print('e')});
		PD.setBinding(69, "shift", function(){that.print('E')});
		
		PD.setBinding(70, "normal", function(){that.print('f')});
		PD.setBinding(70, "shift", function(){that.print('F')});
		
		PD.setBinding(71, "normal", function(){that.print('g')});
		PD.setBinding(71, "shift", function(){that.print('G')});
		
		PD.setBinding(72, "normal", function(){that.print('h')});
		PD.setBinding(72, "shift", function(){that.print('H')});
		
		PD.setBinding(73, "normal", function(){that.print('i')});
		PD.setBinding(73, "shift", function(){that.print('I')});
		
		PD.setBinding(74, "normal", function(){that.print('j')});
		PD.setBinding(74, "shift", function(){that.print('J')});
		
		PD.setBinding(75, "normal", function(){that.print('k')});
		PD.setBinding(75, "shift", function(){that.print('K')});
		
		PD.setBinding(76, "normal", function(){that.print('l')});
		PD.setBinding(76, "shift", function(){that.print('L')});
		
		PD.setBinding(77, "normal", function(){that.print('m')});
		PD.setBinding(77, "shift", function(){that.print('M')});
		
		PD.setBinding(78, "normal", function(){that.print('n')});
		PD.setBinding(78, "shift", function(){that.print('N')});
		
		PD.setBinding(79, "normal", function(){that.print('o')});
		PD.setBinding(79, "shift", function(){that.print('O')});
		
		PD.setBinding(80, "normal", function(){that.print('p')});
		PD.setBinding(80, "shift", function(){that.print('P')});
		
		PD.setBinding(81, "normal", function(){that.print('q')});
		PD.setBinding(81, "shift", function(){that.print('Q')});
		
		PD.setBinding(82, "normal", function(){that.print('r')});
		PD.setBinding(82, "shift", function(){that.print('R')});
		
		PD.setBinding(83, "normal", function(){that.print('s')});
		PD.setBinding(83, "shift", function(){that.print('S')});
		
		PD.setBinding(84, "normal", function(){that.print('t')});
		PD.setBinding(84, "shift", function(){that.print('T')});
		
		PD.setBinding(85, "normal", function(){that.print('u')});
		PD.setBinding(85, "shift", function(){that.print('U')});
		
		PD.setBinding(86, "normal", function(){that.print('v')});
		PD.setBinding(86, "shift", function(){that.print('V')});
		
		PD.setBinding(87, "normal", function(){that.print('w')});
		PD.setBinding(87, "shift", function(){that.print('W')});
		
		PD.setBinding(88, "normal", function(){that.print('x')});
		PD.setBinding(88, "shift", function(){that.print('X')});
		
		PD.setBinding(89, "normal", function(){that.print('y')});
		PD.setBinding(89, "shift", function(){that.print('Y')});
		
		PD.setBinding(90, "normal", function(){that.print('z')});
		PD.setBinding(90, "shift", function(){that.print('Z')});
	};

	PD.capsLockBindings = function(that) {
		PD.setBinding(65, "shift", function(){that.print('a')});
		PD.setBinding(65, "normal", function(){that.print('A')});
		
		PD.setBinding(66, "shift", function(){that.print('b')});
		PD.setBinding(66, "normal", function(){that.print('B')});
		
		PD.setBinding(67, "shift", function(){that.print('c')});
		PD.setBinding(67, "normal", function(){that.print('C')});
		
		PD.setBinding(68, "shift", function(){that.print('d')});
		PD.setBinding(68, "normal", function(){that.print('D')});
		
		PD.setBinding(69, "shift", function(){that.print('e')});
		PD.setBinding(69, "normal", function(){that.print('E')});
		
		PD.setBinding(70, "shift", function(){that.print('f')});
		PD.setBinding(70, "normal", function(){that.print('F')});
		
		PD.setBinding(71, "shift", function(){that.print('g')});
		PD.setBinding(71, "normal", function(){that.print('G')});
		
		PD.setBinding(72, "shift", function(){that.print('h')});
		PD.setBinding(72, "normal", function(){that.print('H')});
		
		PD.setBinding(73, "shift", function(){that.print('i')});
		PD.setBinding(73, "normal", function(){that.print('I')});
		
		PD.setBinding(74, "shift", function(){that.print('j')});
		PD.setBinding(74, "normal", function(){that.print('J')});
		
		PD.setBinding(75, "shift", function(){that.print('k')});
		PD.setBinding(75, "normal", function(){that.print('K')});
		
		PD.setBinding(76, "shift", function(){that.print('l')});
		PD.setBinding(76, "normal", function(){that.print('L')});
		
		PD.setBinding(77, "shift", function(){that.print('m')});
		PD.setBinding(77, "normal", function(){that.print('M')});
		
		PD.setBinding(78, "shift", function(){that.print('n')});
		PD.setBinding(78, "normal", function(){that.print('N')});
		
		PD.setBinding(79, "shift", function(){that.print('o')});
		PD.setBinding(79, "normal", function(){that.print('O')});
		
		PD.setBinding(80, "shift", function(){that.print('p')});
		PD.setBinding(80, "normal", function(){that.print('P')});
		
		PD.setBinding(81, "shift", function(){that.print('q')});
		PD.setBinding(81, "normal", function(){that.print('Q')});
		
		PD.setBinding(82, "shift", function(){that.print('r')});
		PD.setBinding(82, "normal", function(){that.print('R')});
		
		PD.setBinding(83, "shift", function(){that.print('s')});
		PD.setBinding(83, "normal", function(){that.print('S')});
		
		PD.setBinding(84, "shift", function(){that.print('t')});
		PD.setBinding(84, "normal", function(){that.print('T')});
		
		PD.setBinding(85, "shift", function(){that.print('u')});
		PD.setBinding(85, "normal", function(){that.print('U')});
		
		PD.setBinding(86, "shift", function(){that.print('v')});
		PD.setBinding(86, "normal", function(){that.print('V')});
		
		PD.setBinding(87, "shift", function(){that.print('w')});
		PD.setBinding(87, "normal", function(){that.print('W')});
		
		PD.setBinding(88, "shift", function(){that.print('x')});
		PD.setBinding(88, "normal", function(){that.print('X')});
		
		PD.setBinding(89, "shift", function(){that.print('y')});
		PD.setBinding(89, "normal", function(){that.print('Y')});
		
		PD.setBinding(90, "shift", function(){that.print('z')});
		PD.setBinding(90, "normal", function(){that.print('Z')});
	}
	
	// what about caps lock?
	function greek() {
		// Space
		PD.setBinding(32, "normal", function(){PD.selected.print('\u2022')});
	
		// Alpha
		PD.setBinding(65, "normal", function(){PD.selected.print('\u03b1')});
		PD.setBinding(65, "shift", function(){PD.selected.print('\u0391')});
		
		// Beta
		PD.setBinding(66, "normal", function(){PD.selected.print('\u03b2')});
		PD.setBinding(66, "shift", function(){PD.selected.print('\u0392')});
		
		// Psi
		PD.setBinding(67, "normal", function(){PD.selected.print('\u03c7')});
		PD.setBinding(67, "shift", function(){PD.selected.print('\u03a7')});
		
		// Delta
		PD.setBinding(68, "normal", function(){PD.selected.print('\u03b4')});
		PD.setBinding(68, "shift", function(){PD.selected.print('\u0394')});
		
		// Epsilon
		PD.setBinding(69, "normal", function(){PD.selected.print('\u03b5')});
		PD.setBinding(69, "shift", function(){PD.selected.print('\u0395')});
		
		// Phi
		PD.setBinding(70, "normal", function(){PD.selected.print('\u03c5')});
		PD.setBinding(70, "shift", function(){PD.selected.print('\u03a5')});
		
		// Gammma
		PD.setBinding(71, "normal", function(){PD.selected.print('\u03b3')});
		PD.setBinding(71, "shift", function(){PD.selected.print('\u0393')});
		
		// Eta
		PD.setBinding(72, "normal", function(){PD.selected.print('\u03b7')});
		PD.setBinding(72, "shift", function(){PD.selected.print('\u0397')});
		
		// Iota
		PD.setBinding(73, "normal", function(){PD.selected.print('\u03b9')});
		PD.setBinding(73, "shift", function(){PD.selected.print('\u0399')});
		
		// Xi
		PD.setBinding(74, "normal", function(){PD.selected.print('\u03be')});
		PD.setBinding(74, "shift", function(){PD.selected.print('\u039e')});
		
		// Kappa
		PD.setBinding(75, "normal", function(){PD.selected.print('\u03ba')});
		PD.setBinding(75, "shift", function(){PD.selected.print('\u039a')});
		
		// Lambda
		PD.setBinding(76, "normal", function(){PD.selected.print('\u03bb')});
		PD.setBinding(76, "shift", function(){PD.selected.print('\u039b')});
		
		// Mu
		PD.setBinding(77, "normal", function(){PD.selected.print('\u03bc')});
		PD.setBinding(77, "shift", function(){PD.selected.print('\u039c')});
		
		// Nu
		PD.setBinding(78, "normal", function(){PD.selected.print('\u03bd')});
		PD.setBinding(78, "shift", function(){PD.selected.print('\u039d')});
		
		// Omicron
		PD.setBinding(79, "normal", function(){PD.selected.print('\u03bf')});
		PD.setBinding(79, "shift", function(){PD.selected.print('\u039f')});
		
		// Pi
		PD.setBinding(80, "normal", function(){PD.selected.print('\u03c0')});
		PD.setBinding(80, "shift", function(){PD.selected.print('\u03a0')});
		
		PD.setBinding(81, "normal", function(){doNothing()});
		PD.setBinding(81, "shift", function(){doNothing()});
		
		// Rho
		PD.setBinding(82, "normal", function(){PD.selected.print('\u03c1')});
		PD.setBinding(82, "shift", function(){PD.selected.print('\u03a1')});
		
		// Sigma
		PD.setBinding(83, "normal", function(){PD.selected.print('\u03c2')});
		PD.setBinding(83, "shift", function(){PD.selected.print('\u03a3')});
		
		// Tau
		PD.setBinding(84, "normal", function(){PD.selected.print('\u03c3')});
		PD.setBinding(84, "shift", function(){PD.selected.print('\u0393')});
		
		// Theta
		PD.setBinding(85, "normal", function(){PD.selected.print('\u03b8')});
		PD.setBinding(85, "shift", function(){PD.selected.print('\u0398')});
		
		// Omega
		PD.setBinding(86, "normal", function(){PD.selected.print('\u03c8')});
		PD.setBinding(86, "shift", function(){PD.selected.print('\u03a8')});
		
		PD.setBinding(87, "normal", function(){doNothing()});
		PD.setBinding(87, "shift", function(){doNothing()});
		
		// Chi
		PD.setBinding(88, "normal", function(){PD.selected.print('\u03c6')});
		PD.setBinding(88, "shift", function(){PD.selected.print('\u03a6')});
		
		// Upsilon
		PD.setBinding(89, "normal", function(){PD.selected.print('\u03c4')});
		PD.setBinding(89, "shift", function(){PD.selected.print('\u03a4')});
		
		// Zeta
		PD.setBinding(90, "normal", function(){PD.selected.print('\u03b6')});
		PD.setBinding(90, "shift", function(){PD.selected.print('\u0396')});
	}
	
	resetTextBindings = function() {
		// I wonder if I could do this with a for loop lol
		PD.setBinding(8, "normal", function(){doNothing()});
		PD.setBinding(8, "shift", function(){doNothing()});
		PD.setBinding(9, "normal", function(){doNothing()});
		PD.setBinding(13, "normal", function(){doNothing()});
		PD.setBinding(13, "shift", function(){doNothing()});
		PD.setBinding(32, "normal", function(){doNothing()});
		PD.setBinding(32, "shift", function(){doNothing()});
		PD.setBinding(33, "normal", function(){doNothing()});
		PD.setBinding(34, "normal", function(){doNothing()});
		PD.setBinding(35, "normal", function(){doNothing()});
		PD.setBinding(36, "normal", function(){doNothing()});
		PD.setBinding(37, "normal", function(){doNothing()});
		PD.setBinding(38, "normal", function(){doNothing()});
		PD.setBinding(39, "normal", function(){doNothing()});
		PD.setBinding(40, "normal", function(){doNothing()});
		PD.setBinding(48, "normal", function(){doNothing()});
		PD.setBinding(48, "shift", function(){doNothing()});
		PD.setBinding(49, "normal", function(){doNothing()});
		PD.setBinding(49, "shift", function(){doNothing()});
		PD.setBinding(50, "normal", function(){doNothing()});
		PD.setBinding(50, "shift", function(){doNothing()});
		PD.setBinding(51, "normal", function(){doNothing()});
		PD.setBinding(51, "shift", function(){doNothing()});
		PD.setBinding(52, "normal", function(){doNothing()});
		PD.setBinding(52, "shift", function(){doNothing()});
		PD.setBinding(53, "normal", function(){doNothing()});
		PD.setBinding(53, "shift", function(){doNothing()});
		PD.setBinding(54, "normal", function(){doNothing()});
		PD.setBinding(54, "shift", function(){doNothing()});
		PD.setBinding(55, "normal", function(){doNothing()});
		PD.setBinding(55, "shift", function(){doNothing()});
		PD.setBinding(56, "normal", function(){doNothing()});
		PD.setBinding(56, "shift", function(){doNothing()});
		PD.setBinding(57, "normal", function(){doNothing()});
		PD.setBinding(57, "shift", function(){doNothing()});
		PD.setBinding(65, "normal", function(){doNothing()});
		PD.setBinding(65, "shift", function(){doNothing()});
		PD.setBinding(66, "normal", function(){doNothing()});
		PD.setBinding(66, "shift", function(){doNothing()});
		PD.setBinding(67, "normal", function(){doNothing()});
		PD.setBinding(67, "shift", function(){doNothing()});
		PD.setBinding(68, "normal", function(){doNothing()});
		PD.setBinding(68, "shift", function(){doNothing()});
		PD.setBinding(69, "normal", function(){doNothing()});
		PD.setBinding(69, "shift", function(){doNothing()});
		PD.setBinding(70, "normal", function(){doNothing()});
		PD.setBinding(70, "shift", function(){doNothing()});
		PD.setBinding(71, "normal", function(){doNothing()});
		PD.setBinding(71, "shift", function(){doNothing()});
		PD.setBinding(72, "normal", function(){doNothing()});
		PD.setBinding(72, "shift", function(){doNothing()});
		PD.setBinding(73, "normal", function(){doNothing()});
		PD.setBinding(73, "shift", function(){doNothing()});
		PD.setBinding(74, "normal", function(){doNothing()});
		PD.setBinding(74, "shift", function(){doNothing()});
		PD.setBinding(75, "normal", function(){doNothing()});
		PD.setBinding(75, "shift", function(){doNothing()});
		PD.setBinding(76, "normal", function(){doNothing()});
		PD.setBinding(76, "shift", function(){doNothing()});
		PD.setBinding(77, "normal", function(){doNothing()});
		PD.setBinding(77, "shift", function(){doNothing()});
		PD.setBinding(78, "normal", function(){doNothing()});
		PD.setBinding(78, "shift", function(){doNothing()});
		PD.setBinding(79, "normal", function(){doNothing()});
		PD.setBinding(79, "shift", function(){doNothing()});
		PD.setBinding(80, "normal", function(){doNothing()});
		PD.setBinding(80, "shift", function(){doNothing()});
		PD.setBinding(81, "normal", function(){doNothing()});
		PD.setBinding(81, "shift", function(){doNothing()});
		PD.setBinding(82, "normal", function(){doNothing()});
		PD.setBinding(82, "shift", function(){doNothing()});
		PD.setBinding(83, "normal", function(){doNothing()});
		PD.setBinding(83, "shift", function(){doNothing()});
		PD.setBinding(84, "normal", function(){doNothing()});
		PD.setBinding(84, "shift", function(){doNothing()});
		PD.setBinding(85, "normal", function(){doNothing()});
		PD.setBinding(85, "shift", function(){doNothing()});
		PD.setBinding(86, "normal", function(){doNothing()});
		PD.setBinding(86, "shift", function(){doNothing()});
		PD.setBinding(87, "normal", function(){doNothing()});
		PD.setBinding(87, "shift", function(){doNothing()});
		PD.setBinding(88, "normal", function(){doNothing()});
		PD.setBinding(88, "shift", function(){doNothing()});
		PD.setBinding(89, "normal", function(){doNothing()});
		PD.setBinding(89, "shift", function(){doNothing()});
		PD.setBinding(90, "normal", function(){doNothing()});
		PD.setBinding(90, "shift", function(){doNothing()});
		PD.setBinding(186, "normal", function(){doNothing()});
		PD.setBinding(186, "shift", function(){doNothing()});
		PD.setBinding(187, "normal", function(){doNothing()});
		PD.setBinding(187, "shift", function(){doNothing()});
		PD.setBinding(188, "normal", function(){doNothing()});
		PD.setBinding(188, "shift", function(){doNothing()});
		PD.setBinding(189, "normal", function(){doNothing()});
		PD.setBinding(189, "shift", function(){doNothing()});
		PD.setBinding(190, "normal", function(){doNothing()});
		PD.setBinding(190, "shift", function(){doNothing()});
		PD.setBinding(191, "normal", function(){doNothing()});
		PD.setBinding(191, "shift", function(){doNothing()});
		PD.setBinding(192, "normal", function(){doNothing()});
		PD.setBinding(192, "shift", function(){doNothing()});
		PD.setBinding(219, "normal", function(){doNothing()});
		PD.setBinding(219, "shift", function(){doNothing()});
		PD.setBinding(220, "normal", function(){doNothing()});
		PD.setBinding(220, "shift", function(){doNothing()});
		PD.setBinding(221, "normal", function(){doNothing()});
		PD.setBinding(221, "shift", function(){doNothing()});
		PD.setBinding(222, "normal", function(){doNothing()});
		PD.setBinding(222, "shift", function(){doNothing()});

	}

	window.onkeydown = checkKey;
	
	window.onkeyup = checkEm;

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
	
	// :(
	function checkEm(e) {
		if (e.keyCode==18) {
			PD.altMode = false;
			terminal.reDraw();
		}
	};
})();

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