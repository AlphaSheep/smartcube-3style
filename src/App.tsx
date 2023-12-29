import React, { useState } from 'react';

import Timer from './components/timer';

import getCubeService from './services/bt-cube';
import getAlgBuilderService from './services/alg-builder';

export default function App() {

  const btCubeService = getCubeService();
  const algBuilder = getAlgBuilderService();

  const onConnect = () => {
    btCubeService.connect();
  };

  const onReset = () => {
    algBuilder.reset();
  }

  return <>
    <div className="container">
      <h1>Hello World</h1>

      <Timer prompt="AB" saveTime={null} />

      <button onClick={onConnect}>Connect</button>

      <button onClick={onReset}>Reset</button>
    </div>
  </>

}
