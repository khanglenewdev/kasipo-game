import React from 'react';
import { useGame } from '../store/gameStore.jsx';
import { QUESTIONS } from '../data/questions.js';
import TeamScoreboard from './TeamScoreboard.jsx';

const LETTERS = ['A', 'B', 'C', 'D'];

export default function AnswerSlide() {
  const { state, dispatch } = useGame();
  const { currentQuestionIndex } = state;
  const q = QUESTIONS[currentQuestionIndex];

  function handleNext() {
    dispatch({ type: 'NEXT_QUESTION' });
  }

  function handlePrev() {
    dispatch({ type: 'GO_TO_QUESTION' });
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f1a2e',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Gold header bar */}
      <div style={{
        background: '#1a2a0a',
        borderBottom: '3px solid #43a047',
        padding: '12px 20px',
        textAlign: 'center',
      }}>
        <span style={{ color: '#43a047', fontWeight: 700, fontSize: '0.9rem', letterSpacing: '2px' }}>
          ANSWER REVEAL - {q.roundLabel} Q{q.num}
        </span>
      </div>

      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: '24px',
        gap: '20px',
        alignItems: 'center',
      }}>
        {/* Correct indicator */}
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: '#1a4020',
          border: '3px solid #43a047',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem',
          fontWeight: 900,
          color: '#43a047',
        }}>
          {LETTERS[q.ans]}
        </div>

        {/* Correct answer text */}
        <div style={{
          background: '#1a4020',
          border: '2px solid #43a047',
          borderRadius: '10px',
          padding: '16px 24px',
          width: '100%',
          maxWidth: '580px',
          textAlign: 'center',
        }}>
          <div style={{ color: '#43a047', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>CORRECT ANSWER</div>
          <div style={{ color: '#fff', fontSize: '1rem', fontWeight: 600 }}>
            {LETTERS[q.ans]}. {q.opts[q.ans]}
          </div>
        </div>

        {/* Why explanation */}
        <div style={{
          background: '#0a1525',
          border: '1px solid #38bdf8',
          borderRadius: '10px',
          padding: '16px 24px',
          width: '100%',
          maxWidth: '580px',
        }}>
          <div style={{ color: '#38bdf8', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>EXPLANATION</div>
          <div style={{ color: '#d0dde8', fontSize: '0.92rem', lineHeight: '1.5' }}>{q.why}</div>
        </div>

        {/* Scoreboard */}
        <TeamScoreboard />

        {/* Navigation */}
        <div style={{ display: 'flex', gap: '16px' }}>
          <button className="btn-nav" onClick={handlePrev}>{'<'} Back to Question</button>
          <button className="btn-gold" onClick={handleNext}>
            {currentQuestionIndex >= 29 ? 'Final Scores →' : 'Next Question →'}
          </button>
        </div>
      </div>
    </div>
  );
}
