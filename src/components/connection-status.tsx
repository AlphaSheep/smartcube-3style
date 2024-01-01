import React, { useEffect, useState } from 'react';

import getCubeService from '../services/bt-cube';

export default function ConnectionStatus() {
  const btCubeService = getCubeService();
  const [isConnected, setConnected] = useState(false);
  const [busyConnecting, setBusyConnecting] = useState(false);
  const [deviceName, setDeviceName] = useState("");

  useEffect(() => {
    const disconnectId = btCubeService.addDisconnectCallback(() => {
      setConnected(false);
    });
    return () => {
      btCubeService.removeDisconnectCallback(disconnectId);
    }
  });

  const onConnect = () => {
    setBusyConnecting(true);

    btCubeService.connect()
    .then(() => {
      setBusyConnecting(false);
      if (btCubeService.isConnected()) {
        console.log("connected");
        setConnected(true);
        setDeviceName(btCubeService.getDeviceName());
      } else {
        console.log("not connected");
        setConnected(false);
      }
    })
    .catch((error) => {
      console.error(error);
      setBusyConnecting(false);
    });
  };

  const onDisconnect = () => {
    btCubeService.disconnect();
  }

  return <>
    {isConnected ?
      <>
        <span>Connected to {deviceName}</span>
        <button onClick={onDisconnect}>Disconnect</button>
      </>
      :
        busyConnecting ?
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