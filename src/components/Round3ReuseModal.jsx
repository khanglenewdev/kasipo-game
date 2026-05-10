import React from 'react';
import { useGame } from '../store/gameStore.jsx';
import { POWER_CARDS } from '../data/powerCards.js';
import { TEAM_COLORS } from '../data/teamColors.js';

const TEAM_BORDER = TEAM_COLORS;

export default function Round3ReuseModal() {
  const { state, dispatch } = useGame();
  const { teams, r3ReusedTeams } = state;

  function reuse(teamId, cardId) {
    if (r3ReusedTeams.includes(teamId)) return;
    dispatch({ type: 'R3_REUSE_CARD', teamId, cardId });
  }

  function done() {
    dispatch({ type: 'SET_R3_REUSE_DONE' });
  }

  const allDone = teams.every(t =>
    r3ReusedTeams.includes(t.id) || [...new Set(t.usedCards)].length === 0
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f1a2e',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      gap: '20px',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '8px' }}>🔥</div>
        <div style={{ color: '#ef4444', fontSize: '1.8rem', fontWeight: 900, letterSpacing: '2px' }}>
          FINAL ROUND PREP
        </div>
        <div style={{ color: '#fff', fontSize: '1rem', marginTop: '4px' }}>
          Each team may revive ONE used Power Card
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
        width: '100%',
        maxWidth: '720px',
      }}>
        {teams.map((team, tIdx) => {
          const uniqUsed = [...new Set(team.usedCards)];
          const hasReused = r3ReusedTeams.includes(team.id);
          return (
            <div key={team.id} style={{
              background: '#162035',
              border: `2px solid ${TEAM_BORDER[tIdx % 4]}`,
              borderRadius: '10px',
              padding: '14px',
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px',
              }}>
                <span style={{ color: TEAM_BORDER[tIdx % 4], fontWeight: 700 }}>{team.name}</span>
                {hasReused && (
                  <span style={{ color: '#43a047', fontSize: '0.78rem' }}>✓ revived</span>
                )}
              </div>

              <div style={{ color: '#8899aa', fontSize: '0.78rem', marginBottom: '8px' }}>
                Current cards: {team.powerCards.length} · Used: {team.usedCards.length}
              </div>

              {hasReused ? (
                <div style={{ color: '#43a047', fontSize: '0.85rem', fontStyle: 'italic' }}>
                  Card revived. Ready for the final round.
                </div>
              ) : uniqUsed.length === 0 ? (
                <div style={{ color: '#5a6a7a', fontSize: '0.85rem', fontStyle: 'italic' }}>
                  No used cards available.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {uniqUsed.map(cid => {
                    const c = POWER_CARDS.find(p => p.id === cid);
                    if (!c) return null;
                    return (
                      <button
                        key={cid}
                        onClick={() => reuse(team.id, cid)}
                        style={{
                          background: '#1a3a45',
                          border: '1px solid #38bdf8',
                          color: '#38bdf8',
                          borderRadius: '6px',
                          padding: '6px 10px',
                          fontSize: '0.82rem',
                          textAlign: 'left',
                          cursor: 'pointer',
                          fontWeight: 600,
                        }}
                      >
                        Revive {c.emoji} {c.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ color: '#8899aa', fontSize: '0.82rem', textAlign: 'center', maxWidth: '500px' }}>
        Teams without revivable used cards may skip. Click Continue when all teams have decided.
      </div>

      <button
        className="btn-gold"
        onClick={done}
        style={{ fontSize: '1.05rem', padding: '12px 32px' }}
      >
        {allDone ? 'Continue to Final Round →' : 'Skip remaining & Continue →'}
      </button>
    </div>
  );
}
