import React, { useEffect, useRef } from "react";

export interface AccretionDiscFieldProps {
  scatter?: number; // default: 44, range 0-300
  blur?: number;    // default: 0, range 0-300
}

export interface AccretionDiscDiscProps {
  tilt?: number; // default: 44, range 0-45 (degrees)
  core?: number; // default: 6, range 0-40 (%)
  arms?: number; // default: 8, range 0-8
}

export interface AccretionDiscJetsProps {
  amount?: number; // default: 23, range 0-100 (%)
  length?: number; // default: 300, range 0-300 (%)
  spread?: number; // default: 34, range 0-45 (degrees)
}

export interface AccretionDiscProps {
  background?: string;
  baseColor?: string;
  accentColor?: string;
  density?: number;   // default: 100 (10..100)
  dotSize?: number;   // default: 156 (10..400%)
  speed?: number;     // default: 100 (0..100)
  distance?: number;  // default: 220 (140..420)
  drag?: number;      // default: 100 (0..200%)
  field?: AccretionDiscFieldProps;
  disc?: AccretionDiscDiscProps;
  jets?: AccretionDiscJetsProps;
  style?: React.CSSProperties;
  className?: string;
  onStatsChange?: (stats: { fps: number; particleCount: number }) => void;
}

const TWO_PI = Math.PI * 2;
const MAX_DPR = 2;
const ROUT = 100.0;
const FOV_DEG = 34.0;
const FOCAL = 1.0 / Math.tan((FOV_DEG * Math.PI) / 180.0 / 2.0);
const TE = 1.32;
const YE = 6.0;
const THICKNESS = 2.4;
const WIND = 3.4;
const LE = 2.6;
const WE = 0.45;
const IE = 0.06;
const DE = 0.09;
const OE = 0.0055;
const PE = 0.32;
const UE = 1.75;
const HALO = 1.7;
const ORBIT_RATE = 0.449;
const NE = 0.16;
const ZE = 0.64;
const BASE_PARTICLES = 20000;
const DENSITY_SCALE = 3600;
const TIME_MODULO = 100000;

