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
  teamNames: ['Team 1', 'Team 2', 'Team 3', 'Team 4'],
  bets: [10, 10, 10, 10],
  doubleDownUsed: [[false, false], [false, false], [false, false], [false, false]],
  selectedOption: null,
  revealed: false,
  activeEvent: null,
  eventEffects: {
    betMultiplier: 1,
    correctBonus: 0,
    vipActive: false,
    eliminateOne: false,
  },
  eliminatedOptions: [],
  questionsAnsweredThisRound: 0,
  pendingEventTrigger: false,
  biddingDone: false,
  creditCardLoans: [0, 0, 0, 0],
  loyaltyLink: null,
};

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

function getCurrentQuestion(state) {
  return QUESTIONS[state.currentQuestionIndex];
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
        const usedCount = state.doubleDownUsed[t.id].filter(Boolean).length;
        if (!t.doubleDown && usedCount >= maxDD) return t;
        return { ...t, doubleDown: !t.doubleDown };
      });
      return { ...state, teams };
    }

    case 'ANSWER_QUESTION':
      if (state.selectedOption !== null) return state;
      return { ...state, selectedOption: action.optIdx };

    case 'REVEAL_ANSWER':
      return { ...state, revealed: true };

    case 'APPLY_RESULT': {
      const q = getCurrentQuestion(state);
      const correct = action.correct;
      const teams = state.teams.map(t => {
        let bet = t.bet;
        if (t.doubleDown) bet = bet * 2;
        let multiplier = state.eventEffects.betMultiplier;
        let bonus = correct ? state.eventEffects.correctBonus : 0;
        if (state.eventEffects.vipActive && correct) bonus += 15;

        let delta = 0;
        if (correct) {
          delta = Math.round(bet * multiplier) + bonus;
        } else {
          // check insurance
          const hasInsurance = t.powerCards.includes('insurance');
          if (hasInsurance && bet <= 50) {
            delta = 0;
          } else {
            delta = -Math.round(bet * multiplier);
          }
        }
        return { ...t, coins: Math.max(0, t.coins + delta) };
      });

      const vipActive = state.eventEffects.vipActive && !correct
        ? true
        : (state.eventEffects.vipActive ? false : state.eventEffects.vipActive);

      return {
        ...state,
        teams,
        eventEffects: { ...state.eventEffects, vipActive: false },
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
        newEventEffects = { betMultiplier: 1, correctBonus: 0, vipActive: false, eliminateOne: false };
      }

      const minBet = nextRound === 3 ? 20 : 10;
      const teams = state.teams.map(t => ({
        ...t,
        bet: Math.max(minBet, Math.min(t.coins, t.bet)),
        doubleDown: false
      }));

      let newPhase = state.phase;
      if (triggerEvent && !roundChanged) {
        newPhase = 'event';
      } else if (roundChanged && nextRound === 2 && !state.biddingDone) {
        newPhase = 'bidding';
      } else if (roundChanged) {
        newPhase = 'round_intro';
      } else {
        newPhase = 'betting';
      }

      return {
        ...state,
        currentQuestionIndex: nextIdx,
        currentRound: nextRound,
        selectedOption: null,
        revealed: false,
        eliminatedOptions: [],
        questionsAnsweredThisRound: roundChanged ? 0 : answeredThisRound,
        eventEffects: newEventEffects,
        phase: newPhase,
        teams,
      };
    }

    case 'BUY_POWER_CARD': {
      const { teamId, cardId, price } = action;
      const teams = state.teams.map(t => {
        if (t.id !== teamId) return t;
        if (t.coins < price) return t;
        if (t.powerCards.length >= 3) return t;
        return { ...t, coins: t.coins - price, powerCards: [...t.powerCards, cardId] };
      });
      return { ...state, teams };
    }

    case 'USE_POWER_CARD': {
      const { teamId, cardId } = action;
      const teams = state.teams.map(t => {
        if (t.id !== teamId) return t;
        const idx = t.powerCards.indexOf(cardId);
        if (idx === -1) return t;
        const newCards = [...t.powerCards];
        newCards.splice(idx, 1);
        return { ...t, powerCards: newCards, usedCards: [...t.usedCards, cardId] };
      });

      let updates = { teams };

      if (cardId === 'eliminate_2' || cardId === 'pms_analytics') {
        const q = getCurrentQuestion(state);
        const wrongOpts = [0, 1, 2, 3].filter(i => i !== q.ans);
        const toElim = wrongOpts.sort(() => Math.random() - 0.5).slice(0, 2);
        updates.eliminatedOptions = toElim;
      }

      if (cardId === 'all_eliminate_1') {
        updates.eventEffects = { ...state.eventEffects, eliminateOne: true };
      }

      return { ...state, ...updates };
    }

    case 'ELIMINATE_OPTION': {
      if (state.eliminatedOptions.includes(action.optIdx)) return state;
      return { ...state, eliminatedOptions: [...state.eliminatedOptions, action.optIdx] };
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
      const { event } = action;
      let teams = [...state.teams];
      let newEffects = { ...state.eventEffects };

      if (event.effect === 'highest_loses_10_others_gain_10') {
        const maxCoins = Math.max(...teams.map(t => t.coins));
        teams = teams.map(t => ({
          ...t,
          coins: Math.max(0, t.coins + (t.coins === maxCoins ? -10 : 10))
        }));
      } else if (event.effect === 'next_correct_plus_15') {
        newEffects = { ...newEffects, vipActive: true };
      } else if (event.effect === 'bets_half_one_round') {
        newEffects = { ...newEffects, betMultiplier: 0.5 };
      } else if (event.effect === 'random_team_minus_10') {
        const randIdx = Math.floor(Math.random() * teams.length);
        teams = teams.map((t, i) => i === randIdx ? { ...t, coins: Math.max(0, t.coins - 10) } : t);
      } else if (event.effect === 'correct_plus_10_one_round') {
        newEffects = { ...newEffects, correctBonus: 10 };
      } else if (event.effect === 'all_eliminate_1') {
        newEffects = { ...newEffects, eliminateOne: true };
      } else if (event.effect === 'lowest_plus_15') {
        const minCoins = Math.min(...teams.map(t => t.coins));
        teams = teams.map(t => ({
          ...t,
          coins: t.coins === minCoins ? t.coins + 15 : t.coins
        }));
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
      return { ...state, biddingDone: true, phase: 'round_intro' };

    case 'GO_TO_QUESTION':
      return { ...state, phase: 'question', selectedOption: null, revealed: false };


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
