import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import worker from './worker.js';
function env(){
 const db=new DatabaseSync(':memory:');
 db.exec(readFileSync(new URL('../migrations/0001_demo.sql',import.meta.url),'utf8'));
 return {DB:{prepare(sql){return {bind(...args){return {
  async first(){return db.prepare(sql).get(...args)},
  async run(){const r=db.prepare(sql).run(...args);return {meta:{changes:Number(r.changes)}}}
 }}}}},ASSETS:{fetch:()=>new Response('asset')}};
}
async function call(e,path='/api/state',body,cookie){const r=await worker.fetch(new Request('https://demo.example'+path,{method:body?'POST':'GET',headers:{...(cookie?{Cookie:cookie}:{}),...(body?{'Content-Type':'application/json',Origin:'https://demo.example'}:{})},body:body?JSON.stringify(body):undefined}),e);return {status:r.status,cookie:r.headers.get('set-cookie')?.split(';')[0],data:await r.json()}}
test('D1 seeded workspace and isolated empty mode',async()=>{const e=env(),a=await call(e);assert.equal(a.data.state.households.length,30);const b=await call(e,'/api/state?mode=empty',null,a.cookie);assert.equal(b.data.state.members.length,0);assert.equal((await call(e,'/api/state',null,a.cookie)).data.state.members.length,100)});
test('persisted command, duplicate request, stale revision, browser isolation',async()=>{const e=env(),a=await call(e),body={role:'System Admin',revision:1,requestId:crypto.randomUUID(),command:{type:'issue',title:'Test lamp',private:false}};const b=await call(e,'/api/command',body,a.cookie);assert.equal(b.status,200);assert.equal((await call(e,'/api/state',null,a.cookie)).data.state.issues.length,5);assert.equal((await call(e,'/api/command',body,a.cookie)).data.replayed,true);assert.equal((await call(e,'/api/command',{...body,requestId:crypto.randomUUID()},a.cookie)).status,409);assert.equal((await call(e)).data.state.issues.length,4)});
test('role permission and reset permission enforced',async()=>{const e=env(),a=await call(e);const b={role:'Ward Viewer',revision:1,requestId:crypto.randomUUID(),command:{type:'issue',title:'x'}};assert.equal((await call(e,'/api/command',b,a.cookie)).status,400);assert.equal((await call(e,'/api/reset',{...b,seed:360},a.cookie)).status,403)});
test('disabled demo, origin checks, mode checks',async()=>{const e=env();assert.equal((await call({...e,DEMO_ENABLED:'false'})).status,503);assert.equal((await call(e,'/api/state?mode=production')).status,400);assert.equal((await worker.fetch(new Request('https://demo.example/api/command',{method:'POST',headers:{Origin:'https://evil.example','Content-Type':'application/json'},body:'{}'}),e)).status,403)});
test('request content binding and reset revisions',async()=>{const e=env(),a=await call(e),b={role:'System Admin',revision:1,requestId:crypto.randomUUID(),seed:22};assert.equal((await call(e,'/api/reset',b,a.cookie)).data.state.revision,2);assert.equal((await call(e,'/api/reset',{...b,seed:23},a.cookie)).status,409)});
