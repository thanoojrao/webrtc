const socket = io('/')
const videoGrid = document.getElementById('video-grid')
console.log(USER_ID)
const myPeer = new Peer(USER_ID)
const myVideo = document.createElement('video')
myVideo.muted = true
const peers = {}
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  addVideoStream(myVideo,stream)
  myPeer.on('call', call => {
    call.answer(stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
    })
  })
  socket.on('user-connected', userId => {
    const fc = () => connectToNewUser(userId, stream)
    let timerid = setTimeout(fc, 1000 )
    })
})
socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close();
})
myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id)
})
function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })
  call.on('close', () => {
    video.remove()
  })

  peers[userId] = call
}

function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video)
}



//model on stream
let model,faces,noUser=false,t=0,noT=0;

async function renderPrediction(){
  const notificationSound = '<source src="./notification_sound.mp3" type="audio/mpeg">';
  faces =0;
  const returnTensors = false;
  const flipHorizontal = false;
  const annotateBoxes = true;
  const predictions = await model.estimateFaces(
    myVideo, returnTensors, flipHorizontal, annotateBoxes);

  if (predictions.length > 0) {

    for (let i = 0; i < predictions.length; i++) {
      if (returnTensors) {
        predictions[i].topLeft = predictions[i].topLeft.arraySync();
        predictions[i].bottomRight = predictions[i].bottomRight.arraySync();
        if (annotateBoxes) {
          predictions[i].landmarks = predictions[i].landmarks.arraySync();
        }
      }
      faces +=1;
      if (annotateBoxes) {
        const landmarks = predictions[i].landmarks;
        for (let j = 0; j < landmarks.length; j++) {
          const x = landmarks[j][0];
          const y = landmarks[j][1];
        }
      }
    }
  }
  console.log(faces);
  if(faces==0){
    noUser=true;
    noT+=5
    console.log('no user');
    if(noT==60){
      console.log('are you here')
      let audio = document.getElementById('sound')
      audio.innerHTML='<audio autoplay="autoplay">'+notificationSound+'</audio>'
    }
  }
  else if(faces>0){
    noUser=false;
    t=t+5;
    noT=0;
    socket.emit('facedata',t);
  }
};
const setupModel = async () => {
  model = await blazeface.load();
  setInterval(renderPrediction,5000);
};
myVideo.addEventListener('loadedmetadata', () => {
  setupModel();
})