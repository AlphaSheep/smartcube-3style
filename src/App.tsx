import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGear } from '@fortawesome/free-solid-svg-icons';

import ConnectionStatusButton from './components/connection-status';
import Settings from './components/settings';
import TrainerPage from './components/trainer';
import NotConnectedMessage from './components/not-connected-message';

import './lib/cube/cube';
import { useAppSelector } from './state/hooks';
import { selectIsConnected } from './state/connection.duck';
import { Footer } from './components/footer';

export default function App() {
  const [showSettings, setShowSettings] = useState(false);
  const isConnected = useAppSelector(selectIsConnected);

  const closeSettings = () => setShowSettings(false);

  return <>
    <div className="header">
      <ConnectionStatusButton />

      <button
        className='btn btn-default'
        onClick={() => { setShowSettings(!showSettings) }}
      >
        <FontAwesomeIcon icon={faGear} />
      </button>
    </div>

    <div className="container">
      {showSettings ? <Settings closeSettings={closeSettings} /> : null}
      {!isConnected && !showSettings ? <NotConnectedMessage /> : null}
      {isConnected && !showSettings ? <TrainerPage /> : null}
    </div>

    <div className="footer">
      <Footer />
    </div>
  </>

}
