import React, { useState } from 'react';
import { useGame } from '../store/gameStore.jsx';
import { QUESTIONS } from '../data/questions.js';
import TeamScoreboard from './TeamScoreboard.jsx';
import EventBanner from './EventBanner.jsx';
import PowerCardModal from './PowerCardModal.jsx';

const LETTERS = ['A', 'B', 'C', 'D'];

export default function QuestionSlide() {
  const { state, dispatch } = useGame();
  const { currentQuestionIndex, selectedOption, revealed, eliminatedOptions, eventEffects, currentRound } = state;
  const q = QUESTIONS[currentQuestionIndex];
  const [showPowerModal, setShowPowerModal] = useState(false);

  const correct = q.ans;
  const isWrong = selectedOption !== null && selectedOption !== correct;
  const isCorrect = selectedOption !== null && selectedOption === correct;

  function handleOption(idx) {
    if (selectedOption !== null) return;
    if (eliminatedOptions.includes(idx)) return;
    dispatch({ type: 'ANSWER_QUESTION', optIdx: idx });
    if (idx === correct) {
      dispatch({ type: 'REVEAL_ANSWER' });
      dispatch({ type: 'APPLY_RESULT', correct: true });
    }
  }

  function handleReveal() {
    dispatch({ type: 'REVEAL_ANSWER' });
    dispatch({ type: 'APPLY_RESULT', correct: false });
  }

  function handleNext() {
    dispatch({ type: 'NEXT_QUESTION' });
  }

  function handlePrev() {
    dispatch({ type: 'SET_PHASE', phase: 'betting' });
  }

  function getOptStyle(idx) {
    const eliminated = eliminatedOptions.includes(idx);
    if (eliminated) {
      return {
        background: '#0a1020',
        border: '2px solid #333',
        opacity: 0.4,
        cursor: 'not-allowed',
      };
    }
    if (revealed && idx === correct) {
      return {
        background: '#1a4020',
        border: '2px solid #43a047',
        cursor: 'default',
      };
    }
    if (selectedOption === idx && idx !== correct) {
      return {
        background: '#5a1010',
        border: '2px solid #e53935',
        cursor: 'default',
      };
    }
    if (selectedOption !== null) {
      return {
        background: '#1a3a45',
        border: '2px solid #2196a8',
        opacity: 0.7,
        cursor: 'default',
      };
    }
    return {
      background: '#1a3a45',
      border: '2px solid #2196a8',
      cursor: 'pointer',
    };
  }

  const anyCardsAvailable = state.teams.some(t => t.powerCards.length > 0);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f1a2e',
      display: 'flex',
      flexDirection: 'column',
      padding: '0',
    }}>
      {/* Header */}
      <div style={{
        background: '#0a1220',
        borderBottom: `3px solid ${q.roundColor}`,
        padding: '10px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{ color: q.roundColor, fontWeight: 700, fontSize: '0.85rem', letterSpacing: '1px' }}>
          {q.roundLabel}
        </span>
        <span style={{ color: '#8899aa', fontSize: '0.85rem' }}>
          Q {q.num} / {q.total}
        </span>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px', gap: '16px', alignItems: 'center' }}>
        {/* Event Banner */}
        <EventBanner />

        {/* Question */}
        <div style={{
          background: '#0a1525',
          border: `2px solid ${q.roundColor}`,
          borderRadius: '12px',
          padding: '20px 24px',
          width: '100%',
          maxWidth: '640px',
        }}>
          <div style={{ fontSize: '1.05rem', color: '#fff', lineHeight: '1.5', fontWeight: 600 }}>
            {q.q}
          </div>
        </div>

        {/* Options */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px',
          width: '100%',
          maxWidth: '640px',
        }}>
          {q.opts.map((opt, idx) => {
            const eliminated = eliminatedOptions.includes(idx);
            const style = getOptStyle(idx);
            return (
              <button
                key={idx}
                onClick={() => handleOption(idx)}
                style={{
                  ...style,
                  borderRadius: '10px',
                  padding: '0',
                  display: 'flex',
                  alignItems: 'stretch',
                  textAlign: 'left',
                  overflow: 'hidden',
                  transition: 'all 0.15s',
                  minHeight: '56px',
                }}
              >
                <div style={{
                  background: eliminated ? '#333' : (revealed && idx === correct ? '#43a047' : (selectedOption === idx && idx !== correct ? '#e53935' : '#2196a8')),
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '1rem',
                  width: '42px',
                  minHeight: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {LETTERS[idx]}
                </div>
                <div style={{
                  padding: '10px 14px',
                  fontSize: '0.88rem',
                  color: eliminated ? '#444' : '#e8eaf0',
                  lineHeight: '1.4',
                  display: 'flex',
                  alignItems: 'center',
                }}>
                  {eliminated ? '(eliminated)' : opt}
                </div>
              </button>
            );
          })}
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {isWrong && !revealed && (
            <button className="btn-gold" onClick={handleReveal}>
              Reveal Answer
            </button>
          )}
          {(revealed || isCorrect) && (
            <button className="btn-gold" onClick={handleNext}>
              {currentQuestionIndex >= 29 ? 'See Final Scores →' : 'Next Question →'}
            </button>
          )}
          {currentRound >= 2 && anyCardsAvailable && selectedOption === null && (
            <button
              onClick={() => setShowPowerModal(true)}
              style={{
                background: '#1a2a45',
                border: '2px solid #38bdf8',
                color: '#38bdf8',
                borderRadius: '8px',
                padding: '10px 18px',
                fontWeight: 600,
                fontSize: '0.88rem',
                cursor: 'pointer',
              }}
            >
              🃏 Power Card
            </button>
          )}
        </div>

        {/* Scoreboard */}
        <TeamScoreboard showBets={true} />

        {/* Footer tip */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
          maxWidth: '640px',
          padding: '0 4px',
        }}>
          <button className="btn-nav" onClick={handlePrev} style={{ fontSize: '0.82rem', padding: '6px 14px' }}>
            {'<'} Edit Bets
          </button>
          <span style={{ color: '#4a5a6a', fontSize: '0.78rem', alignSelf: 'center', textAlign: 'center' }}>
            {q.tip}
          </span>
        </div>
      </div>

      {showPowerModal && <PowerCardModal onClose={() => setShowPowerModal(false)} />}
    </div>
  );
}
