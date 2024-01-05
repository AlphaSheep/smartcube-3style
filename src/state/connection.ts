import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';

import getCubeService from '../services/bt-cube';

// Type definitions
export enum ConnectionStatus {
  Connecting = "Connecting",
  Connected = "Connected",
  Disconnecting = "Disconnecting",
  Disconnected = "Disconnected",
  Error = "Error",
}

type ConnectionState = {
  status: ConnectionStatus;
  deviceName?: string;
  error?: Error;
};

// Initial State
const initialState: ConnectionState = {
  status: ConnectionStatus.Disconnected,
};

// Selectors
export const selectConnectionState = (state: RootState) => state.connection;
export const selectDeviceName = (state: RootState) => state.connection.deviceName;
export const selectConnectionStatus = (state: RootState) => state.connection.status;
export const selectConnectionError = (state: RootState) => state.connection.error;
export const selectIsConnected = (state: RootState) => state.connection.status === ConnectionStatus.Connected;

// Slice
export const connectionSlice = createSlice({
  name: 'connection',
  initialState,
  reducers: {
    connect: (state) => {
      state.status = ConnectionStatus.Connecting;
    },
    connected: (state) => {
      state.status = ConnectionStatus.Connected;
      state.deviceName = getCubeService().getDeviceName();
    },
    disconnect: (state) => {
      state.status = ConnectionStatus.Disconnecting;
    },
    disconnected: (state) => {
      state.status = ConnectionStatus.Disconnected;
      state.deviceName = undefined;
    },
    errored: (state, action: PayloadAction<Error>) => {
      state.status = ConnectionStatus.Error;
      state.error = action.payload;
    },
  },
});

// Actions
export const { connect, connected, disconnect, disconnected, errored } = connectionSlice.actions;

// Middleware
export const connectionMiddleware = (store: any) => (next: any) => (action: any) => {
  next(action);
  if (action.type === 'connection/connect') {
    getCubeService().connect()
    .then(() => {
      store.dispatch(connected());
    })
    .catch((error: Error) => {
      store.dispatch(errored(error));
    });
  }
}

export const disconnectMiddleware = (store: any) => (next: any) => (action: any) => {
  next(action);
  console.log(action.type);

  if (action.type === 'connection/disconnect') {
    console.log('disconnecting');

    getCubeService().disconnect()
    .then(() => {
      store.dispatch(disconnected());
    })
    .catch((error: Error) => {
      store.dispatch(errored(error));
    });
  }
}