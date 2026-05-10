import React, { useEffect, useRef, useState } from 'react';

/*
  Visual-only 30s timer.
  - Resets whenever `resetKey` changes (pass currentQuestionIndex).
  - Stops counting at 0 (no game-side enforcement).
  - Pauses if `paused` is true.
  Ring around the digit depletes from full to empty over 30s.
*/
export default function QuestionTimer({ resetKey, paused = false, total = 30 }) {
  const [seconds, setSeconds] = useState(total);
  const intervalRef = useRef(null);

  // Reset on resetKey change
  useEffect(() => {
    setSeconds(total);
  }, [resetKey, total]);

  // Tick down once per second; stop at 0; pause if paused.
  useEffect(() => {
    if (paused || seconds <= 0) return;
    intervalRef.current = setInterval(() => {
      setSeconds(s => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [paused, resetKey]);

  // Stop ticking immediately when seconds hits 0
  useEffect(() => {
    if (seconds === 0 && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [seconds]);

  const SIZE = 84;
  const STROKE = 6;
  const radius = (SIZE - STROKE) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = seconds / total;
  const offset = circumference * (1 - progress);

  let ringColor = '#43a047';      // green by default
  if (seconds <= 5) ringColor = '#e53935'; // red final 5s
  else if (seconds <= 10) ringColor = '#F5A623'; // gold low

  return (
    <div
      style={{
        position: 'fixed',
        top: 64,           // sits below the question header bar
        right: 16,
        zIndex: 80,
        background: 'rgba(10,21,37,0.85)',
        backdropFilter: 'blur(4px)',
        borderRadius: '50%',
        boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
        width: SIZE,
        height: SIZE,
      }}
    >
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        {/* Track */}
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={radius}
          fill="transparent"
          stroke="#2a3548"
          strokeWidth={STROKE}
        />
        {/* Progress (stroke depletes counter-clockwise as time runs out) */}
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={radius}
          fill="transparent"
          stroke={ringColor}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
          style={{
            transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease',
            filter: seconds <= 5 ? `drop-shadow(0 0 6px ${ringColor})` : 'none',
          }}
        />
        {/* Number */}
        <text
          x={SIZE / 2}
          y={SIZE / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fill="#fff"
          fontSize="26"
          fontWeight="900"
          style={{ fontFamily: 'inherit' }}
        >
          {seconds}
        </text>
      </svg>
    </div>
  );
}
