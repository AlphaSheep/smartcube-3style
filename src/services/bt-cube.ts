import { createBluetooth, BluetoothCube } from '../lib/bluetooth';
import getAlgBuilderService, {AlgBuilderService} from './alg-builder';

class BTCubeService {

  private _cube: BluetoothCube;
  private _algBuilder: AlgBuilderService;

  constructor() {
    this.init();
    this._algBuilder.reset();
  }

  init(): void {
    console.log('init');
    this._algBuilder = getAlgBuilderService();
    this._cube = createBluetooth();
  }

  connect(): void {
    console.log('connecting');
    this._cube.setCallback(this.callback.bind(this));
    this._cube.init();
  }

  callback(state: string, moves: string[], timestamps: [number, number], source: string): void {
    if (state === 'disconnected') {
      this.disconnect();
      return;
    }

    if (moves.length > 0) {
      this._algBuilder.addMove(moves[0], timestamps);
    }
  }

  isConnected(): boolean {
    return this._cube.isConnected();
  }

  disconnect(): void {
    console.log('disconnect');
    this._cube.stop();
  }
}

const cubeService = new BTCubeService();

export default function getCubeService(): BTCubeService {
  return cubeService;
}