const VERTEX_SHADER_PARTICLES = `
precision highp float;

// Disc:  x = radial parameter, y = birth angle, z = gaussian height, w = random
// Jet:   x = axial parameter,  y = azimuth,     z = sqrt(rand) radius, w = keep
attribute vec4 aSeed;
// 0 = disc, +1 = jet up, -1 = jet down
attribute float aKind;

uniform float uTime;
uniform float uTilt;
uniform float uAzimuth;
uniform float uDist;
uniform float uAspect;
uniform float uHalfH;
uniform float uDotSize;
uniform float uBlur;
uniform float uScatter;
uniform float uCore;
uniform float uArms;
uniform float uJetAmount;
uniform float uJetLen;
uniform float uJetSpread;

varying float vAlpha;
varying float vRamp;

const float FOCAL = ${FOCAL.toFixed(6)};
const float ROUT = ${ROUT.toFixed(1)};
const float WIND = ${WIND.toFixed(3)};
const float THICKNESS = ${THICKNESS.toFixed(2)};
const float ORBIT = ${ORBIT_RATE.toFixed(4)};

void kill() {
    gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
    gl_PointSize = 0.0;
    vAlpha = 0.0;
    vRamp = 0.0;
}

void main() {
    float rIn = max(uCore * ${TE.toFixed(2)}, ${YE.toFixed(1)});
    vec3 p;
    float bright;
    float ramp;

    if (aKind == 0.0) {
        /* ---- disc ---- */
        float r = sqrt(mix(rIn * rIn, ROUT * ROUT, aSeed.x));
        float f = clamp((r - rIn) / max(ROUT - rIn, 1e-3), 0.0, 1.0);

        float th = aSeed.y + ORBIT * pow(rIn / r, 1.5) * uTime;

        float armAngle = uArms * (th - WIND * log(r / rIn))
                       - ${IE.toFixed(3)} * uTime * min(uArms, 1.0);
        th -= ${WE.toFixed(2)} * sin(armAngle) / max(uArms, 1.0);
        float arm = pow(0.5 + 0.5 * cos(armAngle), ${LE.toFixed(1)});

        float flare = 0.30 + 0.70 * pow(f, 1.2);
        float y = aSeed.z * THICKNESS * uScatter * flare;
        p = vec3(r * cos(th), y, r * sin(th));

        float radial = smoothstep(0.0, 0.06, f) * (1.0 - smoothstep(0.45, 1.0, f));
        radial *= 1.0 + 1.4 * exp(-pow((f - 0.32) / 0.20, 2.0));

        float farSide = 0.5 - 0.5 * (p.z / max(r, 1e-3));

        bright = radial * (0.34 + 0.75 * arm) * mix(0.62, 1.0, farSide) * 1.45;
        ramp = clamp((1.0 - f) * 0.55 + arm * 0.55, 0.0, 1.0);
    } else {
        /* ---- jets ---- */
        if (aSeed.w > uJetAmount) { kill(); return; }

        float u = fract(aSeed.x + ${DE.toFixed(3)} * uTime);
        float climb = pow(u, 1.35) * uJetLen;
        float cone = tan(uJetSpread) * climb * (0.30 + 0.70 * u) + uCore * 0.35;
        float rr = aSeed.z * cone;
        float az = aSeed.y + climb * ${OE.toFixed(4)};
        p = vec3(rr * cos(az), aKind * climb, rr * sin(az));

        bright = mix(1.0, 0.20, smoothstep(0.0, 1.0, u)) * (0.28 + 0.72 * (1.0 - aSeed.z)) * 1.75;
        ramp = 0.30 + 0.40 * (1.0 - u);
    }

    vec3 camPos = uDist * vec3(cos(uTilt) * sin(uAzimuth), sin(uTilt), cos(uTilt) * cos(uAzimuth));
    vec3 camFwd = -normalize(camPos);
    vec3 camRight = normalize(cross(camFwd, vec3(0.0, 1.0, 0.0)));
    vec3 camUp = cross(camRight, camFwd);
    vec3 rel = p - camPos;
    vec3 q = vec3(dot(rel, camRight), dot(rel, camUp), -dot(rel, camFwd));
    float depth = -q.z;
    if (depth < 1.0) { kill(); return; }

    /* ---- analytic occlusion by core sphere ---- */
    float len = length(q);
    vec3 dir = q / max(len, 1e-4);
    float tca = -uDist * dir.z;
    float perp2 = uDist * uDist - tca * tca;
    float core2 = uCore * uCore;
    if (perp2 < core2) {
        float tEnter = tca - sqrt(core2 - perp2);
        if (tEnter > 0.0 && len > tEnter) { kill(); return; }
    }

    gl_Position = vec4((q.x * FOCAL) / (depth * uAspect), (q.y * FOCAL) / depth, 0.0, 1.0);

    float ppw = (FOCAL * uHalfH) / depth;
    float focusD = uDist * ${UE.toFixed(2)};
    float coc = (uBlur * max(0.0, focusD - depth)) / focusD;
    float px = (uDotSize + coc) * ppw * ${HALO.toFixed(2)};

    vAlpha = bright * pow(uDotSize / max(uDotSize + coc, 1e-5), 1.6);
    float optical = px / ${HALO.toFixed(2)};
    if (optical < 1.0) vAlpha *= optical * optical;
    vRamp = ramp;
    gl_PointSize = clamp(px, 1.0, 96.0);
}
`;

const FRAGMENT_SHADER_PARTICLES = `
precision highp float;

uniform vec3 uBase;
uniform vec3 uAccent;

varying float vAlpha;
varying float vRamp;

void main() {
    vec2 d = gl_PointCoord - 0.5;
    float r2 = dot(d, d) * 4.0;
    if (r2 > 1.0) discard;
    float core = max(0.0, exp(-r2 * 9.25) - 0.0000961);
    float skirt = max(0.0, exp(-r2 * 1.80) - 0.165299);
    float g = core + 0.30 * skirt;
    float e = g * vAlpha;
    vec3 col = mix(uBase, uAccent, vRamp);
    gl_FragColor = vec4(col * e, e);
}
`;

const VERTEX_SHADER_CORE = `
precision highp float;

attribute vec2 aQuad;

uniform float uDist;
uniform float uCore;
uniform float uAspect;
uniform float uHalfH;

varying vec2 vUV;
varying float vPxR;

const float FOCAL = ${FOCAL.toFixed(6)};

void main() {
    float tanR = uCore / sqrt(max(uDist * uDist - uCore * uCore, 1.0));
    float ndcR = tanR * FOCAL;
    vUV = aQuad;
    vPxR = ndcR * uHalfH;
    gl_Position = vec4((aQuad.x * ndcR) / uAspect, aQuad.y * ndcR, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER_CORE = `
