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

## Session notes 2025-01-08

Main takeaways:
### Physically-based shading
- **Multifaceted theory:** The assumption that all materials are composed of multiple faces with normals that behave like perfect mirrors at a microscopic level. By using a function that determines the probability density that an incoming light source creates a half vector equal to the normal, we can determine how much light is reflected. This function is the Bidirection Reflectance Distribution Function, which has a Multifacet, Fresnel, and Masking function.
The metallic term determines how much light is reflected, while the dielectric term is how much light that is refracted gets bounced off. We blend these two terms using linear interpolation.

- **Direct illumination:** The influence of a light source on the material. Thus, the direct illumination term has to be computed each time for each light source.
- **Indirect illumination:** The influence of the environment. In real-time graphics, one has to take shortcuts. Instead of computing the light coming from every position direction, we use pre-convolve maps to fetch light information and render it onto the fragments that represent the surfaces of a mesh. 

### Environment map
A brilliant solution to creating the perception of background on the horizon, under the assumption that the player will never get there, is to render a Full-screen quad in screen space coordinates and sample a hair environment texture map.
- Compute world space positions of fragments on the near plane to determine where to sample on the map by computing the viewing direction.
- The assumption is that the environment is infinitesimally far and that position will not affect the viewing results; thus, only a normalized direction can be used to determine spherical coordinates.
- Transforming the UV texture coordinates to clip space. 
`vec4(texCoord * 2.0 - 1.0, 1.0, 1.0);`