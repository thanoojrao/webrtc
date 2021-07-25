const Pool = require('pg').Pool
const pool = new Pool({
    user: 'webrtc',
    host:'localhost',
    database:'webrtc',
    password: '12345678',
    port: 5432,
})

module.exports={
pool,
}