const test=require('node:test'), assert=require('node:assert/strict')
const load=require('./load-typescript.cjs')({pg:{Pool:class {constructor(){throw Error('Unexpected database access')}}}})
const {validateEmployee}=load('src/lib/employee-store.ts')
const employee={id:'',name:'Alex',email:'ALEX@example.test',employeeId:'EMP-1',department:'Finance',rank:'Staff',title:'Analyst',active:true}
test('employee input normalizes email and enforces database limits and employment state',()=>{
 assert.equal(validateEmployee(employee).email,'alex@example.test')
 for(const change of [{email:'bad'},{email:'a'.repeat(151)},{title:'a'.repeat(101)},{active:'true'},{rank:'Owner'},{id:'sample-1'},{name:null}]) assert.throws(()=>validateEmployee({...employee,...change}))
})
test('employee API requires an admin and derives company ownership from the session',async()=>{
 const {NextRequest}=require('next/server'); let signedIn=false, seen
 const routes=require('./load-typescript.cjs')({
  '@/lib/admin-session':{SESSION_COOKIE:'test',sessionUser:()=>signedIn?'1':null},
  '@/lib/admin-store':{findAdmin:async()=>({companyId:'7',company:'Example'})},
  '@/lib/auth-config':{authMode:()=> 'database'},
  '@/lib/employee-store':{listEmployees:async id=>{seen=id;return[]},inviteEmployees:async(id)=>{seen=id;return {employees:[],created:0}}},
 })('src/app/api/employees/route.ts')
 const req=()=>new NextRequest('http://localhost:3002/api/employees',{method:'POST',headers:{origin:'http://localhost:3002','content-type':'application/json'},body:JSON.stringify({action:'invite',companyId:'foreign',ids:['1']})})
 assert.equal((await routes.GET(new NextRequest('http://localhost:3002/api/employees'))).status,401)
 assert.equal((await routes.POST(req())).status,401)
 signedIn=true
 assert.equal((await routes.POST(req())).status,200)
 assert.equal(seen,'7')
 const foreign=new NextRequest('http://localhost:3002/api/employees',{method:'POST',headers:{origin:'https://foreign.test'},body:'{}'})
 assert.equal((await routes.POST(foreign)).status,403)
})
