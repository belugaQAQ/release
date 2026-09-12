import path from 'path';
import { DATA_DIR, readJson, writeJsonAtomic, readText, writeTextAtomic } from './file-io.js';
const files = { registry:'keys/key_registry.json', latest:'latest.json', beta:'beta.json', changelog:'changelog.md', betaChangelog:'betamd.md', echoes:'echoes.json' };
const defaults = { keys: [], metadata: { totalKeys: 0, lastRotated: '', totalResets: 0 } };
const filePath = name => path.join(DATA_DIR, files[name]);
const read = (name, fallback = null) => readJson(filePath(name), fallback);
const write = (name, value) => writeJsonAtomic(filePath(name), value);
const readFileText = (name, fallback = null) => readText(filePath(name), fallback);
const writeFileText = (name, value) => writeTextAtomic(filePath(name), value);
export const readKeyRegistry=()=>read('registry',defaults); export const writeKeyRegistry=v=>write('registry',v);
export const readLatestData=()=>read('latest'); export async function writeLatestData(v){const x={...v,releaseDate:new Date().toISOString()};await write('latest',x);return x;}
export const readBetaData=()=>read('beta'); export async function writeBetaData(v){const x={...v,releaseDate:new Date().toISOString()};await write('beta',x);return x;}
export const readChangelog=()=>readText('changelog'); export const writeChangelog=v=>writeText('changelog',v);
export const readBetaChangelog=()=>readText('betaChangelog'); export const writeBetaChangelog=v=>writeText('betaChangelog',v);
export async function readApprovedEchoes(){return (await read('echoes',[])).filter(x=>x.approved).map(({text,user})=>({text,user}));}
export async function writeEcho(text,user){const a=await read('echoes',[]);const id=Date.now();a.push({id,text,user,approved:false,created_at:new Date().toISOString()});await write('echoes',a);return {id};}
export async function readPendingEchoes(){return (await read('echoes',[])).filter(x=>!x.approved);}
export async function approveEcho(id){const a=await read('echoes',[]);const x=a.find(x=>x.id==id);if(x)x.approved=true;await write('echoes',a);}
export async function rejectEcho(id){const a=await read('echoes',[]);await write('echoes',a.filter(x=>x.id!=id));}
