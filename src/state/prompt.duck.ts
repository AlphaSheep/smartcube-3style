import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';

import {
  selectLetterScheme,
  TrainingSettings,
  selectSettingsForCurrentPiece,
  selectBufferIndex
} from "./settings.duck";

import { setTarget } from './cube.duck';
import { getIndicesForSharedStickers, stickerToIndex } from '../lib/cube/cube';

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

export function generatePrompts(settings: TrainingSettings): string[] {
  const letters = settings.selectedLetters;
  const availableLetters = settings.letterScheme.split('');
  const includeInverses = settings.includeInverses;

  const prompts = letters?.map((first) => {
    const bufferIndex = stickerToIndex(settings.buffer, settings.pieceType);
    const firstIndex = settings.letterScheme.indexOf(first);

    const bufferIndices = getIndicesForSharedStickers(bufferIndex, settings.pieceType);
    const firstPieceIndices = settings.includeTwists ? [firstIndex] :
      getIndicesForSharedStickers(firstIndex, settings.pieceType);
    const exclude = bufferIndices.concat(firstPieceIndices);
    const secondLetters = availableLetters.filter((second, index) =>
      !exclude.includes(index)
    );

    return secondLetters.map((second) =>
      `${first}${second}`
    )
  }).flat();

  let uniquePrompts = prompts;
  if (includeInverses) {
    prompts.push(...prompts.map((prompt) =>
      prompt.split('').reverse().join(''))
    );
    // Inverses introduce duplicates when more than one letter is selected
    uniquePrompts = [...new Set(prompts)];
  }

  return shuffle(uniquePrompts);
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

  return [bufferIndex, firstIndex, secondIndex];
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
export const selectCountOfPrompts = (state: RootState) => state.prompt.prompts.length;
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
      if (state.currentPromptIndex < state.prompts.length) {
        state.currentPromptIndex++;
      }
    },
    goToPreviousPrompt: (state) => {
      if (state.currentPromptIndex > 0) {
        state.currentPromptIndex--;
      }
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
