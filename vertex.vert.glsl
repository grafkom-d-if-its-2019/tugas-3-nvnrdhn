precision mediump float;

attribute vec3 vPosition;
attribute vec3 vColor;
varying vec3 fColor;
uniform mat4 modelMatrix, viewMatrix, projectionMatrix;

void main() {
  fColor = vColor;
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(vPosition, 1.0);
}