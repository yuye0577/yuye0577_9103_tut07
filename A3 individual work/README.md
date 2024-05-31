# A3 Individual task

## How to interact with the work:
Click the "Play/Pause" button at the bottom and wait for the music to start. The music is looped. Click the button again to pause.

## Selected animation method:
Audio

## Animated images and methods:
- Waves: changed size
- Textures in landmarks: changed colours

## Inspiration: 
### Waves:
![First image of waves inspiration](<assets/Wave animative inspiration.gif>)
#### ![Reference of wave inspiration](https://blog.ninapaley.com/2015/04/15/strange-waves/)
I carefully observed this GIF. It uses the way the wave moves upward, which gives me a visual feeling of the water surface flowing. This is similar to the waves on the water drawn in our basic code, and this effect allows me to use it in the code to animate. Observing the changes in color gave me new inspiration, and I thought that I could make the water look flowing by changing the transparency.

### Textures in landmarks: 
![Second image of textual inspiration](<assets/Textual of landmark animative inspiration.gif>)
#### ![Reference of textual inspiration](https://www.google.com/url?sa=i&url=https%3A%2F%2Fwifflegif.com%2Fgifs%2F13766-buildings-lights-gif&psig=AOvVaw3FKYb4ZjptmO-iIBk9OBtO&ust=1717233455353000&source=images&cd=vfe&opi=89978449&ved=0CBEQjRxqFwoTCOCroPbHt4YDFQAAAAAdAAAAABAn)
This animated image interprets the feeling of the city's staggered lights through the successive opening and closing of the room lights in each window of the building. It enriches my vision in the picture, although this is not a regular change. I thought that I could use the lines on the landmark buildings and the pixel effect we used to overlay in the code to achieve a shadowy lighting effect. By changing the *lights* (which is, the lines in the `texture` with pixels) in sync with the audio frequency, we can create a visual and auditory unity and make the picture more dynamic.

## A short technical explanation: 
- Group code:
By using `calculateMaxY()`, the shape is related to the location of the water's surface.
`drawShape()` is a method for drawing shapes includes particular drawing logic.  This technique is reliant on the scaling factor and point data of the instance. 
The function `isInsideShape(x, y)` can be used to determine if a point is inside a shape or not. The particular shape is connected to its detecting logic. 
The `drawReflection()` function can be used to draw the reflection of the shape. This technique is based on identifying the highest point of the shape. 
By grouping all form-related actions together and modularizing the code in this fashion, many global variables may be avoided and each shape object is given the freedom to independently control its own state and behavior.
The use of `this.` ensures that each instance in the class does not interfere with each other and can have its own properties and behaviors.

- Waves:
`waterStart` is used as a global variable in the waves function, which determines the height of the wave in the picture. I use `fft.analyze()` to get the spectrum data of the current audio, use `waveAmplitude` to calculate the amplitude of the wave, and finally adjust the value of waterStart according to the wave amplitude so that the overall height of the wave moves up and down with the rhythm of the music, making the wave look animated. The following is part of the code in `draw()` function:
```
//Get audio spectrum data and use it for animation
    let spectrum = fft.analyze();
    //Use the first bin for wave amplitude
    let waveAmplitude = spectrum[0] / 255 * waveMaxHeight * 3;
    //Adjust waterStart based on audio
    waterStart = maxShapeY * 0.9 - waveAmplitude;
```

- Textures in landmarks:
In the `drawTexture()` function, let is used to define the two key colors of the start and end. Using the method in ![Reference of get level](https://p5js.org/zh-Hans/reference/#/p5.Amplitude), first use `level = amplitude.getLevel()` to get the amplitude (volume) value of the current audio, ranging from 0 to 1. Then use `l = map(level, 0, 1, 0, 300)` to map the volume value to a value between 0 and 300. Here I use `console.log(`Level: ${level}, Mapped Level: ${l}`);` to view the approximate range of the values ​​of `level` and `l`. Use let to define c, then adjust the threshold of the color range according to the printed results, and use if else statements to represent each color segment separately. The following is part of the code in `drawTexture()` function:
```
let startColor = color(255, 212, 148);
let endColor = color(255, 90, 111);
```
```
//Use getLevel() to get the wavelength of audio, use the reference from https://p5js.org/zh-Hans/reference/#/p5.Amplitude
let level = amplitude.getLevel();
let l = map(level, 0, 1, 0, 300);
//Use console.log(`Level: ${level}, Mapped Level: ${l}`); check the value.
//Set different gradient colors for different wavelengths of audio
let c;
if (l > 60) {
    c = lerpColor(startColor, endColor, 1); 
} else if (l > 30) {
    c = lerpColor(startColor, endColor, 0.5);
} else {
    c = lerpColor(startColor, endColor, 0);
}
```
