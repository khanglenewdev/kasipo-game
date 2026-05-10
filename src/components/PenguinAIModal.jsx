import React, { useState, useEffect } from 'react';
import { useGame } from '../store/gameStore.jsx';
import { QUESTIONS } from '../data/questions.js';

const LETTERS = ['A', 'B', 'C', 'D'];

/*
  Penguin AI auto-eliminator. Cycles through the 4 options for ~5s then
  lands on a randomly chosen WRONG option, blacks it out, dispatches
  ELIMINATE_OPTION + clears the aiPendingEliminate flag.
*/
export default function PenguinAIModal({ onDone }) {
  const { state, dispatch } = useGame();
  const q = QUESTIONS[state.currentQuestionIndex];
  const correctIdx = q.ans;

  const [phase, setPhase] = useState('cycling'); // cycling | landed
  const [highlightIdx, setHighlightIdx] = useState(0);
  const [targetIdx, setTargetIdx] = useState(null);

  // Pick a wrong option (not already eliminated) once on mount
  useEffect(() => {
    const candidates = [0, 1, 2, 3].filter(
      i => i !== correctIdx && !state.eliminatedOptions.includes(i)
    );
    if (candidates.length === 0) {
      // Nothing to eliminate; clear flag and bail out
      dispatch({ type: 'CONSUME_AI_ELIMINATE' });
      onDone();
      return;
    }
    const target = candidates[Math.floor(Math.random() * candidates.length)];
    setTargetIdx(target);

    // Cycle animation: 0,1,2,3,0,1,... slowing down to land on target
    const startIdx = 0;
    const offset = ((target - startIdx) % 4 + 4) % 4;
    const totalTicks = 18 + offset; // ~5s with ease-out
    let tick = 0;
    let cancelled = false;

    function step() {
      if (cancelled) return;
      setHighlightIdx(prev => (prev + 1) % 4);
      tick++;
      if (tick >= totalTicks) {
        // Land
        setHighlightIdx(target);
        // Apply: blackout + eliminate
        dispatch({ type: 'ELIMINATE_OPTION', optIdx: target });
        dispatch({ type: 'CONSUME_AI_ELIMINATE' });
        setPhase('landed');
        return;
      }
      const progress = tick / totalTicks;
      const delay = 80 + Math.pow(progress, 3) * 700;
      setTimeout(step, delay);
    }
    setTimeout(step, 100);
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="modal-overlay" style={{ zIndex: 200 }}>
      <div className="modal-box" style={{ maxWidth: '520px', textAlign: 'center' }}>
        <div style={{ fontSize: '3.2rem', marginBottom: '6px' }}>🐧</div>
        <div style={{ color: '#38bdf8', fontWeight: 800, fontSize: '1.2rem', letterSpacing: '1px', marginBottom: '4px' }}>
          PENGUIN AI HELPING…
        </div>
        <div style={{ color: '#8899aa', fontSize: '0.85rem', marginBottom: '18px' }}>
          {phase === 'cycling'
            ? 'Scanning answers for one to eliminate…'
            : 'Wrong answer eliminated! 🧊'}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '10px',
          marginBottom: '18px',
        }}>
          {q.opts.map((opt, idx) => {
            const isHighlighted = phase === 'cycling' && highlightIdx === idx;
            const isLanded = phase === 'landed' && targetIdx === idx;
            return (
              <div
                key={idx}
                style={{
                  background: isLanded ? '#000' : (isHighlighted ? '#1a3a45' : '#0f1a2e'),
                  border: `2px solid ${isLanded ? '#e53935' : isHighlighted ? '#38bdf8' : '#2a3548'}`,
                  borderRadius: '8px',
                  padding: '12px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  textAlign: 'left',
                  transform: isHighlighted ? 'scale(1.04)' : 'scale(1)',
                  boxShadow: isHighlighted ? '0 0 14px rgba(56,189,248,0.5)' : isLanded ? '0 0 14px rgba(229,57,53,0.6)' : 'none',
                  transition: 'all 0.12s',
                  opacity: isLanded ? 0.7 : 1,
                }}
              >
                <span style={{
                  background: isLanded ? '#e53935' : isHighlighted ? '#38bdf8' : '#2196a8',
                  color: '#fff',
                  fontWeight: 800,
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.9rem',
                  flexShrink: 0,
                }}>
                  {isLanded ? '✗' : LETTERS[idx]}
                </span>
                <span style={{
                  color: isLanded ? '#666' : '#e8eaf0',
                  fontSize: '0.82rem',
                  textDecoration: isLanded ? 'line-through' : 'none',
                  lineHeight: '1.3',
                }}>
                  {opt}
                </span>
              </div>
            );
          })}
        </div>

        {phase === 'landed' && (
          <button
            className="btn-gold"
            onClick={onDone}
            style={{ fontSize: '1rem', padding: '10px 28px' }}
          >
            Continue →
          </button>
        )}
      </div>
    </div>
  );
}
