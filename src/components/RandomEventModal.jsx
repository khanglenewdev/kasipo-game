import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../store/gameStore.jsx';
import { RANDOM_EVENTS } from '../data/randomEvents.js';
import { TEAM_COLORS, WRONG_BORDER } from '../data/teamColors.js';

// Events that pick a specific team get a wheel animation.
const TARGETED_EFFECTS = {
  random_team_minus_10: {
    pickTarget: (teams) => teams[Math.floor(Math.random() * teams.length)].id,
    deltaForTarget: -10,
    deltaForOthers: 0,
    label: '-10 coins',
    color: WRONG_BORDER,
  },
  highest_loses_10_others_gain_10: {
    pickTarget: (teams) => {
      const max = Math.max(...teams.map(t => t.coins));
      const tied = teams.filter(t => t.coins === max);
      return tied[Math.floor(Math.random() * tied.length)].id;
    },
    deltaForTarget: -10,
    deltaForOthers: +10,
    label: '-10 (rest +10)',
    color: WRONG_BORDER,
  },
  lowest_plus_15: {
    pickTarget: (teams) => {
      const min = Math.min(...teams.map(t => t.coins));
      const tied = teams.filter(t => t.coins === min);
      return tied[Math.floor(Math.random() * tied.length)].id;
    },
    deltaForTarget: +15,
    deltaForOthers: 0,
    label: '+15 coins',
    color: '#43a047',
  },
};

