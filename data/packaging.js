export const packSizes = {
  'kipfilet':[500,'g'], 'zalm':[300,'g'], 'mager rundergehakt':[300,'g'], 'tonijn uit blik':[1,'blik'],
  'Skyr naturel':[1000,'g'], 'Griekse yoghurt 0%':[500,'g'], 'rijst ongekookt':[500,'g'], 'volkoren pasta':[500,'g'],
  'volkoren couscous':[500,'g'], 'krieltjes':[500,'g'], 'broccoli':[500,'g'], 'paprika':[1,'stuk'],
  'courgette':[1,'stuk'], 'champignons':[400,'g'], 'spinazie':[400,'g'], 'komkommer':[1,'stuk'],
  'tomaat':[500,'g'], 'cherrytomaten':[250,'g'], 'bloemkool':[1,'stuk'], 'sperziebonen':[500,'g'],
  'aardbeien':[400,'g'], 'blauwe bessen':[300,'g'], 'muesli':[500,'g'], 'chiazaad':[250,'g'],
  'feta light':[150,'g'], 'Parmezaanse kaas':[150,'g'], 'salsa':[300,'g'], 'kidneybonen':[400,'g'],
  'maïs':[300,'g'], 'teriyakisaus light':[250,'ml'], 'light kokosmelk':[400,'ml'], 'currypasta':[200,'g'],
  'sesamolie':[250,'ml'], 'olijfolie':[500,'ml'], 'gezeefde tomaten':[500,'g']
};

export function fmt(value) {
  const rounded = Math.round(Number(value) * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : String(rounded).replace('.', ',');
}

export function packageLine(name, amount, unit) {
  const pack = packSizes[name];
  if (pack && pack[1] === unit) {
    const count = Math.ceil(amount / pack[0]);
    return `${count} × ${fmt(pack[0])} ${unit} ${name} (${fmt(amount)} ${unit} nodig)`;
  }
  return `${fmt(amount)} ${unit} ${name}`;
}
