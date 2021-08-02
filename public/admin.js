
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
  socket.on('request-call',(remoteId,username)=>{
    connectToNewUser(remoteId,username, stream)
    console.log('connecting to user',username)
  })
  //call student if joined after me
  socket.on('user-connected', (userId,username) => {
    connectToNewUser(userId,username, stream)
    console.log('connecting to user',username)
  })
})
socket.on('facedata',(id,info)=>{
  const alertText = document.getElementById(id).getElementsByClassName('alert')[0]
  console.log('user data',id,info)
  if(info==0){
  alertText.innerHTML = ''
  }
  else{
    alertText.innerHTML = 'no User'
  }
})
socket.on('user-disconnected', leftUserId => {
  //if (peers[userId]) peers[userId].close()
  console.log('user left',leftUserId)
})

myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id)
  console.log('u joined room')
})

function connectToNewUser(userId,username,stream) {
  const call = myPeer.call(userId, stream)
  addUser(userId,username)
  /*
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })
  call.on('close', () => {
    video.remove()
  })
  */
  // peers[userId] = call
}

function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video)
}
function addUser(id,username){
  const userTile = document.createElement('div')
  userTile.className = 'usertile'
  userTile.id = `${id}`
  userTile.className='usertile'
  const p = document.createElement('p')
  const text = document.createTextNode(username)
  const userdata = document.createElement('p')
  userdata.className = 'alert'
  p.appendChild(text)
  userTile.appendChild(p)
  userTile.appendChild(userdata)
  videoGrid.append(userTile)
}
