#version 420

// required by GLSL spec Sect 4.5.3 (though nvidia does not, amd does)
precision highp float;

///////////////////////////////////////////////////////////////////////////////
// Material
///////////////////////////////////////////////////////////////////////////////
uniform vec3 material_color;
uniform float material_metalness;
uniform float material_fresnel;
uniform float material_shininess;
uniform vec3 material_emission;

uniform int has_color_texture;
layout(binding = 0) uniform sampler2D colorMap;
uniform int has_emission_texture;
layout(binding = 5) uniform sampler2D emissiveMap;

///////////////////////////////////////////////////////////////////////////////
// Environment
///////////////////////////////////////////////////////////////////////////////
layout(binding = 6) uniform sampler2D environmentMap;
layout(binding = 7) uniform sampler2D irradianceMap;
layout(binding = 8) uniform sampler2D reflectionMap;
uniform float environment_multiplier;

///////////////////////////////////////////////////////////////////////////////
// Light source
///////////////////////////////////////////////////////////////////////////////
uniform vec3 point_light_color = vec3(1.0, 1.0, 1.0);
uniform float point_light_intensity_multiplier = 50.0;

///////////////////////////////////////////////////////////////////////////////
// Constants
///////////////////////////////////////////////////////////////////////////////
#define PI 3.14159265359

///////////////////////////////////////////////////////////////////////////////
// Input varyings from vertex shader
///////////////////////////////////////////////////////////////////////////////
in vec2 texCoord;
in vec3 viewSpaceNormal;
in vec3 viewSpacePosition;

///////////////////////////////////////////////////////////////////////////////
// Input uniform variables
///////////////////////////////////////////////////////////////////////////////
uniform mat4 viewInverse;
uniform vec3 viewSpaceLightPosition;

///////////////////////////////////////////////////////////////////////////////
// Output color
///////////////////////////////////////////////////////////////////////////////
layout(location = 0) out vec4 fragmentColor;


vec3 calculateDirectIllumiunation(vec3 wo, vec3 n, vec3 base_color)
{
	vec3 direct_illum = base_color;
	///////////////////////////////////////////////////////////////////////////
	// Calculate the radiance Li from the light, and the direction
	//            to the light. If the light is backfacing the triangle,
	//            return vec3(0);
	///////////////////////////////////////////////////////////////////////////
	vec3 fragmentToLight = viewSpaceLightPosition.xyz - viewSpacePosition.xyz;
	float d = length(fragmentToLight);		// Distance to the light source,  falloff_factor 1/d*d 

	vec3 wi = normalize(fragmentToLight);	// incoming direction

	float nDotWi = dot(n, wi);
	if( nDotWi <= 0)
		return vec3(0);

	vec3 Li = point_light_intensity_multiplier * point_light_color * (1.0f / (d * d)); // Li
	
	///////////////////////////////////////////////////////////////////////////
	// Calculate the diffuse term and return that as the result
	///////////////////////////////////////////////////////////////////////////
	vec3 diffuse_term = (1.0f / PI) * base_color * abs(nDotWi) * Li;

	///////////////////////////////////////////////////////////////////////////
	// Calculate the Torrance Sparrow BRDF and return the light
	//          reflected from that instead
	///////////////////////////////////////////////////////////////////////////

	float nDotWo	 = dot(n,wo);
	//	  nDotWi is already defined
	vec3  wh		= normalize(wi + wo).xyz;
	float nDotWh	= dot(n,wh);
	float woDotWi	= dot(wo, wi);
	float woDotWh	= dot(wo, wh);
	float whDotWi	= dot(wh, wi);

	//Fresnell term; models how much light is reflected
	float ro = material_fresnel;
	float Fresnel_wi = ro + (1 - ro) * pow((1 - whDotWi), 5);

	//Multifacet Distribution Function, models the density of multifacets with a normal equal to the half vector between the incoming and outgoing light
	float s = material_shininess;
	float DistMultifacet_wh = ((s + 2) / (2 * PI)) * pow(nDotWh, s);

	//Shadow / Masking function, models the phenomena where multifactes' incoming or outgoing radiance gets block by other multifacet at grazing angles
	float outgoing = (nDotWh * nDotWo) / woDotWh;
	float incoming = (nDotWh * nDotWi) / woDotWh;

	float GShadowing_wiwo = min(1, min(2 * outgoing, 2 * incoming));

	float brdf = (Fresnel_wi * DistMultifacet_wh * GShadowing_wiwo) / (4 * nDotWo * nDotWi);

	
	// Metal term: All the light that was refracted gets transform to heat, and the reflected get the color of the material
	vec3 metalTerm = brdf * base_color * nDotWi * Li;

	// Dielectric term: All the light that gets refracted, bounces off on another direction, modeled using diffuse_term
	vec3 dielectricTerm = brdf * nDotWi * Li + (1 - Fresnel_wi) * diffuse_term;

	// Blending between metal and dielectric terms.
	direct_illum = material_metalness * metalTerm + (1 - material_metalness) * dielectricTerm;

	return direct_illum;
}

