import { recipeByName } from '../data/recipes';
import { packageLine } from '../data/packaging';

export const days = ['Maandag','Dinsdag','Woensdag','Donderdag','Vrijdag','Zaterdag','Zondag'];

export const defaultPlan = {
  Maandag: ['Kip rijst bowl','Italiaanse kip'],
  Dinsdag: ['Tonijn pasta','Kip curry'],
  Woensdag: ['Kip rijst bowl','Taco bowl'],
  Donderdag: ['Skyr bowl','Zalm uit de oven'],
  Vrijdag: ['Mediterrane couscous','Uit eten / overslaan'],
  Zaterdag: ['Uit eten / overslaan','Uit eten / overslaan'],
  Zondag: ['Skyr bowl','Kip teriyaki']
};

export const defaultState = {
  profile: { name:'Dominique', age:34, sex:'vrouw', height:172, startWeight:75, weight:75, goal:65, kcal:1600, protein:130, maintenance:2200, water:2.5 },
  plan: defaultPlan,
  weights: [{ date: new Date().toISOString().slice(0,10), weight: 75 }],
  checkedItems: {},
  pantry: {},
  foodLog: []
};

export function calculateShopping(plan, pantry = {}) {
  const totals = {};
  const cats = {};
  let kcal = 0;
  let protein = 0;
  const dayTotals = {};

  days.forEach(day => {
    let dayKcal = 0;
    let dayProtein = 0;
    plan[day].forEach(meal => {
      const recipe = recipeByName[meal];
      kcal += recipe.kcal;
      protein += recipe.protein;
      dayKcal += recipe.kcal;
      dayProtein += recipe.protein;
      recipe.ingredients.forEach(([name, amount, unit, cat]) => {
        const key = `${name}|${unit}`;
        totals[key] = (totals[key] || 0) + amount;
        cats[name] = cat;
      });
    });
    dayTotals[day] = { kcal: dayKcal, protein: dayProtein };
  });

  const grouped = {};
  const adjustedTotals = {};
  Object.entries(totals).forEach(([key, amount]) => {
    const [name, unit] = key.split('|');
    const inHouse = Number(pantry[key] || 0);
    const needed = Math.max(0, amount - inHouse);
    adjustedTotals[key] = needed;
    const cat = cats[name] || 'Overig';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push({ key, name, amount, inHouse, needed, unit, line: needed === 0 ? `${name}: genoeg in huis` : packageLine(name, needed, unit) });
  });

  const picnicText = Object.entries(adjustedTotals).filter(([, amount]) => amount > 0).sort(([a],[b]) => a.localeCompare(b)).map(([key, amount]) => {
    const [name, unit] = key.split('|');
    return `${name} ${amount} ${unit}`;
  }).join('\n');

  return { totals, adjustedTotals, grouped, picnicText, kcal, protein, dayTotals };
}

export function trend(weights) {
  if (!weights || weights.length < 2) return null;
  const sorted = [...weights].reverse();
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const daysBetween = Math.max(1, (new Date(last.date) - new Date(first.date)) / (1000 * 60 * 60 * 24));
  const weekly = ((last.weight - first.weight) / daysBetween) * 7;
  return { weekly };
}

export function targetDate(weeks) {
  if (!weeks) return '—';
  const date = new Date();
  date.setDate(date.getDate() + weeks * 7);
  return date.toLocaleDateString('nl-NL', { day:'numeric', month:'long' });
}

