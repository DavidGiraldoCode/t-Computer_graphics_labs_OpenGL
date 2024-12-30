# Session notes Lab2 - Textures

## Session 2024-12-23

- `GL_ARRAY_BUFFER` != `GL_ELEMENT_ARRAY_BUFFER`

## Session 2024-12-30

The main takeaways from the basic use of texture in Graphics
- A texture is a resource that stores data in a 1D, 2D, or 3D array, including color, normal, and roughness. It can be generated from procedures or images.
- An image texture lives on disk, and it needs to be loaded on the application stage to be sent to the GPU as a Texture unit.
- Fetching textures have a pipeline in themselves, as they are resources that need configuration to define how to render them.
- Filtering and wrapping behavior can be set at every frame.


### The texture pipeline goes:
1. Load texture from the disk into the application's working memory
2. Generate a texture object and assign an ID (Bind the texture to update the OpenGL state machine)
3. Load texture resources to the texture object (free the allocation of the previously loaded resource)
4. Define the behavior for wrapping and filtering.
5. On each frame, set the active texture and bind the texture that one needs to render.

**Important notes**
The triangle winding order must be counter-clockwise when defining the vertex indices.