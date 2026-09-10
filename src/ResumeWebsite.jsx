import { Component, lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import MatrixRain from './MatrixRain';
import { missions, capabilities } from './resumeData';
import './ResumeWebsite.css';

const MachineScene = lazy(() => import('./MachineScene'));
class SceneBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? null : this.props.children; }
}
const sections = ['identity', 'missions', 'projects', 'skills', 'contact'];
const titles = { identity: 'The operator', missions: 'Mission archive', projects: 'Active systems', skills: 'Capability matrix', contact: 'Establish connection' };
const bootLines = [
  ['INIT', 'Locating a signal beneath the noise…'],
  ['OK', 'Identity archive found: JAMES_MCGONIGAL'],
  ['OK', 'Constructing neural interface…'],
  ['OK', 'Five memory nodes attached.'],
  ['WAIT', 'The next move is yours.'],
];
function useMotionPreference() {
  const [quiet, setQuiet] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const changed = event => setQuiet(event.matches);
    media.addEventListener('change', changed);
    return () => media.removeEventListener('change', changed);
  }, []);
  return [quiet, setQuiet];
}
function Mark() {
  return <svg viewBox="0 0 40 40" aria-hidden="true"><path d="m20 2 17 9v18l-17 9L3 29V11Z"/><path d="M11 25V15l9 10 9-10v10M20 8v5M20 28v5"/></svg>;
}
function Entry({ phase, quiet, setQuiet, onEnter }) {
  const [count, setCount] = useState(quiet ? 5 : 0);
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const answerInput = useRef(null);
  useEffect(() => {
    if (quiet || count >= 5) return;
    const timeout = setTimeout(() => setCount(value => value + 1), 320);
    return () => clearTimeout(timeout);
  }, [quiet, count]);
  const complete = quiet || count >= 5;
  useEffect(() => { if (complete && !window.matchMedia('(pointer: coarse)').matches) answerInput.current?.focus(); }, [complete]);
  function decide(value) {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'y' || normalized === 'yes') onEnter();
    else if (normalized === 'n' || normalized === 'no') window.location.assign('https://www.google.com/');
    else setError('Choose Y to enter or N to return to Google.');
  }
  return <main className={`entry ${phase === 'breaching' ? 'is-breaching' : ''}`}>
    <MatrixRain warp={phase === 'breaching'} quiet={quiet}/><div className="entry-vignette"/>
    <header className="entry-header"><a href="#" aria-label="The Breach"><Mark/><span>THE BREACH<span className="dim"> / JM.02</span></span></a><button onClick={() => setQuiet(value => !value)}>{quiet ? 'MOTION OFF' : 'MOTION ON'}</button></header>
    <div className="entry-coordinate" aria-hidden="true">FOLLOW THE SIGNAL<br/>THE SURFACE IS ONLY THE BEGINNING.</div>
    <section className="entry-console" aria-labelledby="entry-title">
      <div className="console-chrome"><span><i/> UNREGISTERED CONNECTION</span><span>PORT 001</span></div>
      <div className="boot-log" aria-hidden="true">{bootLines.slice(0, quiet ? 5 : count).map(([state, text], index) => <div key={text}><span className={state === 'WAIT' ? 'amber' : ''}>[{state}]</span><span>{text}</span><small>{`0x${(index * 271 + 6400).toString(16)}`}</small></div>)}</div>
      <div className={`entry-question ${complete ? 'visible' : ''}`}>
        <p className="overline">YOU FOUND THE BACK DOOR.</p>
        <h1 id="entry-title">Reality is an<br/><em>interface.</em></h1>
        <p className="entry-description">There’s a human behind this machine.<br/>Step inside and find out how he thinks.</p>
        <form onSubmit={event => { event.preventDefault(); decide(answer); }}>
          <label htmlFor="entry-answer">Break the mainframe? <span>[Y/N]</span></label>
          <div className="entry-input"><span aria-hidden="true">root@unknown:~$</span><input ref={answerInput} id="entry-answer" value={answer} onChange={event => { setAnswer(event.target.value); setError(''); }} maxLength={8} autoComplete="off" autoCapitalize="none" spellCheck="false" placeholder="_" disabled={!complete || phase === 'breaching'} aria-describedby="entry-help entry-error"/><span className="enter-key-hint" aria-hidden="true">↵</span></div>
          <div id="entry-error" className="input-error" role="status">{error}</div>
        </form>
        <p id="entry-help" className="entry-help">TYPE Y OR N, THEN PRESS ENTER.</p>
      </div>
    </section>
    {phase === 'breaching' && <div className="breach-transition" role="status"><div className="tunnel" aria-hidden="true">{Array.from({length: 8}, (_, i) => <span key={i} style={{'--i': i}}/>)}</div><div className="transition-title"><small>CHOICE ACCEPTED</small><strong>WAKE UP<span>_</span></strong><p>Reconstructing the world around you…</p></div></div>}
    <footer className="entry-footer"><span>JAMES MCGONIGAL / INTERACTIVE DOSSIER</span><span>Y / ENTER THE SYSTEM · N / RETURN TO GOOGLE</span></footer>
  </main>;
}
function DossierContent({ section }) {
  switch (section) {
    case 'identity': return <>
      <span className="file-caption">HUMAN / NOT A SIMULATION</span><h3 className="identity-name">James<br/>McGonigal<span>_</span></h3>
      <p className="file-lead">Air Force veteran. CTO. Security consultant. Builder of things that should exist.</p>
      <p>I’m a senior IT leader with 10+ years of experience turning complex problems into working systems. My work spans cyber defense, automation, infrastructure, and the people who depend on them.</p>
      <p>Partner and CTO at Quantify. Admin of <a href="https://flockblocktn.org" target="_blank" rel="noreferrer">FlockblockTn.org ↗</a>, the anti-surveillance, open-source investigation platform.</p>
      <div className="file-stats"><div><b>10+</b><span>YEARS IN TECHNOLOGY</span></div><div><b>$460K</b><span>MODERNIZATION / OSAN</span></div></div>
      <h4>Curiosity has no off switch.</h4><div className="chips">{['AI & machine learning', 'Game development & VR', 'White hat hacking', 'Lockpicking & physical security', 'UI/UX & digital art', '3D printing & prototyping', 'Road cycling & fitness'].map(value => <span key={value}>{value}</span>)}</div>
    </>;
    case 'missions': return <><p className="file-lead">From the flight line to the command line.</p>{missions.map((mission, i) => <details className="mission-file" key={mission.code} open={i === 0}><summary><span className="file-caption">{mission.period}</span><h3>{mission.place}<span>+</span></h3><small>{mission.role}</small></summary><p>{mission.text}</p><div className="chips">{mission.tags.map(tag => <span key={tag}>{tag}</span>)}</div>{mission.url && <a className="file-link" href={mission.url} target="_blank" rel="noreferrer">{mission.label} ↗</a>}</details>)}</>;
    case 'projects': return <><p className="file-lead">Different systems. Deliberate intent.</p><article className="system-project flock-project"><span className="file-caption">01 / PLATFORM ADMIN</span><div className="project-glyph" aria-hidden="true">◉<span>╱</span></div><h3>FLOCKBLOCK<span>TN</span></h3><p>An anti-surveillance, open-source investigation platform. Technology in service of transparency and digital autonomy.</p><a className="file-link" href="https://flockblocktn.org" target="_blank" rel="noreferrer">OPEN FLOCKBLOCKTN.ORG ↗</a></article><article className="system-project"><span className="file-caption">02 / PARTNER & CTO</span><h3>QUANTIFY<span>_</span></h3><p>An algorithm-driven portfolio platform. Leading automated infrastructure, DevOps pipelines, cybersecurity upgrades, and Web3 tokenization.</p><a className="file-link" href="https://www.quantify.bot" target="_blank" rel="noreferrer">OPEN QUANTIFY ↗</a></article></>;
    case 'skills': return <><p className="file-lead">Four disciplines. One connected system.</p>{capabilities.map(([id, title, sub, description]) => <article className="capability-file" key={id}><span className="file-caption">{id} / {sub}</span><h3>{title}</h3><p>{description}</p></article>)}<h4>Credentials & education</h4><ul className="credentials-list">{['Secret Security Clearance (Active)', 'CompTIA Security+ (Active)', 'CompTIA Pentest+ (In Progress)', 'CCNA Bootcamp', 'IT Management — CCAF'].map(value => <li key={value}>{value}</li>)}</ul></>;
    case 'contact': return <><span className="file-caption">HUMAN-TO-HUMAN PROTOCOL</span><h3 className="contact-title">Let’s build<br/>what’s <em>next.</em></h3><p className="file-lead">A complex problem. An unusual idea. A system worth improving.</p><p>Start a conversation.</p><a className="contact-card" href="mailto:Admin@JamesMcGonigal.com"><small>EMAIL / DIRECT UPLINK</small><span>Admin@JamesMcGonigal.com ↗</span></a><a className="contact-card" href="https://www.linkedin.com/in/quantify" target="_blank" rel="noreferrer"><small>PROFESSIONAL NETWORK</small><span>Connect on LinkedIn ↗</span></a><p className="file-note">No forms. No black box. Just a direct connection.</p></>;
    default: return null;
  }
}
function Terminal({ onClose, onSelect, onReveal, onResume }) {
  const [value, setValue] = useState('');
  const [history, setHistory] = useState(['THE BREACH / LOCAL COMMAND INTERFACE', 'Type help. There is more beneath the surface.']);
  const field = useRef(null); const log = useRef(null); const dialog = useRef(null);
  useEffect(() => { const previous = document.activeElement; field.current?.focus(); return () => { if (previous?.isConnected) previous.focus(); }; }, []);
  useEffect(() => { log.current.scrollTop = log.current.scrollHeight; }, [history]);
  const run = event => {
    event.preventDefault(); const command = value.toLowerCase().trim(); setValue(''); if (!command) return;
    if (command === 'clear') { setHistory([]); return; }
    if (command === 'exit') { onClose(); return; }
    if (command === 'resume') { onResume(); onClose(); return; }
    if (sections.includes(command) || command === 'whoami') { onSelect(command === 'whoami' ? 'identity' : command); onClose(); return; }
    const response = command === 'help' ? 'whoami / missions / projects / skills / contact / reveal / resume / clear / exit' : command === 'reveal' ? 'Shell separation initiated. Look beneath the surface.' : command === 'sudo' ? 'You already have permission to think for yourself.' : `Unknown command: ${command}. Type help.`;
    if (command === 'reveal') onReveal();
    setHistory(old => [...old.slice(-50), `visitor@breach:~$ ${command}`, response]);
  };
  return <div className="terminal-scrim" onClick={onClose}><section ref={dialog} className="terminal-window" role="dialog" aria-modal="true" aria-labelledby="terminal-title" onClick={event => event.stopPropagation()} onKeyDown={event => {
    if (event.key === 'Escape') { event.stopPropagation(); onClose(); }
    if (event.key === 'Tab') { event.preventDefault(); field.current.focus(); }
  }}><div className="console-chrome"><span id="terminal-title">&gt;_ COMMAND INTERFACE</span><span>TYPE EXIT / ESC</span></div><div className="terminal-log" ref={log} role="log" aria-live="polite">{history.map((text, index) => <p key={index}>{text}</p>)}</div><form onSubmit={run}><label htmlFor="terminal-command">visitor@breach:~$</label><input id="terminal-command" ref={field} autoComplete="off" autoCapitalize="none" spellCheck="false" value={value} onChange={event => setValue(event.target.value)} aria-label="Terminal command"/></form></section></div>;
}
export default function ResumeWebsite() {
  const [quiet, setQuiet] = useMotionPreference();
  const [phase, setPhase] = useState('entry');
  const [active, setActive] = useState(null);
  const [reveal, setReveal] = useState(false);
  const [readable, setReadable] = useState(false);
  const [terminal, setTerminal] = useState(false);
  const [fallback, setFallback] = useState(false);
  const enterTimer = useRef(null); const panel = useRef(null); const terminalButton = useRef(null); const lastOpener = useRef(null);
  const onFallback = useCallback(() => { setFallback(true); setReadable(true); }, []);
  const select = useCallback(id => { lastOpener.current = document.activeElement; setReveal(true); setActive(old => old === id ? null : id); }, []);
  const toggleReveal = () => { if (reveal) setActive(null); setReveal(value => !value); };
  const closePanel = useCallback(() => { setActive(null); if (lastOpener.current?.isConnected) lastOpener.current.focus(); }, []);
  useEffect(() => () => clearTimeout(enterTimer.current), []);
  useEffect(() => { if (active) panel.current?.focus(); }, [active]);
  useEffect(() => {
    const key = event => {
      if (event.key === 'Escape' && !terminal) closePanel();
      if (phase !== 'inside' || terminal || readable || /INPUT|TEXTAREA/.test(event.target.tagName)) return;
      if (event.key.toLowerCase() === 't') { event.preventDefault(); setTerminal(true); }
      if (/^[1-5]$/.test(event.key)) { event.preventDefault(); select(sections[Number(event.key) - 1]); }
    };
    window.addEventListener('keydown', key); return () => window.removeEventListener('keydown', key);
  }, [phase, terminal, readable, select, closePanel]);
  useEffect(() => {
    let closed = [];
    const before = () => { closed = [...document.querySelectorAll('.print-resume details:not([open])')]; closed.forEach(item => { item.open = true; }); };
    const after = () => closed.forEach(item => { item.open = false; });
    window.addEventListener('beforeprint', before); window.addEventListener('afterprint', after);
    return () => { window.removeEventListener('beforeprint', before); window.removeEventListener('afterprint', after); };
  }, []);
  const enter = () => { if (phase === 'breaching') return; setPhase('breaching'); enterTimer.current = setTimeout(() => setPhase('inside'), quiet ? 120 : 2100); };
  const closeTerminal = () => { setTerminal(false); terminalButton.current?.focus(); };
  return <div className={`breach-os ${quiet ? 'quiet' : ''} ${reveal ? 'revealed' : ''}`}>
    {phase !== 'inside' ? <Entry phase={phase} quiet={quiet} setQuiet={setQuiet} onEnter={enter}/> : <>
      <header className="os-header"><button className="os-brand" onClick={() => { setReadable(false); setActive(null); }}><Mark/><span>THE BREACH<small>JAMES MCGONIGAL / PERSONAL SYSTEM</small></span></button><div className="system-status"><i/> {reveal ? 'UNDERLYING STRUCTURE EXPOSED' : 'CONNECTION ESTABLISHED'}</div><button className="utility readable-toggle" onClick={() => setReadable(value => !value)}>{readable ? '◈ ENTER 3D SYSTEM' : '↗ READABLE RÉSUMÉ'}</button></header>
      {!readable && !fallback ? <main className={`world ${active ? 'has-dossier' : ''}`}>
        <div className="world-rain"><MatrixRain quiet={quiet} red={reveal}/></div><div className="world-vignette"/>
        <SceneBoundary onFailure={onFallback}><Suspense fallback={<div className="loading-scene" role="status">CONSTRUCTING YOUR REALITY<span>_</span></div>}><MachineScene active={active} reveal={reveal} quiet={quiet} onSelect={select} onFallback={onFallback} onPulse={toggleReveal}/></Suspense></SceneBoundary>
        <div className="world-title"><span className="overline">YOU’RE ON THE OTHER SIDE.</span><h1>A mind.<br/>A machine.<br/><em>No fixed limits.</em></h1><p>James McGonigal<span>CTO / CYBER DEFENSE / BUILDER</span></p></div>
        <aside className="system-telemetry" aria-hidden="true"><span>NEURAL TOPOLOGY / JM.02</span><div className="telemetry-bars">{Array.from({length: 18}, (_, i) => <i key={i} style={{'--i': i}}/>)}</div><p>05 NODES ATTACHED<br/>01 HUMAN AT THE CORE<br/>∞ POSSIBLE CONNECTIONS</p><span className="vertical-readout">OBSERVE → QUESTION → RECONSTRUCT</span></aside>
        <div className="core-caption" aria-hidden="true"><span>{reveal ? 'SHELL SEPARATION COMPLETE' : 'IDENTITY ENGINE'}</span><small>{reveal ? 'THE STRUCTURE WAS ALWAYS THERE.' : 'EVERYTHING IS CONNECTED.'}</small></div>
        {active && <section ref={panel} className="dossier-panel" aria-labelledby="dossier-title" tabIndex={-1} key={active}><div className="dossier-attachment" aria-hidden="true"/><div className="dossier-chrome"><span>NODE 0{sections.indexOf(active) + 1} / DECRYPTED</span><button onClick={closePanel} aria-label="Close dossier">ESC ×</button></div><div className="dossier-scroll"><h2 id="dossier-title">{titles[active]}<span>↳</span></h2><DossierContent section={active}/></div><div className="dossier-footer"><span>CONNECTED TO IDENTITY ENGINE</span><button onClick={() => select(sections[(sections.indexOf(active) + 1) % 5])}>NEXT NODE →</button></div></section>}
        <div className="world-controls"><span className="interaction-hint">DRAG TO ORBIT <b>·</b> {reveal ? 'SELECT A NODE' : 'EXPOSE THE CORE'} <b>·</b> KEYS 1–5</span><div><button className="utility" aria-pressed={reveal} onClick={toggleReveal}>◈ {reveal ? 'RESTORE THE SHELL' : 'REVEAL THE SYSTEM'}</button><button className="utility" ref={terminalButton} onClick={() => setTerminal(true)}>&gt;_ TERMINAL <kbd>T</kbd></button><button className="motion-button" aria-pressed={!quiet} onClick={() => setQuiet(value => !value)} aria-label={quiet ? 'Enable animation' : 'Pause animation'}>{quiet ? '▶' : 'Ⅱ'}</button></div></div>
      </main> : <main className="readable-resume"><div className="resume-intro"><span className="overline">THE HUMAN-READABLE EDITION</span><h1>James McGonigal<span>_</span></h1><p>CTO · Air Force veteran · Cyber-defense leader</p><div><button className="utility" onClick={() => window.print()}>PRINT / SAVE PDF ↓</button>{!fallback && <button className="utility" onClick={() => setReadable(false)}>RETURN TO THE MACHINE ↗</button>}</div>{fallback && <p role="status">The 3D scene isn’t available in this browser. Your full résumé is available here.</p>}</div>{sections.map(section => <section className="readable-section" key={section} id={`resume-${section}`}><h2>{titles[section]}</h2><DossierContent section={section}/></section>)}</main>}
      {!readable && !fallback && <nav className="module-dock" aria-label="Résumé modules">{sections.map((section, index) => <button key={section} onClick={() => select(section)} aria-pressed={active === section}><span>0{index + 1}</span>{titles[section]}</button>)}</nav>}
      {terminal && <Terminal onClose={closeTerminal} onSelect={select} onReveal={toggleReveal} onResume={() => setReadable(true)}/>}
    </>}
    <div className="print-resume"><h1>James McGonigal</h1><p>CTO · Air Force veteran · Cyber-defense leader</p>{sections.map(section => <section key={section}><h2>{titles[section]}</h2><DossierContent section={section}/></section>)}</div>
    <div className="scanlines" aria-hidden="true"/>
  </div>;
}

