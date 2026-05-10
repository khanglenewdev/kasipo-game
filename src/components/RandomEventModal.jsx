import React, { useState, useEffect } from 'react';
import { useGame } from '../store/gameStore.jsx';
import { RANDOM_EVENTS } from '../data/randomEvents.js';

export default function RandomEventModal() {
  const { state, dispatch } = useGame();
  const [spinning, setSpinning] = useState(true);
  const [event, setEvent] = useState(null);
  const [spinIndex, setSpinIndex] = useState(0);

  useEffect(() => {
    let count = 0;
    const total = 20;
    const interval = setInterval(() => {
      setSpinIndex(Math.floor(Math.random() * RANDOM_EVENTS.length));
      count++;
      if (count >= total) {
        clearInterval(interval);
        const picked = RANDOM_EVENTS[Math.floor(Math.random() * RANDOM_EVENTS.length)];
        setEvent(picked);
        setSpinning(false);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  function handleApply() {
    if (event) {
      dispatch({ type: 'APPLY_RANDOM_EVENT', event });
      dispatch({ type: 'CLEAR_EVENT' });
    }
  }

  const displayEvent = spinning ? RANDOM_EVENTS[spinIndex] : event;

  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ textAlign: 'center', maxWidth: '500px' }}>
        <div style={{ color: '#F5A623', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '2px', marginBottom: '16px' }}>
          RANDOM EVENT
        </div>

        <div style={{
          fontSize: '4rem',
          marginBottom: '16px',
          animation: spinning ? 'spin 0.5s linear infinite' : 'none',
          display: 'inline-block',
        }}>
          {displayEvent ? displayEvent.emoji : '🎲'}
        </div>

        {spinning ? (
          <div style={{ color: '#8899aa', fontSize: '1.1rem', marginBottom: '24px' }}>
            Spinning...
          </div>
        ) : event ? (
          <div className="fade-in">
            <h2 style={{ color: '#F5A623', fontSize: '1.5rem', marginBottom: '12px' }}>
              {event.name}
            </h2>
            <p style={{ color: '#d0dde8', fontSize: '1rem', marginBottom: '20px', lineHeight: '1.5' }}>
              {event.desc}
            </p>
            <div style={{
              background: '#1a2a45',
              border: '1px solid #38bdf8',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '24px',
            }}>
              <PreviewEffect event={event} />
            </div>
            <button className="btn-gold" onClick={handleApply} style={{ fontSize: '1.1rem', padding: '12px 36px' }}>
              Apply Effect →
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function PreviewEffect({ event }) {
  const { state } = useGame();
  const { teams } = state;

  if (event.effect === 'highest_loses_10_others_gain_10') {
    const maxCoins = Math.max(...teams.map(t => t.coins));
    return (
      <div style={{ fontSize: '0.85rem', color: '#d0dde8' }}>
        {teams.map(t => (
          <div key={t.id} style={{ padding: '2px 0', color: t.coins === maxCoins ? '#e53935' : '#43a047' }}>
            {t.name}: {t.coins === maxCoins ? '-10' : '+10'} coins
          </div>
        ))}
      </div>
    );
  }
  if (event.effect === 'random_team_minus_10') {
    return <div style={{ fontSize: '0.85rem', color: '#e53935' }}>One random team will lose 10 coins</div>;
  }
  if (event.effect === 'lowest_plus_15') {
    const minCoins = Math.min(...teams.map(t => t.coins));
    return (
      <div style={{ fontSize: '0.85rem', color: '#d0dde8' }}>
        {teams.map(t => (
          <div key={t.id} style={{ color: t.coins === minCoins ? '#43a047' : '#8899aa' }}>
            {t.name}: {t.coins === minCoins ? '+15 coins (lowest!)' : `${t.coins} coins`}
          </div>
        ))}
      </div>
    );
  }
  return <div style={{ fontSize: '0.85rem', color: '#38bdf8' }}>Effect applies to upcoming questions this round</div>;
}
