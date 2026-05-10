import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../store/gameStore.jsx';
import { POWER_CARDS } from '../data/powerCards.js';
import { TEAM_COLORS } from '../data/teamColors.js';

const TEAM_BORDER = TEAM_COLORS;

/*
  Batch power-card selection.
  - Each team can choose at most 1 card to use this turn (per the rules)
  - Cards needing a target: pick a target inline
  - Doppelganger: pick which used card to revive
  - "Apply All" runs every selection sequentially with mini animations.
*/

function findCard(id) {
  return POWER_CARDS.find(c => c.id === id);
}

export default function PowerCardModal({ onClose }) {
  const { state, dispatch } = useGame();
  const { teams } = state;

  // selections[teamId] = { cardId, targetTeamId?, revivedCardId? }
  const [selections, setSelections] = useState({});
  // playback state
  const [playing, setPlaying] = useState(false);
  const [playStep, setPlayStep] = useState(null); // {teamId, sel, phase: 'spin' | 'result', isLastCard }
  // Resolves when the user clicks "Continue" on a result screen during playback.
  const continueResolver = useRef(null);

  function handleContinue() {
    if (continueResolver.current) {
      const r = continueResolver.current;
      continueResolver.current = null;
      r();
    }
  }

  function awaitContinue() {
    return new Promise(resolve => {
      continueResolver.current = resolve;
    });
  }

  function setSel(teamId, patch) {
    setSelections(prev => ({
      ...prev,
      [teamId]: patch ? { ...(prev[teamId] || {}), ...patch } : null,
    }));
  }

  function clearSel(teamId) {
    setSelections(prev => {
      const next = { ...prev };
      delete next[teamId];
      return next;
    });
  }

  function pickCard(teamId, cardId) {
    // Toggle off if same card clicked
    const cur = selections[teamId];
    if (cur && cur.cardId === cardId) {
      clearSel(teamId);
      return;
    }
    setSel(teamId, { cardId });
  }

  function canApply() {
    const entries = Object.entries(selections);
    if (entries.length === 0) return false;
    return entries.every(([tid, sel]) => {
      const card = findCard(sel.cardId);
      if (!card) return false;
      if (card.id === 'system_error') return sel.targetTeamId !== undefined && sel.targetTeamId !== null;
      if (card.id === 'loyalty_program') return sel.targetTeamId !== undefined && sel.targetTeamId !== null;
      if (card.id === 'doppelganger') return !!sel.revivedCardId;
      return true;
    });
  }

  async function runPlayback() {
    setPlaying(true);
    const entries = Object.entries(selections);
    for (let i = 0; i < entries.length; i++) {
      const [tidStr, sel] = entries[i];
      const teamId = parseInt(tidStr);
      const card = findCard(sel.cardId);
      const isLastCard = i === entries.length - 1;

      const showResult = (payload) => {
        setPlayStep({ teamId, sel, phase: 'result', isLastCard, payload });
      };

      if (card.id === 'gacha') {
        setPlayStep({ teamId, sel, phase: 'spin', isLastCard });
        await wait(1600);
        const win = Math.random() > 0.5;
        dispatch({ type: 'CONSUME_CARD', teamId, cardId: card.id });
        dispatch({ type: 'APPLY_GACHA_RESULT', teamId, win });
        showResult({ win });
        await awaitContinue();
      } else if (card.id === 'russian_roulette') {
        setPlayStep({ teamId, sel, phase: 'spin', isLastCard });
        await wait(1200);
        let chambers = 0;
        let survived = true;
        for (let j = 0; j < 6; j++) {
          const chance = 1 / (6 - j);
          if (Math.random() < chance) {
            survived = false;
            chambers = j;
            break;
          }
          chambers = j + 1;
        }
        for (let j = 0; j < (survived ? 6 : chambers + 1); j++) {
          setPlayStep({ teamId, sel, phase: 'spin', isLastCard, payload: { chamber: j + 1, total: 6, fired: !survived && j === chambers } });
          await wait(450);
        }
        dispatch({ type: 'CONSUME_CARD', teamId, cardId: card.id });
        dispatch({ type: 'APPLY_ROULETTE_RESULT', teamId, survived, chambers });
        showResult({ survived, chambers });
        await awaitContinue();
      } else if (card.id === 'pms_analytics') {
        setPlayStep({ teamId, sel, phase: 'spin', isLastCard });
        await wait(800);
        dispatch({ type: 'CONSUME_CARD', teamId, cardId: card.id });
        dispatch({ type: 'DECLARE_PMS_ANALYTICS', teamId });
        showResult();
        await awaitContinue();
      } else if (card.id === 'system_error') {
        setPlayStep({ teamId, sel, phase: 'spin', isLastCard });
        await wait(800);
        dispatch({ type: 'CONSUME_CARD', teamId, cardId: card.id });
        dispatch({ type: 'DECLARE_STEAL', byTeamId: teamId, targetTeamId: sel.targetTeamId });
        showResult();
        await awaitContinue();
      } else if (card.id === 'loyalty_program') {
        setPlayStep({ teamId, sel, phase: 'spin', isLastCard });
        await wait(800);
        dispatch({ type: 'CONSUME_CARD', teamId, cardId: card.id });
        dispatch({ type: 'DECLARE_LOYALTY', teamId, partnerTeamId: sel.targetTeamId });
        showResult();
        await awaitContinue();
      } else if (card.id === 'insurance') {
        setPlayStep({ teamId, sel, phase: 'spin', isLastCard });
        await wait(600);
        dispatch({ type: 'CONSUME_CARD', teamId, cardId: card.id });
        dispatch({ type: 'DECLARE_INSURANCE', teamId });
        showResult();
        await awaitContinue();
      } else if (card.id === 'complimentary') {
        setPlayStep({ teamId, sel, phase: 'spin', isLastCard });
        await wait(600);
        dispatch({ type: 'CONSUME_CARD', teamId, cardId: card.id });
        dispatch({ type: 'DECLARE_SECOND_CHANCE', teamId });
        showResult();
        await awaitContinue();
      } else if (card.id === 'doppelganger') {
        setPlayStep({ teamId, sel, phase: 'spin', isLastCard });
        await wait(800);
        dispatch({ type: 'APPLY_DOPPELGANGER', teamId, revivedCardId: sel.revivedCardId });
        showResult();
        await awaitContinue();
      }
    }
    setPlayStep(null);
    setPlaying(false);
    onClose();
  }

  if (playing) {
    const showContinue = playStep && playStep.phase === 'result';
    const continueLabel = playStep && playStep.isLastCard ? 'Done →' : 'Next Card →';
    return (
      <div className="modal-overlay">
        <div className="modal-box" style={{ maxWidth: '480px', textAlign: 'center' }}>
          <PlaybackView step={playStep} teams={teams} />
          {showContinue && (
            <button
              className="btn-gold"
              onClick={handleContinue}
              style={{ marginTop: '18px', fontSize: '1rem', padding: '10px 28px' }}
            >
              {continueLabel}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ maxWidth: '760px' }}>
        <div className="modal-title">🃏 Power Card Phase</div>
        <p style={{ textAlign: 'center', color: '#8899aa', marginBottom: '14px', fontSize: '0.85rem' }}>
          Each team may use 1 power card. Click a card to select. Click "Apply All" when ready.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '14px' }}>
          {teams.map((team, tIdx) => {
            const owned = team.powerCards.map(findCard).filter(Boolean);
            const sel = selections[team.id] || null;
            const selCard = sel ? findCard(sel.cardId) : null;
            const otherTeams = teams.filter(t => t.id !== team.id);

            return (
              <div
                key={team.id}
                style={{
                  background: '#0f1a2e',
                  border: `2px solid ${TEAM_BORDER[tIdx % 4]}`,
                  borderRadius: '10px',
                  padding: '12px',
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '10px',
                }}>
                  <div style={{
                    color: TEAM_BORDER[tIdx % 4],
                    fontWeight: 700,
                    fontSize: '0.95rem',
                  }}>
                    {team.name} <span style={{ color: '#8899aa', fontWeight: 400 }}>· {team.coins} coins · {owned.length} card{owned.length !== 1 ? 's' : ''}</span>
                  </div>
                  {sel && (
                    <button
                      onClick={() => clearSel(team.id)}
                      style={{
                        background: 'transparent',
                        border: '1px solid #8899aa',
                        color: '#8899aa',
                        borderRadius: '4px',
                        padding: '2px 8px',
                        fontSize: '0.7rem',
                      }}
                    >
                      Clear selection
                    </button>
                  )}
                </div>

                {owned.length === 0 ? (
                  <div style={{ color: '#5a6a7a', fontSize: '0.82rem', fontStyle: 'italic' }}>
                    No power cards owned.
                  </div>
                ) : (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                    gap: '8px',
                  }}>
                    {owned.map(card => {
                      const isSelected = sel && sel.cardId === card.id;
                      return (
                        <button
                          key={card.id}
                          onClick={() => pickCard(team.id, card.id)}
                          style={{
                            background: isSelected ? '#1a3a45' : '#162035',
                            border: `2px solid ${isSelected ? '#F5A623' : '#2196a8'}`,
                            color: isSelected ? '#F5A623' : '#d0dde8',
                            borderRadius: '8px',
                            padding: '8px 10px',
                            textAlign: 'left',
                            transition: 'all 0.15s',
                            cursor: 'pointer',
                          }}
                        >
                          <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '2px' }}>
                            {card.emoji} {card.name} {isSelected ? '✓' : ''}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#8899aa', lineHeight: '1.3' }}>
                            {card.desc}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Conditional inputs for the selected card */}
                {selCard && (selCard.id === 'system_error' || selCard.id === 'loyalty_program') && (
                  <div style={{ marginTop: '10px' }}>
                    <div style={{ color: '#F5A623', fontSize: '0.78rem', marginBottom: '4px' }}>
                      {selCard.id === 'system_error' ? 'Pick target team to steal:' : 'Pick partner team:'}
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {otherTeams.map(ot => (
                        <button
                          key={ot.id}
                          onClick={() => setSel(team.id, { targetTeamId: ot.id })}
                          style={{
                            background: sel.targetTeamId === ot.id ? '#F5A623' : '#1a2a45',
                            color: sel.targetTeamId === ot.id ? '#0f1a2e' : '#d0dde8',
                            border: '1px solid #F5A623',
                            borderRadius: '4px',
                            padding: '4px 10px',
                            fontSize: '0.78rem',
                            cursor: 'pointer',
                          }}
                        >
                          {ot.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {selCard && selCard.id === 'doppelganger' && (
                  <div style={{ marginTop: '10px' }}>
                    <div style={{ color: '#F5A623', fontSize: '0.78rem', marginBottom: '4px' }}>
                      Revive which used card?
                    </div>
                    {team.usedCards.length === 0 ? (
                      <div style={{ color: '#e53935', fontSize: '0.78rem' }}>
                        No used cards available to revive.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {[...new Set(team.usedCards)].map(cid => {
                          const c = findCard(cid);
                          if (!c) return null;
                          return (
                            <button
                              key={cid}
                              onClick={() => setSel(team.id, { revivedCardId: cid })}
                              style={{
                                background: sel.revivedCardId === cid ? '#F5A623' : '#1a2a45',
                                color: sel.revivedCardId === cid ? '#0f1a2e' : '#d0dde8',
                                border: '1px solid #F5A623',
                                borderRadius: '4px',
                                padding: '4px 10px',
                                fontSize: '0.78rem',
                                cursor: 'pointer',
                              }}
                            >
                              {c.emoji} {c.name}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '20px',
          gap: '12px',
        }}>
          <button className="btn-nav" onClick={onClose}>Cancel</button>
          <div style={{ color: '#8899aa', fontSize: '0.82rem' }}>
            {Object.keys(selections).length} team{Object.keys(selections).length !== 1 ? 's' : ''} selected
          </div>
          <button
            className="btn-gold"
            disabled={!canApply()}
            onClick={runPlayback}
            style={{
              opacity: canApply() ? 1 : 0.4,
              cursor: canApply() ? 'pointer' : 'not-allowed',
            }}
          >
            Apply All →
          </button>
        </div>
      </div>
    </div>
  );
}

function wait(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function PlaybackView({ step, teams }) {
  if (!step) return <div style={{ color: '#8899aa' }}>Loading…</div>;
  const team = teams.find(t => t.id === step.teamId);
  const card = findCard(step.sel.cardId);

  if (card.id === 'gacha') {
    return (
      <div>
        <div style={{ color: '#F5A623', fontSize: '0.85rem', marginBottom: '8px' }}>
          {team.name} — 🎰 Ga Cha Ga Me
        </div>
        {step.phase === 'spin' && (
          <>
            <div style={{ fontSize: '5rem', animation: 'flipCoin 1.6s ease-in-out infinite' }}>🪙</div>
            <div style={{ color: '#8899aa', marginTop: '8px' }}>High Risk. High Reward...</div>
          </>
        )}
        {step.phase === 'result' && (
          <>
            <div style={{ fontSize: '5rem' }}>{step.payload.win ? '💰' : '💥'}</div>
            <div style={{
              color: step.payload.win ? '#43a047' : '#e53935',
              fontSize: '1.6rem',
              fontWeight: 900,
              marginTop: '8px',
            }}>
              {step.payload.win ? 'HUGE PROFIT +50' : 'MARKET CRASH -50'}
            </div>
          </>
        )}
      </div>
    );
  }

  if (card.id === 'russian_roulette') {
    return (
      <div>
        <div style={{ color: '#F5A623', fontSize: '0.85rem', marginBottom: '8px' }}>
          {team.name} — 📞 Russian Roulette
        </div>
        {step.phase === 'spin' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '12px' }}>
              {Array.from({ length: 6 }).map((_, i) => {
                const chamber = step.payload?.chamber || 0;
                const fired = step.payload?.fired && i === chamber - 1;
                const passed = i < chamber - 1;
                return (
                  <div
                    key={i}
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      background: fired ? '#e53935' : passed ? '#43a047' : '#1a2a45',
                      border: `2px solid ${fired ? '#ff8a80' : passed ? '#43a047' : '#5a6a7a'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      color: '#fff',
                      transition: 'all 0.3s',
                    }}
                  >
                    {fired ? '💥' : passed ? '✓' : i + 1}
                  </div>
                );
              })}
            </div>
            <div style={{ color: '#8899aa' }}>
              {step.payload?.chamber ? `Chamber ${step.payload.chamber}…` : 'Loading the gun…'}
            </div>
          </>
        )}
        {step.phase === 'result' && (
          <>
            <div style={{ fontSize: '4rem', marginBottom: '8px' }}>
              {step.payload.survived ? '🎉' : '💀'}
            </div>
            <div style={{
              color: step.payload.survived ? '#43a047' : '#e53935',
              fontSize: '1.3rem',
              fontWeight: 900,
            }}>
              {step.payload.survived
                ? `Survived all 6! +${step.payload.chambers * 10} coins`
                : `Eliminated at chamber ${step.payload.chambers + 1}. Turn lost.`}
            </div>
          </>
        )}
      </div>
    );
  }

  if (card.id === 'pms_analytics') {
    return (
      <div>
        <div style={{ color: '#F5A623', fontSize: '0.85rem', marginBottom: '8px' }}>
          {team.name} — 📊 PMS Analytics
        </div>
        <div style={{ fontSize: '4rem', marginBottom: '8px' }}>📊</div>
        <div style={{ color: '#43a047', fontSize: '1.1rem', fontWeight: 700 }}>
          2 wrong answers eliminated
        </div>
      </div>
    );
  }

  if (card.id === 'system_error') {
    const target = teams.find(t => t.id === step.sel.targetTeamId);
    return (
      <div>
        <div style={{ color: '#F5A623', fontSize: '0.85rem', marginBottom: '8px' }}>
          {team.name} — 🔴 System Error
        </div>
        <div style={{ fontSize: '4rem', marginBottom: '8px' }}>🔴</div>
        <div style={{ color: '#e53935', fontSize: '1.1rem', fontWeight: 700, lineHeight: '1.4' }}>
          {target?.name}'s next answering turn has been STOLEN.
          <br />
          <span style={{ fontSize: '0.85rem', color: '#8899aa' }}>(Their next bet result is voided to 0)</span>
        </div>
      </div>
    );
  }

  if (card.id === 'loyalty_program') {
    const partner = teams.find(t => t.id === step.sel.targetTeamId);
    return (
      <div>
        <div style={{ color: '#F5A623', fontSize: '0.85rem', marginBottom: '8px' }}>
          {team.name} — 🤝 Loyalty Program
        </div>
        <div style={{ fontSize: '4rem', marginBottom: '8px' }}>🤝</div>
        <div style={{ color: '#38bdf8', fontSize: '1.1rem', fontWeight: 700, lineHeight: '1.4' }}>
          Linked with {partner?.name}.
          <br />
          <span style={{ fontSize: '0.85rem', color: '#8899aa' }}>If both correct on next question, mystery bonus.</span>
        </div>
      </div>
    );
  }

  if (card.id === 'insurance') {
    return (
      <div>
        <div style={{ color: '#F5A623', fontSize: '0.85rem', marginBottom: '8px' }}>
          {team.name} — 🟢 Insurance
        </div>
        <div style={{ fontSize: '4rem', marginBottom: '8px' }}>🛡️</div>
        <div style={{ color: '#43a047', fontSize: '1.1rem', fontWeight: 700 }}>
          Bet protected (max 50 coins) — wrong answer = 0 loss
        </div>
      </div>
    );
  }

  if (card.id === 'complimentary') {
    return (
      <div>
        <div style={{ color: '#F5A623', fontSize: '0.85rem', marginBottom: '8px' }}>
          {team.name} — 🛎 Complimentary Service
        </div>
        <div style={{ fontSize: '4rem', marginBottom: '8px' }}>🛎️</div>
        <div style={{ color: '#F5A623', fontSize: '1.1rem', fontWeight: 700 }}>
          Second chance ready — half reward if right on retry
        </div>
      </div>
    );
  }

  if (card.id === 'doppelganger') {
    const revived = findCard(step.sel.revivedCardId);
    return (
      <div>
        <div style={{ color: '#F5A623', fontSize: '0.85rem', marginBottom: '8px' }}>
          {team.name} — 📋 Doppelganger
        </div>
        <div style={{ fontSize: '4rem', marginBottom: '8px' }}>📋</div>
        <div style={{ color: '#38bdf8', fontSize: '1.1rem', fontWeight: 700 }}>
          Revived: {revived?.emoji} {revived?.name}
        </div>
      </div>
    );
  }

  return <div style={{ color: '#8899aa' }}>{card.emoji} {card.name}</div>;
}
