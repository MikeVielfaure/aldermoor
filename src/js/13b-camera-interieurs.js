/* ================= CAMÉRA DANS LES LIEUX CLOS =================
   Avant : angle forcé vers le sol, aucune prise en compte des murs ni des meubles.
   Maintenant : le joueur garde son angle (avec une légère plongée), la caméra reste sous le plafond,
   s'arrête devant les murs, piliers et grands meubles, et monte un peu en plongée quand elle manque de recul
   (dos à un mur) au lieu de se coller au personnage. */
const CAM_CEIL={salle:7.4,auberge:4.1,biblio_int:11,grotte:7.6,donjon:4.6}; // hauteur utile sous plafond / haut des murs
const IC=[0.4,5,0,58]; // résultat : [angle, distance, regard en avant du personnage, champ de vision]
const ICOLS={zone:null,n:-1,list:[]};
function inColsFor(zn){ // obstacles de la zone (on ne parcourt pas les milliers d'obstacles du monde extérieur)
 if(ICOLS.zone===zn&&ICOLS.n===COLS.length)return ICOLS.list;
 ICOLS.zone=zn;ICOLS.n=COLS.length;ICOLS.list=COLS.filter(c=>!c.lake&&(zn==='donjon'?c.z<-300:c.z>300&&Math.abs(c.x-ZONES[zn].O.x)<60));return ICOLS.list;}
// distance libre le long du rayon joueur → caméra (angle cp), au plus « want »
function icRay(zn,cp,want){const hy=player.y+1.7,sx=-Math.sin(camYaw)*Math.cos(cp),sz=-Math.cos(camYaw)*Math.cos(cp),sy=Math.sin(cp),L=inColsFor(zn),dun=zn==='donjon';
 for(let d=0.8;d<=want;d+=0.25){const x=player.x+sx*d,z=player.z+sz*d,y=hy+sy*d;
  for(const c of L){if(c.off||(c.h!==undefined&&c.h<y-0.25))continue; // on passe au-dessus des meubles bas (tables, bancs)
   if(c.r!==undefined){const rr=c.r+0.3;if(Math.abs(x-c.x)<rr&&Math.abs(z-c.z)<rr&&Math.hypot(x-c.x,z-c.z)<rr)return Math.max(1.2,d-0.35);}
   else if(Math.abs(x-c.x)<c.hw+0.3&&Math.abs(z-c.z)<c.hd+0.3)return Math.max(1.2,d-0.35);}
  if(!dun)for(const R of ROOMS){const dd=Math.hypot(x-R.x,z-R.z);if(dd<R.r+30&&dd>R.r-0.3)return Math.max(1.2,d-0.35);}} // salles rondes
 return want;}
function inCam(zn){const dun=zn==='donjon',top=(CAM_CEIL[zn]||6)-0.35-(player.y+1.7),want=(dun?6.2:5.6)*CAMZ;
 const fit=cp=>Math.sin(cp)*want>top?Math.max(1.2,top/Math.sin(cp)):want; // plafond : on rapproche la caméra
 let cp=clamp(camPitch+(dun?0.2:0.06),dun?0.35:0.12,1.05);
 if(Math.sin(cp)*want>top){const a=Math.asin(clamp(top/want,0,1));cp=Math.max(0.12,a);} // plafond : on baisse d'abord l'angle
 let dist=icRay(zn,cp,fit(cp));
 if(dist<want*0.6)for(const up of [0.2,0.4]){const c2=Math.min(0.85,cp+up),d2=icRay(zn,c2,fit(c2));if(d2>dist+0.6){cp=c2;dist=d2;if(d2>=want*0.85)break;}}
 // toujours trop près : la caméra regarde devant le personnage, vers la pièce, plutôt que sa nuque
 IC[0]=cp;IC[1]=dist;IC[2]=clamp(want-dist-0.8,0,3)*0.6;IC[3]=FOV0+clamp((3.6-dist)*7,0,14);return IC;}
// champ de vision : un peu plus large quand la caméra manque de recul (petites pièces), pour voir autour du personnage
const FOV0=58;let fovCur=FOV0;
function fovTo(target,dt){const f=fovCur+(target-fovCur)*Math.min(1,dt*4);if(Math.abs(f-camera.fov)<0.15)return;fovCur=f;camera.fov=f;camera.updateProjectionMatrix();
 const v=new THREE.Vector2();renderer.getDrawingBufferSize(v);pScale=v.y/(2*Math.tan(f*Math.PI/360));PS_ALL.forEach(p=>p.mat.uniforms.scale.value=pScale);}
// étiquette (nom de personnage…) qui s'efface quand la caméra est tout près, au lieu de remplir l'écran
const NFV=new THREE.Vector3();
function nearFade(s,a,b){s.onBeforeRender=(r,sc,cam)=>{s.getWorldPosition(NFV);s.material.opacity=clamp((NFV.distanceTo(cam.position)-(a||3))/(b||3),0,1);};return s;}
