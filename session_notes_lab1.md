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
- What does bind actully means?
- Are this buffers allocated in heap memory?