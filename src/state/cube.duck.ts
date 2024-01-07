import { createSlice, EnhancedStore, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';

import { getSolvedState, applyMove, areStatesEqual, CubeState } from '../lib/cube/cube';
import getCubeService from "../services/bluetooth-cube";

// Type definitions
export type Cube = {
  cubeState: CubeState;
  moves: TimestampedMove[];
  target?: CubeState;
};

export type TimestampedMove = {
  move: string;
  timestamps: [number, number];
};

// Initial State
const initialState: Cube = {
  cubeState: getSolvedState(),
  moves: [],
};

// Selectors
export const selectCubeState = (state: RootState) => state.cube;
export const selectMoves = (state: RootState) => state.cube.moves;
export const selectIsReachedTarget = (state: RootState) =>
  state.cube.target ? areStatesEqual(state.cube.cubeState, state.cube.target) : false;

// Slice
export const cubeSlice = createSlice({
  name: 'cube',
  initialState,
  reducers: {
    addMove: (state, action: PayloadAction<TimestampedMove>) => {
      state.cubeState = applyMove(state.cubeState, action.payload.move);
      state.moves.push(action.payload);
    },
    resetCube: (state) => {
      state.cubeState = getSolvedState();
      state.moves = [];
      state.target = undefined;
    },
    setTarget: (state, action: PayloadAction<CubeState>) => {
      state.target = action.payload;
    }
  },
});

// Actions
export const { addMove, resetCube } = cubeSlice.actions;

// Helpers
export function initialiseCubeBluetoothCallback(store: EnhancedStore) {
  getCubeService().setCallback((state, moves, timestamps, source) => {
    store.dispatch(addMove({ move: moves[0].trim(), timestamps }));
  });
}
