uniform sampler2D uTexture;
varying vec2 vUv;
uniform float uTime;
uniform vec2 uHover;

void main () {
    gl_FragColor = texture2D(uTexture, vUv);
}