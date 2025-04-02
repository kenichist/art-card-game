import React, { useEffect, useRef, useState } from 'react';
import { Container, Spinner, Alert } from 'react-bootstrap'; // Keep bootstrap for container/messages
import { useTranslation } from 'react-i18next'; // Keep translation if needed for messages

const GalleryScreen = () => {
  const { t } = useTranslation();
  const unityContainerRef = useRef(null); // Ref for the div that will host Unity
  const unityInstanceRef = useRef(null); // Ref to store the Unity instance
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Configuration: Adjust these based on your Unity Build ---
  const buildFolderName = "UnityBuild"; // The name of the folder you placed in client/public/
  const buildBaseName = "UnityBuild";   // The base name of your build files (e.g., UnityBuild.loader.js)
  // --- End Configuration ---

  // Construct paths relative to the public folder
  const loaderUrl = `${process.env.PUBLIC_URL}/${buildFolderName}/Build/${buildBaseName}.loader.js`;
  const config = {
    dataUrl: `${process.env.PUBLIC_URL}/${buildFolderName}/Build/${buildBaseName}.data`, // Unity will add .br or .gz automatically if server configured
    frameworkUrl: `${process.env.PUBLIC_URL}/${buildFolderName}/Build/${buildBaseName}.framework.js`, // Unity will add .br or .gz
    codeUrl: `${process.env.PUBLIC_URL}/${buildFolderName}/Build/${buildBaseName}.wasm`, // Unity will add .br or .gz
    streamingAssetsUrl: `${process.env.PUBLIC_URL}/${buildFolderName}/StreamingAssets`, // Optional: If you use StreamingAssets
    // companyName: "DefaultCompany", // Optional: As set in Unity Player Settings
    // productName: "UnityProject", // Optional: As set in Unity Player Settings
    // productVersion: "1.0", // Optional: As set in Unity Player Settings
  };

  useEffect(() => {
    // Ensure container exists and script isn't already loaded/loading
    if (!unityContainerRef.current || document.getElementById("unity-loader-script")) {
      return;
    }

    setIsLoading(true);
    setError(null);
    console.log(`Loading Unity Loader from: ${loaderUrl}`);

    // Create script tag for Unity loader
    const script = document.createElement("script");
    script.id = "unity-loader-script"; // Add an ID to prevent multiple loads
    script.src = loaderUrl;
    script.async = true;

    // Handle script load success
    script.onload = () => {
      console.log("Unity Loader script loaded.");
      // Check if createUnityInstance is defined globally (standard for recent Unity versions)
      if (typeof createUnityInstance === "function") {
        createUnityInstance(unityContainerRef.current, config, (progress) => {
          console.log(`Unity Loading Progress: ${progress * 100}%`);
          // You could update a progress bar here if desired
        }).then((unityInstance) => {
          console.log("Unity instance created successfully.");
          unityInstanceRef.current = unityInstance; // Store the instance
          setIsLoading(false);
        }).catch((message) => {
          console.error("Failed to create Unity instance:", message);
          setError(`Failed to initialize Unity: ${message}`);
          setIsLoading(false);
        });
      } else {
        const errMsg = "createUnityInstance function not found. Check Unity build and loader script.";
        console.error(errMsg);
        setError(errMsg);
        setIsLoading(false);
      }
    };

    // Handle script load error
    script.onerror = (err) => {
      const errMsg = `Failed to load Unity Loader script from ${loaderUrl}. Ensure the path is correct and the build files are in the public folder.`;
      console.error(errMsg, err);
      setError(errMsg);
      setIsLoading(false);
    };

    // Append script to the body to start loading
    document.body.appendChild(script);

    // --- Cleanup function on component unmount ---
    return () => {
      console.log("Unmounting GalleryScreen, attempting to quit Unity instance.");
      const currentUnityInstance = unityInstanceRef.current;
      if (currentUnityInstance) {
        currentUnityInstance.Quit().then(() => {
          console.log("Unity instance quit successfully.");
        }).catch((err) => {
          console.warn("Error quitting Unity instance:", err);
        });
        unityInstanceRef.current = null; // Clear the ref
      }

      // Remove the script tag
      const loadedScript = document.getElementById("unity-loader-script");
      if (loadedScript && loadedScript.parentNode) {
        loadedScript.parentNode.removeChild(loadedScript);
        console.log("Unity Loader script removed.");
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  // Calculate container height (similar to previous R3F version)
  // Adjust '56px' based on your actual Header height if necessary
  const containerStyle = {
    height: 'calc(100vh - 56px)',
    width: '100%', // Ensure it takes full width
    position: 'relative', // Needed for absolute positioning of loading/error messages
    padding: 0, // Remove padding if you want Unity full bleed
    backgroundColor: '#2b2b2b', // Background while loading or if Unity doesn't cover
    overflow: 'hidden' // Hide potential scrollbars during load/resize
  };

  return (
    <Container fluid style={containerStyle}>
      {/* Div where the Unity Canvas will be injected */}
      <div
          ref={unityContainerRef}
          id="unity-container"
          style={{ width: '100%', height: '100%' }} // Ensure div takes full space
      />

      {/* Loading Indicator */}
      {isLoading && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', color: 'white' }}>
          <Spinner animation="border" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">{t('loading')}...</span>
          </Spinner>
          <p className="mt-2">{t('loading')} Unity Gallery...</p>
        </div>
      )}

      {/* Error Message */}
      {error && !isLoading && (
         <div style={{ position: 'absolute', top: '10px', left: '10px', right: '10px', zIndex: 10 }}>
            <Alert variant="danger">{t('error', { message: error })}</Alert>
         </div>
      )}

    </Container>
  );
};

export default GalleryScreen;