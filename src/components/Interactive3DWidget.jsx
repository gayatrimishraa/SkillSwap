import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Environment, Sphere } from '@react-three/drei';

function AnimatedSphere() {
  const meshRef = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.x = time * 0.2;
      meshRef.current.rotation.y = time * 0.3;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={2}>
      <Sphere args={[1, 64, 64]} ref={meshRef}>
        <MeshDistortMaterial 
          color="#3F51B5" 
          attach="material" 
          distort={0.4} 
          speed={2} 
          roughness={0.1}
          metalness={0.9}
        />
      </Sphere>
    </Float>
  );
}

export default function Interactive3DWidget() {
  return (
    <div style={{ height: '300px', width: '100%', position: 'relative' }}>
      {/* Fallback or background for context */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1, background: 'radial-gradient(circle at center, rgba(63, 81, 181, 0.1) 0%, transparent 60%)' }} />
      <Canvas camera={{ position: [0, 0, 3] }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[2, 2, 2]} intensity={1} color="#FFFFFF" />
        <directionalLight position={[-2, -2, -2]} intensity={0.5} color="#303F9F" />
        <AnimatedSphere />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
