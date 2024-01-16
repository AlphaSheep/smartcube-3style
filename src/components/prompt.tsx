import React from 'react';
import { useAppSelector } from '../state/hooks';
import { selectCurrentPrompt } from '../state/prompt.duck';

import './prompt.less';

export default function Prompt() {
  const prompt = useAppSelector(selectCurrentPrompt);

  return <div className="prompt">{prompt}</div>;
}