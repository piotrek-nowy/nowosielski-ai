import { useEffect, useRef } from 'react';

export function useTimer(running: boolean, onTick: () => void) {
  const callbackRef = useRef(onTick);
  callbackRef.current = onTick;

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => callbackRef.current(), 1000);
    return () => clearInterval(id);
  }, [running]);
}
