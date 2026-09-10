import test from 'node:test';
import assert from 'node:assert/strict';
import { defenseReducer as reduce, initialDefenseState, formatCountdown, nearestMissile } from '../src/defenseState.js';
import * as THREE from 'three';
import CoreDefense from '../src/CoreDefense.js';

test('30 seconds, then card detonation, then play', () => {
  let state = reduce(initialDefenseState(), { type: 'ARM' });
  assert.equal(formatCountdown(state.remaining), '00:30:00');
  state = reduce(state, { type: 'TICK', elapsed: 29990 });
  assert.equal(formatCountdown(state.remaining), '00:00:01');
  assert.equal(state.phase, 'countdown');
  state = reduce(state, { type: 'TICK', elapsed: 10 });
  assert.equal(state.phase, 'detonating');
  assert.equal(state.remaining, 0);
  state = reduce(state, { type: 'TICK', elapsed: 899 });
  assert.equal(state.phase, 'detonating');
  state = reduce(state, { type: 'TICK', elapsed: 1 });
  assert.equal(state.phase, 'playing');
});
test('pausing preserves the timer and points', () => {
  const state = reduce(initialDefenseState(), { type: 'ARM' });
  assert.equal(reduce(state, { type: 'TICK', elapsed: 60000, paused: true }), state);
});
test('intercepts score exactly once per HIT; impacts deduct 200 without a loss state', () => {
  let state = { ...initialDefenseState(), phase: 'playing' };
  state = reduce(state, { type: 'HIT' });
  assert.equal(state.score, 100); assert.equal(state.hits, 1); assert.equal(state.rewardMs, 1000);
  state = reduce(state, { type: 'HIT' });
  assert.equal(state.score, 200);
  state = reduce(state, { type: 'IMPACT' });
  assert.equal(state.score, 0); assert.equal(state.phase, 'playing');
  state = reduce(state, { type: 'TICK', elapsed: 1500 });
  assert.equal(state.rewardMs, 0); assert.equal(state.score, 0);
});
test('cannot score before play; rearming starts a fresh 30-second session', () => {
  const state = reduce(initialDefenseState(), { type: 'ARM' });
  assert.equal(reduce(state, { type: 'HIT' }), state);
  assert.deepEqual(reduce({ ...state, phase: 'playing', score: 900 }, { type: 'ARM' }), state);
});
test('near clicks hit the closest missile and outside clicks miss', () => {
  const targets = [{ id: 1, x: 100, y: 100 }, { id: 2, x: 160, y: 100 }];
  assert.equal(nearestMissile(targets, 112, 110).id, 1);
  assert.equal(nearestMissile(targets, 159, 100).id, 2);
  assert.equal(nearestMissile(targets, 35, 100), null);
  assert.equal(nearestMissile([], 100, 100), null);
});

function testEngine(onIntercept = () => {}, onGameEvent = () => {}) {
  const previous = globalThis.document;
  globalThis.document = { createElement: () => ({ width: 0, height: 0, getContext: () => ({ clearRect() {}, fillText() {} }) }) };
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(44, 16 / 9, .1, 100); camera.position.set(0, 0, 12.6); camera.updateMatrixWorld();
  try { return { engine: new CoreDefense(scene, camera, () => new THREE.Vector3(), onIntercept, onGameEvent), scene }; }
  finally { if (previous === undefined) delete globalThis.document; else globalThis.document = previous; }
}
const playing = { phase: 'playing', paused: false, quiet: false, width: 1280, height: 720 };

test('real missile intercept removes the missile, emits code particles and a bolt, and scores once', () => {
  let hits = 0; const { engine } = testEngine(() => hits++);
  try {
    engine.update(.7, playing); engine.update(1, playing);
    const missile = engine.missiles.find(item => item.active);
    assert.ok(missile.start.x < 0);
    const point = engine.project(missile.group.position);
    assert.equal(engine.fire(point.x + 30, point.y), true);
    assert.equal(hits, 1); assert.equal(missile.active, false);
    assert.ok(engine.bursts.some(item => item.life > 0)); assert.ok(engine.bolts.some(item => item.life > 0));
    assert.equal(engine.fire(point.x + 30, point.y), false); assert.equal(hits, 1);
  } finally { engine.dispose(); }
});

