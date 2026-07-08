'use client';

import { useEffect, useMemo, useState } from 'react';
import { Home, MessageCircle, CalendarDays, ShoppingCart, LineChart, Send, Copy, RotateCcw, Target, CheckCircle2, Sparkles, PackageCheck } from 'lucide-react';
import { mealOptions } from '../data/recipes';
import { calculateShopping, coachAdvice, days, defaultState, estimateFood, targetDate, trend } from '../lib/planner';
import { fmt } from '../data/packaging';

const STORAGE_KEY = 'mealprep-coach-v2-0';

function Card({ children, className='' }) { return <div className={`card ${className}`}>{children}</div>; }
function Stat({ label, value }) { return <div className="stat"><span>{label}</span><b>{value}</b></div>; }
function ProgressBar({ value }) { return <div className="progress"><div style={{width:`${Math.min(100,Math.max(0,value))}%`}} /></div>; }

export default function App(){
  const [tab,setTab]=useState('dashboard');
  const [state,setState]=useState(defaultState);
  const [coachText,setCoachText]=useState('');
  const [pending,setPending]=useState(null);
  const [newWeight,setNewWeight]=useState('');
  const [toast,setToast]=useState('');

  useEffect(()=>{const saved=localStorage.getItem(STORAGE_KEY)||localStorage.getItem('mealprep-coach-v1-3')||localStorage.getItem('mealprep-coach-v1-2')||localStorage.getItem('mealprep-coach-v1-1'); if(saved){try{const p=JSON.parse(saved); setState({...defaultState,...p, profile:{...defaultState.profile,...(p.profile||{})}, foodLog:p.foodLog||[], pantry:p.pantry||{}, checkedItems:p.checkedItems||{}})}catch{}}},[]);
  useEffect(()=>{localStorage.setItem(STORAGE_KEY,JSON.stringify(state))},[state]);

  const shopping=useMemo(()=>calculateShopping(state.plan,state.pantry),[state.plan,state.pantry]);
  const today=new Date().toISOString().slice(0,10);
  const todayLog=(state.foodLog||[]).filter(x=>x.date===today);
  const eatenKcal=todayLog.reduce((s,x)=>s+x.kcal,0);
  const eatenProtein=todayLog.reduce((s,x)=>s+x.protein,0);
  const eatenCarbs=todayLog.reduce((s,x)=>s+(x.carbs||0),0);
  const eatenFat=todayLog.reduce((s,x)=>s+(x.fat||0),0);
  const profile=state.profile;
  const kcalLeft=Math.max(0,profile.kcal-eatenKcal);
  const proteinLeft=Math.max(0,profile.protein-eatenProtein);
  const advice=coachAdvice(kcalLeft,proteinLeft);
  const startWeight=Number(profile.startWeight||75);
  const lost=Math.max(0,startWeight-profile.weight);
  const remaining=Math.max(0,profile.weight-profile.goal);
  const progress=(lost/Math.max(.1,startWeight-profile.goal))*100;
  const dailyDeficit=Math.max(0,profile.maintenance-profile.kcal);
  const weeklyLoss=(dailyDeficit*7)/7700;
  const predictedWeeks=weeklyLoss?Math.ceil(remaining/weeklyLoss):null;
  const weightTrend=trend(state.weights);
  const checkedCount=Object.values(state.checkedItems||{}).filter(Boolean).length;
  const totalItems=Object.values(shopping.adjustedTotals||{}).filter(v=>v>0).length;
  const shopProgress=totalItems?Math.round(checkedCount/totalItems*100):100;

  function showToast(t){setToast(t);setTimeout(()=>setToast(''),1400)}
  function updateProfile(field,value){setState(s=>({...s,profile:{...s.profile,[field]:field==='name'?value:Number(value)}}))}
  function updateMeal(day,index,value){setState(s=>({...s,plan:{...s.plan,[day]:s.plan[day].map((m,i)=>i===index?value:m)}}))}
  function updatePantry(key,value){setState(s=>({...s,pantry:{...s.pantry,[key]:value}}))}
  function toggleChecked(key){setState(s=>({...s,checkedItems:{...s.checkedItems,[key]:!s.checkedItems?.[key]}}))}
  async function copy(text){await navigator.clipboard.writeText(text);showToast('Gekopieerd')}
  function runCoach(){if(!coachText.trim())return; setPending(estimateFood(coachText)); setCoachText('')}
  function addEstimate(){if(!pending)return; setState(s=>({...s,foodLog:[pending,...(s.foodLog||[])]})); setPending(null); showToast('Toegevoegd + dag bijgewerkt')}
  function deleteLog(i){const item=todayLog[i]; setState(s=>({...s,foodLog:s.foodLog.filter(x=>x!==item)}))}
  function addWeight(){const w=Number(newWeight); if(!w)return; setState(s=>({...s,profile:{...s.profile,weight:w},weights:[{date:today,weight:w},...s.weights]})); setNewWeight(''); showToast('Gewicht opgeslagen')}

  const nav=[['dashboard',Home,'Home'],['coach',MessageCircle,'Coach'],['planner',CalendarDays,'Menu'],['shopping',ShoppingCart,'Lijst'],['analysis',LineChart,'Analyse']];

  return <main className="app">
    <header><div><p className="eyebrow">Mealprep Coach 2.0</p><h1>Goedemorgen {profile.name||'Dominique'} 👋</h1></div><button className="tiny" onClick={()=>{setState(defaultState);showToast('Reset')}}><RotateCcw size={16}/> Reset</button></header>

    {tab==='dashboard'&&<section><Card className="hero"><div className="heroTop"><div><p className="mutedSmall">Huidig gewicht</p><div className="bigWeight">{fmt(profile.weight)} kg</div></div><div className="goalBadge"><Target size={17}/> Doel {fmt(profile.goal)} kg</div></div><ProgressBar value={progress}/><div className="heroMeta"><span>Nog {fmt(remaining)} kg</span><span>{fmt(lost)} kg kwijt · {Math.round(progress)}%</span></div></Card><div className="coach"><CheckCircle2 size={20}/><p>Vandaag: {eatenKcal}/{profile.kcal} kcal en {eatenProtein}/{profile.protein} g eiwit. Nog {kcalLeft} kcal en {proteinLeft} g eiwit.</p></div><div className="stats"><Stat label="Kcal vandaag" value={`${eatenKcal}/${profile.kcal}`}/><Stat label="Eiwit vandaag" value={`${eatenProtein}/${profile.protein} g`}/><Stat label="Koolhydraten" value={`${eatenCarbs} g`}/><Stat label="Vet" value={`${eatenFat} g`}/></div><Card><h2>Profiel</h2><div className="grid"><label>Naam<input value={profile.name||''} onChange={e=>updateProfile('name',e.target.value)}/></label><label>Startgewicht<input type="number" value={profile.startWeight} onChange={e=>updateProfile('startWeight',e.target.value)}/></label><label>Gewicht<input type="number" value={profile.weight} onChange={e=>updateProfile('weight',e.target.value)}/></label><label>Doel<input type="number" value={profile.goal} onChange={e=>updateProfile('goal',e.target.value)}/></label><label>Calorieën<input type="number" value={profile.kcal} onChange={e=>updateProfile('kcal',e.target.value)}/></label><label>Eiwit<input type="number" value={profile.protein} onChange={e=>updateProfile('protein',e.target.value)}/></label></div></Card></section>}

    {tab==='coach'&&<section><Card><h2><MessageCircle size={20}/> Coach-chat</h2><p className="muted">Typ wat je gegeten hebt. Je mag ook kcal/eiwit noemen, bijvoorbeeld: “lunch 620 kcal 35 g eiwit”.</p><div className="chatInput"><input placeholder="bijv. 300 g Skyr, 25 g muesli en banaan" value={coachText} onChange={e=>setCoachText(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')runCoach()}}/><button onClick={runCoach}><Send size={18}/></button></div>{pending&&<div className="estimate"><b>Schatting</b><p>{pending.text}</p><div className="estimateStats"><span>{pending.kcal} kcal</span><span>{pending.protein} g eiwit</span><span>{pending.carbs} g khd</span><span>{pending.fat} g vet</span></div><small>Herkend: {pending.matched.join(', ')}</small><div className="estimateActions"><button onClick={addEstimate}>Toevoegen + update dag</button><button className="secondary" onClick={()=>setPending(null)}>Niet toevoegen</button></div></div>}</Card><Card className="suggestions"><h2><Sparkles size={20}/> Rest van de dag</h2><div className="stats single"><Stat label="Nog kcal" value={kcalLeft}/><Stat label="Nog eiwit" value={`${proteinLeft} g`}/></div>{advice.map((a,i)=><p key={i} className="note">{a}</p>)}</Card><Card><h2>Vandaag gelogd</h2><div className="history">{todayLog.length===0?<p className="muted">Nog niets gelogd vandaag.</p>:todayLog.map((item,i)=><p key={i}><b>{item.time}</b> — {item.text}<br/><span>{item.kcal} kcal · {item.protein} g eiwit · {item.carbs||0} g khd · {item.fat||0} g vet</span> <button className="linkBtn" onClick={()=>deleteLog(i)}>verwijder</button></p>)}</div></Card></section>}

    {tab==='planner'&&<section><Card><h2>Weekplanner</h2>{days.map(day=>{const total=shopping.dayTotals[day];return <div className="day" key={day}><div className="dayHead"><b>{day}</b><span>{total.kcal} kcal · {total.protein} g eiwit</span></div><div className="mealgrid"><select value={state.plan[day][0]} onChange={e=>updateMeal(day,0,e.target.value)}>{mealOptions.lunch.map(o=><option key={o}>{o}</option>)}</select><select value={state.plan[day][1]} onChange={e=>updateMeal(day,1,e.target.value)}>{mealOptions.dinner.map(o=><option key={o}>{o}</option>)}</select></div></div>})}</Card></section>}

    {tab==='shopping'&&<section><Card className="shopSummary"><h2>Boodschappen</h2><div className="shopStatus"><span>{checkedCount} van {totalItems} nodig-items afgevinkt</span><b>{shopProgress}%</b></div><ProgressBar value={shopProgress}/></Card><Card><h2><PackageCheck size={19}/> In huis</h2><p className="muted">Vul in wat je al hebt. Dit wordt afgetrokken van je boodschappenlijst.</p>{['Vlees/vis','Zuivel','Koolhydraten','Groente','Fruit','Sauzen','Overig'].map(cat=>shopping.grouped[cat]&&<div key={cat}><h3>{cat}</h3>{shopping.grouped[cat].map(item=><div className="pantryRow" key={item.key}><span>{item.name}<small>{fmt(item.amount)} {item.unit} nodig</small></span><input type="number" placeholder={`0 ${item.unit}`} value={state.pantry?.[item.key]||''} onChange={e=>updatePantry(item.key,e.target.value)}/></div>)}</div>)}</Card><Card><h2>Boodschappenlijst</h2>{['Vlees/vis','Zuivel','Koolhydraten','Groente','Fruit','Sauzen','Overig'].map(cat=>shopping.grouped[cat]&&<div key={cat}><h3>{cat}</h3>{shopping.grouped[cat].map(item=><label className={`check ${item.needed===0?'enough':''}`} key={item.key}><input type="checkbox" disabled={item.needed===0} checked={item.needed===0||!!state.checkedItems?.[item.key]} onChange={()=>toggleChecked(item.key)}/><span>{item.line}</span></label>)}</div>)}</Card><Card><h2><ShoppingCart size={19}/> Picnic kopieerlijst</h2><textarea readOnly value={shopping.picnicText}/><button onClick={()=>copy(shopping.picnicText)}><Copy size={18}/> Kopieer voor Picnic</button></Card></section>}

    {tab==='analysis'&&<section><Card><h2>Analyse</h2><div className="stats single"><Stat label="Dagtekort" value={`± ${dailyDeficit} kcal`}/><Stat label="Weektekort" value={`± ${dailyDeficit*7} kcal`}/><Stat label="Verwacht verlies" value={`± ${fmt(weeklyLoss)} kg/week`}/><Stat label="Richting doel" value={targetDate(predictedWeeks)}/></div>{weightTrend&&<p className="note">Werkelijke trend: {fmt(Math.abs(weightTrend.weekly))} kg per week {weightTrend.weekly<0?'omlaag':'omhoog'}.</p>}</Card><Card><h2>Gewicht bijhouden</h2><div className="inline"><input placeholder="bijv. 74.6" value={newWeight} onChange={e=>setNewWeight(e.target.value)}/><button onClick={addWeight}>Toevoegen</button></div><div className="history">{state.weights.map((item,i)=><p key={i}>{item.date}: <b>{fmt(item.weight)} kg</b></p>)}</div></Card></section>}

    <nav>{nav.map(([id,Icon,label])=><button key={id} className={tab===id?'active':''} onClick={()=>setTab(id)}><Icon size={19}/><span>{label}</span></button>)}</nav>{toast&&<div className="toast">{toast}</div>}
  </main>
}
