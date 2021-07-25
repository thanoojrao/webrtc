const Pool = require('pg').Pool
const dotenv = require('dotenv')
dotenv.config()
DB_URL=process.env.DATABASE_URL
const pool = new Pool({
    DB_URL,
})

pool.query('CREATE TABLE USERS(ID SERIAL,mailID VARCHAR(50) PRIMARY KEY,password VARCHAR(30))',(error,result)=>{
    if(error){
        throw error
    }
})
pool.query('CREATE TABLE ROOMS(ID CHAR(36) PRIMARY KEY,adminID INT,CONSTRAINT FK_AdminRoom FOREIGN KEY (adminID) REFERENCES USERS (ID))',(error,result)=>{
    if(error){
        throw error
    }
    pool.end(console.log('pool ended successfully'))
})
