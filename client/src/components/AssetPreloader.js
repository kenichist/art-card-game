import React, { useState, useEffect } from 'react';
import { Container, Spinner, ProgressBar } from 'react-bootstrap';
import axios from 'axios';

const AssetPreloader = ({ onLoadComplete, children }) => {
  const [loadedAssets, setLoadedAssets] = useState(0);
  const [totalAssets, setTotalAssets] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState(null);
  const [currentAsset, setCurrentAsset] = useState('');

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
        const preloadPromises = allAssets.map((asset, index) => {
          return new Promise((resolve) => {
            // Log the current asset being loaded
            console.log(`Loading asset: ${asset}`);
            setCurrentAsset(asset.split('/').pop()); // Extract filename for display
            
            // Set a timeout for each asset to avoid hanging
            const timeout = setTimeout(() => {
              console.warn(`⚠️ Timeout loading asset: ${asset}`);
              loadedCount++;
              setLoadedAssets(loadedCount);
              setLoadingProgress(Math.floor((loadedCount / allAssets.length) * 100));
              resolve(asset); // Resolve after timeout to prevent getting stuck
            }, 10000); // 10 second timeout for each asset
            
            if (asset.match(/\.(jpg|jpeg|png|gif|svg)$/i)) {
              const img = new Image();
              img.src = asset;
              img.onload = () => {
                clearTimeout(timeout); // Clear timeout on successful load
                loadedCount++;
                setLoadedAssets(loadedCount);
                setLoadingProgress(Math.floor((loadedCount / allAssets.length) * 100));
                console.log(`✅ Loaded: ${asset} (${loadedCount}/${allAssets.length})`);
                resolve(asset);
              };
              img.onerror = () => {
                clearTimeout(timeout); // Clear timeout on error
                console.warn(`❌ Failed to load image: ${asset}`);
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
                clearTimeout(timeout); // Clear timeout on successful load
                loadedCount++;
                setLoadedAssets(loadedCount);
                setLoadingProgress(Math.floor((loadedCount / allAssets.length) * 100));
                console.log(`✅ Loaded audio: ${asset} (${loadedCount}/${allAssets.length})`);
                resolve(asset);
              };
              audio.onerror = () => {
                clearTimeout(timeout); // Clear timeout on error
                console.warn(`❌ Failed to load audio: ${asset}`);
                loadedCount++;
                setLoadedAssets(loadedCount);
                setLoadingProgress(Math.floor((loadedCount / allAssets.length) * 100));
                resolve(asset); // Resolve anyway to not block other assets
              };
              // For Safari, which may not trigger oncanplaythrough
              setTimeout(() => {
                if (audio.readyState < 4) { // If not loaded completely
                  clearTimeout(timeout); // Clear master timeout
                  console.warn(`⚠️ Audio not fully loaded but continuing: ${asset}`);
                  loadedCount++;
                  setLoadedAssets(loadedCount);
                  setLoadingProgress(Math.floor((loadedCount / allAssets.length) * 100));
                  resolve(asset);
                }
              }, 5000);
            } else if (asset.match(/\.json$/i)) {
              // Handle JSON files like translations
              fetch(asset)
                .then(() => {
                  clearTimeout(timeout); // Clear timeout on successful load
                  loadedCount++;
                  setLoadedAssets(loadedCount);
                  setLoadingProgress(Math.floor((loadedCount / allAssets.length) * 100));
                  console.log(`✅ Loaded JSON: ${asset} (${loadedCount}/${allAssets.length})`);
                  resolve(asset);
                })
                .catch(() => {
                  clearTimeout(timeout); // Clear timeout on error
                  console.warn(`❌ Failed to load JSON: ${asset}`);
                  loadedCount++;
                  setLoadedAssets(loadedCount);
                  setLoadingProgress(Math.floor((loadedCount / allAssets.length) * 100));
                  resolve(asset);
                });
            } else {
              // For other file types, just resolve
              clearTimeout(timeout); // Clear timeout immediately
              loadedCount++;
              setLoadedAssets(loadedCount);
              setLoadingProgress(Math.floor((loadedCount / allAssets.length) * 100));
              resolve(asset);
            }
          });
        });

        // Add global timeout to ensure we don't wait forever
        const globalTimeoutPromise = new Promise(resolve => {
          setTimeout(() => {
            console.warn("⚠️ Global timeout reached. Proceeding with application.");
            resolve("timeout");
          }, 30000); // 30 second global timeout
        });

        // Race between all assets loading and global timeout
        await Promise.race([
          Promise.all(preloadPromises),
          globalTimeoutPromise
        ]);

        console.log('✨ All assets preloaded or timeout reached!');
        
        // Reset current asset to avoid showing the last loaded asset when done
        setCurrentAsset('');
        
        // Force progress to 100% if we're almost there (handles last asset stuck)
        if (loadingProgress > 95) {
          setLoadingProgress(100);
          setLoadedAssets(totalAssets);
        }
        
        // Add a small delay to ensure UI updates before hiding the loader
        setTimeout(() => {
          setIsLoading(false);
          if (onLoadComplete) onLoadComplete();
        }, 500);
      } catch (error) {
        console.error('Asset preloading failed:', error);
        setError('Failed to preload assets. Please refresh the page.');
        setCurrentAsset(''); // Reset current asset in case of error too
        
        // Continue to app anyway after a delay
        setTimeout(() => {
          setIsLoading(false);
          if (onLoadComplete) onLoadComplete();
        }, 3000);
      }
    };

    preloadImages();
    
    // Cleanup function to ensure we clear current asset if component unmounts
    return () => {
      setCurrentAsset('');
    };
  }, [onLoadComplete]);

  // Create a message based on loading status
  const getLoadingMessage = () => {
    if (loadingProgress >= 98) {
      return "Finalizing...";
    } else if (currentAsset) {
      return `Currently loading: ${currentAsset}`;
    }
    return "Preparing assets...";
  };

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
          <p style={{ fontSize: '0.9rem', color: '#d0d0d0' }}>
            {getLoadingMessage()}
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