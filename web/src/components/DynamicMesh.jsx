import React, { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

function DynamicMesh({ meshData, viewerSettings = {} }) {
  const meshRef = useRef();
  const wireframeRef = useRef();
  const geometryRef = useRef();
  const [hasCentered, setHasCentered] = useState(false);
  const { camera, controls } = useThree();

  const {
    showWireframe = false,
    wireframeOnly = false,
    color = '#7aa6ff',
    metalness = 0.0,
    roughness = 0.8,
    shading = 'smooth'
  } = viewerSettings;

  useEffect(() => {
    if (!meshData) {
      console.log('[DynamicMesh] No mesh data yet');
      return;
    }
    
    if (!geometryRef.current) {
      console.log('[DynamicMesh] Geometry ref not ready, creating new geometry');
      geometryRef.current = new THREE.BufferGeometry();
    }

    const { positions, normals, indices } = meshData;
    
    console.log('[DynamicMesh] Updating mesh:', {
      vertices: meshData.vertexCount,
      indices: meshData.indexCount,
      positionsLength: positions.length,
      normalsLength: normals.length,
      indicesLength: indices.length
    });

    // Update position attribute
    const posAttr = geometryRef.current.getAttribute('position');
    if (posAttr && posAttr.array.length === positions.length) {
      // Same size - just update the values
      console.log('[DynamicMesh] Updating existing position attribute');
      posAttr.array.set(positions);
      posAttr.needsUpdate = true;
    } else {
      // Different size - create new attribute
      console.log('[DynamicMesh] Creating new position attribute');
      geometryRef.current.setAttribute(
        'position',
        new THREE.BufferAttribute(positions, 3)
      );
    }

    // Update normal attribute
    const nrmAttr = geometryRef.current.getAttribute('normal');
    if (nrmAttr && nrmAttr.array.length === normals.length) {
      // Same size - just update the values
      console.log('[DynamicMesh] Updating existing normal attribute');
      nrmAttr.array.set(normals);
      nrmAttr.needsUpdate = true;
    } else {
      // Different size - create new attribute
      console.log('[DynamicMesh] Creating new normal attribute');
      geometryRef.current.setAttribute(
        'normal',
        new THREE.BufferAttribute(normals, 3)
      );
    }

    // Update index
    const idxAttr = geometryRef.current.getIndex();
    if (idxAttr && idxAttr.array.length === indices.length) {
      // Same size - just update the values
      console.log('[DynamicMesh] Updating existing index');
      idxAttr.array.set(indices);
      idxAttr.needsUpdate = true;
    } else {
      // Different size - create new index
      console.log('[DynamicMesh] Creating new index');
      geometryRef.current.setIndex(
        new THREE.BufferAttribute(indices, 1)
      );
    }

    // Recompute normals if flat shading
    if (shading === 'flat') {
      geometryRef.current.computeVertexNormals();
    }

    // IMPORTANT: Mark geometry as needing update
    geometryRef.current.attributes.position.needsUpdate = true;
    geometryRef.current.attributes.normal.needsUpdate = true;
    if (geometryRef.current.index) {
      geometryRef.current.index.needsUpdate = true;
    }

    // Recompute bounding sphere for proper camera framing
    geometryRef.current.computeBoundingSphere();
    geometryRef.current.computeBoundingBox();
    
    console.log('[DynamicMesh] Bounding sphere:', geometryRef.current.boundingSphere);

    // Auto-frame camera on first mesh load
    if (!hasCentered && geometryRef.current.boundingSphere) {
      const bs = geometryRef.current.boundingSphere;
      const center = bs.center;
      const radius = bs.radius;
      
      console.log('[DynamicMesh] Auto-framing camera:', { center, radius });

      if (controls) {
        controls.target.copy(center);
      }

      const offset = new THREE.Vector3(1, 1, 1).multiplyScalar(radius * 2.5);
      camera.position.copy(center).add(offset);
      camera.updateProjectionMatrix();

      setHasCentered(true);
    }
  }, [meshData, camera, controls, hasCentered, shading]);

  if (!meshData) {
    console.log('[DynamicMesh] Render: No mesh data, returning null');
    return null;
  }

  console.log('[DynamicMesh] Render: Rendering mesh with geometry ref:', !!geometryRef.current);

  return (
    <group>
      {/* Main mesh */}
      {!wireframeOnly && (
        <mesh ref={meshRef}>
          <bufferGeometry ref={geometryRef} />
          <meshStandardMaterial
            color={color}
            metalness={metalness}
            roughness={roughness}
            side={THREE.DoubleSide}
            flatShading={shading === 'flat'}
          />
        </mesh>
      )}

      {/* Wireframe overlay or wireframe-only mode */}
      {(showWireframe || wireframeOnly) && meshData && geometryRef.current && (
        <lineSegments ref={wireframeRef}>
          <edgesGeometry args={[geometryRef.current]} />
          <lineBasicMaterial color={wireframeOnly ? color : '#000000'} linewidth={1} />
        </lineSegments>
      )}
    </group>
  );
}

export default DynamicMesh;
