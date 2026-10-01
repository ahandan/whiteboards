'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

const PRESETS = [1, 2, 3, 5, 10, 15, 20, 30];

export default function ClockTimer() {
  // Clock
  const [time, setTime] = useState('');
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    tick();
    const id = setInterval(tick, 10_000);
    return () => clearInterval(id);
  }, []);

  // Timer
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  }, []);

  const start = useCallback((seconds: number) => {
    stop();
    setSecondsLeft(seconds);
    setIsRunning(true);
    setShowPicker(false);
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          stop();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [stop]);

  const reset = useCallback(() => {
    stop();
    setSecondsLeft(0);
  }, [stop]);

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');
  const timerActive = isRunning || secondsLeft > 0;
  const isWarning = isRunning && secondsLeft <= 30 && secondsLeft > 0;
  const isDone = !isRunning && secondsLeft === 0 && timerActive;

  return (
    <div className="flex items-center gap-2 relative">
      {/* Clock */}
      <span className="text-sm text-gray-500 font-mono tabular-nums">{time}</span>

      <div className="w-px h-5 bg-gray-200" />

      {/* Timer button */}
      {timerActive ? (
        <div className="flex items-center gap-1.5">
          <span className={`text-sm font-mono tabular-nums font-medium
            ${isWarning ? 'text-red-500' : 'text-gray-700'}`}>
            {mm}:{ss}
          </span>
          {isRunning ? (
            <button
              aria-label="Pause"
              title="Pause"
              onClick={stop}
              className="w-7 h-7 flex items-center justify-center rounded-md text-gray-500 hover:bg-gray-100"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>
            </button>
          ) : (
            <button
              aria-label="Reprendre"
              title="Reprendre"
              onClick={() => start(secondsLeft)}
              className="w-7 h-7 flex items-center justify-center rounded-md text-gray-500 hover:bg-gray-100"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21" /></svg>
            </button>
          )}
          <button
            aria-label="Réinitialiser"
            title="Réinitialiser"
            onClick={reset}
            className="w-7 h-7 flex items-center justify-center rounded-md text-gray-500 hover:bg-gray-100"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
      ) : (
        <button
          aria-label="Minuterie"
          title="Minuterie"
          onClick={() => setShowPicker((v) => !v)}
          className="w-8 h-8 flex items-center justify-center rounded-md text-gray-500 hover:bg-gray-100"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="13" r="8" />
            <path d="M12 9v4l2 2" />
            <path d="M9 1h6" />
            <path d="M12 1v2" />
          </svg>
        </button>
      )}

      {/* Picker dropdown */}
      {showPicker && (
        <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg p-2 z-50 shadow-sm">
          <div className="grid grid-cols-4 gap-1">
            {PRESETS.map((m) => (
              <button
                key={m}
                onClick={() => start(m * 60)}
                className="px-2.5 py-1.5 text-sm text-gray-700 rounded-md hover:bg-gray-100 font-medium"
              >
                {m}m
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
