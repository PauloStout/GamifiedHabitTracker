import { useState, useEffect } from "react";
import { createFocusSession, fetchDashboardData } from "../api/api";

export default function FocusSession({ onExit }) {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [repeatCount, setRepeatCount] = useState(1);
  const [currentSession, setCurrentSession] = useState(1);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [originalMinutes, setOriginalMinutes] = useState(25);

  const totalSeconds = minutes * 60 + seconds;

  // ✅ Save session to backend
  const saveSession = async () => {
    try {
      await createFocusSession({
        duration_minutes: originalMinutes,
        sessions_completed: repeatCount
      });

      await fetchDashboardData();
      alert("Focus session complete! XP awarded 💎");
      onExit(); // return to dashboard automatically after completion
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ Timer Logic
  useEffect(() => {
    let timer;

    if (isRunning && totalSeconds > 0) {
      timer = setInterval(() => {
        setSeconds(prev => {
          if (prev === 0) {
            if (minutes === 0) return 0;
            setMinutes(m => m - 1);
            return 59;
          }
          return prev - 1;
        });
      }, 1000);
    }

    if (isRunning && totalSeconds === 0) {
      clearInterval(timer);

      if (!isBreak) {
        // Start break
        setIsBreak(true);
        setMinutes(0);
        setSeconds(0);
      } else {
        // Break finished
        if (currentSession < repeatCount) {
          setCurrentSession(s => s + 1);
          setIsBreak(false);
          setMinutes(originalMinutes);
          setSeconds(0);
        } else {
          setIsRunning(false);
          saveSession();
        }
      }
    }

    return () => clearInterval(timer);
  }, [
    isRunning,
    seconds,
    minutes,
    totalSeconds,
    isBreak,
    currentSession,
    repeatCount
  ]);

  const formatTime = () => {
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  const start = () => setIsRunning(true);
  const pause = () => setIsRunning(false);

  const cancel = () => {
    setIsRunning(false);
    onExit();
  };

  const containerStyle = fullscreen
    ? {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "#111",
        color: "white",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999
      }
    : {
        padding: 20
      };

  return (
    <div style={containerStyle}>
      <h2>{isBreak ? "Break Time ☕" : "Focus Session"}</h2>

      {/* Settings (only before starting) */}
      {!isRunning && !isBreak && (
        <>
          <div style={{ marginBottom: 10 }}>
            <button
              onClick={() => {
                setMinutes(m => {
                  const newValue = m + 1;
                  setOriginalMinutes(newValue);
                  return newValue;
                });
              }}
            >
              +
            </button>

            <button
              onClick={() => {
                setMinutes(m => {
                  const newValue = Math.max(1, m - 1);
                  setOriginalMinutes(newValue);
                  return newValue;
                });
              }}
              style={{ marginLeft: 10 }}
            >
              -
            </button>
          </div>

          <div style={{ marginBottom: 10 }}>
            <label>
              How many sessions?{" "}
              <input
                type="number"
                min="1"
                value={repeatCount}
                onChange={(e) => setRepeatCount(Number(e.target.value))}
                style={{ width: 60 }}
              />
            </label>
          </div>

          <div>
            <label>
              Fullscreen?
              <input
                type="checkbox"
                checked={fullscreen}
                onChange={() => setFullscreen(!fullscreen)}
                style={{ marginLeft: 8 }}
              />
            </label>
          </div>
        </>
      )}

      {/* Timer */}
      <h1 style={{ fontSize: 60, margin: 20 }}>{formatTime()}</h1>

      {/* Controls */}
      {!isRunning ? (
        <button onClick={start} style={{ fontSize: 20 }}>
          ▶️ Start
        </button>
      ) : (
        <button onClick={pause}>Pause</button>
      )}

      <button onClick={cancel} style={{ marginTop: 20 }}>
        Cancel
      </button>

      <p style={{ marginTop: 15 }}>
        Session {currentSession} of {repeatCount}
      </p>
    </div>
  );
}
