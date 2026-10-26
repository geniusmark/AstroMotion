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
