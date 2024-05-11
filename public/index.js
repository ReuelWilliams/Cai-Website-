let svgWidth = 200;
let svgHeight = 100;
let signalXLimits = [50, 150];
let signalY = 65;
let signalHeight = 20;
// TODO: speed is a magic number
let speed = 500;

function expensiveEase(t, alpha) { // t in [0,1]
    let power = Math.pow(t, alpha);
    let complementPower = Math.pow(1 - t, alpha);
    return power / (power + complementPower);
}

function normalize(t, a, b) {
    // Returns the normalized position of t along [a, b]
    return (t - a) / (b - a);
}

let ease = (t) => expensiveEase(t, 2);

function signalCurve(level, t, x) {
    // param should go from 0 to 1, from animation incomplete to animation complete
    let shrinkTime = 500;
    let shrinkedTime = 500;
    let stretchTime = 2000;
    let stretchedTime = 2000;

    let shrinkStart = 1000;
    let shrinkEnd = shrinkStart + shrinkTime;
    let stretchStart = shrinkEnd + shrinkedTime;
    let stretchEnd = stretchStart + stretchTime;
    let animLength = stretchEnd + stretchedTime;

    let cycleTime = t % animLength;
    let param = 0;
    if (cycleTime < shrinkStart) {
        param = 0;
    } else if (cycleTime < shrinkEnd) {
        param = ease(normalize(cycleTime, shrinkStart, shrinkEnd));
    } else if (cycleTime < stretchStart) {
        param = 1;
    } else if (cycleTime < stretchEnd) {
        param = ease(1 - normalize(cycleTime, stretchStart, stretchEnd));
    } else if (cycleTime < animLength) {
        param = 0;
    } else {
        console.error("cycleTime is " + cycleTime + ", should be less than " + animLength);
    }
     
    let envelope = Math.pow(x - 1, 2);
    
    let coeff = Math.pow(2, level - 1);
    let stretchBase = Math.pow(1.25, level - 1);
    let stretch = Math.pow(stretchBase, 3*param - 3);
    let frequency = 2 * Math.PI * coeff * stretch;

    return signalHeight * envelope * Math.sin(frequency * x);
}


function updatePath(path, f) {
    // Accepts a <path> element and a function with domain [0, 1] and output in pixels.
    
    // Move to start of curve
    let pathCode = 'M ' + signalXLimits[0] + ',' + signalY;

    for (let x = signalXLimits[0]; x < signalXLimits[1]; x++) {
        let y = signalY - f((x - signalXLimits[0]) / (signalXLimits[1] - signalXLimits[0]));
        
        // Update the next point in the path.
        pathCode += ' L ' + x + ',' + y;
    }
    // console.log(path)
    path.setAttribute('d', pathCode);
}

let rayOne = document.querySelector('.ray-one');
let rayTwo = document.querySelector('.ray-two');
let rayThree = document.querySelector('.ray-three');
let rays = [rayOne, rayTwo, rayThree];

let fps = 60;
let currTime = 0;

function animate() {
    currTime += speed / fps;
    for (let i = 0; i < 3; i++) {
        updatePath(rays[i], (x) => signalCurve(i+1, currTime, x));
    }
    setTimeout(function() {
        requestAnimationFrame(animate);
    }, (1000/fps));
}

requestAnimationFrame(animate);
