/**
 * (c) Facebook, Inc. and its affiliates. Confidential and proprietary.
 */

//==============================================================================
// Welcome to scripting in Spark AR Studio! Helpful links:
//
// Scripting Basics - https://fb.me/spark-scripting-basics
// Reactive Programming - https://fb.me/spark-reactive-programming
// Scripting Object Reference - https://fb.me/spark-scripting-reference
// Changelogs - https://fb.me/spark-changelog
//==============================================================================

// How to load in modules
const Scene = require('Scene');

// Use export keyword to make a symbol available in scripting debug console
export const Diagnostics = require('Diagnostics');
export const FaceTracking = require('FaceTracking');
export const TouchGestures = require('TouchGestures');

// mouth open is a range
// Diagnostics.watch('Mouth Openness - ', FaceTracking.face(0).mouth.openness);

// pinLastValue
// const mouthOpenness = FaceTracking.face(0).mouth.openness.pinLastValue();
// Diagnostics.log(mouthOpenness);
// Diagnostics.log(mouthOpenness);

// callback
// Subscribe to tap gestures

// TouchGestures.onTap().subscribeWithSnapshot(
// 	{
// 		// Get the value of mouth openness when the tap gesture is detected
// 		mouthOpennessValue : FaceTracking.face(0).mouth.openness
// 	},
// 	function (gesture, snapshot) {
// 		// Log the value from the snapshot
// 		Diagnostics.log(snapshot.mouthOpennessValue);
// 	}
// );

// To use variables and functions across files, use export/import keyword
// export const animationDuration = 10;

// Use import keyword to import a symbol from another file
// import { animationDuration } from './script.js'

// To access scene objects
// const directionalLight = Scene.root.find('directionalLight0');

// To access class properties
// const directionalLightIntensity = directionalLight.intensity;

// To log messages to the console
// Diagnostics.log('Console message logged from the script.');
