export const RANDOM_EVENTS = [
  {
    id: 'overbooking',
    name: 'Overbooking Crisis',
    emoji: '🧳',
    desc: 'Hotel accidentally oversold rooms. The team in the lead loses 10 coins; all others gain 10 coins.',
    effect: 'highest_loses_10_others_gain_10'
  },
  {
    id: 'vip',
    name: 'VIP Celebrity Arrival',
    emoji: '⭐',
    desc: 'A high-profile guest checks in. The next correct answer earns +15 bonus coins.',
    effect: 'next_correct_plus_15'
  },
  {
    id: 'recession',
    name: 'Economic Recession',
    emoji: '💸',
    desc: 'Market downturn hits the hotel. All betting rewards are reduced by 50% for 1 round.',
    effect: 'bets_half_one_round'
  },
  {
    id: 'bad_review',
    name: 'Bad Review on TripAdvisor',
    emoji: '📱',
    desc: 'A scathing online review goes viral. One random team loses 10 coins.',
    effect: 'random_team_minus_10'
  },
  {
    id: 'peak_season',
    name: 'Peak Season',
    emoji: '📈',
    desc: 'Bookings are through the roof! All correct answers earn +10 extra coins for the next 3 rounds.',
    effect: 'correct_plus_10_one_round'
  },
  {
    id: 'ai_automation',
    name: 'AI Automation Surge',
    emoji: '🤖',
    desc: 'Penguin AI joins the round. On the next question, 1 wrong answer is automatically blacked out for everyone.',
    effect: 'all_eliminate_1'
  },
  {
    id: 'green_grant',
    name: 'Green Hotel Grant',
    emoji: '🌱',
    desc: 'Sustainable operations rewarded. The team with the lowest coins receives +15 government funding.',
    effect: 'lowest_plus_15'
  }
];
