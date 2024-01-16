import React from "react";
import { useAppSelector } from "../state/hooks";

import './progress-bar.less';
import { selectCountOfPrompts, selectCurrentPromptIndex } from "../state/prompt.duck";

export default function ProgressBar() {

  const currentIndex = useAppSelector(selectCurrentPromptIndex);
  const total = useAppSelector(selectCountOfPrompts);

  const progress = currentIndex / total;

  return <div className="progress-bar">
    <div className="progress-indicator"
      style={{ width: `${progress * 100}%` }}
    />
  </div>
}