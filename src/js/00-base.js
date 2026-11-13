'use strict';
const $=s=>document.querySelector(s);
const TAU=Math.PI*2;
const rnd=(a,b)=>a+Math.random()*(b-a);
const pick=a=>a[Math.floor(Math.random()*a.length)];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let seed=20261111;const srand=()=>{seed=(seed*16807)%2147483647;return (seed-1)/2147483646;};
const noise=(x,z)=>Math.sin(x*0.13+1.7)*Math.cos(z*0.11-0.4)+Math.sin(x*0.31+z*0.17)*0.5+Math.sin(x*0.71-z*0.53)*0.25;

