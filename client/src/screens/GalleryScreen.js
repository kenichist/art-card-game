import React, { useEffect, useRef, useState } from 'react';
import { Container, Spinner, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

const GalleryScreen = () => {
    const { t } = useTranslation();
    // REMOVE: const unityContainerRef = useRef(null); // We won't pass the div directly anymore
    const unityCanvasRef = useRef(null); // <<< NEW: Ref for the canvas element
    const unityInstanceRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- Configuration: Adjust these based on your Unity Build ---
    const buildFolderName = "UnityBuild";
    const buildBaseName = "UnityBuild";
    // --- End Configuration ---

    const loaderUrl = `${process.env.PUBLIC_URL}/${buildFolderName}/Build/${buildBaseName}.loader.js`;
    const config = {
        dataUrl: `${process.env.PUBLIC_URL}/${buildFolderName}/Build/${buildBaseName}.data`,
        frameworkUrl: `${process.env.PUBLIC_URL}/${buildFolderName}/Build/${buildBaseName}.framework.js`,
        codeUrl: `${process.env.PUBLIC_URL}/${buildFolderName}/Build/${buildBaseName}.wasm`,
        streamingAssetsUrl: `${process.env.PUBLIC_URL}/${buildFolderName}/StreamingAssets`,
        companyName: "DefaultCompany",
        productName: "UnityBuild",
        productVersion: "1.0",
        // IMPORTANT: Tell Unity loader not to resize canvas itself if you manage it via CSS
        // Adjust devicePixelRatio if needed on high-DPI screens, start with 1
        // devicePixelRatio: 1 // <-- Consider adding this if you see resolution issues later
    };

    useEffect(() => {
        // Ensure CANVAS ref exists and script isn't already loaded/loading
        // <<< UPDATED: Check canvas ref now
        if (!unityCanvasRef.current || document.getElementById("unity-loader-script")) {
            console.log("Skipping Unity load: Canvas ref not ready or script exists.");
            // If the ref isn't ready on first mount, useEffect might run again later if dependencies change (though shouldn't here)
            // If script exists, we assume loading is in progress or failed/succeeded already.
            return;
        }

        setIsLoading(true);
        setError(null);
        console.log(`Loading Unity Loader from: ${loaderUrl}`);
        console.log(`Canvas element ref:`, unityCanvasRef.current); // Check if it's logged correctly

        const script = document.createElement("script");
        script.id = "unity-loader-script";
        script.src = loaderUrl;
        script.async = true;

        script.onload = () => {
            console.log("Unity Loader script loaded.");

            // --- ADD THIS CHECK ---
            if (!unityCanvasRef.current) { // <<< UPDATED: Re-check canvas ref just before use
                console.error("Unity canvas ref became NULL or UNDEFINED inside onload! Aborting.");
                setError("Unity canvas element disappeared before initialization.");
                setIsLoading(false);
                return; // Stop execution
            }
             // --- END CHECK ---


            if (typeof window.createUnityInstance === "function") {
                console.log("Attempting to create Unity instance on canvas:", unityCanvasRef.current); // <<< UPDATED: Log canvas element
                // <<< ***** THE KEY CHANGE IS HERE ***** >>>
                // Pass the CANVAS ref directly, not the container div ref
                window.createUnityInstance(unityCanvasRef.current, config, (progress) => {
                    console.log(`Unity Loading Progress: ${progress * 100}%`);
                }).then((unityInstance) => {
                    console.log("Unity instance created successfully.");
                    unityInstanceRef.current = unityInstance;
                    setIsLoading(false);
                    // Optional: Force resize if needed after load, though CSS should handle it
                    // unityInstance.SendMessage('YourUIManager', 'ScreenResize', JSON.stringify({ width: unityCanvasRef.current.width, height: unityCanvasRef.current.height }));
                }).catch((message) => {
                    console.error("Failed to create Unity instance:", message);
                    setError(`Failed to initialize Unity: ${message}`);
                    setIsLoading(false);
                });
            } else {
                const errMsg = "window.createUnityInstance function not found after script load. Check Unity build and loader script.";
                console.error(errMsg);
                setError(errMsg);
                setIsLoading(false);
            }
        };

        script.onerror = (err) => {
            const errMsg = `Failed to load Unity Loader script from ${loaderUrl}.`;
            console.error(errMsg, err);
            setError(errMsg);
            setIsLoading(false);
        };

        document.body.appendChild(script);

        return () => {
            console.log("Unmounting GalleryScreen, attempting to quit Unity instance.");
             // --- Enhanced Cleanup ---
            const scriptToRemove = document.getElementById("unity-loader-script");
            if (scriptToRemove && scriptToRemove.parentNode) {
                scriptToRemove.parentNode.removeChild(scriptToRemove);
                console.log("Unity Loader script removed.");
            } else {
                console.log("Unity Loader script already removed or not found during cleanup.");
            }
            // Make sure createUnityInstance isn't somehow cached globally by the loader itself if it failed once?
            // delete window.createUnityInstance; // Probably too aggressive, but keep in mind if issues persist across navigation

            const currentUnityInstance = unityInstanceRef.current;
            if (currentUnityInstance) {
                 // Important: Set ref to null *before* calling async Quit
                 unityInstanceRef.current = null;
                 currentUnityInstance.Quit().then(() => {
                    console.log("Unity instance quit successfully.");
                 }).catch((err) => {
                     // Warn because the component is gone anyway
                    console.warn("Error quitting Unity instance (might be ok if already crashed):", err);
                 });
            } else {
                console.log("No active Unity instance found to quit.");
            }
            // --- End Enhanced Cleanup ---
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty dependency array is correct here

    const containerStyle = {
        height: 'calc(100vh - 56px)', // Adjust '56px' based on your Header/Navbar
        width: '100%',
        position: 'relative',
        padding: 0,
        backgroundColor: '#2b2b2b',
        overflow: 'hidden'
    };

    // Style for the canvas element itself
    const canvasStyle = {
        width: '100%',
        height: '100%',
        display: 'block', // Prevent potential small gaps below canvas
    };

    return (
        // Container still useful for positioning loading/error messages
        <Container fluid style={containerStyle} className="unity-container-wrapper"> {/* Added a class for potential CSS targeting */}

            {/* The explicit Canvas element */}
            {/* <<< UPDATED: Render a canvas and assign the ref >>> */}
            <canvas
                ref={unityCanvasRef}
                id="unity-canvas" // Good practice to have an ID
                style={canvasStyle}
                // You might need tabindex if you need keyboard input directly to Unity
                // tabIndex={1}
            />

            {/* Loading Indicator */}
            {isLoading && (
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', color: 'white', zIndex: 1 }}>
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