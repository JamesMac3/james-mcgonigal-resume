import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import CoreDefense, { MISSILE_POOL_SIZE } from './CoreDefense';

const modules = [
  { id: 'identity', title: 'THE OPERATOR', sub: 'Identity / James McGonigal', color: '#baffb1', position: [-3.8, 2.0, .25] },
  { id: 'missions', title: 'MISSION ARCHIVE', sub: 'Five deployments in technology', color: '#a6b6ff', position: [3.65, 1.8, .2] },
  { id: 'projects', title: 'ACTIVE SYSTEMS', sub: 'Flockblock TN + Quantify', color: '#ce9bff', position: [4.0, -1.4, .5] },
  { id: 'skills', title: 'CAPABILITY MATRIX', sub: 'Defend / automate / build / lead', color: '#75f2d3', position: [-3.8, -1.65, .1] },
  { id: 'contact', title: 'UPLINK', sub: 'Establish a human connection', color: '#f2ce89', position: [.15, -3.25, 1] },
];

function glowTexture() {
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = 128;
  const context = canvas.getContext('2d');
  const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, '#ffffff'); gradient.addColorStop(.12, '#ffffff');
  gradient.addColorStop(.35, 'rgba(255,255,255,.25)'); gradient.addColorStop(1, 'rgba(0,0,0,0)');
  context.fillStyle = gradient; context.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(canvas);
}

