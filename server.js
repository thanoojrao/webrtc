const express = require('express')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const routes = require('./db_queries')
const pgStore = require('connect-pg-simple')(session)

const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const dbUrl = process.env.DATABASE_URL
app.set('view engine', 'pug')
app.use(express.static(__dirname+'/public'))
app.use('/loginPublic',express.static(__dirname+'/login_public'))
app.use(express.json())
app.use(express.urlencoded({extended:true,}))
app.use(cookieParser())
app.use(session({secret:"aKsrfghjkacvbnhg",
                 store: new pgStore({pool:routes.pool}),
                 resave:true,
                saveUninitialized:true}))



app.get('/createRoom',routes.createRoom)
app.get('/',routes.checkSignIn,(req,res,next)=>{
  res.render('landing', {id: req.session.user.mailid})
})
app.get('/login',(req,res)=>{
  res.render('login')
})
app.get('/signup',(req,res)=>{
  res.render('signup')
})
app.post('/login',routes.signinUser)
app.post('/signup',routes.addUser)
app.get('/logout',routes.logoutUser)
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
    socket.on('broadcaster-joined',()=>{
      socket.to(roomId).broadcast.emit('broadcaster-info', socket.id)
    })
    socket.on('facedata',(msg)=>{
      console.log(`${userId}`)
      console.log(msg)
    })
    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('user-disconnected', userId)
    })
  })
})

server.listen(process.env.PORT||3000)