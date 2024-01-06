import { Store } from '@reduxjs/toolkit';
import { createBluetooth, BluetoothCube } from '../lib/bluetooth/bluetooth';
import { addMove } from '../state/cube.duck';
import { RootState } from '../state/store';

type MoveReceivedCallback = (state: string, moves: string[], timestamps: [number, number], source: string) => void;

class BluetoothCubeService {

  private _cube: BluetoothCube;
  private _callback: MoveReceivedCallback;

  constructor() {
    this.init();
  }

  init(): void {
    this._cube = createBluetooth();
  }

  async connect(): Promise<void> {
    this._cube.setCallback(this.moveReceivedCallback.bind(this));
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

  moveReceivedCallback(state: string, moves: string[], timestamps: [number, number], source: string): void {
    if (state === 'disconnected') {
      this.disconnect();
      return;
    }
    if (moves.length > 0) {
      this._callback(state, moves, timestamps, source);
    }
  }

  setCallback(callback: MoveReceivedCallback): void {
    this._callback = callback;
  }
}

const cubeService = new BluetoothCubeService();

export default function getCubeService(): BluetoothCubeService {
  return cubeService;
}

