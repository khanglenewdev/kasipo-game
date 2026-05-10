import React from 'react';
import { GameProvider, useGame } from './store/gameStore.jsx';
import CoverSlide from './components/CoverSlide.jsx';
import RulesSlide from './components/RulesSlide.jsx';
import RoundIntro from './components/RoundIntro.jsx';
import QuestionSlide from './components/QuestionSlide.jsx';
import AnswerSlide from './components/AnswerSlide.jsx';
import EndSlide from './components/EndSlide.jsx';
import BettingModal from './components/BettingModal.jsx';
import BiddingModal from './components/BiddingModal.jsx';
import RandomEventModal from './components/RandomEventModal.jsx';

function GameRouter() {
  const { state } = useGame();
  const { phase } = state;

  switch (phase) {
    case 'cover':      return <CoverSlide />;
    case 'rules1':     return <RulesSlide page={1} />;
    case 'rules2':     return <RulesSlide page={2} />;
    case 'rules3':     return <RulesSlide page={3} />;
    case 'round_intro': return <RoundIntro />;
    case 'bidding':    return <BiddingModal />;
    case 'betting':    return <BettingModal />;
    case 'question':   return <QuestionSlide />;
    case 'answer':     return <AnswerSlide />;
    case 'event':      return <RandomEventModal />;
    case 'end':        return <EndSlide />;
    default:           return <CoverSlide />;
  }
}

export default function App() {
  return (
    <GameProvider>
      <GameRouter />
    </GameProvider>
  );
}
