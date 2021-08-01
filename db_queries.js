const bcrypt = require('bcrypt')
const dotenv = require('dotenv')
const { v4: uuidV4 } = require('uuid')
const Pool = require('pg').Pool

dotenv.config()

const pool = new Pool({
    connectionString:process.env.DATABASE_URL,
    ssl:{
        rejectUnauthorized:false
    }
})

const addUser = (req,res)=>{
    if(!req.body.id||!req.body.password){
        res.send("password and username are needed")
    }
    else{
        pool.query("SELECT * FROM users WHERE mailID=$1",[req.body.id],(error,result)=>{
            if(error) throw error 
            if(result.rowCount==1){
                res.render('signup', {
                    message: "User Already Exists! Login or choose another user id"})
            }
            else{
                const saltRounds = 10
                bcrypt.hash(req.body.password,saltRounds,(err,hashedPW)=>{
                var user = {mailid: req.body.id, password: hashedPW};
                pool.query('INSERT INTO users (mailid,password) VALUES ($1,$2) RETURNING id',[user.mailid,user.password],(error,result)=>{
                    if(error) throw error
                    user.id = result.rows[0].id
                    req.session.user = user
                    res.redirect('/')
                })
            })
            }
        })
    }
}


const signinUser = (req,res)=>{
    if(!req.body.id|| !req.body.password){
        res.render('login',{message:'mail id and password both are required'})
    }
    else{
        pool.query('SELECT * FROM users WHERE mailid=$1',[req.body.id],(error,result)=>{
            if(error) throw error
            const user = result.rows[0]
            if(user){
            bcrypt.compare(req.body.password,user.password,(err,isSame)=>{   
            if(isSame){
                req.session.user = user
                res.redirect('/')
            }
            else{
                res.redirect('/login')
            }
        })
        }
    else{
        res.redirect('/login')
    }})
    }
}

const logoutUser = (req,res)=>{
        req.session.destroy(function(){
           console.log("user logged out.")
        })
        res.redirect('/login')
}

const checkSignIn = (req,res,next)=>{
    if(req.session.user){
        next()
    }
    else{
        res.redirect('/login')
    }
}

const createRoom = (req,res)=>{
    const mailid=req.session.user.mailid
    pool.query('SELECT * FROM users WHERE mailid=$1',[mailid],(error,result)=>{
        if(error) throw error
        const admin=result.rows[0]
        const roomID = uuidV4()
        pool.query('INSERT INTO rooms (id,adminid) VALUES ($1,$2)',[roomID,admin.id])
        res.redirect(`/${roomID}`)
    })
}

const renderRoom = (req,res)=>{
    const roomId = req.params.room
    pool.query('SELECT * FROM rooms WHERE id=$1',[roomId],(error,result)=>{
        if(error) throw error
        if(result.rowCount==0){
            res.render('room_not_found')
        }
        else{
            console.log(req.session.user.id)
            console.log(result.rows[0].adminid)
            if(req.session.user.id==result.rows[0].adminid){
                res.render('room_admin',{roomId: req.params.room,userId: req.session.user.mailid})
            }
            else{
                res.render('room',{roomId: req.params.room,userId: req.session.user.mailid})
            }
        }
    })
}
module.exports={
    addUser,
    signinUser,
    checkSignIn,
    logoutUser,
    createRoom,
    renderRoom,
    pool
}