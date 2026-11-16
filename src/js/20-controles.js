/* ================= CONTRÔLES ================= */
const keys={};let camYaw=Math.PI,camPitch=0.38;
window.addEventListener('keydown',e=>{if(e.target.tagName==='INPUT')return;keys[e.code]=true;
 if(!started||anyModal())return;
 if(e.code==='KeyE'||e.code==='KeyF')interact();
 if(e.code==='Space'){e.preventDefault();if(!e.repeat){jumpHeld=true;jump();}}
 if(e.code==='Enter'){e.preventDefault();openDlg({mode:'act'});setTimeout(()=>$('#dlg-in').focus(),50);}
 if(/^Digit[1-6]$/.test(e.code)){castSlot(+e.code.slice(5)-1);}});
window.addEventListener('keyup',e=>{keys[e.code]=false;if(e.code==='Space')jumpHeld=false;});
window.addEventListener('keydown',e=>{if(e.code==='Escape'){closeDlg();$('#book').classList.add('hidden');}});
const anyModal=()=>!$('#dlg').classList.contains('hidden')||!$('#book').classList.contains('hidden')||!$('#night').classList.contains('hidden')||!$('#pick').classList.contains('hidden')||!$('#map').classList.contains('hidden')||!$('#opts').classList.contains('hidden')||!$('#mjk').classList.contains('hidden');
const joy={id:null,x:0,y:0};const joyEl=$('#joy'),knob=$('#knob');
function joyMove(e){const r=joyEl.getBoundingClientRect();let dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2);const d=Math.hypot(dx,dy),m=50;if(d>m){dx*=m/d;dy*=m/d;}joy.x=dx/m;joy.y=-dy/m;knob.style.transform='translate('+dx+'px,'+dy+'px)';}
$('#joy-zone').addEventListener('pointerdown',e=>{if(joy.id!==null)return;joy.id=e.pointerId;joyMove(e);e.preventDefault();});
const drag={id:null,x:0,y:0};
canvas.addEventListener('pointerdown',e=>{if(drag.id!==null)return;drag.id=e.pointerId;drag.x=e.clientX;drag.y=e.clientY;});
window.addEventListener('pointermove',e=>{if(e.pointerId===joy.id)joyMove(e);else if(e.pointerId===drag.id){const mx=e.clientX-drag.x,my=e.clientY-drag.y;/* un saut énorme = événement perdu : on l'ignore ; un geste vif tourne plus (accélération) */if(!PINCH.on&&Math.abs(mx)<260&&Math.abs(my)<260){const ax=1+Math.min(1.1,Math.abs(mx)/32),ay=1+Math.min(0.8,Math.abs(my)/40);{const dy=mx*0.0068*AIMO.sens*ax;camYaw-=dy;}camPitch=clamp(camPitch+my*0.0034*AIMO.sens*ay,-0.35,1.25);}drag.x=e.clientX;drag.y=e.clientY;}});
/* doigt « perdu » (appel, notification, changement d'appli) : on libère joystick et caméra */
function ctrlReset(){joy.id=null;joy.x=joy.y=0;knob.style.transform='';drag.id=null;if(typeof PINCH!=='undefined'){PINCH.on=false;PINCH.id=null;}}
window.addEventListener('blur',ctrlReset);document.addEventListener('visibilitychange',()=>{if(document.hidden)ctrlReset();});
function up(e){if(e.pointerId===joy.id){joy.id=null;joy.x=joy.y=0;knob.style.transform='';}if(e.pointerId===drag.id)drag.id=null;}
window.addEventListener('pointerup',up);window.addEventListener('pointercancel',up);
function btn(id,fn){$(id).addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();if(started&&!anyModal())fn();});}
btn('#b-act',interact);btn('#b-jump',()=>{jumpHeld=true;jump();});
['pointerup','pointercancel','pointerleave'].forEach(ev=>$('#b-jump').addEventListener(ev,()=>{jumpHeld=false;}));
document.querySelectorAll('.slot').forEach(b=>b.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();if(started&&!anyModal())castSlot(+b.dataset.s);}));
$('#b-mj').onclick=()=>{if(started&&!anyModal())openDlg({mode:'act'});};

