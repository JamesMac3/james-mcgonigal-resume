import * as THREE from 'three';
import { nearestMissile } from './defenseState.js';

export const MISSILE_POOL_SIZE = 32;
export const WAVE_QUOTAS = [10, 20, 30, 40, 50];

// All effects are pooled. Long sessions never accumulate meshes or textures.
export default class CoreDefense {
  constructor(scene, camera, getCore, onIntercept, onGameEvent = () => {}) {
    this.scene = scene; this.camera = camera; this.getCore = getCore; this.onIntercept = onIntercept;
    this.onGameEvent = onGameEvent; this.level = 1; this.spawned = 0; this.resolved = 0; this.finished = false; this.barrageIndex = 0;
    this.up = new THREE.Vector3(0, 1, 0); this.trailPoint = new THREE.Vector3();
    this.root = new THREE.Group(); scene.add(this.root);
    this.geometries = []; this.materials = []; this.missiles = []; this.bursts = [];
    this.phase = 'idle'; this.elapsed = 0; this.spawnIn = .8; this.serial = 0; this.impact = 0;
    this.width = 1; this.height = 1; this.paused = false;
    this.projected = new THREE.Vector3(); this.ray = new THREE.Raycaster(); this.plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const geo = value => { this.geometries.push(value); return value; };
    const mat = value => { this.materials.push(value); return value; };
    const cube = new THREE.Group(); cube.visible = false; this.root.add(cube);
    const cubeGeometry = geo(new THREE.BoxGeometry(.48, .48, .48));
    cube.add(new THREE.Mesh(cubeGeometry, mat(new THREE.MeshBasicMaterial({color:'#16ff78', transparent:true, opacity:.24}))), new THREE.LineSegments(geo(new THREE.EdgesGeometry(cubeGeometry)), mat(new THREE.LineBasicMaterial({color:'#78ffae'}))));
    this.powerup = { group:cube, state:'waiting', time:0, shotIn:2, launched:false, curve:null };
    const outline = mat(new THREE.LineBasicMaterial({ color: '#ffb6c6', transparent: true, opacity: .95 }));
    const hull = mat(new THREE.MeshBasicMaterial({ color: '#251320' }));
    const engine = mat(new THREE.MeshBasicMaterial({ color: '#a8e9ff', transparent: true, opacity: .85, blending: THREE.AdditiveBlending }));
    const body = geo(new THREE.CylinderGeometry(.095, .115, .55, 5));
    const nose = geo(new THREE.ConeGeometry(.1, .25, 5));
    const fin = geo(new THREE.BoxGeometry(.38, .15, .028));
    const flame = geo(new THREE.ConeGeometry(.075, .4, 5));
    const bodyEdges = geo(new THREE.EdgesGeometry(body)); const noseEdges = geo(new THREE.EdgesGeometry(nose)); const finEdges = geo(new THREE.EdgesGeometry(fin));
    for (let i = 0; i < MISSILE_POOL_SIZE; i++) {
      const group = new THREE.Group(); group.visible = false; this.root.add(group);
      group.add(new THREE.Mesh(body, hull), new THREE.LineSegments(bodyEdges, outline));
      const tip = new THREE.Group(); tip.position.y = .4; tip.add(new THREE.Mesh(nose, hull), new THREE.LineSegments(noseEdges, outline)); group.add(tip);
      for (let j = 0; j < 2; j++) { const wing = new THREE.LineSegments(finEdges, outline); wing.position.y = -.2; wing.rotation.y = j * Math.PI / 2; group.add(wing); }
      const exhaust = new THREE.Mesh(flame, engine); exhaust.rotation.z = Math.PI; exhaust.position.y = -.46; group.add(exhaust);
      const trailGeo = geo(new THREE.BufferGeometry()); trailGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(18), 3));
      const trailMat = mat(new THREE.LineBasicMaterial({ color: '#dd496f', transparent: true, opacity: .48 }));
      const trail = new THREE.Line(trailGeo, trailMat); trail.visible = false; this.root.add(trail);
      this.missiles.push({ group, exhaust, trail, active: false, start: new THREE.Vector3(), target: new THREE.Vector3(), direction: new THREE.Vector3(), curve: new THREE.CubicBezierCurve3(), progress: 0, duration: 12, id: i });
    }
    const glyphCanvas = document.createElement('canvas'); glyphCanvas.width = glyphCanvas.height = 256;
    const context = glyphCanvas.getContext('2d');
    context.clearRect(0, 0, 256, 256); context.font = 'bold 37px monospace'; context.textAlign = 'center'; context.textBaseline = 'middle'; context.fillStyle = '#fff';
    [...'01{}<>/#アイウエオカキク'].forEach((char, i) => context.fillText(char, (i % 4) * 64 + 32, Math.floor(i / 4) * 64 + 32));
    this.glyphTexture = new THREE.CanvasTexture(glyphCanvas);
    // Point sprites sample a 4x4 atlas: the debris is visibly made of code.
    for (let b = 0; b < 12; b++) {
      const count = 90; const positions = new Float32Array(count * 3); const velocities = new Float32Array(count * 3);
      const cells = new Float32Array(count); for (let i = 0; i < count; i++) cells[i] = Math.floor(Math.random() * 16);
      const geometry = geo(new THREE.BufferGeometry()); geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3)); geometry.setAttribute('glyph', new THREE.BufferAttribute(cells, 1));
      const material = mat(new THREE.ShaderMaterial({
        uniforms: { atlas: { value: this.glyphTexture }, opacity: { value: 1 }, tint: { value: new THREE.Color('#ff7eac') }, pointScale: { value: 18 } },
        vertexShader: 'attribute float glyph; varying float cell; uniform float pointScale; void main(){cell=glyph; vec4 mv=modelViewMatrix*vec4(position,1.0); gl_Position=projectionMatrix*mv; gl_PointSize=clamp(pointScale*10.0/max(1.0,-mv.z),5.0,28.0);}',
        fragmentShader: 'uniform sampler2D atlas; uniform float opacity; uniform vec3 tint; varying float cell; void main(){vec2 tile=vec2(mod(cell,4.0),3.0-floor(cell/4.0)); vec2 uv=(tile+vec2(gl_PointCoord.x,1.0-gl_PointCoord.y))/4.0; float a=texture2D(atlas,uv).a; if(a<0.1)discard; gl_FragColor=vec4(tint,a*opacity);}',
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      }));
      const points = new THREE.Points(geometry, material); points.visible = false; points.frustumCulled = false; this.root.add(points);
      this.bursts.push({ points, positions, velocities, life: 0, duration: 1.8 });
    }
    this.bolts = Array.from({ length: 8 }, () => {
      const geometry = geo(new THREE.BufferGeometry()); geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(45), 3));
      const material = mat(new THREE.LineBasicMaterial({ color: '#bdeeff', transparent: true, opacity: 1, blending: THREE.AdditiveBlending, depthTest: false }));
      const line = new THREE.Line(geometry, material); line.visible = false; line.frustumCulled = false; this.root.add(line);
      return { line, life: 0, target: new THREE.Vector3() };
    });
  }

  burst(position, color = '#ff779e', quiet = false) {
    const burst = this.bursts.find(item => item.life <= 0) || this.bursts.reduce((a, b) => a.life < b.life ? a : b);
    burst.life = burst.duration = quiet ? .65 : 1.9;
    burst.points.material.uniforms.tint.value.set(color); burst.points.visible = true;
    for (let i = 0; i < burst.positions.length; i += 3) {
      burst.positions.set([position.x, position.y, position.z], i);
      const angle = Math.random() * Math.PI * 2; const speed = (quiet ? .3 : .7) + Math.random() * (quiet ? .5 : 2.8);
      burst.velocities.set([Math.cos(angle) * speed, Math.sin(angle) * speed, (Math.random() - .5) * speed], i);
    }
    burst.points.geometry.attributes.position.needsUpdate = true;
  }

  project(position) {
    this.projected.copy(position).project(this.camera);
    return { x: (this.projected.x * .5 + .5) * this.width, y: (-this.projected.y * .5 + .5) * this.height };
  }

  fire(x, y, quiet = false) {
    if (this.phase !== 'playing' || this.paused) return false;
    const p = this.powerup;
    if (p.state === 'flying') {
      const point = this.project(p.group.position);
      if (Math.hypot(point.x - x, point.y - y) <= 48) {
        p.state = 'orbiting'; p.time = 0; p.shotIn = 2;
        this.burst(p.group.position, '#55ff91', quiet);
        this.onGameEvent({type:'POWERUP', status:'orbiting'}); return true;
      }
    }
    const targets = this.missiles.filter(item => item.active).map(item => ({ ...this.project(item.group.position), missile: item }));
    const hit = nearestMissile(targets, x, y, this.width < 700 ? 72 : 64);
    if (!hit) return false;
    return this.interceptMissile(hit.missile, quiet);
  }

  interceptMissile(missile, quiet, origin = null) {
    if (!missile.active) return false;
    const bolt = this.bolts.find(item => item.life <= 0) || this.bolts[0];
    bolt.origin = origin?.clone() || null;
    bolt.line.material.color.set(origin ? '#55ff91' : '#bdeeff');
    bolt.target.copy(missile.group.position); bolt.life = .38; bolt.line.visible = true;
    this.burst(missile.group.position, '#a9eaff', quiet);
    missile.active = false; missile.group.visible = false; missile.trail.visible = false;
    this.onIntercept(); this.resolveMissile(); return true;
  }

  fireNearest(quiet) {
    const target = this.missiles.filter(item => item.active).sort((a, b) => b.progress - a.progress)[0];
    if (target) { const point = this.project(target.group.position); return this.fire(point.x, point.y, quiet); }
    return false;
  }

  launchPowerup() {
    const p = this.powerup; const center = this.getCore().clone();
    const start = new THREE.Vector3(); const end = new THREE.Vector3();
    this.ray.setFromCamera(new THREE.Vector2(-.25, 1.15), this.camera); this.ray.ray.intersectPlane(this.plane, start);
    this.ray.setFromCamera(new THREE.Vector2(1.2, -.45), this.camera); this.ray.ray.intersectPlane(this.plane, end);
    p.curve = new THREE.CatmullRomCurve3([start, center.clone().add(new THREE.Vector3(-2,1.5,.5)), center.clone().add(new THREE.Vector3(-2.6,-1.7,.8)), center.clone().add(new THREE.Vector3(2,-2,1)), end]);
    p.time = 0; p.launched = true; p.state = 'flying'; p.group.visible = true;
    p.group.position.copy(start); this.onGameEvent({type:'POWERUP',status:'flying'});
  }

  updatePowerup(dt, quiet) {
    const p = this.powerup;
    if (this.level === 3 && this.spawned >= 3 && !p.launched) this.launchPowerup();
    if (p.state !== 'flying' && p.state !== 'orbiting') return;
    p.time += dt;
    if (!quiet) p.group.rotation.set(p.time * 1.2, p.time * 1.7, p.time * .7);
    if (p.state === 'flying') {
      p.curve.getPoint(Math.min(1, p.time / 12), p.group.position);
      if (p.time >= 12) { p.state = 'missed'; p.group.visible = false; this.onGameEvent({type:'POWERUP',status:'missed'}); }
    } else {
      p.group.position.copy(this.getCore()).add(new THREE.Vector3(Math.cos(p.time * .9) * 1.9, Math.sin(p.time * .9) * 1.1, Math.sin(p.time * .9) * .7 + .8));
      p.shotIn -= dt;
      if (p.shotIn <= 1e-9) {
        p.shotIn += 2;
        const center = this.getCore();
        const nearest = this.missiles.filter(m=>m.active).sort((a,b)=>a.group.position.distanceToSquared(center)-b.group.position.distanceToSquared(center))[0];
        if (nearest) this.interceptMissile(nearest, quiet, p.group.position);
      }
    }
  }

  reportWave() { this.onGameEvent({ type: 'WAVE', level: this.level, resolved: this.resolved, quota: WAVE_QUOTAS[this.level - 1] }); }

  resolveMissile() {
    this.resolved++; this.reportWave();
    if (this.resolved < WAVE_QUOTAS[this.level - 1]) return;
    if (this.level === 5) { this.finished = true; this.onGameEvent({ type: 'SECURED' }); return; }
    this.level++; this.barrageIndex = 0; this.spawned = 0; this.resolved = 0;
    this.spawnIn = this.level === 5 ? 3 : 2; this.reportWave();
  }

  spawn() {
    if (this.spawned >= WAVE_QUOTAS[this.level - 1]) return;
    const missile = this.missiles.find(item => !item.active); if (!missile) return;
    const side = this.serial++ % 2 === 0 ? -1 : 1;
    this.ray.setFromCamera(new THREE.Vector2(side * 1.1, (Math.random() - .5) * 1.1), this.camera);
    this.ray.ray.intersectPlane(this.plane, missile.start);
    missile.target.copy(this.getCore()); missile.direction.copy(missile.target).sub(missile.start).normalize();
    missile.group.position.copy(missile.start); missile.group.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), missile.direction);
    const bend = (Math.random() < .5 ? -1 : 1) * (1.5 + Math.random() * 3);
    missile.curve.v0.copy(missile.start); missile.curve.v3.copy(missile.target);
    missile.curve.v1.lerpVectors(missile.start, missile.target, .3).add(new THREE.Vector3(0, bend, (Math.random() - .5) * 2));
    missile.curve.v2.lerpVectors(missile.start, missile.target, .7).add(new THREE.Vector3((Math.random() - .5) * 2, -bend * .45, (Math.random() - .5) * 2));
    missile.duration = 12 - (this.level - 1) * 1.15 + Math.random() * 1.5; this.spawned++; missile.progress = 0; missile.active = true;
    missile.group.visible = true; missile.trail.visible = true;
  }

  update(dt, { phase, paused, quiet, width, height }) {
    this.width = width; this.height = height; this.paused = paused;
    if (phase !== this.phase) {
      if (phase === 'playing') { this.level = 1; this.spawned = 0; this.resolved = 0; this.finished = false; this.barrageIndex = 0; this.spawnIn = .65; this.reportWave(); }
      if (phase === 'idle' || phase === 'countdown') this.clear();
      this.phase = phase;
    }
    if (paused) return;
    this.elapsed += dt; this.impact = Math.max(0, this.impact - dt * 2);
    if (phase === 'playing' && !this.finished) {
      this.spawnIn -= dt;
      if (this.spawnIn <= 0) {
        let batch = this.level === 5 ? 10 : 1;
        const thresholds = this.level === 3 ? [7, 18] : this.level === 4 ? [6, 17, 28] : [];
        if (this.barrageIndex < thresholds.length && this.spawned >= thresholds[this.barrageIndex]) {
          batch = (this.level === 3 ? 2 : 3) + Math.floor(Math.random() * 2); this.barrageIndex++;
        }
        for (let i = 0; i < batch; i++) this.spawn();
        this.spawnIn = this.level === 5 ? 3 : 2.5 - (this.level - 1) * .3;
      }
      for (const missile of this.missiles) {
        if (!missile.active) continue;
        missile.progress = Math.min(1, missile.progress + dt / missile.duration);
        missile.curve.getPoint(missile.progress, missile.group.position);
        missile.curve.getTangent(missile.progress, missile.direction).normalize();
        missile.group.quaternion.setFromUnitVectors(this.up, missile.direction);
        missile.exhaust.scale.y = quiet ? 1 : 1 + Math.sin(this.elapsed * 24 + missile.id) * .25;
        const trail = missile.trail.geometry.attributes.position;
        for (let i = 0; i < 6; i++) {
          missile.curve.getPoint(Math.max(0, missile.progress - i * .018), this.trailPoint);
          trail.setXYZ(i, this.trailPoint.x, this.trailPoint.y, this.trailPoint.z);
        }
        trail.needsUpdate = true;
        if (missile.group.position.distanceTo(this.getCore()) < 1.1 || missile.progress >= 1) {
          this.burst(missile.group.position, '#ff5d91', quiet); this.impact = 1;
          if (this.powerup.state === 'orbiting') {
            this.burst(this.powerup.group.position, '#55ff91', quiet);
            this.powerup.state = 'lost'; this.powerup.group.visible = false;
            this.onGameEvent({type:'POWERUP',status:'lost'});
          }
          this.onGameEvent({ type: 'IMPACT' }); this.resolveMissile();
          missile.active = false; missile.group.visible = false; missile.trail.visible = false;
        }
      }
    }
    if (phase === 'playing' && !this.finished) this.updatePowerup(dt, quiet);
    if (phase === 'secured') this.powerup.group.visible = false;
    for (const burst of this.bursts) {
      if (burst.life <= 0) continue;
      burst.life -= dt; burst.points.visible = burst.life > 0;
      burst.points.material.uniforms.opacity.value = Math.max(0, burst.life / burst.duration);
      for (let i = 0; i < burst.positions.length; i++) burst.positions[i] += burst.velocities[i] * dt;
      burst.points.geometry.attributes.position.needsUpdate = true;
    }
    for (const bolt of this.bolts) {
      if (bolt.life <= 0) continue;
      bolt.life -= dt; bolt.line.visible = bolt.life > 0; bolt.line.material.opacity = Math.max(0, bolt.life / .38);
      const origin = bolt.origin || this.getCore(); const positions = bolt.line.geometry.attributes.position;
      for (let i = 0; i < 15; i++) {
        const t = i / 14; const jitter = i === 0 || i === 14 || quiet ? 0 : .18;
        positions.setXYZ(i, THREE.MathUtils.lerp(origin.x, bolt.target.x, t) + (Math.random() - .5) * jitter,
          THREE.MathUtils.lerp(origin.y, bolt.target.y, t) + (Math.random() - .5) * jitter, THREE.MathUtils.lerp(origin.z, bolt.target.z, t) + .2);
      }
      positions.needsUpdate = true;
    }
  }

  clear() {
    Object.assign(this.powerup, {state:'waiting',time:0,shotIn:2,launched:false}); this.powerup.group.visible = false;
    for (const missile of this.missiles) { missile.active = false; missile.group.visible = false; missile.trail.visible = false; }
    for (const burst of this.bursts) { burst.life = 0; burst.points.visible = false; }
    for (const bolt of this.bolts) { bolt.life = 0; bolt.line.visible = false; }
    this.impact = 0;
  }

  dispose() {
    this.scene.remove(this.root); this.geometries.forEach(item => item.dispose()); this.materials.forEach(item => item.dispose()); this.glyphTexture.dispose();
  }
}
