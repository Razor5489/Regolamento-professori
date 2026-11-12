'use strict';
const {cors,authorized}=require('./_shared.cjs');
module.exports=async function(req,res){
 if(!cors(req,res,'POST'))return;
 if(!process.env.ADMIN_PASSWORD || !process.env.GITHUB_TOKEN)return res.status(503).json({error:'Servizio non ancora configurato.'});
 if(req.method!=='POST')return res.status(405).json({error:'Metodo non consentito.'});
 if(!authorized(req))return res.status(401).json({error:'Password errata.'});
 return res.status(200).json({ok:true});
};
