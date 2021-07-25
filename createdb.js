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
pool.query('CREATE TABLE USERS(ID SERIAL,mailID VARCHAR(50) PRIMARY KEY,password CHAR(60))',(error,result)=>{
    if(error){
        throw error
    }
})

  