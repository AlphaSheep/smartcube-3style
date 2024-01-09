import { log } from 'console';
import { createBluetooth, BluetoothCube } from '../lib/bluetooth/bluetooth';

type MoveReceivedCallback = (state: string, moves: string[], timestamps: [number, number], source: string) => void;
type CommandCallback = () => void;

const MOVE_COUNT_TO_TRIGGER_COMMAND = 6;

class BluetoothCubeService {

  private _cube: BluetoothCube;
  private _moveCallback: MoveReceivedCallback;
  private _skipCallback: CommandCallback;
  private _repeatCallback: CommandCallback;

  private _repeatCounter: number = 0;
  private _nextRepeatMoveIsInverse: boolean = false;
  private _nextRepeatFace: string = ' ';

  constructor() {
    this.init();
  }

  init(): void {
    this._cube = createBluetooth();
  }

  async connect(): Promise<void> {
    this._cube.setCallback(this.moveReceivedCallback.bind(this));
    this._cube.setEventCallback(this.eventCallback.bind(this));
    await this._cube.init();
  }

  async disconnect(): Promise<void> {
    await this._cube.stop();
  }

  isConnected(): boolean {
    return this._cube.isConnected();
  }

  getDeviceName(): string | undefined {
    return this._cube.getDeviceName();
  }

  private moveReceivedCallback(state: string, moves: string[], timestamps: [number, number], source: string): void {
    if (state === 'disconnected') {
      this.disconnect();
      return;
    }
    if (moves.length > 0) {
      if (!this.checkForSkipOrRepeat(moves[0])) {
        return this._moveCallback(state, moves, timestamps, source);
      }
    }
  }

  private checkForSkipOrRepeat(move: string): boolean {
    if (this._nextRepeatFace !== ' ' && move[0] !== this._nextRepeatFace) {
      this.resetSkipRepeat();
      return false;
    }
    return (
      (this.checkForSkipOrRepeatForFace(move, 'U') && this._skipCallback()) ||
      (this.checkForSkipOrRepeatForFace(move, 'R') && this._repeatCallback()) ||
      false
    );
  }

  private checkForSkipOrRepeatForFace(move: string, face: string): boolean {
    if (move[0] !== face || ![' ', face].includes(this._nextRepeatFace)) {
      return false;
    }
    if (move[1] !== (this._nextRepeatMoveIsInverse ? "'" : ' ')) {
      this.resetSkipRepeat();
      return false;
    }
    this._repeatCounter++;
    this._nextRepeatFace = face;
    this._nextRepeatMoveIsInverse = !this._nextRepeatMoveIsInverse;
    if (this._repeatCounter < MOVE_COUNT_TO_TRIGGER_COMMAND) {
      return false;
    }
    this.resetSkipRepeat();
    return true;
  }

  private resetSkipRepeat(): void {
    this._repeatCounter = 0;
    this._nextRepeatMoveIsInverse = false;
    this._nextRepeatFace = ' ';
  }


  private eventCallback(state: string, event: Event): void {
    if (state === 'disconnected') {
      this.disconnect();
      return;
    }
  }

  setMoveCallback(callback: MoveReceivedCallback): void {
    this._moveCallback = callback;
  }

  setSkipCallback(callback: CommandCallback): void {
    this._skipCallback = callback;
  }

  setRepeatCallback(callback: CommandCallback): void {
    this._repeatCallback = callback;
  }
}

const cubeService = new BluetoothCubeService();

export default function getCubeService(): BluetoothCubeService {
  return cubeService;
}

