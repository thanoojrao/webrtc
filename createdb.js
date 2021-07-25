const Pool = require('pg').Pool
const dotenv = require('dotenv')
console.log(process.env.DATABASE_URL)
const pool = new Pool({
    connectionString:process.env.DATABASE_URL,
    ssl:{
        rejectUnauthorized:false
    }
})

    pool.query(  ' CREATE TABLE "session" ( "sid" varchar NOT NULL COLLATE "default","sess" json NOT NULL,"expire" timestamp(6) NOT NULL ) WITH (OIDS=FALSE); ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;CREATE INDEX "IDX_session_expire" ON "session" ("expire");',(err,results)=>{
        if(err){
            throw err
        }
        pool.end(console.log('pool ended successfully'))
    })

  