/**
 * AstroMotion - Three.js Astronomical Visualization
 * Main Entry Point: WebGL Scene setup, render loop, time stepping, and event handling.
 */

(function () {
  let scene, camera, renderer, controls;
  let lastTimestamp = performance.now();

  function showError(msg) {
    const loader = document.getElementById('loading-overlay');
    if (loader) {
      loader.innerHTML = `
        <div style="max-width: 480px; padding: 24px; background: rgba(30, 10, 20, 0.9); border: 1px solid #ff3366; border-radius: 12px; color: #fff; text-align: center; font-family: sans-serif;">
          <h2 style="color: #ff3366; margin-bottom: 12px;">Notice</h2>
          <p style="margin-bottom: 16px; line-height: 1.5; color: #f0c0c8;">${msg}</p>
          <button onclick="location.reload()" style="background: #ff3366; color: #fff; border: none; padding: 8px 18px; border-radius: 6px; cursor: pointer; font-weight: 600;">Retry</button>
        </div>
      `;
    }
  }

  function checkDependencies(callback, retries = 30) {
    if (typeof THREE !== 'undefined' && typeof THREE.OrbitControls !== 'undefined') {
      callback();
    } else if (retries > 0) {
      setTimeout(() => checkDependencies(callback, retries - 1), 100);
    } else {
      showError("Three.js or OrbitControls could not be loaded from CDN. If you are offline, please connect to the internet or start the local server with <code>python serve.py</code>.");
    }
  }

  function init() {
    try {
      const container = document.getElementById('canvas-container');
      if (!container) return;

      // 1. Scene
      scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x020308, 0.0008);

      // 2. Camera
      const aspect = window.innerWidth / window.innerHeight;
      camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 2000);
      camera.position.set(0, 75, 110);

      // 3. Renderer
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance"
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.1;

      container.appendChild(renderer.domElement);

      // 4. OrbitControls
      controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.minDistance = 3.0;
      controls.maxDistance = 500;
      controls.maxPolarAngle = Math.PI - 0.01;

      // 5. Initialize Celestial 3D Objects & Shaders
      window.AstroCelestial.init(scene);

      // 6. Initialize UI & HUD Controller
      window.AstroUI.init(camera, controls);

      // 7. Event Listeners
      window.addEventListener('resize', onWindowResize);

      // 8. Remove loading overlay immediately
      const loader = document.getElementById('loading-overlay');
      if (loader) {
        loader.classList.add('fade-out');
        setTimeout(() => loader.remove(), 400);
      }

      // 9. Start Animation Loop
      requestAnimationFrame(animate);
    } catch (err) {
      console.error("AstroMotion Initialization Error:", err);
      showError("An error occurred during initialization: " + err.message);
    }
  }

  function onWindowResize() {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  function animate(timestamp) {
    requestAnimationFrame(animate);

    const deltaSeconds = Math.min((timestamp - lastTimestamp) / 1000, 0.1);
    lastTimestamp = timestamp;

    const simDays = window.AstroOrbits.advanceTime(deltaSeconds);

    window.AstroCelestial.update(simDays);
    window.AstroUI.updateCamera(simDays);
    window.AstroUI.updateHUD(simDays);

    renderer.render(scene, camera);
  }

  // Check dependencies before running
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => checkDependencies(init));
  } else {
    checkDependencies(init);
  }
})();
