var gl = null;

// 500 x 500
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

function init() 
{
	realign();
	var canvas = document.getElementById("canvas");
	gl = canvas.getContext("experimental-webgl");
	gl.clearColor(0.97, 0.97, 0.97, 1.0);
	initProgram();
	initBuffers();
	initTexture();
	animate();
}

var _position = null;
var texturePointer = null;

function initProgram()
{
	// and initShaders
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
	
	gl.uniform1i(gl.getUniformLocation(shaderProgram, "sampler"), 0);

	gl.enableVertexAttribArray(_position);
	gl.enableVertexAttribArray(texturePointer);
	
	gl.useProgram(shaderProgram);
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
	_texture.image.src = "ascii.gif";
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
		case 49:{ // 1
			// do nothing. Just being an example
			// can I use event handlers or something?
			// I'm going to have a lot of cases otherwise.
		return;
		}
	}
}

function clear(ctx) 
{
	ctx.viewport(0, 0, canvasWidth, canvasHeight);
	ctx.clear(ctx.COLOR_BUFFER_BIT);
}

