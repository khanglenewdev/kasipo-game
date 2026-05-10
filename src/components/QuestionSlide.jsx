import React, { useState, useEffect } from 'react';
import { useGame } from '../store/gameStore.jsx';
import { QUESTIONS } from '../data/questions.js';
import { TEAM_COLORS, WRONG_BORDER } from '../data/teamColors.js';
import TeamScoreboard from './TeamScoreboard.jsx';
import EventBanner from './EventBanner.jsx';
import PowerCardModal from './PowerCardModal.jsx';
import PenguinAIModal from './PenguinAIModal.jsx';
import QuestionTimer from './QuestionTimer.jsx';

const LETTERS = ['A', 'B', 'C', 'D'];

export default function QuestionSlide() {
  const { state, dispatch } = useGame();
  const {
    currentQuestionIndex,
    teamAnswers,
    teamResults,
    revealed,
    eliminatedOptions,
    currentRound,
    teams,
    stolenTurns,
    loyaltyLink,
    retryTeams,
  } = state;

  const q = QUESTIONS[currentQuestionIndex];
  const correct = q.ans;
  const [showPowerModal, setShowPowerModal] = useState(false);
  const [showPenguin, setShowPenguin] = useState(false);

  // Auto-show Penguin AI when its flag is set and we're loading a fresh question.
  useEffect(() => {
    if (state.eventEffects.aiPendingEliminate && !state.revealed) {
      setShowPenguin(true);
    }
  }, [state.eventEffects.aiPendingEliminate, currentQuestionIndex, state.revealed]);

  const allTeamsAnswered = teams.every(t => teamAnswers[t.id] !== null);
  const someTeamPicked = teams.some(t => teamAnswers[t.id] !== null);

  function setAnswer(teamId, optIdx) {
    if (revealed) return;
    if (eliminatedOptions.includes(optIdx)) return;
    // Toggle: if already at this option, clear
    if (teamAnswers[teamId] === optIdx) {
      dispatch({ type: 'CLEAR_TEAM_ANSWER', teamId });
    } else {
      dispatch({ type: 'SET_TEAM_ANSWER', teamId, optIdx });
    }
  }

  function handleApply() {
    dispatch({ type: 'APPLY_RESULT' });
  }

  function handleNext() {
    dispatch({ type: 'NEXT_QUESTION' });
  }

  function handlePrev() {
    dispatch({ type: 'SET_PHASE', phase: 'betting' });
  }

  function startRetry(teamId) {
    dispatch({ type: 'START_RETRY_FOR_TEAM', teamId });
  }

  function applyRetry(teamId) {
    dispatch({ type: 'APPLY_RETRY_RESULT', teamId });
  }

  function forfeitRetry(teamId) {
    dispatch({ type: 'FORFEIT_RETRY_FOR_TEAM', teamId });
  }

  // Visual: per-option style after reveal
  function getOptStyle(idx) {
    const eliminated = eliminatedOptions.includes(idx);
    if (eliminated) {
      return {
        background: '#0a1020',
        border: '2px solid #333',
        opacity: 0.4,
      };
    }
    if (revealed && idx === correct) {
      return {
        background: '#1a4020',
        border: '2px solid #43a047',
      };
    }
    // After reveal, mark options that any team picked wrong with red
    if (revealed) {
      const someoneWrongHere = teams.some(t => teamAnswers[t.id] === idx && t.id !== undefined);
      if (someoneWrongHere && idx !== correct) {
        return {
          background: '#2a0a0a',
          border: `2px solid ${WRONG_BORDER}`,
        };
      }
    }
    return {
      background: '#1a3a45',
      border: '2px solid #2196a8',
    };
  }

  const anyCardsAvailable = teams.some(t => t.powerCards.length > 0);
  const hasActivePowers = stolenTurns.length > 0 || !!loyaltyLink;
  const pendingRetryTeams = teams.filter(t => teamResults[t.id] === 'pending_retry');
  const teamInRetry = retryTeams[0] !== undefined ? teams.find(t => t.id === retryTeams[0]) : null;

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f1a2e',
      display: 'flex',
      flexDirection: 'column',
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

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px', gap: '14px', alignItems: 'center' }}>
        <EventBanner />

        {/* Power-effect banner */}
        {hasActivePowers && (
          <div style={{
            background: '#1a2540',
            border: '1px solid #a855f7',
            borderRadius: '8px',
            padding: '8px 14px',
            width: '100%',
            maxWidth: '720px',
            display: 'flex',
            gap: '14px',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}>
            {stolenTurns.map((s, i) => (
              <span key={i} style={{ color: WRONG_BORDER, fontSize: '0.82rem', fontWeight: 600 }}>
                🔴 T{s.byTeamId + 1} → stole T{s.targetTeamId + 1}'s turn
              </span>
            ))}
            {loyaltyLink && (
              <span style={{ color: '#38bdf8', fontSize: '0.82rem', fontWeight: 600 }}>
                🤝 T{loyaltyLink.fromTeamId + 1} ↔ T{loyaltyLink.partnerTeamId + 1} (both right = +30 each)
              </span>
            )}
          </div>
        )}

        {/* Retry banner */}
        {teamInRetry && (
          <div style={{
            background: '#3a2a0a',
            border: '2px solid #F5A623',
            borderRadius: '8px',
            padding: '10px 16px',
            width: '100%',
            maxWidth: '720px',
            textAlign: 'center',
          }}>
            <div style={{ color: '#F5A623', fontWeight: 700, fontSize: '0.95rem' }}>
              🛎 SECOND CHANCE — pick again for {teamInRetry.name}
            </div>
            <div style={{ color: '#d0dde8', fontSize: '0.78rem', marginTop: '2px' }}>
              Half reward if correct on retry
            </div>
          </div>
        )}

        {/* Question */}
        <div style={{
          background: '#0a1525',
          border: `2px solid ${q.roundColor}`,
          borderRadius: '12px',
          padding: '20px 24px',
          width: '100%',
          maxWidth: '720px',
        }}>
          <div style={{ fontSize: '1.05rem', color: '#fff', lineHeight: '1.5', fontWeight: 600 }}>
            {q.q}
          </div>
        </div>

        {/* Options with team-assignment chips */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '8px',
          width: '100%',
          maxWidth: '720px',
        }}>
          {q.opts.map((opt, idx) => {
            const eliminated = eliminatedOptions.includes(idx);
            const style = getOptStyle(idx);
            const teamsHere = teams.filter(t => teamAnswers[t.id] === idx);
            const isCorrectOpt = revealed && idx === correct;
            return (
              <div
                key={idx}
                style={{
                  ...style,
                  borderRadius: '10px',
                  padding: '10px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    background: eliminated ? '#333' : (isCorrectOpt ? '#43a047' : (revealed && teamsHere.length > 0 && idx !== correct ? WRONG_BORDER : '#2196a8')),
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '1rem',
                    width: '36px',
                    height: '36px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {LETTERS[idx]}
                  </div>
                  <div style={{
                    flex: 1,
                    fontSize: '0.92rem',
                    color: eliminated ? '#444' : '#e8eaf0',
                    lineHeight: '1.3',
                  }}>
                    {eliminated ? '(eliminated)' : opt}
                  </div>
                  {revealed && idx === correct && (
                    <span style={{ color: '#43a047', fontWeight: 700, fontSize: '0.82rem' }}>✓ CORRECT</span>
                  )}
                </div>

                {/* Team chips: which teams picked this option */}
                {!eliminated && (
                  <div style={{
                    display: 'flex',
                    gap: '6px',
                    flexWrap: 'wrap',
                    paddingLeft: '48px',
                  }}>
                    {teams.map((t, tIdx) => {
                      const picked = teamAnswers[t.id] === idx;
                      // In retry mode, only the retry team can change
                      const inRetryMode = retryTeams.length > 0;
                      const canChange = !revealed || (inRetryMode && retryTeams.includes(t.id));
                      const isThisTeamRetry = inRetryMode && retryTeams.includes(t.id);
                      const teamColor = TEAM_COLORS[tIdx % 4];
                      // After reveal, color the chip green/red based on result
                      let chipBg, chipBorder, chipColor;
                      if (revealed && picked) {
                        if (idx === correct) {
                          chipBg = '#1a4020';
                          chipBorder = '#43a047';
                          chipColor = '#43a047';
                        } else {
                          chipBg = '#3a1010';
                          chipBorder = WRONG_BORDER;
                          chipColor = WRONG_BORDER;
                        }
                      } else if (picked) {
                        chipBg = teamColor;
                        chipBorder = teamColor;
                        chipColor = '#0f1a2e';
                      } else {
                        chipBg = '#0f1a2e';
                        chipBorder = inRetryMode && !isThisTeamRetry ? '#2a3548' : teamColor;
                        chipColor = inRetryMode && !isThisTeamRetry ? '#5a6a7a' : teamColor;
                      }
                      return (
                        <button
                          key={t.id}
                          onClick={() => canChange && setAnswer(t.id, idx)}
                          disabled={!canChange}
                          style={{
                            background: chipBg,
                            border: `2px solid ${chipBorder}`,
                            color: chipColor,
                            borderRadius: '999px',
                            padding: '3px 10px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: canChange ? 'pointer' : 'not-allowed',
                            opacity: canChange ? 1 : 0.5,
                            transition: 'all 0.15s',
                          }}
                        >
                          {picked ? '✓ ' : ''}{t.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Status / explanation */}
        {!revealed && (
          <div style={{ color: '#8899aa', fontSize: '0.82rem', textAlign: 'center' }}>
            {teams.filter(t => teamAnswers[t.id] !== null).length} of {teams.length} teams have picked.
            {!allTeamsAnswered && ' Click a team chip on the option they chose.'}
          </div>
        )}

        {revealed && (
          <div style={{
            background: '#0a1525',
            border: '1px solid #38bdf8',
            borderRadius: '10px',
            padding: '12px 16px',
            width: '100%',
            maxWidth: '720px',
          }}>
            <div style={{ color: '#38bdf8', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>
              EXPLANATION
            </div>
            <div style={{ color: '#d0dde8', fontSize: '0.9rem', lineHeight: '1.45' }}>{q.why}</div>
          </div>
        )}

        {/* Pending retry team list */}
        {revealed && pendingRetryTeams.length > 0 && retryTeams.length === 0 && (
          <div style={{
            background: '#3a2a0a',
            border: '1px solid #F5A623',
            borderRadius: '10px',
            padding: '12px 16px',
            width: '100%',
            maxWidth: '720px',
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <span style={{ color: '#F5A623', fontWeight: 700, fontSize: '0.88rem' }}>
              🛎 Second Chance available for:
            </span>
            {pendingRetryTeams.map(t => (
              <div key={t.id} style={{ display: 'flex', gap: '4px' }}>
                <button
                  onClick={() => startRetry(t.id)}
                  style={{
                    background: '#F5A623',
                    color: '#0f1a2e',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                  }}
                >
                  🛎 Retry {t.name}
                </button>
                <button
                  onClick={() => forfeitRetry(t.id)}
                  style={{
                    background: 'transparent',
                    color: '#8899aa',
                    border: '1px solid #8899aa',
                    borderRadius: '6px',
                    padding: '6px 10px',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                  }}
                >
                  Skip
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {!revealed && (
            <button
              className="btn-gold"
              onClick={handleApply}
              disabled={!someTeamPicked}
              style={{
                opacity: someTeamPicked ? 1 : 0.4,
                cursor: someTeamPicked ? 'pointer' : 'not-allowed',
              }}
              title={!allTeamsAnswered ? 'Teams without a pick are skipped (no coin change)' : ''}
            >
              {allTeamsAnswered ? 'Reveal Answer & Apply →' : `Reveal (${teams.filter(t => teamAnswers[t.id] !== null).length}/${teams.length} picked) →`}
            </button>
          )}

          {teamInRetry && (
            <>
              <button
                className="btn-gold"
                onClick={() => applyRetry(teamInRetry.id)}
                disabled={teamAnswers[teamInRetry.id] === null}
                style={{
                  opacity: teamAnswers[teamInRetry.id] !== null ? 1 : 0.4,
                  cursor: teamAnswers[teamInRetry.id] !== null ? 'pointer' : 'not-allowed',
                }}
              >
                Apply Retry for {teamInRetry.name} →
              </button>
              <button
                onClick={() => forfeitRetry(teamInRetry.id)}
                style={{
                  background: 'transparent',
                  color: '#8899aa',
                  border: '1px solid #8899aa',
                  borderRadius: '6px',
                  padding: '8px 14px',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                Skip retry
              </button>
            </>
          )}

          {revealed && retryTeams.length === 0 && pendingRetryTeams.length === 0 && (
            <button className="btn-gold" onClick={handleNext}>
              {currentQuestionIndex >= QUESTIONS.length - 1 ? 'See Final Scores →' : 'Next Question →'}
            </button>
          )}

          {currentRound >= 2 && anyCardsAvailable && !revealed && (
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
              🃏 Power Cards
            </button>
          )}
        </div>

        <TeamScoreboard showBets={true} />

        {/* Footer tip */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
          maxWidth: '720px',
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

      {/* 30s answer timer (visual only). Pauses on reveal or when modals overlay. */}
      <QuestionTimer
        resetKey={currentQuestionIndex}
        paused={revealed || showPowerModal || showPenguin}
      />

      {showPowerModal && <PowerCardModal onClose={() => setShowPowerModal(false)} />}
      {showPenguin && <PenguinAIModal onDone={() => setShowPenguin(false)} />}
    </div>
  );
}
