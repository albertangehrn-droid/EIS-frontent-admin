import IMAGES from '@/utils/imagePaths';

export const playerRows = [
  { name: 'Emma Stuart', color: '#DC2626', phd: false, image: IMAGES.ALL.PROFILE[1] },
  { name: 'Bert Heinze', color: '#60A5FA', phd: true, image: IMAGES.ALL.PROFILE[2] },
  { name: 'Stefanie Durand', color: '#14B8A6', phd: false, image: IMAGES.ALL.PROFILE[3] },
  { name: 'Frank Raponi', color: '#F97316', phd: false, image: IMAGES.ALL.PROFILE[6] },
  { name: 'Martin Buerli', color: '#65A30D', phd: false, image: IMAGES.ALL.PROFILE[8] },
  { name: 'Per Joos', color: '#A855F7', phd: true, image: IMAGES.ALL.PROFILE[4] },
  { name: 'Randy Longhorn', color: '#0EA5E9', phd: false, image: IMAGES.ALL.PROFILE[5] },
  { name: 'Jill Atherson', color: '#EC4899', phd: true, image: IMAGES.ALL.PROFILE[19] },
  { name: 'Linda Pastorakis', color: '#16A34A', phd: false, image: IMAGES.ALL.PROFILE[20] },
  { name: 'Adam deGroote', color: '#CA8A04', phd: false, image: IMAGES.ALL.PROFILE[21] },
  { name: 'Samuel Stein', color: '#6B7280', phd: false, image: IMAGES.ALL.PROFILE[22] },
  { name: 'Roberta Fong', color: '#22C55E', phd: false, image: IMAGES.ALL.PROFILE[16] },
  { name: 'Adrian Muster', color: '#8B5CF6', phd: true, image: IMAGES.ALL.PROFILE[24] },
  { name: 'Pradeep Gupta', color: '#F59E0B', phd: false, image: IMAGES.ALL.PROFILE[18] },
  { name: 'John Peters', color: '#EF4444', phd: false, image: IMAGES.ALL.PROFILE[7] },
  { name: 'Daniel Wang', color: '#3B82F6', phd: true, image: IMAGES.ALL.PROFILE[15] },
  { name: 'Wilma Grollmyer', color: '#0D9488', phd: false, image: IMAGES.ALL.PROFILE[23] },
  { name: 'Luis Fernandez', color: '#EA580C', phd: false, image: IMAGES.ALL.PROFILE[9] },
  { name: 'Jean Bardotte', color: '#F87171', phd: false, image: IMAGES.ALL.PROFILE[10] },
  { name: 'Thomas Kupik', color: '#A855F7', phd: false, image: IMAGES.ALL.PROFILE[17] },
  { name: 'Fred Smithson', color: '#38BDF8', phd: false, image: IMAGES.ALL.PROFILE[11] },
  { name: 'Anna Belloni', color: '#F472B6', phd: false, image: IMAGES.ALL.PROFILE[12] },
  { name: 'Ivan Tarowski', color: '#84CC16', phd: false, image: IMAGES.ALL.PROFILE[14] },
  { name: 'Laszlo Por', color: '#EAB308', phd: false, image: IMAGES.ALL.PROFILE[13] },
];

export const teams = [
  {
    leader: { name: 'Frank Raponi', title: 'CHRO', initials: 'FR' },
    members: [
      { name: 'Jill Atherson', title: 'Personnel & Training', initials: 'JA' },
      { name: 'Linda Pastorakis', title: 'Business Excellence', initials: 'LP' },
      { name: 'Adam deGroote', title: 'Facilities', initials: 'AD' },
    ],
  },
  {
    leader: { name: 'Martin Buerli', title: 'CFO', initials: 'MB' },
    members: [
      { name: 'Samuel Stein', title: 'Treasury', initials: 'SS' },
      { name: 'Roberta Fong', title: 'Accounting &', initials: 'RF' },
      { name: 'Adrian Muster PhD', title: 'Legal Office', initials: 'AM' },
      { name: 'Pradeep Gupta', title: 'IT', initials: 'PG' },
    ],
  },
  {
    leader: { name: 'Per Joos PhD', title: 'CTO', initials: 'PJ' },
    members: [
      { name: 'John Peters', title: 'Internet Products', initials: 'JP' },
      { name: 'Daniel Wang PhD', title: 'Mobile Products', initials: 'DW' },
      { name: 'Wilma Grollmyer', title: 'Procurement', initials: 'WG' },
      { name: 'Luis Fernandez', title: 'Fixed Products', initials: 'LF' },
      { name: 'Jean Bardotte', title: 'Operations', initials: 'JB' },
    ],
  },
  {
    leader: { name: 'Randy Longhorn', title: 'CCO', initials: 'RL' },
    members: [
      { name: 'Thomas Kupik', title: 'Consumer Sales', initials: 'TK' },
      { name: 'Fred Smithson', title: 'Regulatory Office', initials: 'FS' },
      { name: 'Anna Belloni', title: 'Marketing & Commi.', initials: 'AB' },
      { name: 'Laszlo Por', title: 'Corporate Sales', initials: 'LP' },
      { name: 'Ivan Tavrovski', title: 'International Roaming', initials: 'IT' },
    ],
  },
];

export function getPersonImage(personName) {
  const player = playerRows.find(p =>
    p.name.includes(personName.split(' ')[0]) || personName.includes(p.name.split(' ')[0])
  );
  return player?.image || null;
}

export function getPersonColor(personName) {
  const player = playerRows.find(p =>
    p.name.includes(personName.split(' ')[0]) || personName.includes(p.name.split(' ')[0])
  );
  return player?.color || '#222';
}


export function getPersonHoverImage(personName) {
  const player = playerRows.find(p =>
    p.name.includes(personName.split(' ')[0]) ||
    personName.includes(p.name.split(' ')[0])
  );

  if (!player) return null;

  // PNG ko JPG me convert karo
  return player.image.replace('.png', '.jpg');
}

export function getPersonStatus(personName, gameState) {
  if (!gameState?.managers) return 'unaware';
  const m = gameState.managers.find(m =>
    m.name.includes(personName.split(' ')[0]) || personName.includes(m.name.split(' ')[0])
  );
  if (!m) return 'unaware';

  // Check for "completed" status when ALL conditions are met
  const isFullyAdopted =
    m.adopted === 1 &&
    m.aware >= 1 &&
    m.interest === m.interestLimit &&
    m.experimentation === m.experimentationLimit;
  if (isFullyAdopted) return 'completed';

  if (m.adopted >= 1) return 'adopter'; // Binary: 0=not adopted, 1=adopted
  if (m.experimentation >= 1) return 'experiment';
  if (m.interest >= 1) return 'interest';
  if (m.aware >= 1) return 'aware';
  return 'unaware';
}
