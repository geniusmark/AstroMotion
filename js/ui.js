/**
 * AstroMotion - UI Controls, HUD, Camera Director, and Astronomical Tour
 * Handles user interactions, camera lerping, real-time lunar phase canvas, and responsive observatory HUD.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.AstroUI = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  let camera = null;
  let controls = null;

  function getOrbits() { return window.AstroOrbits; }
  function getCelestial() { return window.AstroCelestial; }
  function getAudio() { return window.AstroAudio; }

  const CAMERA_MODES = {
    OVERVIEW: 'overview',
    EARTH_TRACK: 'earth_track',
    MOON_PHASE: 'moon_phase',
    EARTHRISE: 'earthrise',
    SUN_PERSPECTIVE: 'sun_perspective',
    TOP_DOWN: 'top_down'
  };

  let activeCameraMode = CAMERA_MODES.OVERVIEW;
  let targetCamPos = new THREE.Vector3(0, 75, 110);
  let targetCamLookAt = new THREE.Vector3(0, 0, 0);
  let isTransitioning = false;

  let dom = {};

  function init(threeCamera, orbitControls) {
    camera = threeCamera;
    controls = orbitControls;

    cacheDOMElements();
    setupEventListeners();
    setupKeyboardShortcuts();
    updateControlsUI();
  }

  function cacheDOMElements() {
    dom = {
      dateDisplay: document.getElementById('hud-date'),
      dayCountDisplay: document.getElementById('hud-day-count'),
      seasonNorthDisplay: document.getElementById('hud-season-north'),
      seasonSouthDisplay: document.getElementById('hud-season-south'),
      subsolarLatDisplay: document.getElementById('hud-subsolar-lat'),
      moonPhaseNameDisplay: document.getElementById('hud-phase-name'),
      moonIllumDisplay: document.getElementById('hud-phase-illum'),
      moonCanvas: document.getElementById('moon-phase-canvas'),
      eclipseBanner: document.getElementById('eclipse-banner'),
      eclipseText: document.getElementById('eclipse-text'),

      playPauseBtn: document.getElementById('btn-play-pause'),
      playIcon: document.getElementById('play-icon'),
      pauseIcon: document.getElementById('pause-icon'),
      timeSpeedSlider: document.getElementById('time-speed-slider'),
      speedValueText: document.getElementById('speed-value-text'),
      btnStepBack: document.getElementById('btn-step-back'),
      btnStepForward: document.getElementById('btn-step-forward'),
      btnReverse: document.getElementById('btn-reverse'),
      btnResetTime: document.getElementById('btn-reset-time'),

      btnSpringEquinox: document.getElementById('jump-spring'),
      btnSummerSolstice: document.getElementById('jump-summer'),
      btnAutumnEquinox: document.getElementById('jump-autumn'),
      btnWinterSolstice: document.getElementById('jump-winter'),
      btnSolarEclipse: document.getElementById('jump-solar-eclipse'),
      btnLunarEclipse: document.getElementById('jump-lunar-eclipse'),

      scaleSelect: document.getElementById('scale-select'),
      cameraButtons: document.querySelectorAll('.cam-preset-btn'),

      chkOrbits: document.getElementById('chk-orbits'),
      chkAxes: document.getElementById('chk-axes'),
      chkLatitudes: document.getElementById('chk-latitudes'),
      chkPlanes: document.getElementById('chk-planes'),
      chkShadows: document.getElementById('chk-shadows'),
      chkStars: document.getElementById('chk-stars'),

      btnAudioToggle: document.getElementById('btn-audio-toggle'),
      audioVolSlider: document.getElementById('audio-vol-slider'),

      btnOpenGuide: document.getElementById('btn-open-guide'),
      btnCloseGuide: document.getElementById('btn-close-guide'),
      guideModal: document.getElementById('guide-modal')
    };
  }

  function setupEventListeners() {
    const AstroOrbits = getOrbits();
    const CelestialObjects = getCelestial();
    const CosmicAudio = getAudio();

    if (dom.playPauseBtn) {
      dom.playPauseBtn.addEventListener('click', () => {
        const paused = AstroOrbits.togglePaused();
        updatePlayPauseButton(paused);
      });
    }

    if (dom.timeSpeedSlider) {
      dom.timeSpeedSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        AstroOrbits.setTimeScale(val);
        if (dom.speedValueText) dom.speedValueText.textContent = `${val.toFixed(1)} days/s`;
      });
    }

    if (dom.btnStepBack) {
      dom.btnStepBack.addEventListener('click', () => {
        AstroOrbits.setSimDays(AstroOrbits.getSimDays() - 1.0);
      });
    }
    if (dom.btnStepForward) {
      dom.btnStepForward.addEventListener('click', () => {
        AstroOrbits.setSimDays(AstroOrbits.getSimDays() + 1.0);
      });
    }

    if (dom.btnReverse) {
      dom.btnReverse.addEventListener('click', () => {
        const curScale = AstroOrbits.getTimeScale();
        AstroOrbits.setTimeScale(-curScale);
        if (dom.timeSpeedSlider) dom.timeSpeedSlider.value = -curScale;
        if (dom.speedValueText) dom.speedValueText.textContent = `${(-curScale).toFixed(1)} days/s`;
      });
    }

    if (dom.btnResetTime) {
      dom.btnResetTime.addEventListener('click', () => {
        AstroOrbits.setSimDays(79.25);
      });
    }

    const jumps = [
      { btn: dom.btnSpringEquinox, evt: 'vernal_equinox' },
      { btn: dom.btnSummerSolstice, evt: 'summer_solstice' },
      { btn: dom.btnAutumnEquinox, evt: 'autumn_equinox' },
      { btn: dom.btnWinterSolstice, evt: 'winter_solstice' },
      { btn: dom.btnSolarEclipse, evt: 'solar_eclipse' },
      { btn: dom.btnLunarEclipse, evt: 'lunar_eclipse' }
    ];

    jumps.forEach(({ btn, evt }) => {
      if (btn) {
        btn.addEventListener('click', () => {
          const targetDay = AstroOrbits.getEventDay(evt);
          AstroOrbits.setSimDays(targetDay);
          if (evt === 'solar_eclipse') setCameraMode(CAMERA_MODES.EARTH_TRACK);
          if (evt === 'lunar_eclipse') setCameraMode(CAMERA_MODES.EARTH_TRACK);
        });
      }
    });

    if (dom.scaleSelect) {
      dom.scaleSelect.addEventListener('change', (e) => {
        AstroOrbits.setScaleMode(e.target.value);
        setCameraMode(CAMERA_MODES.OVERVIEW);
      });
    }

    dom.cameraButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.getAttribute('data-mode');
        setCameraMode(mode);
      });
    });

    const aidToggles = [
      { chk: dom.chkOrbits, name: 'orbits' },
      { chk: dom.chkAxes, name: 'axes' },
      { chk: dom.chkLatitudes, name: 'latitudes' },
      { chk: dom.chkPlanes, name: 'planes' },
      { chk: dom.chkShadows, name: 'shadows' },
      { chk: dom.chkStars, name: 'stars' }
    ];

    aidToggles.forEach(({ chk, name }) => {
      if (chk) {
        chk.addEventListener('change', (e) => {
          CelestialObjects.toggleAid(name, e.target.checked);
        });
      }
    });

    if (dom.btnAudioToggle) {
      dom.btnAudioToggle.addEventListener('click', () => {
        const playing = CosmicAudio.toggle();
        dom.btnAudioToggle.classList.toggle('active', playing);
        dom.btnAudioToggle.setAttribute('aria-pressed', playing);
      });
    }
    if (dom.audioVolSlider) {
      dom.audioVolSlider.addEventListener('input', (e) => {
        CosmicAudio.setVolume(parseFloat(e.target.value));
      });
    }

    if (dom.btnOpenGuide && dom.guideModal) {
      dom.btnOpenGuide.addEventListener('click', () => {
        dom.guideModal.classList.remove('hidden');
      });
    }
    if (dom.btnCloseGuide && dom.guideModal) {
      dom.btnCloseGuide.addEventListener('click', () => {
        dom.guideModal.classList.add('hidden');
      });
    }
    if (dom.guideModal) {
      dom.guideModal.addEventListener('click', (e) => {
        if (e.target === dom.guideModal) {
          dom.guideModal.classList.add('hidden');
        }
      });
    }

    const guideTabs = document.querySelectorAll('.guide-tab-btn');
    const guideContents = document.querySelectorAll('.guide-topic-content');
    guideTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const topic = tab.getAttribute('data-topic');
        guideTabs.forEach(t => t.classList.remove('active'));
        guideContents.forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        const activeTopic = document.getElementById(`topic-${topic}`);
        if (activeTopic) activeTopic.classList.add('active');
      });
    });
  }

  function setupKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
      const AstroOrbits = getOrbits();

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          const paused = AstroOrbits.togglePaused();
          updatePlayPauseButton(paused);
          break;
        case 'Digit1':
          setCameraMode(CAMERA_MODES.OVERVIEW);
          break;
        case 'Digit2':
          setCameraMode(CAMERA_MODES.EARTH_TRACK);
          break;
        case 'Digit3':
          setCameraMode(CAMERA_MODES.MOON_PHASE);
          break;
        case 'Digit4':
          setCameraMode(CAMERA_MODES.EARTHRISE);
          break;
        case 'Digit5':
          setCameraMode(CAMERA_MODES.SUN_PERSPECTIVE);
          break;
        case 'Digit6':
          setCameraMode(CAMERA_MODES.TOP_DOWN);
          break;
        case 'ArrowRight':
          AstroOrbits.setSimDays(AstroOrbits.getSimDays() + 1.0);
          break;
        case 'ArrowLeft':
          AstroOrbits.setSimDays(AstroOrbits.getSimDays() - 1.0);
          break;
        case 'KeyM':
          if (dom.btnAudioToggle) dom.btnAudioToggle.click();
          break;
        case 'KeyH':
          toggleHUD();
          break;
      }
    });
  }

  function updatePlayPauseButton(isPaused) {
    if (!dom.playIcon || !dom.pauseIcon) return;
    if (isPaused) {
      dom.playIcon.classList.remove('hidden');
      dom.pauseIcon.classList.add('hidden');
    } else {
      dom.playIcon.classList.add('hidden');
      dom.pauseIcon.classList.remove('hidden');
    }
  }

  function updateControlsUI() {
    const AstroOrbits = getOrbits();
    if (!AstroOrbits) return;
    if (dom.timeSpeedSlider) dom.timeSpeedSlider.value = AstroOrbits.getTimeScale();
    if (dom.speedValueText) dom.speedValueText.textContent = `${AstroOrbits.getTimeScale().toFixed(1)} days/s`;
  }

  function toggleHUD() {
    const panels = document.querySelectorAll('.observatory-panel');
    panels.forEach(p => p.classList.toggle('minimized'));
  }

  function setCameraMode(mode) {
    activeCameraMode = mode;
    isTransitioning = true;

    dom.cameraButtons.forEach(btn => {
      if (btn.getAttribute('data-mode') === mode) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    const AstroOrbits = getOrbits();
    const scale = AstroOrbits.getScale();
    const simDays = AstroOrbits.getSimDays();
    const earthPos = AstroOrbits.getEarthHeliocentricPosition(simDays, scale);
    const moonRel = AstroOrbits.getMoonGeocentricPosition(simDays, scale);

    switch (mode) {
      case CAMERA_MODES.OVERVIEW:
        targetCamPos.set(0, scale.earthSunDist * 0.9, scale.earthSunDist * 1.35);
        targetCamLookAt.set(0, 0, 0);
        break;
      case CAMERA_MODES.EARTH_TRACK:
        targetCamPos.set(earthPos.x, earthPos.y + scale.earthRadius * 4.5, earthPos.z + scale.earthRadius * 8.5);
        targetCamLookAt.set(earthPos.x, earthPos.y, earthPos.z);
        break;
      case CAMERA_MODES.MOON_PHASE:
        targetCamPos.set(earthPos.x - moonRel.x * 0.35, earthPos.y + scale.earthRadius * 1.2, earthPos.z - moonRel.z * 0.35);
        targetCamLookAt.set(earthPos.x + moonRel.x, earthPos.y + moonRel.y, earthPos.z + moonRel.z);
        break;
      case CAMERA_MODES.EARTHRISE:
        targetCamPos.set(earthPos.x + moonRel.x * 1.05, earthPos.y + moonRel.y * 1.05, earthPos.z + moonRel.z * 1.05);
        targetCamLookAt.set(earthPos.x, earthPos.y, earthPos.z);
        break;
      case CAMERA_MODES.SUN_PERSPECTIVE:
        targetCamPos.set(0, scale.sunRadius * 1.5, 0);
        targetCamLookAt.set(earthPos.x, earthPos.y, earthPos.z);
        break;
      case CAMERA_MODES.TOP_DOWN:
        targetCamPos.set(0, scale.earthSunDist * 2.2, 0.1);
        targetCamLookAt.set(0, 0, 0);
        break;
    }
  }

  function updateCamera(simDays) {
    const AstroOrbits = getOrbits();
    const scale = AstroOrbits.getScale();
    const earthPos = AstroOrbits.getEarthHeliocentricPosition(simDays, scale);
    const moonRel = AstroOrbits.getMoonGeocentricPosition(simDays, scale);

    if (activeCameraMode === CAMERA_MODES.EARTH_TRACK) {
      const offset = new THREE.Vector3(0, scale.earthRadius * 3.8, scale.moonEarthDist * 1.6);
      targetCamPos.copy(earthPos).add(offset);
      targetCamLookAt.set(earthPos.x, earthPos.y, earthPos.z);
    } else if (activeCameraMode === CAMERA_MODES.MOON_PHASE) {
      targetCamPos.set(earthPos.x - moonRel.x * 0.25, earthPos.y + scale.earthRadius * 0.8, earthPos.z - moonRel.z * 0.25);
      targetCamLookAt.set(earthPos.x + moonRel.x, earthPos.y + moonRel.y, earthPos.z + moonRel.z);
    } else if (activeCameraMode === CAMERA_MODES.EARTHRISE) {
      targetCamPos.set(earthPos.x + moonRel.x * 1.08, earthPos.y + moonRel.y * 1.08, earthPos.z + moonRel.z * 1.08);
      targetCamLookAt.set(earthPos.x, earthPos.y, earthPos.z);
    } else if (activeCameraMode === CAMERA_MODES.SUN_PERSPECTIVE) {
      targetCamLookAt.set(earthPos.x, earthPos.y, earthPos.z);
    }

    if (isTransitioning) {
      camera.position.lerp(targetCamPos, 0.06);
      controls.target.lerp(targetCamLookAt, 0.06);

      if (camera.position.distanceTo(targetCamPos) < 0.2 && controls.target.distanceTo(targetCamLookAt) < 0.2) {
        isTransitioning = false;
      }
    } else if (activeCameraMode === CAMERA_MODES.EARTH_TRACK) {
      controls.target.copy(earthPos);
    }

    controls.update();
  }

  function updateHUD(simDays) {
    const AstroOrbits = getOrbits();
    const season = AstroOrbits.getSeasonInfo(simDays);
    const moonPhase = AstroOrbits.getMoonPhase(simDays);

    if (dom.dateDisplay) dom.dateDisplay.textContent = season.dateString;
    if (dom.dayCountDisplay) dom.dayCountDisplay.textContent = `Day ${season.dayInYear} of 365`;
    if (dom.seasonNorthDisplay) dom.seasonNorthDisplay.textContent = season.seasonNorth;
    if (dom.seasonSouthDisplay) dom.seasonSouthDisplay.textContent = season.seasonSouth;
    if (dom.subsolarLatDisplay) dom.subsolarLatDisplay.textContent = `${season.subsolarLatDeg}°`;

    if (dom.moonPhaseNameDisplay) dom.moonPhaseNameDisplay.textContent = moonPhase.phaseName;
    if (dom.moonIllumDisplay) dom.moonIllumDisplay.textContent = `${moonPhase.illuminationPercent}%`;

    renderMoonPhaseCanvas(moonPhase.elongationDeg, moonPhase.illumination);

    if (dom.eclipseBanner) {
      if (moonPhase.eclipse) {
        dom.eclipseBanner.classList.remove('hidden');
        if (dom.eclipseText) {
          dom.eclipseText.textContent = `${moonPhase.eclipse.name.toUpperCase()}! ${moonPhase.eclipse.description}`;
        }
      } else {
        dom.eclipseBanner.classList.add('hidden');
      }
    }
  }

  function renderMoonPhaseCanvas(elongationDeg, illumination) {
    if (!dom.moonCanvas) return;
    const ctx = dom.moonCanvas.getContext('2d');
    const w = dom.moonCanvas.width;
    const h = dom.moonCanvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const r = (w / 2) - 3;

    ctx.clearRect(0, 0, w, h);

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = '#171921';
    ctx.fill();

    const rad = elongationDeg * (Math.PI / 180);
    const isWaxing = elongationDeg <= 180;

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();

    ctx.fillStyle = '#e8ecf4';

    if (isWaxing) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, -Math.PI / 2, Math.PI / 2, false);
      const termScale = Math.cos(rad);
      ctx.ellipse(cx, cy, Math.abs(termScale) * r, r, 0, Math.PI / 2, -Math.PI / 2, termScale < 0);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(cx, cy, r, Math.PI / 2, -Math.PI / 2, false);
      const termScale = Math.cos(rad);
      ctx.ellipse(cx, cy, Math.abs(termScale) * r, r, 0, -Math.PI / 2, Math.PI / 2, termScale < 0);
      ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();
  }

  return {
    init,
    updateCamera,
    updateHUD,
    CAMERA_MODES
  };
});
