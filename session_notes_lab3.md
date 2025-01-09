# Session notes Lab3 - Camera & Animation

## Session 2025-01-06

- Recall the product of `M * V` is a vector, while the product of a `M * T` is another matrix. Thats why the identity matrix is the starting point.

```C++
vec3 carForward = { 0.0f, 0.0f, 1.0f };
vec3 carRight	= { 1.0f, 0.0f, 0.0f };
float carSpeed	= 10.0f;

// Multiply the direction by the speed and scale down by the time.
carForward *= carSpeed * deltaTime;

// Create the vector in homogeneous coordinates with W component 1.0f
vec4 velocity = vec4(carForward, 1.0f);

// Create the identity matrix.
mat4 transVelocity(1.0f);
// Change the W column (row in OpenGL) by the translation vector to create the translation matrix
transVelocity[3] = velocity;

// Multiply the translation matrix by the carModelMatrix to update it transform.
carModelMatrix = carModelMatrix * transVelocity;
```

**The importance of multiplication order**

```C++
float delta = rotationSpeed * deltaTime * -1;
mat4 rotationYMatrix = { cos(delta), 0.0f, -sin(delta),  0.0f, // X
						0.0f,	   1.0f,	0.0f,	   0.0f, // Y
					   sin(delta), 0.0f, cos(delta),   0.0f, // Z
						0.0f,      0.0f,    0.0f,      1.0f  // W
};

// This applies the translation first, cause a wrong rotation, as the pivot has been offseted.
carModelMatrix = rotationYMatrix * T;

// This applies the translation after the rotation has been applied.
carModelMatrix = T * rotationYMatrix;
```

# References
- https://www.opengl-tutorial.org/beginners-tutorials/tutorial-3-matrices/
- http://www.c-jump.com/bcc/common/Talk3/Math/GLM/GLM.html 

## Session 2025-01-07

- **How do you draw two objects that have the same mesh?**

The OBJ model gets loaded and saved using a pointer that several instances can use for rendering. The draw call can be made on the same mesh several times, but the important part is what `modelMatrix` we pass to the shader program. Because this determines the location. This also makes it clear that each draw call writes color data into the frame buffer, and depending on the modelMatrix we pass as uniform in the vertex shader, the rendering primitive will be rasterized in other locations on the screen, given the impression of multiple, distinct entities on the game.

- **How do you move an object based on the time?**

One way of doing it is offsetting the pivot by applying the translation first by the radius and then the rotation, which changes based on time:
```C++
carTwoModelMatrix = translate(roundaboutRadius);

float delta = M_PI * -0.5 * currentTime;
carTwoModelMatrix = rotate(delta, vec3(0.f, 1.f, 0.f)) * carTwoModelMatrix;
carTwoModelMatrix = translate(roundaboutCenter) * carTwoModelMatrix;
```
A cleaner approach is proposed by the professor:
```C++
float delta = M_PI * -0.5 * currentTime;
vec3 yAxis = vec3(0.f, 1.f, 0.f);

mat4 rotationM = rotate(delta, yAxis);
vec3 transformedVector = rotationM * vec4(roundaboutRadius, 1.0f);
mat4 translationRadius = translate(transformedVector);
mat4 translationCenter = translate(roundaboutCenter);

carTwoModelMatrix = translationCenter * translationRadius * rotationM;
```
This approach keeps the rotation as the first transformation. The key concept is that the translation vector, built from the radius, gets transformed first by the rotation. So, the rotation is carried on through the matrices, following this algorithm:

1. Rotate the model
2. Rotate the right translation vector
3. Translate the rotated model along the rotated translation vector
4. Translate the result to the location we need.

- **How do you define a camera?**

It is an infinitesimal small point in world space defined by a position vector $Cp$ and a viewing direction $Cd$. Using these two vectors, the `viewMatrix` is built.
The camera right vector is given by the (normalized) cross product between the $Cd X Up_worldSpace$. Then, the camera up vector is derived from the (normalized) cross product between the $Cright X Cd$.

This builds the Camera base vector in world space:
```
mat3 CameraBaseVectorWS = {
    Cr_x Cup_x -Cd_x 
    Cr_y Cup_y -Cd_y
    Cr_z Cup_z -Cd_z
}

// The transpose matrix that builds the rotation
mat4 rotatioCamera = {
    Cr_x   Cr_y   Cr_z   0 
    Cup_x  Cup_y  Cup_z  0
   -Cd_x  -Cd_y  -Cd_z   0
    0       0       0    1
}

```
By transposing, the rotation matrix is given with respect to the camera.
The ViewMatrix is used to take the model matrix and place the vertices of a mesh in a new position with respect to the camera, as if the camera were placed in the origin, looking toward the minus z-axis, x being right and y up. Then, the projection matrix wraps or morphs everything into the unit cube or canonical view volume, or clipping space, to pass all the vertices to the clipping stage.

![image of the unitcube transformation](https://www.opengl-tutorial.org/assets/images/tuto-3-matrix/homogeneous.png) 
