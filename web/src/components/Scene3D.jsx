import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, GizmoHelper, GizmoViewport } from '@react-three/drei';
import DynamicMesh from './DynamicMesh';
import './Scene3D.css';

// Auto-rotation component
function AutoRotate({ enabled, speed = 0.5 }) {
  const controlsRef = useRef();
  
  useFrame(() => {
    if (enabled && controlsRef.current) {
      controlsRef.current.autoRotate = true;
      controlsRef.current.autoRotateSpeed = speed;
    } else if (controlsRef.current) {
      controlsRef.current.autoRotate = false;
    }
  });
  
  return <OrbitControls ref={controlsRef} makeDefault enableDamping dampingFactor={0.05} />;
}

function Scene3D({ meshData, viewerSettings = {} }) {
  const {
    showGrid = true,
    showAxes = true,
    background = '#f6f6f6',
    autoRotate = false,  // Auto-rotate OFF by default
    rotationSpeed = 1.0  // Rotation speed
  } = viewerSettings;

  return (
    <div className="scene-container">
      <Canvas
        camera={{ 
          position: [3, 3, 3],  // Isometric view: X-right, Y-back, Z-up
          fov: 50,
          near: 0.1, 
          far: 1000,
          up: [0, 0, 1]         // Z-axis is UP (standard 3D viewport)
        }}
        gl={{ antialias: true }}
      >
        <color attach="background" args={[background]} />
        
        <ambientLight intensity={0.5} />
        <hemisphereLight args={['#ffffff', '#444444', 1.0]} />
        <directionalLight position={[3, 5, 2]} intensity={0.8} />
        <directionalLight position={[-3, -5, -2]} intensity={0.3} />

        {showGrid && (
          <Grid
            args={[20, 20]}
            cellSize={0.5}
            cellThickness={0.5}
            cellColor={'#6f6f6f'}
            sectionSize={2}
            sectionThickness={1}
            sectionColor={'#3f3f3f'}
            fadeDistance={25}
            fadeStrength={1}
            followCamera={false}
            infiniteGrid={true}
            rotation={[Math.PI / 2, 0, 0]}  // Rotate grid to XY plane (Z-up)
          />
        )}

        <DynamicMesh meshData={meshData} viewerSettings={viewerSettings} />

        <AutoRotate enabled={autoRotate} speed={rotationSpeed} />

        {showAxes && (
          <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
            <GizmoViewport
              axisColors={['#ff4444', '#44ff44', '#4444ff']}  // Red=X, Green=Y, Blue=Z
              labelColor="white"
            />
          </GizmoHelper>
        )}
      </Canvas>
    </div>
  );
}

export default Scene3D;
