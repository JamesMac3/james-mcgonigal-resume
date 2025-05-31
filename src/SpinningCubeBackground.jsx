// File: SpinningHypercubeBackground.jsx
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function HypercubeWireframe() {
  const lineRef = useRef();
  const rotRef = useRef({ angle: 0 });

  // Precompute 4D vertices and edge indices (including “diff===2” diagonals)
  const { vertices4D, edges } = useMemo(() => {
    const verts = [];
    for (let x = -1; x <= 1; x += 2) {
      for (let y = -1; y <= 1; y += 2) {
        for (let z = -1; z <= 1; z += 2) {
          for (let w = -1; w <= 1; w += 2) {
            verts.push(new THREE.Vector4(x, y, z, w));
          }
        }
      }
    }

    const eds = [];
    for (let i = 0; i < verts.length; i++) {
      for (let j = i + 1; j < verts.length; j++) {
        let diff = 0;
        for (let k = 0; k < 4; k++) {
          if (verts[i].getComponent(k) !== verts[j].getComponent(k)) diff++;
        }
        // diff === 1 → actual hypercube edges
        // diff === 2 → diagonals of square faces (for extra “depth”)
        if (diff === 1 || diff === 2) {
          eds.push([i, j]);
        }
      }
    }
    return { vertices4D: verts, edges: eds };
  }, []);

  useFrame((_, delta) => {
    rotRef.current.angle += delta * 0.5;

    const a = rotRef.current.angle;
    const cosA = Math.cos(a);
    const sinA = Math.sin(a);

    const projected = [];

    for (let i = 0; i < vertices4D.length; i++) {
      const v = vertices4D[i].clone();

      // Rotate in XY plane
      let x = v.x * cosA - v.y * sinA;
      let y = v.x * sinA + v.y * cosA;
      v.x = x;
      v.y = y;

      // Rotate in XZ plane (extra “mix”)
      x = v.x * Math.cos(a * 0.8) - v.z * Math.sin(a * 0.8);
      let z = v.x * Math.sin(a * 0.8) + v.z * Math.cos(a * 0.8);
      v.x = x;
      v.z = z;

      // Rotate in YW plane
      y = v.y * Math.cos(a * 0.6) - v.w * Math.sin(a * 0.6);
      let w = v.y * Math.sin(a * 0.6) + v.w * Math.cos(a * 0.6);
      v.y = y;
      v.w = w;

      // Rotate in ZW plane
      z = v.z * Math.cos(a * 1.2) - v.w * Math.sin(a * 1.2);
      w = v.z * Math.sin(a * 1.2) + v.w * Math.cos(a * 1.2);
      v.z = z;
      v.w = w;

      // 4D → 3D projection (camera at w=4)
      const distance = 4;
      const wDiff = distance - v.w;
      const projFactor = 1 / wDiff;
      const scale = 3.0; // scale up so cube is larger

      projected.push(new THREE.Vector3(
        v.x * projFactor * scale,
        v.y * projFactor * scale,
        v.z * projFactor * scale
      ));
    }

    // Build line segment positions (two 3D points per edge)
    const positions = new Float32Array(edges.length * 2 * 3);
    let ptr = 0;
    for (const [i, j] of edges) {
      const p1 = projected[i];
      const p2 = projected[j];
      positions[ptr++] = p1.x;
      positions[ptr++] = p1.y;
      positions[ptr++] = p1.z;
      positions[ptr++] = p2.x;
      positions[ptr++] = p2.y;
      positions[ptr++] = p2.z;
    }

    const geom = lineRef.current.geometry;
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geom.computeBoundingSphere();
  });

  // Initialize empty geometry; will populate every frame
  const emptyPositions = new Float32Array(edges.length * 2 * 3);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(emptyPositions, 3));

  return (
    <lineSegments ref={lineRef} geometry={geometry}>
      <lineBasicMaterial
        color={0x39ff14}        // bright neon-green
        transparent
        opacity={0.3}           // more opaque so it stands out
        linewidth={2}           // attempt thicker lines (may vary by platform)
      />
    </lineSegments>
  );
}

export default function SpinningHypercubeBackground() {
  return (
    <Canvas
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        background: '#000',
      }}
      camera={{ position: [0, 0, 5], fov: 60 }}
    >
      <ambientLight intensity={0.5} />
      <HypercubeWireframe />
    </Canvas>
  );
}
