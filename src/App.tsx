import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGear } from '@fortawesome/free-solid-svg-icons';

import ConnectionStatusButton from './components/connection-status';
import Settings from './components/settings';
import Timer from './components/timer';
import NotConnectedMessage from './components/not-connected-message';


import './lib/cube/cube';
import { useAppSelector } from './hooks';
import { selectIsConnected } from './state/connection';

export default function App() {
  const [showSettings, setShowSettings] = useState(false);
  const isConnected = useAppSelector(selectIsConnected);

  return <>
    <div className="header">
      <ConnectionStatusButton />

      <button onClick={()=>{setShowSettings(!showSettings)}}>
        <FontAwesomeIcon icon={faGear} />
      </button>
    </div>

    <div className="container">
      {showSettings ? <Settings /> : null}
      {!isConnected && !showSettings ? <NotConnectedMessage /> : null}
      {isConnected && !showSettings ? <Timer prompt={"AB"} saveTime={undefined} /> : null}
    </div>
  </>

}
