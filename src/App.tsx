import React, { useState } from 'react';
import AccretionDisc from './components/originkit/accretion-disc';
import { 
  Sparkles, 
  Sliders, 
  Maximize2, 
  RotateCcw, 
  Code2, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Copy, 
  Compass, 
  Layers, 
  Flame, 
  Palette,
  Eye,
  EyeOff
} from 'lucide-react';

interface PresetConfig {
  name: string;
  icon: string;
  desc: string;
  baseColor: string;
  accentColor: string;
  density: number;
  dotSize: number;
  speed: number;
  distance: number;
  arms: number;
  tilt: number;
  core: number;
  jetAmount: number;
  jetLen: number;
  jetSpread: number;
  scatter: number;
  blur: number;
}

const PRESETS: PresetConfig[] = [
  {
    name: 'Gargantua',
    icon: '🪐',
    desc: 'Deep orange Interstellar black hole with golden spiral arms',
    baseColor: '#FF5F00',
    accentColor: '#ffd9a0',
    density: 100,
    dotSize: 156,
    speed: 100,
    distance: 220,
    arms: 8,
    tilt: 44,
    core: 6,
    jetAmount: 23,
    jetLen: 300,
    jetSpread: 34,
    scatter: 44,
    blur: 0,
  },
  {
    name: 'Quasar Cyan',
    icon: '⚡',
    desc: 'High-energy relativistic jet with electric blue plasma',
    baseColor: '#0052ff',
    accentColor: '#00ffff',
    density: 95,
    dotSize: 140,
    speed: 120,
    distance: 210,
    arms: 6,
    tilt: 35,
    core: 8,
    jetAmount: 70,
    jetLen: 300,
    jetSpread: 22,
    scatter: 30,
    blur: 0,
  },
  {
    name: 'Blood Eclipse',
    icon: '🩸',
    desc: 'Ominous crimson event horizon with dense inner crowding',
    baseColor: '#e61919',
    accentColor: '#ffaa33',
    density: 100,
    dotSize: 170,
    speed: 80,
    distance: 230,
    arms: 4,
    tilt: 55,
    core: 12,
    jetAmount: 15,
    jetLen: 220,
    jetSpread: 18,
    scatter: 25,
    blur: 0,
  },
  {
    name: 'Singularity Violet',
    icon: '🔮',
    desc: 'Mystic neon purple cosmic vacuum with luminous dust halo',
    baseColor: '#7928ca',
    accentColor: '#ff0080',
    density: 90,
    dotSize: 160,
    speed: 90,
    distance: 240,
    arms: 7,
    tilt: 40,
    core: 7,
    jetAmount: 40,
    jetLen: 280,
    jetSpread: 30,
    scatter: 55,
    blur: 20,
  },
  {
    name: 'Solar Corona',
    icon: '☀️',
    desc: 'Golden white hot accretion disk with hyper-bright flares',
    baseColor: '#ff8800',
    accentColor: '#ffffff',
    density: 100,
    dotSize: 180,
    speed: 110,
    distance: 200,
    arms: 8,
    tilt: 48,
    core: 5,
    jetAmount: 35,
    jetLen: 300,
    jetSpread: 28,
    scatter: 40,
    blur: 10,
  },
];

