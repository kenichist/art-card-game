import React, { Suspense, useState, useEffect, useMemo } from 'react'; // Added useMemo
import { Canvas } from '@react-three/fiber';
// Import PointerLockControls and KeyboardControls, remove OrbitControls
import { PointerLockControls, Html, Environment, Sky, KeyboardControls } from '@react-three/drei';
import { Container, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import ModelViewer from '../components/ModelViewer'; // Ensure this path is correct
import { Player } from '../components/Player'; // Import the new Player component

// Define keyboard mapping actions (can be moved to a separate constants file if preferred)
const Controls = {
  forward: 'forward',
  backward: 'backward',
  left: 'left',
  right: 'right',
  jump: 'jump', // Kept for potential future use
}

// Component containing the actual 3D scene elements
const SceneContent = () => {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  const backendUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchItemsWithModels = async () => {
      try {
        setError(null);
        if (!backendUrl) {
          throw new Error("REACT_APP_API_URL is not defined in the environment.");
        }
        const { data } = await axios.get(`${backendUrl}/api/items`);
        const itemsWithModels = data.filter(item => item.modelPath && typeof item.modelPath === 'string' && item.modelPath.trim() !== '');
        if (itemsWithModels.length === 0) {
            console.warn("No items found with valid model paths.");
        }
        setItems(itemsWithModels);
      } catch (err) {
         console.error("Error fetching items:", err);
         setError(err.response?.data?.message || err.message || "Failed to load item data.");
      }
    };
    fetchItemsWithModels();
  }, [backendUrl]);

   // Simple grid layout function (remains the same)
   const gridLayout = (index, totalItems) => {
      const itemsPerRow = Math.max(3, Math.ceil(Math.sqrt(totalItems)));
      const spacing = 5;
      const row = Math.floor(index / itemsPerRow);
      const col = index % itemsPerRow;
      const offsetX = (itemsPerRow - 1) * spacing / 2;
      return [col * spacing - offsetX, 0.1, row * spacing];
  };

  if (error) {
    return <Html center><Alert variant="danger">{t('error', { message: error })}</Alert></Html>;
  }

  return (
    <>
      {/* Lighting Setup (remains the same) */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[8, 15, 5]}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <directionalLight position={[-8, 10, -5]} intensity={0.2} />

      {/* Environment & Background (remains the same) */}
      <Sky distance={450000} sunPosition={[5, 1, 8]} turbidity={8} rayleigh={6} mieCoefficient={0.005} mieDirectionalG={0.8} />
      <Environment preset="city" />

      {/* Floor Plane (remains the same) */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#cccccc" roughness={0.7} metalness={0.2} />
      </mesh>

      {/* Render the models (logic remains the same) */}
      {items.map((item, index) => {
          const relativePath = item.modelPath?.startsWith('/') ? item.modelPath : `/${item.modelPath || ''}`;
          const fullModelPath = item.modelPath && backendUrl ? `${backendUrl}${relativePath}` : null;
          return fullModelPath ? (
              <Suspense key={item._id || item.id || index} fallback={null}>
                  <ModelViewer
                      modelPath={fullModelPath}
                      position={gridLayout(index, items.length)}
                      scale={item.modelScale || 0.5}
                      itemData={item}
                  />
              </Suspense>
          ) : (
              console.warn(`Skipping item "${item.name}" due to missing or invalid modelPath: ${item.modelPath}`),
              null
          );
      })}

      {/* --- Add Player for movement logic --- */}
      <Player />

      {/* --- Replace OrbitControls with PointerLockControls --- */}
      <PointerLockControls />
    </>
  );
};

// Main Gallery Screen Component
const GalleryScreen = () => {
  const { t } = useTranslation();

  // Define the keyboard control map using useMemo
  const map = useMemo(() => [
    { name: Controls.forward, keys: ['ArrowUp', 'KeyW'] },
    { name: Controls.backward, keys: ['ArrowDown', 'KeyS'] },
    { name: Controls.left, keys: ['ArrowLeft', 'KeyA'] },
    { name: Controls.right, keys: ['ArrowRight', 'KeyD'] },
    { name: Controls.jump, keys: ['Space'] }, // Keep jump mapping
  ], []);


  return (
    // Container remains the same
    <Container fluid style={{ height: 'calc(100vh - 56px)', padding: 0, position: 'relative', backgroundColor: '#f0f0f0' }}>
       {/* --- Wrap Canvas with KeyboardControls --- */}
      <KeyboardControls map={map}>
        <Canvas
          shadows
          // Remove the camera prop - Player component will manage the camera viewpoint
          gl={{ preserveDrawingBuffer: true }}
        >
          <Suspense fallback={
            <Html center>
              <div style={{ color: 'black', backgroundColor: 'rgba(255,255,255,0.7)', padding: '10px 20px', borderRadius: '5px' }}>
                {t('loading')}...
              </div>
            </Html>
          }>
            {/* SceneContent contains lights, models, floor, player, and controls */}
            <SceneContent />
          </Suspense>
        </Canvas>

        {/* --- UI Overlay for Pointer Lock Instruction --- */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: 'white',
          backgroundColor: 'rgba(0,0,0,0.5)',
          padding: '15px',
          borderRadius: '8px',
          textAlign: 'center',
          fontSize: '16px',
          pointerEvents: 'none' // Allows clicks to pass through to the canvas
        }}>
          {t('clickToNavigate')} {/* Use translation key if available */}
          <br />
          (WASD / Arrow Keys to Move, Mouse to Look)
        </div>
      </KeyboardControls> {/* Close KeyboardControls */}
    </Container>
  );
};

export default GalleryScreen;