export const foodDb = [
  { keys:['skyr'], kcal:200, protein:30, carbs:12, fat:1 },
  { keys:['kwark'], kcal:200, protein:28, carbs:14, fat:1 },
  { keys:['muesli'], kcal:95, protein:3, carbs:17, fat:2 },
  { keys:['banaan'], kcal:110, protein:1, carbs:27, fat:0 },
  { keys:['appel'], kcal:85, protein:0, carbs:21, fat:0 },
  { keys:['ei','eieren'], kcal:75, protein:6, carbs:1, fat:5 },
  { keys:['kip'], kcal:250, protein:45, carbs:0, fat:6 },
  { keys:['rijst'], kcal:180, protein:4, carbs:39, fat:1 },
  { keys:['broccoli'], kcal:70, protein:5, carbs:8, fat:1 },
  { keys:['tonijn'], kcal:130, protein:28, carbs:0, fat:1 },
  { keys:['pasta'], kcal:230, protein:8, carbs:45, fat:2 },
  { keys:['zalm'], kcal:300, protein:32, carbs:0, fat:18 },
  { keys:['pizza'], kcal:850, protein:35, carbs:90, fat:35 },
  { keys:['broodje'], kcal:420, protein:18, carbs:55, fat:14 },
  { keys:['salade'], kcal:350, protein:20, carbs:20, fat:18 },
  { keys:['cappuccino'], kcal:80, protein:5, carbs:8, fat:3 },
  { keys:['wijn'], kcal:120, protein:0, carbs:3, fat:0 },
  { keys:['bier'], kcal:150, protein:1, carbs:12, fat:0 },
  { keys:['shake','eiwitshake'], kcal:120, protein:24, carbs:3, fat:2 },
  { keys:['cottage cheese'], kcal:220, protein:30, carbs:8, fat:6 }
];

export function estimateFood(text) {
  const lower = text.toLowerCase();
  let kcal = 0, protein = 0, carbs = 0, fat = 0;
  const matched = [];

  const explicitKcal = lower.match(/(\d{2,4})\s*(kcal|calorie|calorieen|calorieën)/);
  const explicitProtein = lower.match(/(\d{1,3})\s*(g\s*)?(eiwit|protein)/);

  foodDb.forEach(item => {
    const key = item.keys.find(k => lower.includes(k));
    if (!key) return;
    const grams = lower.match(new RegExp('(\\d+(?:[,.]\\d+)?)\\s*(g|gram)\\s*' + key));
    const amount = lower.match(new RegExp('(\\d+(?:[,.]\\d+)?)\\s*(x|keer|stuks?|glazen?|koppen?)?\\s*' + key));
    let mult = 1;
    if (grams) mult = Number(grams[1].replace(',', '.')) / 100;
    else if (amount) mult = Number(amount[1].replace(',', '.')) || 1;
    kcal += item.kcal * mult;
    protein += item.protein * mult;
    carbs += item.carbs * mult;
    fat += item.fat * mult;
    matched.push(mult !== 1 ? `${Math.round(mult * 10) / 10}× ${key}` : key);
  });

  if (explicitKcal) kcal = Number(explicitKcal[1]);
  if (explicitProtein) protein = Number(explicitProtein[1]);
  if (!kcal) { kcal = 500; protein = 20; carbs = 45; fat = 18; matched.push('algemene maaltijd'); }

  return {
    text,
    kcal: Math.round(kcal),
    protein: Math.round(protein),
    carbs: Math.round(carbs),
    fat: Math.round(fat),
    matched,
    date: new Date().toISOString().slice(0,10),
    time: new Date().toLocaleTimeString('nl-NL', { hour:'2-digit', minute:'2-digit' })
  };
}

export function coachAdvice(kcalLeft, proteinLeft) {
  if (kcalLeft <= 0) return [
    'Je zit qua kcal al op of boven je dagdoel. Houd de rest licht: water, thee, rauwkost of een kleine eiwitrijke snack als je echt honger hebt.',
    'Morgen gewoon terug naar je normale plan; niet extreem compenseren.'
  ];
  if (proteinLeft > 60) return [
    `Je hebt nog veel eiwit nodig. Kies straks een eiwitrijke maaltijd rond ${Math.min(kcalLeft, 650)} kcal.`,
    'Goede opties: kip met groente, tonijnsalade, Skyr + whey, of zalm met broccoli.'
  ];
  if (kcalLeft < 400) return [
    `Je hebt nog ongeveer ${kcalLeft} kcal over. Kies iets kleins en eiwitrijks.`,
    'Goede opties: 250 g Skyr, cottage cheese, 2 eieren, rauwkost of een eiwitshake.'
  ];
  return [
    `Je hebt nog ongeveer ${kcalLeft} kcal en ${proteinLeft} g eiwit over. Dat is genoeg voor een normale lichte maaltijd.`,
    'Goede opties: kip bowl, tonijnpasta met kleinere pastaportie, curry met extra groente of een Skyr bowl.'
  ];
}
