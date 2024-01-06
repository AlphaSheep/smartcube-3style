import { ActionCreatorWithoutPayload, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';

import {
  selectSelectedLetters,
  selectLetterScheme,
  selectIncludeInverses,
  TrainingSettings,
  selectSettingsForCurrentPiece
} from "./settings.duck";

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

function generatePrompts(state?: TrainingSettings): string[] {
  if (!state) {
    console.log('No settings provided to generate prompts');
    return [];
  }

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
      state.prompts = generatePrompts(action.payload);
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
  if (action.type === 'prompt/resetPrompt') {
    action.payload = selectSettingsForCurrentPiece(store.getState());
    console.log("settings added to prompt/reset action");
  }

  next(action);
}

export const promptResetOnSettingsChangeMiddleware = (store: any) => (next: any) => (action: any) => {
  next(action);
  if (action.type.startsWith('settings/')) {
    store.dispatch(resetPrompt());
  }
}
