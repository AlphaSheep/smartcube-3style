import React, { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../state/hooks';

import Timer from './timer';
import { resetPrompt } from '../state/prompt.duck';
import Prompt from './prompt';

export default function TrainerPage() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(resetPrompt());
  });

  return <div className='trainer-page'>
    <Prompt />
    <Timer saveTime={undefined} />
  </div>
}