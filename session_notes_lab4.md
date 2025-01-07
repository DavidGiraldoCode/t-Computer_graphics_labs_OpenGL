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

- **Shader variables:**
The use and importance of uniforms become evident as we need to send the model-view-projection matrix to the vertex shader so that the vertices can be properly placed into the clipping space. That result is stored in gl_position in the case of GLSL. Also, normals should be transformed into the proper space using `inverse(transpose(viewMatrix * modelMatrix)).`

In this case, vertices and normals can be transformed into another coordinate system, such as the view matrix, for rendering. When passed to the rationalization stage, they will be interpolated to create fragments with their interpolated values for positions and normals based on the triangles that surround them.