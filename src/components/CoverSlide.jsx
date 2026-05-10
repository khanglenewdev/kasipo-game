import React, { useState } from 'react';
import { useGame } from '../store/gameStore.jsx';

export default function CoverSlide() {
  const { state, dispatch } = useGame();
  const { teams } = state;
  const [names, setNames] = useState(teams.map(t => t.name));

  function handleName(idx, val) {
    const next = [...names];
    next[idx] = val;
    setNames(next);
  }

  function handleStart() {
    names.forEach((name, idx) => {
      if (name.trim()) {
        dispatch({ type: 'SET_TEAM_NAME', teamId: idx, name: name.trim() });
      }
    });
    dispatch({ type: 'SET_PHASE', phase: 'rules1' });
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
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '8px' }}>🏨</div>
        <h1 style={{
          fontSize: '3rem',
          fontWeight: 900,
          color: '#F5A623',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          marginBottom: '8px',
        }}>KaSiPo</h1>
        <p style={{ fontSize: '1.1rem', color: '#8899aa', marginBottom: '4px' }}>
          Front Office Management Quiz Game
        </p>
        <p style={{ fontSize: '0.9rem', color: '#38bdf8' }}>
          Power Cards - Random Events - Coin Betting
        </p>
      </div>

      <div style={{
        background: '#162035',
        border: '2px solid #F5A623',
        borderRadius: '14px',
        padding: '28px',
        width: '100%',
        maxWidth: '480px',
        marginBottom: '28px',
      }}>
        <h2 style={{ color: '#F5A623', marginBottom: '20px', textAlign: 'center', fontSize: '1.1rem' }}>
          Enter Team Names
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {names.map((name, idx) => (
            <div key={idx}>
              <label style={{ fontSize: '0.8rem', color: '#8899aa', display: 'block', marginBottom: '4px' }}>
                Team {idx + 1}
              </label>
              <input
                value={name}
                onChange={e => handleName(idx, e.target.value)}
                placeholder={`Team ${idx + 1}`}
                style={{
                  width: '100%',
                  background: '#1a2a45',
                  border: '1px solid #F5A623',
                  borderRadius: '6px',
                  color: '#fff',
                  padding: '8px 10px',
                  fontSize: '0.95rem',
                  outline: 'none',
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <button className="btn-gold" onClick={handleStart} style={{ fontSize: '1.1rem', padding: '14px 40px' }}>
        Start Game →
      </button>

      <div style={{ marginTop: '24px', color: '#4a5a6a', fontSize: '0.8rem', textAlign: 'center' }}>
        30 Questions - 3 Rounds - 8 Power Cards - 7 Random Events
      </div>
    </div>
  );
}
