#include "aspectRatio.glsl"

    uniform vec2 uResolution;
    uniform vec2 uTextureSize;
    uniform float uHoverState;
    uniform sampler2D uTexture;
    varying  vec2 vUv;
    void main () {
        
    vec2 newUv = aspectRatio(uTextureSize, uResolution, vUv);


			vec2 p = newUv;
			float x = uHoverState;
			x = smoothstep(.0,1.0,(x*2.0+p.y-1.0));
			vec4 f = mix(
				texture2D(uTexture, (p-.5)*(1.-x)+.5), 
				texture2D(uTexture, (p-.5)*x+.5), 
				x);
			gl_FragColor = f;
    // gl_FragColor = texture2D(uTexture, newUv);

    }
