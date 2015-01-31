var skin = []; // binary array

document.getElementById("skin").onload = function() {
    var c = document.getElementById("skinCanvas");
    var ctx = c.getContext("2d");
    var img = document.getElementById("skin");
    ctx.drawImage(img, 0, 0);
    var imgData = ctx.getImageData(0, 0, c.width, c.height);

    var i;
	var k = 0;
    var average;
    for (i = 0; i < imgData.data.length; i += 4) {
         average = (imgData.data[1]+imgData.data[i+1]+imgData.data[i+2])/3;
        if (average>=128)
        {
            skin[i-(k*3)] = 1;
        } else {
			skin[i-(k*3)] = 0;
		}
		k++;
    }
}

var gl = null;

var canvasWidth = 500;
var canvasHeight = 500;

function realign()
{
	var w = window.innerWidth;
	var h = window.innerHeight;
	
	var canvas = document.getElementById("canvas");
	canvas.style.top = ((h / 2) - (canvasWidth / 2)) + "px";
	canvas.style.left = ((w / 2) - (canvasHeight / 2)) + "px";
}

var vertexShaderSource = "\n\
attribute vec2 position;\n\
attribute vec2 aTextureCoord;\n\
varying highp vec2 vTextureCoord;\n\
\n\
void main(void) {\n\
gl_Position = vec4(position, 0., 1.);\n\
vTextureCoord = aTextureCoord;\n\
}";

var fragmentShaderSource = "\n\
precision mediump float;\n\
varying highp vec2 vTextureCoord;\n\
uniform sampler2D sampler;\n\
\n\
void main(void) {\n\
gl_FragColor = texture2D(sampler, vec2(vTextureCoord.s/2.-.5, vTextureCoord.t/2.-.5));\n\
}";

var aKey = {index:1, shiftIndex:27, keyCode:65};
var bKey = {index:2, shiftIndex:28, keyCode:66};
var cKey = {index:3, shiftIndex:29, keyCode:67};
var dKey = {index:4, shiftIndex:30, keyCode:68};
var eKey = {index:5, shiftIndex:31, keyCode:69};
var fKey = {index:6, shiftIndex:32, keyCode:70};
var gKey = {index:7, shiftIndex:33, keyCode:71};
var hKey = {index:8, shiftIndex:34, keyCode:72};
var iKey = {index:9, shiftIndex:35, keyCode:73}; //problum
var jKey = {index:10, shiftIndex:36, keyCode:74}; //problum
var kKey = {index:11, shiftIndex:37, keyCode:75};
var lKey = {index:12, shiftIndex:38, keyCode:76};
var mKey = {index:13, shiftIndex:39, keyCode:77};
var nKey = {index:14, shiftIndex:40, keyCode:78};
var oKey = {index:15, shiftIndex:41, keyCode:79};
var pKey = {index:16, shiftIndex:42, keyCode:80};
var qKey = {index:17, shiftIndex:43, keyCode:81};
var rKey = {index:18, shiftIndex:44, keyCode:82};
var sKey = {index:19, shiftIndex:45, keyCode:83};
var tKey = {index:20, shiftIndex:46, keyCode:84};
var uKey = {index:21, shiftIndex:47, keyCode:85};
var vKey = {index:22, shiftIndex:48, keyCode:86};
var wKey = {index:23, shiftIndex:49, keyCode:87};// probably more problems
var xKey = {index:24, shiftIndex:50, keyCode:88};
var yKey = {index:25, shiftIndex:51, keyCode:89};
var zKey = {index:26, shiftIndex:52, keyCode:90};

var charX = 8;
var charY = 12;

var map = [];
var count = 1;
var coord = {x:0, y:0};
for (var i=0; i<16; i++)
{
	for (var j=0; j<10; j++)
	{
		coord.x = i*charX;
		coord.y = j*charY;
		map[count] = coord;
		count++;
	}
}

var charArray = [];
var currentPosition = 0;

function print(index)
{
	charArray[currentPosition] = index;
	currentPosition++;
}

function delete()
{
	charArray[currentPosition] = 0;
	currentPosition--;
}

function init() 
{
	realign();
	var canvas = document.getElementById("canvas");
	gl = canvas.getContext("experimental-webgl");
	gl.clearColor(0.97, 0.97, 0.97, 1.0);
	initTexture();
	initProgram();
	initBuffers();
	animate();
}

var _position = null;
var texturePointer = null;

function initProgram()
{
	var getShader = function(source, type) {
		var shader = gl.createShader(type);
		gl.shaderSource(shader, source);
		gl.compileShader(shader);
		return shader;
	};
	
	var vertexShader = getShader(vertexShaderSource, gl.VERTEX_SHADER);
	
	var fragmentShader = getShader(fragmentShaderSource, gl.FRAGMENT_SHADER);
	
	var shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	
	gl.linkProgram(shaderProgram);
	
	_position = gl.getAttribLocation(shaderProgram, "position");
	
	texturePointer = gl.getAttribLocation(shaderProgram, "aTextureCoord");
	
	gl.enableVertexAttribArray(_position);
	gl.enableVertexAttribArray(texturePointer);
	
	gl.useProgram(shaderProgram);
	
	gl.uniform1i(gl.getUniformLocation(shaderProgram, "sampler"), 0);
}

var VBO = null;
var IBO = null;

function initBuffers()
{
	var triangleVertex = [
		-1, -1,
		1, -1,
		1, 1,
		-1, 1
	];
	
	var triangleFaces = [
		0, 1, 2,
		0, 2, 3
	];
	
	VBO = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, VBO);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertex), gl.STATIC_DRAW);

	IBO = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, IBO);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(triangleFaces), gl.STATIC_DRAW);
}
var _texture;

