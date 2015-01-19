var vertexShaderSource = "\n\
attribute vec2 position; //the position of the point\n\
attribute vec2 aTextureCoord;\n\
varying highp vec2 vTextureCoord;\n\
\n\
void main(void) { //pre-built function\n\
gl_Position = vec4(position, 0., 1.); //0. is the z, and 1 is w\n\
vTextureCoord = aTextureCoord;\n\
}";

var fragmentShaderSource = "\n\
precision mediump float;\n\
varying highp vec2 vTextureCoord;\n\
uniform sampler2D sampler;\n\
\n\
void main(void) {\n\
gl_FragColor = texture2D(sampler, vec2(vTextureCoord.s, vTextureCoord.t));\n\
}";