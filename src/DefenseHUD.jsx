import { formatCountdown } from './defenseState';
export default function DefenseHUD({ game }) {
  const countdown = game.phase === 'countdown';
  const secured = game.phase === 'secured';
  const score = `${game.score < 0 ? '-' : ''}${String(Math.abs(game.score)).padStart(6, '0')}`;
  return <aside className={`defense-hud ${secured ? 'is-secured' : ''}`} aria-label="Core defense status">
    <div className="defense-hud-label"><i/>{countdown ? 'TRACE COMPLETES IN' : secured ? 'ALL FIVE WAVES CLEARED' : `LEVEL ${game.level} / ${game.level === 5 ? 'DDOS ATTACK' : 'CORE DEFENSE'}`}</div>
    <div className="defense-number" aria-hidden="true">{countdown ? formatCountdown(game.remaining) : game.phase === 'detonating' ? '00:00:00' : game.rewardMs > 0 ? `${game.delta > 0 ? '+' : ''}${game.delta}` : score}</div>
    <span className="sr-only" role="status">{countdown ? game.paused ? 'Countdown paused while reading.' : 'Open a card to pause the countdown.' : secured ? `Core secured. Final score ${game.score}.` : `Level ${game.level}. ${game.resolved} of ${game.quota} missiles resolved. Score ${game.score}.`}</span>
    <div className="defense-hud-note">{secured ? 'SECURED / RÉSUMÉ NODES RESTORED' : game.paused ? 'PAUSED / TAKE YOUR TIME' : countdown ? 'OPEN A CARD TO PAUSE THE TRACE' : `${game.resolved}/${game.quota} RESOLVED · TOTAL ${score}`}</div>
    {game.phase === 'playing' && game.powerup && <div className="defense-hud-note" style={{color:'#55ff91'}}>{game.powerup === 'flying' ? 'GREEN CUBE / SHOOT TO CAPTURE' : game.powerup === 'orbiting' ? 'AUTO DEFENSE / ZAP EVERY 2s' : game.powerup === 'lost' ? 'AUTO DEFENSE LOST / CORE IMPACT' : 'POWERUP LEFT THE FIELD'}</div>}
  </aside>;
}