precision highp float;

uniform vec3 uBase;
uniform vec3 uAccent;
uniform float uTilt;

varying vec2 vUV;
varying float vPxR;

void main() {
    float rr = length(vUV);
    float aa = 1.0 / max(vPxR, 1.0);
    float m = 1.0 - smoothstep(1.0 - aa, 1.0, rr);
    if (m <= 0.0) discard;

    float st = sin(uTilt) * 0.55;
    float dTop = vUV.y - st;
    float dBot = vUV.y + st;
    float ring = 0.40 * exp(-dTop * dTop * 9.0) + 1.0 * exp(-dBot * dBot * 9.0);
    float rim = pow(smoothstep(0.78, 1.0, rr), 1.6);
    float lit = rim * (0.05 + 0.95 * ring * (0.30 + 0.70 * abs(vUV.x)));

    vec3 col = uBase * 0.012 + uAccent * lit * 0.42;
    gl_FragColor = vec4(col * m, m);
}
`;

function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn("AccretionDisc Shader Error:", gl.getShaderInfoLog(shader));
  }
  return shader;
}

function createProgram(gl: WebGLRenderingContext, vs: string, fs: string): WebGLProgram {
  const prog = gl.createProgram()!;
  gl.attachShader(prog, createShader(gl, gl.VERTEX_SHADER, vs));
  gl.attachShader(prog, createShader(gl, gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.warn("AccretionDisc Program Link Error:", gl.getProgramInfoLog(prog));
  }
  return prog;
}

function parseColor(color: string): [number, number, number] {
  if (!color) return [1, 0.4, 0];
  let c = String(color).trim();
  const varMatch = c.match(/^var\(\s*--[^,)]+\s*,\s*(.+)\)\s*$/is);
  if (varMatch) c = varMatch[1].trim();

  const rgbMatch = c.match(/^rgba?\(([^)]+)\)/i);
  if (rgbMatch) {
    const parts = rgbMatch[1].split(/[,\s/]+/).filter(Boolean).map(parseFloat);
    return [(parts[0] || 0) / 255, (parts[1] || 0) / 255, (parts[2] || 0) / 255];
  }

  const hslMatch = c.match(/^hsla?\(([^)]+)\)/i);
  if (hslMatch) {
    const parts = hslMatch[1].split(/[,\s/]+/).filter(Boolean);
    const h = ((parseFloat(parts[0]) || 0) % 360) / 360;
    const s = (parseFloat(parts[1]) || 0) / 100;
    const l = (parseFloat(parts[2]) || 0) / 100;
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const hue2rgb = (t: number) => {
      let x = t;
      if (x < 0) x += 1;
      if (x > 1) x -= 1;
      if (x < 1 / 6) return p + (q - p) * 6 * x;
      if (x < 1 / 2) return q;
      if (x < 2 / 3) return p + (q - p) * (2 / 3 - x) * 6;
      return p;
    };
    return [hue2rgb(h + 1 / 3), hue2rgb(h), hue2rgb(h - 1 / 3)];
  }

  let hex = c.replace("#", "");
  if (hex.length === 3 || hex.length === 4) {
    hex = hex.split("").map((x) => x + x).join("");
  }
  hex = hex.padEnd(6, "0");
  const parseHexChannel = (idx: number) => {
    const v = parseInt(hex.slice(idx, idx + 2), 16);
    return Number.isFinite(v) ? v / 255 : 0;
  };
  return [parseHexChannel(0), parseHexChannel(2), parseHexChannel(4)];
}

function makePrng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 1831565813) | 0;
    let n = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    n = (n + Math.imul(n ^ (n >>> 7), 61 | n)) ^ n;
    return ((n ^ (n >>> 14)) >>> 0) / 4294967296;
  };
}

function gaussian(rng: () => number) {
  const u1 = Math.max(1e-9, rng());
  const u2 = rng();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(TWO_PI * u2);
  return Math.max(-3, Math.min(3, z));
}

function generateParticles(count: number) {
  const seed = new Float32Array(count * 4);
  const kind = new Float32Array(count);
  const rng = makePrng(2654435769);

  for (let i = 0; i < count; i++) {
    const idx = i * 4;
    if (rng() >= PE) {
      // Disc particle
      seed[idx] = rng();
      seed[idx + 1] = rng() * TWO_PI;
      seed[idx + 2] = gaussian(rng);
      seed[idx + 3] = rng();
      kind[i] = 0;
    } else {
      // Jet particle
      seed[idx] = rng();
      seed[idx + 1] = rng() * TWO_PI;
      seed[idx + 2] = Math.sqrt(rng());
      seed[idx + 3] = rng();
      kind[i] = rng() < 0.5 ? 1 : -1;
    }
  }
  return { seed, kind };
}

export const AccretionDisc: React.FC<AccretionDiscProps> = ({
  background = "#000000",
  baseColor = "#FF5F00",
  accentColor = "#ffd9a0",
  density = 100,
  dotSize = 156,
  speed = 100,
  distance = 220,
  drag = 100,
  field = { scatter: 44, blur: 0 },
  disc = { tilt: 44, core: 6, arms: 8 },
  jets = { amount: 23, length: 300, spread: 34 },
  style,
  className,
  onStatsChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const stateRef = useRef({
    base: parseColor(baseColor),
    accent: parseColor(accentColor),
    count: Math.round(BASE_PARTICLES + density * DENSITY_SCALE),
    dotSize: (NE * dotSize) / 100,
    speed,
    distance,
    dragAmount: drag / 100,
    scatter: (field.scatter ?? 44) / 100,
    blur: (ZE * (field.blur ?? 0)) / 100,
    tilt: ((disc.tilt ?? 44) * Math.PI) / 180,
    core: ((disc.core ?? 6) / 100) * ROUT,
    arms: disc.arms ?? 8,
    jetAmount: (jets.amount ?? 23) / 100,
    jetLen: ((jets.length ?? 300) / 100) * ROUT,
    jetSpread: ((jets.spread ?? 34) * Math.PI) / 180,
    azimuth: 0,
    dragTilt: 0,
  });

  // Sync state dynamically on prop change without reinitializing WebGL context
  useEffect(() => {
    const s = stateRef.current;
    s.base = parseColor(baseColor);
    s.accent = parseColor(accentColor);
    s.count = Math.round(BASE_PARTICLES + density * DENSITY_SCALE);
    s.dotSize = (NE * dotSize) / 100;
    s.speed = speed;
    s.distance = distance;
    s.dragAmount = drag / 100;
    s.scatter = (field.scatter ?? 44) / 100;
    s.blur = (ZE * (field.blur ?? 0)) / 100;
    s.tilt = ((disc.tilt ?? 44) * Math.PI) / 180;
    s.core = ((disc.core ?? 6) / 100) * ROUT;
    s.arms = disc.arms ?? 8;
    s.jetAmount = (jets.amount ?? 23) / 100;
    s.jetLen = ((jets.length ?? 300) / 100) * ROUT;
    s.jetSpread = ((jets.spread ?? 34) * Math.PI) / 180;
  }, [baseColor, accentColor, density, dotSize, speed, distance, drag, field, disc, jets]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      premultipliedAlpha: true,
      preserveDrawingBuffer: false,
    });
    if (!gl) {
      console.warn("WebGL is not available");
      return;
    }

    const progParticles = createProgram(gl, VERTEX_SHADER_PARTICLES, FRAGMENT_SHADER_PARTICLES);
    const progCore = createProgram(gl, VERTEX_SHADER_CORE, FRAGMENT_SHADER_CORE);

    // Particle uniforms
    const uP = {
      time: gl.getUniformLocation(progParticles, "uTime"),
      tilt: gl.getUniformLocation(progParticles, "uTilt"),
      azimuth: gl.getUniformLocation(progParticles, "uAzimuth"),
      dist: gl.getUniformLocation(progParticles, "uDist"),
      aspect: gl.getUniformLocation(progParticles, "uAspect"),
      halfH: gl.getUniformLocation(progParticles, "uHalfH"),
      dotSize: gl.getUniformLocation(progParticles, "uDotSize"),
      blur: gl.getUniformLocation(progParticles, "uBlur"),
      scatter: gl.getUniformLocation(progParticles, "uScatter"),
      core: gl.getUniformLocation(progParticles, "uCore"),
      arms: gl.getUniformLocation(progParticles, "uArms"),
      jetAmount: gl.getUniformLocation(progParticles, "uJetAmount"),
      jetLen: gl.getUniformLocation(progParticles, "uJetLen"),
      jetSpread: gl.getUniformLocation(progParticles, "uJetSpread"),
      base: gl.getUniformLocation(progParticles, "uBase"),
      accent: gl.getUniformLocation(progParticles, "uAccent"),
    };

    // Core uniforms
    const uC = {
      dist: gl.getUniformLocation(progCore, "uDist"),
      core: gl.getUniformLocation(progCore, "uCore"),
      aspect: gl.getUniformLocation(progCore, "uAspect"),
      halfH: gl.getUniformLocation(progCore, "uHalfH"),
      base: gl.getUniformLocation(progCore, "uBase"),
      accent: gl.getUniformLocation(progCore, "uAccent"),
      tilt: gl.getUniformLocation(progCore, "uTilt"),
    };

    // Attributes
    const aSeed = gl.getAttribLocation(progParticles, "aSeed");
    const aKind = gl.getAttribLocation(progParticles, "aKind");
    const aQuad = gl.getAttribLocation(progCore, "aQuad");

    // Buffers
    const bufSeed = gl.createBuffer();
    const bufKind = gl.createBuffer();
    const bufQuad = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, bufQuad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    let activeParticles = 0;
    const uploadParticles = (numParticles: number) => {
      const { seed, kind } = generateParticles(numParticles);
      gl.bindBuffer(gl.ARRAY_BUFFER, bufSeed);
      gl.bufferData(gl.ARRAY_BUFFER, seed, gl.STATIC_DRAW);
      gl.bindBuffer(gl.ARRAY_BUFFER, bufKind);
      gl.bufferData(gl.ARRAY_BUFFER, kind, gl.STATIC_DRAW);
      activeParticles = numParticles;
    };

    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);

    // Pointer Drag & Inertia
    const dragData = {
      active: false,
      id: -1,
      lastX: 0,
      lastY: 0,
      velAz: 0,
      velTilt: 0,
    };

    const handlePointerDown = (e: PointerEvent) => {
      dragData.active = true;
      dragData.id = e.pointerId;
      dragData.lastX = e.clientX;
      dragData.lastY = e.clientY;
      dragData.velAz = 0;
      dragData.velTilt = 0;
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!dragData.active || e.pointerId !== dragData.id) return;
      e.preventDefault();
      const dx = e.clientX - dragData.lastX;
      const dy = e.clientY - dragData.lastY;
      dragData.lastX = e.clientX;
      dragData.lastY = e.clientY;

      const sensitivity = 0.006 * stateRef.current.dragAmount;
      dragData.velAz = dx * sensitivity;
      dragData.velTilt = dy * sensitivity;
      stateRef.current.azimuth += dragData.velAz;
      stateRef.current.dragTilt = Math.max(-2, Math.min(2, stateRef.current.dragTilt + dragData.velTilt));
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (e.pointerId === dragData.id) {
        dragData.active = false;
        try {
          canvas.releasePointerCapture(e.pointerId);
        } catch {
          /* ignore */
        }
      }
    };

    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointermove", handlePointerMove, { passive: false });
    canvas.addEventListener("pointerup", handlePointerUp);
    canvas.addEventListener("pointercancel", handlePointerUp);

    // Resize handling
    let vpWidth = 1;
    let vpHeight = 1;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      const w = canvas.clientWidth || container.clientWidth || 0;
      const h = canvas.clientHeight || container.clientHeight || 0;
      const bw = Math.max(1, Math.round(w * dpr));
      const bh = Math.max(1, Math.round(h * dpr));
      if (canvas.width !== bw || canvas.height !== bh) {
        canvas.width = bw;
        canvas.height = bh;
      }
      vpWidth = bw;
      vpHeight = bh;
      gl.viewport(0, 0, bw, bh);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // Render loop & FPS tracking
    let animId = 0;
    let lastTime = 0;
    let clockTime = 0;
    let frameCount = 0;
    let lastFpsTime = performance.now();

    const render = (timeMs: number) => {
      animId = requestAnimationFrame(render);

      const dt = lastTime === 0 ? 0 : Math.min(0.05, Math.max(0, (timeMs - lastTime) / 1000));
      lastTime = timeMs;

      // Stats calculation
      frameCount++;
      if (timeMs - lastFpsTime >= 500) {
        const currentFps = Math.round((frameCount * 1000) / (timeMs - lastFpsTime));
        onStatsChange?.({ fps: currentFps, particleCount: activeParticles });
        frameCount = 0;
        lastFpsTime = timeMs;
      }

      const s = stateRef.current;
      const speedFactor = s.speed / 50.0;
      clockTime = (clockTime + dt * speedFactor) % TIME_MODULO;

      if (activeParticles !== s.count) {
        uploadParticles(s.count);
      }

      // Inertial damping
      if (!dragData.active) {
        s.azimuth += dragData.velAz;
        s.dragTilt = Math.max(-2, Math.min(2, s.dragTilt + dragData.velTilt));
        dragData.velAz *= 0.94;
        dragData.velTilt *= 0.94;
        if (Math.abs(dragData.velAz) < 1e-5) dragData.velAz = 0;
        if (Math.abs(dragData.velTilt) < 1e-5) dragData.velTilt = 0;
      }
      s.azimuth = ((s.azimuth % TWO_PI) + TWO_PI) % TWO_PI;

      const maxTilt = (85 * Math.PI) / 180;
      const currentTilt = Math.max(-maxTilt, Math.min(maxTilt, s.tilt + s.dragTilt));
      const aspect = vpWidth / Math.max(vpHeight, 1);
      const halfH = vpHeight * 0.5;

      // Clear
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      // Pass 1: Render Core Sphere (Premultiplied alpha)
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.useProgram(progCore);
      gl.uniform1f(uC.dist, s.distance);
      gl.uniform1f(uC.core, s.core);
      gl.uniform1f(uC.aspect, aspect);
      gl.uniform1f(uC.halfH, halfH);
      gl.uniform1f(uC.tilt, currentTilt);
      gl.uniform3fv(uC.base, s.base);
      gl.uniform3fv(uC.accent, s.accent);

      gl.bindBuffer(gl.ARRAY_BUFFER, bufQuad);
      gl.enableVertexAttribArray(aQuad);
      gl.vertexAttribPointer(aQuad, 2, gl.FLOAT, false, 0, 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      gl.disableVertexAttribArray(aQuad);

      // Pass 2: Render Additive Particles
      gl.blendFunc(gl.ONE, gl.ONE);
      gl.useProgram(progParticles);
      gl.uniform1f(uP.time, clockTime);
      gl.uniform1f(uP.tilt, currentTilt);
      gl.uniform1f(uP.azimuth, s.azimuth);
      gl.uniform1f(uP.dist, s.distance);
      gl.uniform1f(uP.aspect, aspect);
      gl.uniform1f(uP.halfH, halfH);
      gl.uniform1f(uP.dotSize, s.dotSize);
      gl.uniform1f(uP.blur, s.blur);
      gl.uniform1f(uP.scatter, s.scatter);
      gl.uniform1f(uP.core, s.core);
      gl.uniform1f(uP.arms, s.arms);
      gl.uniform1f(uP.jetAmount, s.jetAmount);
      gl.uniform1f(uP.jetLen, s.jetLen);
      gl.uniform1f(uP.jetSpread, s.jetSpread);
      gl.uniform3fv(uP.base, s.base);
      gl.uniform3fv(uP.accent, s.accent);

      gl.bindBuffer(gl.ARRAY_BUFFER, bufSeed);
      gl.enableVertexAttribArray(aSeed);
      gl.vertexAttribPointer(aSeed, 4, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, bufKind);
      gl.enableVertexAttribArray(aKind);
      gl.vertexAttribPointer(aKind, 1, gl.FLOAT, false, 0, 0);

      gl.drawArrays(gl.POINTS, 0, activeParticles);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerup", handlePointerUp);
      canvas.removeEventListener("pointercancel", handlePointerUp);
      gl.deleteProgram(progParticles);
      gl.deleteProgram(progCore);
      gl.deleteBuffer(bufSeed);
      gl.deleteBuffer(bufKind);
      gl.deleteBuffer(bufQuad);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        backgroundColor: background,
        ...style,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          display: "block",
          touchAction: "none",
          cursor: "grab",
        }}
      />
    </div>
  );
};

export default AccretionDisc;
