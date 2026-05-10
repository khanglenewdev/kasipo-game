import React from 'react';
import { useGame } from '../store/gameStore.jsx';

export default function EventBanner() {
  const { state } = useGame();
  const { activeEvent, eventEffects, currentRound } = state;

  const parts = [];
  if (eventEffects.vipActive) parts.push('⭐ VIP: Next correct = +15 bonus');
  if (eventEffects.betMultiplier === 0.5) {
    const expires = eventEffects.betMultiplierExpiresAfterRound;
    parts.push(`💸 Recession: rewards ×0.5${expires !== null ? ` (until end of R${expires})` : ''}`);
  }
  if (eventEffects.correctBonus > 0) {
    const expires = eventEffects.correctBonusExpiresAfterRound;
    const roundsLeft = expires !== null ? Math.max(0, expires - currentRound + 1) : null;
    parts.push(`📈 Peak Season: +${eventEffects.correctBonus} per correct${roundsLeft !== null ? ` (${roundsLeft} round${roundsLeft !== 1 ? 's' : ''} left)` : ''}`);
  }
  if (eventEffects.aiPendingEliminate) parts.push('🤖 AI armed: next question gets 1 wrong answer auto-eliminated');

  if (!activeEvent && parts.length === 0) return null;
  if (parts.length === 0) return null;

  return (
    <div style={{
      background: '#1a2540',
      border: '1px solid #F5A623',
      borderRadius: '8px',
      padding: '8px 14px',
      textAlign: 'center',
      fontSize: '0.82rem',
      color: '#F5A623',
      width: '100%',
      maxWidth: '720px',
      margin: '0 auto',
    }}>
      {parts.join('  |  ')}
    </div>
  );
}
