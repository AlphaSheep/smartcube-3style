import {
  applyCorner3Cycle,
  applyEdge3Cycle,
  applyMove,
  areStatesEqual,
  getIndicesForSharedStickers,
  getSolvedState,
  Move,
  rawStateToStickerString,
  simplifyAlg
} from './cube';

describe('areStatesEqual', () => {
  it('should return true when states are equal', () => {
    const state1 = [[0,0,0,0, 0,0,0,0], [3,0,1,2, 4,5,6,7], [0,0,0,0, 0,0,0,0, 0,0,0,0], [3,0,1,2, 4,5,6,7, 8,9,10,11]];
    const state2 = [[0,0,0,0, 0,0,0,0], [3,0,1,2, 4,5,6,7], [0,0,0,0, 0,0,0,0, 0,0,0,0], [3,0,1,2, 4,5,6,7, 8,9,10,11]];

    expect(areStatesEqual(state1, state2)).toBe(true);
  });

  it('should return false when states are different', () => {
    const state1 = [[0,0,0,0, 0,0,0,0], [3,0,1,2, 4,5,6,7], [0,0,0,0, 0,0,0,0, 0,0,0,0], [3,0,1,2, 4,5,6,7, 8,9,10,11]];
    const state2 = [[0,0,0,0, 0,0,0,0], [0,1,7,6, 4,5,3,2], [0,0,0,0, 0,0,0,0, 0,0,0,0], [0,1,10,3, 4,5,7,6, 8,9,2,11]];

    expect(areStatesEqual(state1, state2)).toBe(false);
  });
});

describe('applyMoves', () => {
  it('should return the correct state after applying a corner comm', () => {
    let state = getSolvedState();
    state = applyMove(state, "U");
    state = applyMove(state, "R'");
    state = applyMove(state, "D");
    state = applyMove(state, "R");
    state = applyMove(state, "U'");
    state = applyMove(state, "R'");
    state = applyMove(state, "D'");
    state = applyMove(state, "R");

    const expected = "UULUUUUUUBRDRRRRRRFFRFFFRFFFDDDDDDDDLLLLLLLLUFBBBBBBBB";

    expect(rawStateToStickerString(state)).toEqual(expected);
  });

  it('should return the correct state after applying an edge comm', () => {
    let state = getSolvedState();
    state = applyMove(state, "F2");
    state = applyMove(state, "U");
    state = applyMove(state, "R'");
    state = applyMove(state, "L");
    state = applyMove(state, "F2");
    state = applyMove(state, "R");
    state = applyMove(state, "L'");
    state = applyMove(state, "U");
    state = applyMove(state, "F2");

    const expected = "UUUUUUUUURLRRRRRRRFRFFFFFFFDDDDDDDDDLFLLLLLLLBBBBBBBBB";

    expect(rawStateToStickerString(state)).toEqual(expected);
  });

  it('should return the correct state after applying a random state scramble', () => {
    let state = getSolvedState();
    // L' R2 D' R2 D' F2 U' R2 F2 D F2 D L' U R U F' D' B' R' B
    state = applyMove(state, "L'");
    state = applyMove(state, "R2");
    state = applyMove(state, "D'");
    state = applyMove(state, "R2");
    state = applyMove(state, "D'");
    state = applyMove(state, "F2");
    state = applyMove(state, "U'");
    state = applyMove(state, "R2");
    state = applyMove(state, "F2");
    state = applyMove(state, "D");
    state = applyMove(state, "F2");
    state = applyMove(state, "D");
    state = applyMove(state, "L'");
    state = applyMove(state, "U");
    state = applyMove(state, "R");
    state = applyMove(state, "U");
    state = applyMove(state, "F'");
    state = applyMove(state, "D'");
    state = applyMove(state, "B'");
    state = applyMove(state, "R'");
    state = applyMove(state, "B");

    const expected = "BLLBURFFRUUBRRBRDUDUBRFFLLFUDDRDFBUFDLLBLBLDFDFRDBURLU";

    expect(rawStateToStickerString(state)).toEqual(expected);
  });
});

