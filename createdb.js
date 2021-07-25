const Pool = require('pg').Pool
const dotenv = require('dotenv')
dotenv.config()
console.log(process.env.DATABASE_URL)
const pool = new Pool({
    connectionString:process.env.DATABASE_URL,
    ssl:{
        rejectUnauthorized:false
    }
})

pool.query('CREATE TABLE USERS(ID SERIAL,mailID VARCHAR(50) PRIMARY KEY,password VARCHAR(30))',(error,result)=>{
    if(error){
        throw error
    }
    pool.query('CREATE TABLE ROOMS(ID CHAR(36) PRIMARY KEY,adminID INT)',(err,results)=>{
        if(err){
            throw err
        }
        pool.end(console.log('pool ended successfully'))
    })
})
