import React from 'react';
import { useGame } from '../store/gameStore.jsx';
import { QUESTIONS } from '../data/questions.js';
import TeamScoreboard from './TeamScoreboard.jsx';

const roundInfo = {
  1: {
    label: 'ROUND 1',
    subtitle: 'GAMBLE ROUND',
    color: '#F5A623',
    icon: '🎯',
    questions: 8,
    rules: [
      'Min bet: 10 coins',
      'Double Down: 2x risk and reward (2 uses per team)',
      'Random Events trigger after every 2 questions',
    ]
  },
  2: {
    label: 'ROUND 2',
    subtitle: 'POWER ROUND',
    color: '#38bdf8',
    icon: '⚡',
    questions: 12,
    rules: [
      'Buy Power Cards before the round starts',
      'Use 1 Power Card per turn',
      'Credit Card loans available (max 50, 20% interest)',
      'Random Events trigger after every 2 questions',
    ]
  },
  3: {
    label: 'FINAL ROUND',
    subtitle: 'ALL IN',
    color: '#ef4444',
    icon: '🔥',
    questions: 10,
    rules: [
      'Min bet: 20 coins',
      'Double Down: 3 uses per team this round',
      'Reuse 1 Power Card from previous rounds',
      'Random Events trigger after every 2 questions',
    ]
  }
};

export default function RoundIntro() {
  const { state, dispatch } = useGame();
  const round = state.currentRound;
  const info = roundInfo[round];

  // Route to bidding (R2) or r3_reuse (R3) before betting; otherwise straight to betting.
  function handleBegin() {
    if (round === 2 && !state.biddingDone) {
      dispatch({ type: 'SET_PHASE', phase: 'bidding' });
    } else if (round === 3 && !state.r3ReuseDone) {
      dispatch({ type: 'SET_PHASE', phase: 'r3_reuse' });
    } else {
      dispatch({ type: 'SET_PHASE', phase: 'betting' });
    }
  }

  // Customise the button label for clarity
  let beginLabel = 'Begin Round →';
  if (round === 2 && !state.biddingDone) beginLabel = 'Continue to Credit Card & Bidding →';
  else if (round === 3 && !state.r3ReuseDone) beginLabel = 'Continue to Power Card Reuse →';

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f1a2e',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      gap: '24px',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '8px' }}>{info.icon}</div>
        <div style={{
          color: info.color,
          fontSize: '2.5rem',
          fontWeight: 900,
          letterSpacing: '3px',
          textTransform: 'uppercase',
        }}>{info.label}</div>
        <div style={{
          fontSize: '1.3rem',
          color: '#fff',
          fontWeight: 700,
          letterSpacing: '2px',
          marginTop: '4px',
        }}>{info.subtitle}</div>
        <div style={{ color: '#8899aa', marginTop: '8px' }}>
          {info.questions} Questions
        </div>
      </div>

      <div style={{
        background: '#162035',
        border: `2px solid ${info.color}`,
        borderRadius: '12px',
        padding: '20px 24px',
        width: '100%',
        maxWidth: '480px',
      }}>
        <h3 style={{ color: info.color, marginBottom: '14px', fontSize: '1rem' }}>Round Rules</h3>
        {info.rules.map((rule, i) => (
          <div key={i} style={{
            display: 'flex',
            gap: '10px',
            padding: '8px 0',
            borderBottom: i < info.rules.length - 1 ? '1px solid #1e3050' : 'none',
            fontSize: '0.92rem',
            color: '#d0dde8',
          }}>
            <span style={{ color: info.color, flexShrink: 0 }}>-</span>
            {rule}
          </div>
        ))}
      </div>

      <TeamScoreboard />

      <button className="btn-gold" onClick={handleBegin} style={{ fontSize: '1.1rem', padding: '14px 40px' }}>
        {beginLabel}
      </button>
    </div>
  );
}
