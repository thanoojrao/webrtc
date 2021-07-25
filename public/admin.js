const socket = io('/')
const videoGrid = document.getElementById('video-grid')
console.log(USER_ID)
const myPeer = new Peer(USER_ID,  { host : 'jas-prj.herokuapp.com', port: 80, path : '/' })
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
      addVideoStream(video, userVideoStream);
    })
  })

  socket.on('user-connected', userId => {
    addUser(userId)
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
  const userTile = document.createElement('div')
  userTile.className = 'usertile'
  userTile.id = `${userId}`
  const p = document.createElement('p')
  const text = document.createTextNode(userId)
  p.appendChild(text)
  userTile.appendChild(p)
  /*
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })
  */
  call.on('close', () => {
    userTile.remove()
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

function addUser(userId){
    const userTile = document.createElement('div')
    userTile.className = 'usertile'
    userTile.id = `${userId}`
    const p = document.createElement('p')
    const text = document.createTextNode(userId)
    p.appendChild(text)
    userTile.appendChild(p)
    videoGrid.append(userTile)
}

