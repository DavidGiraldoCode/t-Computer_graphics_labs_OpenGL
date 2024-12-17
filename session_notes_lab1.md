# Session notes Lab1 - Rasterization

## Session 2024-12-10

Completed Task 1-3, and the main takeaways are:
- OpenGL offers debugging tools
- The Application stage define the attributes of the shape one wants to render.
- Those attributes are packed inside buffers, called **Buffer Objects (BO)**.
- This **BO** are assinged to the the **Vertex Array Object** with indexes, so they can be send to the geometry and pixel processing stages inside the vertex and fragment shaders.

### Summary
```C++
// In the application stage - CPU world
colors = {rgb,...}; // array holding the color values of each vertex
GLuint colorBuffer; // The buffer to be sent
GLuint vertexArrayObject; // The dictionary with all the buffers that represent the data of the shape

glGenBuffer(colorBuffer) 
glBindBuffer(colorBuffer)
glBufferData(colors) // Pass the data to the buffer

glGenVertexArray(vertexArrayObject)
glBindVectexArray(vertexArrayObject)

glBindBuffer(colorBuffer)
glVertexAttribPointer(0)
glEnableVertexAttribute(0)

// In the geometry processing stage - GPU world

layout(location = 0) in vec3 in_color; // The input from the application

out vec3 out_color; // The output of the vertex shader

// In the pixel processing stage - GPU world

in vec3 in_color;
layout(location = 0) in vec4 fragment_color;

fragment_color = vec4(in_color.rgb, 1);

```

### Doubts
- What does bind actully means? > As OpenGl is a State machine, this set the current buffer of OpenGL to point to the buffer we need to configure
- Are this buffers allocated in heap memory? > Yes, they are going to be sent to the VRAM of the GPU

## Session 2024-12-12

The creation of shaders in OpenGL follows this protocol (basically)
1. Create a shader (vertex / fragment), that is a pointer to the shaders.
2. Load the text files that contains the shading instructions
3. Define which the instructions as the source of which shader
4. Compile the shaders, and check for errors
5. Create the shader program that will hold the vertex and fragment shaders
6. Attach the compiled shaders to the shader program
7. Delete the pointer to the shaders, since the shader program will keep the pointer to the shaders alive
8. Link together all the shaders of the shader program

### Doubts
- Are this `GLint` and others alike pointers? 
Yes, and they can also be written as `unsigned int`

## Session 2024-12-17

**Takeaways**
- Defining buffers and Initializing shaders are two completly different task. Defining buffers allows us to tell OpenGL what type of data we are sending to the GPU, and what is the lay out of it [position, color, normal, textureCoodinate]. And initializing shaders allows us to tell OpenGL how do we want the data to be render, positions and colors.
- All of this (Defining buffer and initializing shaders) happens in the Application Stage of the Graphics Pipeline. Then, the instruction defined in the vertex shader are executed in the Geometry Processing stage and the fragment shader in the Pixel Processing stage.
- `uniforms` are variables that remain constans throughout the execution of the draw call. We can set a uniform from the CPU on the GPU by defining it in the shader like `uniform type name = value;`. The CPU defines the uniforms before telling OpenGL to do a Draw call.
