
vec2 aspectRatio ( vec2 textureSize, vec2 resolution, vec2 uv ) {

    vec2 s = resolution; // Screen
    vec2 i = textureSize; // Image
    float rs = s.x / s.y;
    float ri = i.x / i.y;
    vec2 new = rs < ri ? vec2(i.x * s.y / i.y, s.y) : vec2(s.x, i.y * s.x / i.x);
    vec2 offset = (rs < ri ? vec2((new.x - s.x) / 2.0, 0.0) : vec2(0.0, (new.y - s.y) / 2.0)) / new;
    vec2 newUv = uv * s / new + offset;

    return newUv;

}