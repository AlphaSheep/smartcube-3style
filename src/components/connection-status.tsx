import React, { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../state/hooks';
import { selectConnectionStatus, selectDeviceName, ConnectionStatus, connect, disconnect, selectIsConnected } from '../state/connection.duck';

export default function ConnectionStatusButton() {
  const dispatch = useAppDispatch();

  const connectionStatus = useAppSelector(selectConnectionStatus);
  const deviceName = useAppSelector(selectDeviceName);
  const isConnected = useAppSelector(selectIsConnected);

  const onConnect = () => {
    dispatch(connect())
  };

  const onDisconnect = () => {
    dispatch(disconnect());
  }

  return <>
    {isConnected ?
      <>
        <span>Connected to {deviceName}</span>
        <button onClick={onDisconnect}>Disconnect</button>
      </>
      :
        (connectionStatus === ConnectionStatus.Connecting) ?
          <>
            <span>Connecting...</span>
          </>
        :
          <>
            <button onClick={onConnect}>Connect</button>
          </>
     }
  </>

}