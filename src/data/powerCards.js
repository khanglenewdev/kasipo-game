export const POWER_CARDS = [
  {
    id: 'system_error',
    name: 'System Error',
    emoji: '🔴',
    price: 20,
    type: 'Control',
    desc: 'Steal the next answering turn from a chosen team.',
    effect: 'steal_turn'
  },
  {
    id: 'complimentary',
    name: 'Complimentary Service',
    emoji: '🛎',
    price: 15,
    type: 'Recovery',
    desc: 'After answering incorrectly, get one second chance for half the original reward.',
    effect: 'second_chance'
  },
  {
    id: 'insurance',
    name: 'Insurance',
    emoji: '🟢',
    price: 25,
    type: 'Defensive',
    desc: 'Negates one incorrect answer. Maximum protected bet: 50 coins.',
    effect: 'protect_bet'
  },
  {
    id: 'doppelganger',
    name: 'Doppelganger',
    emoji: '📋',
    price: 20,
    type: 'Special',
    desc: 'Reuse one of your previously used power cards.',
    effect: 'reuse_card'
  },
  {
    id: 'gacha',
    name: 'Ga Cha Ga Me',
    emoji: '🎰',
    price: 20,
    type: 'Gamble',
    desc: 'High Risk. High Reward.',
    effect: 'gacha',
    hiddenEffect: 'Flip a coin: +50 coins (Huge profit) or -50 coins (Market crash)'
  },
  {
    id: 'russian_roulette',
    name: 'Russian Roulette',
    emoji: '📞',
    price: 15,
    type: 'Gamble',
    desc: 'Gain +10 coins for every survived chamber. If unlucky: lose the turn.',
    effect: 'russian_roulette'
  },
  {
    id: 'pms_analytics',
    name: 'PMS Analytics',
    emoji: '📊',
    price: 15,
    type: 'Support',
    desc: 'Eliminate 2 wrong answer options.',
    effect: 'eliminate_2'
  },
  {
    id: 'loyalty_program',
    name: 'Loyalty Program',
    emoji: '🤝',
    price: 15,
    type: 'Bonus',
    desc: 'Choose another team. If both teams answer correctly next question, both get a mystery bonus.',
    effect: 'loyalty',
    hiddenBonus: 30
  }
];
