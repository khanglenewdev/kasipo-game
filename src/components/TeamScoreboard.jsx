import React from 'react';
import { useGame } from '../store/gameStore.jsx';

export default function TeamScoreboard({ showBets = false }) {
  const { state } = useGame();
  const { teams } = state;

  const cardStyle = (idx) => ({
    background: '#1a2a45',
    border: '2px solid #F5A623',
    borderRadius: '10px',
    padding: '12px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    minWidth: 0,
  });

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '10px',
      width: '100%',
      maxWidth: '640px',
      margin: '0 auto',
    }}>
      {teams.map((team, idx) => (
        <div key={team.id} style={cardStyle(idx)}>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#F5A623', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {team.name}
          </div>
          <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>
            💰 {team.coins} coins
          </div>
          {showBets && (
            <div style={{ fontSize: '0.8rem', color: '#8899aa' }}>
              Bet: {team.doubleDown ? team.bet * 2 : team.bet} {team.doubleDown ? '(2x!)' : ''}
            </div>
          )}
          {team.loan > 0 && (
            <div style={{ fontSize: '0.75rem', color: '#e53935' }}>
              Loan: {team.loan}
            </div>
          )}
          {team.powerCards.length > 0 && (
            <div style={{ fontSize: '0.78rem', color: '#38bdf8', marginTop: '2px' }}>
              {team.powerCards.length} card{team.powerCards.length > 1 ? 's' : ''}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
