import { configureStore } from '@reduxjs/toolkit';
import getCubeService from '../services/bluetooth-cube';
import { connect, disconnect, connectionSlice, connectionMiddleware, disconnectMiddleware, ConnectionStatus } from './connection.duck';

jest.mock('../services/bluetooth-cube', () => ({
  __esModule: true,
  default: jest.fn(),
}));

test.each<['connect' | 'disconnect', Error | string]>([
  ['connect', new Error('Bluetooth is not available')],
  ['connect', 'Cannot detect device type'],
  ['disconnect', new Error('Device disconnected')],
  ['disconnect', 'Device disconnected'],
])('%s failures store the message without Redux serialization warnings', async (operation, error) => {
  const service = { connect: jest.fn(), disconnect: jest.fn() };
  jest.mocked(getCubeService).mockReturnValue(service as any);
  service[operation].mockRejectedValue(error);
  const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  try {
    const store = configureStore({
      reducer: { connection: connectionSlice.reducer },
      middleware: getDefaultMiddleware => getDefaultMiddleware().concat(connectionMiddleware, disconnectMiddleware),
    });
    store.dispatch(operation === 'connect' ? connect() : disconnect());
    await new Promise(resolve => setImmediate(resolve));
    expect(store.getState().connection).toEqual({
      status: ConnectionStatus.Error,
      error: error instanceof Error ? error.message : error,
    });
    expect(consoleError).not.toHaveBeenCalled();
  } finally {
    consoleError.mockRestore();
  }
});
