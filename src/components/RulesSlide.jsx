import React from 'react';
import { useGame } from '../store/gameStore.jsx';

const rulesData = [
  {
    title: 'Game Overview',
    subtitle: 'How KaSiPo Works',
    icon: '🏨',
    items: [
      { icon: '💰', text: 'Each team starts with 100 coins' },
      { icon: '📋', text: '30 questions across 3 rounds' },
      { icon: '🎯', text: 'Bet coins before each question' },
      { icon: '✅', text: 'Correct answer = WIN your bet' },
      { icon: '❌', text: 'Wrong answer = LOSE your bet' },
      { icon: '⚡', text: 'Double Down = 2x risk and reward (2 uses per round)' },
    ]
  },
  {
    title: 'Round Structure',
    subtitle: 'Three Unique Rounds',
    icon: '🎮',
    items: [
      { icon: '🟡', text: 'Round 1 - Gamble Round: 8 questions, min bet 10' },
      { icon: '🔵', text: 'Round 2 - Power Round: 12 questions, buy power cards first' },
      { icon: '🔴', text: 'Final Round - All In: 10 questions, min bet 20, higher stakes' },
      { icon: '🎲', text: 'Random Event triggers after every 2 questions' },
      { icon: '💳', text: 'Round 2: Take a credit card loan up to 50 coins (20% interest!)' },
      { icon: '🏁', text: 'Most coins at the end wins the game' },
    ]
  },
  {
    title: 'Power Cards',
    subtitle: 'Buy, Use, Dominate',
    icon: '🃏',
    items: [
      { icon: '🔴', text: 'System Error (20) - Steal a turn from another team' },
      { icon: '🛎', text: 'Complimentary (15) - Second chance after wrong answer (½ reward)' },
      { icon: '🟢', text: 'Insurance (25) - Protect your bet from loss (max 50)' },
      { icon: '📋', text: 'Doppelganger (20) - Reuse a previously used power card' },
      { icon: '🎰', text: 'Ga Cha Ga Me (20) - Flip a coin: +50 or -50 coins' },
      { icon: '📞', text: 'Russian Roulette (15) - +10 per chamber survived (or lose turn)' },
      { icon: '📊', text: 'PMS Analytics (15) - Eliminate 2 wrong answers' },
      { icon: '🤝', text: 'Loyalty Program (15) - Pair w/ a team: both right = mystery bonus' },
    ]
  }
];

export default function RulesSlide({ page = 1 }) {
  const { dispatch } = useGame();
  const data = rulesData[page - 1];

  function goNext() {
    if (page < 3) {
      dispatch({ type: 'SET_PHASE', phase: `rules${page + 1}` });
    } else {
      dispatch({ type: 'SET_PHASE', phase: 'round_intro' });
    }
  }

  function goBack() {
    if (page > 1) {
      dispatch({ type: 'SET_PHASE', phase: `rules${page - 1}` });
    } else {
      dispatch({ type: 'SET_PHASE', phase: 'cover' });
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f1a2e',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>{data.icon}</div>
      <div style={{ color: '#F5A623', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '4px' }}>
        Rules - Page {page} of 3
      </div>
      <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>{data.title}</h2>
      <p style={{ color: '#8899aa', marginBottom: '28px' }}>{data.subtitle}</p>

      <div style={{
        background: '#162035',
        border: '2px solid #F5A623',
        borderRadius: '14px',
        padding: '28px',
        width: '100%',
        maxWidth: '560px',
        marginBottom: '28px',
      }}>
        {data.items.map((item, i) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            padding: '10px 0',
            borderBottom: i < data.items.length - 1 ? '1px solid #1e3050' : 'none',
          }}>
            <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{item.icon}</span>
            <span style={{ fontSize: '0.95rem', color: '#d0dde8', lineHeight: '1.4' }}>{item.text}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '16px' }}>
        <button className="btn-nav" onClick={goBack}>{'<'} Back</button>
        <button className="btn-gold" onClick={goNext}>
          {page < 3 ? 'Next →' : 'Start Round 1 →'}
        </button>
      </div>
    </div>
  );
}
