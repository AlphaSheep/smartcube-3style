import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';

// Constants
const availableBuffers = {
  corners: ['UFR', 'UFL', 'UBL', 'UBR', 'DFR', 'DFL', 'DBL', 'DBR'],
  edges: ['UF', 'UL', 'UB', 'UR', 'FL', 'FR', 'DF', 'DL', 'DB', 'DR']
};

// Type definitions
export type TrainingSettings = {
  includeInverses: boolean;
  letterScheme: string;
  buffer: string;
  selectedLetters: string[];
}

type SettingsGroup = {
  corners: TrainingSettings;
  edges: TrainingSettings;
}

export type PieceType = keyof SettingsGroup;

type Settings = {
  selectedPieceType: PieceType;
  settings: SettingsGroup;
}

// Initial State
const savedSettings = localStorage.getItem('settings');
const initialState: Settings = savedSettings ? JSON.parse(savedSettings) : {
  selectedPieceType: 'corners',
  settings: {
    corners: {
      includeInverses: true,
      letterScheme: 'ABCDEFGHIJKLMNOPQRSTUVWX',
      buffer: 'UFR',
      selectedLetters: []
    },
    edges: {
      includeInverses: true,
      letterScheme: 'ABCDEFGHIJKLMNOPQRSTUVWX',
      buffer: 'UF',
      selectedLetters: []
    }
  },
};

// Selectors
export const selectSettings = (state: RootState) => state.settings;
export const selectSelectedPieceType = (state: RootState) => state.settings.selectedPieceType;
export const selectSettingsForCurrentPiece = (state: RootState) => state.settings.settings[selectSelectedPieceType(state)];
export const selectIncludeInverses = (state: RootState) => selectSettingsForCurrentPiece(state).includeInverses;
export const selectLetterScheme = (state: RootState) => selectSettingsForCurrentPiece(state).letterScheme;
export const selectBuffer = (state: RootState) => selectSettingsForCurrentPiece(state).buffer;
export const selectSelectedLetters = (state: RootState) => selectSettingsForCurrentPiece(state).selectedLetters;

// Slice
export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setSelectedPieceType: (state, action: PayloadAction<PieceType>) => {
      state.selectedPieceType = action.payload;
    },
    setSettingsForPiece: (state, action: PayloadAction<TrainingSettings>) => {
      state.settings[state.selectedPieceType] = action.payload;
    },
    setIncludeInverses: (state, action: PayloadAction<boolean>) => {
      state.settings[state.selectedPieceType].includeInverses = action.payload;
    },
    setLetterScheme: (state, action: PayloadAction<string>) => {
      state.settings[state.selectedPieceType].letterScheme = action.payload;
    },
    setBuffer: (state, action: PayloadAction<string>) => {
      state.settings[state.selectedPieceType].buffer = action.payload;
    },
    setSelectedLetters: (state, action: PayloadAction<string[]>) => {
      state.settings[state.selectedPieceType].selectedLetters = action.payload;
    }
  }
});

// Actions
export const { setSelectedPieceType, setSettingsForPiece, setIncludeInverses, setLetterScheme, setBuffer, setSelectedLetters } = settingsSlice.actions;

// Middleware
export const settingsPersistanceMiddleware = (store: any) => (next: any) => (action: any) => {
  // Save the settings to local storage after every action
  next(action);
  if (action.type.startsWith('settings/')) {
    localStorage.setItem('settings', JSON.stringify(store.getState().settings));
  }
}

// Helper functions
export function getAvailableBuffers(piece: PieceType): string[] {
  return availableBuffers[piece];
}

export function getAvailablePieceTypes(): (PieceType)[] {
  return Object.keys(availableBuffers) as PieceType[];
}
