'use client';

import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, ClipboardList, LineChart, ShoppingCart, User, Copy, RotateCcw, Utensils, Store } from 'lucide-react';
import { recipes, mealOptions } from '../data/recipes';
import { calculateShopping, days, defaultState, trend } from '../lib/planner';
import { fmt } from '../data/packaging';

const STORAGE_KEY = 'mealprep-coach-v1-full';

function Card({ children, className = '' }) {
  return <div className={`card ${className}`}>{children}</div>;
}

function Stat({ label, value }) {
  return <div className="stat"><span>{label}</span><b>{value}</b></div>;
}

export default function App() {
  const [tab, setTab] = useState('dashboard');
  const [state, setState] = useState(defaultState);
  const [newWeight, setNewWeight] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { setState(JSON.parse(saved)); } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const shopping = useMemo(() => calculateShopping(state.plan), [state.plan]);
  const weightTrend = useMemo(() => trend(state.weights), [state.weights]);

  const profile = state.profile;
  const remaining = Math.max(0, profile.weight - profile.goal);
  const dailyDeficit = Math.max(0, profile.maintenance - profile.kcal);
  const weeklyLossExpected = dailyDeficit ? (dailyDeficit * 7) / 7700 : 0;
  const predictedWeeks = weeklyLossExpected ? Math.ceil(remaining / weeklyLossExpected) : null;
  const avgLunchDinnerKcal = Math.round(shopping.kcal / 7);
  const avgLunchDinnerProtein = Math.round(shopping.protein / 7);

  function updateProfile(field, value) {
    setState(s => ({ ...s, profile: { ...s.profile, [field]: Number(value) }}));
  }

  function updateMeal(day, index, value) {
    setState(s => ({
      ...s,
      plan: { ...s.plan, [day]: s.plan[day].map((m, i) => i === index ? value : m) }
    }));
  }

  function addWeight() {
    const weight = Number(newWeight);
    if (!weight) return;
    setState(s => ({
      ...s,
      profile: { ...s.profile, weight },
      weights: [{ date: new Date().toISOString().slice(0,10), weight }, ...s.weights]
    }));
    setNewWeight('');
    showToast('Gewicht opgeslagen');
  }

  function showToast(message) {
    setToast(message);
    setTimeout(() => setToast(''), 1400);
  }

  async function copy(text) {
    await navigator.clipboard.writeText(text);
    showToast('Gekopieerd');
  }

  function toggleChecked(key) {
    setState(s => ({
      ...s,
      checkedItems: { ...s.checkedItems, [key]: !s.checkedItems[key] }
    }));
  }

  const nav = [
    ['dashboard', User, 'Profiel'],
    ['planner', CalendarDays, 'Menu'],
    ['recipes', Utensils, 'Recepten'],
    ['shopping', ShoppingCart, 'Lijst'],
    ['analysis', LineChart, 'Analyse']
  ];

  return (
    <main className="app">
      <header>
        <div>
          <p className="eyebrow">Mealprep Coach v1</p>
          <h1>Afvallen zonder je weekend op te geven</h1>
        </div>
        <button className="tiny" onClick={() => { setState(defaultState); showToast('Reset'); }}>
          <RotateCcw size={16}/> Reset
        </button>
      </header>

      {tab === 'dashboard' && (
        <section>
          <Card className="hero">
            <h2>Jouw profiel</h2>
            <div className="grid">
              <label>Leeftijd<input type="number" value={profile.age} onChange={e => updateProfile('age', e.target.value)} /></label>
              <label>Lengte cm<input type="number" value={profile.height} onChange={e => updateProfile('height', e.target.value)} /></label>
              <label>Gewicht<input type="number" value={profile.weight} onChange={e => updateProfile('weight', e.target.value)} /></label>
              <label>Doelgewicht<input type="number" value={profile.goal} onChange={e => updateProfile('goal', e.target.value)} /></label>
              <label>Calorieën/dag<input type="number" value={profile.kcal} onChange={e => updateProfile('kcal', e.target.value)} /></label>
              <label>Eiwit/dag<input type="number" value={profile.protein} onChange={e => updateProfile('protein', e.target.value)} /></label>
              <label>Onderhoud kcal<input type="number" value={profile.maintenance} onChange={e => updateProfile('maintenance', e.target.value)} /></label>
            </div>
          </Card>

          <div className="stats">
            <Stat label="Nog te gaan" value={`${fmt(remaining)} kg`} />
            <Stat label="Verwachte duur" value={predictedWeeks ? `± ${predictedWeeks} weken` : '—'} />
            <Stat label="Lunch+diner" value={`${avgLunchDinnerKcal} kcal/dag`} />
            <Stat label="Eiwit lunch+diner" value={`${avgLunchDinnerProtein} g/dag`} />
          </div>

          <Card>
            <h2>Supermarktmodule</h2>
            <p>V1 heeft een betrouwbare Picnic-kopieerlijst en een duidelijke boodschappenchecklist. Automatisch winkelmandje vullen staat voorbereid als aparte module, maar is pas verantwoord als er een officiële of stabiele supermarkt-API beschikbaar is.</p>
          </Card>
        </section>
      )}

      {tab === 'planner' && (
        <section>
          <Card>
            <h2>Weekplanner</h2>
            {days.map(day => {
              const total = shopping.dayTotals[day];
              return (
                <div className="day" key={day}>
                  <div className="dayHead">
                    <b>{day}</b>
                    <span>{total.kcal} kcal · {total.protein} g eiwit</span>
                  </div>
                  <div className="mealgrid">
                    <select value={state.plan[day][0]} onChange={e => updateMeal(day, 0, e.target.value)}>
                      {mealOptions.lunch.map(option => <option key={option}>{option}</option>)}
                    </select>
                    <select value={state.plan[day][1]} onChange={e => updateMeal(day, 1, e.target.value)}>
                      {mealOptions.dinner.map(option => <option key={option}>{option}</option>)}
                    </select>
                  </div>
                </div>
              );
            })}
          </Card>
        </section>
      )}

      {tab === 'recipes' && (
        <section>
          <Card>
            <h2>Recepten</h2>
            <p className="muted">Eerste set mealprep-recepten. V1 is bewust compact en uitbreidbaar.</p>
            {recipes.map(recipe => (
              <details className="recipe" key={recipe.id}>
                <summary>
                  <span>{recipe.name}</span>
                  <small>{recipe.kcal} kcal · {recipe.protein} g eiwit</small>
                </summary>
                <p>{recipe.prep}</p>
                <ul>
                  {recipe.ingredients.map(([name, amount, unit]) => (
                    <li key={name}>{fmt(amount)} {unit} {name}</li>
                  ))}
                </ul>
              </details>
            ))}
          </Card>
        </section>
      )}

      {tab === 'shopping' && (
        <section>
          <Card>
            <h2>Boodschappenlijst</h2>
            {['Vlees/vis','Zuivel','Koolhydraten','Groente','Fruit','Sauzen','Overig'].map(cat => shopping.grouped[cat] && (
              <div key={cat}>
                <h3>{cat}</h3>
                {shopping.grouped[cat].map(item => (
                  <label className="check" key={item.key}>
                    <input type="checkbox" checked={!!state.checkedItems[item.key]} onChange={() => toggleChecked(item.key)} />
                    <span>{item.line}</span>
                  </label>
                ))}
              </div>
            ))}
          </Card>

          <Card>
            <h2><Store size={19}/> Picnic kopieerlijst</h2>
            <textarea readOnly value={shopping.picnicText} />
            <button onClick={() => copy(shopping.picnicText)}><Copy size={18}/> Kopieer voor Picnic</button>
          </Card>
        </section>
      )}

      {tab === 'analysis' && (
        <section>
          <Card>
            <h2>Analyse</h2>
            <div className="stats single">
              <Stat label="Dagtekort" value={`± ${dailyDeficit} kcal`} />
              <Stat label="Weektekort" value={`± ${dailyDeficit * 7} kcal`} />
              <Stat label="Verwacht verlies" value={`± ${fmt(weeklyLossExpected)} kg/week`} />
              <Stat label="Richting 65 kg" value={predictedWeeks ? `± ${predictedWeeks} weken` : '—'} />
            </div>
            {weightTrend && (
              <p className="note">Werkelijke trend: {fmt(Math.abs(weightTrend.weekly))} kg per week {weightTrend.weekly < 0 ? 'omlaag' : 'omhoog'}.</p>
            )}
          </Card>

          <Card>
            <h2>Gewicht bijhouden</h2>
            <div className="inline">
              <input placeholder="bijv. 74.6" value={newWeight} onChange={e => setNewWeight(e.target.value)} />
              <button onClick={addWeight}>Toevoegen</button>
            </div>
            <div className="history">
              {state.weights.map((item, index) => (
                <p key={index}>{item.date}: <b>{fmt(item.weight)} kg</b></p>
              ))}
            </div>
          </Card>
        </section>
      )}

      <nav>
        {nav.map(([id, Icon, label]) => (
          <button key={id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)}>
            <Icon size={19}/><span>{label}</span>
          </button>
        ))}
      </nav>

      {toast && <div className="toast">{toast}</div>}
    </main>
  );
}
