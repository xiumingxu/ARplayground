//==============================================================================
// Welcome to scripting in Spark AR Studio! Helpful links:
//
// Scripting Basics - https://fb.me/spark-scripting-basics
// Reactive Programming - https://fb.me/spark-reactive-programming
// Scripting Object Reference - https://fb.me/spark-scripting-reference
// Changelogs - https://fb.me/spark-changelog
//==============================================================================

// Load in modules
//==============================================================================
// Helper modules
const Diagnostics = require('Diagnostics');
const Scene = require('Scene');
const R = require('Reactive');
const Textures = require('Textures');
// Animate objects
const Animation = require('Animation');
// Trigger actions after set delays/intervals
const Time = require('Time');
// Read/store data on user's device to track high scores
const Persistence = require('Persistence');
// Send receive data between script and patches
const Patches = require('Patches');

// Get Scene objects
//==============================================================================
const instructionPlane = Scene.root.find('instructionLabel');
const promptRectangle = Scene.root.find('instructionPrompt');
const scoreContainer = Scene.root.find('scoreContainer');
const bestScoreContainer = Scene.root.find('bestContainer');
const scoreZone = Scene.root.find('scoreZone');

const planes = [
    Scene.root.find('plane0'),
    Scene.root.find('plane1'),
    Scene.root.find('plane2'),
    Scene.root.find('plane3'),
    Scene.root.find('plane4'),
    Scene.root.find('plane5')
];

const scoreDigits = [
    Scene.root.find('digit2'), // 100s place
    Scene.root.find('digit3'), // 1,000s place
    Scene.root.find('digit4') // 10,000s place
];

const bestScoreDigits = [
    Scene.root.find('digit7'), // 100s place
    Scene.root.find('digit8'), // 1,000s place
    Scene.root.find('digit9') // 10,000s place
];

const xErrors = [
    Scene.root.find('error0'),
    Scene.root.find('error1'),
    Scene.root.find('error2'),
    Scene.root.find('error3'),
    Scene.root.find('error4')
]

// Get materials
//==============================================================================
// not necessary for this effect since we can access our Scene Object's materials directly

// Get textures
//==============================================================================
const promptTex = [
    Textures.get('prompts-01'), // blank/none
    Textures.get('prompts-02'), // lookLeft
    Textures.get('prompts-03'), // openMouth
    Textures.get('prompts-04'), // blink
    Textures.get('prompts-05') // lookRight
];

const scoreTex = [
    Textures.get('scoreFull'), // score indicator
    Textures.get('scoreDefault') // idle
];

const digitTex = [
    Textures.get('digit0'), // 0
    Textures.get('digit1'), // 1
    Textures.get('digit2'), // 2
    Textures.get('digit3'), // 3
    Textures.get('digit4'), // 4
    Textures.get('digit5'), // 5
    Textures.get('digit6'), // 6
    Textures.get('digit7'), // 7
    Textures.get('digit8'), // 8
    Textures.get('digit9') // 9
];

// Setup gestures
//==============================================================================

// Define gesture types
const types = [
    null,
    'lookLeft',
    'openMouth',
    'blink',
    'lookRight'
];

// Handle gestures from patch editor
Patches.getPulseValue('blinkGesture').subscribe(function(e) { gestureHandler('blink') });
Patches.getPulseValue('lookLeftGesture').subscribe(function(e) { gestureHandler('lookLeft') });
Patches.getPulseValue('lookRightGesture').subscribe(function(e) { gestureHandler('lookRight') });
Patches.getPulseValue('openMouthGesture').subscribe(function(e) { gestureHandler('openMouth') });

// Setup audio script-patch bridge
//==============================================================================
function playAudio(audio) {
    Patches.setPulseValue(audio, R.once());
}

