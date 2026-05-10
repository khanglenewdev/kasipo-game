import React, { useState } from 'react';
import { useGame } from '../store/gameStore.jsx';
import { QUESTIONS } from '../data/questions.js';

export default function BettingModal() {
  const { state, dispatch } = useGame();
  const { teams, currentRound, currentQuestionIndex, doubleDownUsed } = state;
  const q = QUESTIONS[currentQuestionIndex];
  const minBet = currentRound === 3 ? 20 : 10;

  const [localBets, setLocalBets] = useState(teams.map(t => Math.max(minBet, Math.min(t.bet, t.coins))));
  const [localDD, setLocalDD] = useState(teams.map(t => false));

  function handleBetChange(teamIdx, val) {
    const raw = parseInt(val) || minBet;
    const clamped = Math.max(minBet, Math.min(raw, teams[teamIdx].coins));
    setLocalBets(prev => { const n = [...prev]; n[teamIdx] = clamped; return n; });
  }

  function canDoubleDown(teamIdx) {
    const maxDD = currentRound === 3 ? 3 : 2;
    const ddArr = doubleDownUsed[teamIdx] || [];
    const used = ddArr.filter(Boolean).length;
    return used < maxDD;
  }

  function toggleDD(teamIdx) {
    if (!canDoubleDown(teamIdx) && !localDD[teamIdx]) return;
    setLocalDD(prev => { const n = [...prev]; n[teamIdx] = !n[teamIdx]; return n; });
  }

  function handleLock() {
    teams.forEach((team, idx) => {
      dispatch({ type: 'SET_BET', teamId: team.id, bet: localBets[idx] });
      if (localDD[idx]) {
        dispatch({ type: 'TOGGLE_DOUBLE_DOWN', teamId: team.id });
      }
    });
    dispatch({ type: 'GO_TO_QUESTION' });
  }

  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ maxWidth: '620px' }}>
        <div className="modal-title">
          💰 Place Your Bets
        </div>
        <div style={{ textAlign: 'center', color: '#8899aa', marginBottom: '20px', fontSize: '0.9rem' }}>
          {q.roundLabel} - Question {q.num}/{q.total}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          {teams.map((team, idx) => {
            const effectiveBet = localDD[idx] ? localBets[idx] * 2 : localBets[idx];
            const ddAvailable = canDoubleDown(idx);
            return (
              <div key={team.id} style={{
                background: '#1a2a45',
                border: '2px solid #F5A623',
                borderRadius: '10px',
                padding: '14px',
              }}>
                <div style={{ fontWeight: 700, color: '#F5A623', marginBottom: '8px', fontSize: '0.95rem' }}>
                  {team.name}
                </div>
                <div style={{ color: '#8899aa', fontSize: '0.8rem', marginBottom: '10px' }}>
                  Coins: {team.coins}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <button
                    onClick={() => handleBetChange(idx, localBets[idx] - 10)}
                    style={{
                      background: '#0f1a2e', border: '1px solid #F5A623', color: '#F5A623',
                      width: '28px', height: '28px', borderRadius: '4px', fontSize: '1rem', cursor: 'pointer',
                    }}>-</button>
                  <input
                    type="number"
                    value={localBets[idx]}
                    min={minBet}
                    max={team.coins}
                    onChange={e => handleBetChange(idx, e.target.value)}
                    style={{
                      width: '64px', textAlign: 'center', background: '#0f1a2e',
                      border: '1px solid #38bdf8', borderRadius: '4px', color: '#fff',
                      padding: '4px', fontSize: '0.95rem',
                    }}
                  />
                  <button
                    onClick={() => handleBetChange(idx, localBets[idx] + 10)}
                    style={{
                      background: '#0f1a2e', border: '1px solid #F5A623', color: '#F5A623',
                      width: '28px', height: '28px', borderRadius: '4px', fontSize: '1rem', cursor: 'pointer',
                    }}>+</button>
                </div>
                <button
                  onClick={() => toggleDD(idx)}
                  disabled={!ddAvailable && !localDD[idx]}
                  style={{
                    width: '100%',
                    background: localDD[idx] ? '#7c4d00' : (ddAvailable ? '#1a3a45' : '#111'),
                    border: `1px solid ${localDD[idx] ? '#F5A623' : '#2196a8'}`,
                    color: localDD[idx] ? '#F5A623' : (ddAvailable ? '#38bdf8' : '#444'),
                    borderRadius: '6px',
                    padding: '6px',
                    fontSize: '0.8rem',
                    cursor: ddAvailable || localDD[idx] ? 'pointer' : 'not-allowed',
                  }}>
                  {localDD[idx] ? `⚡ DOUBLE DOWN: ${effectiveBet}` : (ddAvailable ? '⚡ Double Down?' : 'DD used up')}
                </button>
              </div>
            );
          })}
        </div>
        <div style={{ textAlign: 'center' }}>
          <button className="btn-gold" onClick={handleLock} style={{ fontSize: '1.1rem', padding: '12px 36px' }}>
            Lock Bets & Show Question →
          </button>
        </div>
      </div>
    </div>
  );
}
