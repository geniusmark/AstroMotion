# 🌌 AstroMotion — 3D Earth, Moon & Sun Astronomical Simulator

An interactive, scientifically inspired 3D celestial motion visualizer built with **Three.js** and vanilla JavaScript. **AstroMotion** simulates the dynamic gravitational choreography of the Sun, Earth, and Moon, illustrating why we experience the 4 seasons, how lunar phases evolve, why the Moon is tidally locked, and why solar and lunar eclipses occur.

![AstroMotion 3D Celestial Observatory](screenshot.png)

---

## ✨ Features

### 1. Accurate Astronomical Mechanics
- **Earth's Axial Tilt ($23.44^\circ$)**: Maintained with constant orientation in inertial space pointing continuously toward **Polaris (the North Star)**, faithfully driving the **4 Seasons**, equinoxes, solstices, and changing daylight hours across hemispheres.
- **Diurnal Rotation (Day & Night)**: Earth rotates on its tilted axis every 24 hours, displaying a day/night terminator with glistening ocean specular highlights by day and glowing metropolitan city lights by night.
- **Atmospheric Rayleigh Scattering**: Atmospheric rim halo along Earth's limb, with semi-transparent drifting cloud vortices.
- **Moon's Orbital Inclination ($5.145^\circ$)**: Accurately demonstrates the Moon's inclined orbit relative to the ecliptic plane, explaining why eclipses do not occur every month.
- **Line of Nodes & Nodal Precession**: Visualizes the ascending and descending nodes where the Moon's path intersects the ecliptic plane.
- **Tidal Locking (Synchronous Rotation)**: The Moon's orbital period matches its axial rotation period ($\sim 27.32$ days), ensuring the exact same lunar face (near side) is always oriented toward Earth.
- **Solar & Lunar Eclipse Geometry**:
  - **Solar Eclipse**: Umbral shadow cone touches Earth during New Moon alignments along the line of nodes.
  - **Lunar Eclipse (Blood Moon)**: Earth casts its umbral shadow cone over the Moon, transitioning the lunar shader into an atmospheric copper-red refraction.

### 2. Standalone Procedural Textures (Zero External Asset Dependencies)
All planetary textures are synthesized directly on high-resolution HTML5 canvases:
- **Earth Day Texture**: Procedural continents, oceans, shallow continental shelves, deserts, temperate forests, mountain ranges, and polar ice caps.
- **Earth Night Texture**: Amber city light clusters mapped to metropolitan population centers.
- **Cloud Layer**: Swirling tropical cyclonic storm systems and trade wind bands with alpha transparency.
- **Moon Texture**: Anorthosite lunar highlands, dark basaltic maria (*Mare Tranquillitatis*, *Oceanus Procellarum*), and bright impact crater ejecta rays (*Tycho*, *Copernicus*).
- **Sun Surface & Corona**: Convective granulation cells, dynamic sunspots, and radiant solar corona halo.
- **Deep Space Skybox**: 12,000 multi-spectral stars (O, B, A, F, G, K, M types) and a designated North Star (Polaris) marker.

### 3. Interactive Observatory Controls & HUD
- **Real-Time Calendar & Seasons Tracker**: Tracks simulation date, Day of Year, Northern/Southern seasons, and real-time subsolar latitude ($\delta$).
- **Live 2D Lunar Phase Gauge**: Real-time 2D canvas showing the illuminated lunar phase as seen from an Earth observer, accompanied by phase name and illumination percentage ($0\% - 100\%$).
- **Eclipse Warning HUD Banner**: Notifies you when eclipse alignment thresholds are met.
- **Time Controls**:
  - Play / Pause (Spacebar)
  - Speed Slider (from reverse time flow to $60\times$ days/sec)
  - Step forward / backward by 1 day ($\rightarrow$ / $\leftarrow$)
  - Fast-jump shortcuts: **Vernal Equinox**, **Summer Solstice**, **Autumn Equinox**, **Winter Solstice**, **Next Solar Eclipse**, and **Next Lunar Eclipse**.
- **Camera Perspectives**:
  1. **System Overview**: Full view of the Sun-Earth-Moon orbital dance.
  2. **Track Earth**: Smoothly follows Earth as it orbits the Sun.
  3. **Moon Phase View**: Standing on Earth looking directly up at the Moon.
  4. **Earthrise View**: Standing on the Moon looking back at Earth.
  5. **Sun's Perspective**: Viewing Earth from the center of the solar system.
  6. **Top-Down Ecliptic**: Polar view of concentric orbital planes.
- **Visual Aids Toggles**: Orbits, $23.4^\circ$ Tilt Axis / Polaris, Equator & Tropics, Orbital Planes & Line of Nodes, Eclipse Shadow Cones, Starfield.
- **Cosmic Audio**: Procedural ambient harmonic drone generated in real-time with the Web Audio API.

---

## 🚀 How to Run

### Method 1: One-Click Runner (Windows)
Double-click `run.bat` in the project root folder. It starts a local Python HTTP server and automatically opens your browser at:
```
http://localhost:8000/index.html
```

### Method 2: Python Command Line
Open a terminal in the project directory and run:
```bash
python serve.py
```
Or with Python's built-in module:
```bash
python -m http.server 8000
```
Then navigate to `http://localhost:8000` in Google Chrome, Microsoft Edge, Firefox, or Safari.

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
| --- | --- |
| `Space` | Play / Pause simulation |
| `→` | Step forward 1 simulation day |
| `←` | Step backward 1 simulation day |
| `1` | Switch to System Overview camera |
| `2` | Switch to Track Earth camera |
| `3` | Switch to Moon Phase view (Earth observer) |
| `4` | Switch to Earthrise view (from Moon) |
| `5` | Switch to Sun's perspective |
| `6` | Switch to Polar Top-Down view |
| `M` | Toggle ambient cosmic audio soundscape |
| `H` | Toggle / minimize HUD overlay panels |
| `Mouse Drag` | Orbit and rotate the 3D perspective |
| `Mouse Wheel` | Zoom in / out |
| `Right Click Drag` | Pan the scene |

---

## 📁 Project Structure

```
c:\_dev\GoogleAntigravityProjects\AstroMotion/
│
├── index.html          # Main HTML5 entry point & glassmorphic observatory UI
├── serve.py            # Local Python server with automatic browser launch
├── run.bat             # Windows 1-click batch launcher
├── screenshot.png      # Application observatory preview screenshot
├── README.md           # Project documentation & astronomical guide
│
├── css/
│   └── styles.css      # Observatory glassmorphism theme, HUD styling & responsive rules
│
└── js/
    ├── app.js          # Consolidated application bundle (fast, standalone)
    ├── main.js         # WebGL scene setup, render loop, time coordinator
    ├── orbits.js       # Keplerian orbital mechanics, axial tilt, seasons, lunar phases
    ├── celestial.js    # 3D meshes, custom shaders (day/night, atmosphere, eclipse), visual aids
    ├── textures.js     # Fast hardware-accelerated canvas texture generator
    ├── ui.js           # HUD telemetry, camera lerping, 2D phase canvas, event listeners
    └── audio.js        # Procedural Web Audio API cosmic soundscape
```

---

## 🤖 Development & Environment

This project was created and developed with:
- **IDE**: **Google Antigravity** (Antigravity IDE)
- **AI Model**: **Gemini 3.8 Flash** by Google DeepMind

