/* AstroMotion - Consolidated Application Bundle */

/* --- START: textures.js --- */
/**
 * AstroMotion - Ultra-Fast High-Performance Procedural Texture Generator
 * Generates Earth, Night Lights, Clouds, Moon, and Sun textures using hardware-accelerated Canvas2D.
 * Completes in ~35ms without freezing the browser thread!
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.AstroTextures = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {

  /**
   * Generates Earth Daytime Texture (Oceans, Continents, Deserts, Ice Caps, Mountain Ranges)
   * High performance Canvas 2D rasterization (~15ms)
   */
  function createEarthDayTexture(width = 1024, height = 512) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // 1. Deep Oceanic Base Gradient
    const oceanGrad = ctx.createLinearGradient(0, 0, 0, height);
    oceanGrad.addColorStop(0.0, '#102e52'); // Arctic ocean
    oceanGrad.addColorStop(0.2, '#0c2445');
    oceanGrad.addColorStop(0.5, '#071b35'); // Deep equatorial ocean
    oceanGrad.addColorStop(0.8, '#0c2445');
    oceanGrad.addColorStop(1.0, '#163864'); // Antarctic ocean
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, width, height);

    // Helper to convert longitude (-180 to 180) and latitude (-90 to 90) to canvas (x, y)
    function geo(lon, lat) {
      const x = ((lon + 180) / 360) * width;
      const y = ((90 - lat) / 180) * height;
      return [x, y];
    }

    // Helper to draw continent polygon with optional shelf/coastal buffer
    function drawLandmass(points, fillColor, coastalColor = null) {
      if (coastalColor) {
        ctx.save();
        ctx.beginPath();
        const [x0, y0] = geo(points[0][0], points[0][1]);
        ctx.moveTo(x0, y0);
        for (let i = 1; i < points.length; i++) {
          const [px, py] = geo(points[i][0], points[i][1]);
          ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fillStyle = coastalColor;
        ctx.lineWidth = 14;
        ctx.strokeStyle = coastalColor;
        ctx.lineJoin = 'round';
        ctx.stroke();
        ctx.fill();
        ctx.restore();
      }

      ctx.save();
      ctx.beginPath();
      const [x0, y0] = geo(points[0][0], points[0][1]);
      ctx.moveTo(x0, y0);
      for (let i = 1; i < points.length; i++) {
        const [px, py] = geo(points[i][0], points[i][1]);
        ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fillStyle = fillColor;
      ctx.fill();
      ctx.restore();
    }

    // 2. Continental Landmasses with Shallow Shelf Glow
    const shelfColor = '#1f6587';
    const landBase = '#3a6639'; // Temperate green

    // Eurasia
    drawLandmass([
      [-10, 36], [0, 42], [10, 46], [28, 41], [36, 36], [42, 30], [55, 25],
      [68, 22], [78, 10], [86, 20], [98, 12], [104, 1], [115, 6], [122, 24],
      [122, 38], [130, 42], [142, 54], [168, 62], [178, 66], [170, 71],
      [140, 74], [100, 76], [70, 73], [50, 68], [30, 70], [18, 70],
      [5, 62], [-5, 58], [-9, 44], [-9, 38]
    ], landBase, shelfColor);

    // Africa
    drawLandmass([
      [-17, 15], [-17, 30], [-5, 36], [10, 37], [32, 31], [43, 12],
      [51, 12], [42, -5], [38, -18], [28, -33], [18, -35], [14, -28],
      [12, -15], [9, 4], [3, 6], [-10, 6], [-15, 11]
    ], '#466c3c', shelfColor);

    // North America
    drawLandmass([
      [-168, 65], [-160, 58], [-140, 60], [-125, 50], [-124, 38], [-117, 32],
      [-105, 22], [-97, 26], [-97, 18], [-80, 25], [-81, 32], [-70, 42],
      [-64, 45], [-60, 50], [-64, 60], [-80, 63], [-95, 70], [-120, 72],
      [-140, 70], [-162, 70]
    ], landBase, shelfColor);

    // South America
    drawLandmass([
      [-77, 8], [-74, 11], [-60, 10], [-50, -1], [-35, -5], [-35, -10],
      [-38, -20], [-48, -28], [-58, -38], [-66, -55], [-74, -52], [-74, -42],
      [-72, -30], [-70, -18], [-80, -5], [-80, 4]
    ], '#28582d', shelfColor);

    // Australia
    drawLandmass([
      [114, -22], [115, -34], [128, -32], [138, -35], [148, -38], [152, -28],
      [145, -15], [136, -12], [130, -15], [122, -18]
    ], '#856e42', shelfColor);

    // Greenland
    drawLandmass([
      [-50, 60], [-42, 60], [-25, 70], [-20, 78], [-30, 83], [-55, 82],
      [-60, 76], [-55, 68]
    ], '#eaf3f8', shelfColor);

    // Major Islands: Britain, Japan, Madagascar
    drawLandmass([[-5, 50], [0, 52], [0, 58], [-5, 58]], landBase);
    drawLandmass([[130, 32], [140, 36], [142, 44], [135, 40]], landBase);
    drawLandmass([[44, -13], [50, -15], [48, -25], [44, -24]], '#386334');

    // 3. Climate Zones & Topography Gradients
    // Sahara & Arabian Desert
    const desertGrad = ctx.createRadialGradient(
      geo(20, 24)[0], geo(20, 24)[1], 15,
      geo(20, 24)[0], geo(20, 24)[1], 160
    );
    desertGrad.addColorStop(0.0, '#c7a763');
    desertGrad.addColorStop(0.5, '#ab8d4e');
    desertGrad.addColorStop(1.0, 'transparent');
    ctx.fillStyle = desertGrad;
    ctx.beginPath();
    const dPos = geo(-15, 34);
    ctx.rect(dPos[0], dPos[1], width * 0.22, height * 0.18);
    ctx.fill();

    // Central Australian Outback Desert
    const ausGrad = ctx.createRadialGradient(
      geo(134, -25)[0], geo(134, -25)[1], 5,
      geo(134, -25)[0], geo(134, -25)[1], 70
    );
    ausGrad.addColorStop(0.0, '#ba6739');
    ausGrad.addColorStop(0.8, '#94532d');
    ausGrad.addColorStop(1.0, 'transparent');
    ctx.fillStyle = ausGrad;
    ctx.beginPath();
    const ausPos = geo(118, -15);
    ctx.rect(ausPos[0], ausPos[1], width * 0.12, height * 0.15);
    ctx.fill();

    // Amazon & Congo Equatorial Rainforests
    const tropicalGrad = ctx.createRadialGradient(
      geo(-60, -3)[0], geo(-60, -3)[1], 10,
      geo(-60, -3)[1], geo(-60, -3)[1], 80
    );
    tropicalGrad.addColorStop(0.0, '#1c4722');
    tropicalGrad.addColorStop(1.0, 'transparent');
    ctx.fillStyle = tropicalGrad;
    ctx.beginPath();
    const tropPos = geo(-75, 5);
    ctx.rect(tropPos[0], tropPos[1], width * 0.14, height * 0.15);
    ctx.fill();

    // 4. Polar Ice Sheets (Arctic & Antarctica)
    // Antarctica (South Pole)
    const antarcticGrad = ctx.createLinearGradient(0, height * 0.88, 0, height);
    antarcticGrad.addColorStop(0.0, 'rgba(235, 245, 255, 0.0)');
    antarcticGrad.addColorStop(0.3, 'rgba(235, 245, 255, 0.9)');
    antarcticGrad.addColorStop(1.0, '#ffffff');
    ctx.fillStyle = antarcticGrad;
    ctx.fillRect(0, height * 0.88, width, height * 0.12);

    // Arctic Sea Ice (North Pole)
    const arcticGrad = ctx.createLinearGradient(0, 0, 0, height * 0.09);
    arcticGrad.addColorStop(0.0, '#ffffff');
    arcticGrad.addColorStop(0.7, 'rgba(235, 245, 255, 0.85)');
    arcticGrad.addColorStop(1.0, 'rgba(235, 245, 255, 0.0)');
    ctx.fillStyle = arcticGrad;
    ctx.fillRect(0, 0, width, height * 0.09);

    // 5. Mountain Peaks (Himalayas, Andes, Rockies) with subtle snow highlight
    ctx.fillStyle = '#b5a48f';
    const himalayas = geo(85, 30);
    ctx.beginPath();
    ctx.ellipse(himalayas[0], himalayas[1], 35, 8, -0.2, 0, Math.PI * 2);
    ctx.fill();

    const andes = geo(-70, -22);
    ctx.beginPath();
    ctx.ellipse(andes[0], andes[1], 6, 45, 0.1, 0, Math.PI * 2);
    ctx.fill();

    return canvas;
  }

  /**
   * Generates Earth Night City Lights Texture (~5ms)
   */
  function createEarthNightTexture(width = 1024, height = 512) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Pitch black space night base
    ctx.fillStyle = '#010205';
    ctx.fillRect(0, 0, width, height);

    function geo(lon, lat) {
      return [((lon + 180) / 360) * width, ((90 - lat) / 180) * height];
    }

    function addCityGlow(lon, lat, radius, intensity = 1.0) {
      const [x, y] = geo(lon, lat);
      const grad = ctx.createRadialGradient(x, y, 0.5, x, y, radius);
      grad.addColorStop(0.0, `rgba(255, 230, 140, ${0.95 * intensity})`);
      grad.addColorStop(0.35, `rgba(255, 175, 50, ${0.65 * intensity})`);
      grad.addColorStop(0.7, `rgba(220, 100, 20, ${0.25 * intensity})`);
      grad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Major Human Megalopolises
    // North America East Coast
    addCityGlow(-74, 40.7, 18, 1.0); // New York
    addCityGlow(-71, 42.3, 12, 0.9); // Boston
    addCityGlow(-77, 38.9, 14, 0.95); // DC
    addCityGlow(-87.6, 41.8, 16, 0.9); // Chicago
    addCityGlow(-118.2, 34.0, 18, 0.95); // Los Angeles
    addCityGlow(-122.4, 37.7, 14, 0.9); // San Francisco

    // Europe Megalopolis Web
    addCityGlow(-0.1, 51.5, 20, 1.0); // London
    addCityGlow(2.3, 48.8, 18, 1.0);  // Paris
    addCityGlow(13.4, 52.5, 15, 0.9); // Berlin
    addCityGlow(4.9, 52.3, 14, 0.9);  // Amsterdam
    addCityGlow(9.2, 45.4, 14, 0.85); // Milan
    addCityGlow(37.6, 55.7, 16, 0.9); // Moscow

    // East Asia
    addCityGlow(139.7, 35.6, 24, 1.0); // Tokyo
    addCityGlow(121.5, 31.2, 22, 1.0); // Shanghai
    addCityGlow(116.4, 39.9, 20, 0.95); // Beijing
    addCityGlow(127.0, 37.5, 18, 0.95); // Seoul
    addCityGlow(113.3, 23.1, 20, 0.95); // Guangzhou / HK
    addCityGlow(121.5, 25.0, 14, 0.9); // Taipei

    // South & Southeast Asia
    addCityGlow(72.8, 19.0, 18, 0.95); // Mumbai
    addCityGlow(77.2, 28.6, 18, 0.95); // Delhi
    addCityGlow(88.3, 22.5, 15, 0.85); // Kolkata
    addCityGlow(100.5, 13.7, 15, 0.85); // Bangkok
    addCityGlow(103.8, 1.3, 14, 0.9);  // Singapore
    addCityGlow(106.8, -6.2, 16, 0.85); // Jakarta

    // Middle East & Africa
    addCityGlow(31.2, 30.0, 16, 0.95); // Cairo / Nile
    addCityGlow(55.3, 25.2, 16, 0.95); // Dubai
    addCityGlow(28.0, -26.2, 12, 0.8); // Johannesburg

    // South America & Australia
    addCityGlow(-46.6, -23.5, 18, 0.9); // Sao Paulo
    addCityGlow(-43.2, -22.9, 16, 0.85); // Rio de Janeiro
    addCityGlow(-58.4, -34.6, 16, 0.85); // Buenos Aires
    addCityGlow(151.2, -33.8, 14, 0.85); // Sydney
    addCityGlow(144.9, -37.8, 14, 0.85); // Melbourne

    // Subtle starry clusters over populated regions
    ctx.fillStyle = 'rgba(255, 210, 110, 0.4)';
    for (let i = 0; i < 280; i++) {
      // European cluster
      ctx.fillRect(width * 0.46 + Math.random() * 80, height * 0.18 + Math.random() * 55, 1.5, 1.5);
      // US East cluster
      ctx.fillRect(width * 0.24 + Math.random() * 65, height * 0.24 + Math.random() * 60, 1.5, 1.5);
      // China East cluster
      ctx.fillRect(width * 0.78 + Math.random() * 60, height * 0.28 + Math.random() * 60, 1.5, 1.5);
    }

    return canvas;
  }

  /**
   * Generates Earth Specular Map (~5ms)
   */
  function createEarthSpecularTexture(width = 1024, height = 512) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Oceans are highly specular (glistening white reflection in sunlight)
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, width, height);

    function geo(lon, lat) {
      return [((lon + 180) / 360) * width, ((90 - lat) / 180) * height];
    }

    // Landmasses are matte (dark non-reflective)
    ctx.fillStyle = '#101010';

    function drawMatteLand(points) {
      ctx.beginPath();
      const [x0, y0] = geo(points[0][0], points[0][1]);
      ctx.moveTo(x0, y0);
      for (let i = 1; i < points.length; i++) {
        const [px, py] = geo(points[i][0], points[i][1]);
        ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
    }

    // Rough land outlines matching day map
    drawMatteLand([
      [-10, 36], [0, 42], [10, 46], [28, 41], [36, 36], [42, 30], [55, 25],
      [68, 22], [78, 10], [86, 20], [98, 12], [104, 1], [115, 6], [122, 24],
      [122, 38], [130, 42], [142, 54], [168, 62], [178, 66], [170, 71],
      [140, 74], [100, 76], [70, 73], [50, 68], [30, 70], [18, 70],
      [5, 62], [-5, 58], [-9, 44], [-9, 38]
    ]);
    drawMatteLand([
      [-17, 15], [-17, 30], [-5, 36], [10, 37], [32, 31], [43, 12],
      [51, 12], [42, -5], [38, -18], [28, -33], [18, -35], [14, -28],
      [12, -15], [9, 4], [3, 6], [-10, 6], [-15, 11]
    ]);
    drawMatteLand([
      [-168, 65], [-160, 58], [-140, 60], [-125, 50], [-124, 38], [-117, 32],
      [-105, 22], [-97, 26], [-97, 18], [-80, 25], [-81, 32], [-70, 42],
      [-64, 45], [-60, 50], [-64, 60], [-80, 63], [-95, 70], [-120, 72],
      [-140, 70], [-162, 70]
    ]);
    drawMatteLand([
      [-77, 8], [-74, 11], [-60, 10], [-50, -1], [-35, -5], [-35, -10],
      [-38, -20], [-48, -28], [-58, -38], [-66, -55], [-74, -52], [-74, -42],
      [-72, -30], [-70, -18], [-80, -5], [-80, 4]
    ]);
    drawMatteLand([
      [114, -22], [115, -34], [128, -32], [138, -35], [148, -38], [152, -28],
      [145, -15], [136, -12], [130, -15], [122, -18]
    ]);

    return canvas;
  }

  /**
   * Generates Earth Cloud Layer Texture (~6ms)
   */
  function createCloudTexture(width = 1024, height = 512) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Transparent base
    ctx.clearRect(0, 0, width, height);

    // 1. Equatorial Intertropical Convergence Zone (ITCZ) cloud band
    const itczGrad = ctx.createLinearGradient(0, height * 0.44, 0, height * 0.56);
    itczGrad.addColorStop(0.0, 'rgba(255, 255, 255, 0)');
    itczGrad.addColorStop(0.35, 'rgba(255, 255, 255, 0.7)');
    itczGrad.addColorStop(0.65, 'rgba(255, 255, 255, 0.75)');
    itczGrad.addColorStop(1.0, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = itczGrad;
    ctx.fillRect(0, height * 0.44, width, height * 0.12);

    // 2. Mid-latitude storm tracks & swirling cyclonic storm spirals
    function drawCyclone(x, y, radius, arms = 3) {
      ctx.save();
      ctx.translate(x, y);
      for (let i = 0; i < arms; i++) {
        const startAngle = (i / arms) * Math.PI * 2;
        ctx.beginPath();
        for (let a = 0; a < Math.PI * 1.5; a += 0.1) {
          const r = radius * (a / (Math.PI * 1.5));
          const cx = Math.cos(startAngle + a) * r;
          const cy = Math.sin(startAngle + a) * r * 0.6;
          if (a === 0) ctx.moveTo(cx, cy);
          else ctx.lineTo(cx, cy);
        }
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
        ctx.lineWidth = 14;
        ctx.lineCap = 'round';
        ctx.stroke();
      }
      ctx.restore();
    }

    drawCyclone(width * 0.25, height * 0.28, 45, 3); // North Pacific storm
    drawCyclone(width * 0.45, height * 0.25, 50, 4); // North Atlantic cyclone
    drawCyclone(width * 0.82, height * 0.32, 42, 3); // East Asian monsoon
    drawCyclone(width * 0.35, height * 0.72, 55, 3); // Roaring Forties south
    drawCyclone(width * 0.68, height * 0.70, 50, 4); // South Indian ocean

    // 3. Trade wind cloud streaks across oceans
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    for (let i = 0; i < 90; i++) {
      const rx = Math.random() * width;
      const ry = (0.2 + Math.random() * 0.6) * height;
      const rw = 40 + Math.random() * 80;
      const rh = 6 + Math.random() * 12;
      ctx.beginPath();
      ctx.ellipse(rx, ry, rw, rh, (Math.random() - 0.5) * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }

    return canvas;
  }

  /**
   * Generates Moon Texture with Maria, Highlands, and Tycho Crater Rays (~8ms)
   */
  function createMoonTexture(width = 1024, height = 512) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // 1. Lunar Anorthosite Highlands base tone
    ctx.fillStyle = '#b3b5b8';
    ctx.fillRect(0, 0, width, height);

    // Micro-crater stipple
    ctx.fillStyle = 'rgba(70, 70, 75, 0.12)';
    for (let i = 0; i < 600; i++) {
      const sx = Math.random() * width;
      const sy = Math.random() * height;
      const sr = 1 + Math.random() * 3;
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
    }

    function geo(lon, lat) {
      return [((lon + 180) / 360) * width, ((90 - lat) / 180) * height];
    }

    // 2. Basaltic Lunar Maria (Dark plains on near side)
    function drawMare(lon, lat, rx, ry, angle = 0) {
      const [x, y] = geo(lon, lat);
      const grad = ctx.createRadialGradient(x, y, rx * 0.1, x, y, rx);
      grad.addColorStop(0.0, '#36373b');
      grad.addColorStop(0.7, '#48494e');
      grad.addColorStop(1.0, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(x, y, rx, ry, angle, 0, Math.PI * 2);
      ctx.fill();
    }

    // Near-side Maria (lon centered around 0°)
    drawMare(25, 12, 45, 38, -0.2);   // Mare Tranquillitatis (Apollo 11 site!)
    drawMare(18, 28, 42, 35, 0.1);    // Mare Serenitatis
    drawMare(-18, 33, 62, 52, 0.2);   // Mare Imbrium
    drawMare(59, 17, 30, 24, 0.0);    // Mare Crisium
    drawMare(-45, 18, 90, 75, -0.3);  // Oceanus Procellarum
    drawMare(-15, -20, 48, 38, 0.1);  // Mare Nubium
    drawMare(35, -15, 32, 28, 0.0);   // Mare Nectaris

    // 3. Impact Craters with Ejecta Rays (Tycho, Copernicus)
    function drawCraterWithRays(lon, lat, radius, rayCount = 12, rayLength = 180) {
      const [x, y] = geo(lon, lat);

      // Radiating bright rays
      ctx.save();
      ctx.translate(x, y);
      ctx.strokeStyle = 'rgba(245, 245, 255, 0.38)';
      ctx.lineWidth = 1.6;
      for (let i = 0; i < rayCount; i++) {
        const a = (i / rayCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.15;
        const len = rayLength * (0.6 + Math.random() * 0.4);
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * radius * 1.5, Math.sin(a) * radius * 1.5);
        ctx.lineTo(Math.cos(a) * len, Math.sin(a) * len);
        ctx.stroke();
      }
      ctx.restore();

      // Bright crater rim
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = '#eaecef';
      ctx.fill();

      // Inner crater floor shadow
      ctx.beginPath();
      ctx.arc(x + radius * 0.15, y, radius * 0.7, 0, Math.PI * 2);
      ctx.fillStyle = '#65666b';
      ctx.fill();

      // Central peak
      ctx.beginPath();
      ctx.arc(x, y, radius * 0.2, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    }

    // Tycho (brilliant ray crater in the south)
    drawCraterWithRays(-11, -43, 9, 16, 220);
    // Copernicus (prominent crater in Oceanus Procellarum)
    drawCraterWithRays(-20, 10, 8, 12, 130);
    // Kepler
    drawCraterWithRays(-38, 8, 6, 8, 80);
    // Aristarchus (brightest feature on the Moon)
    drawCraterWithRays(-47, 24, 6, 8, 90);

    return canvas;
  }

  /**
   * Generates Sun Plasma Surface Texture (~5ms)
   */
  function createSunTexture(width = 512, height = 256) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Solar plasma gradient
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0.0, '#ff9900');
    grad.addColorStop(0.3, '#ffcc00');
    grad.addColorStop(0.7, '#ffbb00');
    grad.addColorStop(1.0, '#ff8800');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Convective granulation stipple
    ctx.fillStyle = 'rgba(255, 245, 180, 0.25)';
    for (let i = 0; i < 400; i++) {
      ctx.fillRect(Math.random() * width, Math.random() * height, 2, 2);
    }

    // Dynamic sunspots with umbra (dark core) and penumbra (reddish rim)
    function drawSunspot(x, y, r) {
      // Penumbra
      const pGrad = ctx.createRadialGradient(x, y, r * 0.2, x, y, r);
      pGrad.addColorStop(0.0, '#3a1202');
      pGrad.addColorStop(0.6, '#8b2e04');
      pGrad.addColorStop(1.0, 'transparent');
      ctx.fillStyle = pGrad;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();

      // Umbra
      ctx.fillStyle = '#170500';
      ctx.beginPath();
      ctx.arc(x - r * 0.1, y, r * 0.45, 0, Math.PI * 2);
      ctx.fill();
    }

    drawSunspot(width * 0.35, height * 0.42, 14);
    drawSunspot(width * 0.38, height * 0.45, 8);
    drawSunspot(width * 0.65, height * 0.58, 12);
    drawSunspot(width * 0.80, height * 0.38, 10);

    return canvas;
  }

  /**
   * Generates Sun Corona Radial Glow Sprite Canvas (~3ms)
   */
  function createSunCoronaTexture(size = 512) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const center = size / 2;

    const gradient = ctx.createRadialGradient(center, center, center * 0.16, center, center, center * 0.95);
    gradient.addColorStop(0.0, 'rgba(255, 255, 235, 1.0)');
    gradient.addColorStop(0.2, 'rgba(255, 220, 90, 0.85)');
    gradient.addColorStop(0.45, 'rgba(255, 145, 25, 0.45)');
    gradient.addColorStop(0.75, 'rgba(255, 85, 0, 0.12)');
    gradient.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    // Subtle radial solar flare filaments
    ctx.save();
    ctx.translate(center, center);
    ctx.strokeStyle = 'rgba(255, 225, 110, 0.09)';
    ctx.lineWidth = 1.5;
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 36) {
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * center * 0.2, Math.sin(a) * center * 0.2);
      const l = center * (0.6 + Math.sin(a * 7) * 0.2);
      ctx.lineTo(Math.cos(a) * l, Math.sin(a) * l);
      ctx.stroke();
    }
    ctx.restore();

    return canvas;
  }

  return {
    createEarthDayTexture,
    createEarthNightTexture,
    createEarthSpecularTexture,
    createCloudTexture,
    createMoonTexture,
    createSunTexture,
    createSunCoronaTexture
  };
});


