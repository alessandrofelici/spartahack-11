import { useReducer, useCallback } from 'react';
import { STAGES } from '../constants/stages';
import type { StageConfig } from '../constants/stages';

export type GameStage = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface GameState {
  stage: GameStage;
  isAnimating: boolean;
  currentConfig: StageConfig;
  questionAnswered: boolean;
  isComplete: boolean;
}

type GameAction =
  | { type: 'NEXT_STAGE' }
  | { type: 'ANSWER_QUESTION' }
  | { type: 'START_ANIMATION' }
  | { type: 'END_ANIMATION' }
  | { type: 'RESET' };

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'NEXT_STAGE': {
      if (state.isAnimating) return state;

      // If there's a question and it hasn't been answered, don't advance
      if (state.currentConfig.question && !state.questionAnswered) {
        return state;
      }

      if (state.stage >= 10) {
        return { ...state, isComplete: true };
      }

      const newStage = (state.stage + 1) as GameStage;
      return {
        ...state,
        stage: newStage,
        currentConfig: STAGES[newStage - 1],
        isAnimating: true,
        questionAnswered: false,
      };
    }

    case 'ANSWER_QUESTION':
      return { ...state, questionAnswered: true };

    case 'START_ANIMATION':
      return { ...state, isAnimating: true };

    case 'END_ANIMATION':
      return { ...state, isAnimating: false };

    case 'RESET':
      return {
        stage: 1,
        isAnimating: false,
        currentConfig: STAGES[0],
        questionAnswered: false,
        isComplete: false,
      };

    default:
      return state;
  }
}

const initialState: GameState = {
  stage: 1,
  isAnimating: false,
  currentConfig: STAGES[0],
  questionAnswered: false,
  isComplete: false,
};

export function useGameState() {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const nextStage = useCallback(() => {
    dispatch({ type: 'NEXT_STAGE' });
  }, []);

  const answerQuestion = useCallback(() => {
    dispatch({ type: 'ANSWER_QUESTION' });
  }, []);

  const endAnimation = useCallback(() => {
    dispatch({ type: 'END_ANIMATION' });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  return {
    state,
    nextStage,
    answerQuestion,
    endAnimation,
    reset,
  };
}