export default function RandomEventModal() {
  const { state, dispatch } = useGame();
  const { teams } = state;

  const [phase, setPhase] = useState('emoji_spin'); // emoji_spin | event_shown | team_wheel | target_revealed
  const [event, setEvent] = useState(null);
  const [emojiSpinIdx, setEmojiSpinIdx] = useState(0);
  const [wheelIdx, setWheelIdx] = useState(0);
  const [targetTeamId, setTargetTeamId] = useState(null);

  // Phase 1: Emoji spinner picks the event
  useEffect(() => {
    if (phase !== 'emoji_spin') return;
    let count = 0;
    const total = 20;
    const interval = setInterval(() => {
      setEmojiSpinIdx(Math.floor(Math.random() * RANDOM_EVENTS.length));
      count++;
      if (count >= total) {
        clearInterval(interval);
        const picked = RANDOM_EVENTS[Math.floor(Math.random() * RANDOM_EVENTS.length)];
        setEvent(picked);
        setPhase('event_shown');
      }
    }, 100);
    return () => clearInterval(interval);
  }, [phase]);

  function handleStartWheel() {
    if (!event) return;
    const cfg = TARGETED_EFFECTS[event.effect];
    if (!cfg) return;
    const target = cfg.pickTarget(teams);
    setTargetTeamId(target);
    setPhase('team_wheel');
  }

  // Phase 3: Team wheel animation
  useEffect(() => {
    if (phase !== 'team_wheel') return;
    if (targetTeamId === null) return;

    // Plan: cycle through teams in fixed order, slowing down. Stop on target.
    // Extended to ~9s total for dramatic suspense (was ~3s).
    const startIdx = wheelIdx;
    const offset = ((targetTeamId - startIdx) % teams.length + teams.length) % teams.length;
    const totalTicks = 28 + offset;
    let tick = 0;
    let cancelled = false;

    function step() {
      if (cancelled) return;
      setWheelIdx(prev => (prev + 1) % teams.length);
      tick++;
      if (tick >= totalTicks) {
        setPhase('target_revealed');
        return;
      }
      // Easing: starts fast (~80ms), ends slow (~900ms) for tense slowdown.
      const progress = tick / totalTicks;
      const delay = 80 + Math.pow(progress, 3) * 820;
      setTimeout(step, delay);
    }
    setTimeout(step, 80);
    return () => { cancelled = true; };
  }, [phase, targetTeamId]);

  function handleApply() {
    if (event) {
      dispatch({ type: 'APPLY_RANDOM_EVENT', event, targetTeamId });
      dispatch({ type: 'CLEAR_EVENT' });
    }
  }

  const cfg = event ? TARGETED_EFFECTS[event.effect] : null;
  const isTargeted = !!cfg;
  const displayEvent = phase === 'emoji_spin' ? RANDOM_EVENTS[emojiSpinIdx] : event;

  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ textAlign: 'center', maxWidth: '560px' }}>
        <div style={{ color: '#F5A623', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '2px', marginBottom: '16px' }}>
          RANDOM EVENT
        </div>

        {/* Emoji + name */}
        <div style={{
          fontSize: phase === 'emoji_spin' ? '4rem' : '3rem',
          marginBottom: '12px',
          animation: phase === 'emoji_spin' ? 'spin 0.5s linear infinite' : 'none',
          display: 'inline-block',
        }}>
          {displayEvent ? displayEvent.emoji : '🎲'}
        </div>

        {phase === 'emoji_spin' && (
          <div style={{ color: '#8899aa', fontSize: '1.1rem', marginBottom: '24px' }}>
            Spinning...
          </div>
        )}

        {phase !== 'emoji_spin' && event && (
          <div className="fade-in">
            <h2 style={{ color: '#F5A623', fontSize: '1.4rem', marginBottom: '8px' }}>
              {event.name}
            </h2>
            <p style={{ color: '#d0dde8', fontSize: '0.95rem', marginBottom: '16px', lineHeight: '1.5' }}>
              {event.desc}
            </p>

            {/* Team wheel for targeted events */}
            {isTargeted && (phase === 'team_wheel' || phase === 'target_revealed') && (
              <div style={{
                background: '#0a1525',
                border: `2px solid ${cfg.color}`,
                borderRadius: '12px',
                padding: '14px',
                marginBottom: '16px',
              }}>
                <div style={{
                  color: cfg.color,
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  letterSpacing: '1px',
                  marginBottom: '10px',
                }}>
                  {phase === 'team_wheel' ? 'PICKING TARGET TEAM…' : 'TARGET LOCKED'}
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '8px',
                }}>
                  {teams.map((t, idx) => {
                    const isHighlighted = phase === 'team_wheel' ? wheelIdx === idx : t.id === targetTeamId;
                    const isTarget = phase === 'target_revealed' && t.id === targetTeamId;
                    const isOther = phase === 'target_revealed' && t.id !== targetTeamId;
                    const teamColor = TEAM_COLORS[idx % 4];

                    let border, bg, glow;
                    if (isHighlighted && phase === 'team_wheel') {
                      border = teamColor;
                      bg = '#1a2540';
                      glow = `0 0 16px ${teamColor}aa`;
                    } else if (isTarget) {
                      border = cfg.color;
                      bg = cfg.color === WRONG_BORDER ? '#3a1010' : '#1a4020';
                      glow = `0 0 18px ${cfg.color}cc`;
                    } else if (isOther && cfg.deltaForOthers !== 0) {
                      border = '#43a047';
                      bg = '#1a4020';
                      glow = '0 0 8px #43a04766';
                    } else {
                      border = '#2a3548';
                      bg = '#0f1a2e';
                      glow = 'none';
                    }

                    return (
                      <div
                        key={t.id}
                        style={{
                          background: bg,
                          border: `2px solid ${border}`,
                          borderRadius: '8px',
                          padding: '8px 4px',
                          boxShadow: glow,
                          transition: 'all 0.1s',
                          transform: isHighlighted ? 'scale(1.06)' : 'scale(1)',
                        }}
                      >
                        <div style={{
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          color: isTarget ? cfg.color : isOther && cfg.deltaForOthers !== 0 ? '#43a047' : teamColor,
                          marginBottom: '2px',
                        }}>
                          {t.name}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#8899aa' }}>
                          💰 {t.coins}
                        </div>
                        {isTarget && (
                          <div style={{
                            fontSize: '0.78rem',
                            fontWeight: 900,
                            color: cfg.color,
                            marginTop: '4px',
                          }}>
                            {cfg.deltaForTarget > 0 ? `+${cfg.deltaForTarget}` : cfg.deltaForTarget}
                          </div>
                        )}
                        {isOther && cfg.deltaForOthers !== 0 && (
                          <div style={{
                            fontSize: '0.78rem',
                            fontWeight: 900,
                            color: '#43a047',
                            marginTop: '4px',
                          }}>
                            +{cfg.deltaForOthers}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Non-targeted events: simple effect preview */}
            {!isTargeted && phase === 'event_shown' && (
              <div style={{
                background: '#1a2a45',
                border: '1px solid #38bdf8',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '16px',
              }}>
                <div style={{ fontSize: '0.85rem', color: '#38bdf8' }}>
                  Effect applies to upcoming questions this round
                </div>
              </div>
            )}

            {/* Action buttons */}
            {phase === 'event_shown' && isTargeted && (
              <button
                className="btn-gold"
                onClick={handleStartWheel}
                style={{ fontSize: '1.05rem', padding: '12px 32px' }}
              >
                🎯 Spin Team Wheel →
              </button>
            )}
            {phase === 'event_shown' && !isTargeted && (
              <button
                className="btn-gold"
                onClick={handleApply}
                style={{ fontSize: '1.05rem', padding: '12px 32px' }}
              >
                Apply Effect →
              </button>
            )}
            {phase === 'target_revealed' && (
              <button
                className="btn-gold"
                onClick={handleApply}
                style={{ fontSize: '1.05rem', padding: '12px 32px' }}
              >
                Apply Effect →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
