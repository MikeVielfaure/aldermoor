// Résumé d'un ou plusieurs fichiers .glb : nœuds, maillages, triangles approximatifs, animations, textures, taille.
const fs=require('fs');
for(const f of process.argv.slice(2)){const b=fs.readFileSync(f);if(b.readUInt32LE(0)!==0x46546c67){console.log(f,'pas un glb');continue;}
 const len=b.readUInt32LE(12),j=JSON.parse(b.slice(20,20+len).toString('utf8'));
 let tris=0;(j.meshes||[]).forEach(m=>m.primitives.forEach(p=>{const a=p.indices!=null?j.accessors[p.indices]:j.accessors[p.attributes.POSITION];tris+=Math.round(a.count/(p.indices!=null?3:3));}));
 console.log(f.split(/[\/]/).slice(-1)[0],'|',(b.length/1024).toFixed(0)+'Ko','| maillages',(j.meshes||[]).length,'| triangles ~'+tris,'| animations',(j.animations||[]).map(a=>a.name).join(',')||'aucune','| peau',(j.skins||[]).length,'| textures',(j.images||[]).length);}
