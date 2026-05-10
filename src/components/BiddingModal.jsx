import React, { useState } from 'react';
import { useGame } from '../store/gameStore.jsx';
import { POWER_CARDS } from '../data/powerCards.js';

export default function BiddingModal() {
  const { state, dispatch } = useGame();
  const { teams } = state;
  const [step, setStep] = useState('loan'); // 'loan' | 'cards'
  const [loans, setLoans] = useState([0, 0, 0, 0]);

  function handleLoanChange(idx, val) {
    const n = Math.max(0, Math.min(50, parseInt(val) || 0));
    setLoans(prev => { const next = [...prev]; next[idx] = n; return next; });
  }

  function applyLoans() {
    loans.forEach((amount, idx) => {
      if (amount > 0) {
        dispatch({ type: 'TAKE_LOAN', teamId: idx, amount });
      }
    });
    setStep('cards');
  }

  function buyCard(teamId, card) {
    dispatch({ type: 'BUY_POWER_CARD', teamId, cardId: card.id, price: card.price });
  }

  function canBuy(team, card) {
    return team.coins >= card.price && team.powerCards.length < 3 && !team.powerCards.includes(card.id);
  }

  function handleDone() {
    dispatch({ type: 'SET_BIDDING_DONE' });
  }

  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ maxWidth: '720px' }}>
        {step === 'loan' ? (
          <>
            <div className="modal-title">💳 Credit Card - Round 2</div>
            <p style={{ textAlign: 'center', color: '#8899aa', marginBottom: '20px', fontSize: '0.88rem' }}>
              Borrow up to 50 coins each. Repaid at 20% interest at end of round.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
              {teams.map((team, idx) => (
                <div key={team.id} style={{
                  background: '#1a2a45', border: '2px solid #F5A623', borderRadius: '10px', padding: '14px'
                }}>
                  <div style={{ fontWeight: 700, color: '#F5A623', marginBottom: '8px' }}>{team.name}</div>
                  <div style={{ color: '#8899aa', fontSize: '0.8rem', marginBottom: '10px' }}>Coins: {team.coins}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#d0dde8', fontSize: '0.85rem' }}>Loan:</span>
                    <input
                      type="number"
                      value={loans[idx]}
                      min={0}
                      max={50}
                      onChange={e => handleLoanChange(idx, e.target.value)}
                      style={{
                        width: '60px', textAlign: 'center', background: '#0f1a2e',
                        border: '1px solid #38bdf8', borderRadius: '4px', color: '#fff', padding: '4px',
                      }}
                    />
                    <span style={{ color: '#e53935', fontSize: '0.75rem' }}>
                      {loans[idx] > 0 ? `Repay: ${Math.round(loans[idx] * 1.2)}` : ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center' }}>
              <button className="btn-gold" onClick={applyLoans}>Next: Buy Power Cards →</button>
            </div>
          </>
        ) : (
          <>
            <div className="modal-title">🃏 Power Card Shop</div>
            <p style={{ textAlign: 'center', color: '#8899aa', marginBottom: '16px', fontSize: '0.88rem' }}>
              Each team can own up to 3 cards. Use 1 per question.
            </p>
            <div style={{ marginBottom: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {teams.map(team => (
                <div key={team.id} style={{
                  background: '#1a2a45', border: '1px solid #F5A623', borderRadius: '8px', padding: '10px'
                }}>
                  <div style={{ fontWeight: 700, color: '#F5A623', fontSize: '0.9rem' }}>
                    {team.name} - {team.coins} coins
                  </div>
                  <div style={{ color: '#38bdf8', fontSize: '0.78rem' }}>
                    Cards: {team.powerCards.length}/3
                    {team.powerCards.length > 0 ? ` (${team.powerCards.join(', ')})` : ''}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
              {POWER_CARDS.map(card => (
                <div key={card.id} style={{
                  background: '#0f1620', border: '1px solid #2196a8', borderRadius: '8px', padding: '12px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>
                      {card.emoji} {card.name}
                    </span>
                    <span style={{ color: '#F5A623', fontWeight: 700, fontSize: '0.9rem' }}>{card.price} 💰</span>
                  </div>
                  <div style={{ color: '#8899aa', fontSize: '0.78rem', marginBottom: '10px' }}>{card.desc}</div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {teams.map(team => {
                      const able = canBuy(team, card);
                      const owns = team.powerCards.includes(card.id);
                      return (
                        <button
                          key={team.id}
                          disabled={!able}
                          onClick={() => buyCard(team.id, card)}
                          style={{
                            background: owns ? '#1a4020' : (able ? '#1a3a45' : '#111'),
                            border: `1px solid ${owns ? '#43a047' : (able ? '#2196a8' : '#333')}`,
                            color: owns ? '#43a047' : (able ? '#38bdf8' : '#444'),
                            borderRadius: '4px',
                            padding: '4px 8px',
                            fontSize: '0.75rem',
                            cursor: able ? 'pointer' : 'not-allowed',
                          }}
                        >
                          {owns ? '✓ Owned' : `T${team.id + 1}`}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center' }}>
              <button className="btn-gold" onClick={handleDone}>Done - Start Round 2 →</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
