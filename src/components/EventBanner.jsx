import React from 'react';
import { useGame } from '../store/gameStore.jsx';

export default function EventBanner() {
  const { state } = useGame();
  const { activeEvent, eventEffects } = state;

  const hasEffect = eventEffects.betMultiplier !== 1 || eventEffects.correctBonus > 0
    || eventEffects.vipActive || eventEffects.eliminateOne;

  if (!hasEffect && !activeEvent) return null;

  const parts = [];
  if (eventEffects.vipActive) parts.push('⭐ VIP: Next correct = +15 bonus');
  if (eventEffects.betMultiplier === 0.5) parts.push('💸 Recession: Bets at 50%');
  if (eventEffects.correctBonus > 0) parts.push(`📈 Peak Season: +${eventEffects.correctBonus} per correct`);
  if (eventEffects.eliminateOne) parts.push('🤖 AI: Eliminate 1 option available');

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
      maxWidth: '640px',
      margin: '0 auto',
    }}>
      {parts.join('  |  ')}
    </div>
  );
}
