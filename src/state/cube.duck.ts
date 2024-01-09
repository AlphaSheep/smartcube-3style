import { createSlice, EnhancedStore, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';

import { getSolvedState, applyMove, areStatesEqual, CubeState, applyCorner3Cycle, applyEdge3Cycle } from '../lib/cube/cube';
import getCubeService from "../services/bluetooth-cube";
import { getInverse3CycleForCurrentPrompt } from './prompt.duck';
import { selectSelectedPieceType } from './settings.duck';
import { selectTrainerActive } from './trainer.duck';

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
    setTarget: (state, action: PayloadAction<CubeState | undefined>) => {
      state.target = action.payload;
    }
  },
});

// Actions
export const { addMove, resetCube, setTarget } = cubeSlice.actions;

// Middleware

export const ignoreMoveUnlessActiveMiddleware = (store: any) => (next: any) => (action: any) => {
  const isActive = selectTrainerActive(store.getState());
  if (!isActive && action.type === addMove.type) {
    return;
  }
  next(action);
}

export const addStateToSetTargetMiddleware = (store: any) => (next: any) => (action: any) => {
  if (action.type === setTarget.type) {
    const cycle = getInverse3CycleForCurrentPrompt(store.getState());

    if (cycle) {
      const pieceType = selectSelectedPieceType(store.getState());
      const cubeState = selectCubeState(store.getState()).cubeState;
      let target: CubeState;
      switch (pieceType) {
        case 'corners':
          target = applyCorner3Cycle(cubeState, cycle);
          break;
        case 'edges':
          target = applyEdge3Cycle(cubeState, cycle);
          break;
        default:
          throw new Error('Invalid piece type');
      }
      action.payload = target;
    }
  }
  return next(action);
}

// Initialisation
export function initialiseCubeBluetoothCallback(store: EnhancedStore) {
  getCubeService().setMoveCallback((state, moves, timestamps, source) => {
    store.dispatch(addMove({ move: moves[0].trim(), timestamps }));
  });
}
