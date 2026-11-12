'use strict';
const crypto = require('node:crypto');

const ORIGIN = 'https://razor5489.github.io';
const GITHUB_URL = 'https://api.github.com/repos/Razor5489/Regolamento-professori/contents/regolamento.json';
const GH_HEADERS = {
  'Accept': 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  'User-Agent': 'nightfall-professori-backend'
};

function cors(req,res,methods) {
  const origin=req.headers.origin || '';
  res.setHeader('Vary','Origin');
  res.setHeader('Cache-Control','no-store');
  res.setHeader('X-Content-Type-Options','nosniff');
  if(origin && origin!==ORIGIN) {res.status(403).json({error:'Origine non autorizzata.'});return false;}
  if(origin===ORIGIN) {
    res.setHeader('Access-Control-Allow-Origin',ORIGIN);
    res.setHeader('Access-Control-Allow-Methods','OPTIONS,'+methods);
    res.setHeader('Access-Control-Allow-Headers','Authorization,Content-Type');
  }
  if(req.method==='OPTIONS') {res.status(204).end();return false;}
  return true;
}
function authorized(req) {
  const pass=process.env.ADMIN_PASSWORD;
  if(!pass || !process.env.GITHUB_TOKEN)return false;
  const header=req.headers.authorization || '';
  if(!header.startsWith('Bearer '))return false;
  let received;
  try {
    const encoded=header.slice(7);
    if(encoded.length>700 || !/^[A-Za-z0-9+/=]+$/.test(encoded))return false;
    received=Buffer.from(encoded,'base64').toString('utf8');
  }catch{return false;}
  const a=crypto.createHash('sha256').update(received,'utf8').digest();
  const b=crypto.createHash('sha256').update(pass,'utf8').digest();
  return crypto.timingSafeEqual(a,b);
}
function validate(doc){
  if(!doc || doc.version!==1 || !Array.isArray(doc.pages) || doc.pages.length>8)return false;
  return ['regolamento','linee-guida'].every(id=>doc.pages.some(page=>
    page.id===id && typeof page.title==='string' && page.title.length<=200 &&
    typeof page.description==='string' && page.description.length<=1000 &&
    Array.isArray(page.sections) && page.sections.length<=100 &&
    page.sections.every(s=>typeof s.id==='string' && s.id.length<=120 &&
      typeof s.title==='string' && s.title.length<=200 &&
      typeof s.intro==='string' && s.intro.length<=3000 &&
      Array.isArray(s.points) && s.points.length<=100 &&
      s.points.every(p=>typeof p==='string' && p.length<=2000)
    )
  ));
}
async function github(method='GET',payload){
  const response=await fetch(GITHUB_URL,{
    method,
    headers:{...GH_HEADERS,Authorization:'Bearer '+process.env.GITHUB_TOKEN,
      ...(payload?{'Content-Type':'application/json'}:{})},
    body:payload?JSON.stringify(payload):undefined,
    cache:'no-store'
  });
  const data=await response.json().catch(()=>({}));
  if(!response.ok){
    const status=[409,422].includes(response.status)?409:502;
    return {error:status===409?'Il documento è stato aggiornato da un’altra persona. Ricarica la pagina.':'GitHub ha rifiutato la richiesta. Verifica i permessi del servizio.',status};
  }
  return {data};
}
module.exports={cors,authorized,validate,github};