test('impacts continue without a loss state; pause freezes missiles; long play keeps fixed pools', () => {
  let hits = 0; const { engine, scene } = testEngine(() => hits++);
  try {
    engine.update(.7, playing);
    const progress = engine.missiles.map(item => item.progress);
    engine.update(15, { ...playing, paused: true });
    assert.deepEqual(engine.missiles.map(item => item.progress), progress);
    const allocated = [engine.geometries.length, engine.materials.length, engine.root.children.length];
    let sawImpact = false; let sawRight = false;
    for (let i = 0; i < 800; i++) {
      engine.update(.1, playing);
      sawImpact ||= engine.impact > 0;
      sawRight ||= engine.missiles.some(item => item.active && item.start.x > 0);
    }
    assert.ok(sawImpact); assert.ok(sawRight); assert.equal(hits, 0); assert.equal(engine.phase, 'playing');
    assert.deepEqual([engine.geometries.length, engine.materials.length, engine.root.children.length], allocated);
  } finally { engine.dispose(); }
  assert.equal(scene.children.length, 0);
});

test('closing a dossier restarts the full countdown only before the game', () => {
 const state = {...initialDefenseState(), phase:'countdown', remaining:1200};
 assert.equal(reduce(state,{type:'DOSSIER_CLOSED'}).remaining,30000);
 const playingState={...state,phase:'playing'};
 assert.equal(reduce(playingState,{type:'DOSSIER_CLOSED'}),playingState);
});
test('five finite waves, curved tangent aiming, barrages and secured even with every missile impacting', () => {
 let impacts=0, completions=0;const levels=new Set();
 const {engine}=testEngine(()=>{},e=>{if(e.type==='IMPACT')impacts++;if(e.type==='SECURED')completions++;if(e.type==='WAVE')levels.add(e.level);});
 try {
  engine.update(.7,playing);
  const missile=engine.missiles.find(m=>m.active);
  engine.update(.5,playing);
  const heading=new THREE.Vector3(0,1,0).applyQuaternion(missile.group.quaternion);
  assert.ok(heading.dot(missile.curve.getTangent(missile.progress).normalize())>.9999);
  assert.ok(missile.curve.getPoint(.3).distanceTo(new THREE.Vector3().lerpVectors(missile.start,missile.target,.3))>.1);
  let barrage=0;
  for(let i=0;i<6000;i++){engine.update(.1,playing);if(engine.level===5)barrage=Math.max(barrage,engine.missiles.filter(m=>m.active).length);}
  assert.deepEqual([...levels],[1,2,3,4,5]);assert.equal(impacts,150);assert.equal(completions,1);assert.ok(barrage>=10);assert.equal(engine.finished,true);
  assert.equal(engine.missiles.filter(m=>m.active).length,0);
 } finally {engine.dispose();}
});

test('level 3 and 4 have exactly the requested small barrages', () => {
 const {engine}=testEngine();
 try {
  engine.update(.7,playing);
  for(const level of [3,4]) {
   engine.clear(); engine.level=level; engine.spawned=0; engine.resolved=0; engine.barrageIndex=0; engine.finished=false; engine.spawnIn=0;
   const batches=[];
   while(engine.spawned<level*10) {
    const before=engine.spawned;
    engine.update(.01,playing);
    if(engine.spawned>before)batches.push(engine.spawned-before);
    for(const m of engine.missiles){m.active=false;m.group.visible=false;}
    engine.spawnIn=0;
   }
   const barrages=batches.filter(n=>n>1);
   assert.equal(barrages.length,level===3?2:3);
   assert.ok(barrages.every(n=>n>=(level===3?2:3)&&n<=(level===3?3:4)));
  }
 } finally {engine.dispose();}
});

test('cube can escape, capture, pause, auto-zap nearest every two seconds, and is lost on impact', () => {
 let hits=0;const {engine}=testEngine(()=>hits++);
 try {
  engine.update(.7,playing); engine.launchPowerup();
  engine.updatePowerup(12,false); assert.equal(engine.powerup.state,'missed');
  engine.launchPowerup();engine.updatePowerup(4,false);
  const point=engine.project(engine.powerup.group.position);
  assert.ok(engine.fire(point.x,point.y));assert.equal(engine.powerup.state,'orbiting');
  const t=engine.powerup.time;engine.update(5,{...playing,paused:true});assert.equal(engine.powerup.time,t);
  engine.paused=false;
  for(const m of engine.missiles)m.active=false;
  engine.spawn();engine.spawn();
  const active=engine.missiles.filter(m=>m.active);
  active[0].group.position.set(5,0,0);active[1].group.position.set(2,0,0);
  engine.updatePowerup(1.99,false);assert.equal(hits,0);
  engine.updatePowerup(.01,false);assert.equal(hits,1);assert.equal(active[1].active,false);assert.equal(active[0].active,true);
  engine.updatePowerup(2,false);assert.equal(hits,2);
  engine.spawn();const impact=engine.missiles.find(m=>m.active);impact.progress=.999;
  engine.update(.1,playing);assert.equal(engine.powerup.state,'lost');assert.equal(engine.powerup.group.visible,false);
 } finally {engine.dispose();}
});
