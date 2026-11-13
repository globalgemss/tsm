import {singleCommunity} from '../src/community.js';
import {seed,run,ctx,roles} from '../src/domain.js';
export function initialState(mode,seedValue=360){const d=singleCommunity(seed(seedValue));if(mode==='empty')for(const k of Object.keys(d))if(Array.isArray(d[k]))d[k]=[];return d}
const json=(v,status=200,headers={})=>Response.json(v,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers}});
async function hash(s){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s))),b=>b.toString(16).padStart(2,'0')).join('')}
export default {async fetch(request,env){
 const url=new URL(request.url);
 if(!url.pathname.startsWith('/api/'))return env.ASSETS.fetch(request);
 if(url.pathname==='/api/health')return json({ok:true,storage:env.DB?'D1':'unbound',demoOnly:true});
 if(!env.DB)return json({error:'Database binding DB is missing.'},503);
 if(env.DEMO_ENABLED==='false')return json({error:'Demo disabled by operator. Production authentication is not configured.'},503);
 if(!['GET','POST'].includes(request.method))return json({error:'Method not allowed'},405);
 if(request.method==='POST'&&(request.headers.get('Origin')!==url.origin||!request.headers.get('Content-Type')?.startsWith('application/json')))return json({error:'Same-origin JSON required'},403);
 const cookie=request.headers.get('Cookie')?.match(/(?:^|;\s*)tsm_demo=([a-f0-9]{64})(?:;|$)/)?.[1];
 const token=cookie||Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('');
 const session=await hash(token), headers=cookie?{}:{'Set-Cookie':`tsm_demo=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=604800`};
 const mode=url.searchParams.get('mode')||'seeded';if(!['seeded','empty'].includes(mode))return json({error:'Invalid mode'},400,headers);
 try{
 let row=await env.DB.prepare('SELECT payload,revision FROM demo_workspaces WHERE session_hash=? AND mode=?').bind(session,mode).first();
 if(!row){const d=initialState(mode);await env.DB.prepare('INSERT OR IGNORE INTO demo_workspaces VALUES(?,?,?,?,?)').bind(session,mode,1,JSON.stringify(d),Date.now()).run();row=await env.DB.prepare('SELECT payload,revision FROM demo_workspaces WHERE session_hash=? AND mode=?').bind(session,mode).first()}
 const state=JSON.parse(row.payload);
 if(request.method==='GET'&&url.pathname==='/api/state')return json({state,mode,storage:'D1',demoOnly:true},200,headers);
 if(request.method!=='POST'||!['/api/command','/api/reset'].includes(url.pathname))return json({error:'Not found'},404,headers);
 const raw=await request.text();if(raw.length>32000)return json({error:'Request too large'},413,headers);
 const body=JSON.parse(raw);if(!roles.includes(body.role))return json({error:'Invalid demo role'},403,headers);
 if(typeof body.requestId!=='string'||!/^[-a-zA-Z0-9]{16,80}$/.test(body.requestId))return json({error:'Request ID required'},400,headers);
 const digest=await hash(JSON.stringify({role:body.role,command:body.command,seed:body.seed,path:url.pathname}));
 const previous=state.serverRequests?.find(x=>x.id===body.requestId);
 if(previous)return previous.digest===digest?json({state,mode,replayed:true},200,headers):json({error:'Request ID reused with different content'},409,headers);
 if(body.revision!==row.revision)return json({error:'अर्को tab मा परिवर्तन भयो। Reload गरेर पुनः प्रयास गर्नुहोस्।'},409,headers);
 let next;
 if(url.pathname==='/api/reset'){
 if(body.role!=='System Admin')return json({error:'Admin demo role required'},403,headers);
 if(!Number.isSafeInteger(body.seed)||body.seed<0||body.seed>2147483647)return json({error:'Invalid seed'},400,headers);
 next=initialState(mode,body.seed);next.audit=[...state.audit,{id:crypto.randomUUID(),tenant:1,event:'demo-reset',reason:'Explicit reset of fictional workspace',actor:body.role,date:new Date().toISOString()}];
 }else{
 if(!body.command||typeof body.command.type!=='string')return json({error:'Command required'},400,headers);
 next=run(state,ctx(1,body.role),{...body.command,request:body.requestId});
 }
 next.revision=row.revision+1;next.serverRequests=[...(state.serverRequests||[]),{id:body.requestId,digest}].slice(-100);
 const result=await env.DB.prepare('UPDATE demo_workspaces SET payload=?,revision=?,updated_at=? WHERE session_hash=? AND mode=? AND revision=?').bind(JSON.stringify(next),next.revision,Date.now(),session,mode,row.revision).run();
 if(result.meta.changes!==1)return json({error:'Concurrent update. Reload and retry.'},409,headers);
 return json({state:next,mode,storage:'D1'},200,headers);
 }catch(e){return json({error:e instanceof SyntaxError?'Invalid JSON':String(e.message).slice(0,240)},400,headers)}
}};
