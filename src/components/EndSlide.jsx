import React, { useEffect, useRef, useState } from 'react';
import { useGame } from '../store/gameStore.jsx';
import { TEAM_COLORS } from '../data/teamColors.js';

export default function EndSlide() {
  const { state, dispatch } = useGame();
  const { teams } = state;
  const settled = useRef(false);

  // Snapshot loans BEFORE END_ROUND wipes them so we can render a settlement panel.
  const [loanSnapshot, setLoanSnapshot] = useState(null);
  // Snapshot pre-settlement coins so the panel can show pre/post numbers.
  const [preSettleCoins, setPreSettleCoins] = useState(null);

  useEffect(() => {
    if (settled.current) return;
    settled.current = true;
    const snapshot = teams.map(t => ({
      id: t.id,
      name: t.name,
      loan: t.loan,
      interest: Math.round(t.loan * 1.2),
      preCoins: t.coins,
    }));
    setLoanSnapshot(snapshot);
    setPreSettleCoins(teams.map(t => t.coins));
    if (teams.some(t => t.loan > 0)) {
      dispatch({ type: 'END_ROUND' });
    }
  }, []);

  const sorted = [...teams].sort((a, b) => b.coins - a.coins);
  const winner = sorted[0];
  const medals = ['🥇', '🥈', '🥉', '4️⃣'];
  const winnerColor = TEAM_COLORS[winner.id % 4];

  // Detect tie at the top
  const tied = sorted.filter(t => t.coins === winner.coins);
  const isTie = tied.length > 1;

  function handleRestart() {
    window.location.reload();
  }

  const anyLoans = loanSnapshot && loanSnapshot.some(s => s.loan > 0);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f1a2e',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Confetti / sparkle layer */}
      <div aria-hidden="true" style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}>
        {Array.from({ length: 20 }).map((_, i) => (
          <span
            key={i}
            style={{
              position: 'absolute',
              left: `${(i * 53) % 100}%`,
              top: `-${(i % 4) * 10}px`,
              fontSize: `${1.2 + (i % 3) * 0.6}rem`,
              animation: `confetti-fall ${4 + (i % 5)}s linear ${i * 0.25}s infinite`,
            }}
          >
            {['🎉','✨','⭐','🎊','💰'][i % 5]}
          </span>
        ))}
      </div>

      {/* Winner banner */}
      <div className="winner-pop" style={{
        background: `radial-gradient(circle at center, ${winnerColor}33 0%, transparent 70%)`,
        textAlign: 'center',
        marginBottom: '14px',
        padding: '20px 24px',
        zIndex: 1,
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '4px' }}>🏆</div>
        <div style={{
          fontSize: '0.95rem',
          letterSpacing: '6px',
          color: '#FFD46B',
          fontWeight: 700,
          marginBottom: '4px',
        }}>
          {isTie ? 'TIE!' : 'CHAMPION'}
        </div>
        <h1 style={{
          fontSize: '3.2rem',
          fontWeight: 900,
          color: winnerColor,
          letterSpacing: '2px',
          textTransform: 'uppercase',
          textShadow: `0 0 24px ${winnerColor}aa, 0 0 4px rgba(0,0,0,0.5)`,
          lineHeight: '1',
          marginBottom: '6px',
        }}>
          {isTie ? tied.map(t => t.name).join(' & ') : winner.name}
        </h1>
        <div style={{
          fontSize: '1.6rem',
          color: '#FFD46B',
          fontWeight: 800,
          textShadow: '0 0 12px rgba(255,212,107,0.5)',
        }}>
          💰 {winner.coins} coins
        </div>
      </div>
      <div style={{ color: '#8899aa', fontSize: '0.85rem', marginBottom: '24px', zIndex: 1 }}>
        {anyLoans ? 'Credit card loans repaid at 20% interest below.' : 'No outstanding loans to settle.'}
      </div>

      {/* Loan repayment panel */}
      {anyLoans && (
        <div style={{
          background: '#162035',
          border: '2px solid #e53935',
          borderRadius: '14px',
          padding: '20px',
          width: '100%',
          maxWidth: '520px',
          marginBottom: '20px',
        }}>
          <h2 style={{ color: '#e53935', textAlign: 'center', marginBottom: '14px', fontSize: '1.05rem', letterSpacing: '1px' }}>
            💳 LOAN SETTLEMENT (20% INTEREST)
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {loanSnapshot.filter(s => s.loan > 0).map(s => {
              const tIdx = s.id;
              const teamColor = TEAM_COLORS[tIdx % 4];
              const team = teams.find(t => t.id === s.id);
              const postCoins = team ? team.coins : Math.max(0, s.preCoins - s.interest);
              return (
                <div key={s.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: '#0f1a2e',
                  border: `1px solid ${teamColor}`,
                  borderRadius: '8px',
                  padding: '10px 14px',
                }}>
                  <div>
                    <div style={{ color: teamColor, fontWeight: 700, fontSize: '0.95rem' }}>
                      {s.name}
                    </div>
                    <div style={{ color: '#8899aa', fontSize: '0.75rem' }}>
                      Borrowed {s.loan} → Repay {s.interest} (interest: +{s.interest - s.loan})
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#d0dde8', fontSize: '0.78rem' }}>
                      {s.preCoins} → <span style={{ color: '#FFD46B', fontWeight: 800 }}>{postCoins}</span>
                    </div>
                    <div style={{ color: '#e53935', fontSize: '0.82rem', fontWeight: 700 }}>
                      −{s.interest}
                    </div>
                  </div>
                </div>
              );
            })}
            {loanSnapshot.filter(s => s.loan === 0).length > 0 && (
              <div style={{ color: '#5a6a7a', fontSize: '0.78rem', fontStyle: 'italic', textAlign: 'center', marginTop: '6px' }}>
                {loanSnapshot.filter(s => s.loan === 0).map(s => s.name).join(', ')} took no loan.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Final standings */}
      <div style={{
        background: '#162035',
        border: '2px solid #F5A623',
        borderRadius: '14px',
        padding: '24px',
        width: '100%',
        maxWidth: '520px',
        marginBottom: '24px',
      }}>
        <h2 style={{ color: '#F5A623', textAlign: 'center', marginBottom: '16px', fontSize: '1.1rem' }}>
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
                <div style={{ fontWeight: 700, color: idx === 0 ? '#F5A623' : TEAM_COLORS[team.id % 4] }}>
                  {team.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#8899aa' }}>
                  {team.powerCards.length} cards remaining
                </div>
              </div>
            </div>
            <div style={{
              fontSize: '1.5rem',
              fontWeight: 900,
              color: '#FFD46B',
              textShadow: '0 0 10px rgba(255,212,107,0.4)',
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
        maxWidth: '520px',
        marginBottom: '24px',
        textAlign: 'center',
      }}>
        <p style={{ color: '#38bdf8', fontSize: '0.88rem', fontStyle: 'italic', lineHeight: '1.5' }}>
          "Technology handles operations but human empathy creates memorable experiences."
        </p>
        <p style={{ color: '#4a5a6a', fontSize: '0.78rem', marginTop: '8px' }}>
          — KaSiPo Front Office Management Quiz
        </p>
      </div>

      <button className="btn-gold" onClick={handleRestart} style={{ fontSize: '1.1rem', padding: '14px 40px' }}>
        Play Again →
      </button>
    </div>
  );
}
