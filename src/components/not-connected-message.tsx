import React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBluetoothB } from "@fortawesome/free-brands-svg-icons";

import './not-connected-message.less';

export default function NotConnectedMessage() {
  return <div className="not-connected-message">
    <p>
      Connect a Bluetooth smart cube to get started.
    </p>
    <div className="icon">
      <FontAwesomeIcon icon={faBluetoothB} />
    </div>
  </div>
}