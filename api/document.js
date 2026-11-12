'use strict';
const {cors,authorized,validate,github}=require('./_shared.cjs');
module.exports=async function(req,res){
 if(!cors(req,res,'GET,PUT'))return;
 if(!process.env.ADMIN_PASSWORD || !process.env.GITHUB_TOKEN)return res.status(503).json({error:'Servizio non ancora configurato.'});
 if(!['GET','PUT'].includes(req.method))return res.status(405).json({error:'Metodo non consentito.'});
 if(!authorized(req))return res.status(401).json({error:'Password errata.'});
 if(req.method==='GET'){
   const result=await github();
   if(result.error)return res.status(result.status).json({error:result.error});
   try{
     const text=Buffer.from(result.data.content.replace(/\s/g,''),'base64').toString('utf8');
     const document=JSON.parse(text);
     if(!validate(document))throw new Error('Documento non valido');
     return res.status(200).json({document,sha:result.data.sha});
   }catch{return res.status(502).json({error:'Impossibile leggere il documento online.'});}
 }
 const body=typeof req.body==='string'?JSON.parse(req.body):req.body;
 if(!body || !/^[a-f\d]{40}$/.test(body.sha||'') || !validate(body.document))return res.status(400).json({error:'Documento non valido.'});
 if(Buffer.byteLength(JSON.stringify(body.document),'utf8')>150000)return res.status(413).json({error:'Documento troppo grande.'});
 const result=await github('PUT',{
   message:'Aggiorna Regolamento Professori da pannello protetto',
   content:Buffer.from(JSON.stringify(body.document,null,2)+'\n','utf8').toString('base64'),
   sha:body.sha,
   branch:'main'
 });
 if(result.error)return res.status(result.status).json({error:result.error});
 return res.status(200).json({ok:true,sha:result.data.content.sha});
};
