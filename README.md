# Face Sticker
 
 
## Tools \& Platform choice
The project was developed in spark ar studio, a tool focused on exploring the shader effect and interaction. Decision was made after exploring both unity and spark AR and considering the time trade-off. 
Blendshape was made with blender.
### Installation
The file "challenge.arexport" need to be demonstrated with spark ar mobile app, which could be downloaded from [app store]() and [playstore](https://play.google.com/store/apps/details?id=com.facebook.arstudio.player&hl=en_US).
 
## Focused Features 
This face sticker is artistic style considering light, refraction, and morphy shape, inspired from the photography studio.
 
- Shader: Refraction effect with environment texture.
- Blendshape: blobs morphy their shapes continuously. 
- Texture: physical-based metallic texture reflected the spot lights, generating studio feeling.
 
## Interactions
script monitored two face gesture and lead the effect to two status: face normal state and face deformed state
###  Normal face state (Initial states)
- 4 blobs rotated around the face with refraction and light effect.
- The mouse openness could control blobs size.
When the mouse opened to a certain threshold (here is 0.58), the state changed to deformed state.
- The result is that the user swallowed blobs and made the face swollen. 
### Deformed face state
- User’s face is swollen.
- Users shake their heads to return the normal face status and generate more beauty shots.
 
## Future Improvement
The animation sequence was not implemented, otherwise the deformed chaning could be more smooth.
Multiple users interacted together, could be delivering blob with certain action and made it like a game.
 
 
 
 
 

