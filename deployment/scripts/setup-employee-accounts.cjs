const fs=require('node:fs'), path=require('node:path')
const {parseEnv}=require('node:util'), {Pool}=require('pg')
const env=parseEnv(fs.readFileSync(path.join(__dirname,'../.env.local'),'utf8'))
const pool=new Pool({connectionString:process.env.DATABASE_URL || env.DATABASE_URL,connectionTimeoutMillis:10000,max:1})
async function main() {
 const sql=fs.readFileSync(path.join(__dirname,'../database/employee-accounts.sql'),'utf8')
 await pool.query(sql)
 console.log('Employee account schema ready. Existing accounts and progress preserved.')
}
main().catch(e=>{console.error('Employee account setup failed:',e.code || 'database error');process.exitCode=1}).finally(()=>pool.end())
