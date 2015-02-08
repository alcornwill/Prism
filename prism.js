var terminalWidth = 500;
var terminalHeight = 500;

function realign()
{
	var w = window.innerWidth;
	var h = window.innerHeight;
	var terminal = document.getElementById("terminal");
	
	terminal.style.top = ((h / 2) - (terminalWidth / 2)) + "px";
	terminal.style.left = ((w / 2) - (terminalHeight / 2)) + "px";
}

function init()
{
	realign();
	constructTerminal();
	setInterval(toggleCursor, 500);
	textEditorBindings();
}

var charX = 52;
var charY = 28;

var matrix = [];

function constructTerminal()
{
	for (var y=0; y<charY; y++)
	{
		matrix[y] = [];
		for (var x=0; x<charX; x++)
		{
			matrix[y][x] = '';
		}
	}
	draw();
}

function getLine(y)
{
	var line = "";
	for (var x=0; x<charX; x++)
	{
		if (cursor.x == x && cursor.y == y && cursorOn)
		{
			line += '\u2588';
		}
		line += matrix[y][x];
	}
	
	return line;
}

function update()
{
	clear();
	draw();
}

function clear()
{
	while (terminal.firstChild)
	{
		terminal.removeChild(terminal.firstChild);
	}
}

function draw()
{
	for (var y=0; y<charY; y++)
	{
		var node = document.createElement("DIV");
		var textNode = document.createTextNode(getLine(y));
		node.appendChild(textNode);
		terminal.appendChild(node);
	}
}

function vec(x, y)
{
	return {x: x, y: y};
}

var cursor = vec(0, 0);
var cursorOn = false;

function print(ch)
{
	if (!(cursor.x<charX))
	{
		cursor.x = 0;
		cursor.y++;
	}
	matrix[cursor.y][cursor.x] = ch;
	cursor.x++;
	update();
}

function vPrint(ch)
{
	matrix[cursor.y][cursor.x] = ch;
	cursor.y++;
	update();
}

function deleteChar()
{
	if (cursor.x==0)
	{
		if (cursor.y==0)
		{
		} else {
			cursor.y--;
			cursor.x=findNotNull(cursor.y);
		}
	} else {
		cursor.x--;
		matrix[cursor.y][cursor.x] = '';
	}
	update();
}

function findNotNull(line)
{
	for (var x=charX-1; x>0; x--)
	{
		if (matrix[line][x]!='')
		{
			return x+1;
		}
	}
}

function newLine()
{
	if (cursor.y<charY)
	{
		cursor.x=0;
		cursor.y++;
	}
}

function fannyBlast()
{
	printAt(20, 10, "Fanny Blast!");
}

function printAt(x, y, text)
{
	cursor.x = x;
	cursor.y = y;
	
	for (var i=0; i<text.length; i++)
	{
		print(text[i]);
	}
}

function drawLine(x, y, ch, length)
{
	cursor.x = x;
	cursor.y = y;
	
	for (var i=0; i<length; i++)
	{
		print(ch);
	}
}

function drawVLine(x, y, ch, length)
{
	cursor.x = x;
	cursor.y = y;
	
	for (var i=0; i<length; i++)
	{
		vPrint(ch);
	}
}

function toggleCursor()
{
	cursorOn
	? cursorOn = false
	: cursorOn = true;
	update();
}

// Could do this kind of thing:
// var alphabet1 = 0;
// var alphabet2 = 26;
// var boxDrawing1 = 52;
// var boxDrawing2 = ...;
// var pattern1 = ...;
// var pattern2 = ...;
// var punctuation = ...;
//
// and then (somehow) generate these contexts.

function key(normal, shift, alt, meta, shiftAlt, shiftMeta, altMeta, shiftAltMeta)
{
	return {
	normal: normal,
	shift: shift,
	alt: alt,
	meta: meta,
	shiftAlt: shiftAlt,
	shiftMeta: shiftMeta,
	altMeta: altMeta,
	shiftAltMeta: shiftAltMeta
	};
}

var keys = [];