export default function MachineScene({ active, reveal, quiet, onSelect, onFallback, onPulse, gamePhase, gamePaused, onIntercept, onGameEvent, gameLevel, integrity, praise, onRestart }) {
  const popupLabels = useRef([]);
  const mount = useRef(null);
  const labels = useRef([]);
  const cable = useRef(null);
  const targets = useRef([]);
  const defenseRef = useRef(null);
  const powerupTarget = useRef(null);
  const current = useRef({ active, reveal, quiet, gamePhase, gamePaused, onIntercept, onGameEvent, gameLevel, integrity, praise, onRestart });
  const [ready, setReady] = useState(false);
  useEffect(() => { current.current = { active, reveal, quiet, gamePhase, gamePaused, onIntercept, onGameEvent, gameLevel, integrity, praise, onRestart }; }, [active, reveal, quiet, gamePhase, gamePaused, onIntercept, onGameEvent, gameLevel, integrity, praise, onRestart]);

  useEffect(() => {
    const host = mount.current;
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' }); }
    catch { onFallback(); return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
    renderer.setClearColor(0x000000, 0);
    host.prepend(renderer.domElement);
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2('#040c0a', .035);
    const camera = new THREE.PerspectiveCamera(44, 1, .1, 100);
    camera.position.set(0, .3, 15.5);
    const machine = new THREE.Group(); scene.add(machine);
    const core = new THREE.Group(); machine.add(core);
    const geometries = new Set(); const materials = new Set();
    const geometry = value => { geometries.add(value); return value; };
    const material = value => { materials.add(value); return value; };
    const wireMaterial = color => material(new THREE.LineBasicMaterial({ color, transparent: true, opacity: .8 }));
    const meshMaterial = (color, opacity = 1) => material(new THREE.MeshBasicMaterial({ color, transparent: true, opacity, blending: THREE.AdditiveBlending }));
    function cage(radius, detail, color, group) {
      const shape = geometry(new THREE.IcosahedronGeometry(radius, detail));
      const edges = geometry(new THREE.EdgesGeometry(shape));
      const object = new THREE.LineSegments(edges, wireMaterial(color)); group.add(object); return object;
    }
    const shell = cage(1.9, 1, '#80d9b0', core);
    const inner = cage(1.15, 0, '#b4ffd3', core);
    const heart = new THREE.Mesh(geometry(new THREE.OctahedronGeometry(.55)), meshMaterial('#bbffd2', .8)); core.add(heart);
    const rebuiltGeometry = geometry(new THREE.IcosahedronGeometry(1.15, 2));
    const rebuilt = new THREE.Mesh(rebuiltGeometry, material(new THREE.MeshStandardMaterial({color:'#9fe5ff',emissive:'#278cdb',emissiveIntensity:.7,flatShading:true,side:THREE.DoubleSide}))); inner.add(rebuilt);
    let displayedIntegrity = 0;
    const remnant = new THREE.Mesh(geometry(new THREE.BoxGeometry(.85,.85,.85)), material(new THREE.MeshBasicMaterial({color:'#ff153f'}))); machine.add(remnant); remnant.visible=false;
    const coreBlue = new THREE.Color('#55bdff');
    const shellFaces = new THREE.Mesh(geometry(new THREE.IcosahedronGeometry(1.68, 1)), material(new THREE.MeshPhysicalMaterial({ color: '#163f30', metalness: .95, roughness: .25, transparent: true, opacity: .22, side: THREE.DoubleSide }))); core.add(shellFaces);
    const ambientLight = new THREE.AmbientLight('#75ffa1', 2); scene.add(ambientLight);
    const light = new THREE.PointLight('#c8a5ff', 35); light.position.set(3, 4, 5); scene.add(light);
    const texture = glowTexture();
    const glow = new THREE.Sprite(material(new THREE.SpriteMaterial({ map: texture, color: '#78ffc3', transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: .72 })));
    glow.scale.set(4.9, 4.9, 1); core.add(glow);
    const rings = [];
    for (let i = 0; i < 5; i++) {
      const pivot = new THREE.Group(); pivot.rotation.set(.5 + i * .54, i * .71, i * .38); machine.add(pivot);
      const ring = new THREE.Mesh(geometry(new THREE.TorusGeometry(2.05 + i * .21, i === 0 ? .012 : .006, 4, 160, Math.PI * (1.5 + i * .1))), meshMaterial(i % 2 ? '#a584ff' : '#74bca0', .6)); pivot.add(ring);
      const bead = new THREE.Mesh(geometry(new THREE.SphereGeometry(.055, 8, 8)), meshMaterial('#c8ffe0')); bead.position.x = 2.05 + i * .21; pivot.add(bead); rings.push(pivot);
    }
    // Physical teeth and suspended shards make the rings feel like a machine.
    const teeth = new THREE.Group(); teeth.rotation.x = 1.18; machine.add(teeth);
    const toothGeometry = geometry(new THREE.BoxGeometry(.024, .11, .025));
    const toothMaterial = meshMaterial('#a7e5c3', .7);
    for (let i = 0; i < 96; i++) {
      const angle = i / 96 * Math.PI * 2;
      const tooth = new THREE.Mesh(toothGeometry, toothMaterial);
      tooth.position.set(Math.cos(angle) * 3.05, Math.sin(angle) * 3.05, 0);
      tooth.rotation.z = angle - Math.PI / 2;
      if (i % 8 === 0) tooth.scale.y = 2.6;
      teeth.add(tooth);
    }
    const shardGeometry = geometry(new THREE.OctahedronGeometry(.13));
    const shardMaterial = meshMaterial('#b9a3ff', .75);
    const shards = Array.from({ length: 16 }, (_, i) => {
      const shard = new THREE.Mesh(shardGeometry, shardMaterial);
      const angle = i / 16 * Math.PI * 2;
      shard.position.set(Math.cos(angle) * 1.42, Math.sin(angle) * 1.42, Math.sin(angle * 3) * .6);
      shard.scale.set(.4, 1.8, .4); core.add(shard); return { mesh: shard, base: shard.position.clone(), angle };
    });
    const ground = new THREE.GridHelper(60, 70, '#33624b', '#142e24'); ground.position.y = -4.9; scene.add(ground);
    geometries.add(ground.geometry); materials.add(ground.material);
    const gridColors = ground.geometry.getAttribute('color');
    const originalGridColors = gridColors.array.slice();
    const particles = new Float32Array(900 * 3);
    for (let i = 0; i < particles.length; i += 3) { particles[i] = (Math.random() - .5) * 30; particles[i + 1] = (Math.random() - .5) * 22; particles[i + 2] = (Math.random() - .5) * 18 - 4; }
    const originalParticles = particles.slice();
    const particleGeometry = geometry(new THREE.BufferGeometry()); particleGeometry.setAttribute('position', new THREE.BufferAttribute(particles, 3));
    const dust = new THREE.Points(particleGeometry, material(new THREE.PointsMaterial({ color: '#94ffc1', size: .027, transparent: true, opacity: .6, blending: THREE.AdditiveBlending, depthWrite: false }))); scene.add(dust);
    const nodes = modules.map((module, index) => {
      const group = new THREE.Group(); group.position.fromArray(module.position); machine.add(group);
      const satellite = cage(.22, 0, module.color, group);
      const orbit = new THREE.Mesh(geometry(new THREE.TorusGeometry(.39, .008, 4, 50)), meshMaterial(module.color, .8)); orbit.rotation.x = .8; group.add(orbit);
      const bulb = new THREE.Mesh(geometry(new THREE.SphereGeometry(.055, 8, 8)), meshMaterial(module.color)); group.add(bulb);
      const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(module.position[0] * .35, module.position[1] * .7, 1.2), new THREE.Vector3(module.position[0] * .8, module.position[1] * .7, -.4), group.position.clone()]);
      const line = new THREE.Line(geometry(new THREE.BufferGeometry().setFromPoints(curve.getPoints(60))), wireMaterial(module.color)); machine.add(line);
      const packet = new THREE.Mesh(geometry(new THREE.SphereGeometry(.038, 6, 6)), meshMaterial(module.color)); machine.add(packet);
      return { group, home: group.position.clone(), deployment: 0, satellite, orbit, curve, line, packet, index };
    });
    let width = 1; let height = 1; let frame; let last = 0; let time = 0;
    let wasRevealed = false; let deploymentStarted = 0;
    const themedColors = [...materials].filter(item => item.color).map(item => {
      const original = item.color.clone();
      const high = Math.max(original.r, original.g, original.b);
      const low = Math.min(original.r, original.g, original.b);
      return { color: item.color, original, red: new THREE.Color().setRGB(high, low, low + (high - low) * .18) };
    });
    const fogGreen = scene.fog.color.clone();
    const fogRed = new THREE.Color('#0c0406');
    const corePosition = new THREE.Vector3();
    const defense = new CoreDefense(scene, camera, () => machine.getWorldPosition(corePosition), event => current.current.onIntercept(event), event => current.current.onGameEvent(event));
    defenseRef.current = defense;
    // Compile debris before the first interception to avoid a shader compilation hitch.
    defense.bursts.forEach(burst => {burst.points.visible = true;});
    renderer.compile(scene,camera);
    defense.bursts.forEach(burst => {burst.points.visible = false;});
    let previousGamePhase = 'idle';
    const pointer = new THREE.Vector2(); const drag = { down: false, x: 0, turn: 0, target: 0 };
    const resize = () => { width = host.clientWidth; height = host.clientHeight; renderer.setSize(width, height); camera.aspect = width / height; camera.updateProjectionMatrix(); };
    const observer = new ResizeObserver(resize); observer.observe(host);
    const move = event => { const rect = host.getBoundingClientRect(); pointer.set((event.clientX - rect.left) / width * 2 - 1, -((event.clientY - rect.top) / height * 2 - 1)); if (drag.down) { drag.target += (event.clientX - drag.x) * .004; drag.x = event.clientX; } };
    const down = event => { if (event.target.closest('button') || current.current.gamePhase === 'playing') return; drag.down = true; drag.x = event.clientX; host.setPointerCapture(event.pointerId); };
    const up = event => {
      drag.down = false;
      if (event.type === 'pointerup' && current.current.gamePhase === 'playing' && !event.target.closest('button')) {
        const rect = host.getBoundingClientRect(); defense.fire(event.clientX - rect.left, event.clientY - rect.top, current.current.quiet);
      }
    };
    const lost = event => { event.preventDefault(); onFallback(); };
    host.addEventListener('pointermove', move); host.addEventListener('pointerdown', down); host.addEventListener('pointerup', up); host.addEventListener('pointercancel', up);
    renderer.domElement.addEventListener('webglcontextlost', lost);
    const projected = new THREE.Vector3();
    const targetCamera = new THREE.Vector3();
    function render(now) {
      frame = requestAnimationFrame(render);
      if (document.hidden) { last = now; return; }
      const dt = Math.min((now - last) / 1000, .05); last = now;
      const state = current.current;
      const alarm = state.reveal && state.gamePhase !== 'secured';
      const colorBlend = state.quiet ? 1 : Math.min(dt * 6, 1);
      themedColors.forEach(item => item.color.lerp(alarm ? item.red : item.original, colorBlend));
      scene.fog.color.lerp(alarm ? fogRed : fogGreen, colorBlend);
      light.color.set(alarm ? '#ff758e' : '#c8a5ff');
      ambientLight.color.set(alarm ? '#ff758e' : '#75ffa1');
      for (let i = 0; i < gridColors.array.length; i += 3) {
        const r = originalGridColors[i], g = originalGridColors[i + 1], b = originalGridColors[i + 2];
        const high = Math.max(r, g, b), low = Math.min(r, g, b);
        gridColors.array[i] += ((alarm ? high : r) - gridColors.array[i]) * colorBlend;
        gridColors.array[i + 1] += ((alarm ? low : g) - gridColors.array[i + 1]) * colorBlend;
        gridColors.array[i + 2] += ((alarm ? low + (high - low) * .18 : b) - gridColors.array[i + 2]) * colorBlend;
      }
      gridColors.needsUpdate = true;
      if (state.reveal !== wasRevealed) { deploymentStarted = now; wasRevealed = state.reveal; }
      if (!state.quiet) time += dt;
      const mobile = width < 700;
      const desiredZ = mobile ? 21 : 12.6;
      targetCamera.set(state.active && !mobile ? 2.9 : 0, .15, state.active ? desiredZ - 1.1 : desiredZ);
      camera.position.lerp(targetCamera, Math.min(dt * 3, 1)); camera.lookAt(0, 0, 0);
      // Translate the whole apparatus to make room for the attached dossier.
      machine.position.x = THREE.MathUtils.damp(machine.position.x, state.active && !mobile ? -2.0 : 0, 4, dt);
      drag.turn = THREE.MathUtils.damp(drag.turn, drag.target, 5, dt);
      machine.rotation.y = drag.turn + (state.quiet ? 0 : pointer.x * .08);
      machine.rotation.x = state.quiet ? 0 : pointer.y * .035;
      core.rotation.set(time * .055, time * .11, time * .025);
      core.scale.setScalar(1 + defense.impact * .055);
      const destroyed = ['shattering','lost'].includes(state.gamePhase);
      core.visible = !destroyed; teeth.visible = !destroyed; rings.forEach(r => {r.visible = !destroyed;});
      remnant.visible = state.gamePhase === 'lost'; remnant.material.color.set('#ff153f');
      core.position.x = state.gamePhase === 'failing' && !state.quiet ? Math.sin(now * .15) * .16 : 0;
      core.scale.multiplyScalar(state.gamePhase === 'failing' && !state.quiet ? 1 + Math.sin(now*.07)*.15 : 1);
      displayedIntegrity = THREE.MathUtils.damp(displayedIntegrity, Math.max(0,state.integrity || 0), 2, dt);
      rebuilt.visible = displayedIntegrity > .01;
      rebuiltGeometry.setDrawRange(0, Math.min(rebuiltGeometry.attributes.position.count,Math.floor((displayedIntegrity > 99.9 ? 100 : displayedIntegrity)/100 * rebuiltGeometry.attributes.position.count/3)*3));
      rebuilt.material.color.set('#9fe5ff'); rebuilt.material.emissive.set('#278cdb');
      core.traverse(object => { if (object.material?.color && object !== rebuilt && state.gamePhase !== 'secured') object.material.color.lerp(coreBlue,displayedIntegrity/100); });
      const inCombat = state.gamePhase === 'playing';
      const spread = inCombat ? .85 : state.reveal ? 1.65 : 1;
      shell.scale.lerp(new THREE.Vector3(spread, spread, spread), Math.min(dt * 3, 1));
      shellFaces.material.opacity = THREE.MathUtils.damp(shellFaces.material.opacity, state.reveal ? 0 : .22, 5, dt);
      inner.rotation.y = -time * .26;
      teeth.rotation.z = -time * .075;
      shards.forEach(shard => {
        const expansion = inCombat ? .85 : state.reveal ? 2.05 : 1 + Math.sin(time * .7 + shard.angle) * .08;
        shard.mesh.position.lerp(shard.base.clone().multiplyScalar(expansion), Math.min(dt * 3, 1));
        shard.mesh.rotation.set(time * .2, shard.angle + time * .4, shard.angle);
      });
      heart.rotation.y = time * .25; heart.scale.setScalar(1 + Math.sin(time * 1.8) * .12);
      glow.material.opacity = state.reveal ? .4 : .68 + Math.sin(time) * .07;
      rings.forEach((ring, i) => { ring.rotation.z = time * (.07 + i * .018) * (i % 2 ? 1 : -1); ring.rotation.y += state.quiet ? 0 : dt * .017; });
      dust.rotation.y = time * .012;
      if (!state.quiet) {
        for (let i = 0; i < particles.length; i += 3) {
          const dx = originalParticles[i] - pointer.x * 9;
          const dy = originalParticles[i + 1] - pointer.y * 6;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const force = Math.max(0, 2.2 - distance) * .28;
          particles[i] = originalParticles[i] + dx * force;
          particles[i + 1] = originalParticles[i + 1] + dy * force;
        }
        particleGeometry.attributes.position.needsUpdate = true;
      }
      nodes.forEach(node => {
        const deployed = state.reveal && !['playing','failing','shattering','lost'].includes(state.gamePhase) && (state.quiet || now - deploymentStarted >= node.index * 90) ? 1 : 0;
        node.deployment = state.quiet || state.gamePhase === 'playing' ? deployed : THREE.MathUtils.damp(node.deployment, deployed, 7, dt);
        const extension = .08 + node.deployment * .92;
        node.group.position.copy(node.home).multiplyScalar(extension);
        node.satellite.rotation.set(time * .3, time * .4, 0); node.orbit.rotation.y = time * .3;
        const selected = state.active === modules[node.index].id;
        node.group.scale.setScalar(node.deployment * (selected ? 1.6 : 1));
        node.line.scale.setScalar(extension);
        node.line.material.opacity = node.deployment * (selected ? .95 : state.active ? .15 : .45);
        node.packet.scale.setScalar(node.deployment);
        node.packet.position.copy(node.curve.getPoint((time * .15 + node.index * .2) % 1)).multiplyScalar(extension);
      });
      machine.updateMatrixWorld(true);
      if (state.gamePhase === 'detonating' && previousGamePhase !== 'detonating') {
        nodes.forEach(node => { node.group.getWorldPosition(projected); defense.burst(projected, '#ff78b0', state.quiet); });
      }
      previousGamePhase = state.gamePhase;
      defense.update(dt, { phase: state.gamePhase, paused: state.gamePaused, quiet: state.quiet, width, height });
      defense.popups.forEach((popup,index) => {
        const label = popupLabels.current[index]; if (!label) return;
        label.hidden = popup.life <= 0 || Boolean(state.active);
        const point = defense.project(popup.position);
        label.style.transform = `translate(${point.x}px,${point.y - (1-popup.life)*35}px) translate(-50%,-50%)`;
        label.style.opacity = String(Math.min(1,popup.life*3));
      });
      const pickup = powerupTarget.current;
      if (pickup) {
        pickup.hidden = defense.powerup.state !== 'flying' || state.gamePhase !== 'playing' || Boolean(state.active);
        pickup.disabled = state.gamePaused;
        const point = defense.project(defense.powerup.group.position);
        pickup.style.transform = `translate(${point.x}px,${point.y}px) translate(-50%,-50%)`;
      }
      defense.missiles.forEach((missile, index) => {
        const target = targets.current[index]; if (!target) return;
        target.hidden = !missile.active || state.gamePhase !== 'playing' || Boolean(state.active);
        target.disabled = state.gamePaused;
        if (missile.active) {
          const point = defense.project(missile.group.position);
          target.style.transform = `translate(${point.x}px,${point.y}px) translate(-50%,-50%)`;
        }
      });
      nodes.forEach(node => {
        node.group.getWorldPosition(projected); projected.project(camera);
        const label = labels.current[node.index];
        if (label) {
          const rawX = (projected.x * .5 + .5) * width;
          const x = mobile ? THREE.MathUtils.clamp(rawX, 79, width - 79) : rawX;
          const y = (-projected.y * .5 + .5) * height;
          label.style.transform = `translate(${x}px,${y}px) translate(-50%, -50%)`;
          label.style.opacity = String(node.deployment * (state.active && state.active !== modules[node.index].id ? .35 : 1));
          if (state.active === modules[node.index].id && cable.current && !mobile) {
            const panelWidth = width >= 1700 ? 510 : width <= 1050 ? 390 : 430;
            const endX = width * (width <= 1050 ? .98 : .97) - panelWidth;
            const endY = height * .32;
            cable.current.setAttribute('d', `M${x},${y + 25} C${x + 80},${y + 25} ${endX - 90},${endY} ${endX},${endY}`);
          }
        }
      });
      renderer.render(scene, camera);
    }
    frame = requestAnimationFrame(render); setReady(true);
    return () => {
      cancelAnimationFrame(frame); observer.disconnect();
      defense.dispose(); defenseRef.current = null;
      host.removeEventListener('pointermove', move); host.removeEventListener('pointerdown', down); host.removeEventListener('pointerup', up); host.removeEventListener('pointercancel', up);
      renderer.domElement.removeEventListener('webglcontextlost', lost);
      geometries.forEach(value => value.dispose()); materials.forEach(value => value.dispose()); texture.dispose(); renderer.dispose(); renderer.domElement.remove();
    };
  }, [onFallback]);

  return <div ref={mount} className={`machine-scene ${ready ? 'ready' : ''} ${reveal ? 'cards-deployed' : 'core-sealed'} ${gamePhase === 'detonating' ? 'cards-detonating' : ''} ${gamePhase === 'playing' ? 'defense-playing' : ''}`} aria-label={gamePhase === 'playing' ? 'Core defense. Click or tap near a missile to zap it. Protect core integrity. Falling below minus one percent destroys the core.' : 'Interactive identity machine. Drag to rotate. Expose the core to unfold its five modules.'}>
    <div className="machine-crosshair" aria-hidden="true" />
    <svg className="dossier-cable" aria-hidden="true" style={{ opacity: active ? 1 : 0 }}><path ref={cable}/></svg>
    {modules.map((module, index) => <button ref={element => { labels.current[index] = element; }} key={module.id} className={`satellite-label ${active === module.id ? 'selected' : ''}`} style={{ '--node-color': module.color }} onClick={() => onSelect(module.id)} aria-hidden={!reveal || ['playing','detonating','failing','shattering','lost'].includes(gamePhase)} tabIndex={reveal && !['playing','detonating','failing','shattering','lost'].includes(gamePhase) ? 0 : -1} aria-pressed={active === module.id}><span className="satellite-index">0{index + 1} <span>↗</span></span><strong>{module.title}</strong><small>{module.sub}</small><span className="satellite-pin" /></button>)}
    {Array.from({ length: MISSILE_POOL_SIZE }, (_, index) => <button key={index} hidden className="missile-hitbox" ref={element => { targets.current[index] = element; }} aria-label={`Intercept missile ${index + 1}`} onClick={() => { const defense = defenseRef.current; const missile = defense?.missiles[index]; if (missile?.active) { const point = defense.project(missile.group.position); defense.fire(point.x, point.y, current.current.quiet); } }}/>) }
    <button ref={powerupTarget} hidden className="missile-hitbox powerup-hitbox" style={{width:96,height:96,zIndex:4}} aria-label="Capture green cube auto-defense powerup" onClick={() => { const defense = defenseRef.current; if (defense?.powerup.state === 'flying') { const point = defense.project(defense.powerup.group.position); defense.fire(point.x, point.y, current.current.quiet); } }}/>
    {Array.from({length:16}, (_,i)=><span key={i} hidden ref={el=>{popupLabels.current[i]=el;}} className="hit-score" aria-hidden="true">+100</span>)}
    {!active && reveal && <div className={`integrity-panel ${gamePhase === 'playing' ? 'is-visible' : ''}`} aria-hidden={gamePhase !== 'playing'}><div>CORE INTEGRITY <strong>{Math.max(-100,integrity || 0).toFixed(1)}%</strong></div><div className="integrity-track" role="progressbar" aria-label="Core integrity" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.max(0,integrity || 0)}><span style={{width:`${Math.max(0,integrity || 0)}%`}}/></div></div>}
    {!active && gamePhase === 'lost' && <button className="core-trigger reset-core" onClick={onRestart}><span>RESET CORE</span></button>}
    {!active && gamePhase !== 'lost' && (['playing','detonating','failing','shattering','secured'].includes(gamePhase) ? <div className={`core-trigger defense-core ${gamePhase === 'secured' ? 'secured-core' : gameLevel === 5 ? 'ddos-core' : ''}`}><span data-label={gamePhase === 'failing' ? 'CORE FAILURE' : gamePhase === 'shattering' ? '' : gamePhase === 'secured' ? 'SECURED!' : praise || (gameLevel === 5 ? 'DDOS ATTACK!' : 'DEFEND!')}>{gamePhase === 'failing' ? 'CORE FAILURE' : gamePhase === 'shattering' ? '' : gamePhase === 'secured' ? 'SECURED!' : praise || (gameLevel === 5 ? 'DDOS ATTACK!' : 'DEFEND!')}</span></div> : <button className="core-trigger" onClick={onPulse} aria-expanded={reveal} aria-label={reveal ? 'Close core and retract all modules' : 'Expose core and unfold all five modules'}><span>{reveal ? 'CLOSE' : 'EXPOSE'}<br />CORE</span></button>)}
  </div>;
}

