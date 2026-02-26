import { useEffect, useRef } from 'react';
import { GameState, GameAction } from '@/lib/solitaire/types';
import { canAutoComplete } from '@/lib/solitaire/moves';

export function useAutoComplete(
  state: GameState,
  dispatch: React.Dispatch<GameAction>,
  enabled: boolean
) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!enabled || state.gameStatus !== 'playing' || !canAutoComplete(state)) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      dispatch({ type: 'AUTO_COMPLETE_STEP' });
    }, 200);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, state.gameStatus, state, dispatch]);
}
