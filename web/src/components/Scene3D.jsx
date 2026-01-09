import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, GizmoHelper, GizmoViewport } from '@react-three/drei';
import DynamicMesh from './DynamicMesh';
import './Scene3D.css';

function Scene3D({ meshData, viewerSettings = {} }) {
  const {
    showGrid = true,
    showAxes = true,
    background = '#f6f6f6'
  } = viewerSettings;

  return (
    <div className="scene-container">
      <Canvas
        camera={{ position: [2, 2, 2], fov: 60, near: 0.01, far: 1000 }}
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
          />
        )}

        <DynamicMesh meshData={meshData} viewerSettings={viewerSettings} />

        <OrbitControls makeDefault />

        {showAxes && (
          <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
            <GizmoViewport
              axisColors={['#ff4444', '#44ff44', '#4444ff']}
              labelColor="white"
            />
          </GizmoHelper>
        )}
      </Canvas>
    </div>
  );
}

export default Scene3D;
