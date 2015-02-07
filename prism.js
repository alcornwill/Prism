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
	setInterval(drawCursor(), 500);
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

function drawCursor()
{
	console.log("cursor");
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
// and then (somehow) generate these Key variables.

var aKey = {ch:'a', shift:'A', keyCode:65};
var bKey = {ch:'b', shift:'B', keyCode:66};
var cKey = {ch:'c', shift:'C', keyCode:67};
var dKey = {ch:'d', shift:'D', keyCode:68};
var eKey = {ch:'e', shift:'E', keyCode:69};
var fKey = {ch:'f', shift:'F', keyCode:70};
var gKey = {ch:'g', shift:'G', keyCode:71};
var hKey = {ch:'h', shift:'H', keyCode:72};
var iKey = {ch:'i', shift:'I', keyCode:73}; 
var jKey = {ch:'j', shift:'J', keyCode:74}; 
var kKey = {ch:'k', shift:'K', keyCode:75};
var lKey = {ch:'l', shift:'L', keyCode:76};
var mKey = {ch:'m', shift:'M', keyCode:77};
var nKey = {ch:'n', shift:'N', keyCode:78};
var oKey = {ch:'o', shift:'O', keyCode:79};
var pKey = {ch:'p', shift:'P', keyCode:80};
var qKey = {ch:'q', shift:'Q', keyCode:81};
var rKey = {ch:'r', shift:'R', keyCode:82};
var sKey = {ch:'s', shift:'S', keyCode:83};
var tKey = {ch:'t', shift:'T', keyCode:84};
var uKey = {ch:'u', shift:'U', keyCode:85};
var vKey = {ch:'v', shift:'V', keyCode:86};
var wKey = {ch:'w', shift:'W', keyCode:87};
var xKey = {ch:'x', shift:'X', keyCode:88};
var yKey = {ch:'y', shift:'Y', keyCode:89};
var zKey = {ch:'z', shift:'Z', keyCode:90};	

window.onkeydown = checkKey;

function checkKey(e)
{
	e.preventDefault();
	switch(e.keyCode)
	{
		case aKey.keyCode:{
			if (e.shiftKey)
			{
				print(aKey.shift);
				return;
			}
			print(aKey.ch);		
			return;
		}
		case bKey.keyCode:{
			if (e.shiftKey)
			{
				print(bKey.shift);
				return;
			}
			print(bKey.ch);
			return;
		}
		case cKey.keyCode:{
			if (e.shiftKey)
			{
				print(cKey.shift);
				return;
			}
			print(cKey.ch);
			return;
		}
		case dKey.keyCode:{
			if (e.shiftKey)
			{
				print(dKey.shift);
				return;
			}
			print(dKey.ch);
			return;
		}
		case eKey.keyCode:{
			if (e.shiftKey)
			{
				print(eKey.shift);
				return;
			}
			print(eKey.ch);
			return;
		}
		case fKey.keyCode:{
			if (e.shiftKey)
			{
				print(fKey.shift);
				return;
			}
			print(fKey.ch);
			return;
		}
		case gKey.keyCode:{
			if (e.shiftKey)
			{
				print(gKey.shift);
				return;
			}
			print(gKey.ch);
			return;
		}
		case hKey.keyCode:{
			if (e.shiftKey)
			{
				print(hKey.shift);
				return;
			}
			print(hKey.ch);
			return;
		}
		case iKey.keyCode:{
			if (e.shiftKey)
			{
				print(iKey.shift);
				return;
			}
			print(iKey.ch);
			return;
		}
		case jKey.keyCode:{
			if (e.shiftKey)
			{
				print(jKey.shift);
				return;
			}
			print(jKey.ch);
			return;
		}
		case kKey.keyCode:{
			if (e.shiftKey)
			{
				print(kKey.shift);
				return;
			}
			print(kKey.ch);
			return;
		}
		case lKey.keyCode:{
			if (e.shiftKey)
			{
				print(lKey.shift);
				return;
			}
			print(lKey.ch);
			return;
		}
		case mKey.keyCode:{
			if (e.shiftKey)
			{
				print(mKey.shift);
				return;
			}
			print(mKey.ch);
			return;
		}		
		case nKey.keyCode:{
			if (e.shiftKey)
			{
				print(nKey.shift);
				return;
			}
			print(nKey.ch);
			return;
		}
		case oKey.keyCode:{
			if (e.shiftKey)
			{
				print(oKey.shift);
				return;
			}
			print(oKey.ch);
			return;
		}
		case pKey.keyCode:{
			if (e.shiftKey)
			{
				print(pKey.shift);
				return;
			}
			print(pKey.ch);
			return;
		}
		case qKey.keyCode:{
			if (e.shiftKey)
			{
				print(qKey.shift);
				return;
			}
			print(qKey.ch);
			return;
		}
		case rKey.keyCode:{
			if (e.shiftKey)
			{
				print(rKey.shift);
				return;
			}
			print(rKey.ch);
			return;
		}
		case sKey.keyCode:{
			if (e.shiftKey)
			{
				print(sKey.shift);
				return;
			}
			print(sKey.ch);
			return;
		}
		case tKey.keyCode:{
			if (e.shiftKey)
			{
				print(tKey.shift);
				return;
			}
			print(tKey.ch);
			return;
		}
		case uKey.keyCode:{
			if (e.shiftKey)
			{
				print(uKey.shift);
				return;
			}
			print(uKey.ch);
			return;
		}
		case vKey.keyCode:{
			if (e.shiftKey)
			{
				print(vKey.shift);
				return;
			}
			print(vKey.ch);
			return;
		}
		case wKey.keyCode:{
			if (e.shiftKey)
			{
				print(wKey.shift);
				return;
			}
			print(wKey.ch);
			return;
		}
		case xKey.keyCode:{
			if (e.shiftKey)
			{
				print(xKey.shift);
				return;
			}
			print(xKey.ch);
			return;
		}
		case yKey.keyCode:{
			if (e.shiftKey)
			{
				print(yKey.shift);
				return;
			}
			print(yKey.ch);
			return;
		}
		case zKey.keyCode:{
			if (e.shiftKey)
			{
				print(zKey.shift);
				return;
			}
			print(zKey.ch);
			return;
		}
		case 8:{ // Backspace
			deleteChar();
			return;
		}
		case 32:{ // Space
		    print('\u00a0');
			return;
		}
		case 13:{ // Enter
			newLine();
			return;
		}
	}
}

