import { PieceType } from "../../state/settings.duck";

export type CubeState = number[][];

type Transform = number[][];

type MoveDefinitions = {
  [name: string]: Transform
};

type Face = "U" | "R" | "F" | "D" | "L" | "B";
type Direction = number;

// Axis ordering
const AXIS_ORDER = {
  "U": 0,
  "R": 1,
  "F": 2,
  "D": 0,
  "L": 1,
  "B": 2,
}

export class Move {
  private _face: Face;
  private _direction: Direction;

  constructor(moveStr: Face | string, direction?: Direction) {
    this._face = moveStr[0] as Face;
    if (direction === undefined) {
      if (moveStr.length === 1) {
        this._direction = 1;
      } else if (moveStr[1] === "2") {
        this._direction = 2;
      } else if (moveStr[1] === "'") {
        this._direction = 3;
      } else {
        throw new Error("Invalid move: " + moveStr);
      }
    } else {
      this._direction = direction;
    }
  }

  toString(): string {
    const dir = this._direction % 4;
    if (dir === 1) {
      return this._face;
    } else if (dir === 2) {
      return this._face + "2";
    } else if (dir === 3) {
      return this._face + "'";
    } else {
      return "";
    }
  }

  getFace(): Face {
    return this._face;
  }

  getDirection(): Direction {
    return this._direction;
  }

  getAxis(): number {
    return AXIS_ORDER[this._face];
  }

  cancelWith(move: Move): Move | null {
    if (this._face !== move._face) {
      throw new Error("Can't cancel moves on different faces");
    }

    const direction = (this._direction + move._direction) % 4;

    if (direction === 0) {
      return null;
    } else {
      return new Move(this._face, direction);
    }
  }
}

/*
Cube state:
  [corner orientations: UBL, UBR, UFR, UFL, DBL, DBR, DFR, DFL.
    0 is oriented, 1 is twisted clockwise, 2 is twisted anticlockwise]
  [corner permutations: UBL, UBR, UFR, UFL, DBL, DBR, DFR, DFL]
  [edge orientations wrt z-axis: UB, UR, UF, UL, BL, BR, FR, FL, DB, DR, DF, DL.
    0 is oriented in <R,U,L,D>, 1 is flipped in <R,U,L,D>.]
  [edge permutations: UB, UR, UF, UL, BL, BR, FR, FL, DB, DR, DF, DL]
*/
const IDENTITY_TRANSFORM: Transform = [[0,0,0,0,0,0,0,0], [0,1,2,3,4,5,6,7], [0,0,0,0,0,0,0,0,0,0,0,0], [0,1,2,3,4,5,6,7,8,9,10,11]];
const SOLVED_CUBE: CubeState = IDENTITY_TRANSFORM as CubeState;

