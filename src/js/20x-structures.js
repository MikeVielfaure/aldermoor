/* ================= STRUCTURES : bâtiments faits de vraies briques =================
   Fiche : {id, nom, modele:'mur'|'tour'|'maison'|'pont'|'escalier'|'arche', x, z, rot (°), longueur, largeur, hauteur (m),
   materiau:'pierre'|'bois'|'cristal', incassable}. Chaque structure est reconstruite au chargement à partir de la fiche :
   ses briques sont des briques physiques (20r) « fixées » : elles tiennent comme un bâtiment, mais un sort qui les
   frappe, une brique cassée en dessous ou une bourrasque les rend à la physique : ça s'effondre pour de bon.
   Elles ne vont pas dans la sauvegarde des briques du joueur (la structure revient intacte au chargement suivant).
   Sources : src/contenu/structures.json + localStorage de l'Atelier (l'Assistant et l'onglet Structures). */
const CONT_STKEY='aldermoor-atelier-structures';
const CSTRUCT=contList('structures',CONT_STKEY);
const STRUCT_MODELES={mur:'Mur',tour:'Tour',maison:'Maison',pont:'Pont',escalier:'Escalier',arche:'Arche'};
// briques d'une structure, en coordonnées locales (x à droite, z devant, y en haut), pas de 0,9 m
function stGen(c){const G=0.9,out=[],mat=c.materiau==='bois'?'bois':c.materiau==='cristal'?'cristal':'pierre',L=Math.max(2,Math.round((c.longueur||6)/G)),W=Math.max(2,Math.round((c.largeur||5)/G)),H=Math.max(1,Math.round((c.hauteur||3)/G));
 const put=(i,j,k,t)=>out.push({t:t||mat,lx:i*G,ly:j*G,lz:k*G});
 if(c.modele==='mur'){for(let i=0;i<L;i++)for(let j=0;j<H;j++)put(i-(L-1)/2,j,0);}
 else if(c.modele==='tour'){const n=Math.max(3,Math.min(L,W));for(let j=0;j<H;j++)for(let i=0;i<n;i++)for(let k=0;k<n;k++)if(i===0||k===0||i===n-1||k===n-1)put(i-(n-1)/2,j,k-(n-1)/2);
  for(let i=0;i<n;i++)for(let k=0;k<n;k++)if((i===0||k===0||i===n-1||k===n-1)&&(i+k)%2===0)put(i-(n-1)/2,H,k-(n-1)/2);}
 else if(c.modele==='maison'){for(let j=0;j<H;j++)for(let i=0;i<L;i++)for(let k=0;k<W;k++){if(!(i===0||k===0||i===L-1||k===W-1))continue;const door=k===W-1&&Math.abs(i-(L-1)/2)<1&&j<2;const win=j===1&&(i===0||i===L-1)&&k===Math.floor(W/2);if(door||win)continue;put(i-(L-1)/2,j,k-(W-1)/2);}
  for(let i=0;i<L;i+=2)for(let k=0;k<W;k+=2)out.push({t:mat==='bois'?'poutre':'dalle',lx:(i-(L-1)/2+0.5)*G,ly:H*G,lz:(k-(W-1)/2+0.5)*G});}
 else if(c.modele==='pont'){const h=H;for(let k=0;k<L;k+=2)out.push({t:'dalle',lx:0,ly:h*G,lz:(k-(L-1)/2+0.5)*G});for(const s of [-1,1])for(let j=0;j<h;j++){put(0,j,s*(L-1)/2);}
  for(const s of [-1,1])for(let k=0;k<L;k+=3)out.push({t:'poutre',lx:s*1.05,ly:h*G+0.3,lz:(k-(L-1)/2+1)*G,rot:Math.PI/2});}
 else if(c.modele==='escalier'){for(let k=0;k<L;k++)for(let j=0;j<=k&&j<H+L;j++)for(let i=0;i<2;i++)put(i-0.5,j,k-(L-1)/2);}
 else{/* arche */const w=Math.max(3,L);for(let j=0;j<H;j++){put(-(w-1)/2,j,0);put((w-1)/2,j,0);}for(let i=0;i<w;i++)put(i-(w-1)/2,H,0);}
 return out;}
function stBuild(c){if(!inWorld(c.x,c.z))return 0;const r=(c.rot||0)*Math.PI/180,cs=Math.cos(r),sn=Math.sin(r),y0=gh(c.x,c.z);let n=0;
 for(const p of stGen(c)){if(BRK.length>1000)break;const x=c.x+p.lx*cs+p.lz*sn,z=c.z-p.lx*sn+p.lz*cs,T=BRK_T[p.t];const b={id:++BRKN,t:p.t,x,y:y0+p.ly,z,rot:r+(p.rot||0),hp:T.hp,vx:0,vy:0,vz:0,lev:0,awake:false,st:c.id,fixed:true,inc:!!c.incassable};BRK.push(b);brkCol(b);n++;}return n;}
function stClear(id){for(let i=BRK.length-1;i>=0;i--){const b=BRK[i];if(b.st===id&&(id!==undefined)){const k=COLS.indexOf(b.col);if(k>=0)COLS.splice(k,1);BRK.splice(i,1);}}}
function stBuildAll(){for(let i=BRK.length-1;i>=0;i--)if(BRK[i].st){const k=COLS.indexOf(BRK[i].col);if(k>=0)COLS.splice(k,1);BRK.splice(i,1);}CSTRUCT.forEach(stBuild);brkSync();}
{const _sg=startGame;startGame=function(){const r=_sg.apply(this,arguments);try{stBuildAll();}catch(e){console.error(e);}return r;};}
