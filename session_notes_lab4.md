# Session notes Lab4 - Shading

## Session notes 2025-01-07

- **Be mindful of the multiplication hierarchy and the precission**
```C++
// Here the falloff is correctly computed, as the d us squared before devides 1.
vec3 Li = point_light_intensity_multiplier * point_light_color * (1.0f / (d * d));

// but here it is not, d is diving 1.0f and then is multiplied again by d
vec3 Li = point_light_intensity_multiplier * point_light_color * (1.0f / d * d);
```

In view space, if the positions of vertices get transformed into this coordinate system, is easier to perfomr other algorithms such as ray tracing and ray marching, as the camera is at the origin.