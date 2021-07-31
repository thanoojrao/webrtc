
const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer(undefined)
const myVideo = document.createElement('video')
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

  socket.on('user-connected', userId => {
    //connectToNewUser(userId, stream)
    console.log('new user joined ',userId)
  })
})
// things to do as i recieve broadcasters info or a broadcaster is joined
socket.on('broadcaster-info',broadcasterId=>{
  console.log('got info from broadcaster')
  socket.emit('request-call',broadcasterId)  //request broadcaster to call
})

socket.on('user-disconnected', leftUserId => {
  // if (peers[userId]) peers[userId].close()
  console.log('user left',leftUserId)
})

myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id)
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