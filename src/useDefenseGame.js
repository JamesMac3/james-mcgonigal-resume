import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { defenseReducer, initialDefenseState } from './defenseState';

export default function useDefenseGame(reveal, suspended, dossierOpen) {
  const [game, dispatch] = useReducer(defenseReducer, undefined, initialDefenseState);
  const [paused, setPaused] = useState(false);
  const [hidden, setHidden] = useState(() => document.hidden);
  const isPaused = paused || hidden || suspended || dossierOpen;
  const pausedRef = useRef(isPaused);
  const previousDossier = useRef(dossierOpen);
  useEffect(() => {
    if (previousDossier.current && !dossierOpen) dispatch({ type: 'DOSSIER_CLOSED' });
    previousDossier.current = dossierOpen;
  }, [dossierOpen]);
  useEffect(() => { pausedRef.current = isPaused; }, [isPaused]);
  useEffect(() => {
    dispatch({ type: reveal ? 'ARM' : 'RESET' });
    setPaused(false);
  }, [reveal]);
  useEffect(() => {
    const changed = () => setHidden(document.hidden);
    document.addEventListener('visibilitychange', changed);
    return () => document.removeEventListener('visibilitychange', changed);
  }, []);
  useEffect(() => {
    if (!reveal) return;
    let frame; let previous = performance.now(); let accumulated = 0;
    function tick(now) {
      const elapsed = now - previous; previous = now;
      if (!pausedRef.current && !document.hidden) accumulated += Math.min(elapsed, 100);
      if (accumulated >= 30) { dispatch({ type: 'TICK', elapsed: accumulated }); accumulated = 0; }
      frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [reveal]);
  const onGameEvent = useCallback(event => dispatch(event), []);
  const intercept = useCallback(() => dispatch({ type: 'HIT' }), []);
  const togglePause = useCallback(() => setPaused(value => !value), []);
  return { ...game, paused: isPaused, manuallyPaused: paused, onGameEvent, intercept, togglePause };
}
