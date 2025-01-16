varying vec2 vUv;
uniform float uTime;
uniform vec2 uHover;
uniform float uHoverState;
void main () {
    vec3 newPosition = position;
    float dist = distance(uHover, vUv);
        newPosition.z += uHoverState*(10.*sin((newPosition.x +uTime*0.2)*10.)+dist*20.);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    vUv = uv;
}