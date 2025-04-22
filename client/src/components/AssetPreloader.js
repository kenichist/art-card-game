import React, { useState, useEffect } from 'react';
import { Container, Spinner, ProgressBar } from 'react-bootstrap';
import axios from 'axios';

const AssetPreloader = ({ onLoadComplete, children }) => {
  const [loadedAssets, setLoadedAssets] = useState(0);
  const [totalAssets, setTotalAssets] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    const preloadImages = async () => {
      try {
        // Define known assets to preload based on your actual folder structure
        let allAssets = [];
        let loadedCount = 0;

        // Add background images
        allAssets.push(`${process.env.PUBLIC_URL}/background/horizontal-bg.jpg`);
        allAssets.push(`${process.env.PUBLIC_URL}/background/vertical-bg.jpg`);
        
        // Add sound assets
        allAssets.push(`${process.env.PUBLIC_URL}/sounds/success.mp3`);
        
        // Add numbered collector images - based on actual file structure
        // Numbers only, no letter prefixes
        for (let i = 1; i <= 30; i++) {          
          // Add English and Chinese versions
          allAssets.push(`${process.env.PUBLIC_URL}/images/collectors/en/${i}.jpg`);
          allAssets.push(`${process.env.PUBLIC_URL}/images/collectors/zh/${i}.jpg`);
        }
        
        // Add item images

        // Add numbered item images
        for (let i = 1; i <= 72; i++) {
          allAssets.push(`${process.env.PUBLIC_URL}/images/items/en/${i}.jpg`);
          allAssets.push(`${process.env.PUBLIC_URL}/images/items/zh/${i}.jpg`);
        }

        // Add translation files
        allAssets.push(`${process.env.PUBLIC_URL}/locales/en/translation.json`);
        allAssets.push(`${process.env.PUBLIC_URL}/locales/zh/translation.json`);

        setTotalAssets(allAssets.length);
        console.log(`Preloading ${allAssets.length} assets...`);

        // Preload all assets
        const preloadPromises = allAssets.map((asset) => {
          return new Promise((resolve) => {
            if (asset.match(/\.(jpg|jpeg|png|gif|svg)$/i)) {
              const img = new Image();
              img.src = asset;
              img.onload = () => {
                loadedCount++;
                setLoadedAssets(loadedCount);
                setLoadingProgress(Math.floor((loadedCount / allAssets.length) * 100));
                resolve(asset);
              };
              img.onerror = () => {
                console.warn(`Failed to load image: ${asset}`);
                loadedCount++;
                setLoadedAssets(loadedCount);
                setLoadingProgress(Math.floor((loadedCount / allAssets.length) * 100));
                resolve(asset); // Resolve anyway to not block other assets
              };
            } else if (asset.match(/\.(mp3|wav)$/i)) {
              const audio = new Audio();
              audio.preload = 'auto';
              audio.src = asset;
              audio.oncanplaythrough = () => {
                loadedCount++;
                setLoadedAssets(loadedCount);
                setLoadingProgress(Math.floor((loadedCount / allAssets.length) * 100));
                resolve(asset);
              };
              audio.onerror = () => {
                console.warn(`Failed to load audio: ${asset}`);
                loadedCount++;
                setLoadedAssets(loadedCount);
                setLoadingProgress(Math.floor((loadedCount / allAssets.length) * 100));
                resolve(asset); // Resolve anyway to not block other assets
              };
              // For Safari, which may not trigger oncanplaythrough
              setTimeout(() => {
                if (!audio.oncanplaythrough) {
                  loadedCount++;
                  setLoadedAssets(loadedCount);
                  setLoadingProgress(Math.floor((loadedCount / allAssets.length) * 100));
                  resolve(asset);
                }
              }, 3000);
            } else if (asset.match(/\.json$/i)) {
              // Handle JSON files like translations
              fetch(asset)
                .then(() => {
                  loadedCount++;
                  setLoadedAssets(loadedCount);
                  setLoadingProgress(Math.floor((loadedCount / allAssets.length) * 100));
                  resolve(asset);
                })
                .catch(() => {
                  console.warn(`Failed to load JSON: ${asset}`);
                  loadedCount++;
                  setLoadedAssets(loadedCount);
                  setLoadingProgress(Math.floor((loadedCount / allAssets.length) * 100));
                  resolve(asset);
                });
            } else {
              // For other file types, just resolve
              loadedCount++;
              setLoadedAssets(loadedCount);
              setLoadingProgress(Math.floor((loadedCount / allAssets.length) * 100));
              resolve(asset);
            }
          });
        });

        // When all assets are loaded
        await Promise.all(preloadPromises);
        console.log('All assets preloaded!');
        
        // Add a small delay to ensure UI updates before hiding the loader
        setTimeout(() => {
          setIsLoading(false);
          if (onLoadComplete) onLoadComplete();
        }, 500);
      } catch (error) {
        console.error('Asset preloading failed:', error);
        setError('Failed to preload assets. Please refresh the page.');
        // Continue to app anyway after a delay
        setTimeout(() => {
          setIsLoading(false);
          if (onLoadComplete) onLoadComplete();
        }, 3000);
      }
    };

    preloadImages();
  }, [onLoadComplete]);

  // Loading screen remains the same
  if (isLoading) {
    return (
      <Container 
        fluid 
        className="d-flex flex-column justify-content-center align-items-center"
        style={{
          height: '100vh',
          backgroundColor: '#0a0a0a',
          color: '#EDB65B',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 9999,
          fontFamily: 'MedievalSharp, cursive',
        }}
      >
        <h1 className="mb-4" style={{ fontSize: '3rem', textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)' }}>
          Loading Assets
        </h1>
        
        <div className="mb-4" style={{ width: '80%', maxWidth: '500px' }}>
          <ProgressBar 
            now={loadingProgress} 
            label={`${loadingProgress}%`} 
            variant="warning" 
            style={{ height: '25px', backgroundColor: '#333' }}
          />
        </div>
        
        <div className="text-center mb-4">
          <p style={{ fontSize: '1.2rem' }}>
            Loading {loadedAssets} of {totalAssets} assets
          </p>
        </div>
        
        <Spinner animation="border" role="status" variant="warning" style={{ width: '4rem', height: '4rem' }}>
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        
        {error && (
          <div className="mt-4 text-danger">
            <p>{error}</p>
          </div>
        )}
      </Container>
    );
  }

  return <>{children}</>;
};

export default AssetPreloader;