import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGear } from '@fortawesome/free-solid-svg-icons';

import ConnectionStatusButton from './components/connection-status';
import Settings from './components/settings';

export default function App() {
  const [showSettings, setShowSettings] = useState(false);

  return <>
    <div className="container">
      <div className="settings">
        <ConnectionStatusButton />

        <button onClick={()=>{setShowSettings(!showSettings)}}>
          <FontAwesomeIcon icon={faGear} />
        </button>

      </div>

      {showSettings ?
        <Settings />
      :
        <></>
      }

    </div>
  </>

}
