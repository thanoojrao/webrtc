'use strict';

// Put variables in global scope to make them available to the browser console.

let model;
async function renderPrediction(video){

  const returnTensors = false;
  const flipHorizontal = false;
  const annotateBoxes = true;
  const predictions = await model.estimateFaces(
    video, returnTensors, flipHorizontal, annotateBoxes);

  if (predictions.length > 0) {

    for (let i = 0; i < predictions.length; i++) {
      if (returnTensors) {
        predictions[i].topLeft = predictions[i].topLeft.arraySync();
        predictions[i].bottomRight = predictions[i].bottomRight.arraySync();
        if (annotateBoxes) {
          predictions[i].landmarks = predictions[i].landmarks.arraySync();
        }
      }
      console.log(predictions[i]);
      if (annotateBoxes) {
        const landmarks = predictions[i].landmarks;
        for (let j = 0; j < landmarks.length; j++) {
          const x = landmarks[j][0];
          const y = landmarks[j][1];
          console.log(landmarks[j]);
        }
      }
    }
  }


  requestAnimationFrame(renderPrediction);
};



const setupModel = async (video) => {
  model = await blazeface.load();
  renderPrediction(video);
};

export {setupModel,};