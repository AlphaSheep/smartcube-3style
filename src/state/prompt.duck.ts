import { ActionCreatorWithoutPayload, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';

import {
  selectSelectedLetters,
  selectLetterScheme,
  selectIncludeInverses,
  TrainingSettings,
  selectSettingsForCurrentPiece,
  selectBuffer,
  selectBufferIndex
} from "./settings.duck";
import { setTarget } from './cube.duck';

// Helper functions
function shuffle(array: any[]): Array<any>{
  let remaining = array.length;
  let randomIndex: number;

  while (remaining) {
    randomIndex = Math.floor(Math.random() * remaining);
    remaining--;
    [array[remaining], array[randomIndex]] = [array[randomIndex], array[remaining]];
  }

  return array;
}

function generatePrompts(state: TrainingSettings): string[] {
  const letters = state.selectedLetters;
  const availableLetters = state.letterScheme.split('');
  const includeInverses = state.includeInverses;

  const prompts = letters?.map((first) =>
    availableLetters.map((second) =>
      `${first}${second}`
    )
  ).flat();

  if (includeInverses) {
    prompts.push(...prompts.map((prompt) =>
      prompt.split('').reverse().join(''))
    );
  }

  return shuffle(prompts);
}

export function getInverse3CycleForCurrentPrompt(state: RootState): [number, number, number] | undefined {
  const prompt = selectCurrentPrompt(state);
  const letterScheme = selectLetterScheme(state);
  const bufferIndex = selectBufferIndex(state);

  if (!prompt) {
    return undefined;
  }

  const firstIndex = letterScheme.indexOf(prompt[0]);
  const secondIndex = letterScheme.indexOf(prompt[1]);

  console.log("prompt", prompt);
  console.log("cycle", [bufferIndex, secondIndex, firstIndex]);

  return [bufferIndex, secondIndex, firstIndex];
}

// Type definitions
type PromptState = {
  prompts: string[];
  currentPromptIndex: number;
};

// Initial State
const initialState: PromptState = {
  prompts: [],
  currentPromptIndex: 0,
};

// Selectors
export const selectPrompts = (state: RootState) => state.prompt.prompts;
export const selectCurrentPromptIndex = (state: RootState) => state.prompt.currentPromptIndex;
export const selectCurrentPrompt = (state: RootState) =>
  selectPrompts(state)[selectCurrentPromptIndex(state)];

// Slice
export const promptSlice = createSlice({
  name: 'prompt',
  initialState,
  reducers: {
    resetPrompt: (state, action: PayloadAction<TrainingSettings | undefined>) => {
      if (!action.payload) {
        throw new Error('Settings must be defined to reset prompt');
      }
      state.prompts = generatePrompts(action.payload);
      state.currentPromptIndex = 0;
    },
    goToNextPrompt: (state) => {
      state.currentPromptIndex++;
    },
    goToPreviousPrompt: (state) => {
      state.currentPromptIndex--;
    },
  },
});

// Actions
export const { resetPrompt, goToNextPrompt, goToPreviousPrompt } = promptSlice.actions;

//Middleware
export const addSettingsToPromptResetMiddleware = (store: any) => (next: any) => (action: any) => {
  if (action.type === resetPrompt.type) {
    action.payload = selectSettingsForCurrentPiece(store.getState());
  }
  next(action);
}

export const setTargetOnPromptChangeMiddleware = (store: any) => (next: any) => (action: any) => {
  next(action);
  if (action.type.startsWith('prompt/')) {
    store.dispatch(setTarget());
  }
}
