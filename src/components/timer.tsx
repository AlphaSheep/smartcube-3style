import React, {useState, useEffect} from "react";

export default function Timer({prompt, saveTime}) {
  const [startTime, setStart] = useState(0);
  const [time, setTime] = useState(0);

  const [isRunning, setRunning] = useState(false);
  const [isArmed, setArmed] = useState(false);

  const updateTime = () => {
    setTime(Date.now() - startTime);
  }

  const getCurrentTimeString = () => {
    if (!time)
      return "---";

    return (time / 1000).toFixed(2);
  }

  const onClick = () => {
    if (isRunning) {
      setRunning(false);
      // saveTime(getCurrentTime());
    } else {
      setStart(Date.now());
      setRunning(true);
    }
  }

  const onKeyUp = (event) => {
    if (isArmed && !isRunning && event.key === ' ') {
      onClick();
      setArmed(false);
    }
  }

  const onKeyDown = (event) => {
    if (event.key === ' ' && !event.repeat) {
      if (isRunning) {
        onClick();
      } else {
        setArmed(true);
        setTime(0)
      }
    }
  }

  useEffect(() => {
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('keydown', onKeyDown);
    }
  });

  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        updateTime();
      }, 30);
      return () => clearInterval(interval);
    }
  });

  return (
    <div className="timer-card" onClick={onClick}>
      <p>{prompt}</p>
      <p>{getCurrentTimeString()}</p>
    </div>);
}
