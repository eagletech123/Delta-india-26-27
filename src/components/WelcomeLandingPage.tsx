import React, { useState, useEffect } from 'react';
import { 
  Hexagon, 
  Moon, 
  Sun, 
  Play, 
  Zap, 
  GitMerge, 
  Cpu, 
  Activity,
  Award,
  Sparkles,
  Layers,
  TrendingUp,
  CircleDot,
  Check,
  Send,
  ArrowRight,
  Clock,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  Tv,
  Coins,
  History,
  Grid3X3,
  X,
  Mail,
  Sliders,
  Lock
} from 'lucide-react';

interface WelcomeLandingPageProps {
  onLaunchTerminal: () => void;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  paletteKey: 'cyber' | 'aurora' | 'inferno' | 'arctic' | 'matrix' | 'sakura';
  setPaletteKey: (key: 'cyber' | 'aurora' | 'inferno' | 'arctic' | 'matrix' | 'sakura') => void;
  palette: any;
  isLoggedIn: boolean;
  setIsLoggedIn: (loggedIn: boolean) => void;
}

export default function WelcomeLandingPage({ 
  onLaunchTerminal, 
  isDark, 
  setIsDark,
  paletteKey,
  setPaletteKey,
  palette,
  isLoggedIn,
  setIsLoggedIn
}: WelcomeLandingPageProps) {
  const [selectedCoinTab, setSelectedCoinTab] = useState<'BTC' | 'ETH'>('BTC');

  // Interactive Live Price WALK
  const [btcPrice, setBtcPrice] = useState<number>(64230.50);
  const [ethPrice, setEthPrice] = useState<number>(3450.20);
  const [solPrice, setSolPrice] = useState<number>(178.40);

  // Price ticks direction trackers for flashing indicators
  const [btcDirection, setBtcDirection] = useState<'up' | 'down' | 'flat'>('flat');
  const [ethDirection, setEthDirection] = useState<'up' | 'down' | 'flat'>('flat');
  const [solDirection, setSolDirection] = useState<'up' | 'down' | 'flat'>('flat');

  // Secure HMS Login Gateway states
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [loginEmail, setLoginEmail] = useState<string>(() => {
    return localStorage.getItem("delta_email") || "india.eagletech@gmail.com";
  });
  const [loginApiKey, setLoginApiKey] = useState<string>(() => {
    return localStorage.getItem("delta_api_key") || "dx_ind_8f92aef10e73b22108749a9fb02a";
  });
  const [loginApiSecret, setLoginApiSecret] = useState<string>(() => {
    return localStorage.getItem("delta_api_secret") || "sec_sha256_e10982df45a201cc88496fac110e9dfbc72ea6";
  });
  const [showSecret, setShowSecret] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [connectStage, setConnectStage] = useState<string>("");

  useEffect(() => {
    const timer = setInterval(() => {
      setBtcPrice((prev) => {
        const next = parseFloat((prev + (Math.random() - 0.5) * 32).toFixed(2));
        setBtcDirection(next >= prev ? 'up' : 'down');
        setTimeout(() => setBtcDirection('flat'), 900);
        return next;
      });
      setEthPrice((prev) => {
        const next = parseFloat((prev + (Math.random() - 0.5) * 4).toFixed(2));
        setEthDirection(next >= prev ? 'up' : 'down');
        setTimeout(() => setEthDirection('flat'), 900);
        return next;
      });
      setSolPrice((prev) => {
        const next = parseFloat((prev + (Math.random() - 0.5) * 0.8).toFixed(2));
        setSolDirection(next >= prev ? 'up' : 'down');
        setTimeout(() => setSolDirection('flat'), 900);
        return next;
      });
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  // Secure launch gateway action helper
  const handleLaunchAttempt = () => {
    if (isLoggedIn) {
      onLaunchTerminal();
    } else {
      setShowLoginModal(true);
    }
  };

  // Secure authentic credentials validation simulator
  const handleConnectGateway = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginApiKey || !loginApiSecret) return;

    setIsConnecting(true);
    setConnectStage("1. Initializing secure handshake sequence with Delta India node cluster...");

    setTimeout(() => {
      setConnectStage("2. Sending cryptographically signed HMAC authorization payloads...");
    }, 550);

    setTimeout(() => {
      setConnectStage("3. Verifying signature checksum and token scopes...");
    }, 1100);

    setTimeout(() => {
      setConnectStage("4. Key validated successfully! Syncing Web App data connectors...");
    }, 1500);

    setTimeout(() => {
      localStorage.setItem("delta_email", loginEmail);
      localStorage.setItem("delta_api_key", loginApiKey);
      localStorage.setItem("delta_api_secret", loginApiSecret);
      localStorage.setItem("delta_is_logged_in", "true");
      setIsLoggedIn(true);
      setIsConnecting(false);
      setShowLoginModal(false);
      onLaunchTerminal();
    }, 1900);
  };

  const handleLogout = () => {
    localStorage.removeItem("delta_is_logged_in");
    setIsLoggedIn(false);
  };

  // Adaptive reactive styling props based on themes & modes
  const customBg = isDark ? (palette?.bgDark || '#06060e') : (palette?.bgLight || '#f4f6fc');
  const customCard = isDark ? (palette?.cardDark || '#080c1a') : (palette?.cardLight || '#ffffff');
  const customBorder = isDark ? (palette?.borderDark || 'rgba(255,255,255,0.08)') : (palette?.borderLight || 'rgba(15,23,42,0.08)');
  const customText = isDark ? (palette?.textDark || '#f0f4ff') : (palette?.textLight || '#0d1020');
  const customTextSec = isDark ? 'text-neutral-400' : 'text-slate-600';
  const customTextMuted = isDark ? 'text-neutral-500' : 'text-slate-400';
  const primaryColor = palette?.primary || '#00e5ff';
  const secondaryColor = palette?.secondary || '#9b5de5';
  const accentColor = palette?.accent || '#f72585';

  return (
    <div id="landing-page-root" className="w-full relative overflow-x-hidden font-sans transition-colors duration-300 min-h-screen selection:bg-[#00e5ff] selection:text-black" style={{ backgroundColor: customBg, color: customText }}>
      {/* Styles Injection for Animation Keyframes */}
      <style>{`
        .scanlines::after {
          content: "";
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 0, 0, 0.04) 2px,
            rgba(0, 0, 0, 0.04) 4px
          );
          pointer-events: none;
          z-index: 1;
        }
        .glow-border-anim {
          background: linear-gradient(
            90deg,
            #00e5ff,
            #9b5de5,
            #f72585,
            #0dff8c,
            #00e5ff
          );
          background-size: 300% 100%;
          animation: borderSlide 4s linear infinite;
        }
        @keyframes borderSlide {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 300% 50%;
          }
        }
        .feature-card::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.04) 0%,
            transparent 60%
          );
          pointer-events: none;
        }
        .ticker-track {
          display: flex;
          gap: 3rem;
          animation: tickerScroll 30s linear infinite;
          white-space: nowrap;
        }
        @keyframes tickerScroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .pulse-dot {
          animation: pulseDot 2s ease-in-out infinite;
        }
        @keyframes pulseDot {
          0%,
          100% {
            box-shadow: 0 0 0 0 rgba(13, 255, 140, 0.5);
          }
          50% {
            box-shadow: 0 0 0 6px rgba(13, 255, 140, 0);
          }
        }
        .chart-line {
          stroke-dasharray: 300;
          stroke-dashoffset: 300;
          animation: drawLine 2.2s ease-out forwards;
        }
        @keyframes drawLine {
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>

      {/* Decorative ambient gradients */}
      <div className="absolute top-[-15%] left-[-5%] w-[45%] h-[55%] rounded-full blur-[160px] pointer-events-none bg-[#00e5ff]/10"></div>
      <div className="absolute top-[10%] right-[-8%] w-[40%] h-[40%] rounded-full blur-[140px] pointer-events-none bg-[#9b5de5]/10"></div>
      <div className="absolute top-[60%] left-[30%] w-[35%] h-[35%] rounded-full blur-[120px] pointer-events-none bg-[#f72585]/5"></div>
      <div className="absolute top-[80%] right-[10%] w-[25%] h-[30%] rounded-full blur-[100px] pointer-events-none bg-[#0dff8c]/5"></div>

      {/* Grid overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 229, 255, 0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 229, 255, 0.04) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px'
        }}
      ></div>

      {/* Nav */}
      <nav 
        className="relative z-30 flex items-center justify-between px-6 md:px-12 py-5 border-b transition-colors duration-300"
        style={{ 
          backgroundColor: isDark ? 'rgba(6, 6, 14, 0.8)' : 'rgba(255, 255, 255, 0.85)', 
          borderColor: customBorder,
          backdropFilter: 'blur(20px)'
        }}
      >
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 flex items-center justify-center">
            <div className="absolute inset-0 glow-border-anim rounded-md p-[2px]">
              <div 
                className="w-full h-full rounded-md flex items-center justify-center transition-colors"
                style={{ backgroundColor: isDark ? '#06060e' : '#ffffff' }}
              >
                <Hexagon className="h-5 w-5" style={{ color: primaryColor }} />
              </div>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-headings font-black text-lg tracking-[0.15em] leading-none font-mono" style={{ color: isDark ? '#ffffff' : '#0d1020' }}>
              NexusTerminal
            </span>
            <span className="text-[8px] font-mono tracking-[0.25em] uppercase font-bold mt-0.5" style={{ color: primaryColor }}>
              AI Algo Suite v2.0
            </span>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-8 text-neutral-400 font-mono text-[11px] uppercase tracking-wider font-bold">
          <a href="#features-section" className="hover:text-white transition cursor-pointer" style={{ color: isDark ? undefined : '#475569' }}>Features</a>
          <a href="#strategies-section" className="hover:text-white transition cursor-pointer" style={{ color: isDark ? undefined : '#475569' }}>Strategies</a>
          <a href="#pricing-section" className="hover:text-white transition cursor-pointer" style={{ color: isDark ? undefined : '#475569' }}>Pricing</a>
          <a href="#landing-page-root" className="hover:text-white transition cursor-pointer" style={{ color: isDark ? undefined : '#475569' }}>Documentation</a>
        </div>

        <div className="flex items-center gap-4">
          {/* Light/Dark Toggle */}
          <div 
            className="flex items-center gap-1 border rounded-full p-1 transition-colors"
            style={{ 
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', 
              borderColor: customBorder 
            }}
          >
            <button 
              onClick={() => setIsDark(true)}
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer`}
              style={{
                backgroundColor: isDark ? `${primaryColor}20` : 'transparent',
                color: isDark ? primaryColor : '#94a3b8'
              }}
              title="Dark Mode"
            >
              <Moon className="h-3.5 w-3.5" />
            </button>
            <button 
              onClick={() => setIsDark(false)}
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer`}
              style={{
                backgroundColor: !isDark ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
                color: !isDark ? '#d97706' : '#94a3b8'
              }}
              title="Light Mode"
            >
              <Sun className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Theme Color Dots switch triggers */}
          <div 
            className="hidden sm:flex items-center gap-1.5 border rounded-full p-1 bg-black/30"
            style={{ borderColor: customBorder }}
          >
            {[
              { id: 'cyber', color: '#EFFF00', label: 'Cyber Volt' },
              { id: 'aurora', color: '#8B5CF6', label: 'Aurora' },
              { id: 'sakura', color: '#EC4899', label: 'Sakura' },
              { id: 'matrix', color: '#22C55E', label: 'Matrix' },
              { id: 'inferno', color: '#F97316', label: 'Inferno' },
              { id: 'arctic', color: '#06B6D4', label: 'Arctic Blue' }
            ].map((dot) => {
              const isSelected = paletteKey === dot.id;
              return (
                <button
                  key={dot.id}
                  onClick={() => setPaletteKey(dot.id as any)}
                  className={`w-4 h-4 rounded-full transition-all duration-300 relative flex items-center justify-center cursor-pointer hover:scale-120`}
                  style={{ 
                    backgroundColor: dot.color,
                    boxShadow: isSelected ? `0 0 8px ${dot.color}` : 'none',
                    border: isSelected ? '2px solid white' : '1px solid rgba(255,255,255,0.2)',
                  }}
                  title={dot.label}
                >
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                </button>
              );
            })}
          </div>

          {/* User Auth Info & Disconnect */}
          {isLoggedIn ? (
            <div className="flex items-center gap-3 bg-[#0dff8c]/10 border border-[#0dff8c]/30 px-3 py-1.5 rounded-sm">
              <span className="w-2 h-2 rounded bg-[#0dff8c] animate-pulse" />
              <div className="flex flex-col text-left">
                <span className="text-[9px] font-mono text-[#0dff8c] font-black tracking-wider leading-none">CONNECTED</span>
                <span className="text-[8px] font-mono text-neutral-400 truncate max-w-[100px] mt-0.5 leading-none">{loginEmail}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="text-[9px] font-mono uppercase bg-black hover:bg-slate-900 border border-white/10 text-neutral-300 px-1.5 py-0.5 rounded cursor-pointer transition text-center"
                title="Disconnect from Server Gateways"
              >
                Log out
              </button>
            </div>
          ) : (
            <div className="hidden md:flex flex-col text-right pr-1">
              <span className="text-[9px] font-mono text-rose-500 font-bold tracking-wider leading-none">LOCKED</span>
              <span className="text-[8px] font-mono text-neutral-500 mt-0.5 leading-none">Feeds Off</span>
            </div>
          )}

          <button 
            onClick={handleLaunchAttempt}
            className="relative overflow-hidden px-5 py-2.5 text-xs font-black uppercase tracking-widest text-black hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer font-mono"
            style={{ 
              backgroundColor: primaryColor,
              boxShadow: `0 0 18px ${primaryColor}45`
            }}
          >
            <span className="relative z-10 font-bold">Launch Terminal</span>
          </button>
        </div>
      </nav>

      {/* Marquee ticker */}
      <div className="relative z-20 overflow-hidden bg-black/60 border-b border-white/5 py-3">
        <div className="ticker-track">
          {[1, 2].map((group) => (
            <React.Fragment key={`ticker-group-${group}`}>
              <div className="flex items-center gap-2 shrink-0">
                <CircleDot className="h-2 w-2 text-[#0dff8c] animate-pulse" />
                <span className="font-mono text-xs font-black text-white px-1">BTC/USDT</span>
                <span className={`font-mono text-xs transition-all duration-300 px-1 py-0.5 rounded ${
                  btcDirection === 'up' 
                    ? 'bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20' 
                    : btcDirection === 'down' 
                      ? 'bg-rose-500/10 text-rose-400 font-bold border border-rose-500/20' 
                      : 'text-neutral-400'
                }`}>
                  ${btcPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="font-mono text-xs font-bold text-[#0dff8c]">+2.45%</span>
                <span className="text-white/10 px-4">|</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <CircleDot className="h-2 w-2 text-rose-500" />
                <span className="font-mono text-xs font-black text-white px-1">ETH/USDT</span>
                <span className={`font-mono text-xs transition-all duration-300 px-1 py-0.5 rounded ${
                  ethDirection === 'up' 
                    ? 'bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20' 
                    : ethDirection === 'down' 
                      ? 'bg-rose-500/10 text-rose-400 font-bold border border-rose-500/20' 
                      : 'text-neutral-400'
                }`}>
                  ${ethPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="font-mono text-xs font-bold text-rose-500">-0.83%</span>
                <span className="text-white/10 px-4">|</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <CircleDot className="h-2 w-2 text-[#0dff8c] animate-pulse" />
                <span className="font-mono text-xs font-black text-white px-1">SOL/USDT</span>
                <span className={`font-mono text-xs transition-all duration-300 px-1 py-0.5 rounded ${
                  solDirection === 'up' 
                    ? 'bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20' 
                    : solDirection === 'down' 
                      ? 'bg-rose-500/10 text-rose-400 font-bold border border-rose-500/20' 
                      : 'text-neutral-400'
                }`}>
                  ${solPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="font-mono text-xs font-bold text-[#0dff8c]">+5.12%</span>
                <span className="text-white/10 px-4">|</span>
              </div>
              <div className="flex items-center gap-group shrink-0">
                <CircleDot className="h-2 w-2 text-[#0dff8c] animate-pulse" />
                <span className="font-mono text-xs font-black text-white px-1">BNB/USDT</span>
                <span className="font-mono text-xs text-neutral-400">$595.80</span>
                <span className="font-mono text-xs font-bold text-[#0dff8c]">+1.20%</span>
                <span className="text-white/10 px-4">|</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <CircleDot className="h-2 w-2 text-rose-500" />
                <span className="font-mono text-xs font-black text-white px-1">DOGE/USDT</span>
                <span className="font-mono text-xs text-neutral-400">$0.1624</span>
                <span className="font-mono text-xs font-bold text-rose-500">-1.44%</span>
                <span className="text-white/10 px-4">|</span>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-16 md:pt-24 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left column */}
        <div className="lg:col-span-6 flex flex-col gap-6 md:gap-7">
          <div className="inline-flex items-center gap-2 self-start border border-[#0dff8c]/30 bg-[#0dff8c]/5 px-4 py-1.5 rounded-sm">
            <span className="w-2 h-2 rounded-full bg-[#0dff8c] pulse-dot" />
            <span className="font-mono text-[10px] text-[#0dff8c] uppercase tracking-widest font-black">
              LIVE ON DELTA EXCHANGE INDIA
            </span>
          </div>

          <h1 className="font-headings font-black text-4xl md:text-5xl lg:text-6xl leading-[0.95] tracking-tighter uppercase text-white">
            The Ultimate <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00e5ff] via-[#9b5de5] to-[#f72585]">
              Crypto Options
            </span> <br />
            AI Terminal
          </h1>

          <p className="text-sm md:text-base text-neutral-400 leading-relaxed max-w-lg">
            Trade smarter with sub-millisecond algo execution, live options payoff metrics, 
            AI-driven screener alerts, and institutional-grade derivatives backtesters — 
            fully integrated onto the Delta Exchange India API gateway.
          </p>

          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Live Payoff Graphs', color: 'border-[#00e5ff]/40 bg-[#00e5ff]/10 text-[#00e5ff]', icon: Activity },
              { label: 'Fast Execution', color: 'border-[#0dff8c]/40 bg-[#0dff8c]/10 text-[#0dff8c]', icon: Zap },
              { label: 'Strategy Builder', color: 'border-[#9b5de5]/40 bg-[#9b5de5]/10 text-[#9b5de5]', icon: GitMerge },
              { label: 'AI Screener', color: 'border-[#f72585]/40 bg-[#f72585]/10 text-[#f72585]', icon: Cpu },
              { label: 'Backtesting', color: 'border-amber-500/40 bg-amber-500/10 text-amber-500', icon: History }
            ].map((tag, idx) => {
              const TagIcon = tag.icon;
              return (
                <span key={idx} className={`inline-flex items-center gap-1.5 border px-3 py-1 text-[10px] font-bold font-mono uppercase tracking-wider rounded-sm ${tag.color}`}>
                  <TagIcon className="h-3 w-3" />
                  {tag.label}
                </span>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-3">
            <button 
              onClick={onLaunchTerminal}
              className="px-8 py-4 bg-[#00e5ff] text-black font-black text-xs uppercase tracking-wider shadow-[0_0_24px_rgba(0,229,255,0.5)] flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer font-mono"
            >
              <Zap className="h-4 w-4 fill-black text-black" />
              Initialize Engine
            </button>
            <button 
              onClick={onLaunchTerminal}
              className="px-8 py-4 border border-white/15 text-white font-black text-xs uppercase tracking-wider bg-white/5 flex items-center gap-2 hover:bg-white/10 transition cursor-pointer font-mono"
            >
              <Play className="h-4 w-4 fill-white text-white" />
              Watch Demo Stream
            </button>
          </div>

          <div className="flex items-center gap-4 pt-4 border-t border-white/5">
            <div className="flex -space-x-2">
              <img src="https://storage.googleapis.com/banani-avatars/avatar/male/25-35/South Asian/1" className="w-7 h-7 rounded-full border-2 border-[#06060e]" alt="trader" />
              <img src="https://storage.googleapis.com/banani-avatars/avatar/female/25-35/East Asian/2" className="w-7 h-7 rounded-full border-2 border-[#06060e]" alt="trader" />
              <img src="https://storage.googleapis.com/banani-avatars/avatar/male/35-50/Middle Eastern/3" className="w-7 h-7 rounded-full border-2 border-[#06060e]" alt="trader" />
              <img src="https://storage.googleapis.com/banani-avatars/avatar/female/18-25/European/4" className="w-7 h-7 rounded-full border-2 border-[#06060e]" alt="trader" />
            </div>
            <span className="text-xs text-neutral-400 font-mono">
              Over <strong>2,400+ options traders</strong> executing algorithms daily.
            </span>
          </div>
        </div>

        {/* Right column: Interactive Live Payoff Dashboard Frame */}
        <div className="lg:col-span-6 w-full relative">
          <div className="relative border border-white/10 bg-[#080c1a] rounded-xl overflow-hidden shadow-[0_0_60px_rgba(0,229,255,0.12)] z-10">
            {/* Terminal Top bar */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-black/70 border-b border-white/5">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 opacity-80" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 opacity-80" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#0dff8c] opacity-80" />
              </div>
              <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest font-bold">
                NexusTerminal — Live Payoff Engine
              </div>
              <div className="flex items-center gap-1.5 text-[9px] font-mono text-[#0dff8c] font-black uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0dff8c] pulse-dot" />
                LIVE
              </div>
            </div>

            {/* Payoff parameters info row */}
            <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-white/5 bg-black/30 text-xs text-left">
              <div className="flex flex-col">
                <span className="text-[9px] text-neutral-500 uppercase font-mono">Instrument</span>
                <span className="font-bold text-white font-mono">BTC-29MAY-64k-CONDOR</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] text-neutral-500 uppercase font-mono">Strategy</span>
                <span className="font-bold text-[#9b5de5]">Iron Condor Spread</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] text-neutral-500 uppercase font-mono">Max Profit</span>
                <span className="font-bold text-[#0dff8c] font-mono">+$1,520</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] text-neutral-500 uppercase font-mono">Max Loss</span>
                <span className="font-bold text-rose-500 font-mono">-$3,480</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] text-neutral-500 uppercase font-mono">Est POP</span>
                <span className="font-bold text-[#00e5ff] font-mono">68.4%</span>
              </div>
            </div>

            {/* Interactive payoff diagram */}
            <div className="relative h-[220px] px-4 py-2 overflow-hidden bg-[#04060f]">
              <div className="absolute inset-0 grid grid-cols-8 opacity-10 pointer-events-none">
                {[...Array(8)].map((_, i) => <div key={i} className="border-r border-[#00e5ff]/50 h-full"></div>)}
              </div>
              <div className="absolute inset-0 grid grid-rows-5 opacity-10 pointer-events-none">
                {[...Array(5)].map((_, i) => <div key={i} className="border-b border-[#00e5ff]/50 w-full"></div>)}
              </div>

              {/* Zero boundary line */}
              <div className="absolute top-[55%] left-0 right-0 border-t border-dashed border-white/20"></div>
              <div className="absolute top-[50%] right-4 text-[9px] font-mono text-neutral-500 font-bold uppercase">PnL Zero</div>

              {/* Active spot price tag marker */}
              <div className="absolute top-0 bottom-0 left-[48%] border-l border-dashed border-[#00e5ff]/70 z-20">
                <div className="absolute top-1 left-0 -translate-x-1/2 bg-[#00e5ff] text-black font-mono font-black text-[9px] px-1.5 py-0.5 rounded-sm">
                  BTC: ${btcPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
              </div>

              {/* SVG Curve for Iron Condor Payoff representation */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 100" preserveAspectRatio="none">
                <path d="M 0,65 L 40,65 L 60,30 L 140,30 L 160,65 L 200,65 L 200,100 L 0,100 Z" fill="url(#profitGrad)" />
                <path className="chart-line" d="M 0,65 L 40,65 L 60,30 L 140,30 L 160,65 L 200,65" fill="none" stroke="#0dff8c" strokeWidth="1.5" />
                
                <defs>
                  <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0dff8c" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#0dff8c" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Floating current payoff indicator */}
              <div className="absolute top-[25%] left-[55%] bg-black/90 border border-[#00e5ff]/40 px-3 py-2 rounded shadow-[0_0_14px_rgba(0,229,255,0.2)] z-35 text-left select-none">
                <div className="text-[8px] text-neutral-500 uppercase font-mono tracking-wider mb-0.5">Real-time MTM</div>
                <div className="font-mono font-black text-[#0dff8c] text-xs">
                  +$842.00 (7.1% IV Decay)
                </div>
              </div>
            </div>

            {/* Option stats Greeks footer */}
            <div className="grid grid-cols-5 divide-x divide-white/5 border-t border-white/5 bg-black/60 font-mono text-[10px] text-center select-none font-bold">
              <div className="py-2.5 flex flex-col gap-0.5">
                <span className="text-neutral-500 uppercase text-[8px]">Delta Δ</span>
                <span className="text-[#0dff8c]">+0.12</span>
              </div>
              <div className="py-2.5 flex flex-col gap-0.5">
                <span className="text-neutral-500 uppercase text-[8px]">Gamma Γ</span>
                <span className="text-rose-450">-0.04</span>
              </div>
              <div className="py-2.5 flex flex-col gap-0.5">
                <span className="text-neutral-500 uppercase text-[8px]">Theta Θ</span>
                <span className="text-[#0dff8c]">+$45.20/d</span>
              </div>
              <div className="py-2.5 flex flex-col gap-0.5">
                <span className="text-neutral-500 uppercase text-[8px]">Vega ν</span>
                <span className="text-rose-455">-$12.80</span>
              </div>
              <div className="py-2.5 flex flex-col gap-0.5">
                <span className="text-neutral-500 uppercase text-[8px]">Rho ρ</span>
                <span className="text-neutral-400">+0.03</span>
              </div>
            </div>
          </div>

          {/* Overlapping small widgets */}
          {/* AI Helper Widget */}
          <div className="absolute -left-8 top-[40%] hidden sm:block w-52 bg-[#080c1a]/95 border border-[#9b5de5]/40 rounded-xl p-3.5 shadow-[0_0_20px_rgba(155,93,229,0.2)] z-20 text-left">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4.5 w-4.5 text-[#9b5de5]" />
              <span className="text-[10px] font-black text-[#9b5de5] uppercase tracking-widest font-mono">AI Optimal Greek</span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-snug">
              Volatility surface skew is reporting flat calls. Shift call strikes from 67k to 69k CE. Net profit potential rises +4.2%.
            </p>
            <button 
              onClick={onLaunchTerminal}
              className="mt-2 text-[10px] text-[#9b5de5] font-black font-mono inline-flex items-center gap-1 hover:underline cursor-pointer"
            >
              Apply Strategy Adjust <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {/* Quick fill ticker widget */}
          <div className="absolute -right-6 bottom-[15%] hidden sm:block w-48 bg-[#080c1a]/95 border border-[#0dff8c]/30 rounded-xl p-3 shadow-[0_0_16px_rgba(13,255,140,0.15)] z-20 text-left">
            <div className="text-[9px] font-mono text-[#0dff8c] font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0dff8c] pulse-dot" />
              Direct Router Execution
            </div>
            <div className="text-[10px] font-mono text-white font-medium">Sell 2.5x BTC-64k-CE</div>
            <div className="text-[10px] font-mono text-[#0dff8c] mt-0.5 font-bold">Filled @ $110.8 Delta India ✓</div>
          </div>
        </div>
      </section>

      {/* KPI Stats band */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 mb-20 grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { metric: '₹200Cr+', label: 'Volume Routed', color: 'text-[#00e5ff]' },
          { metric: '<12ms', label: 'API Execution Ping', color: 'text-[#0dff8c]' },
          { metric: '250+', label: 'Custom Algos Deployed', color: 'text-[#9b5de5]' },
          { metric: '99.99%', label: 'Uptime SLA Guarantee', color: 'text-[#f72585]' },
          { metric: '₹0.00', label: 'Initial Setup Fee', color: 'text-[#00e5ff]' }
        ].map((item, index) => (
          <div key={index} className="bg-[#080c1a] border border-white/5 rounded-xl p-5 text-center flex flex-col justify-center">
            <span className={`font-headings font-black text-2xl lg:text-3xl font-mono ${item.color}`}>{item.metric}</span>
            <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest font-black mt-1">{item.label}</span>
          </div>
        ))}
      </section>

      {/* Core Systems Modules Section (Features grid) */}
      <section id="features-section" className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-16 border-t border-white/5">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono text-[#00e5ff] uppercase tracking-[0.35em] block mb-2 font-black">// INTEGRATED SYSTEMS CORE</span>
            <h2 className="font-headings font-black text-3xl md:text-4xl text-white uppercase tracking-tight">
              Everything You Need. <br />
              Nothing You Don't.
            </h2>
          </div>
          <p className="text-xs md:text-sm text-neutral-400 max-w-sm md:text-right leading-relaxed font-semibold">
            Eight institutional modules engineered directly inside a single view layout to maximize execution, speed, and analytical precision.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "Live P&L Payoffs",
              desc: "T+0 curves renders option parameters instantly. Calculate Black-Scholes Greeks, DTE decay, volatility spikes impact continuously.",
              badge: "Option desk",
              color: "#0dff8c",
              border: "border-[#0dff8c]/20 hover:border-[#0dff8c]/50",
              icon: Activity
            },
            {
              title: "Fast API Orders",
              desc: "Sub-millisecond endpoints connections to Delta Exchange India backend. Atomic bracket execution with strict rate-leak controls.",
              badge: "Sub-12ms Routing",
              color: "#00e5ff",
              border: "border-[#00e5ff]/20 hover:border-[#00e5ff]/50",
              icon: Zap
            },
            {
              title: "Visual Strategies Node",
              desc: "Drag-and-drop interactive strategy connections. Link indicator checkpoints, triggers, and safety stops into automated formulas.",
              badge: "Blueprint Canvas",
              color: "#9b5de5",
              border: "border-[#9b5de5]/20 hover:border-[#9b5de5]/50",
              icon: GitMerge
            },
            {
              title: "Live Network Monitor",
              desc: "Monitors WebSocket heartbeat, API rate-limits, signature keys expiration, and system clock drifts with latency tracking.",
              badge: "Secure Sentinel",
              color: "#f72585",
              border: "border-[#f72585]/20 hover:border-[#f72585]/50",
              icon: Layers
            }
          ].map((item, idx) => {
            const ItemIcon = item.icon;
            return (
              <div 
                key={idx} 
                onClick={onLaunchTerminal}
                className={`feature-card relative bg-[#080c1a] border p-6 flex flex-col gap-6 rounded-xl overflow-hidden group transition-all duration-300 cursor-pointer ${item.border}`}
              >
                <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ backgroundColor: item.color }} />
                <div className="flex items-start justify-between">
                  <div className="w-11 h-11 rounded-lg flex items-center justify-center border border-white/10 bg-black/60" style={{ boxShadow: `0 0 14px ${item.color}35` }}>
                    <ItemIcon className="h-5 w-5" style={{ color: item.color }} />
                  </div>
                  <span className="text-[9px] font-mono font-bold uppercase py-0.5 px-2.5 rounded bg-white/5 text-neutral-400 border border-white/5">{item.badge}</span>
                </div>

                <div>
                  <h3 className="font-headings font-black text-lg text-white mb-2">{item.title}</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed font-semibold">{item.desc}</p>
                </div>

                <div className="mt-auto pt-4 border-t border-white/5 flex items-center gap-1.5 text-xs font-black tracking-wider uppercase font-mono" style={{ color: item.color }}>
                  <span>Configure</span>
                  <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Advanced interactive system diagrams row */}
      <section id="strategies-section" className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-16 border-t border-white/5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left panel: Heatmap simulation */}
          <div className="lg:col-span-7 bg-[#080c1a] border border-white/5 rounded-xl overflow-hidden shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-black/50">
              <div className="flex items-center gap-3">
                <Grid3X3 className="h-4.5 w-4.5 text-[#f72585]" />
                <span className="font-headings font-black text-xs uppercase tracking-widest font-mono">Option Open Interest (OI) Heatmap Stream</span>
              </div>
              <div className="flex gap-1.5">
                <button 
                  onClick={() => setSelectedCoinTab('BTC')}
                  className={`px-3 py-1 text-[10px] font-mono font-black uppercase rounded ${selectedCoinTab === 'BTC' ? 'bg-[#00e5ff] text-black' : 'bg-white/5 text-neutral-400'}`}
                >
                  BTC
                </button>
                <button 
                  onClick={() => setSelectedCoinTab('ETH')}
                  className={`px-3 py-1 text-[10px] font-mono font-black uppercase rounded ${selectedCoinTab === 'ETH' ? 'bg-[#f72585] text-white' : 'bg-white/5 text-neutral-400'}`}
                >
                  ETH
                </button>
              </div>
            </div>

            <div className="p-5">
              <div className="grid grid-cols-9 gap-1.5 mb-2.5 text-[9px] font-mono text-neutral-500 uppercase font-black text-center select-none">
                <div className="text-left font-bold block">Strike Price</div>
                <div className="col-span-2 block">CE Call OI</div>
                <div className="col-span-2 block">CE Decaying IV</div>
                <div className="col-span-2 block">PE Put OI</div>
                <div className="col-span-2 block">PE Decaying IV</div>
              </div>

              {[
                { strike: selectedCoinTab === 'BTC' ? '72,000' : '3,800', ceOi: '12.4K', ceIv: '52.3%', peOi: '3.1K', peIv: '48.1%', active: false },
                { strike: selectedCoinTab === 'BTC' ? '70,000' : '3,600', ceOi: '8.8K', ceIv: '55.1%', peOi: '6.7K', peIv: '46.2%', active: false },
                { strike: selectedCoinTab === 'BTC' ? '68,000' : '3,400', ceOi: '4.2K', ceIv: '53.4%', peOi: '14.5K', peIv: '51.8%', active: true, badge: 'ATM' },
                { strike: selectedCoinTab === 'BTC' ? '66,000' : '3,200', ceOi: '2.1K', ceIv: '49.0%', peOi: '9.3K', peIv: '58.6%', active: false },
                { strike: selectedCoinTab === 'BTC' ? '64,000' : '3,000', ceOi: '1.2K', ceIv: '44.2%', peOi: '5.4K', peIv: '55.0%', active: false }
              ].map((row, index) => (
                <div 
                  key={index} 
                  className={`grid grid-cols-9 gap-1.5 mb-1.5 text-[11px] font-mono text-center font-bold items-center p-1 rounded transition ${
                    row.active ? 'ring-1 ring-[#00e5ff]/40 bg-[#00e5ff]/5' : ''
                  }`}
                >
                  <div className={`text-left font-black pr-1 ${row.active ? 'text-[#00e5ff]' : 'text-white'}`}>
                    ${row.strike} {row.badge && <span className="text-[8px] text-[#00e5ff] uppercase font-mono border border-[#00e5ff]/30 px-1 rounded ml-1 bg-[#00e5ff]/10">ATM</span>}
                  </div>
                  <div className="col-span-2 h-7 bg-[#f72585]/30 text-[#f72585] rounded flex items-center justify-center font-black select-none">{row.ceOi}</div>
                  <div className="col-span-2 h-7 bg-orange-500/15 text-orange-400 rounded flex items-center justify-center select-none">{row.ceIv}</div>
                  <div className="col-span-2 h-7 bg-[#00e5ff]/20 text-[#00e5ff] rounded flex items-center justify-center font-black select-none">{row.peOi}</div>
                  <div className="col-span-2 h-7 bg-purple-500/15 text-purple-400 rounded flex items-center justify-center select-none">{row.peIv}</div>
                </div>
              ))}

              <div className="flex gap-4 items-center justify-start mt-4 text-[9px] font-mono text-neutral-500 font-bold uppercase select-none">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-[#f72585]/40" /> Heavy Call Wall OI</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-[#00e5ff]/40" /> Heavy Put Wall OI</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-orange-500/15" /> Elevated Vol Skew</span>
              </div>
            </div>
          </div>

          {/* Right panel: AI + Backtest outcomes stacking */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* AI Screener signal desk */}
            <div className="bg-[#080c1a] border border-white/5 rounded-xl overflow-hidden shadow-lg text-left">
              <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/5 bg-black/50 justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-[#9b5de5]" />
                  <span className="font-headings font-black text-xs uppercase tracking-widest font-mono">Target Neural Screener Alerts</span>
                </div>
                <span className="text-[9px] font-mono font-bold bg-[#9b5de5]/10 border border-[#9b5de5]/20 text-[#9b5de5] py-0.5 px-2 rounded">
                  3 ACTIVE
                </span>
              </div>

              <div className="p-4 flex flex-col gap-2.5">
                {[
                  { coin: 'BTC', name: 'Iron Condor Neutral', pop: '72%', rating: 'High confidence', color: 'text-[#0dff8c]', border: 'border-[#0dff8c]/15 hover:border-[#0dff8c]/40', badgeColor: 'bg-[#0dff8c]/10 text-[#0dff8c]' },
                  { coin: 'ETH', name: 'Bull Put Credit Spread', pop: '65%', rating: 'Medium confidence', color: 'text-amber-400', border: 'border-amber-400/15 hover:border-amber-400/40', badgeColor: 'bg-amber-400/10 text-amber-500 stream' },
                  { coin: 'SOL', name: 'OTM Strangle Sell spread', pop: '60%', rating: 'Tactical play', color: 'text-amber-400', border: 'border-amber-400/15 hover:border-amber-400/40', badgeColor: 'bg-amber-400/10 text-amber-500' }
                ].map((sig, sidx) => (
                  <div key={sidx} className={`flex items-center justify-between gap-3 bg-black/40 border p-3 rounded-lg transition duration-200 cursor-pointer ${sig.border}`} onClick={onLaunchTerminal}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#9b5de5]/10 border border-[#9b5de5]/20 flex items-center justify-center font-mono font-black text-[#9b5de5] text-xs">
                        {sig.coin}
                      </div>
                      <div>
                        <div className="text-xs font-black font-sans text-white">{sig.name}</div>
                        <div className="flex items-center gap-2 text-[9px] mt-0.5 font-mono">
                          <span className={`${sig.color}`}>POP: {sig.pop}</span>
                          <span className="text-neutral-600">|</span>
                          <span className="text-neutral-500 uppercase">{sig.rating}</span>
                        </div>
                      </div>
                    </div>
                    <button className="text-[10px] uppercase font-black text-[#00e5ff] border border-[#00e5ff]/30 px-2.5 py-1 bg-[#00e5ff]/5 hover:bg-[#00e5ff] hover:text-black transition">
                      Deploy
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Backtest curve analytics wrapper */}
            <div className="bg-[#080c1a] border border-white/5 rounded-xl overflow-hidden shadow-lg text-left">
              <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/5 bg-black/50 justify-between">
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4 text-orange-500" />
                  <span className="font-headings font-black text-xs uppercase tracking-widest font-mono">Delta India Backtest Engine Metrics</span>
                </div>
                <span className="text-[9px] font-mono font-bold bg-orange-500/10 border border-orange-500/20 text-orange-400 py-0.5 px-2 rounded">
                  4YR CONTINUOUS DATA
                </span>
              </div>

              <div className="p-4">
                <div className="grid grid-cols-3 gap-2.5 mb-4 text-center font-mono select-none">
                  <div className="bg-black/40 border border-white/5 p-2 rounded flex flex-col">
                    <span className="text-[8px] text-neutral-500 uppercase">Mean CAGR</span>
                    <span className="text-xs font-black text-[#0dff8c] mt-0.5">+38.4%</span>
                  </div>
                  <div className="bg-black/40 border border-white/5 p-2 rounded flex flex-col">
                    <span className="text-[8px] text-neutral-500 uppercase">Sharpe Ratio</span>
                    <span className="text-xs font-black text-[#00e5ff] mt-0.5">2.14</span>
                  </div>
                  <div className="bg-black/40 border border-white/5 p-2 rounded flex flex-col">
                    <span className="text-[8px] text-neutral-500 uppercase">Peak Drawdown</span>
                    <span className="text-xs font-black text-rose-500 mt-0.5">-12.2%</span>
                  </div>
                </div>

                <div className="w-full h-11 pointer-events-none opacity-80 mt-1">
                  <svg className="w-full h-full" viewBox="0 0 100 25" preserveAspectRatio="none">
                    <path d="M 0,22 Q 25,18 50,14 T 100,2" fill="none" stroke="#00e5ff" strokeWidth="1.5" />
                    <path d="M 0,22 Q 25,18 50,14 T 100,2 L 100,25 L 0,25 Z" fill="url(#eqG)" opacity="0.1" />
                    <defs>
                      <linearGradient id="eqG" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00e5ff" />
                        <stop offset="100%" stopColor="#00e5ff" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Visual algorithm builder preview block */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-16 border-t border-white/5 bg-[#040409]">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 select-none">
          <div>
            <span className="text-[10px] font-mono text-[#9b5de5] uppercase tracking-[0.35em] block mb-2 font-black">// DRAG AND DROP FLOW</span>
            <h2 className="font-headings font-black text-3xl uppercase tracking-tight text-white">
              BUILD COMPLEX ALGOS VISUALLY. <br />
              <span className="text-[#9b5de5]">NO PROGRAMMING CODE REQUIRED.</span>
            </h2>
          </div>
          <button 
            onClick={onLaunchTerminal}
            className="flex items-center gap-2 px-6 py-3 border border-[#9b5de5]/50 hover:bg-[#9b5de5]/20 text-[#9b5de5] text-xs font-mono font-black uppercase tracking-wider bg-[#9b5de5]/5 transition cursor-pointer"
          >
            <GitMerge className="h-4 w-4" />
            Open Algorithmic Canvas
          </button>
        </div>

        {/* Visual blocks layout */}
        <div className="relative border border-white/5 bg-[#080c1a] h-[190px] rounded-xl overflow-hidden shadow-inner flex items-center justify-around px-4">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
            backgroundImage: 'linear-gradient(rgba(155, 93, 229, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(155, 93, 229, 0.1) 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }} />

          {/* Interactive animated flow SVG connector */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-80">
            <path d="M 120,95 Q 230,95 320,60" fill="none" stroke="#00e5ff" strokeWidth="1.5" strokeDasharray="4 4" className="chart-line" />
            <path d="M 120,95 Q 230,95 320,130" fill="none" stroke="#00e5ff" strokeWidth="1.5" strokeDasharray="4 4" className="chart-line" />
            
            <path d="M 450,60 Q 560,60 620,95" fill="none" stroke="#9b5de5" strokeWidth="1.5" strokeDasharray="4 4" className="chart-line" />
            <path d="M 450,130 Q 560,130 620,95" fill="none" stroke="#9b5de5" strokeWidth="1.5" strokeDasharray="4 4" className="chart-line" />

            <path d="M 750,95 L 890,95" fill="none" stroke="#f72585" strokeWidth="1.5" strokeDasharray="4 4" className="chart-line" />
          </svg>

          {/* Block 1 */}
          <div className="relative bg-[#020308] border border-[#00e5ff]/50 px-3 py-2 rounded shadow-lg flex items-center gap-2 select-none text-left z-10">
            <Clock className="h-4 w-4 text-[#00e5ff]" />
            <div>
              <div className="text-[10px] font-black text-white leading-none">09:15 IST TIME</div>
              <span className="text-[8px] font-mono text-neutral-500 uppercase font-black">Dynamic Trigger</span>
            </div>
          </div>

          {/* Block 2 */}
          <div className="relative bg-[#020308] border border-rose-500/40 px-3 py-2 rounded shadow-lg flex items-center gap-2 select-none text-left z-10 mt-[-40px]">
            <ArrowDownRight className="h-4 w-4 text-rose-400" />
            <div>
              <div className="text-[10px] font-black text-white leading-none">SELL 1x STRADDLE</div>
              <span className="text-[8px] font-mono text-neutral-500 uppercase font-black">Strike Entry ATM</span>
            </div>
          </div>

          {/* Block 3 */}
          <div className="relative bg-[#020308] border border-[#0dff8c]/40 px-3 py-2 rounded shadow-lg flex items-center gap-2 select-none text-left z-10 mt-[40px]">
            <ArrowUpRight className="h-4 w-4 text-[#0dff8c]" />
            <div>
              <div className="text-[10px] font-black text-white leading-none">BUY 10% OTM WINGS</div>
              <span className="text-[8px] font-mono text-neutral-500 uppercase font-black">Margin Protection</span>
            </div>
          </div>

          {/* Block 4 */}
          <div className="relative bg-[#020308] border border-amber-500/40 px-3 py-2 rounded shadow-lg flex items-center gap-2 select-none text-left z-10">
            <ShieldAlert className="h-4 w-4 text-amber-500" />
            <div>
              <div className="text-[10px] font-black text-white leading-none">STOP -$300 / TP +$500</div>
              <span className="text-[8px] font-mono text-neutral-500 uppercase font-black">Risk Guard limits</span>
            </div>
          </div>

          {/* Block 5 */}
          <div className="relative bg-[#020308] border border-[#9b5de5]/50 px-3 py-2 rounded shadow-lg flex items-center gap-2 select-none text-left z-10">
            <Send className="h-4 w-4 text-[#9b5de5]" />
            <div>
              <div className="text-[10px] font-black text-white leading-none">ROUTER INJECTION</div>
              <span className="text-[8px] font-mono text-neutral-500 uppercase font-black">Delta India API</span>
            </div>
          </div>

        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing-section" className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-20 border-t select-none transition-colors duration-300 animate-fadeIn" style={{ borderColor: customBorder }}>
        <div className="text-center mb-16">
          <span className="text-[10px] font-mono uppercase tracking-[0.35em] block mb-3 font-black" style={{ color: primaryColor }}>// TRANSPARENT FLAT BILLING</span>
          <h2 className="font-headings font-black text-3xl md:text-4xl uppercase tracking-tight" style={{ color: isDark ? '#ffffff' : '#0d1020' }}>
            Choose Your Level. Zero Hidden Charges.
          </h2>
          <p className="text-xs mt-2 font-mono" style={{ color: isDark ? '#94a3b8' : '#475569' }}>All transaction brokerages are billed directly to Delta Exchange India accounts.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-start text-left">
          
          {/* Plan 1 */}
          <div 
            className="border rounded-xl p-8 flex flex-col gap-6 transition duration-300 hover:scale-[1.01]"
            style={{ backgroundColor: customCard, borderColor: customBorder }}
          >
            <div>
              <h3 className="font-headings font-black text-sm uppercase tracking-widest" style={{ color: primaryColor }}>Starter Kit</h3>
              <div className="flex items-baseline gap-1 mt-3.5">
                <span className="text-3xl font-black font-mono" style={{ color: isDark ? '#ffffff' : '#0d1020' }}>₹999</span>
                <span className="text-xs" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>/mo</span>
              </div>
            </div>

            <ul className="flex flex-col gap-3 font-semibold text-xs flex-1" style={{ color: isDark ? '#cbd5e1' : '#334155' }}>
              <li className="flex items-center gap-2"><Check className="h-4 w-4" style={{ color: primaryColor }} /> 1 Active Strategy Engine</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4" style={{ color: primaryColor }} /> Delta India Web App Data Connectors</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4" style={{ color: primaryColor }} /> Manual Order Dispatch Desk</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4" style={{ color: primaryColor }} /> Real-time Option Payoff Charts</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4" style={{ color: primaryColor }} /> Secure Terminal Login required</li>
            </ul>

            <button 
              onClick={handleLaunchAttempt}
              className="w-full py-3 border hover:bg-black/5 text-xs font-black uppercase tracking-widest transition cursor-pointer font-mono"
              style={{ borderColor: customBorder, color: isDark ? '#cbd5e1' : '#1e293b' }}
            >
              Get Starter Tier
            </button>
          </div>

          {/* Plan 2: Pro popular */}
          <div className="relative rounded-xl p-[2px] overflow-hidden shadow-2xl transition duration-300 hover:scale-[1.015]">
            <div className="absolute inset-0 glow-border-anim rounded-xl"></div>
            <div 
              className="relative rounded-[10px] p-8 h-full flex flex-col gap-6"
              style={{ backgroundColor: isDark ? '#08091a' : '#ffffff' }}
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-black text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full font-mono shadow" style={{ backgroundColor: primaryColor }}>
                RECOMMENDED PRO
              </div>

              <div className="mt-2">
                <h3 className="font-headings font-black text-sm uppercase tracking-widest" style={{ color: primaryColor }}>Pro Options Trader</h3>
                <div className="flex items-baseline gap-1 mt-3.5">
                  <span className="text-3xl font-black font-mono" style={{ color: isDark ? '#ffffff' : '#0d1020' }}>₹4,999</span>
                  <span className="text-xs animate-pulse" style={{ color: primaryColor }}>/mo</span>
                </div>
              </div>

              <ul className="flex flex-col gap-3 font-semibold text-xs flex-1" style={{ color: isDark ? '#ffffff' : '#0f172a' }}>
                <li className="flex items-center gap-2"><Check className="h-4 w-4" style={{ color: primaryColor }} /> 5 Active Strategy Engines</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4" style={{ color: primaryColor }} /> Delta India Web App Data Connectors</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4" style={{ color: primaryColor }} /> Semi-automated algorithmic execution</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4" style={{ color: primaryColor }} /> Advanced payoff & Greeks decay charts</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4" style={{ color: primaryColor }} /> Real-time neural screener filters</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4" style={{ color: primaryColor }} /> Secure Terminal Login required</li>
              </ul>

              <button 
                onClick={handleLaunchAttempt}
                className="w-full py-3 text-black text-xs font-black uppercase tracking-widest transition cursor-pointer font-mono"
                style={{ 
                  backgroundColor: primaryColor,
                  boxShadow: `0 0 15px ${primaryColor}50`
                }}
              >
                Start 7-Day Free Trial
              </button>
            </div>
          </div>

          {/* Plan 3 */}
          <div 
            className="border rounded-xl p-8 flex flex-col gap-6 transition duration-300 hover:scale-[1.01]"
            style={{ backgroundColor: customCard, borderColor: `${secondaryColor}40` }}
          >
            <div>
              <h3 className="font-headings font-black text-sm uppercase tracking-widest" style={{ color: secondaryColor }}>Institutional Suite</h3>
              <div className="flex items-baseline gap-1 mt-3.5">
                <span className="text-3xl font-black font-mono" style={{ color: isDark ? '#ffffff' : '#0d1020' }}>₹12,499</span>
                <span className="text-xs" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>/mo</span>
              </div>
            </div>

            <ul className="flex flex-col gap-3 font-semibold text-xs flex-1" style={{ color: isDark ? '#cbd5e1' : '#334155' }}>
              <li className="flex items-center gap-2"><Check className="h-4 w-4" style={{ color: secondaryColor }} /> Unlimited algorithmic models</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4" style={{ color: secondaryColor }} /> Delta India Web App Data Connectors</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4" style={{ color: secondaryColor }} /> High-priority dedicated API allocations</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4" style={{ color: secondaryColor }} /> Custom Black-Scholes Greeks fitting</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4" style={{ color: secondaryColor }} /> Option open interest heatmap tracking</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4" style={{ color: secondaryColor }} /> Secure Terminal Login required</li>
            </ul>

            <button 
              onClick={handleLaunchAttempt}
              className="w-full py-3 border text-xs font-black uppercase tracking-widest transition cursor-pointer font-mono hover:bg-black/5"
              style={{ borderColor: `${secondaryColor}50`, color: secondaryColor }}
            >
              Contact Sales Team
            </button>
          </div>

        </div>

        <div className="text-center mt-8">
          <span className="inline-flex border font-mono font-black text-[10px] px-5 py-2 rounded-full uppercase tracking-widest" style={{ borderColor: `${accentColor}30`, backgroundColor: `${accentColor}10`, color: accentColor }}>
            SAVING 20% WITH ANNUAL BILLING ARRANGEMENTS
          </span>
        </div>
      </section>

      {/* Footer / Final CTA */}
      <footer className="relative z-10 border-t transition-colors duration-300" style={{ borderColor: customBorder, backgroundColor: isDark ? '#040409' : '#f8fafc' }}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 flex flex-col md:flex-row items-center justify-between gap-8 select-none text-left">
          <div>
            <h2 className="font-headings font-black text-3xl uppercase tracking-tight mb-2" style={{ color: isDark ? '#ffffff' : '#0d1020' }}>
              READY TO DISPATCH ALGOS?
            </h2>
            <p className="text-sm max-w-md font-semibold" style={{ color: isDark ? '#94a3b8' : '#475569' }}>
              Instantiate the credentials suite, design visual blueprint blocks, inspect payoff matrices, and connect in seconds.
            </p>
          </div>
          <div className="flex items-center gap-4 shrink-0 font-mono">
            <button 
              onClick={handleLaunchAttempt}
              className="px-8 py-4 text-black font-black text-xs uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
              style={{ 
                backgroundColor: primaryColor,
                boxShadow: `0 0 24px ${primaryColor}40`
              }}
            >
              Launch Core Terminal
            </button>
            <button 
              onClick={handleLaunchAttempt}
              className="px-8 py-4 border text-neutral-400 hover:text-white font-black text-xs uppercase tracking-wider hover:bg-white/5 transition cursor-pointer"
              style={{ borderColor: customBorder, color: isDark ? undefined : '#475569' }}
            >
              API Docs Integration
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-12 py-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-mono uppercase tracking-widest select-none" style={{ borderColor: customBorder, color: isDark ? '#64748b' : '#94a3b8' }}>
          <span>
            © 2026 NexusTerminal Suite Inc. BUILT EXCLUSIVELY FOR DELTA EXCHANGE INDIA API INTEROPERABILITY.
          </span>
          <div className="flex items-center gap-6 font-bold">
            <a href="#landing-page-root" className="hover:text-white transition" style={{ color: isDark ? undefined : '#475569' }}>Privacy Policy</a>
            <a href="#landing-page-root" className="hover:text-white transition" style={{ color: isDark ? undefined : '#475569' }}>Service Terms</a>
            <a href="#landing-page-root" className="hover:text-white transition" style={{ color: isDark ? undefined : '#475569' }}>Heartbeat Status</a>
          </div>
        </div>
      </footer>

      {/* 🔐 SECURE HMAC ACCESS GATEWAY LOGIN PORTAL MODAL */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div 
            className="w-full max-w-lg border rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden transition-all duration-300"
            style={{ 
              backgroundColor: isDark ? '#0c0d19' : '#ffffff', 
              borderColor: primaryColor,
              boxShadow: `0 0 40px ${primaryColor}25`
            }}
          >
            {/* Ambient glows inside modal */}
            <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] rounded-full blur-[80px] pointer-events-none" style={{ backgroundColor: `${primaryColor}15` }}></div>
            <div className="absolute bottom-[-20%] right-[-20%] w-[50%] h-[50%] rounded-full blur-[80px] pointer-events-none" style={{ backgroundColor: `${secondaryColor}15` }}></div>

            <button 
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/10 transition cursor-pointer"
              style={{ color: isDark ? '#94a3b8' : '#475569' }}
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center mb-6 relative z-10">
              <div 
                className="w-12 h-12 rounded-xl mx-auto flex items-center justify-center mb-3 border"
                style={{ 
                  backgroundColor: `${primaryColor}15`, 
                  borderColor: primaryColor,
                  boxShadow: `0 0 15px ${primaryColor}30`
                }}
              >
                <Hexagon className="h-6 w-6" style={{ color: primaryColor }} />
              </div>
              <h3 className="font-headings font-black text-xl uppercase tracking-wider font-mono" style={{ color: isDark ? '#ffffff' : '#0d1020' }}>
                Secure Gateway Authorization
              </h3>
              <p className="text-xs mt-1.5 leading-relaxed" style={{ color: isDark ? '#94a3b8' : '#475569' }}>
                Connect your Delta Exchange India credentials to authorize access and initialize secure terminal live feeds.
              </p>
            </div>

            <form onSubmit={handleConnectGateway} className="space-y-4 relative z-10">
              {/* Email Address */}
              <div>
                <label className="block text-[10px] font-mono font-black uppercase tracking-widest mb-1.5 text-left" style={{ color: isDark ? '#cbd5e1' : '#334155' }}>
                  Client Registered Email
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 opacity-50" style={{ color: isDark ? '#94a3b8' : '#475569' }}><Mail className="h-4 w-4" /></span>
                  <input 
                    type="email" 
                    required
                    placeholder="Enter email identity"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold rounded-lg border focus:ring-1 focus:outline-none transition-all text-left"
                    style={{ 
                      backgroundColor: isDark ? '#05050b' : '#f1f5f9', 
                      borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                      color: isDark ? '#f8fafc' : '#0f172a',
                    }}
                  />
                </div>
              </div>

              {/* Delta India API Key */}
              <div>
                <label className="block text-[10px] font-mono font-black uppercase tracking-widest mb-1.5 text-left" style={{ color: isDark ? '#cbd5e1' : '#334155' }}>
                  HMAC Delta India API Key
                </label>
                <div className="relative font-mono">
                  <span className="absolute left-3 top-2.5 opacity-50" style={{ color: isDark ? '#94a3b8' : '#475569' }}><Sliders className="h-4 w-4" /></span>
                  <input 
                    type="text" 
                    required
                    placeholder="dx_ind_..."
                    value={loginApiKey}
                    onChange={(e) => setLoginApiKey(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs font-mono rounded-lg border focus:ring-1 focus:outline-none transition-all text-left"
                    style={{ 
                      backgroundColor: isDark ? '#05050b' : '#f1f5f9', 
                      borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                      color: isDark ? '#f8fafc' : '#0f172a',
                    }}
                  />
                </div>
              </div>

              {/* API Secret */}
              <div>
                <label className="block text-[10px] font-mono font-black uppercase tracking-widest mb-1.5 text-left" style={{ color: isDark ? '#cbd5e1' : '#334155' }}>
                  API HMAC Secret Key
                </label>
                <div className="relative font-sans">
                  <span className="absolute left-3 top-2.5 opacity-50" style={{ color: isDark ? '#94a3b8' : '#475569' }}><Lock className="h-4 w-4" /></span>
                  <input 
                    type={showSecret ? "text" : "password"} 
                    required
                    placeholder="Enter Sha256 Api Secret"
                    value={loginApiSecret}
                    onChange={(e) => setLoginApiSecret(e.target.value)}
                    className="w-full pl-10 pr-16 py-2.5 text-xs font-mono rounded-lg border focus:ring-1 focus:outline-none transition-all text-left"
                    style={{ 
                      backgroundColor: isDark ? '#05050b' : '#f1f5f9', 
                      borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                      color: isDark ? '#f8fafc' : '#0f172a',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="absolute right-3 top-2.5 text-[10px] font-mono font-black uppercase text-neutral-400 hover:text-white transition cursor-pointer"
                  >
                    {showSecret ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {isConnecting ? (
                <div className="p-4 border rounded-xl bg-black/40 border-[#0dff8c]/30 text-emerald-400 text-left font-mono text-[10px] space-y-1.5 animate-pulse">
                  <div className="flex items-center gap-2 font-bold mb-1">
                    <span className="w-2 h-2 rounded bg-[#0dff8c] animate-ping" />
                    <span>SECURE SHIELD CRYPTO EXCHANGE WRAPPER</span>
                  </div>
                  <div>{connectStage}</div>
                </div>
              ) : (
                <div className="flex gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[10px] text-left" style={{ color: isDark ? '#fbbf24' : '#b45309' }}>
                  <ShieldAlert className="h-5 w-5 shrink-0" />
                  <span>
                    <strong>Sandbox Compliance note:</strong> Live web app data feeds require validating your credentials. Pre-filled sandbox keys are provided above for instantaneous verification.
                  </span>
                </div>
              )}

              <button
                type="submit"
                disabled={isConnecting}
                className="w-full py-3.5 text-xs font-black uppercase tracking-widest text-black bg-[#0dff8c] rounded-lg shadow-lg hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:scale-100 transition cursor-pointer font-mono"
                style={{ 
                  backgroundColor: '#0dff8c',
                  boxShadow: '0 0 20px rgba(13,255,140,0.3)'
                }}
              >
                {isConnecting ? "AUTHORIZING DIGITAL SIGNATURES..." : "CONNECT AND DISPATCH TERMINAL"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
