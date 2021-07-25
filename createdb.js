const Pool = require('pg').Pool
const dotenv = require('dotenv')
dotenv.config()
const pool = new Pool({
    user: process.env.DATABASE_USER,
    host: process.env.DATABASE_HOST,
    database: process.env.DATABASE_NAME,
    password: process.env.DATABASE_PASSWORD,
    port: Number(process.env.DATABASE_PORT),
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
