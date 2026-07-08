import { recipeByName } from '@/data/recipes';
import { packageLine } from '@/data/packaging';

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
  profile: {
    age: 34,
    sex: 'vrouw',
    height: 172,
    weight: 75,
    goal: 65,
    kcal: 1600,
    protein: 130,
    maintenance: 2200
  },
  plan: defaultPlan,
  weights: [{ date: new Date().toISOString().slice(0,10), weight: 75 }],
  checkedItems: {}
};

export function calculateShopping(plan) {
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
  Object.entries(totals).forEach(([key, amount]) => {
    const [name, unit] = key.split('|');
    const cat = cats[name] || 'Overig';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push({ key, name, amount, unit, line: packageLine(name, amount, unit) });
  });

  const picnicText = Object.entries(totals)
    .sort(([a],[b]) => a.localeCompare(b))
    .map(([key, amount]) => {
      const [name, unit] = key.split('|');
      return `${name} ${amount} ${unit}`;
    }).join('\\n');

  return { totals, grouped, picnicText, kcal, protein, dayTotals };
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
