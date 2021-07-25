const express = require('express')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const morgan = require('morgan')
const routes = require('./db_queries')



const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)

app.set('view engine', 'pug')
app.use(express.static('public'))
app.use(express.json())
app.use(morgan('common'))
app.use(express.urlencoded({extended:true,}))
app.use(cookieParser())
app.use(session({secret:"aKsrfghjkacvbnhg",
                 resave:true,
                saveUninitialized:true}))



app.get('/createRoom',routes.createRoom)
app.get('/',routes.checkSignIn,(req,res,next)=>{
  res.render('protected_page', {id: req.session.user.mailid})
})
app.get('/login',(req,res)=>{
  res.render('login')
})
app.get('/signup',(req,res)=>{
  res.render('signup')
})
app.post('/login',routes.signinUser)
app.post('/signup',routes.addUser)

app.get('/:room',routes.checkSignIn ,routes.renderRoom)
app.use('/', function(err, req, res, next){
  console.log(err);
     //User should be authenticated! Redirect him to log in.
     res.redirect('/login');
  });
io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId)
    socket.to(roomId).broadcast.emit('user-connected', userId)
    socket.on('facedata',(msg)=>{
      console.log(`${userId}`)
      console.log(msg)
    })
    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('user-disconnected', userId)
    })
  })
})

server.listen(3000)