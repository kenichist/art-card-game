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
        // Paths to scan for assets to preload
        const assetPaths = [
          '/images/collectors/',
          '/images/collectors/en/',
          '/images/collectors/zh/',
          '/images/items/',
          '/images/items/en/',
          '/images/items/zh/',
          '/background/',
          '/sounds/'
        ];

        let allAssets = [];
        let loadedCount = 0;

        // Collect all assets from the paths
        for (const path of assetPaths) {
          try {
            const response = await axios.get(`${process.env.PUBLIC_URL}${path}`, { 
              headers: { 'Accept': 'application/json' } 
            });
            
            // This might need adjustment depending on your server's directory listing format
            // Here we're making a simple assumption about file URLs
            if (response.data && typeof response.data === 'string') {
              // Parse HTML directory listing for file links
              const regex = /href="([^"]+\.(jpg|jpeg|png|gif|svg|mp3|wav))/gi;
              let match;
              while ((match = regex.exec(response.data)) !== null) {
                allAssets.push(`${process.env.PUBLIC_URL}${path}${match[1]}`);
              }
            }
          } catch (error) {
            console.warn(`Couldn't scan directory ${path}:`, error);
          }
        }

        // If directory scanning fails, manually add known key assets
        if (allAssets.length === 0) {
          console.log('Directory scanning failed, adding key assets manually');
          // Add background images
          allAssets.push(`${process.env.PUBLIC_URL}/background/horizontal-bg.jpg`);
          allAssets.push(`${process.env.PUBLIC_URL}/background/vertical-bg.jpg`);
          
          // Add sound assets
          allAssets.push(`${process.env.PUBLIC_URL}/sounds/success.mp3`);
          
          // Add first 30 collector images for both languages (adjust as needed)
          for (let i = 1; i <= 10; i++) {
            allAssets.push(`${process.env.PUBLIC_URL}/images/collectors/i${i}.jpg`);
            allAssets.push(`${process.env.PUBLIC_URL}/images/collectors/p${i}.jpg`);
            allAssets.push(`${process.env.PUBLIC_URL}/images/collectors/s${i}.jpg`);
            allAssets.push(`${process.env.PUBLIC_URL}/images/collectors/en/i${i}.jpg`);
            allAssets.push(`${process.env.PUBLIC_URL}/images/collectors/en/p${i}.jpg`);
            allAssets.push(`${process.env.PUBLIC_URL}/images/collectors/en/s${i}.jpg`);
            allAssets.push(`${process.env.PUBLIC_URL}/images/collectors/zh/i${i}.jpg`);
            allAssets.push(`${process.env.PUBLIC_URL}/images/collectors/zh/p${i}.jpg`);
            allAssets.push(`${process.env.PUBLIC_URL}/images/collectors/zh/s${i}.jpg`);
          }
          
          // Add item images (sample range - adjust as needed)
          for (let i = 1; i <= 24; i++) {
            allAssets.push(`${process.env.PUBLIC_URL}/images/items/en/${i}.jpg`);
            allAssets.push(`${process.env.PUBLIC_URL}/images/items/zh/${i}.jpg`);
          }
        }

        setTotalAssets(allAssets.length);
        console.log(`Preloading ${allAssets.length} assets...`);

        // Preload all images and audio files
        const preloadPromises = allAssets.map((asset) => {
          return new Promise((resolve, reject) => {
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