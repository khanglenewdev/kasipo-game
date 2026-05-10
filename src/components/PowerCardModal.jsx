import React, { useState } from 'react';
import { useGame } from '../store/gameStore.jsx';
import { POWER_CARDS } from '../data/powerCards.js';

export default function PowerCardModal({ onClose }) {
  const { state, dispatch } = useGame();
  const { teams, currentRound } = state;
  const [selectedTeam, setSelectedTeam] = useState(0);
  const [result, setResult] = useState(null);

  const team = teams[selectedTeam];
  const ownedCards = POWER_CARDS.filter(c => team.powerCards.includes(c.id));

  function useCard(card) {
    if (card.effect === 'gacha') {
      const win = Math.random() > 0.5;
      const delta = win ? 50 : -50;
      dispatch({ type: 'USE_POWER_CARD', teamId: selectedTeam, cardId: card.id });
      dispatch({ type: '_ADJUST_COINS', teamId: selectedTeam, delta });
      setResult(`${win ? 'WIN!' : 'CRASH!'} ${team.name} ${win ? 'gains' : 'loses'} 50 coins! (${win ? '+50' : '-50'})`);
      return;
    }
    if (card.effect === 'russian_roulette') {
      let chambers = 0;
      let survived = true;
      for (let i = 0; i < 6; i++) {
        const chance = 1 / (6 - i);
        if (Math.random() < chance) {
          survived = false;
          chambers = i;
          break;
        }
        chambers = i + 1;
      }
      const delta = survived ? chambers * 10 : 0;
      dispatch({ type: 'USE_POWER_CARD', teamId: selectedTeam, cardId: card.id });
      if (delta > 0) {
        dispatch({ type: '_ADJUST_COINS', teamId: selectedTeam, delta });
      }
      setResult(survived
        ? `${team.name} survived all 6 chambers! +${delta} coins!`
        : `${team.name} was eliminated at chamber ${chambers + 1}! Loses the turn.`);
      return;
    }
    if (card.effect === 'eliminate_2') {
      dispatch({ type: 'USE_POWER_CARD', teamId: selectedTeam, cardId: card.id });
      setResult('2 wrong answer options have been eliminated!');
      setTimeout(onClose, 1200);
      return;
    }
    if (card.effect === 'protect_bet') {
      dispatch({ type: 'USE_POWER_CARD', teamId: selectedTeam, cardId: card.id });
      setResult(`${team.name} is protected! Insurance active for this question.`);
      setTimeout(onClose, 1200);
      return;
    }
    if (card.effect === 'second_chance') {
      dispatch({ type: 'USE_POWER_CARD', teamId: selectedTeam, cardId: card.id });
      setResult(`${team.name} has a second chance on a wrong answer! (Half reward)`);
      setTimeout(onClose, 1200);
      return;
    }
    if (card.effect === 'loyalty') {
      dispatch({ type: 'USE_POWER_CARD', teamId: selectedTeam, cardId: card.id });
      setResult(`Loyalty Program activated! Both teams get +30 if both answer correctly.`);
      setTimeout(onClose, 1200);
      return;
    }
    dispatch({ type: 'USE_POWER_CARD', teamId: selectedTeam, cardId: card.id });
    setResult(`${card.name} activated!`);
    setTimeout(onClose, 1200);
  }

  if (result) {
    return (
      <div className="modal-overlay">
        <div className="modal-box" style={{ textAlign: 'center', maxWidth: '400px' }}>
          <div style={{ fontSize: '2rem', marginBottom: '12px' }}>✨</div>
          <div style={{ color: '#F5A623', fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px', lineHeight: '1.4' }}>{result}</div>
          <button className="btn-gold" onClick={onClose}>Continue →</button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ maxWidth: '520px' }}>
        <div className="modal-title">Use Power Card</div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {teams.map((t, idx) => (
            <button
              key={t.id}
              onClick={() => setSelectedTeam(idx)}
              style={{
                background: selectedTeam === idx ? '#F5A623' : '#1a2a45',
                color: selectedTeam === idx ? '#0f1a2e' : '#d0dde8',
                border: '1px solid #F5A623',
                borderRadius: '6px',
                padding: '6px 14px',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
              }}
            >
              {t.name}
            </button>
          ))}
        </div>

        <div style={{ marginBottom: '10px', color: '#8899aa', fontSize: '0.85rem', textAlign: 'center' }}>
          {team.name} - {team.coins} coins | {ownedCards.length} card(s)
        </div>

        {ownedCards.length === 0 ? (
          <div style={{ color: '#e53935', textAlign: 'center', padding: '20px' }}>No power cards owned.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
            {ownedCards.map(card => (
              <div key={card.id} style={{
                background: '#1a2a45',
                border: '1px solid #2196a8',
                borderRadius: '8px',
                padding: '12px',
              }}>
                <div style={{ fontWeight: 700, color: '#fff', marginBottom: '4px', fontSize: '0.9rem' }}>
                  {card.emoji} {card.name}
                </div>
                <div style={{ color: '#8899aa', fontSize: '0.78rem', marginBottom: '10px' }}>{card.desc}</div>
                <button
                  onClick={() => useCard(card)}
                  className="btn-gold"
                  style={{ width: '100%', padding: '6px', fontSize: '0.82rem' }}
                >
                  Use Card
                </button>
              </div>
            ))}
          </div>
        )}

        <div style={{ textAlign: 'center' }}>
          <button className="btn-nav" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
