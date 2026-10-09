'use client';
import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function AmbientDataSea() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Create a plane for our terrain
  const [geometry] = useState(() => {
    const geo = new THREE.PlaneGeometry(100, 100, 40, 40);
    geo.rotateX(-Math.PI / 2); // Lay it flat
    return geo;
  });

  useFrame((state) => {
    if (!meshRef.current) return;
    
    // Extremely slow, chill time factor
    const time = state.clock.elapsedTime * 0.3;
    const positions = geometry.attributes.position.array as Float32Array;
    
    // Gentle, slow undulating waves instead of aggressive fast mountains
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const z = positions[i + 2];
      
      // Smooth, wide, low-amplitude waves
      const wave = Math.sin(x * 0.1 + time) * Math.cos(z * 0.1 + time) * 1.5;
      
      positions[i + 1] = wave;
    }
    
    geometry.attributes.position.needsUpdate = true;
    
    // Very subtle camera sway so it doesn't feel erratic
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, state.pointer.x * 1, 0.02);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, Math.max(1.5, state.pointer.y * 1 + 1.5), 0.02);
    state.camera.lookAt(0, 0, -10);
  });

  return (
    <mesh ref={meshRef} geometry={geometry} position={[0, -3, -15]}>
      {/* Lowered the opacity so it sits further back in the design */}
      <meshBasicMaterial color="#D4FF00" wireframe={true} transparent opacity={0.12} />
    </mesh>
  );
}

export default function Background3D() {
  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none bg-[#070708]">
      {/* Softened the CRT scanlines so they aren't distracting */}
      <div className="absolute inset-0 z-10 opacity-15 pointer-events-none mix-blend-overlay"
           style={{
             backgroundImage: `linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%)`,
             backgroundSize: '100% 4px'
           }} 
      />
      
      <Canvas camera={{ position: [0, 1.5, 10], fov: 75 }}>
        {/* Softer fog transition */}
        <fog attach="fog" args={['#070708', 5, 30]} />
        <AmbientDataSea />
      </Canvas>
    </div>
  );
}