function initTexture()
{
	_texture = gl.createTexture();
	_texture.image = new Image();
	_texture.image.onload = function() {
		handleLoadedTexture(_texture);
	}
	_texture.image.crossOrigin = "anonymous";
	_texture.image.src = "skin.png";
}
	
function handleLoadedTexture(texture)
{
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);	
}

function animate()
{
	clear(gl);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, VBO);
	gl.vertexAttribPointer(_position, 2, gl.FLOAT, false, 4*2, 0);
	gl.vertexAttribPointer(texturePointer, 2, gl.FLOAT, false, 0, 0);
	
	gl.activeTexture(gl.TEXTURE0)
	gl.bindTexture(gl.TEXTURE_2D, _texture);
	
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, IBO);
	gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
	gl.flush();
	
	window.requestAnimationFrame(animate);
}
	
window.onkeydown = checkKey;

function checkKey(e)
{
	switch(e.keyCode)
	{
		case aKey.keyCode:{
			if (e.shiftKey)
			{
				print(aKey.shiftIndex);
				return;
			}
			print(aKey.index);		
			return;
		}
		case bKey.keyCode:{
			if (e.shiftKey)
			{
				print(bKey.shiftIndex);
				return;
			}
			print(bKey.index);
			return;
		}
		case cKey.keyCode:{
			if (e.shiftKey)
			{
				print(cKey.shiftIndex);
				return;
			}
			print(cKey.index);
			return;
		}
		case dKey.keyCode:{
			if (e.shiftKey)
			{
				print(dKey.shiftIndex);
				return;
			}
			print(dKey.index);
			return;
		}
		case eKey.keyCode:{
			if (e.shiftKey)
			{
				print(eKey.shiftIndex);
				return;
			}
			print(eKey.index);
			return;
		}
		case fKey.keyCode:{
			if (e.shiftKey)
			{
				print(fKey.shiftIndex);
				return;
			}
			print(fKey.index);
			return;
		}
		case gKey.keyCode:{
			if (e.shiftKey)
			{
				print(gKey.shiftIndex);
				return;
			}
			print(gKey.index);
			return;
		}
		case hKey.keyCode:{
			if (e.shiftKey)
			{
				print(hKey.shiftIndex);
				return;
			}
			print(hKey.index);
			return;
		}
		case iKey.keyCode:{
			if (e.shiftKey)
			{
				print(iKey.shiftIndex);
				return;
			}
			print(iKey.index);
			return;
		}
		case jKey.keyCode:{
			if (e.shiftKey)
			{
				print(jKey.shiftIndex);
				return;
			}
			print(jKey.index);
			return;
		}
		case kKey.keyCode:{
			if (e.shiftKey)
			{
				print(kKey.shiftIndex);
				return;
			}
			print(kKey.index);
			return;
		}
		case lKey.keyCode:{
			if (e.shiftKey)
			{
				print(lKey.shiftIndex);
				return;
			}
			print(lKey.index);
			return;
		}
		case mKey.keyCode:{
			if (e.shiftKey)
			{
				print(mKey.shiftIndex);
				return;
			}
			print(mKey.index);
			return;
		}		
		case nKey.keyCode:{
			if (e.shiftKey)
			{
				print(nKey.shiftIndex);
				return;
			}
			print(nKey.index);
			return;
		}
		case oKey.keyCode:{
			if (e.shiftKey)
			{
				print(oKey.shiftIndex);
				return;
			}
			print(oKey.index);
			return;
		}
		case pKey.keyCode:{
			if (e.shiftKey)
			{
				print(pKey.shiftIndex);
				return;
			}
			print(pKey.index);
			return;
		}
		case qKey.keyCode:{
			if (e.shiftKey)
			{
				print(qKey.shiftIndex);
				return;
			}
			print(qKey.index);
			return;
		}
		case rKey.keyCode:{
			if (e.shiftKey)
			{
				print(rKey.shiftIndex);
				return;
			}
			print(rKey.index);
			return;
		}
		case sKey.keyCode:{
			if (e.shiftKey)
			{
				print(sKey.shiftIndex);
				return;
			}
			print(sKey.index);
			return;
		}
		case tKey.keyCode:{
			if (e.shiftKey)
			{
				print(tKey.shiftIndex);
				return;
			}
			print(tKey.index);
			return;
		}
		case uKey.keyCode:{
			if (e.shiftKey)
			{
				print(uKey.shiftIndex);
				return;
			}
			print(uKey.index);
			return;
		}
		case vKey.keyCode:{
			if (e.shiftKey)
			{
				print(vKey.shiftIndex);
				return;
			}
			print(vKey.index);
			return;
		}
		case wKey.keyCode:{
			if (e.shiftKey)
			{
				print(wKey.shiftIndex);
				return;
			}
			print(wKey.index);
			return;
		}
		case xKey.keyCode:{
			if (e.shiftKey)
			{
				print(xKey.shiftIndex);
				return;
			}
			print(xKey.index);
			return;
		}
		case yKey.keyCode:{
			if (e.shiftKey)
			{
				print(yKey.shiftIndex);
				return;
			}
			print(yKey.index);
			return;
		}
		case zKey.keyCode:{
			if (e.shiftKey)
			{
				print(zKey.shiftIndex);
				return;
			}
			print(zKey.index);
			return;
		}
		case 46:{ // Delete
			if (e.shiftKey)
			{
				delete();delete();delete();delete();delete();
				return;
			}
			delte();
			return;
		}
	}
}

function clear(ctx) 
{
	ctx.viewport(0, 0, canvasWidth, canvasHeight);
	ctx.clear(ctx.COLOR_BUFFER_BIT);
}