const MOVE_TRANSFORMS: MoveDefinitions = {
  //      CO                  CP                  EO                           EP
  "U" : [[0,0,0,0, 0,0,0,0], [1,2,3,0, 4,5,6,7], [0,0,0,0, 0,0,0,0, 0,0,0,0], [1,2,3,0, 4,5,6,7, 8,9,10,11]],
  "U2": [[0,0,0,0, 0,0,0,0], [2,3,0,1, 4,5,6,7], [0,0,0,0, 0,0,0,0, 0,0,0,0], [2,3,0,1, 4,5,6,7, 8,9,10,11]],
  "U'": [[0,0,0,0, 0,0,0,0], [3,0,1,2, 4,5,6,7], [0,0,0,0, 0,0,0,0, 0,0,0,0], [3,0,1,2, 4,5,6,7, 8,9,10,11]],
  "R" : [[0,1,2,0, 0,2,1,0], [0,5,1,3, 4,6,2,7], [0,0,0,0, 0,0,0,0, 0,0,0,0], [0,5,2,3, 4,9,1,7, 8,6,10,11]],
  "R2": [[0,0,0,0, 0,0,0,0], [0,6,5,3, 4,2,1,7], [0,0,0,0, 0,0,0,0, 0,0,0,0], [0,9,2,3, 4,6,5,7, 8,1,10,11]],
  "R'": [[0,1,2,0, 0,2,1,0], [0,2,6,3, 4,1,5,7], [0,0,0,0, 0,0,0,0, 0,0,0,0], [0,6,2,3, 4,1,9,7, 8,5,10,11]],
  "F" : [[0,0,1,2, 0,0,2,1], [0,1,6,2, 4,5,7,3], [0,0,1,0, 0,0,1,1, 0,0,1,0], [0,1,6,3, 4,5,10,2, 8,9,7,11]],
  "F2": [[0,0,0,0, 0,0,0,0], [0,1,7,6, 4,5,3,2], [0,0,0,0, 0,0,0,0, 0,0,0,0], [0,1,10,3, 4,5,7,6, 8,9,2,11]],
  "F'": [[0,0,1,2, 0,0,2,1], [0,1,3,7, 4,5,2,6], [0,0,1,0, 0,0,1,1, 0,0,1,0], [0,1,7,3, 4,5,2,10, 8,9,6,11]],
  "L" : [[2,0,0,1, 1,0,0,2], [3,1,2,7, 0,5,6,4], [0,0,0,0, 0,0,0,0, 0,0,0,0], [0,1,2,7, 3,5,6,11, 8,9,10,4]],
  "L2": [[0,0,0,0, 0,0,0,0], [7,1,2,4, 3,5,6,0], [0,0,0,0, 0,0,0,0, 0,0,0,0], [0,1,2,11, 7,5,6,4, 8,9,10,3]],
  "L'": [[2,0,0,1, 1,0,0,2], [4,1,2,0, 7,5,6,3], [0,0,0,0, 0,0,0,0, 0,0,0,0], [0,1,2,4, 11,5,6,3, 8,9,10,7]],
  "D" : [[0,0,0,0, 0,0,0,0], [0,1,2,3, 7,4,5,6], [0,0,0,0, 0,0,0,0, 0,0,0,0], [0,1,2,3, 4,5,6,7, 11,8,9,10]],
  "D2": [[0,0,0,0, 0,0,0,0], [0,1,2,3, 6,7,4,5], [0,0,0,0, 0,0,0,0, 0,0,0,0], [0,1,2,3, 4,5,6,7, 10,11,8,9]],
  "D'": [[0,0,0,0, 0,0,0,0], [0,1,2,3, 5,6,7,4], [0,0,0,0, 0,0,0,0, 0,0,0,0], [0,1,2,3, 4,5,6,7, 9,10,11,8]],
  "B" : [[1,2,0,0, 2,1,0,0], [4,0,2,3, 5,1,6,7], [1,0,0,0, 1,1,0,0, 1,0,0,0], [4,1,2,3, 8,0,6,7, 5,9,10,11]],
  "B2": [[0,0,0,0, 0,0,0,0], [5,4,2,3, 1,0,6,7], [0,0,0,0, 0,0,0,0, 0,0,0,0], [8,1,2,3, 5,4,6,7, 0,9,10,11]],
  "B'": [[1,2,0,0, 2,1,0,0], [1,5,2,3, 0,4,6,7], [1,0,0,0, 1,1,0,0, 1,0,0,0], [5,1,2,3, 0,8,6,7, 4,9,10,11]],
}

// Sticker order (follows Speffz)
// Corners: UBL, UBR, UFR, UFL, LUB, LUF, LDF, LDB, FUL, FUR, FDR, FDL, RUF, RUB, RDB, RDF, BUR, BUL, BDL, BDR, DFL, DFR, DRB, DRL
const CORNER_STICKER_PERMUTATION_MAP = [0, 1, 2, 3, 0, 3, 7, 4, 3, 2, 6, 7, 2, 1, 5, 6, 1, 0, 4, 5, 7, 6, 5, 4];
const CORNER_STICKER_ORIENTATION_MAP = [0, 0, 0, 0, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 0, 0, 0, 0];
// Edges: UB, UR, UF, UL, LU, LF, LD, LB, FU, FR, FD, FL, RU, RB, RD, RF, BU, BL, BD, BR, DF, DR, DB, DL
const EDGE_STICKER_PERMUTATION_MAP = [0, 1, 2, 3,  3, 7, 11, 4,  2, 6, 10, 7,  1, 5, 9, 6,  0, 4, 8, 5,  10, 9, 8, 11];
const EDGE_STICKER_ORIENTATION_MAP = [0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0];

const CORNER_STICKER_ORDER = [
  'UBL', 'UBR', 'UFR', 'UFL',
  'LUB', 'LUF', 'LDF', 'LDB',
  'FUL', 'FUR', 'FDR', 'FDL',
  'RUF', 'RUB', 'RDB', 'RDF',
  'BUR', 'BUL', 'BDL', 'BDR',
  'DFL', 'DFR', 'DRB', 'DRL'
];

const EDGE_STICKER_ORDER = [
  'UB', 'UR', 'UF', 'UL',
  'LU', 'LF', 'LD', 'LB',
  'FU', 'FR', 'FD', 'FL',
  'RU', 'RB', 'RD', 'RF',
  'BU', 'BL', 'BD', 'BR',
  'DF', 'DR', 'DB', 'DL'
];

// Sticker colours per piece
// These are single characters because otherwise the rawStateToStickerString function would be even messier
const U="U", R="R", F="F", D="D", L="L", B="B";
const C = [
  [U, L, B], [U, B, R], [U, R, F], [U, F, L],
  [D, B, L], [D, R, B], [D, F, R], [D, L, F]
];
const E = [
  [U, B], [U, R], [U, F], [U, L],
  [B, L], [B, R], [F, R], [F, L],
  [D, B], [D, R], [D, F], [D, L]
];

