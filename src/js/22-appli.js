/* ================= APPLICATION MOBILE ================= */
// Plein écran, écran qui reste allumé pendant qu'on joue, et jeu disponible hors-ligne quand il est hébergé (https).
function fullScreen(on){try{const d=document.documentElement;if(on){const f=d.requestFullscreen||d.webkitRequestFullscreen;if(f)Promise.resolve(f.call(d)).catch(()=>{});}else{const f=document.exitFullscreen||document.webkitExitFullscreen;if(f&&document.fullscreenElement)Promise.resolve(f.call(document)).catch(()=>{});}}catch(e){}}
let wakeLock=null;
async function keepAwake(){try{if(started&&'wakeLock' in navigator&&document.visibilityState==='visible'&&!wakeLock){wakeLock=await navigator.wakeLock.request('screen');wakeLock.addEventListener('release',()=>{wakeLock=null;});}}catch(e){wakeLock=null;}}
document.addEventListener('visibilitychange',keepAwake);
['#b-new','#b-cont'].forEach(s=>$(s).addEventListener('click',()=>setTimeout(keepAwake,300)));
if('serviceWorker' in navigator&&location.protocol==='https:'&&!(window.claude&&window.claude.use))navigator.serviceWorker.register('sw.js').catch(()=>{});
