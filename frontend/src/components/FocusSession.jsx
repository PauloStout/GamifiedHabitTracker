import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { createFocusSession } from "../api/api";

export default function FocusSession({ onExit, onComplete }) {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [repeatCount, setRepeatCount] = useState(1);
  const [currentSession, setCurrentSession] = useState(1);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [originalMinutes, setOriginalMinutes] = useState(25);

  const totalSeconds = minutes * 60 + seconds;

  const adjustMinutes = (amount) => {
    setMinutes((prev) => {
      // Ensures we always jump to the next 5-minute block (e.g., 1 + 5 = 5, not 6)
      const next = Math.max(5, Math.round((prev + amount) / 5) * 5);
      setOriginalMinutes(next);
      return next;
    });
  };

  useEffect(() => {
    let timer;
    const finishAllSessions = async () => {
      try {
        const response = await createFocusSession({
          duration_minutes: originalMinutes,
          sessions_completed: repeatCount,
        });
        if (onComplete) await onComplete(response?.xp_earned ?? 0);
        if (onExit) onExit();
      } catch (err) { console.error(err); }
    };

    if (isRunning && totalSeconds > 0) {
      timer = setInterval(() => {
        setSeconds(prev => {
          if (prev === 0) { setMinutes(m => m - 1); return 59; }
          return prev - 1;
        });
      }, 1000);
    }

    if (isRunning && totalSeconds === 0) {
      clearInterval(timer);
      if (!isBreak) {
        setIsBreak(true); setMinutes(5); setSeconds(0);
      } else if (currentSession < repeatCount) {
        setCurrentSession(prev => prev + 1); setIsBreak(false);
        setMinutes(originalMinutes); setSeconds(0);
      } else {
        setIsRunning(false); finishAllSessions();
      }
    }
    return () => clearInterval(timer);
  }, [isRunning, totalSeconds, isBreak, currentSession, repeatCount, originalMinutes, onComplete, onExit]);

  const formatTime = () => `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const content = (
    <div className={(fullscreen && isRunning) ? "focus-fs-overlay" : "focus-card-mini"}>
      <div className="focus-inner">
        <h3 className="focus-status-text">{isBreak ? "Break Time ☕" : ""}</h3>

        <div className="focus-main-circle">
          {!isRunning && (
            <button className="timer-nav up" onClick={() => adjustMinutes(5)}>▲</button>
          )}

          <div className="timer-digits">
            {formatTime()}
          </div>

          {!isRunning && (
            <button className="timer-nav down" onClick={() => adjustMinutes(-5)}>▼</button>
          )}
        </div>

        <div className="focus-controls-area">
          {!isRunning && (
            <div className="focus-config-row">
              <div className="rounds-input">
                <span>Rounds:</span>
                <input type="number" value={repeatCount} onChange={(e) => setRepeatCount(Math.max(1, Number(e.target.value)))} />
              </div>
              <label className="fs-toggle-compact">
                <input type="checkbox" checked={fullscreen} onChange={() => setFullscreen(!fullscreen)} />
                <span>Fullscreen</span>
              </label>
            </div>
          )}

          <div className="focus-btn-row">
            <button className="focus-start-pause" onClick={() => setIsRunning(!isRunning)}>
              {isRunning ? "PAUSE" : "START"}
            </button>
            <button className="focus-exit-btn" onClick={onExit}>EXIT</button>
          </div>

          {isRunning && <span className="session-progress">Round {currentSession} / {repeatCount}</span>}
        </div>
      </div>
    </div>
  );

  return (fullscreen && isRunning) ? createPortal(content, document.body) : content;
}