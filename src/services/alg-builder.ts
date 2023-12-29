

export class AlgBuilderService {
  moves: string[] = [];
  timestamps: [number, number][] = [];

  constructor() {

  }

  reset() {
    this.moves = [];
    this.timestamps = [];
  }

  addMove(move: string, timestamps): void {
    if (this.moves.length > 0 && move[0] === this.moves[this.moves.length - 1][0]) {
      const nextMove = this.combineWithLastMove(move, timestamps);
      if (nextMove) {
        console.log("applying combination");
        this.moves[this.moves.length - 1] = nextMove;
        this.timestamps[this.timestamps.length - 1][1] = timestamps[1];
      } else {
        console.log("applying cancellation");
        this.moves.pop();
        this.timestamps.pop();
      }
    } else {
      console.log("pushing a new move");
      this.moves.push(move);
      this.timestamps.push(timestamps);
    }

    console.log(this.getCurrentAlg());
    console.log(this.getCurrentTime());
  }

  combineWithLastMove(move: string, timestamps: [number, number]): string | null {
    let lastMove = this.moves[this.moves.length - 1];
    let lastMoveTimestamps = this.timestamps[this.timestamps.length - 1];

    const type = (move[1]? move[1] : ' ') + (lastMove[1] ? lastMove[1] : ' ');

    switch (type) {
      case " '":
      case "' ":
      case "22":
        console.log("cancelled move", type);
        return null;
      case "2'":
      case "'2":
        console.log("combined move to clockwise", type);
        return lastMove[0] + " ";
      case "2 ":
      case " 2":
        console.log("combined move to counterclockwise", type);
        return lastMove[0] + "'";
      case "  ":
      case "''":
        console.log("combined move to double", type);
        return lastMove[0] + '2';
    }

    throw new Error("Invalid move type");
  }

  getCurrentAlg(): string {
    if (!this.moves.length)
      return "";

    return this.moves.map((move) => move.trim()).join(' ');
  }

  getCurrentTime(): number {
    let latestTimestamp = this.timestamps[this.timestamps.length - 1];
    if (!latestTimestamp)
      return 0;
    return latestTimestamp[1] - this.timestamps[0][0];
  }
}

const algBuilder = new AlgBuilderService();

export default function getAlgBuilderService(): AlgBuilderService {
  return algBuilder;
}