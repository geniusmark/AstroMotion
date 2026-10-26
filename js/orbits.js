/**
 * AstroMotion - Orbital Mechanics & Astronomical Calculations
 * Handles Keplerian motions, axial tilts, seasons, lunar phases, nodal precession, and eclipses.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.AstroOrbits = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {

  // Astronomical Constants
  const CONSTANTS = {
    EARTH_YEAR_DAYS: 365.25636,    // Sidereal year (days)
    EARTH_DAY_HOURS: 24.0,          // Solar day (hours)
    MOON_SIDEREAL_DAYS: 27.32166,   // Moon sidereal orbit (days)
    MOON_SYNODIC_DAYS: 29.53059,    // Moon phase cycle (days)
    EARTH_AXIAL_TILT_DEG: 23.43928, // Earth obliquity (degrees)
    EARTH_AXIAL_TILT_RAD: 23.43928 * (Math.PI / 180),
    MOON_ORBIT_INCLINATION_DEG: 5.145, // Moon orbit inclination to ecliptic
    MOON_ORBIT_INCLINATION_RAD: 5.145 * (Math.PI / 180),
    SUN_ROTATION_DAYS: 25.38        // Sun sidereal differential rotation (equator)
  };

  // Preset Configurations for Scaling Modes
  const SCALE_MODES = {
    // Mode 1: Didactic / Visual (ideal for observing all mechanics together)
    didactic: {
      name: "Visual / Didactic",
      description: "Optimized proportions to clearly see orbits, tilts, phases, and eclipses simultaneously.",
      sunRadius: 9.0,
      earthSunDist: 60.0,
      earthRadius: 2.2,
      moonEarthDist: 7.5,
      moonRadius: 0.65,
      cloudRadius: 2.235,
      atmosphereRadius: 2.32
    },
    // Mode 2: Earth-Moon Focus (for studying lunar phases, tidal lock, day/night)
    earthMoonFocus: {
      name: "Earth-Moon Focus",
      description: "Magnified view of the Earth-Moon sub-system with distant solar illumination.",
      sunRadius: 18.0,
      earthSunDist: 150.0,
      earthRadius: 4.5,
      moonEarthDist: 15.0,
      moonRadius: 1.25,
      cloudRadius: 4.56,
      atmosphereRadius: 4.75
    },
    // Mode 3: Relative Proportions (shows realistic comparative sizes)
    proportional: {
      name: "Proportional Comparison",
      description: "Compressed astronomical distances highlighting body size ratios.",
      sunRadius: 16.0,
      earthSunDist: 90.0,
      earthRadius: 1.5,
      moonEarthDist: 5.8,
      moonRadius: 0.41,
      cloudRadius: 1.52,
      atmosphereRadius: 1.58
    }
  };

  // State tracking
  let currentSimDays = 80.0; // Starts around Spring Equinox (March 20 ~ Day 79)
  let timeScale = 1.0;       // Simulation days per real second
  let isPaused = false;
  let activeScale = SCALE_MODES.didactic;

  function advanceTime(deltaSeconds) {
    if (!isPaused) {
      currentSimDays += deltaSeconds * timeScale;
    }
    return currentSimDays;
  }

  function setSimDays(days) {
    currentSimDays = days;
  }

  function getSimDays() {
    return currentSimDays;
  }

  function setTimeScale(scale) {
    timeScale = scale;
  }

  function getTimeScale() {
    return timeScale;
  }

  function setPaused(paused) {
    isPaused = paused;
  }

  function togglePaused() {
    isPaused = !isPaused;
    return isPaused;
  }

  function getScale() {
    return activeScale;
  }

  function setScaleMode(modeKey) {
    if (SCALE_MODES[modeKey]) {
      activeScale = SCALE_MODES[modeKey];
      return activeScale;
    }
    return null;
  }

  function getEarthHeliocentricPosition(days = currentSimDays, config = activeScale) {
    const orbitalAngle = (days - 79.25) * (2 * Math.PI / CONSTANTS.EARTH_YEAR_DAYS);
    const r = config.earthSunDist;
    const e = 0.0167; // Earth orbit eccentricity
    const dist = r * (1 - e * Math.cos(orbitalAngle));

    const x = dist * Math.sin(orbitalAngle);
    const y = 0; // In ecliptic plane
    const z = -dist * Math.cos(orbitalAngle);

    return { x, y, z, orbitalAngle, dist };
  }

  function getMoonGeocentricPosition(days = currentSimDays, config = activeScale) {
    const moonAngle = (days * (2 * Math.PI / CONSTANTS.MOON_SIDEREAL_DAYS));
    const nodePrecessionAngle = -(days / 6793.0) * 2 * Math.PI;

    const r = config.moonEarthDist;
    const inc = CONSTANTS.MOON_ORBIT_INCLINATION_RAD;

    const uX = r * Math.cos(moonAngle);
    const uZ = r * Math.sin(moonAngle);

    const cosNode = Math.cos(nodePrecessionAngle);
    const sinNode = Math.sin(nodePrecessionAngle);
    const cosInc = Math.cos(inc);
    const sinInc = Math.sin(inc);

    const rx = uX;
    const ry = uZ * sinInc;
    const rz = uZ * cosInc;

    const x = rx * cosNode - rz * sinNode;
    const y = ry;
    const z = rx * sinNode + rz * cosNode;

    return { x, y, z, moonAngle, nodeAngle: nodePrecessionAngle, dist: r };
  }

  function getMoonPhase(days = currentSimDays, config = activeScale) {
    const earthPos = getEarthHeliocentricPosition(days, config);
    const moonRelPos = getMoonGeocentricPosition(days, config);

    const esX = -earthPos.x;
    const esZ = -earthPos.z;
    const esLen = Math.sqrt(esX * esX + esZ * esZ) || 1.0;
    const uesX = esX / esLen;
    const uesZ = esZ / esLen;

    const emX = moonRelPos.x;
    const emZ = moonRelPos.z;
    const emLen = Math.sqrt(emX * emX + emZ * emZ) || 1.0;
    const uemX = emX / emLen;
    const uemZ = emZ / emLen;

    const dot = uesX * uemX + uesZ * uemZ;
    const crossY = uesZ * uemX - uesX * uemZ;

    let elongationRad = Math.atan2(crossY, dot);
    if (elongationRad < 0) elongationRad += 2 * Math.PI;

    const elongationDeg = elongationRad * (180 / Math.PI);
    const illumination = (1 - Math.cos(elongationRad)) / 2;

    let phaseName = "";
    let phaseCode = "";
    if (elongationDeg >= 355 || elongationDeg < 5) {
      phaseName = "New Moon";
      phaseCode = "new";
    } else if (elongationDeg >= 5 && elongationDeg < 85) {
      phaseName = "Waxing Crescent";
      phaseCode = "waxing_crescent";
    } else if (elongationDeg >= 85 && elongationDeg < 95) {
      phaseName = "First Quarter";
      phaseCode = "first_quarter";
    } else if (elongationDeg >= 95 && elongationDeg < 175) {
      phaseName = "Waxing Gibbous";
      phaseCode = "waxing_gibbous";
    } else if (elongationDeg >= 175 && elongationDeg < 185) {
      phaseName = "Full Moon";
      phaseCode = "full";
    } else if (elongationDeg >= 185 && elongationDeg < 265) {
      phaseName = "Waning Gibbous";
      phaseCode = "waning_gibbous";
    } else if (elongationDeg >= 265 && elongationDeg < 275) {
      phaseName = "Third Quarter";
      phaseCode = "third_quarter";
    } else {
      phaseName = "Waning Crescent";
      phaseCode = "waning_crescent";
    }

    const moonDistFromEcliptic = Math.abs(moonRelPos.y);
    const eclipseThreshold = config.earthRadius * 0.45;

    let eclipse = null;
    if (dot > 0.985 && moonDistFromEcliptic < eclipseThreshold) {
      eclipse = {
        type: "solar",
        name: "Solar Eclipse",
        description: "The Moon passes directly between the Sun and Earth, casting its shadow upon the Earth!",
        intensity: Math.max(0.1, 1.0 - (moonDistFromEcliptic / eclipseThreshold))
      };
    } else if (dot < -0.985 && moonDistFromEcliptic < eclipseThreshold) {
      eclipse = {
        type: "lunar",
        name: "Lunar Eclipse (Blood Moon)",
        description: "The Earth passes directly between the Sun and Moon, casting Earth's reddish umbra on the Moon!",
        intensity: Math.max(0.1, 1.0 - (moonDistFromEcliptic / eclipseThreshold))
      };
    }

    return {
      phaseName,
      phaseCode,
      elongationDeg,
      illuminationPercent: Math.round(illumination * 100),
      illumination,
      eclipse
    };
  }

  function getSeasonInfo(days = currentSimDays) {
    const dayInYear = ((days % CONSTANTS.EARTH_YEAR_DAYS) + CONSTANTS.EARTH_YEAR_DAYS) % CONSTANTS.EARTH_YEAR_DAYS;
    const earthPos = getEarthHeliocentricPosition(days, activeScale);
    const tiltSin = Math.sin(CONSTANTS.EARTH_AXIAL_TILT_RAD);

    const toSunX = -earthPos.x / (earthPos.dist || 1.0);
    const subsolarLatRad = Math.asin(Math.max(-1.0, Math.min(1.0, tiltSin * toSunX)));
    const subsolarLatDeg = subsolarLatRad * (180 / Math.PI);

    let seasonNorth = "";
    let seasonSouth = "";
    let closestEvent = "";

    if (dayInYear >= 79 && dayInYear < 172) {
      seasonNorth = "Spring";
      seasonSouth = "Autumn";
    } else if (dayInYear >= 172 && dayInYear < 265) {
      seasonNorth = "Summer";
      seasonSouth = "Winter";
    } else if (dayInYear >= 265 && dayInYear < 355) {
      seasonNorth = "Autumn";
      seasonSouth = "Spring";
    } else {
      seasonNorth = "Winter";
      seasonSouth = "Summer";
    }

    if (Math.abs(dayInYear - 79) < 2) {
      closestEvent = "Vernal Equinox (Equal Day & Night)";
    } else if (Math.abs(dayInYear - 172) < 2) {
      closestEvent = "Summer Solstice (Longest Day in North)";
    } else if (Math.abs(dayInYear - 265) < 2) {
      closestEvent = "Autumnal Equinox (Equal Day & Night)";
    } else if (Math.abs(dayInYear - 355) < 2 || dayInYear < 2) {
      closestEvent = "Winter Solstice (Shortest Day in North)";
    }

    const baseDate = new Date(Date.UTC(2026, 0, 1));
    const currentDate = new Date(baseDate.getTime() + days * 86400000);
    const dateString = currentDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });

    return {
      dayInYear: Math.floor(dayInYear),
      dateString,
      seasonNorth,
      seasonSouth,
      subsolarLatDeg: subsolarLatDeg.toFixed(1),
      closestEvent
    };
  }

  function getEventDay(eventName) {
    switch (eventName) {
      case "vernal_equinox": return 79.25;
      case "summer_solstice": return 172.5;
      case "autumn_equinox": return 265.5;
      case "winter_solstice": return 355.5;
      case "solar_eclipse": {
        let testDay = Math.floor(currentSimDays);
        for (let i = 0; i < 400; i++) {
          const ph = getMoonPhase(testDay);
          if (ph.eclipse && ph.eclipse.type === "solar") return testDay;
          testDay += 0.2;
        }
        return 83.4;
      }
      case "lunar_eclipse": {
        let testDay = Math.floor(currentSimDays);
        for (let i = 0; i < 400; i++) {
          const ph = getMoonPhase(testDay);
          if (ph.eclipse && ph.eclipse.type === "lunar") return testDay;
          testDay += 0.2;
        }
        return 98.1;
      }
      default: return 79.25;
    }
  }

  return {
    CONSTANTS,
    SCALE_MODES,
    advanceTime,
    setSimDays,
    getSimDays,
    setTimeScale,
    getTimeScale,
    setPaused,
    togglePaused,
    getScale,
    setScaleMode,
    getEarthHeliocentricPosition,
    getMoonGeocentricPosition,
    getMoonPhase,
    getSeasonInfo,
    getEventDay
  };
});
