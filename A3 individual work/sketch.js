//Claim the variables
const baseWidth = 1200;
const baseHeight = 800;

//To ensure the shape scales fits the window.
let scaleFactor;

//This class will create and manage an active shape with noise
class activeShape {
    constructor(points, scaleFactor) {
        this.points = points;
        this.scaleFactor = scaleFactor;
        this.maxShapeY = this.calculateMaxY();
    }

    calculateMaxY() {  
        //Function to get the maximum y value from shapePoints, 
        //use this technique from https://stackoverflow.com/questions/63236065/can-i-use-infinity-and-infinity-as-an-initial-value-for-max-and-min-variables
        let maxY = -Infinity;
        for (let pt of this.points) {
            if (pt.y > maxY) {
                maxY = pt.y;
            }
        }
        return maxY * this.scaleFactor;
    }

    //Draw the shape of landmark
    drawShape() {
        stroke(58, 37, 74, 150);
        strokeWeight(8);
        fill(74, 37, 37);
        beginShape();
        for (let pt of this.points) {
            let x = pt.x * this.scaleFactor;
            let y = pt.y * this.scaleFactor;
            vertex(x, y);
        }
        endShape(CLOSE);
    }

    //Make sure the lines created is inside the shape, use this technique from https://www.geeksforgeeks.org/how-to-check-if-a-given-point-lies-inside-a-polygon/
    isInsideShape(x, y) {
        let isInside = false;
        let j = this.points.length - 1;
        for (let i = 0; i < this.points.length; i++) {
            let xi = this.points[i].x * this.scaleFactor;
            let yi = this.points[i].y * this.scaleFactor;
            let xj = this.points[j].x * this.scaleFactor;
            let yj = this.points[j].y * this.scaleFactor;
            let intersect = ((yi > y) != (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) isInside = !isInside;
            j = i;
        }
        //To check if the point is inside the shape
        return isInside;
    }

    //Draw the reflection of the shape
    drawReflection() {
        //Find the x-coordinate of the highest point in the drawShape, 
        //use this technique from https://stackoverflow.com/questions/63236065/can-i-use-infinity-and-infinity-as-an-initial-value-for-max-and-min-variables
        let minY = Infinity;
        let highestX;
        for (let pt of this.points) {
            if (pt.y < minY) {
                minY = pt.y;
                highestX = pt.x;
            }
        }
        //Draw an ellipse for the reflection
        let diameter = 45 * this.scaleFactor;
        let spacing = diameter + 1;
        fill(74, 37, 37, 150);
        noStroke();
        let x = highestX * this.scaleFactor;
        for (let i = 0; i < 7; i++) {
            let y = waterStart + i * spacing + diameter * 2;
            ellipse(x, y, diameter * 1.5, diameter);
        }
    }
}

//Key points of the shape
let shapePoints = [
    {x: 31, y: 524}, {x: 87, y: 452}, {x: 135, y: 450}, {x: 146, y: 399},
    {x: 176, y: 449}, {x: 208, y: 436}, {x: 201, y: 172}, {x: 236, y: 30},
    {x: 272, y: 184}, {x: 286, y: 392}, {x: 297, y: 364}, {x: 311, y: 352},
    {x: 324, y: 309}, {x: 339, y: 348}, {x: 375, y: 382}, {x: 376, y: 428},
    {x: 429, y: 429}, {x: 475, y: 451}, {x: 492, y: 445}, {x: 501, y: 418},
    {x: 509, y: 448}, {x: 556, y: 479}, {x: 553, y: 503}, {x: 596, y: 526},
    {x: 624, y: 515}, {x: 718, y: 550}, {x: 712, y: 584}, {x: 400, y: 603},
    {x: 359, y: 609}, {x: 212, y: 608}, {x: 135, y: 603}, {x: 0, y: 603},
    {x: 0, y: 526}
];
//The maximum y value of shape
let maxShapeY;
//Fixed osition of water surface and bottom
let waterStart;
let waterEnd;
//Num of the wave rows
let rows = 5; 
let waveMaxHeight = 20; 
//Segment size for the pixelation effect
let segmentSize = 20; 

// Audio variables
let song;
let fft;
let numBins = 128;
let smoothing = 0.8;
let button;
//Load sound file
function preload() {
    //audio file from freesound https://freesound.org/people/Steve64gs/sounds/737782/
    song = loadSound("assets/737782__steve64gs__piano.wav");
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    //Calculate the scale factor
    scaleFactor = min(width / baseWidth, height / baseHeight);
    shape = new activeShape(shapePoints, scaleFactor);
    //Function to get the maximum y value from shapePoints
    calculateScaling();
    noLoop();

    //Create a new instance of p5.FFT() object
    fft = new p5.FFT(smoothing, numBins);
    song.connect(fft);

    //Add a "play/pause" button, and set its position and action
    button = createButton("Play/Pause");
    button.position((width - button.width) / 2, height - button.height - 10);
    button.mousePressed(play_pause);
    //Create a new instance of p5.Amplitude() object
    amplitude = new p5.Amplitude();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    //Reset the scale factor
    scaleFactor = min(width / baseWidth, height / baseHeight);
    shape = new activeShape(shapePoints, scaleFactor);
    calculateScaling();
    //Reset the position of the button
    button.position((width - button.width) / 2, height - button.height - 10);
    //Reset amplitude
    amplitude = new p5.Amplitude();
    redraw();
}

function calculateScaling() {
    //Get maxShapeY
    maxShapeY = shape.calculateMaxY();
    //Get the waterStart value from 90% of the height of the entire shape
    waterStart = maxShapeY * 0.9;
    //Let the value of waterEnd be at the bottom of the screen
    waterEnd = height * scaleFactor;
}

function draw() {
    drawBackground();
    shape.drawShape();
    drawTexture();
    drawTexture();
    drawWaves(rows);
    shape.drawReflection();
    applyPixelation();

    //Get audio spectrum data and use it for animation
    let spectrum = fft.analyze();
    //Use the first bin for wave amplitude
    let waveAmplitude = spectrum[0] / 255 * waveMaxHeight * 3;
    //Adjust waterStart based on audio
    waterStart = maxShapeY * 0.9 - waveAmplitude;
}

function drawBackground() {
    //Draw the sky, lerpColor is from https://p5js.org/reference/#/p5/lerpColor
    for (let i = 0; i < height * 0.5; i++) {
        let inter = map(i, 0, height * 0.5, 0, 1);
        let c = lerpColor(color(135, 206, 235), color(255, 140, 0), inter);
        stroke(c);
        line(0, i, width, i);
    }

    //Draw the transitation
    for (let i = height * 0.5; i < height * 0.6; i++) {
        let inter = map(i, height * 0.5, height * 0.6, 0, 1);
        let c = lerpColor(color(255, 140, 0), color(255, 69, 0), inter);
        stroke(c);
        line(0, i, width, i);
    }

    //Draw the water
    for (let i = height * 0.6; i < height; i++) {
        let inter = map(i, height * 0.6, height, 0, 1);
        let c = lerpColor(color(255, 69, 0), color(70, 130, 180), inter);
        stroke(c);
        line(0, i, width, i);
    }
}

//Function drawWaves uses the technique from https://editor.p5js.org/pippinbarr/sketches/bgKTIXoir
function drawWaves(number) {
    //Loop through all our rows and draw each wave
    //We loop "backwards" to draw them one on top of the other nicely
    for (let i = number; i >= 0; i--) {
        drawWave(i, number);
    }
}

function drawWave(n, rows) {
    //Calculate the base y for this wave based on an offset from the bottom of the canvas
    //and subtracting the number of waves to move up. We're dividing the wave height in order to make the waves overlap
    let baseY = waterStart + (waterEnd - waterStart) * (n / rows);
    //We'll start each wave at 0 on the x axis
    let startX = 0;
    push();
    // We'll use the HSB model to vary their color more easily
    colorMode(HSB);
    //Calculate the hue (0 - 360) based on the wave number, mapping it to an HSB hue value
    let hue = map(n, 0, rows, 200, 250);
    fill(hue, 60, 50, 0.5);
    noStroke();
    //We're using vertex-based drawing
    beginShape();
    //Starting vertex!
    vertex(startX, baseY);
    //Loop along the x axis drawing vertices for each point along the sine function in increments of 10
    for (let x = startX; x <= width; x += 10) {
        //Calculate the wave's y based on the sine function and the baseY
        let y = baseY + sin(x * 0.05 * scaleFactor) * waveMaxHeight * scaleFactor;
        //Draw our vertex
        vertex(x, y);
    }
    //Draw the final three vertices to close the shape around the edges of the canvas
    vertex(width, waterEnd);
    vertex(width, height);
    vertex(0, height);
    //Done!
    endShape(CLOSE);
    pop();
}

//Draw the texture inside the landmark
function drawTexture() {
    const numLines = 2000;
    const maxLength = 45;
    let startColor = color(255, 212, 148);
    let endColor = color(255, 90, 111);
    strokeWeight(1.5);
    for (let i = 0; i < numLines; i++) {
        let x1 = random(0, baseWidth) * scaleFactor;
        let y1 = random(0, maxShapeY);
        //Make the random angle
        let angle = random(TWO_PI);
        //Make the random length
        let length = random(10, maxLength);
        let x2 = x1 + cos(angle) * length;
        let y2 = y1 + sin(angle) * length;
        if (shape.isInsideShape(x1, y1) && shape.isInsideShape(x2, y2)) {
            //Use getLevel() to get the wavelength of audio, use the reference from https://p5js.org/zh-Hans/reference/#/p5.Amplitude
            let level = amplitude.getLevel();
            let l = map(level, 0, 1, 0, 300);
            console.log(`Level: ${level}, Mapped Level: ${l}`);
            //Set different gradient colors for different wavelengths of audio
            let c;
            if (l > 60) {
                c = lerpColor(startColor, endColor, 1); 
            } else if (l > 30) {
                c = lerpColor(startColor, endColor, 0.5);
            } else {
                c = lerpColor(startColor, endColor, 0);
            }
            //Draw line
            stroke(c);
            line(x1, y1, x2, y2);
        }
    }
}

//Create a pixel style
function applyPixelation() {
    loadPixels();
    //Loop through the canvas in steps of segmentSize, both horizontally and vertically
    for (let y = 0; y < height; y += segmentSize) {
        for (let x = 0; x < width; x += segmentSize) {
            //Get the color of the pixel at the center of the current segment
            let c = get(x, y);
            //Set the fill color to the color of the central pixel
            fill(c);
            //Disable the stroke for the rectangle to ensure a solid color fill
            noStroke();
            //Draw a rectangle covering the current segment
            rect(x, y, segmentSize, segmentSize);
        }
    }
}

// Audio control function
function play_pause() {
    if (song.isPlaying()) {
        song.stop();
        noLoop();
    } else {
        song.loop();
        loop();
    }
}

