import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';

import { getSolvedState, applyMove, CubeState } from '../lib/cube/cube';

// Type definitions

// Initial State
const initialState: CubeState = getSolvedState();

// Selectors
export const selectCubeState = (state: RootState) => state.cube;

// Slice
export const cubeSlice = createSlice({
  name: 'cube',
  initialState,
  reducers: {
    applyTurn: (state, action: PayloadAction<string>) => {
      applyMove(state, action.payload);
    },
    resetCube: (state) => {
      return getSolvedState();
    },
  },
});

// Actions
export const { applyTurn, resetCube } = cubeSlice.actions;