function copyState(state: CubeState): CubeState {
  return state.map((subState) => [...subState]);
}

export function areStatesEqual(state1: CubeState, state2: CubeState): boolean {
  for (let i = 0; i < 4; i++) {
    if (state1[i].length !== state2[i].length) {
      return false;
    }
    for (let j = 0; j < state1[i].length; j++) {
      if (state1[i][j] !== state2[i][j]) {
        return false;
      }
    }
  }
  return true;
}

export function getSolvedState(): CubeState {
  return copyState(SOLVED_CUBE);
}

function applyTransform(state: CubeState, transform: Transform): CubeState {
  const newState = copyState(state);
  // Corner permutation
  for (let i in transform[1]) {
    newState[0][transform[1][i]] = state[0][i];
    newState[1][transform[1][i]] = state[1][i];
  }
  // Edge permutation
  for (let i in transform[3]) {
    newState[2][transform[3][i]] = state[2][i];
    newState[3][transform[3][i]] = state[3][i];
  }
  // Corner orientation
  for (let i in transform[0]) {
    newState[0][i] = (newState[0][i] + transform[0][i]) % 3;
  }
  // Edge orientation
  for (let i in transform[2]) {
    newState[2][i] = (newState[2][i] + transform[2][i]) % 2;
  }
  return newState;
}

export function applyMove(state: CubeState, move: string): CubeState {
  const transform = MOVE_TRANSFORMS[move];
  if (!transform) {
    throw new Error("Invalid move: |" + move + "|");
  }
  return applyTransform(state, transform);
}

export function applyMoves(state: CubeState, moves: Move[]): CubeState {
  let newState = copyState(state);
  for (let move of moves) {
    newState = applyMove(newState, move.toString());
  }
  return newState;
}

function corner3CycleToTransform(cycle: [number, number, number]): Transform {
  let transform = copyState(IDENTITY_TRANSFORM);
  const cp = cycle.map((i) => CORNER_STICKER_PERMUTATION_MAP[i]);
  const co = cycle.map((i) => CORNER_STICKER_ORIENTATION_MAP[i]);

  transform[1][cp[0]] = cp[1];
  transform[1][cp[1]] = cp[2];
  transform[1][cp[2]] = cp[0];

  transform[0][cp[0]] = (3 - co[2] + co[0]) % 3;
  transform[0][cp[1]] = (3 - co[0] + co[1]) % 3;
  transform[0][cp[2]] = (3 - co[1] + co[2]) % 3;

  return transform;
}

function edge3CycleToTransform(cycle: [number, number, number]): Transform {
  let transform = copyState(IDENTITY_TRANSFORM);
  const ep = cycle.map((i) => EDGE_STICKER_PERMUTATION_MAP[i]);
  const eo = cycle.map((i) => EDGE_STICKER_ORIENTATION_MAP[i]);

  transform[3][ep[0]] = ep[1];
  transform[3][ep[1]] = ep[2];
  transform[3][ep[2]] = ep[0];

  transform[2][ep[0]] = (eo[2] + eo[0]) % 2;
  transform[2][ep[1]] = (eo[0] + eo[1]) % 2;
  transform[2][ep[2]] = (eo[1] + eo[2]) % 2;

  return transform;
}

export function applyCorner3Cycle(state: CubeState, cycle: [number, number, number]): CubeState {
  const transform = corner3CycleToTransform(cycle);
  return applyTransform(state, transform);
}

export function applyEdge3Cycle(state: CubeState, cycle: [number, number, number]): CubeState {
  const transform = edge3CycleToTransform(cycle);
  return applyTransform(state, transform);
}

