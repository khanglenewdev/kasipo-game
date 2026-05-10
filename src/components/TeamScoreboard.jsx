import React, { useEffect, useRef, useState } from 'react';
import { useGame } from '../store/gameStore.jsx';
import { POWER_CARDS } from '../data/powerCards.js';
import { TEAM_COLORS, WRONG_BORDER, WRONG_BG } from '../data/teamColors.js';

const TEAM_BORDER = TEAM_COLORS;

function CoinDelta({ teamId, coins }) {
  const prev = useRef(coins);
  const [delta, setDelta] = useState(null);

  useEffect(() => {
    const diff = coins - prev.current;
    prev.current = coins;
    if (diff === 0) return;
    const id = `${Date.now()}-${Math.random()}`;
    setDelta({ id, value: diff });
    const t = setTimeout(() => {
      setDelta(d => (d && d.id === id ? null : d));
    }, 5000);
    return () => clearTimeout(t);
  }, [coins]);

  if (!delta) return null;
  const positive = delta.value > 0;
  return (
    <span
      key={delta.id}
      className="coin-delta"
      style={{
        color: positive ? '#43a047' : '#e53935',
        textShadow: positive ? '0 0 8px rgba(67,160,71,0.6)' : '0 0 8px rgba(229,57,53,0.6)',
      }}
    >
      {positive ? `+${delta.value}` : `${delta.value}`}
    </span>
  );
}

function cardById(id) {
  return POWER_CARDS.find(c => c.id === id);
}

export default function TeamScoreboard({ showBets = false, compact = false }) {
  const { state } = useGame();
  const { teams, stolenTurns, loyaltyLink, pendingInsurance, pendingSecondChance, teamResults } = state;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '10px',
      width: '100%',
      maxWidth: '640px',
      margin: '0 auto',
    }}>
      {teams.map((team, idx) => {
        const stolen = stolenTurns.find(s => s.targetTeamId === team.id);
        const stealing = stolenTurns.find(s => s.byTeamId === team.id);
        const linkedLoyalty = loyaltyLink && (loyaltyLink.fromTeamId === team.id || loyaltyLink.partnerTeamId === team.id);
        const armedInsurance = pendingInsurance.includes(team.id);
        const armedSecondChance = pendingSecondChance.includes(team.id);
        const result = teamResults?.[team.id];
        const isWrong = result === 'wrong';
        const isCorrect = result === 'correct' || result === 'correct_retry';
        const isPending = result === 'pending_retry';
        return (
          <div
            key={team.id}
            style={{
              background: isWrong ? WRONG_BG : '#1a2a45',
              border: `2px solid ${isWrong ? WRONG_BORDER : TEAM_BORDER[idx % 4]}`,
              borderRadius: '10px',
              padding: compact ? '8px 10px' : '12px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              minWidth: 0,
              position: 'relative',
              overflow: 'visible',
              transition: 'background 0.3s, border-color 0.3s',
              boxShadow: isWrong ? '0 0 0 1px rgba(229,57,53,0.5)' : 'none',
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '6px',
              position: 'relative',
            }}>
              <span style={{
                fontWeight: 700,
                fontSize: compact ? '0.82rem' : '0.9rem',
                color: isWrong ? WRONG_BORDER : TEAM_BORDER[idx % 4],
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {team.name}
                {isWrong && <span style={{ marginLeft: '6px', fontSize: '0.72rem' }}>❌ WRONG</span>}
                {isCorrect && <span style={{ marginLeft: '6px', fontSize: '0.72rem', color: '#43a047' }}>✓ RIGHT</span>}
                {isPending && <span style={{ marginLeft: '6px', fontSize: '0.72rem', color: '#F5A623' }}>⏳ retry</span>}
              </span>
              <CoinDelta teamId={team.id} coins={team.coins} />
            </div>

            <div style={{
              fontSize: compact ? '1.15rem' : '1.4rem',
              fontWeight: 900,
              color: '#FFD46B',
              textShadow: '0 0 10px rgba(255,212,107,0.45), 0 0 2px rgba(0,0,0,0.6)',
              letterSpacing: '0.5px',
            }}>
              💰 {team.coins}<span style={{ fontSize: '0.7em', color: '#d0dde8', marginLeft: '4px', fontWeight: 700 }}>coins</span>
            </div>

            {showBets && (
              <div style={{ fontSize: '0.8rem', color: '#8899aa' }}>
                Bet: {team.doubleDown ? team.bet * 2 : team.bet} {team.doubleDown ? '(2x!)' : ''}
              </div>
            )}

            {team.loan > 0 && (
              <div style={{ fontSize: '0.75rem', color: '#e53935' }}>
                Loan: {team.loan} (repay {Math.round(team.loan * 1.2)})
              </div>
            )}

            {team.powerCards.length > 0 && (
              <div style={{
                display: 'flex',
                gap: '4px',
                flexWrap: 'wrap',
                marginTop: '4px',
              }}>
                {team.powerCards.map((cid, i) => {
                  const c = cardById(cid);
                  if (!c) return null;
                  return (
                    <span
                      key={i}
                      title={c.name}
                      style={{
                        background: '#0f1a2e',
                        border: '1px solid #38bdf8',
                        borderRadius: '4px',
                        padding: '2px 6px',
                        fontSize: '0.72rem',
                        color: '#38bdf8',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {c.emoji} {c.name}
                    </span>
                  );
                })}
              </div>
            )}

            {/* Status flags */}
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '2px' }}>
              {stolen && (
                <span style={{
                  background: '#5a1010',
                  border: '1px solid #e53935',
                  color: '#e53935',
                  fontSize: '0.7rem',
                  padding: '1px 5px',
                  borderRadius: '3px',
                  fontWeight: 700,
                }}>🔴 TURN STOLEN by T{stolen.byTeamId + 1}</span>
              )}
              {stealing && !stolen && (
                <span style={{
                  background: '#3a1a1a',
                  border: '1px solid #e53935',
                  color: '#ff8a80',
                  fontSize: '0.7rem',
                  padding: '1px 5px',
                  borderRadius: '3px',
                }}>🔴 stealing T{stealing.targetTeamId + 1}</span>
              )}
              {linkedLoyalty && (
                <span style={{
                  background: '#1a3a45',
                  border: '1px solid #2196a8',
                  color: '#38bdf8',
                  fontSize: '0.7rem',
                  padding: '1px 5px',
                  borderRadius: '3px',
                }}>🤝 linked</span>
              )}
              {armedInsurance && (
                <span style={{
                  background: '#1a4020',
                  border: '1px solid #43a047',
                  color: '#43a047',
                  fontSize: '0.7rem',
                  padding: '1px 5px',
                  borderRadius: '3px',
                  fontWeight: 700,
                }}>🟢 INSURED</span>
              )}
              {armedSecondChance && (
                <span style={{
                  background: '#3a2a0a',
                  border: '1px solid #F5A623',
                  color: '#F5A623',
                  fontSize: '0.7rem',
                  padding: '1px 5px',
                  borderRadius: '3px',
                  fontWeight: 700,
                }}>🛎 2nd chance</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
