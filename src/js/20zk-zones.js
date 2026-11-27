/* ================= ZONES DANGEREUSES : un niveau par zone =================
   zoneDe(x,z) → {n, niv} : la vallée est tranquille (niveau 1, les Ruines et les Hauteurs un peu plus) ; les Landes
   vont de 6 à 15 (Nid de la Vouivre) ; les Grandes Terres de 5 (Halte de l'Aube) à 18 (Pics de Givre-Haut).
   Une créature hostile qui apparaît dans une zone de niveau ≥ 4 est plus résistante et frappe plus fort
   (D.hp, D.bite, D.shotDmg, D.zniv) ; vaincue, elle rapporte plus d'XP et un peu d'or. Le niveau s'affiche à côté du
   nom du lieu, et on est prévenu en entrant dans une zone bien au-dessus de son niveau.
   Pas de renfort pour les créatures marquées zfix (méchants des avis de recherche, déjà des élites), ni pour les
   créatures paisibles, les familiers, les duels, la Faille, le dragon. */
const ZONES_T=[ /* Grandes Terres : lieu, rayon, niveau (le premier qui contient le point l'emporte) */
 ['terres_halte',75,5],['terres_sombrite',SOMB.R,14],['terres_pics',190,18],['terres_mines',110,16],['terres_ruines',100,15],['terres_dunes',170,12],
 ['terres_marais',150,12],['terres_sylve',170,10],['terres_lac',90,7],['terres_cote',90,8]];
const ZONES_L=[['landes_nid',45,15],['landes_plateau',40,10],['landes_pic',40,9],['landes_foret',45,7]];
const ZONE_BIO=[8,10,12,16,12,14,8]; /* par biome, ailleurs dans les Grandes Terres */
function zoneDe(x,z){const near=(T)=>{for(const [id,r,n] of T){const L=LOCBY[id];if(L&&Math.hypot(x-L.x,z-L.z)<r)return {n:L.name,niv:n};}return null;};
 const R=regionOf(x);
 if(R==='terres')return near(ZONES_T)||{n:'Grandes Terres',niv:ZONE_BIO[terBiomeAt(x,z)]||8};
 if(R==='landes')return near(ZONES_L)||{n:'Landes d’Ombrelune',niv:6};
 for(const [id,r,n] of [['ruines',22,3],['hauteurs',22,3]]){const L=LOCBY[id];if(L&&Math.hypot(x-L.x,z-L.z)<r)return {n:L.name,niv:n};}
 return {n:'Vallée d’Aldermoor',niv:1};}
/* les créatures hostiles prennent la force de leur zone */
{const _s=spawnCreatureAt;spawnCreatureAt=function(x,z,name,weak,look,hp,extra){const e=_s.apply(this,arguments);const D=e&&e.data;
  if(D&&S.zone==='monde'&&!D.calme&&!D.pet&&!D.duel&&!D.boss&&!D.dragon&&!D.wave&&!D.zfix){const Z=zoneDe(x,z);if(Z&&Z.niv>=4){const k=Z.niv-3;
   D.zniv=Z.niv;D.hp=Math.round(D.hp*(1+k*0.11));D.bite=Math.round((D.bite||(x>1500?8:5))*(1+k*0.08));D.shotDmg=Math.round((D.shotDmg||(x>1500?9:6))*(1+k*0.08));}}
  return e;};}
{const _k=killCreature;killCreature=function(e){const D=e&&e.data,z=D&&ENT.includes(e)&&D.zniv;const r=_k.apply(this,arguments);if(z){gainXP(Math.round(z*1.5));gainOr(Math.round(z*0.8),1);}return r;};}
/* entrer dans une zone : son nom et son niveau ; avertissement si elle dépasse nettement le tien */
const ZONE={t:0,cur:null,vus:{}};
function zoneTick(dt){ZONE.t-=dt;if(ZONE.t>0||!started)return;ZONE.t=0.6;if(S.zone!=='monde'){ZONE.cur=null;return;}
 const Z=zoneDe(player.x,player.z);ZONE.cur=Z;const key=Z.n+'|'+Z.niv;if(key===ZONE.last)return;const first=!ZONE.last;ZONE.last=key;if(first||Z.niv<4)return;
 if(Z.niv>lvl()+2){say('⚠ <b>'+esc(Z.n)+'</b> : zone de niveau <b>'+Z.niv+'</b> (tu es niveau '+lvl()+'). Les créatures y sont redoutables… et rapportent gros.','gm');
  if(!ZONE.vus[key]){ZONE.vus[key]=1;banner('⚠ '+Z.n,'Zone de niveau '+Z.niv);}}}
{const _w=world4Tick;world4Tick=function(dt){zoneTick(dt);return _w.apply(this,arguments);};}
{const _u=updateHUD;updateHUD=function(){const r=_u.apply(this,arguments);const Z=ZONE.cur;if(Z&&Z.niv>=4&&S.zone==='monde'){const el=$('#i-loc');el.textContent+=' · '+(Z.niv>lvl()+2?'⚠ ':'')+'niv. '+Z.niv;}return r;};}
