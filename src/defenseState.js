export const COUNTDOWN_MS = 30_000;
export const DETONATION_MS = 900;
export const POINTS_PER_INTERCEPT = 100;

export function initialDefenseState() {
  return { phase: 'idle', remaining: COUNTDOWN_MS, detonation: 0, score: 0, hits: 0, impacts: 0, rewardMs: 0, delta: 0, level: 1, resolved: 0, quota: 10 };
}

export function defenseReducer(state, action) {
  switch (action.type) {
    case 'POWERUP': return {...state, powerup:action.status};
    case 'ARM': return { ...initialDefenseState(), phase: 'countdown' };
    case 'DOSSIER_CLOSED': return state.phase === 'countdown' ? { ...state, remaining: COUNTDOWN_MS } : state;
    case 'WAVE': return state.phase === 'playing' ? { ...state, level: action.level, resolved: action.resolved, quota: action.quota } : state;
    case 'SECURED': return state.phase === 'playing' ? { ...state, phase: 'secured', rewardMs: 0 } : state;
    case 'IMPACT': return state.phase === 'playing' ? { ...state, score: state.score - 200, impacts: state.impacts + 1, delta: -200, rewardMs: 1000 } : state;
    case 'RESET': return initialDefenseState();
    case 'HIT': return state.phase === 'playing'
      ? { ...state, score: state.score + POINTS_PER_INTERCEPT, hits: state.hits + 1, delta: 100, rewardMs: 1000 }
      : state;
    case 'TICK': {
      if (action.paused || state.phase === 'idle') return state;
      const elapsed = Math.max(0, action.elapsed);
      if (state.phase === 'countdown') {
        const remaining = Math.max(0, state.remaining - elapsed);
        return remaining > 0 ? { ...state, remaining } : { ...state, phase: 'detonating', remaining: 0, detonation: Math.min(DETONATION_MS, elapsed - state.remaining) };
      }
      if (state.phase === 'detonating') {
        const detonation = state.detonation + elapsed;
        return { ...state, detonation, phase: detonation >= DETONATION_MS ? 'playing' : 'detonating' };
      }
      return state.rewardMs > 0 ? { ...state, rewardMs: Math.max(0, state.rewardMs - elapsed) } : state;
    }
    default: return state;
  }
}

// MM:SS:hundredths: 00:30:00 is thirty seconds, not thirty minutes.
export function formatCountdown(milliseconds) {
  const hundredths = Math.ceil(Math.max(0, milliseconds) / 10);
  return [Math.floor(hundredths / 6000), Math.floor(hundredths / 100) % 60, hundredths % 100]
    .map(value => String(value).padStart(2, '0')).join(':');
}

export function nearestMissile(targets, x, y, radius = 64) {
  let nearest = null; let closest = radius * radius;
  for (const target of targets) {
    const distance = (target.x - x) ** 2 + (target.y - y) ** 2;
    if (distance <= closest) { nearest = target; closest = distance; }
  }
  return nearest;
}
