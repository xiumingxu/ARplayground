// script detecting mouse openness and expression

// load modules
const con = require('Diagnostics');
const Scene = require('Scene');

const FaceGestures = require('FaceGestures');
const FaceTracking = require('FaceTracking');
const Reactive = require('Reactive');
const Patches = require('Patches');
// access objects
// const directionalLight = Scene.root.find('faceTracker');
// const blob = Scene.root.find('base');
const blobs = [ Scene.root.find('base'), Scene.root.find('base0'), Scene.root.find('base1'), Scene.root.find('base2') ];
const face = FaceTracking.face(0);
const faceDistortion = Scene.root.find('faceDistortion');
//status
const _NORMALFACE = '_NORMALFACE';
const _DEFORMEDFACE = '_DEFORMEDFACE';
// const _DEFORMED = 'DEFORMED';

let curStatus = _NORMALFACE;

//register mouseOpenness reactive

face.mouth.openness.monitor({ fireOnInitialValue: false }).subscribe(mouseOpenHandler);
FaceGestures.onShake(face).subscribe(function () {
	if (curStatus == _DEFORMEDFACE) curStatus = _NORMALFACE;
	Patches.setScalarValue('val', 0);
});

// con.log(blob.transform.x.pinLastValue());

// curStatus = _DEFORMEDFACE;
function mouseOpenHandler (faceValue) {
	const val = faceValue.newValue;
	if (curStatus === _NORMALFACE) {
		let dx = [ 1, -1, 0, 0 ];
		let dz = [ 0, 0, 1, -1 ];
		for (let i = 0; i < 4; i++) {
			blobs[i].transform.x = dx[i] * (0.5 - val) / 4;
			blobs[i].transform.z = dz[i] * (0.5 - val) / 4;

			blobs[i].transform.y = -0.1 * (0.5 - val);
			// con.log(blobs[i].transform.scale);

			// scale
			blobs[i].transform.scaleX = 0.23 * (0.5 - val);
			blobs[i].transform.scaleY = 0.23 * (0.5 - val);
			blobs[i].transform.scaleZ = 0.23 * (0.5 - val);
		}
		// threshold for going to next stage
		if (val > 0.58) {
			// going to next status
			curStatus = _DEFORMEDFACE;
		}
	}
	if (curStatus === _DEFORMEDFACE) {
		Patches.setScalarValue('val', 100);
	}
}

function faceDeformed () {}
