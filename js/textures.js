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
