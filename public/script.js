
const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer(undefined)
const myVideo = document.createElement('video')
let adminID
myVideo.muted = true
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  addVideoStream(myVideo, stream)

  myPeer.on('call', call => {
    call.answer()
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
    })
  })

  socket.on('user-connected', (userId,username) => {
    //connectToNewUser(userId, stream)
    console.log('new user joined ',username)
  })
})
// things to do as i recieve broadcasters info or a broadcaster is joined
socket.on('broadcaster-info',broadcasterId=>{
  adminID = broadcasterId
  console.log('got info from broadcaster')
  socket.emit('request-call',broadcasterId,USER_ID)  //request broadcaster to call
})

socket.on('user-disconnected', leftUserId => {
  // if (peers[userId]) peers[userId].close()
  console.log('user left',leftUserId)
})

myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id,USER_ID)
  console.log('u joined room')
})

/*
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

*/

function addVideoStream(video, stream) {
  video.srcObject = stream
  console.log('recieved stream')
  video.addEventListener('loadedmetadata', () => {
    video.play()
    console.log('playing stream')
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
    console.log('no user')
    socket.emit('facedata',adminID,noT)
    if(noT==60){
      console.log('are you here')
      let audio = document.getElementById('sound')
      audio.innerHTML='<audio autoplay="autoplay">'+notificationSound+'</audio>'
    }
  }
  else if(faces>0){
    noUser=false;
    socket.emit('facedata',adminID,0)
    t=t+5;
    noT=0;
  }
};
const setupModel = async () => {
  model = await blazeface.load();
  setInterval(renderPrediction,5000);
};
myVideo.addEventListener('loadedmetadata', () => {
  setupModel();
})