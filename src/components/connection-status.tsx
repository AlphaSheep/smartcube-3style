import React from 'react';
import { useAppSelector, useAppDispatch } from '../state/hooks';
import { selectConnectionStatus, selectDeviceName, ConnectionStatus, connect, disconnect, selectIsConnected } from '../state/connection.duck';

import './connection-status.less';

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

  return <div className='connection-status'>
    {isConnected ?
      <>
        <span>Connected to {deviceName}</span>
        <button className='btn btn-danger' onClick={onDisconnect}>Disconnect</button>
      </>
      :
      (connectionStatus === ConnectionStatus.Connecting) ?
        <>
          <span>Connecting...</span>
        </>
        :
        <>
          <button className='btn btn-primary' onClick={onConnect}>Connect</button>
        </>
    }
  </div>

}
