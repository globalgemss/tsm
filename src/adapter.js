import {singleCommunity} from './community.js';
import {seed,run} from './domain.js';
const remote=import.meta.env?.PROD===true;
let cached,mode=globalThis.localStorage?.getItem('tsm-data-mode')||'seeded';
if(!['seeded','empty'].includes(mode))mode='seeded';
const key=()=>`tsm-v10-${mode}`;
function initial(value=360){const d=singleCommunity(seed(value));if(mode==='empty')for(const k of Object.keys(d))if(Array.isArray(d[k]))d[k]=[];return d}
async function api(path,body){const r=await fetch(`/api/${path}?mode=${mode}`,{method:body?'POST':'GET',headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined});const v=await r.json();if(!r.ok)throw Error(v.error||'Database request failed');cached=v.state;return cached}
export async function initialize(){if(remote)await api('state');else cached=loadDemo()}
export function loadDemo(){if(cached)return structuredClone(cached);if(remote)throw Error('Database not loaded');try{const d=JSON.parse(localStorage.getItem(key()));return d&&Array.isArray(d.members)?d:initial()}catch{return initial()}}
export async function commitDemo(current,context,command){if(context.tenant!==1)throw Error('यो प्रणाली शान्ति टोलका लागि मात्र हो।');if(command.offline)throw Error('अफलाइन: परिवर्तन रोकिएको छ');if(remote)return api('command',{role:context.role,revision:current.revision,requestId:crypto.randomUUID(),command});const persisted=JSON.parse(localStorage.getItem(key())||'null');if(persisted&&persisted.revision!==current.revision)throw Error('अर्को tab मा विवरण परिवर्तन भयो।');const next=run(current,context,command);localStorage.setItem(key(),JSON.stringify(next));cached=next;return next}
export async function resetDemo(value,role='System Admin'){if(remote)return api('reset',{role,revision:cached.revision,requestId:crypto.randomUUID(),seed:value});const next=initial(value);localStorage.setItem(key(),JSON.stringify(next));cached=next;return next}
export function storageStatus(){return {remote,mode}}
export async function changeMode(){const old=mode;mode=mode==='seeded'?'empty':'seeded';cached=undefined;try{await initialize();localStorage.setItem('tsm-data-mode',mode);location.reload()}catch(e){mode=old;await initialize();throw e}}
