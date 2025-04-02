// --- START OF FILE src/components/ModelViewer.js ---

import React, { useRef, useState, useEffect, useMemo } from 'react'; // Added useEffect, useMemo
import { useGLTF, Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';


const ModelViewer = ({ modelPath, itemData, position = [0, 0, 0], scale = 1, rotation = [0, 0, 0] }) => {
  const group = useRef();
  const [hovered, setHovered] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  // useGLTF hook for loading the model
  const { scene } = useGLTF(modelPath, true); // true enables Draco if available

  // Clone the scene to allow independent manipulation/multiple instances
  const clonedScene = useMemo(() => scene.clone(), [scene]);

  // Apply shadows to all meshes within the loaded model
  useEffect(() => {
    clonedScene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [clonedScene]);


  // Optional: Hover animation/effect
  // useFrame(() => {
  //   if (group.current && hovered) {
  //     // group.current.rotation.y += 0.01;
  //   }
  // });

  const handlePointerOver = (e) => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = (e) => {
    setHovered(false);
    document.body.style.cursor = 'default';
  };

  const handleClick = (e) => {
    e.stopPropagation();
    setShowInfo((prev) => !prev); // Toggle info display safely
    console.log("Clicked Item:", itemData);
  };

  // Ensure scale is always an array [x, y, z]
  const scaleFactor = Array.isArray(scale) ? scale : [scale, scale, scale];

  return (
    <group ref={group} position={position} dispose={null}>
      {/* Render the loaded scene */}
      <primitive
        object={clonedScene}
        scale={scaleFactor}
        rotation={rotation}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      />

      {/* Display Item Info using Drei's Html component on click */}
      {showInfo && itemData && ( // Only show if showInfo is true AND itemData exists
        <Html
          position={[0, (scaleFactor[1] * 1.1), 0]} // Adjust position based on model's scaled height
          center
          distanceFactor={10}
          zIndexRange={[100, 0]}
          style={{
            pointerEvents: 'none',
          }}
        >
          <div style={{
            background: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '5px',
            fontSize: '14px',
            whiteSpace: 'nowrap',
            textAlign: 'center'
          }}>
            <p style={{ margin: 0, fontWeight: 'bold' }}>{itemData.name || 'Item'}</p>
          </div>
        </Html>
      )}
    </group>
  );
};

export default ModelViewer;
// --- END OF FILE src/components/ModelViewer.js ---