import { createSlice, EnhancedStore, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';
import { addMove, resetCube, selectIsReachedTarget, selectMoves, setTarget, TimestampedMove } from './cube.duck';
import { goToNextPrompt, goToPreviousPrompt, resetPrompt, selectCurrentPrompt } from './prompt.duck';

// Type definitions
type TrainingResult = {
  prompt: string;
  success: boolean;
  moves: TimestampedMove[];
  time: number | null;
  recognitionTime: number | null;
};

type TrainerState = {
  active: boolean;
  lastPromptTime?: number;
  results: TrainingResult[];
};

// Initial State
const initialState: TrainerState = {
  active: false,
  results: [],
};

// Selectors
export const selectTrainerState = (state: RootState) => state.trainer;
export const selectTrainerActive = (state: RootState) => state.trainer.active;
export const selectTrainerResults = (state: RootState) => state.trainer.results;
export const selectTrainerLastPromptTime = (state: RootState) => state.trainer.lastPromptTime;

// Slice
export const trainerSlice = createSlice({
  name: 'trainer',
  initialState,
  reducers: {
    startTraining: (state) => {
      state.active = true;
      state.results = [];
      state.lastPromptTime = Date.now();
    },
    endTraining: (state) => {
      state.active = false;
    },
    addSuccessResult: (state, action: PayloadAction<TrainingResult>) => {
      state.results.push(action.payload);
      state.lastPromptTime = Date.now();
    },
    addSkippedResult: (state, action: PayloadAction<TrainingResult | undefined>) => {
      if (!action.payload) {
        throw new Error('Skipped result must be provided');
      }
      state.results.push(action.payload);
      state.lastPromptTime = Date.now();
    },
    repeatResult: (state) => {
      state.results.pop();
      state.lastPromptTime = Date.now();
    },
  },
});

// Actions
export const {
  startTraining,
  endTraining,
  addSuccessResult,
  addSkippedResult,
  repeatResult
} = trainerSlice.actions;

// Middleware
export const startTrainingMiddleware = (store: any) => (next: any) => (action: any) => {
  if (action.type === startTraining.type) {
    store.dispatch(resetCube());
    store.dispatch(resetPrompt());
  }
  next(action);
}

export const trainerRepeatMiddleware = (store: any) => (next: any) => (action: any) => {
  if (action.type === repeatResult.type) {
    store.dispatch(resetCube());
    store.dispatch(goToPreviousPrompt());
  }
  next(action);
};

export const trainerSkipMiddleware = (store: any) => (next: any) => (action: any) => {
  if (action.type === addSkippedResult.type) {
    const prompt = selectCurrentPrompt(store.getState());
    action.payload = {
      prompt,
      success: false,
      moves: [],
      time: 0,
      recognitionTime: 0,
    };
    store.dispatch(resetCube());
    store.dispatch(goToNextPrompt());
  }
  next(action);
}

export const trainerCheckSolvedMiddleware = (store: any) => (next: any) => (action: any) => {
  next(action);
  if (action.type === addMove.type) {
    const isSolved = selectIsReachedTarget(store.getState());
    if (isSolved) {
      const prompt = selectCurrentPrompt(store.getState());
      const moves = selectMoves(store.getState());
      const time = Date.now() - store.getState().trainer.lastPromptTime;
      const recognitionTime = moves[0]?.timestamps[0] - store.getState().trainer.lastPromptTime;
      const payload: TrainingResult = {
        prompt,
        success: true,
        moves,
        time,
        recognitionTime,
      };
      store.dispatch(addSuccessResult(payload));
    }
  }
}

export const addResultMiddleware = (store: any) => (next: any) => (action: any) => {
  console.log("addResultMiddleware", action.type);
  next(action);

  if (action.type === addSuccessResult.type) {
    console.log("Resetting after success result", action.payload);

    store.dispatch(resetCube());
    store.dispatch(goToNextPrompt());
  }
}

export const resetOnSettingsChangeMiddleware = (store: any) => (next: any) => (action: any) => {
  next(action);
  if (action.type.startsWith('settings/')) {
    store.dispatch(startTraining());
  }
}