export function rawStateToStickerString(state: CubeState): string {
  const co = state[0], cp = state[1], eo = state[2], ep = state[3];
  const twist = (idx: number, amount: number): number => (amount + 3 - co[idx]) % 3;
  const flip = (idx: number, amount: number): number => (amount + eo[idx]) % 2;

  const uFace = [
    C[cp[ 0]][twist( 0, 0)], E[ep[ 0]][ flip( 0, 0)], C[cp[ 1]][twist( 1, 0)],
    E[ep[ 3]][ flip( 3, 0)],           U            , E[ep[ 1]][ flip( 1, 0)],
    C[cp[ 3]][twist( 3, 0)], E[ep[ 2]][ flip( 2, 0)], C[cp[ 2]][twist( 2, 0)]
  ];
  const fFace = [
    C[cp[ 3]][twist( 3, 1)], E[ep[ 2]][ flip( 2, 1)], C[cp[ 2]][twist( 2, 2)],
    E[ep[ 7]][ flip( 7, 0)],           F            , E[ep[ 6]][ flip( 6, 0)],
    C[cp[ 7]][twist( 7, 2)], E[ep[10]][ flip(10, 1)], C[cp[ 6]][twist( 6, 1)]
  ];
  const rFace = [
    C[cp[ 2]][twist( 2, 1)], E[ep[ 1]][ flip( 1, 1)], C[cp[ 1]][twist( 1, 2)],
    E[ep[ 6]][ flip( 6, 1)],           R            , E[ep[ 5]][ flip( 5, 1)],
    C[cp[ 6]][twist( 6, 2)], E[ep[ 9]][ flip( 9, 1)], C[cp[ 5]][twist( 5, 1)]
  ];
  const bFace = [
    C[cp[ 1]][twist( 1, 1)], E[ep[ 0]][ flip( 0, 1)], C[cp[ 0]][twist( 0, 2)],
    E[ep[ 5]][ flip( 5, 0)],           B            , E[ep[ 4]][ flip( 4, 0)],
    C[cp[ 5]][twist( 5, 2)], E[ep[ 8]][ flip( 8, 1)], C[cp[ 4]][twist( 4, 1)]
  ];
  const lFace = [
    C[cp[ 0]][twist( 0, 1)], E[ep[ 3]][ flip( 3, 1)], C[cp[ 3]][twist( 3, 2)],
    E[ep[ 4]][ flip( 4, 1)],           L            , E[ep[ 7]][ flip( 7, 1)],
    C[cp[ 4]][twist( 4, 2)], E[ep[11]][ flip(11, 1)], C[cp[ 7]][twist( 7, 1)]
  ];
  const dFace = [
    C[cp[ 7]][twist( 7, 0)], E[ep[10]][ flip(10, 0)], C[cp[ 6]][twist( 6, 0)],
    E[ep[11]][ flip(11, 0)],           D            , E[ep[ 9]][ flip( 9, 0)],
    C[cp[ 4]][twist( 4, 0)], E[ep[ 8]][ flip( 8, 0)], C[cp[ 5]][twist( 5, 0)]
  ];

  let stickers: string[] = [];
  stickers = stickers.concat(uFace, rFace ,fFace, dFace, lFace, bFace); // Match the order we get from the bluetooth library
  return stickers.join("");
}

export function simplifyAlg(moves: Move[]): Move[] {
  // TODO: This feels very inefficient, surely there's a better way to do this

  let simplifiedMoves: (Move | null)[] = [...moves];

  for (let i=0; i < simplifiedMoves.length; i++) {
    let j = i + 1;
    while (j < simplifiedMoves.length) {
      const move = simplifiedMoves[i];
      const nextMove = simplifiedMoves[j];

      if (nextMove) {
        if (!move || move.getAxis() !== nextMove.getAxis()) {
          // If the current move is null, we have already cancelled it
          // If the moves are on a different axis, we can't cancel any further
          break;
        }
        if (move.getFace() === nextMove.getFace()) {
          // If the moves are on the same face, we can cancel them
          simplifiedMoves[i] = move.cancelWith(nextMove);
          simplifiedMoves[j] = null;
        }
      }
      j++;
    }
  }

  simplifiedMoves = simplifiedMoves.filter((move) => move !== null);
  if (simplifiedMoves.length !== moves.length) {
    return simplifyAlg(simplifiedMoves as Move[]);
  } else {
    return simplifiedMoves as Move[];
  }
}

export function cornerStickerToIndex(sticker: string): number {
  return CORNER_STICKER_ORDER.indexOf(sticker);
}

export function edgeStickerToIndex(sticker: string): number {
  return EDGE_STICKER_ORDER.indexOf(sticker);

}
export function stickerToIndex(sticker: string, pieceType: PieceType): number {
  switch (pieceType) {
    case "corners":
      return cornerStickerToIndex(sticker);
    case "edges":
      return edgeStickerToIndex(sticker);
    default:
      throw new Error("Invalid piece type: " + pieceType);
  }
}

export function getIndicesForSharedStickers(stickerIndex: number, pieceType: PieceType): number[] {
  let stickerToPieceMap: number[];
  switch (pieceType) {
    case "corners":
      stickerToPieceMap = CORNER_STICKER_PERMUTATION_MAP;
      break;
    case "edges":
      stickerToPieceMap = EDGE_STICKER_PERMUTATION_MAP;
      break;
    default:
      throw new Error("Invalid piece type: " + pieceType);
  }

  const pieceIndex = stickerToPieceMap[stickerIndex];
  let indices: number[] = [];
  stickerToPieceMap.forEach((piece, index) => {
    if (piece === pieceIndex) {
      indices.push(index);
    }
  });
  return indices;
}