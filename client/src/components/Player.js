// src/components/Player.js
import React, { useEffect, useRef } from 'react'; // <-- ONLY ONE import React
// Optional: for physics/collision later
// import { useSphere } from '@react-three/cannon';
import { useThree, useFrame } from '@react-three/fiber';
import { useKeyboardControls } from '@react-three/drei';
import * as THREE from 'three';

const SPEED = 5; // Movement speed
const direction = new THREE.Vector3();
const frontVector = new THREE.Vector3();
const sideVector = new THREE.Vector3();

export const Player = (props) => {
  const { camera } = useThree();
  const [, get] = useKeyboardControls(); // Get keyboard state getter

  // Optional physics setup (using @react-three/cannon)
  // const [ref, api] = useSphere(() => ({ mass: 1, type: 'Dynamic', position: [0, 1, 10], ...props }));
  // const velocity = useRef([0, 0, 0]);
  // useEffect(() => api.velocity.subscribe((v) => (velocity.current = v)), [api.velocity]);

  // Move camera directly (without physics initially)
  const cameraRef = useRef(camera);
  useEffect(() => {
      // Set initial camera position if needed
      camera.position.set(0, 1.6, 10); // Adjust starting position (Y is height)
      cameraRef.current = camera;
  }, [camera]);


  useFrame((state, delta) => {
    const { forward, backward, left, right, jump } = get(); // Get current key states

    // --- Calculate movement direction based on camera orientation ---
    camera.getWorldDirection(frontVector);
    frontVector.y = 0;
    frontVector.normalize();

    sideVector.crossVectors(camera.up, frontVector);
    sideVector.normalize();

    direction.set(0, 0, 0);

    if (forward) direction.add(frontVector);
    if (backward) direction.sub(frontVector);
    if (left) direction.add(sideVector);
    if (right) direction.sub(sideVector);

    if (direction.length() > 0) {
        direction.normalize();
    }

    const moveSpeed = SPEED * delta;
    direction.multiplyScalar(moveSpeed);

    // --- Apply movement ---
    camera.position.add(direction);

    // // Physics examples commented out
    // // api.velocity.set(direction.x * SPEED, velocity.current[1], direction.z * SPEED);
    // // if (jump && Math.abs(velocity.current[1]) < 0.05) {
    // //   api.velocity.set(velocity.current[0], 8, velocity.current[2]);
    // // }
    // // api.position.set(camera.position.x + direction.x, camera.position.y, camera.position.z + direction.z);

  });

  return null; // Player component doesn't render anything visible itself
};
