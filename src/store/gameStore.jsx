import React, { createContext, useContext, useReducer } from 'react';
import { QUESTIONS } from '../data/questions.js';

const initialTeams = [
  { id: 0, name: 'Team 1', coins: 100, loan: 0, powerCards: [], usedCards: [], bet: 10, doubleDown: false },
  { id: 1, name: 'Team 2', coins: 100, loan: 0, powerCards: [], usedCards: [], bet: 10, doubleDown: false },
  { id: 2, name: 'Team 3', coins: 100, loan: 0, powerCards: [], usedCards: [], bet: 10, doubleDown: false },
  { id: 3, name: 'Team 4', coins: 100, loan: 0, powerCards: [], usedCards: [], bet: 10, doubleDown: false },
];

const initialState = {
  phase: 'cover',
  currentRound: 1,
  currentQuestionIndex: 0,
  teams: initialTeams,
  bets: [10, 10, 10, 10],
  doubleDownUsed: [[], [], [], []],

  // Per-team answer assignments for the current question.
  // teamAnswers[teamId] = optionIdx (0–3) or null
  teamAnswers: { 0: null, 1: null, 2: null, 3: null },
  // Per-team result after Apply: 'correct' | 'wrong' | 'pending_retry' | 'correct_retry' | null
  teamResults: { 0: null, 1: null, 2: null, 3: null },

  revealed: false,
  activeEvent: null,
  eventEffects: {
    betMultiplier: 1,
    betMultiplierExpiresAfterRound: null,  // round number (inclusive) where this still applies
    correctBonus: 0,
    correctBonusExpiresAfterRound: null,
    vipActive: false,                       // one-shot, consumed by next correct answer
    aiPendingEliminate: false,              // Penguin AI: auto-eliminate 1 wrong on next question
  },
  eliminatedOptions: [],
  questionsAnsweredThisRound: 0,
  biddingDone: false,
  r3ReuseDone: false,
  r3ReusedTeams: [],

  // Power card runtime state
  pendingInsurance: [],          // teamIds protected for current question
  pendingSecondChance: [],       // teamIds with second-chance card armed
  retryTeams: [],                // teams currently mid-retry (host opened the retry panel for them)
  loyaltyLink: null,             // { fromTeamId, partnerTeamId } - applies to NEXT question
  loyaltyConsumed: false,
  stolenTurns: [],               // [{ targetTeamId, byTeamId }]
  stolenAppliedThisQuestion: [],

  powerLog: [],
};

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

function getCurrentQuestion(state) {
  return QUESTIONS[state.currentQuestionIndex];
}

