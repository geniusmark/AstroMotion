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
