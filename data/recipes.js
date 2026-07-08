export const recipes = [
  { id:'kip-rijst-bowl', name:'Kip rijst bowl', type:'lunch', kcal:460, protein:43, prep:'Bak kip, kook rijst en voeg broccoli/paprika toe.', ingredients:[['kipfilet',150,'g','Vlees/vis'],['rijst ongekookt',35,'g','Koolhydraten'],['broccoli',200,'g','Groente'],['paprika',0.5,'stuk','Groente'],['sesamolie',5,'ml','Sauzen']] },
  { id:'tonijn-pasta', name:'Tonijn pasta', type:'lunch', kcal:470, protein:40, prep:'Kook pasta en meng met tonijn, yoghurt, spinazie en tomaat.', ingredients:[['tonijn uit blik',1,'blik','Vlees/vis'],['volkoren pasta',60,'g','Koolhydraten'],['spinazie',100,'g','Groente'],['cherrytomaten',100,'g','Groente'],['Griekse yoghurt 0%',50,'g','Zuivel']] },
  { id:'skyr-bowl', name:'Skyr bowl', type:'lunch', kcal:420, protein:38, prep:'Skyr met fruit, muesli en chiazaad.', ingredients:[['Skyr naturel',300,'g','Zuivel'],['aardbeien',150,'g','Fruit'],['blauwe bessen',75,'g','Fruit'],['muesli',25,'g','Koolhydraten'],['chiazaad',10,'g','Overig']] },
  { id:'mediterrane-couscous', name:'Mediterrane couscous', type:'lunch', kcal:470, protein:42, prep:'Couscous met kip, komkommer, tomaat en feta.', ingredients:[['kipfilet',150,'g','Vlees/vis'],['volkoren couscous',50,'g','Koolhydraten'],['komkommer',0.5,'stuk','Groente'],['tomaat',100,'g','Groente'],['feta light',30,'g','Zuivel']] },
  { id:'kip-teriyaki', name:'Kip teriyaki', type:'dinner', kcal:560, protein:48, prep:'Kip teriyaki met rijst, broccoli en sperziebonen.', ingredients:[['kipfilet',180,'g','Vlees/vis'],['rijst ongekookt',35,'g','Koolhydraten'],['broccoli',200,'g','Groente'],['sperziebonen',100,'g','Groente'],['teriyakisaus light',20,'ml','Sauzen'],['sesamolie',5,'ml','Sauzen']] },
  { id:'zalm-oven', name:'Zalm uit de oven', type:'dinner', kcal:600, protein:38, prep:'Zalm met krieltjes en broccoli.', ingredients:[['zalm',150,'g','Vlees/vis'],['krieltjes',200,'g','Koolhydraten'],['broccoli',250,'g','Groente'],['olijfolie',5,'ml','Sauzen']] },
  { id:'taco-bowl', name:'Taco bowl', type:'dinner', kcal:560, protein:45, prep:'Mager gehakt met rijst, bonen, paprika, salsa en yoghurt.', ingredients:[['mager rundergehakt',150,'g','Vlees/vis'],['rijst ongekookt',30,'g','Koolhydraten'],['paprika',1,'stuk','Groente'],['kidneybonen',75,'g','Groente'],['maïs',50,'g','Groente'],['Griekse yoghurt 0%',50,'g','Zuivel'],['salsa',50,'g','Sauzen']] },
  { id:'kip-curry', name:'Kip curry', type:'dinner', kcal:540, protein:45, prep:'Kip curry met rijst, bloemkool, spinazie en light kokosmelk.', ingredients:[['kipfilet',180,'g','Vlees/vis'],['bloemkool',0.5,'stuk','Groente'],['spinazie',100,'g','Groente'],['light kokosmelk',100,'ml','Sauzen'],['rijst ongekookt',50,'g','Koolhydraten'],['currypasta',20,'g','Sauzen']] },
  { id:'italiaanse-kip', name:'Italiaanse kip', type:'dinner', kcal:560, protein:48, prep:'Kip met courgette, champignons, tomatensaus en volkoren pasta.', ingredients:[['kipfilet',180,'g','Vlees/vis'],['volkoren pasta',60,'g','Koolhydraten'],['courgette',1,'stuk','Groente'],['champignons',150,'g','Groente'],['gezeefde tomaten',150,'g','Sauzen'],['Parmezaanse kaas',10,'g','Zuivel']] }
];

export const mealOptions = {
  lunch: ['Uit eten / overslaan', ...recipes.filter(r => r.type === 'lunch').map(r => r.name)],
  dinner: ['Uit eten / overslaan', ...recipes.filter(r => r.type === 'dinner').map(r => r.name)]
};

export const recipeByName = Object.fromEntries([
  ['Uit eten / overslaan', { name:'Uit eten / overslaan', kcal:0, protein:0, ingredients:[], prep:'' }],
  ...recipes.map(r => [r.name, r])
]);
