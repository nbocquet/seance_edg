'use strict';
const $ = id => document.getElementById(id);
const money = n => new Intl.NumberFormat('fr-CH', {minimumFractionDigits:2, maximumFractionDigits:2}).format(n);
const options = (max,min=0) => Array.from({length:max-min+1},(_,i)=>`<option value="${i+min}">${i+min}</option>`).join('');
$('grade').innerHTML=options(33,4);$('grade').value=21;
$('level').innerHTML=options(22);$('level').value=10;
let detailed=false, groups=[{count:6,grade:21,level:10}], running=false, elapsed=0, started=0, frozenRate=null;
const positiveInteger = (x,max) => Number.isInteger(x)&&x>=1&&x<=max;
function read(){
 const rows=detailed ? groups : [{count:Number($('count').value),grade:Number($('grade').value),level:Number($('level').value)}];
 const charges=Number($('charges').value), frequency=Number($('frequency').value),minutes=Number($('minutes').value);
 if(!rows.length||rows.some(g=>!positiveInteger(g.count,500)||!salaries[g.grade]?.[g.level])||!positiveInteger(frequency,1000)||$('charges').value===''||!Number.isFinite(charges)||charges<0||charges>100)return null;
 const count=rows.reduce((s,g)=>s+g.count,0),base=rows.reduce((s,g)=>s+g.count*salaries[g.grade][g.level].hourly,0);
 return {rows,count,charges,frequency,minutes,base,rate:base*(1+charges/100),total:base*(1+charges/100)*minutes/60};
}
function render(){
 const data=read();$('error').hidden=!!data;$('start').disabled=!data;$('copy').disabled=!data;
 if(!data){for(const id of ['total','collective','yearly'])$(id).textContent='—';$('equation').textContent='Corrigez les valeurs pour obtenir une estimation.';return;}
 const salary=salaries[$('grade').value][$('level').value];
 $('salary').textContent=`${money(salary.hourly)} CHF / h par personne · ${money(salary.annual)} CHF brut / an`;
 $('total').textContent=money(data.total);
 $('basis').textContent=data.charges?`Avec ${data.charges} % de charges estimées`:'Hors charges patronales';
 $('equation').textContent=`${data.count} personne${data.count>1?'s':''} × ${data.minutes} min · ${money(data.rate)} CHF / h au total`;
 $('collective').textContent=`${new Intl.NumberFormat('fr-CH',{maximumFractionDigits:2}).format(data.count*data.minutes/60)} heures`;
 $('yearly').textContent=money(data.total*data.frequency)+' CHF';
 $('duration-label').textContent=`${Math.floor(data.minutes/60)} h ${String(data.minutes%60).padStart(2,'0')}`;
 document.querySelectorAll('[data-minutes]').forEach(b=>b.classList.toggle('active',Number(b.dataset.minutes)===data.minutes));
 updateClock();
}
function renderGroups(){
 $('people').innerHTML=groups.map((g,i)=>`<div class="group"><div class="group-fields"><div class="field"><label for="n-${i}">Personnes</label><input id="n-${i}" data-index="${i}" data-key="count" type="number" min="1" max="500" value="${g.count}"></div><div class="field"><label for="g-${i}">Classe</label><select id="g-${i}" data-index="${i}" data-key="grade">${options(33,4)}</select></div><div class="field"><label for="l-${i}">Annuité</label><select id="l-${i}" data-index="${i}" data-key="level">${options(22)}</select></div></div><button class="remove" data-remove="${i}" ${groups.length===1?'disabled':''}>Supprimer ce groupe</button></div>`).join('');
 groups.forEach((g,i)=>{$(`g-${i}`).value=g.grade;$(`l-${i}`).value=g.level;});
}
function mode(value){
 if(running||elapsed)return;
 if(value&&!detailed)groups=[{count:Number($('count').value)||6,grade:Number($('grade').value),level:Number($('level').value)}];
 if(!value&&detailed){$('count').value=groups.reduce((s,g)=>s+g.count,0);$('grade').value=groups[0].grade;$('level').value=groups[0].level;}
 detailed=value;$('shared').hidden=value;$('individual').hidden=!value;
 for(const [id,active] of [['simple',!value],['detail',value]]){$(id).classList.toggle('selected',active);$(id).setAttribute('aria-pressed',String(active));}
 renderGroups();render();
}
$('simple').onclick=()=>mode(false);$('detail').onclick=()=>mode(true);
$('minus').onclick=()=>{$('count').value=Math.max(1,(Number($('count').value)||1)-1);render();};
$('plus').onclick=()=>{$('count').value=Math.min(500,(Number($('count').value)||0)+1);render();};
$('add').onclick=()=>{groups.push({count:1,grade:21,level:10});renderGroups();render();};
$('people').addEventListener('input',event=>{const el=event.target;if(el.dataset.key){groups[Number(el.dataset.index)][el.dataset.key]=Number(el.value);render();}});
$('people').addEventListener('click',event=>{if(event.target.dataset.remove!==undefined&&groups.length>1){groups.splice(Number(event.target.dataset.remove),1);renderGroups();render();}});
for(const id of ['count','grade','level','minutes','frequency','charges'])$(id).addEventListener('input',render);
document.querySelectorAll('[data-minutes]').forEach(b=>b.onclick=()=>{$('minutes').value=b.dataset.minutes;render();});
function getElapsed(){return elapsed+(running?performance.now()-started:0);}
function updateClock(){const ms=getElapsed(),seconds=Math.floor(ms/1000);$('time').textContent=[Math.floor(seconds/3600),Math.floor(seconds/60)%60,seconds%60].map(n=>String(n).padStart(2,'0')).join(':');$('live-cost').textContent=money((frozenRate??read()?.rate??0)*ms/3600000)+' CHF';}
function lock(value){document.querySelectorAll('.setup input,.setup select,.setup button').forEach(el=>el.disabled=value);}
$('start').onclick=()=>{if(!read())return;if(running){elapsed=getElapsed();running=false;$('start').textContent='Reprendre le chrono';$('timer-state').textContent='En pause';}else{if(frozenRate===null)frozenRate=read().rate;started=performance.now();running=true;lock(true);$('start').textContent='Mettre en pause';$('timer-state').textContent='Séance en cours';}updateClock();};
$('reset').onclick=()=>{running=false;elapsed=0;frozenRate=null;lock(false);renderGroups();$('start').textContent='Démarrer le chrono';$('timer-state').textContent='Prêt à démarrer';render();};
setInterval(()=>{if(running)updateClock();},200);
$('copy').onclick=async()=>{const d=read();if(!d)return;const text=`Coût de la séance : ${money(d.total)} CHF\n${d.count} personnes, ${d.minutes} minutes\n${d.rows.map(g=>`${g.count} × classe ${g.grade}, annuité ${g.level} (${money(salaries[g.grade][g.level].hourly)} CHF/h)`).join('\n')}\nCharges patronales : ${d.charges} %\n${d.frequency} séance(s)/an : ${money(d.total*d.frequency)} CHF\nBarème État de Genève au 01.01.2024, 13e salaire compris. Estimation indicative.`;try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(text);}else{const area=document.createElement('textarea');area.value=text;area.style.position='fixed';area.style.opacity='0';document.body.append(area);area.select();const ok=document.execCommand('copy');area.remove();if(!ok)throw new Error('copy');}$('copy-status').textContent='Récapitulatif copié.';}catch{$('copy-status').textContent='Copie indisponible. Sélectionnez le résultat pour le copier.';}};
render();
