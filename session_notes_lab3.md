# Session notes Lab3 - Camera & Animation

## Session 2025-01-06

![image of the unitcube transformation](https://www.opengl-tutorial.org/assets/images/tuto-3-matrix/homogeneous.png) 

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