/* --- START: orbits.js --- */
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


/* --- START: audio.js --- */
/**
 * AstroMotion - Procedural Cosmic Soundscape (Web Audio API)
 * Ambient harmonic drone for celestial observatory atmosphere.
 * Zero external audio files required!
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.AstroAudio = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  let audioCtx = null;
  let masterGain = null;
  let isPlaying = false;
  let oscillators = [];

  function init() {
    if (audioCtx) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    audioCtx = new AudioContextClass();
    masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0.0, audioCtx.currentTime);

    const filter = audioCtx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(450, audioCtx.currentTime);
    filter.Q.setValueAtTime(2.0, audioCtx.currentTime);

    masterGain.connect(filter);
    filter.connect(audioCtx.destination);

    // Pythagorean 5ths drone
    const freqs = [55.0, 55.4, 110.0, 164.8, 220.0, 329.6];

    freqs.forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const oscGain = audioCtx.createGain();

      osc.type = idx % 2 === 0 ? "sine" : "triangle";
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      const lfo = audioCtx.createOscillator();
      const lfoGain = audioCtx.createGain();
      lfo.frequency.setValueAtTime(0.08 + idx * 0.03, audioCtx.currentTime);
      lfoGain.gain.setValueAtTime(0.035, audioCtx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(oscGain.gain);
      lfo.start();

      oscGain.gain.setValueAtTime(0.08 / (idx + 1), audioCtx.currentTime);
      osc.connect(oscGain);
      oscGain.connect(masterGain);
      osc.start();

      oscillators.push({ osc, lfo });
    });
  }

  function toggle() {
    if (!audioCtx) init();
    if (!audioCtx) return false;

    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }

    if (isPlaying) {
      masterGain.gain.setTargetAtTime(0.0, audioCtx.currentTime, 0.4);
      isPlaying = false;
    } else {
      masterGain.gain.setTargetAtTime(0.25, audioCtx.currentTime, 0.6);
      isPlaying = true;
    }
    return isPlaying;
  }

  function setVolume(val) {
    if (!masterGain || !audioCtx) return;
    const clamped = Math.max(0.0, Math.min(1.0, val));
    if (isPlaying) {
      masterGain.gain.setTargetAtTime(clamped * 0.4, audioCtx.currentTime, 0.1);
    }
  }

  return {
    toggle,
    setVolume,
    getIsPlaying: () => isPlaying
  };
});


/* --- START: celestial.js --- */
/**
 * AstroMotion - 3D Celestial Objects, Shaders, and Visual Aids
 * Builds Sun, Earth with day/night shaders, Moon with tidal locking, atmosphere glow, and orbital paths.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.AstroCelestial = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  let scene = null;
  let objects = {};
  let materials = {};

  function getOrbits() {
    return window.AstroOrbits;
  }

  function getTextures() {
    return window.AstroTextures;
  }

  function init(threeScene) {
    scene = threeScene;
    const AstroOrbits = getOrbits();
    const TextureGenerator = getTextures();
    const scale = AstroOrbits.getScale();

    // Generate Fast Procedural Textures
    const earthDayCanvas = TextureGenerator.createEarthDayTexture(1024, 512);
    const earthNightCanvas = TextureGenerator.createEarthNightTexture(1024, 512);
    const earthSpecCanvas = TextureGenerator.createEarthSpecularTexture(1024, 512);
    const cloudCanvas = TextureGenerator.createCloudTexture(1024, 512);
    const moonCanvas = TextureGenerator.createMoonTexture(1024, 512);
    const sunCanvas = TextureGenerator.createSunTexture(512, 256);
    const sunCoronaCanvas = TextureGenerator.createSunCoronaTexture(512);

    const earthDayTex = new THREE.CanvasTexture(earthDayCanvas);
    const earthNightTex = new THREE.CanvasTexture(earthNightCanvas);
    const earthSpecTex = new THREE.CanvasTexture(earthSpecCanvas);
    const cloudTex = new THREE.CanvasTexture(cloudCanvas);
    const moonTex = new THREE.CanvasTexture(moonCanvas);
    const sunTex = new THREE.CanvasTexture(sunCanvas);
    const sunCoronaTex = new THREE.CanvasTexture(sunCoronaCanvas);

    // 1. STARFIELD & SKYBOX
    createStarfield(AstroOrbits);

    // 2. THE SUN
    createSun(scale, sunTex, sunCoronaTex);

    // 3. THE EARTH SYSTEM
    createEarthSystem(scale, earthDayTex, earthNightTex, earthSpecTex, cloudTex, AstroOrbits);

    // 4. THE MOON SYSTEM
    createMoonSystem(scale, moonTex);

    // 5. ORBIT LINES & CELESTIAL AIDS
    createVisualAids(scale, AstroOrbits);

    return objects;
  }

  function createStarfield(AstroOrbits) {
    const starCount = 10000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    const starTypes = [
      new THREE.Color(0xaabbff),
      new THREE.Color(0xffffff),
      new THREE.Color(0xfff5ea),
      new THREE.Color(0xffd2a1),
      new THREE.Color(0xff8c69)
    ];

    for (let i = 0; i < starCount; i++) {
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 450 + Math.random() * 200;

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.cos(phi);
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);

      const color = starTypes[Math.floor(Math.random() * starTypes.length)];
      const brightness = 0.5 + Math.random() * 0.5;
      colors[i * 3] = color.r * brightness;
      colors[i * 3 + 1] = color.g * brightness;
      colors[i * 3 + 2] = color.b * brightness;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const starMaterial = new THREE.PointsMaterial({
      size: 1.8,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      sizeAttenuation: true
    });

    const stars = new THREE.Points(geometry, starMaterial);
    scene.add(stars);
    objects.stars = stars;

    // Polaris (North Star) Marker
    const polarisGeom = new THREE.BufferGeometry();
    const polarisTilt = AstroOrbits.CONSTANTS.EARTH_AXIAL_TILT_RAD;
    const polR = 480;
    const polX = polR * Math.sin(polarisTilt);
    const polY = polR * Math.cos(polarisTilt);
    const polZ = 0;

    polarisGeom.setAttribute('position', new THREE.Float32BufferAttribute([polX, polY, polZ], 3));
    const polarisMat = new THREE.PointsMaterial({
      color: 0x88e5ff,
      size: 8.0,
      transparent: true,
      opacity: 0.95
    });
    const polaris = new THREE.Points(polarisGeom, polarisMat);
    scene.add(polaris);
    objects.polaris = polaris;
  }

  function createSun(scale, sunTex, coronaTex) {
    const sunGroup = new THREE.Group();

    const sunGeom = new THREE.SphereGeometry(scale.sunRadius, 48, 48);
    const sunMat = new THREE.MeshBasicMaterial({
      map: sunTex,
      color: 0xfff0c0
    });
    const sunMesh = new THREE.Mesh(sunGeom, sunMat);
    sunGroup.add(sunMesh);

    const coronaMat = new THREE.SpriteMaterial({
      map: coronaTex,
      color: 0xffddaa,
      transparent: true,
      blending: THREE.AdditiveBlending,
      opacity: 0.85
    });
    const coronaSprite = new THREE.Sprite(coronaMat);
    coronaSprite.scale.set(scale.sunRadius * 4.6, scale.sunRadius * 4.6, 1.0);
    sunGroup.add(coronaSprite);

    const sunLight = new THREE.PointLight(0xffffff, 2.4, 600, 0.4);
    sunLight.castShadow = true;
    sunGroup.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0x242d3d, 0.55);
    scene.add(ambientLight);

    scene.add(sunGroup);
    objects.sunGroup = sunGroup;
    objects.sunMesh = sunMesh;
    objects.sunLight = sunLight;
  }

  function createEarthSystem(scale, dayTex, nightTex, specTex, cloudTex, AstroOrbits) {
    const earthSystem = new THREE.Group();

    const earthTiltGroup = new THREE.Group();
    earthTiltGroup.rotation.z = -AstroOrbits.CONSTANTS.EARTH_AXIAL_TILT_RAD;
    earthSystem.add(earthTiltGroup);

    const earthSpinGroup = new THREE.Group();
    earthTiltGroup.add(earthSpinGroup);

    const earthShader = {
      uniforms: {
        dayTexture: { value: dayTex },
        nightTexture: { value: nightTex },
        specularMap: { value: specTex },
        sunPosition: { value: new THREE.Vector3(0, 0, 0) },
        earthPosition: { value: new THREE.Vector3(0, 0, 0) }
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec2 vUv;
        varying vec3 vWorldPosition;
        varying vec3 vWorldNormal;

        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPos.xyz;
          vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform sampler2D dayTexture;
        uniform sampler2D nightTexture;
        uniform sampler2D specularMap;
        uniform vec3 sunPosition;
        uniform vec3 earthPosition;

        varying vec3 vNormal;
        varying vec2 vUv;
        varying vec3 vWorldPosition;
        varying vec3 vWorldNormal;

        void main() {
          vec3 lightDir = normalize(sunPosition - vWorldPosition);
          vec3 viewDir = normalize(cameraPosition - vWorldPosition);

          float NdotL = dot(vWorldNormal, lightDir);

          vec4 dayColor = texture2D(dayTexture, vUv);
          vec4 nightColor = texture2D(nightTexture, vUv);
          vec4 specValue = texture2D(specularMap, vUv);

          vec3 reflectDir = reflect(-lightDir, vWorldNormal);
          float specFactor = max(0.0, dot(viewDir, reflectDir));
          float specular = pow(specFactor, 24.0) * specValue.r * 1.8;

          float dayFactor = smoothstep(-0.12, 0.15, NdotL);

          float twilight = (1.0 - abs(NdotL) * 6.0);
          vec3 twilightColor = vec3(0.9, 0.45, 0.15) * max(0.0, twilight) * 0.35;

          float fresnel = 1.0 - max(0.0, dot(viewDir, vWorldNormal));
          vec3 atmosphereGlow = vec3(0.3, 0.65, 1.0) * pow(fresnel, 3.2) * max(0.05, NdotL + 0.2);

          vec3 dayLit = dayColor.rgb * max(0.05, NdotL) + vec3(specular) + twilightColor;
          vec3 nightLit = nightColor.rgb * (1.0 - dayFactor) * 1.6;

          vec3 finalColor = mix(nightLit, dayLit, dayFactor) + atmosphereGlow;

          gl_FragColor = vec4(finalColor, 1.0);
        }
      `
    };

    const earthMat = new THREE.ShaderMaterial({
      uniforms: earthShader.uniforms,
      vertexShader: earthShader.vertexShader,
      fragmentShader: earthShader.fragmentShader
    });
    materials.earth = earthMat;

    const earthGeom = new THREE.SphereGeometry(scale.earthRadius, 64, 64);
    const earthMesh = new THREE.Mesh(earthGeom, earthMat);
    earthMesh.castShadow = true;
    earthMesh.receiveShadow = true;
    earthSpinGroup.add(earthMesh);

    const cloudGeom = new THREE.SphereGeometry(scale.cloudRadius, 48, 48);
    const cloudMat = new THREE.MeshStandardMaterial({
      map: cloudTex,
      transparent: true,
      opacity: 0.82,
      blending: THREE.NormalBlending,
      roughness: 0.9,
      metalness: 0.0
    });
    const cloudMesh = new THREE.Mesh(cloudGeom, cloudMat);
    earthSpinGroup.add(cloudMesh);

    const atmoGeom = new THREE.SphereGeometry(scale.atmosphereRadius, 36, 36);
    const atmoMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.7 - dot(vNormal, vec3(0, 0, 1.0)), 2.2);
          gl_FragColor = vec4(0.35, 0.7, 1.0, 1.0) * intensity * 0.75;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true
    });
    const atmoMesh = new THREE.Mesh(atmoGeom, atmoMat);
    earthTiltGroup.add(atmoMesh);

    const axisGeom = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, scale.earthRadius * 1.9, 0),
      new THREE.Vector3(0, -scale.earthRadius * 1.9, 0)
    ]);
    const axisMat = new THREE.LineBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.75 });
    const axisLine = new THREE.Line(axisGeom, axisMat);
    earthTiltGroup.add(axisLine);

    const polePointerGeom = new THREE.ConeGeometry(scale.earthRadius * 0.08, scale.earthRadius * 0.35, 12);
    const polePointerMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const northPointer = new THREE.Mesh(polePointerGeom, polePointerMat);
    northPointer.position.y = scale.earthRadius * 1.9;
    earthTiltGroup.add(northPointer);

    const latRingsGroup = createEarthLatitudeRings(scale.earthRadius);
    earthTiltGroup.add(latRingsGroup);

    const shadowConeGeom = new THREE.ConeGeometry(scale.earthRadius * 1.05, scale.moonEarthDist * 2.8, 32, 1, true);
    shadowConeGeom.rotateX(Math.PI / 2);
    const shadowConeMat = new THREE.MeshBasicMaterial({
      color: 0x110206,
      transparent: true,
      opacity: 0.28,
      side: THREE.DoubleSide
    });
    const earthShadowCone = new THREE.Mesh(shadowConeGeom, shadowConeMat);
    earthShadowCone.position.set(0, 0, scale.moonEarthDist * 1.4);
    earthSystem.add(earthShadowCone);

    scene.add(earthSystem);
    objects.earthSystem = earthSystem;
    objects.earthTiltGroup = earthTiltGroup;
    objects.earthSpinGroup = earthSpinGroup;
    objects.earthMesh = earthMesh;
    objects.cloudMesh = cloudMesh;
    objects.earthAxisLine = axisLine;
    objects.earthLatRings = latRingsGroup;
    objects.earthShadowCone = earthShadowCone;
  }

  function createEarthLatitudeRings(earthRadius) {
    const group = new THREE.Group();
    const r = earthRadius * 1.008;

    function makeRing(latDeg, color, opacity = 0.5) {
      const latRad = latDeg * (Math.PI / 180);
      const ringRadius = r * Math.cos(latRad);
      const y = r * Math.sin(latRad);
      const ringGeom = new THREE.BufferGeometry();
      const points = [];
      const segments = 64;
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * 2 * Math.PI;
        points.push(new THREE.Vector3(ringRadius * Math.cos(theta), y, ringRadius * Math.sin(theta)));
      }
      ringGeom.setFromPoints(points);
      const lineMat = new THREE.LineBasicMaterial({ color, transparent: true, opacity });
      return new THREE.Line(ringGeom, lineMat);
    }

    group.add(makeRing(0, 0x00ffff, 0.7));
    group.add(makeRing(23.44, 0xffaa00, 0.6));
    group.add(makeRing(-23.44, 0xffaa00, 0.6));
    group.add(makeRing(66.56, 0x88ccff, 0.4));
    group.add(makeRing(-66.56, 0x88ccff, 0.4));

    return group;
  }

  function createMoonSystem(scale, moonTex) {
    const moonGroup = new THREE.Group();

    const moonGeom = new THREE.SphereGeometry(scale.moonRadius, 48, 48);

    const moonShader = {
      uniforms: {
        map: { value: moonTex },
        sunPosition: { value: new THREE.Vector3(0, 0, 0) },
        earthPosition: { value: new THREE.Vector3(0, 0, 0) },
        isEclipse: { value: 0.0 }
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec2 vUv;
        varying vec3 vWorldPosition;
        varying vec3 vWorldNormal;

        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPos.xyz;
          vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform sampler2D map;
        uniform vec3 sunPosition;
        uniform vec3 earthPosition;
        uniform float isEclipse;

        varying vec3 vNormal;
        varying vec2 vUv;
        varying vec3 vWorldPosition;
        varying vec3 vWorldNormal;

        void main() {
          vec3 lightDir = normalize(sunPosition - vWorldPosition);
          float NdotL = max(0.0, dot(vWorldNormal, lightDir));

          vec4 texColor = texture2D(map, vUv);
          vec3 directColor = texColor.rgb * (NdotL + 0.04);
          vec3 bloodMoonColor = texColor.rgb * vec3(0.9, 0.22, 0.08) * 0.45;
          vec3 finalColor = mix(directColor, bloodMoonColor, isEclipse);

          gl_FragColor = vec4(finalColor, 1.0);
        }
      `
    };

    const moonMat = new THREE.ShaderMaterial({
      uniforms: moonShader.uniforms,
      vertexShader: moonShader.vertexShader,
      fragmentShader: moonShader.fragmentShader
    });
    materials.moon = moonMat;

    const moonMesh = new THREE.Mesh(moonGeom, moonMat);
    moonMesh.castShadow = true;
    moonMesh.receiveShadow = true;
    moonGroup.add(moonMesh);

    const moonShadowConeGeom = new THREE.ConeGeometry(scale.moonRadius * 0.95, scale.moonEarthDist * 1.5, 24, 1, true);
    moonShadowConeGeom.rotateX(-Math.PI / 2);
    const moonShadowMat = new THREE.MeshBasicMaterial({
      color: 0x0a0a14,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide
    });
    const moonShadowCone = new THREE.Mesh(moonShadowConeGeom, moonShadowMat);
    moonGroup.add(moonShadowCone);

    scene.add(moonGroup);
    objects.moonGroup = moonGroup;
    objects.moonMesh = moonMesh;
    objects.moonShadowCone = moonShadowCone;
  }

  function createVisualAids(scale, AstroOrbits) {
    const aidsGroup = new THREE.Group();

    const earthOrbitPoints = [];
    const segments = 180;
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * 2 * Math.PI;
      const r = scale.earthSunDist * (1 - 0.0167 * Math.cos(angle));
      earthOrbitPoints.push(new THREE.Vector3(r * Math.sin(angle), 0, -r * Math.cos(angle)));
    }
    const earthOrbitGeom = new THREE.BufferGeometry().setFromPoints(earthOrbitPoints);
    const earthOrbitMat = new THREE.LineBasicMaterial({
      color: 0x2288ff,
      transparent: true,
      opacity: 0.45
    });
    const earthOrbitLine = new THREE.Line(earthOrbitGeom, earthOrbitMat);
    aidsGroup.add(earthOrbitLine);

    const eclipticRings = new THREE.Group();
    for (let radius of [scale.earthSunDist * 0.5, scale.earthSunDist, scale.earthSunDist * 1.3]) {
      const ringGeom = new THREE.RingGeometry(radius - 0.15, radius + 0.15, 96);
      ringGeom.rotateX(Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x1f3d5c,
        transparent: true,
        opacity: 0.22,
        side: THREE.DoubleSide
      });
      eclipticRings.add(new THREE.Mesh(ringGeom, ringMat));
    }
    aidsGroup.add(eclipticRings);

    const moonOrbitPoints = [];
    const moonSegments = 96;
    const inc = AstroOrbits.CONSTANTS.MOON_ORBIT_INCLINATION_RAD;
    const rMoon = scale.moonEarthDist;

    for (let i = 0; i <= moonSegments; i++) {
      const angle = (i / moonSegments) * 2 * Math.PI;
      const x = rMoon * Math.cos(angle);
      const y = rMoon * Math.sin(angle) * Math.sin(inc);
      const z = rMoon * Math.sin(angle) * Math.cos(inc);
      moonOrbitPoints.push(new THREE.Vector3(x, y, z));
    }
    const moonOrbitGeom = new THREE.BufferGeometry().setFromPoints(moonOrbitPoints);
    const moonOrbitMat = new THREE.LineBasicMaterial({
      color: 0xffee88,
      transparent: true,
      opacity: 0.55
    });
    const moonOrbitLine = new THREE.Line(moonOrbitGeom, moonOrbitMat);
    objects.earthSystem.add(moonOrbitLine);

    const nodeLinePoints = [
      new THREE.Vector3(-scale.moonEarthDist * 1.25, 0, 0),
      new THREE.Vector3(scale.moonEarthDist * 1.25, 0, 0)
    ];
    const nodeLineGeom = new THREE.BufferGeometry().setFromPoints(nodeLinePoints);
    const nodeLineMat = new THREE.LineDashedMaterial({
      color: 0xff3366,
      dashSize: 0.8,
      gapSize: 0.4,
      transparent: true,
      opacity: 0.85
    });
    const nodeLine = new THREE.Line(nodeLineGeom, nodeLineMat);
    nodeLine.computeLineDistances();
    objects.earthSystem.add(nodeLine);

    const lunarPlaneGeom = new THREE.CircleGeometry(scale.moonEarthDist * 1.1, 48);
    lunarPlaneGeom.rotateX(Math.PI / 2);
    lunarPlaneGeom.rotateZ(-inc);
    const lunarPlaneMat = new THREE.MeshBasicMaterial({
      color: 0xffea78,
      transparent: true,
      opacity: 0.08,
      side: THREE.DoubleSide
    });
    const lunarPlaneDisc = new THREE.Mesh(lunarPlaneGeom, lunarPlaneMat);
    objects.earthSystem.add(lunarPlaneDisc);

    scene.add(aidsGroup);
    objects.aidsGroup = aidsGroup;
    objects.earthOrbitLine = earthOrbitLine;
    objects.eclipticRings = eclipticRings;
    objects.moonOrbitLine = moonOrbitLine;
    objects.nodeLine = nodeLine;
    objects.lunarPlaneDisc = lunarPlaneDisc;
  }

  function update(simDays) {
    const AstroOrbits = getOrbits();
    const scale = AstroOrbits.getScale();

    if (objects.sunMesh) {
      const sunRotation = (simDays / AstroOrbits.CONSTANTS.SUN_ROTATION_DAYS) * 2 * Math.PI;
      objects.sunMesh.rotation.y = sunRotation;
    }

    const earthPos = AstroOrbits.getEarthHeliocentricPosition(simDays, scale);
    if (objects.earthSystem) {
      objects.earthSystem.position.set(earthPos.x, earthPos.y, earthPos.z);

      const earthDayRotation = simDays * 2 * Math.PI;
      objects.earthSpinGroup.rotation.y = earthDayRotation;

      if (objects.cloudMesh) {
        objects.cloudMesh.rotation.y = earthDayRotation * 1.05;
      }

      if (objects.earthShadowCone) {
        objects.earthShadowCone.lookAt(earthPos.x * 2, 0, earthPos.z * 2);
      }
    }

    const moonRel = AstroOrbits.getMoonGeocentricPosition(simDays, scale);
    if (objects.moonGroup) {
      const moonWorldX = earthPos.x + moonRel.x;
      const moonWorldY = earthPos.y + moonRel.y;
      const moonWorldZ = earthPos.z + moonRel.z;

      objects.moonGroup.position.set(moonWorldX, moonWorldY, moonWorldZ);
      objects.moonGroup.lookAt(earthPos.x, earthPos.y, earthPos.z);

      if (objects.moonShadowCone) {
        const toSunDirX = -moonWorldX;
        const toSunDirY = -moonWorldY;
        const toSunDirZ = -moonWorldZ;
        objects.moonShadowCone.lookAt(moonWorldX - toSunDirX, moonWorldY - toSunDirY, moonWorldZ - toSunDirZ);
      }
    }

    const moonPhaseInfo = AstroOrbits.getMoonPhase(simDays, scale);

    if (materials.earth) {
      materials.earth.uniforms.earthPosition.value.set(earthPos.x, earthPos.y, earthPos.z);
    }

    if (materials.moon) {
      materials.moon.uniforms.earthPosition.value.set(earthPos.x, earthPos.y, earthPos.z);
      if (moonPhaseInfo.eclipse && moonPhaseInfo.eclipse.type === "lunar") {
        materials.moon.uniforms.isEclipse.value = moonPhaseInfo.eclipse.intensity;
      } else {
        materials.moon.uniforms.isEclipse.value = 0.0;
      }
    }

    if (objects.moonOrbitLine) {
      objects.moonOrbitLine.rotation.y = moonRel.nodeAngle;
    }
    if (objects.nodeLine) {
      objects.nodeLine.rotation.y = moonRel.nodeAngle;
    }
    if (objects.lunarPlaneDisc) {
      objects.lunarPlaneDisc.rotation.y = moonRel.nodeAngle;
    }
  }

  function toggleAid(aidName, visible) {
    switch (aidName) {
      case 'orbits':
        if (objects.earthOrbitLine) objects.earthOrbitLine.visible = visible;
        if (objects.moonOrbitLine) objects.moonOrbitLine.visible = visible;
        break;
      case 'axes':
        if (objects.earthAxisLine) objects.earthAxisLine.visible = visible;
        if (objects.polaris) objects.polaris.visible = visible;
        break;
      case 'latitudes':
        if (objects.earthLatRings) objects.earthLatRings.visible = visible;
        break;
      case 'planes':
        if (objects.eclipticRings) objects.eclipticRings.visible = visible;
        if (objects.lunarPlaneDisc) objects.lunarPlaneDisc.visible = visible;
        if (objects.nodeLine) objects.nodeLine.visible = visible;
        break;
      case 'shadows':
        if (objects.earthShadowCone) objects.earthShadowCone.visible = visible;
        if (objects.moonShadowCone) objects.moonShadowCone.visible = visible;
        break;
      case 'stars':
        if (objects.stars) objects.stars.visible = visible;
        break;
    }
  }

  return {
    init,
    update,
    toggleAid,
    getObjects: () => objects
  };
});


/* --- START: ui.js --- */
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


/* --- START: main.js --- */
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