// Setup animations
//==============================================================================
// Main loop
const duration = 5000;
const drivers = [
    Animation.timeDriver({durationMilliseconds: duration, loopCount: Infinity, mirror: false}),
    Animation.timeDriver({durationMilliseconds: duration, loopCount: Infinity, mirror: false}),
    Animation.timeDriver({durationMilliseconds: duration, loopCount: Infinity, mirror: false}),
    Animation.timeDriver({durationMilliseconds: duration, loopCount: Infinity, mirror: false}),
    Animation.timeDriver({durationMilliseconds: duration, loopCount: Infinity, mirror: false}),
    Animation.timeDriver({durationMilliseconds: duration, loopCount: Infinity, mirror: false})
];
const sampler = Animation.samplers.linear(0, 1);
const offsets = drivers.map(function(driver) { return Animation.animate(driver, sampler) });

// Fade out animation
const fadeOutDriver = Animation.timeDriver({durationMilliseconds: duration/6, loopCount: 1, mirror: false});
const fadeSampler = Animation.samplers.linear(1, 0);
const fadeOut = Animation.animate(fadeOutDriver, fadeSampler);

// Setup instructions
//==============================================================================
const instructions = [
    {
        type: 'lookLeft',
        tex: Textures.get('labelLookLeft'),
        prompt: promptTex[1]
    },
    {
        type: 'openMouth',
        tex: Textures.get('labelOpenMouth'),
        prompt: promptTex[2]
    },
    {
        type: 'blink',
        tex: Textures.get('labelBlink'),
        prompt: promptTex[3]
    },
    {
        type: 'lookRight',
        tex: Textures.get('labelLookRight'),
        prompt: promptTex[4]
    }
];
var currInstruction = 0;

// Setup game 
//==============================================================================
// Create the move order for the game. 0 is null/nothing, 1 is lookLeft, etc.
const promptOrder = [1, 2, 3, 4, 0, 4, 3, 2, 1, 1, 1, 2, 4, 4, 3, 4, 3, 0, 2, 0];
// const promptOrder = Array.from({ length: 1000 }, function() { return Math.floor(Math.random()*types.length) });
// Track current move type and plane
var currMove = null;
var currPlane = 0;
// Track if user has already attempted the current prompt to avoid double scoring
var promptAttempted = false;
// Create logic for each loop to set new textures and track prompt misses
drivers.forEach(function(driver, i) {
    driver.onAfterIteration().subscribe(function(loopCount) {
        // check if prompt was missed
        if (currMove != null && !promptAttempted && !gameOver) {
            playAudio('playBadAudio');
            incrementScore(-100);
            xErrors[numErrors].hidden = false;
            numErrors++;
            if (numErrors >= xErrors.length) endGame();
        }
        promptAttempted = false;
        // track which plane is currently in the score zone
        currPlane = (i + 2) % planes.length;
        // set current move type to check gestures against
        currMove = types[promptOrder[((loopCount - 1)*planes.length + i + 2) % promptOrder.length]];
        // update the plane texture as it resets to the top
        const moveIndex = (loopCount*planes.length + i) % promptOrder.length;
        planes[i].material.diffuse = promptTex[promptOrder[moveIndex]];
    });
});

// Animate planes
planes.forEach(function(plane, i) {
    // set position
    plane.y = offsets[i].mul(-0.6).sub(0.09375);
    // set initial texture
    plane.material.diffuse = promptTex[promptOrder[i]];
    // set fade in/out
    plane.material.opacity = R.clamp(R.val(3).sub(offsets[i].mul(6).sub(3).abs()), 0, 1);
});

// Track score
var score = 0;
function incrementScore(amount) {
    score += amount;
    // No negative scores
    if (score < 0) score = 0;
    // If we hit the max amount (100,000), end game
    if (score >= 99999) {
        score = 99999;
        endGame();
    }
    // split up number so we can assign each digit
    var tempArr = [0, 0, 0, 0, 0];
    score.toString().split('').reverse().forEach(function(digit, i) {tempArr[i] = digit});
    scoreDigits[0].material.diffuse = digitTex[tempArr[2]]; // assign 100s
    scoreDigits[1].material.diffuse = digitTex[tempArr[3]]; // assign 1,000s
    scoreDigits[2].material.diffuse = digitTex[tempArr[4]]; // assign 10,000s
}