export default function App() {
  const [currentPreset, setCurrentPreset] = useState<string>('Gargantua');
  const [baseColor, setBaseColor] = useState<string>('#FF5F00');
  const [accentColor, setAccentColor] = useState<string>('#ffd9a0');
  const [density, setDensity] = useState<number>(100);
  const [dotSize, setDotSize] = useState<number>(156);
  const [speed, setSpeed] = useState<number>(100);
  const [distance, setDistance] = useState<number>(220);
  const [drag, setDrag] = useState<number>(100);

  const [arms, setArms] = useState<number>(8);
  const [tilt, setTilt] = useState<number>(44);
  const [core, setCore] = useState<number>(6);

  const [jetAmount, setJetAmount] = useState<number>(23);
  const [jetLen, setJetLen] = useState<number>(300);
  const [jetSpread, setJetSpread] = useState<number>(34);

  const [scatter, setScatter] = useState<number>(44);
  const [blur, setBlur] = useState<number>(0);

  const [showControls, setShowControls] = useState<boolean>(true);
  const [showCodeModal, setShowCodeModal] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [stats, setStats] = useState({ fps: 60, particleCount: 380000 });

  const applyPreset = (p: PresetConfig) => {
    setCurrentPreset(p.name);
    setBaseColor(p.baseColor);
    setAccentColor(p.accentColor);
    setDensity(p.density);
    setDotSize(p.dotSize);
    setSpeed(p.speed);
    setDistance(p.distance);
    setArms(p.arms);
    setTilt(p.tilt);
    setCore(p.core);
    setJetAmount(p.jetAmount);
    setJetLen(p.jetLen);
    setJetSpread(p.jetSpread);
    setScatter(p.scatter);
    setBlur(p.blur);
  };

  const handleCopy = () => {
    const codeSnippet = `<AccretionDisc
  baseColor="${baseColor}"
  accentColor="${accentColor}"
  density={${density}}
  dotSize={${dotSize}}
  speed={${speed}}
  distance={${distance}}
  drag={${drag}}
  disc={{ tilt: ${tilt}, core: ${core}, arms: ${arms} }}
  jets={{ amount: ${jetAmount}, length: ${jetLen}, spread: ${jetSpread} }}
  field={{ scatter: ${scatter}, blur: ${blur} }}
/>`;
    navigator.clipboard.writeText(codeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <main className="relative w-full h-screen overflow-hidden bg-black text-white select-none">
      {/* 3D Black Hole Background Simulation */}
      <div className="absolute inset-0 z-0">
        <AccretionDisc
          background="#000000"
          baseColor={baseColor}
          accentColor={accentColor}
          density={density}
          dotSize={dotSize}
          speed={speed}
          distance={distance}
          drag={drag}
          field={{ scatter, blur }}
          disc={{ tilt, core, arms }}
          jets={{ amount: jetAmount, length: jetLen, spread: jetSpread }}
          onStatsChange={setStats}
        />
      </div>

      {/* Top Floating Header HUD */}
      <header className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        {/* Logo & Info */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="glass-panel px-3.5 py-2 rounded-xl flex items-center gap-2.5 shadow-xl">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 glow-beacon" />
            <span className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
              Originkit <span className="text-zinc-400 font-normal">/</span> Accretion Disc
            </span>
            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/10 text-zinc-300 font-semibold">
              WebGL Shaders
            </span>
          </div>

          {/* Performance readout */}
          <div className="hidden sm:flex items-center gap-3 px-3 py-2 rounded-xl glass-panel text-xs font-mono text-zinc-300">
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              {stats.fps} FPS
            </span>
            <span className="text-zinc-600">|</span>
            <span className="text-amber-400">
              {stats.particleCount.toLocaleString()} particles
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => applyPreset(PRESETS[0])}
            title="Reset to default"
            className="p-2.5 rounded-xl glass-panel text-zinc-400 hover:text-white hover:bg-white/10 transition active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowCodeModal(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl glass-panel text-xs font-medium text-zinc-200 hover:text-white hover:bg-white/10 transition active:scale-95 shadow-lg"
          >
            <Code2 className="w-4 h-4 text-amber-400" />
            <span className="hidden md:inline">Component Code</span>
          </button>

          <button
            onClick={toggleFullscreen}
            title="Toggle Fullscreen"
            className="p-2.5 rounded-xl glass-panel text-zinc-400 hover:text-white hover:bg-white/10 transition active:scale-95"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowControls(!showControls)}
            className={`p-2.5 rounded-xl glass-panel transition active:scale-95 ${
              showControls ? 'text-amber-400 bg-amber-500/10 border-amber-500/30' : 'text-zinc-400 hover:text-white'
            }`}
            title={showControls ? 'Hide Controls' : 'Show Controls'}
          >
            {showControls ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Preset Pills (Bottom Center) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-auto flex items-center gap-1.5 p-1.5 rounded-2xl glass-panel max-w-[95vw] overflow-x-auto custom-scroll shadow-2xl">
        {PRESETS.map((p) => {
          const isActive = currentPreset === p.name;
          return (
            <button
              key={p.name}
              onClick={() => applyPreset(p)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-orange-500/25 scale-[1.02]'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5'
              }`}
            >
              <span>{p.icon}</span>
              <span>{p.name}</span>
            </button>
          );
        })}
      </div>

      {/* Drag camera hint */}
      <div className="absolute top-20 left-4 z-10 pointer-events-none hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/40 backdrop-blur-md border border-white/5 text-[11px] text-zinc-400">
        <Compass className="w-3.5 h-3.5 text-zinc-500 animate-spin" style={{ animationDuration: '10s' }} />
        <span>Drag mouse or touch anywhere to orbit camera in 3D</span>
      </div>

      {/* Controls Sidebar Drawer */}
      <aside
        className={`absolute top-20 right-4 bottom-24 w-80 z-20 glass-panel rounded-2xl p-5 overflow-y-auto custom-scroll flex flex-col gap-5 transition-all duration-300 pointer-events-auto shadow-2xl ${
          showControls ? 'translate-x-0 opacity-100' : 'translate-x-[110%] opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-zinc-300">
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            Accretion Parameters
          </div>
          <button 
            onClick={() => setShowControls(false)}
            className="text-zinc-500 hover:text-zinc-300 text-xs"
          >
            ✕
          </button>
        </div>

        {/* Group 1: Colors */}
        <section className="flex flex-col gap-3">
          <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <Palette className="w-3 h-3 text-amber-400" />
            Color Spectrum
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <div className="glass-subpanel p-2.5 rounded-xl flex items-center justify-between">
              <span className="text-xs text-zinc-300 font-medium">Base Dust</span>
              <input
                type="color"
                value={baseColor}
                onChange={(e) => {
                  setBaseColor(e.target.value);
                  setCurrentPreset('Custom');
                }}
              />
            </div>
            <div className="glass-subpanel p-2.5 rounded-xl flex items-center justify-between">
              <span className="text-xs text-zinc-300 font-medium">Crest Rim</span>
              <input
                type="color"
                value={accentColor}
                onChange={(e) => {
                  setAccentColor(e.target.value);
                  setCurrentPreset('Custom');
                }}
              />
            </div>
          </div>
        </section>

        {/* Group 2: Disc & Spiral Arms */}
        <section className="flex flex-col gap-3">
          <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <Layers className="w-3 h-3 text-amber-400" />
            Disc & Spiral Lanes
          </div>

          <div className="glass-subpanel p-3 rounded-xl flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-300">Spiral Arms</span>
                <span className="font-mono text-amber-400">{arms}</span>
              </div>
              <input
                type="range"
                min="0"
                max="8"
                step="1"
                value={arms}
                onChange={(e) => {
                  setArms(parseInt(e.target.value));
                  setCurrentPreset('Custom');
                }}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-300">Core Shadow Radius</span>
                <span className="font-mono text-amber-400">{core}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                step="1"
                value={core}
                onChange={(e) => {
                  setCore(parseInt(e.target.value));
                  setCurrentPreset('Custom');
                }}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-300">Disc Elevation Tilt</span>
                <span className="font-mono text-amber-400">{tilt}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="85"
                step="1"
                value={tilt}
                onChange={(e) => {
                  setTilt(parseInt(e.target.value));
                  setCurrentPreset('Custom');
                }}
              />
            </div>
          </div>
        </section>

        {/* Group 3: Polar Jets */}
        <section className="flex flex-col gap-3">
          <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <Flame className="w-3 h-3 text-cyan-400" />
            Relativistic Polar Jets
          </div>

          <div className="glass-subpanel p-3 rounded-xl flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-300">Jet Quantity</span>
                <span className="font-mono text-cyan-400">{jetAmount}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={jetAmount}
                onChange={(e) => {
                  setJetAmount(parseInt(e.target.value));
                  setCurrentPreset('Custom');
                }}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-300">Beam Height</span>
                <span className="font-mono text-cyan-400">{jetLen}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="300"
                step="5"
                value={jetLen}
                onChange={(e) => {
                  setJetLen(parseInt(e.target.value));
                  setCurrentPreset('Custom');
                }}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-300">Cone Flare Spread</span>
                <span className="font-mono text-cyan-400">{jetSpread}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="45"
                step="1"
                value={jetSpread}
                onChange={(e) => {
                  setJetSpread(parseInt(e.target.value));
                  setCurrentPreset('Custom');
                }}
              />
            </div>
          </div>
        </section>

        {/* Group 4: Particle Field & Motion */}
        <section className="flex flex-col gap-3">
          <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-purple-400" />
            Particle Dynamics
          </div>

          <div className="glass-subpanel p-3 rounded-xl flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-300">Density</span>
                <span className="font-mono text-purple-400">{density}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="1"
                value={density}
                onChange={(e) => {
                  setDensity(parseInt(e.target.value));
                  setCurrentPreset('Custom');
                }}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-300">Dot Size</span>
                <span className="font-mono text-purple-400">{dotSize}%</span>
              </div>
              <input
                type="range"
                min="40"
                max="300"
                step="2"
                value={dotSize}
                onChange={(e) => {
                  setDotSize(parseInt(e.target.value));
                  setCurrentPreset('Custom');
                }}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-300">Orbit Velocity</span>
                <span className="font-mono text-purple-400">{speed}</span>
              </div>
              <input
                type="range"
                min="0"
                max="200"
                step="2"
                value={speed}
                onChange={(e) => {
                  setSpeed(parseInt(e.target.value));
                  setCurrentPreset('Custom');
                }}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-300">Vertical Scatter</span>
                <span className="font-mono text-purple-400">{scatter}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="200"
                step="1"
                value={scatter}
                onChange={(e) => {
                  setScatter(parseInt(e.target.value));
                  setCurrentPreset('Custom');
                }}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-300">Bokeh Blur (DOF)</span>
                <span className="font-mono text-purple-400">{blur}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={blur}
                onChange={(e) => {
                  setBlur(parseInt(e.target.value));
                  setCurrentPreset('Custom');
                }}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-300">Camera Pullback</span>
                <span className="font-mono text-purple-400">{distance}</span>
              </div>
              <input
                type="range"
                min="140"
                max="400"
                step="2"
                value={distance}
                onChange={(e) => {
                  setDistance(parseInt(e.target.value));
                  setCurrentPreset('Custom');
                }}
              />
            </div>
          </div>
        </section>
      </aside>

      {/* Code Modal */}
      {showCodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-2xl glass-panel rounded-2xl p-6 flex flex-col gap-5 border border-white/15 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base text-white">Using Accretion Disc Component</h3>
              </div>
              <button
                onClick={() => setShowCodeModal(false)}
                className="text-zinc-400 hover:text-white text-sm p-1"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-4 text-xs">
              <div>
                <p className="text-zinc-300 mb-2">
                  1. The component is fully implemented at <code className="text-amber-400 font-mono">src/components/originkit/accretion-disc.tsx</code>. It has zero external dependencies besides React.
                </p>
                <p className="text-zinc-400">
                  2. Here is the JSX snippet with your currently tweaked values:
                </p>
              </div>

              <div className="relative bg-zinc-950/90 border border-white/10 rounded-xl p-4 font-mono text-[11px] text-zinc-300 overflow-x-auto">
                <pre>{`<AccretionDisc
  background="#000000"
  baseColor="${baseColor}"
  accentColor="${accentColor}"
  density={${density}}
  dotSize={${dotSize}}
  speed={${speed}}
  distance={${distance}}
  drag={${drag}}
  field={{ scatter: ${scatter}, blur: ${blur} }}
  disc={{ tilt: ${tilt}, core: ${core}, arms: ${arms} }}
  jets={{ amount: ${jetAmount}, length: ${jetLen}, spread: ${jetSpread} }}
/>`}</pre>
                <button
                  onClick={handleCopy}
                  className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition active:scale-95 text-[11px]"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Props</span>
                    </>
                  )}
                </button>
              </div>

              <div className="glass-subpanel p-3 rounded-xl flex flex-col gap-1.5 text-zinc-400">
                <span className="font-bold text-zinc-200">ℹ️ About the CLI Command:</span>
                <span>
                  <code className="text-amber-400 font-mono">bunx --bun originkit@latest add accretion-disc</code> (or <code className="text-amber-400 font-mono">npx originkit add accretion-disc</code>) requires an account API key from Originkit. Because we extracted the exact shader mathematics directly, this component is 100% free and ready in this project without needing an account.
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowCodeModal(false)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
