#include <vector>
#include <string>
#include <GL/glew.h>

namespace labhelper {
	GLuint loadHdrTexture(const std::string &filename);
	GLuint loadHdrTexture(const std::string& filename, const char* label); // Added for debbugin in Render Doc
	GLuint loadHdrMipmapTexture(const std::vector<std::string> &filenames);

	void saveHdrTexture(const std::string &filename, GLuint texture);
}