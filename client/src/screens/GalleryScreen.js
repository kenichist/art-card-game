import React, { useEffect, useRef, useState } from 'react';
import { Container, Spinner, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

const GalleryScreen = () => {
    const { t } = useTranslation();
    const unityCanvasRef = useRef(null);
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
        // devicePixelRatio: 1 // Consider if needed
    };

    useEffect(() => {
        if (!unityCanvasRef.current || document.getElementById("unity-loader-script")) {
            console.log("Skipping Unity load: Canvas ref not ready or script exists.");
            return;
        }

        setIsLoading(true);
        setError(null);
        console.log(`Loading Unity Loader from: ${loaderUrl}`);
        console.log(`Canvas element ref:`, unityCanvasRef.current);

        const script = document.createElement("script");
        script.id = "unity-loader-script";
        script.src = loaderUrl;
        script.async = true;

        script.onload = () => {
            console.log("Unity Loader script loaded.");

            if (!unityCanvasRef.current) {
                console.error("Unity canvas ref became NULL or UNDEFINED inside onload! Aborting.");
                setError("Unity canvas element disappeared before initialization.");
                setIsLoading(false);
                return;
            }

            if (typeof window.createUnityInstance === "function") {
                console.log("Attempting to create Unity instance on canvas:", unityCanvasRef.current);
                window.createUnityInstance(unityCanvasRef.current, config, (progress) => {
                    console.log(`Unity Loading Progress: ${Math.round(progress * 100)}%`); // Rounded progress
                }).then((unityInstance) => {
                    console.log("Unity instance created successfully.");
                    unityInstanceRef.current = unityInstance;
                    setIsLoading(false);
                    // Optional: Inform Unity about the canvas size if needed internally
                    // setTimeout(() => { // Delay slightly if initial size is read too early
                    //     if (unityInstanceRef.current && unityCanvasRef.current) {
                    //         unityInstanceRef.current.SendMessage('YourUIManager', 'ScreenResize', JSON.stringify({ width: unityCanvasRef.current.clientWidth, height: unityCanvasRef.current.clientHeight }));
                    //     }
                    // }, 100);
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
            const scriptToRemove = document.getElementById("unity-loader-script");
            if (scriptToRemove && scriptToRemove.parentNode) {
                scriptToRemove.parentNode.removeChild(scriptToRemove);
                console.log("Unity Loader script removed.");
            } else {
                console.log("Unity Loader script already removed or not found during cleanup.");
            }

            const currentUnityInstance = unityInstanceRef.current;
            if (currentUnityInstance) {
                unityInstanceRef.current = null;
                currentUnityInstance.Quit().then(() => {
                    console.log("Unity instance quit successfully.");
                }).catch((err) => {
                    console.warn("Error quitting Unity instance (might be ok if already crashed):", err);
                });
            } else {
                console.log("No active Unity instance found to quit.");
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty dependency array is correct here

    // --- STYLING CHANGES START ---

    // Style for the main outer container (fills viewport, centers content)
    const outerContainerStyle = {
        height: 'calc(100vh - 56px)', // Adjust '56px' based on your Header/Navbar
        width: '100%',
        padding: 0, // Remove default bootstrap padding if needed
        backgroundColor: '#2b2b2b', // Background for letterboxing
        display: 'flex',        // Use flexbox for centering
        alignItems: 'center',   // Center vertically
        justifyContent: 'center', // Center horizontally
        overflow: 'hidden',     // Prevent scrollbars if content somehow overflows
        position: 'relative',   // Keep for absolute positioning of overlays
    };

    // Style for the inner container that enforces the 16:9 aspect ratio
    const aspectRatioBoxStyle = {
        position: 'relative', // Needed for child canvas potentially? Good practice.
        width: '100%',        // Try to take full width first
        maxWidth: '100%',     // Don't exceed parent width
        maxHeight: '100%',    // Don't exceed parent height
        aspectRatio: '16 / 9', // <<< THE KEY: Enforce 16:9 ratio
        // backgroundColor: '#ff0000' // DEBUG: Add color to see the box
    };

    // Style for the canvas element itself (fills the aspect ratio box)
    const canvasStyle = {
        width: '100%',
        height: '100%',
        display: 'block', // Prevent potential small gaps below canvas
        // backgroundColor: '#00ff00' // DEBUG: Add color to see the canvas
    };

    // --- STYLING CHANGES END ---

    return (
        // Use the outer container style on the Bootstrap Container
        <Container fluid style={outerContainerStyle} className="unity-outer-container">

            {/* Inner div to enforce aspect ratio */}
            <div style={aspectRatioBoxStyle} className="unity-aspect-ratio-box">
                {/* The explicit Canvas element fills the aspect ratio box */}
                <canvas
                    ref={unityCanvasRef}
                    id="unity-canvas"
                    style={canvasStyle}
                    // tabIndex={1} // Add if keyboard input needed
                />
            </div>

            {/* Loading Indicator (positioned relative to outer container) */}
            {isLoading && (
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', color: 'white', zIndex: 1 }}>
                    <Spinner animation="border" role="status" style={{ width: '3rem', height: '3rem' }}>
                        <span className="visually-hidden">{t('loading')}...</span>
                    </Spinner>
                    <p className="mt-2">{t('loading')} Unity Gallery...</p>
                </div>
            )}

            {/* Error Message (positioned relative to outer container) */}
            {error && !isLoading && (
                 <div style={{ position: 'absolute', top: '10px', left: '10px', right: '10px', zIndex: 10 }}>
                    <Alert variant="danger">{t('error', { message: error })}</Alert>
                 </div>
            )}

        </Container>
    );
};

export default GalleryScreen;