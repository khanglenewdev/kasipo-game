import React from 'react';
import { useGame } from '../store/gameStore.jsx';

export default function EndSlide() {
  const { state, dispatch } = useGame();
  const { teams } = state;

  const sorted = [...teams].sort((a, b) => b.coins - a.coins);
  const winner = sorted[0];

  const medals = ['🥇', '🥈', '🥉', '4️⃣'];

  function handleRestart() {
    window.location.reload();
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
      <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🏆</div>
      <h1 style={{
        fontSize: '2.5rem',
        fontWeight: 900,
        color: '#F5A623',
        letterSpacing: '3px',
        textTransform: 'uppercase',
        marginBottom: '8px',
        textAlign: 'center',
      }}>
        Game Over!
      </h1>
      <div style={{ color: '#d0dde8', marginBottom: '8px', fontSize: '1.1rem' }}>
        Winner: <strong style={{ color: '#F5A623' }}>{winner.name}</strong> with {winner.coins} coins!
      </div>
      <div style={{ color: '#8899aa', fontSize: '0.88rem', marginBottom: '32px' }}>
        Credit card loans have been repaid with 20% interest.
      </div>

      <div style={{
        background: '#162035',
        border: '2px solid #F5A623',
        borderRadius: '14px',
        padding: '24px',
        width: '100%',
        maxWidth: '480px',
        marginBottom: '32px',
      }}>
        <h2 style={{ color: '#F5A623', textAlign: 'center', marginBottom: '20px', fontSize: '1.1rem' }}>
          Final Standings
        </h2>
        {sorted.map((team, idx) => (
          <div key={team.id} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 16px',
            background: idx === 0 ? '#2a2000' : '#1a2a45',
            border: `1px solid ${idx === 0 ? '#F5A623' : '#2a3a55'}`,
            borderRadius: '8px',
            marginBottom: '8px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '1.5rem' }}>{medals[idx]}</span>
              <div>
                <div style={{ fontWeight: 700, color: idx === 0 ? '#F5A623' : '#fff' }}>
                  {team.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#8899aa' }}>
                  {team.powerCards.length} cards remaining
                </div>
              </div>
            </div>
            <div style={{
              fontSize: '1.3rem',
              fontWeight: 900,
              color: idx === 0 ? '#F5A623' : '#d0dde8',
            }}>
              💰 {team.coins}
            </div>
          </div>
        ))}
      </div>

      <div style={{
        background: '#0a1525',
        border: '1px solid #38bdf8',
        borderRadius: '10px',
        padding: '16px 24px',
        width: '100%',
        maxWidth: '480px',
        marginBottom: '28px',
        textAlign: 'center',
      }}>
        <p style={{ color: '#38bdf8', fontSize: '0.88rem', fontStyle: 'italic', lineHeight: '1.5' }}>
          "Technology handles operations but human empathy creates memorable experiences."
        </p>
        <p style={{ color: '#4a5a6a', fontSize: '0.78rem', marginTop: '8px' }}>
          - KaSiPo Hotel Management Quiz
        </p>
      </div>

      <button className="btn-gold" onClick={handleRestart} style={{ fontSize: '1.1rem', padding: '14px 40px' }}>
        Play Again →
      </button>
    </div>
  );
}