function textEditorBindings()
{
	// Backspace
	keys[8] = key(
	function(){deleteChar()},
	function(){},
	function(){},
	function(){},
	function(){},
	function(){},
	function(){},
	function(){}
	);
	
	// Enter
	keys[13] = key(
	function(){newLine()},
	function(){},
	function(){},
	function(){},
	function(){},
	function(){},
	function(){},
	function(){}
	);
	
	// Space
	keys[32] = key(
	function(){print('\u00a0')},
	function(){print('\u00a0')},
	function(){},
	function(){},
	function(){},
	function(){},
	function(){},
	function(){}
	);
	
	// A to Z
	keys[65] = key(
	function(){print('a')},
	function(){print('A')},
	function(){},
	function(){},
	function(){},
	function(){},
	function(){},
	function(){}
	);
	
	keys[66] = key(
	function(){print('b')},
	function(){print('B')},
	function(){printAt(20, 10, "Fanny Blast!")},
	function(){},
	function(){},
	function(){},
	function(){},
	function(){}
	);
	
	keys[67] = key(
	function(){print('c')},
	function(){print('C')},
	function(){drawLine(0, 0, '\u2500', 10)},
	function(){},
	function(){},
	function(){},
	function(){},
	function(){}
	);
	
	keys[68] = key(
	function(){print('d')},
	function(){print('D')},
	function(){drawVLine(0, 0, '\u2502', 10)},
	function(){},
	function(){},
	function(){},
	function(){},
	function(){}
	);
	
	keys[69] = key(
	function(){print('e')},
	function(){print('E')},
	function(){},
	function(){},
	function(){},
	function(){},
	function(){},
	function(){}
	);
	
	keys[70] = key(
	function(){print('f')},
	function(){print('F')},
	function(){},
	function(){},
	function(){},
	function(){},
	function(){},
	function(){}
	);
	
	keys[71] = key(
	function(){print('g')},
	function(){print('G')},
	function(){},
	function(){},
	function(){},
	function(){},
	function(){},
	function(){}
	);
	
	keys[72] = key(
	function(){print('h')},
	function(){print('H')},
	function(){},
	function(){},
	function(){},
	function(){},
	function(){},
	function(){}
	);
	
	keys[73] = key(
	function(){print('i')},
	function(){print('I')},
	function(){},
	function(){},
	function(){},
	function(){},
	function(){},
	function(){}
	);
	
	keys[74] = key(
	function(){print('j')},
	function(){print('J')},
	function(){},
	function(){},
	function(){},
	function(){},
	function(){},
	function(){}
	);
	
	keys[75] = key(
	function(){print('k')},
	function(){print('K')},
	function(){},
	function(){},
	function(){},
	function(){},
	function(){},
	function(){}
	);
	
	keys[76] = key(
	function(){print('l')},
	function(){print('L')},
	function(){},
	function(){},
	function(){},
	function(){},
	function(){},
	function(){}
	);
	
	keys[77] = key(
	function(){print('m')},
	function(){print('M')},
	function(){},
	function(){},
	function(){},
	function(){},
	function(){},
	function(){}
	);
	
	keys[78] = key(
	function(){print('n')},
	function(){print('N')},
	function(){},
	function(){},
	function(){},
	function(){},
	function(){},
	function(){}
	);
	
	keys[79] = key(
	function(){print('o')},
	function(){print('O')},
	function(){},
	function(){},
	function(){},
	function(){},
	function(){},
	function(){}
	);
	
	keys[80] = key(
	function(){print('p')},
	function(){print('P')},
	function(){},
	function(){},
	function(){},
	function(){},
	function(){},
	function(){}
	);
	
	keys[81] = key(
	function(){print('q')},
	function(){print('Q')},
	function(){},
	function(){},
	function(){},
	function(){},
	function(){},
	function(){}
	);
	
	keys[82] = key(
	function(){print('r')},
	function(){print('R')},
	function(){},
	function(){},
	function(){},
	function(){},
	function(){},
	function(){}
	);
	
	keys[83] = key(
	function(){print('s')},
	function(){print('S')},
	function(){},
	function(){},
	function(){},
	function(){},
	function(){},
	function(){}
	);
	
	keys[84] = key(
	function(){print('t')},
	function(){print('T')},
	function(){},
	function(){},
	function(){},
	function(){},
	function(){},
	function(){}
	);
	
	keys[85] = key(
	function(){print('u')},
	function(){print('U')},
	function(){},
	function(){},
	function(){},
	function(){},
	function(){},
	function(){}
	);
	
	keys[86] = key(
	function(){print('v')},
	function(){print('V')},
	function(){},
	function(){},
	function(){},
	function(){},
	function(){},
	function(){}
	);
	
	keys[87] = key(
	function(){print('w')},
	function(){print('W')},
	function(){},
	function(){},
	function(){},
	function(){},
	function(){},
	function(){}
	);
	
	keys[88] = key(
	function(){print('x')},
	function(){print('X')},
	function(){},
	function(){},
	function(){},
	function(){},
	function(){},
	function(){}
	);
	
	keys[89] = key(
	function(){print('y')},
	function(){print('Y')},
	function(){},
	function(){},
	function(){},
	function(){},
	function(){},
	function(){}
	);
	
	keys[90] = key(
	function(){print('z')},
	function(){print('Z')},
	function(){},
	function(){},
	function(){},
	function(){},
	function(){},
	function(){}
	);
}

window.onkeydown = checkKey;

function checkKey(e)
{
	e.preventDefault();
	if (e.shiftKey && e.altKey && e.metaKey)
	{
		keys[e.keyCode].shiftAltMeta();
		return;
	}
	if (e.shiftKey && e.altKey)
	{
		keys[e.keyCode].shiftAlt();
		return;
	}
	if (e.shiftKey && e.metaKey)
	{
		keys[e.keyCode].shiftMeta();
		return;
	}
	if (e.altKey && e.metaKey)
	{
		keys[e.keyCode].altMeta();
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
	if (e.metaKey)
	{
		keys[e.keyCode].meta();
		return;
	}
	keys[e.keyCode].normal();
	return;
}

