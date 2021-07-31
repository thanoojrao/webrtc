
const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer(undefined)
const myVideo = document.createElement('video')
myVideo.muted = true
//send that i joined to all students who already joined
socket.emit('broadcaster-info')
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  addVideoStream(myVideo, stream)
/*
  myPeer.on('call', call => {
    call.answer(stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
    })
  })
*/
  console.log(USER_ID)
  //call students who joined before me
  socket.on('request-call',remoteId=>{
    console.log('connecting to new user',remoteId)
    connectToNewUser(remoteId, stream)
  })
  //call student if joined after me
  socket.on('user-connected', userId => {
    connectToNewUser(userId, stream)
    console.log('connecting to user',userId)
  })
})

socket.on('user-disconnected', leftUserId => {
  //if (peers[userId]) peers[userId].close()
  console.log('user left',leftUserId)
})

myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id)
  console.log('u joined room')
})

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
  /*
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })
  call.on('close', () => {
    video.remove()
  })
  */
  peers[userId] = call
}

function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video)
}