function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function pushLog(state, entry) {
  return [...state.powerLog, { id: newId(), ts: Date.now(), ...entry }];
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_PHASE':
      return { ...state, phase: action.phase };

    case 'SET_TEAM_NAME': {
      const teams = state.teams.map(t =>
        t.id === action.teamId ? { ...t, name: action.name } : t
      );
      return { ...state, teams };
    }

    case 'SET_BET': {
      const teams = state.teams.map(t => {
        if (t.id !== action.teamId) return t;
        const minBet = state.currentRound === 3 ? 20 : 10;
        const bet = clamp(action.bet, minBet, t.coins);
        return { ...t, bet };
      });
      return { ...state, teams };
    }

    case 'TOGGLE_DOUBLE_DOWN': {
      const teams = state.teams.map(t => {
        if (t.id !== action.teamId) return t;
        const maxDD = state.currentRound === 3 ? 3 : 2;
        const usedCount = state.doubleDownUsed[t.id]?.length || 0;
        if (!t.doubleDown && usedCount >= maxDD) return t;
        return { ...t, doubleDown: !t.doubleDown };
      });
      return { ...state, teams };
    }

    case 'SET_TEAM_ANSWER': {
      // Assign a team to an option for the current question.
      // Pass optIdx: null to clear the team's pick.
      const { teamId, optIdx } = action;
      if (state.revealed) return state;
      return {
        ...state,
        teamAnswers: { ...state.teamAnswers, [teamId]: optIdx },
      };
    }

    case 'CLEAR_TEAM_ANSWER': {
      const { teamId } = action;
      return {
        ...state,
        teamAnswers: { ...state.teamAnswers, [teamId]: null },
      };
    }

    case 'REVEAL_ANSWER':
      return { ...state, revealed: true };

    case 'APPLY_RESULT': {
      // Per-team result computation.
      // For each team:
      //   * If their turn was stolen → result 'wrong' visually, delta 0
      //   * If their pick === q.ans → result 'correct', delta +bet*mult + bonuses
      //   * If their pick !== q.ans:
      //       - second-chance armed → result 'pending_retry', delta 0 (defer)
      //       - else insurance armed & bet ≤ 50 → result 'wrong', delta 0
      //       - else result 'wrong', delta -bet*mult
      //   * If they didn't pick → treat as wrong (no answer = no win)
      const q = QUESTIONS[state.currentQuestionIndex];
      const correctOpt = q.ans;
      const stolenTargetIds = state.stolenTurns.map(s => s.targetTeamId);
      const multiplier = state.eventEffects.betMultiplier;

      // Pre-compute correctness map so loyalty bonus has access to both teams' state
      const correctness = {};
      state.teams.forEach(t => {
        const pick = state.teamAnswers[t.id];
        correctness[t.id] = pick !== null && pick === correctOpt;
      });

      const newResults = { ...state.teamResults };
      const teams = state.teams.map(t => {
        const stolen = stolenTargetIds.includes(t.id);
        if (stolen) {
          newResults[t.id] = 'wrong';
          return t; // delta 0
        }

        // Unpicked team: skip entirely (host can come back and assign before next question)
        if (state.teamAnswers[t.id] === null || state.teamAnswers[t.id] === undefined) {
          newResults[t.id] = null;
          return t;
        }

        const isCorrect = correctness[t.id];
        let bet = t.bet;
        if (t.doubleDown) bet = bet * 2;

        if (isCorrect) {
          let bonus = state.eventEffects.correctBonus;
          if (state.eventEffects.vipActive) bonus += 15;
          if (
            state.loyaltyLink &&
            !state.loyaltyConsumed &&
            (t.id === state.loyaltyLink.fromTeamId || t.id === state.loyaltyLink.partnerTeamId)
          ) {
            const partnerId = t.id === state.loyaltyLink.fromTeamId
              ? state.loyaltyLink.partnerTeamId
              : state.loyaltyLink.fromTeamId;
            if (correctness[partnerId]) bonus += 30;
          }
          // Multiplier (e.g. Recession 0.5×) applies to the WHOLE reward, including
          // Peak Season / VIP / Loyalty bonuses — not just the bet.
          const delta = Math.round((bet + bonus) * multiplier);
          newResults[t.id] = 'correct';
          return { ...t, coins: Math.max(0, t.coins + delta) };
        }

        // Wrong (or no pick)
        if (state.pendingSecondChance.includes(t.id)) {
          newResults[t.id] = 'pending_retry';
          return t;
        }
        if (state.pendingInsurance.includes(t.id) && bet <= 50) {
          newResults[t.id] = 'wrong';
          return t;
        }
        const delta = -Math.round(bet * multiplier);
        newResults[t.id] = 'wrong';
        return { ...t, coins: Math.max(0, t.coins + delta) };
      });

      const stolenAppliedThisQuestion = [...stolenTargetIds];
      // Loyalty link is consumed once it has had the chance to apply (any team correct or not).
      const loyaltyConsumed = !!state.loyaltyLink;

      // VIP: consumed if any team was correct, persists otherwise.
      const anyCorrect = state.teams.some(t => correctness[t.id]);
      const vipActive = state.eventEffects.vipActive && !anyCorrect;

      return {
        ...state,
        teams,
        teamResults: newResults,
        revealed: true,
        eventEffects: { ...state.eventEffects, vipActive },
        stolenAppliedThisQuestion,
        loyaltyConsumed,
      };
    }

    case 'START_RETRY_FOR_TEAM': {
      // Open retry mode for a specific team. Wipes their prior answer so they can re-pick.
      const { teamId } = action;
      return {
        ...state,
        teamAnswers: { ...state.teamAnswers, [teamId]: null },
        retryTeams: state.retryTeams.includes(teamId) ? state.retryTeams : [...state.retryTeams, teamId],
      };
    }

    case 'APPLY_RETRY_RESULT': {
      // Resolve a single team's retry. correctness comes from their teamAnswers vs q.ans.
      const { teamId } = action;
      const q = QUESTIONS[state.currentQuestionIndex];
      const correctOpt = q.ans;
      const pick = state.teamAnswers[teamId];
      const isCorrect = pick !== null && pick === correctOpt;

      const teams = state.teams.map(t => {
        if (t.id !== teamId) return t;
        let bet = t.bet;
        if (t.doubleDown) bet = bet * 2;
        const multiplier = state.eventEffects.betMultiplier;
        let delta = 0;
        if (isCorrect) {
          // half reward on retry
          delta = Math.round(bet * multiplier * 0.5);
        } else {
          if (state.pendingInsurance.includes(t.id) && bet <= 50) {
            delta = 0;
          } else {
            delta = -Math.round(bet * multiplier);
          }
        }
        return { ...t, coins: Math.max(0, t.coins + delta) };
      });

      return {
        ...state,
        teams,
        teamResults: {
          ...state.teamResults,
          [teamId]: isCorrect ? 'correct_retry' : 'wrong',
        },
        retryTeams: state.retryTeams.filter(id => id !== teamId),
      };
    }

    case 'FORFEIT_RETRY_FOR_TEAM': {
      // Team chose to skip retry → take the full loss now.
      const { teamId } = action;
      const teams = state.teams.map(t => {
        if (t.id !== teamId) return t;
        let bet = t.bet;
        if (t.doubleDown) bet = bet * 2;
        const multiplier = state.eventEffects.betMultiplier;
        let delta;
        if (state.pendingInsurance.includes(t.id) && bet <= 50) {
          delta = 0;
        } else {
          delta = -Math.round(bet * multiplier);
        }
        return { ...t, coins: Math.max(0, t.coins + delta) };
      });
      return {
        ...state,
        teams,
        teamResults: { ...state.teamResults, [teamId]: 'wrong' },
        retryTeams: state.retryTeams.filter(id => id !== teamId),
      };
    }

    case 'NEXT_QUESTION': {
      const nextIdx = state.currentQuestionIndex + 1;
      if (nextIdx >= QUESTIONS.length) {
        return { ...state, phase: 'end' };
      }
      const nextQ = QUESTIONS[nextIdx];
      const nextRound = nextQ.round;
      const roundChanged = nextRound !== state.currentRound;

      const answeredThisRound = state.questionsAnsweredThisRound + 1;
      const triggerEvent = answeredThisRound % 2 === 0;

      let newEventEffects = { ...state.eventEffects };
      if (roundChanged) {
        // Selectively expire effects based on their declared expiry round.
        if (
          newEventEffects.betMultiplierExpiresAfterRound !== null &&
          nextRound > newEventEffects.betMultiplierExpiresAfterRound
        ) {
          newEventEffects.betMultiplier = 1;
          newEventEffects.betMultiplierExpiresAfterRound = null;
        }
        if (
          newEventEffects.correctBonusExpiresAfterRound !== null &&
          nextRound > newEventEffects.correctBonusExpiresAfterRound
        ) {
          newEventEffects.correctBonus = 0;
          newEventEffects.correctBonusExpiresAfterRound = null;
        }
        // VIP is one-shot (consumed by next correct), keep it.
        // aiPendingEliminate cleared whenever consumed by Penguin AI handler.
      }

      const minBet = nextRound === 3 ? 20 : 10;
      const teams = state.teams.map(t => ({
        ...t,
        bet: Math.max(minBet, Math.min(t.coins, t.bet)),
        doubleDown: false,
      }));

      let newPhase;
      if (triggerEvent && !roundChanged) {
        newPhase = 'event';
      } else if (roundChanged) {
        // Always show RoundIntro first; the intro's Begin button routes to
        // bidding (R2) / r3_reuse (R3) / betting (R1).
        newPhase = 'round_intro';
      } else {
        newPhase = 'betting';
      }

      // Clear per-question power state. Stolen turns: only carry NEW ones. Already-applied are dropped.
      const newStolenTurns = state.stolenTurns.filter(s =>
        !state.stolenAppliedThisQuestion.includes(s.targetTeamId)
      );

      return {
        ...state,
        currentQuestionIndex: nextIdx,
        currentRound: nextRound,
        teamAnswers: { 0: null, 1: null, 2: null, 3: null },
        teamResults: { 0: null, 1: null, 2: null, 3: null },
        revealed: false,
        eliminatedOptions: [],
        questionsAnsweredThisRound: roundChanged ? 0 : answeredThisRound,
        eventEffects: newEventEffects,
        phase: newPhase,
        teams,
        pendingInsurance: [],
        pendingSecondChance: [],
        retryTeams: [],
        loyaltyLink: state.loyaltyConsumed ? null : state.loyaltyLink,
        loyaltyConsumed: false,
        stolenTurns: newStolenTurns,
        stolenAppliedThisQuestion: [],
      };
    }

    case 'BUY_POWER_CARD': {
      const { teamId, cardId, price } = action;
      const teams = state.teams.map(t => {
        if (t.id !== teamId) return t;
        if (t.coins < price) return t;
        if (t.powerCards.length >= 3) return t;
        if (t.powerCards.includes(cardId)) return t;
        return { ...t, coins: t.coins - price, powerCards: [...t.powerCards, cardId] };
      });
      return { ...state, teams };
    }

    case 'REFUND_POWER_CARD': {
      const { teamId, cardId, price } = action;
      const teams = state.teams.map(t => {
        if (t.id !== teamId) return t;
        if (!t.powerCards.includes(cardId)) return t;
        const newCards = t.powerCards.filter(c => c !== cardId);
        return { ...t, coins: t.coins + price, powerCards: newCards };
      });
      return { ...state, teams };
    }

    // Generic: move card from powerCards -> usedCards. Used by simple effects.
    case 'CONSUME_CARD': {
      const { teamId, cardId } = action;
      const teams = state.teams.map(t => {
        if (t.id !== teamId) return t;
        const idx = t.powerCards.indexOf(cardId);
        if (idx === -1) return t;
        const newCards = [...t.powerCards];
        newCards.splice(idx, 1);
        return { ...t, powerCards: newCards, usedCards: [...t.usedCards, cardId] };
      });
      return { ...state, teams };
    }

    // Power declarations (made during PowerCardModal "Apply All")
    case 'DECLARE_INSURANCE': {
      const { teamId } = action;
      return {
        ...state,
        pendingInsurance: [...state.pendingInsurance, teamId],
        powerLog: pushLog(state, { teamId, cardId: 'insurance', label: '🟢 Insurance armed' }),
      };
    }
    case 'DECLARE_SECOND_CHANCE': {
      const { teamId } = action;
      return {
        ...state,
        pendingSecondChance: [...state.pendingSecondChance, teamId],
        powerLog: pushLog(state, { teamId, cardId: 'complimentary', label: '🛎 Complimentary Service ready' }),
      };
    }
    case 'DECLARE_LOYALTY': {
      const { teamId, partnerTeamId } = action;
      return {
        ...state,
        loyaltyLink: { fromTeamId: teamId, partnerTeamId },
        loyaltyConsumed: false,
        powerLog: pushLog(state, { teamId, cardId: 'loyalty_program', label: `🤝 Loyalty linked with Team ${partnerTeamId + 1}` }),
      };
    }
    case 'DECLARE_STEAL': {
      const { byTeamId, targetTeamId } = action;
      return {
        ...state,
        stolenTurns: [...state.stolenTurns, { byTeamId, targetTeamId }],
        powerLog: pushLog(state, { teamId: byTeamId, cardId: 'system_error', label: `🔴 System Error → stole Team ${targetTeamId + 1}'s next turn` }),
      };
    }
    case 'DECLARE_PMS_ANALYTICS': {
      const { teamId } = action;
      const q = getCurrentQuestion(state);
      const wrongOpts = [0, 1, 2, 3].filter(i => i !== q.ans && !state.eliminatedOptions.includes(i));
      const toElim = wrongOpts.sort(() => Math.random() - 0.5).slice(0, 2);
      return {
        ...state,
        eliminatedOptions: [...state.eliminatedOptions, ...toElim],
        powerLog: pushLog(state, { teamId, cardId: 'pms_analytics', label: '📊 PMS Analytics — 2 options eliminated' }),
      };
    }
    case 'APPLY_GACHA_RESULT': {
      const { teamId, win } = action;
      const delta = win ? 50 : -50;
      const teams = state.teams.map(t =>
        t.id === teamId ? { ...t, coins: Math.max(0, t.coins + delta) } : t
      );
      return {
        ...state,
        teams,
        powerLog: pushLog(state, { teamId, cardId: 'gacha', label: win ? '🎰 Ga Cha — HUGE PROFIT +50!' : '🎰 Ga Cha — Market crash -50' }),
      };
    }
    case 'APPLY_ROULETTE_RESULT': {
      const { teamId, survived, chambers } = action;
      const delta = survived ? chambers * 10 : 0;
      const teams = state.teams.map(t =>
        t.id === teamId ? { ...t, coins: Math.max(0, t.coins + delta) } : t
      );
      return {
        ...state,
        teams,
        powerLog: pushLog(state, {
          teamId,
          cardId: 'russian_roulette',
          label: survived
            ? `📞 Roulette — survived ${chambers} chambers (+${delta})`
            : `📞 Roulette — eliminated at chamber ${chambers + 1} (turn lost)`,
        }),
      };
    }
    case 'APPLY_DOPPELGANGER': {
      // Restore a previously used card AND consume the doppelganger card itself.
      // The flow:
      //   1) consume 'doppelganger' from powerCards -> usedCards
      //   2) take revivedCardId from usedCards -> powerCards (gives the team a fresh copy)
      const { teamId, revivedCardId } = action;
      const teams = state.teams.map(t => {
        if (t.id !== teamId) return t;
        let powerCards = [...t.powerCards];
        let usedCards = [...t.usedCards];

        // remove doppelganger from powerCards, add to usedCards
        const dgIdx = powerCards.indexOf('doppelganger');
        if (dgIdx !== -1) {
          powerCards.splice(dgIdx, 1);
          usedCards.push('doppelganger');
        }
        // remove revivedCardId from usedCards (one occurrence) and add to powerCards
        const rIdx = usedCards.indexOf(revivedCardId);
        if (rIdx !== -1) {
          usedCards.splice(rIdx, 1);
          powerCards.push(revivedCardId);
        }
        return { ...t, powerCards, usedCards };
      });
      return {
        ...state,
        teams,
        powerLog: pushLog(state, { teamId, cardId: 'doppelganger', label: `📋 Doppelganger — revived ${revivedCardId}` }),
      };
    }

    case 'ELIMINATE_OPTION': {
      if (state.eliminatedOptions.includes(action.optIdx)) return state;
      return { ...state, eliminatedOptions: [...state.eliminatedOptions, action.optIdx] };
    }

    case 'CONSUME_AI_ELIMINATE': {
      // Penguin AI auto-eliminate has fired; clear the pending flag.
      return {
        ...state,
        eventEffects: { ...state.eventEffects, aiPendingEliminate: false },
      };
    }

    case 'TAKE_LOAN': {
      const { teamId, amount } = action;
      const teams = state.teams.map(t => {
        if (t.id !== teamId) return t;
        const maxLoan = 50 - t.loan;
        const actual = Math.min(amount, maxLoan);
        if (actual <= 0) return t;
        return { ...t, coins: t.coins + actual, loan: t.loan + actual };
      });
      return { ...state, teams };
    }

    case 'APPLY_RANDOM_EVENT': {
      // For team-targeted events, the modal pre-resolves a targetTeamId via the wheel
      // animation and passes it here so the apply matches the visual landing exactly.
      const { event, targetTeamId } = action;
      let teams = [...state.teams];
      let newEffects = { ...state.eventEffects };

      if (event.effect === 'highest_loses_10_others_gain_10') {
        // If the wheel landed on a specific team, that single team loses; others gain.
        // Otherwise (legacy / no wheel), all tied highest teams lose.
        if (targetTeamId !== undefined && targetTeamId !== null) {
          teams = teams.map(t => ({
            ...t,
            coins: Math.max(0, t.coins + (t.id === targetTeamId ? -10 : 10)),
          }));
        } else {
          const maxCoins = Math.max(...teams.map(t => t.coins));
          teams = teams.map(t => ({
            ...t,
            coins: Math.max(0, t.coins + (t.coins === maxCoins ? -10 : 10)),
          }));
        }
      } else if (event.effect === 'next_correct_plus_15') {
        newEffects = { ...newEffects, vipActive: true };
      } else if (event.effect === 'bets_half_one_round') {
        // Lasts only the current round (inclusive). Cleared at next round change.
        newEffects = {
          ...newEffects,
          betMultiplier: 0.5,
          betMultiplierExpiresAfterRound: state.currentRound,
        };
      } else if (event.effect === 'random_team_minus_10') {
        const tid = targetTeamId !== undefined && targetTeamId !== null
          ? targetTeamId
          : Math.floor(Math.random() * teams.length);
        teams = teams.map(t =>
          t.id === tid ? { ...t, coins: Math.max(0, t.coins - 10) } : t
        );
      } else if (event.effect === 'correct_plus_10_one_round') {
        // Peak Season lasts 3 rounds, but capped at the final round (3) so the
        // "rounds left" countdown reflects the actual remaining game time.
        newEffects = {
          ...newEffects,
          correctBonus: 10,
          correctBonusExpiresAfterRound: Math.min(3, state.currentRound + 2),
        };
      } else if (event.effect === 'all_eliminate_1') {
        // Penguin AI: arms a one-shot auto-eliminate for the next question.
        newEffects = { ...newEffects, aiPendingEliminate: true };
      } else if (event.effect === 'lowest_plus_15') {
        if (targetTeamId !== undefined && targetTeamId !== null) {
          teams = teams.map(t =>
            t.id === targetTeamId ? { ...t, coins: t.coins + 15 } : t
          );
        } else {
          const minCoins = Math.min(...teams.map(t => t.coins));
          teams = teams.map(t => ({
            ...t,
            coins: t.coins === minCoins ? t.coins + 15 : t.coins,
          }));
        }
      }

      return { ...state, teams, eventEffects: newEffects, activeEvent: event };
    }

    case 'CLEAR_EVENT':
      return { ...state, activeEvent: null, phase: 'betting' };

    case 'END_ROUND': {
      const teams = state.teams.map(t => {
        if (t.loan <= 0) return t;
        const interest = Math.round(t.loan * 1.2);
        return { ...t, coins: Math.max(0, t.coins - interest), loan: 0 };
      });
      return { ...state, teams };
    }

    case 'SET_BIDDING_DONE':
      return { ...state, biddingDone: true, phase: 'betting' };

    case 'GO_TO_QUESTION': {
      // Mark the double-downs that were committed for this question
      const ddUsed = state.doubleDownUsed.map((arr, idx) => {
        const team = state.teams[idx];
        if (team.doubleDown) {
          return [...arr, state.currentQuestionIndex];
        }
        return arr;
      });
      return {
        ...state,
        phase: 'question',
        teamAnswers: { 0: null, 1: null, 2: null, 3: null },
        teamResults: { 0: null, 1: null, 2: null, 3: null },
        revealed: false,
        doubleDownUsed: ddUsed,
      };
    }

    case 'R3_REUSE_CARD': {
      const { teamId, cardId } = action;
      // Allow team to revive ONE used card. Card moves usedCards -> powerCards.
      const teams = state.teams.map(t => {
        if (t.id !== teamId) return t;
        if (state.r3ReusedTeams.includes(teamId)) return t;
        const usedIdx = t.usedCards.indexOf(cardId);
        if (usedIdx === -1) return t;
        const usedCards = [...t.usedCards];
        usedCards.splice(usedIdx, 1);
        return { ...t, usedCards, powerCards: [...t.powerCards, cardId] };
      });
      return {
        ...state,
        teams,
        r3ReusedTeams: [...state.r3ReusedTeams, teamId],
      };
    }

    case 'SET_R3_REUSE_DONE':
      return { ...state, r3ReuseDone: true, phase: 'betting' };

    case '_ADJUST_COINS': {
      const teams = state.teams.map(t =>
        t.id === action.teamId ? { ...t, coins: Math.max(0, t.coins + action.delta) } : t
      );
      return { ...state, teams };
    }

    default:
      return state;
  }
}

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  return useContext(GameContext);
}

export { QUESTIONS };