// Start game
//==============================================================================
var gameStarted = false;
function startGame() {
    // hide instruction-related content
    instructionPlane.hidden = true;
    promptRectangle.hidden = true;
    // show score
    scoreContainer.hidden = false;
    // start, stagger animations
    gameStarted = true;
    drivers.forEach(function(driver, i) {
        Time.setTimeout(function() { driver.start() }, duration*i/6);
    });
    // start tracking moves when first plane hits the score zone
    Time.setTimeout(function() {
        currMove = types[promptOrder[0]];
        Time.setTimeout(function() {
            promptAttempted = false;
            currMove = types[promptOrder[1]];
            currPlane = 1;
        }, duration/6);
    }, duration*4/6);
}

// Play game
//==============================================================================
var numErrors = 0;
function gestureHandler(type) {
    // If in instruction phase
    if (!gameStarted) {
        // check if player does the correct gesture
        if (type == instructions[currInstruction].type) {
            currInstruction++;
            // if instructions aren't done yet, go to next instruction
            if (currInstruction < instructions.length) {
                instructionPlane.material.diffuse = instructions[currInstruction].tex;
                promptRectangle.material.diffuse = instructions[currInstruction].prompt;
            }
            else startGame();
        }
    }
    // If playing game
    else if (!gameOver) {
        // If player has already attempted prompt, do nothing
        if (promptAttempted) return;
        
        // If player does the correct move
        if (type == currMove) {
            promptAttempted = true;
            // Track how close the prompt is to the middle of the target zone
            const grade = offsets[currPlane].pinLastValue();
            // If not quite in the middle, add 100 points (OK)
            if (grade <= 0.725 || grade >= 0.775) incrementScore(100);
            // If in the middle, add 200 points (PERFECT)
            else incrementScore(200);
            // Indicate positive
            scoreZone.material.diffuse = scoreTex[0];
            Time.setTimeout(function() {scoreZone.material.diffuse = scoreTex[1]}, duration/15);
            playAudio('playGoodAudio');
        }
        // If player does the wrong move (ignore blinking)
        else if (type != currMove && type != 'blink') {
            promptAttempted = true;
            playAudio('playBadAudio');
            incrementScore(-100); // deduct 100 points (BAD)
            // Show error element, check if player has lost
            xErrors[numErrors].hidden = false;
            numErrors++;
            if (numErrors >= xErrors.length) endGame();
        }
    }
}

// End game (win or lose)
//==============================================================================
var gameOver = false;
function endGame() {
    // Indicate game over, clean up
    Diagnostics.log('game over');
    playAudio('playEndAudio');
    gameOver = true;
    planes.forEach(function(plane) {
        plane.material.opacity = fadeOut;
    });
    scoreZone.material.opacity = fadeOut.mul(0.6);
    fadeOutDriver.onCompleted().subscribe(function() {
        drivers.forEach(function(driver) {driver.stop()});
        xErrors.forEach(function(x) {x.hidden = true});
        bestScoreContainer.hidden = false;
    });
    fadeOutDriver.start();
    // Save score if high score
    if (score > highScore) saveHighScore();
}

// Persistence Module - save/retrieve high scores
//==============================================================================
// Get stored high score from user's device (if it exists)
var highScore = 0;
const userScope = Persistence.userScope;
userScope.get('DDR_high_score')
    .then(function(data) {
        highScore = data.score;
        var tempArr = [0, 0, 0, 0, 0];
        highScore.toString().split('').reverse().forEach(function(digit, i) {tempArr[i] = digit});
        bestScoreDigits[0].material.diffuse = digitTex[tempArr[2]]; // assign 100s
        bestScoreDigits[1].material.diffuse = digitTex[tempArr[3]]; // assign 1,000s
        bestScoreDigits[2].material.diffuse = digitTex[tempArr[4]]; // assign 10,000s
    })
    .catch(function(error) { Diagnostics.log('unable to load high score data') });

function saveHighScore() {
    // Indicate high score
    Time.setTimeout(function() {playAudio('playCongratsAudio');}, 1200);
    // Update best score to current score
    bestScoreDigits.forEach(function(digit, i) {
        digit.material.diffuse = scoreDigits[i].material.diffuse;
    });
    // Update saved high score
    userScope.set('DDR_high_score', {score: score})
        .then(function() { Diagnostics.log('High score saved') })
        .catch(function(error) { Diagnostics.log(error) });
}