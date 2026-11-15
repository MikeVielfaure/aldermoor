/* ================= PERFORMANCE : LES LUEURS LOINTAINES =================
   Chaque petite lueur ou étiquette (Sprite) coûte un dessin. Au village, 150 sur 190 étaient à plus de 70 m,
   noyées dans le brouillard. Celles au-delà de 62 m (40 m dans les intérieurs) passent sur le calque 1, que la
   caméra ne dessine pas : on ne touche pas à .visible, que d'autres parties du jeu gèrent.
   Exceptions : grandes lueurs (îles, astres : échelle ≥ 6) et objets marqués userData.noCull. */
const SPC={list:[],t:0,rt:0};const SPV=new THREE.Vector3();
function spriteCull(dt){SPC.rt-=dt;if(SPC.rt<=0){SPC.rt=3;SPC.list=[];scene.traverse(o=>{if(o.isSprite&&!o.userData.noCull)SPC.list.push(o);});}
 SPC.t-=dt;if(SPC.t>0)return;SPC.t=0.25;const c=camera.position,lim=(S.zone==='monde'?62:40)**2;
 for(const o of SPC.list){if(o.scale.x>=6){if(o.layers.mask!==1)o.layers.set(0);continue;}o.getWorldPosition(SPV);const far=SPV.distanceToSquared(c)>lim;const want=far?1:0;if(o.layers.mask!==(1<<want))o.layers.set(want);}}
{const _w=world4Tick;world4Tick=function(dt){const r=_w.apply(this,arguments);try{spriteCull(dt);}catch(e){}return r;};}