describe('apply3Cycle', () => {
  describe('corner 3-cycles', () => {
    it('should return the correct state after cycling UFR -> LDF -> UBR', () => {
      let state = getSolvedState();
      const cycle: [number, number, number] = [2, 6, 1]; // UFR -> LDF -> UBR
      state = applyCorner3Cycle(state, cycle);

      const expected = "UULUUUUUUBRDRRRRRRFFRFFFRFFFDDDDDDDDLLLLLLLLUFBBBBBBBB";

      expect(rawStateToStickerString(state)).toEqual(expected);
    });

    it('should return the correct state after cycling UFR -> UBR -> LDF', () => {
      let state = getSolvedState();
      const cycle: [number, number, number] = [2, 1, 6]; // UFR -> UBR -> LDF
      state = applyCorner3Cycle(state, cycle);

      const expected = "UUUUUUUULFRFRRRRRRFFDFFFBFFRDDDDDDDDLLLLLLLLURBBBBBBBB";

      expect(rawStateToStickerString(state)).toEqual(expected);
    });

    it('should return the correct state after cycling UFR -> LDB -> UBR', () => {
      let state = getSolvedState();
      const cycle: [number, number, number] = [2, 7, 1]; // UFR -> LDB -> UBR
      state = applyCorner3Cycle(state, cycle);

      const expected = "UULUUUUUUBRBRRRRRRFFRFFFFFFDDDDDDRDDLLLLLLULLDBBBBBBBF";

      expect(rawStateToStickerString(state)).toEqual(expected);
    });

    it('should return the correct state after cycling UFR -> UBR -> LDB', () => {
      let state = getSolvedState();
      const cycle: [number, number, number] = [2, 1, 7]; // UFR -> UBR -> LDB
      state = applyCorner3Cycle(state, cycle);

      const expected = "UUUUUUUULDRFRRRRRRFFBFFFFFFDDDDDDBDDLLLLLLULLRBBBBBBBR";

      expect(rawStateToStickerString(state)).toEqual(expected);
    });

    it('should return the correct state after cycling UFR -> UBL -> UBR', () => {
      let state = getSolvedState();
      const cycle: [number, number, number] = [2, 0, 1]; // UFR -> UBL -> UBR
      state = applyCorner3Cycle(state, cycle);

      const expected = "UUUUUUUUUBRBRRRRRRFFRFFFFFFDDDDDDDDDRLLLLLLLLLBFBBBBBB";

      expect(rawStateToStickerString(state)).toEqual(expected);
    });

    it('should return the correct state after cycling UFR -> UBR -> UBL', () => {
      let state = getSolvedState();
      const cycle: [number, number, number] = [2, 1, 0]; // UFR -> UBL -> UBR
      state = applyCorner3Cycle(state, cycle);

      const expected = "UUUUUUUUULRFRRRRRRFFBFFFFFFDDDDDDDDDBLLLLLLLLRBRBBBBBB";

      expect(rawStateToStickerString(state)).toEqual(expected);
    });

  });

  describe('edge 3-cycles', () => {
    it('should return the correct state after cycling DF -> FR -> UL', () => {
      let state = getSolvedState();
      const cycle: [number, number, number] = [20, 9, 3]; // DF -> FR -> UL
      state = applyEdge3Cycle(state, cycle);
      const expected = "UUUFUUUUURRRFRRRRRFFFFFDFLFDUDDDDDDDLRLLLLLLLBBBBBBBBB";
      expect(rawStateToStickerString(state)).toEqual(expected);
    });
  });
});

describe('getIndicesForSharedStickers', () => {
  it('should return the correct indices for a corner', () => {
    const indices = getIndicesForSharedStickers(0, 'corners');
    expect(indices).toEqual([0, 4, 17]);
  });

  it('should return the correct indices for an edge', () => {
    const indices = getIndicesForSharedStickers(0, 'edges');
    expect(indices).toEqual([0, 16]);
  });
});

describe('simplifyAlg', () => {
  it('should return a simplified alg', () => {
    const alg = "R L' R L' D D R L' R L' U U".split(' ').map((move) => new Move(move));
    const simplified = simplifyAlg(alg);

    const expected = "R2 L2 D2 R2 L2 U2".split(' ').map((move) => new Move(move));
    expect(simplified).toEqual(expected);
  });
});
