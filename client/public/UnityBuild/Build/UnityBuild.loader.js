console.log("[Placeholder] UnityBuild.loader.js script loaded.");

// Define a dummy function so the 'createUnityInstance is not defined' error might be avoided initially.
// Note: This will NOT actually load or run Unity.
function createUnityInstance(canvas, config, progressCallback) {
  console.log("[Placeholder] createUnityInstance called.");
  console.log("[Placeholder] Canvas target:", canvas);
  console.log("[Placeholder] Config:", config);

  // Simulate progress
  if (progressCallback) {
    progressCallback(0.1); // Simulate some progress
    setTimeout(() => progressCallback(1.0), 50); // Simulate completion
  }

  // Return a promise that resolves with a dummy instance object
  // This mimics the real loader's async behavior.
  return new Promise((resolve, reject) => {
    console.warn("[Placeholder] Unity instance simulation complete. No actual Unity app is running.");
    // Simulate slight delay
    setTimeout(() => {
      resolve({
        // Provide a dummy Quit function so the cleanup doesn't crash
        Quit: function() {
          console.log("[Placeholder] Dummy Unity Instance Quit() called.");
          // Return a resolved promise to mimic the real Quit()
          return Promise.resolve();
        },
        // Add a dummy SendMessage if your React code might call it
        SendMessage: function(gameObjectName, methodName, value) {
          console.log(`[Placeholder] SendMessage called: ${gameObjectName}.${methodName}(${value === undefined ? '' : JSON.stringify(value)})`);
        }
        // Add other dummy methods here if needed
      });
    }, 100); // Simulate async creation
  });
}

// Optional: Make it global explicitly if needed, though GalleryScreen checks directly
// window.createUnityInstance = createUnityInstance;