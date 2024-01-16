import React, { useState, useEffect, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '../state/hooks';

import Timer from './timer';
import { resetPrompt } from '../state/prompt.duck';
import Prompt from './prompt';
import Moves from './moves';
import { selectTrainerActive, startTraining } from '../state/trainer.duck';
import Summary from './summary';

export default function TrainerPage() {
  const dispatch = useAppDispatch();

  const isActive = useAppSelector(selectTrainerActive);

  useEffect(() => {
    dispatch(resetPrompt());
  });

  return <div className='trainer-page'>
    {isActive ?
      <>
        <Prompt />
        <Timer />
        <Moves />
      </>
    :
      <>
        <ActivateButton />
        <Instructions />
        <Summary />
      </>

    }
  </div>
}

function ActivateButton() {
  const Ref: any = useRef(null);

  const dispatch = useAppDispatch();

  const COUNTDOWN_START_TIME = 3;

  const [showCountdown, setShowCountDown] = useState(false);
  const [time, setTime] = useState(COUNTDOWN_START_TIME);

  const startCountDown = () => {
    console.log('startCountDown');

    setTime(COUNTDOWN_START_TIME);
    setShowCountDown(true);
    Ref.current = setInterval(timeoutCallback, 1000);
  }

  const endCountDown = () => {
    console.log('endCountDown');

    if (Ref.current) clearInterval(Ref.current);
    setShowCountDown(false);
    dispatch(startTraining());
  }

  const timeoutCallback = () => {
    setTime((prevTime) => {
      console.log(prevTime);
      if (prevTime > 0) {
        console.log('timeoutCallback', time);

        return prevTime - 1;
      } else {
        endCountDown();
        return COUNTDOWN_START_TIME;
      }
    });
  }

  return <div className='start-button-container'>
    {showCountdown ?
      <div className='countdown'>{time}</div>
    :
      <button
      className='btn btn-primary btn-large'
        onClick={startCountDown}
      >Start</button>
    }
  </div>
}

function Instructions() {
  return <div className='instructions'>
    <p> U U' &times; 3 &nbsp;&nbsp; to skip to the next prompt. </p>
    <p> R R' &times; 3 &nbsp;&nbsp; to redo to the previous prompt. </p>
    <p> L L' &times; 3 &nbsp;&nbsp; to end the session. </p>
  </div>
}
