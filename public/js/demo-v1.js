(()=>{'use strict';
const root=document.getElementById('demo');if(!root)return;
const T={
ht:{kicker:'Ajoute otomatikman',title:'Nouvo manm yo antre dirèkteman nan kontak ou',desc:'Konekte Google Contacts ou yon sèl fwa. Chak nouvo manm DOBERTO VCF ajoute nan telefòn ou san ou pa fè anyen.',tag:'Gwoup · DOBERTO VCF',auto:'Ajout otomatik aktive',example:'Aperçu · egzanp',nw:'Nouvo'},
fr:{kicker:'Ajout automatique',title:'Les nouveaux membres arrivent directement dans vos contacts',desc:'Connectez Google Contacts une seule fois. Chaque nouveau membre DOBERTO VCF est ajouté à votre téléphone sans rien faire.',tag:'Groupe · DOBERTO VCF',auto:'Ajout automatique activé',example:'Aperçu · exemple',nw:'Nouveau'},
en:{kicker:'Automatic add',title:'New members land straight in your contacts',desc:'Connect Google Contacts once. Every new DOBERTO VCF member is added to your phone with no extra steps.',tag:'Group · DOBERTO VCF',auto:'Auto-add enabled',example:'Preview · example',nw:'New'}
};
const PEOPLE=[['Kwame A.','GH','+233'],['Priya S.','US','+1'],['Luis F.','DO','+1'],['Amara O.','NG','+234'],['Jean-Marc P.','CA','+1'],['Nadia R.','HT','+509'],['Élodie M.','FR','+33'],['Marc-André L.','HT','+509'],['Sofia T.','BR','+55'],['Idris K.','SN','+221']];
const list=document.getElementById('demoList');const SHOW=5;let i=0,timer=null,cur='ht';
function lang(){let l='ht';try{l=localStorage.getItem('doberto_lang')||'ht'}catch(_){}return T[l]?l:'ht'}
function row(p,fresh){const d=document.createElement('div');d.className='demo-row'+(fresh?' fresh':'');
 d.innerHTML='<span class="demo-av"></span><span class="demo-info"><strong></strong><small></small></span><span class="demo-new"></span>';
 d.querySelector('.demo-av').textContent=p[0][0];d.querySelector('strong').textContent=p[0];
 d.querySelector('small').textContent=p[1]+' '+p[2]+' ••• •• ••';d.querySelector('.demo-new').textContent=T[cur].nw;return d}
function text(){cur=lang();const d=T[cur];root.querySelectorAll('[data-demo]').forEach(e=>{const v=d[e.getAttribute('data-demo')];if(v)e.textContent=v});list.querySelectorAll('.demo-new').forEach(e=>e.textContent=d.nw)}
function seed(){list.innerHTML='';for(let k=SHOW-1;k>=0;k--){list.appendChild(row(PEOPLE[k%PEOPLE.length],false))}i=SHOW}
function step(){
 list.querySelectorAll('.demo-row.fresh').forEach(e=>e.classList.remove('fresh'));
 const last=list.lastElementChild;if(list.children.length>=SHOW&&last){last.classList.add('leave');setTimeout(()=>last.remove(),520)}
 const r=row(PEOPLE[i%PEOPLE.length],true);r.classList.add('enter');list.insertBefore(r,list.firstChild);
 void r.offsetHeight;requestAnimationFrame(()=>r.classList.remove('enter'));i++}
function start(){if(timer||matchMedia('(prefers-reduced-motion: reduce)').matches)return;timer=setInterval(step,2800)}
function stop(){clearInterval(timer);timer=null}
text();seed();list.firstElementChild.classList.add('fresh');
if('IntersectionObserver' in window){new IntersectionObserver(es=>es[0].isIntersecting?start():stop(),{threshold:.25}).observe(root)}else start();
document.addEventListener('visibilitychange',()=>document.hidden?stop():start());
document.addEventListener('change',e=>{if(e.target&&e.target.tagName==='SELECT')setTimeout(text,0)});
window.addEventListener('pageshow',text);
})();
