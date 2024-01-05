import { createBluetooth, BluetoothCube } from '../lib/bluetooth';
import getAlgBuilderService, {AlgBuilderService} from './alg-builder';

type CallbackWithID = {
  id: number,
  callback: () => void
};

class BTCubeService {

  private _cube: BluetoothCube;
  private _algBuilder: AlgBuilderService;

  private _connectCallbacks: CallbackWithID[] = [];
  private _disconnectCallbacks: CallbackWithID[] = [];

  constructor() {
    this.init();
    this._algBuilder.reset();
  }

  init(): void {
    this._algBuilder = getAlgBuilderService();
    this._cube = createBluetooth();
  }

  async connect(): Promise<void> {
    this._cube.setCallback(this.moveReceivedCallback.bind(this));

    await this._cube.init();
    this._connectCallbacks.forEach(cb => {
      cb.callback();
    });
  }

  async disconnect(): Promise<void> {
    await this._cube.stop();

    this._disconnectCallbacks.forEach(cb => {
      cb.callback();
    });
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
      console.log(state);

      this._algBuilder.addMove(moves[0], timestamps);
    }
  }

  private getNextId(callbacks: CallbackWithID[]): number {
    let id = 0;
    callbacks.map((cb) => {
      if (cb.id >= id) {
        id = cb.id + 1;
      }
    });

    return id;
  }

  addConnectCallback(callback: () => void): number {
    let id = this.getNextId(this._connectCallbacks);
    this._connectCallbacks.push({id, callback});
    return id;
  }

  addDisconnectCallback(callback: () => void): number {
    let id = this.getNextId(this._disconnectCallbacks);
    this._disconnectCallbacks.push({id, callback});
    return id;
  }

  removeConnectCallback(id: number): void {
    this._connectCallbacks = this._connectCallbacks.filter((cb) => cb.id !== id);
  }

  removeDisconnectCallback(id: number): void {
    this._disconnectCallbacks = this._disconnectCallbacks.filter((cb) => cb.id !== id);
  }

}

const cubeService = new BTCubeService();

export default function getCubeService(): BTCubeService {
  return cubeService;
}