vec3 calculateIndirectIllumination(vec3 wo, vec3 n, vec3 base_color)
{
	vec3 indirect_illum = vec3(0.f);
	///////////////////////////////////////////////////////////////////////////
	// Lookup the irradiance from the irradiance map and calculate
	//          the diffuse reflection
	///////////////////////////////////////////////////////////////////////////

	// Transform normals in View space to World Space
	// This gives the direction to where to fetch the irrandiance data
	vec3 n_ws = vec3(viewInverse * vec4(n, 0.0f));

	// Calculate the spherical coordinates of the direction
	float theta = acos(max(-1.0f, min(1.0f, n_ws.y)));
	float phi = atan(n_ws.z, n_ws.x);
	if(phi < 0.0f)
	{
		phi = phi + 2.0f * PI;
	}

	vec2 lookupUVCoord = vec2(phi / (2.0 * PI), 1 - theta / PI);

	// also called Li 
	vec3 irrandiance = vec3(environment_multiplier * texture(irradianceMap, lookupUVCoord));
	
	// Diffuse term of the inderect illumination
	float diffuseBRDF = 1 / PI;
	vec3 diffuseTermII = base_color * diffuseBRDF * irrandiance;

	///////////////////////////////////////////////////////////////////////////
	// Look up in the reflection map from the perfect specular
	//          direction and calculate the dielectric and metal terms.
	///////////////////////////////////////////////////////////////////////////

	// The wi incoming direction in view space
	vec3 recflection = normalize((2 * dot(n, wo)) * n - wo);

	// Also called Wr
	vec3 wi_ws =  normalize(vec3(viewInverse * vec4(recflection, 0.0f)));

	// Calculate the spherical coordinates of the direction
	theta = acos(max(-1.0f, min(1.0f, wi_ws.y)));
	phi = atan(wi_ws.z, wi_ws.x);
	if(phi < 0.0f)
	{
		phi = phi + 2.0f * PI;
	}

	lookupUVCoord = vec2(phi / (2.0 * PI), 1 - theta / PI);
	float roughness = sqrt(sqrt(2.0 / (material_shininess + 2)));
	
	// incoming radiance 
	vec3 randiance = vec3(environment_multiplier * textureLod(reflectionMap, lookupUVCoord, roughness * 7.0));

	// Metallic term
	vec3  wh		= normalize(recflection + wo).xyz; // wi + wo in view space
	float woDotWh	= max( 0.0, dot(wo, wh));

	float fresnell = material_fresnel + ( 1.0 - material_fresnel) * pow(1.0 - woDotWh, 5);

	vec3 metalicTerm = fresnell * base_color * randiance;

	vec3 dielectricTerm = fresnell * randiance + (1 - fresnell ) * diffuseTermII;

	// Blending between metal and dielectric terms.
	vec3 microfacetTerm = material_metalness * metalicTerm + (1.0f - material_metalness) * dielectricTerm;

	indirect_illum = microfacetTerm;

	return indirect_illum;
}


void main()
{
	vec3 wo = -normalize(viewSpacePosition);
	vec3 n = normalize(viewSpaceNormal);

	vec3 base_color = material_color;
	if(has_color_texture == 1)
	{
		base_color *= texture(colorMap, texCoord).rgb;
	}

	// Direct illumination
	vec3 direct_illumination_term = calculateDirectIllumiunation(wo, n, base_color);

	// Indirect illumination
	vec3 indirect_illumination_term = calculateIndirectIllumination(wo, n, base_color);

	///////////////////////////////////////////////////////////////////////////
	// Add emissive term. If emissive texture exists, sample this term.
	///////////////////////////////////////////////////////////////////////////
	vec3 emission_term = material_emission;
	if(has_emission_texture == 1)
	{
		emission_term *= texture(emissiveMap, texCoord).rgb;
	}

	fragmentColor.rgb = direct_illumination_term + indirect_illumination_term + emission_term;
}
