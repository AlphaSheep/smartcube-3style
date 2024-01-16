import React, {useState, useEffect} from "react";
import { useAppSelector } from "../state/hooks";
import { selectTrainerLastPromptTime } from "../state/trainer.duck";

export default function Timer() {
  const startTime = useAppSelector(selectTrainerLastPromptTime);
  const [time, setTime] = useState(0);

  const updateTime = () => {
    setTime(startTime? Date.now() - startTime : 0);
  }

  const getCurrentTimeString = () => {
    if (!time)
      return "---";

    return (time / 1000).toFixed(2);
  }

  useEffect(() => {
    if (startTime) {
      const interval = setInterval(() => {
        updateTime();
      }, 30);
      return () => clearInterval(interval);
    }
  });

  return (
    <div className="timer-card">
      <p className="digital">{getCurrentTimeString()}</p>
    </div>);
}
