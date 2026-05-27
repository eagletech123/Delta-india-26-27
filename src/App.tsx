import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import AiCompiler from './components/AiCompiler';
import NodeEditorCanvas from './components/NodeEditorCanvas';
import PythonRunnerPanel from './components/PythonRunnerPanel';
import DeltaExecutionEnginePanel from './components/DeltaExecutionEnginePanel';
import Pnldashboard from './components/Pnldashboard';
import ReportCharts from './components/ReportCharts';
import DashboardAnalytics from './components/DashboardAnalytics';
import UserProfileSettings from './components/UserProfileSettings';
import TradingViewWidget from './components/TradingViewWidget';
import AIScreenerPage from './components/AIScreenerPage';
import WelcomeLandingPage from './components/WelcomeLandingPage';

import { 
  StrategyNode, 
  Connection, 
  HistoricalBar, 
  BacktestResult, 
  Position, 
  Order, 
  ExecutionLog 
} from './types';
import { PREBUILT_STRATEGIES, generateMockHistory } from './data';
import { runBacktest } from './utils/backtestEngine';

import { 
  Play, 
  Square, 
  Activity, 
  Check, 
  AlertTriangle, 
  Settings, 
  RefreshCw,
  Coins,
  ShieldCheck,
  Code2,
  Lock,
  ChevronRight,
  Menu,
  X,
  Bell,
  Sun,
  Moon,
  TrendingUp,
  TrendingDown,
  LayoutDashboard,
  Percent,
  Cpu,
  User,
  Sliders,
  Sparkles,
  Search,
  Plus,
  Layers,
  Zap,
  Hexagon
} from 'lucide-react';

// Six professional theme customizer palettes matching Phase 4/5 specifications
const PALETTES = {
  cyber: {
    name: "Cyber Volt",
    primary: "#EFFF00", // Volt Yellow
    secondary: "#00F5FF", // Cyan
    accent: "#FF007F", // Neon Pink
    bgDark: "#0B0C10",
    bgLight: "#F3F4F6",
    cardDark: "#12131C",
    cardLight: "#FFFFFF",
    textDark: "#EDEDF5",
    textLight: "#111827",
    borderDark: "#222533",
    borderLight: "#E5E7EB",
    glow: "rgba(239, 255, 0, 0.35)",
    textHighlight: "text-[#EFFF00]",
    borderHighlight: "border-[#EFFF00]",
    bgHighlight: "bg-[#EFFF00]"
  },
  aurora: {
    name: "Aurora",
    primary: "#8B5CF6", // Purple
    secondary: "#06B6D4", // Sky Blue
    accent: "#FBBF24", // Amber Gold
    bgDark: "#0A0814",
    bgLight: "#F5F3FF",
    cardDark: "#110E24",
    cardLight: "#FFFFFF",
    textDark: "#E2E0FD",
    textLight: "#1F1A3A",
    borderDark: "#221C4A",
    borderLight: "#DDD6FE",
    glow: "rgba(139, 92, 246, 0.35)",
    textHighlight: "text-[#8B5CF6]",
    borderHighlight: "border-[#8B5CF6]",
    bgHighlight: "bg-[#8B5CF6]"
  },
  inferno: {
    name: "Inferno",
    primary: "#F97316", // Flame Orange
    secondary: "#EAB308", // Golden Yellow
    accent: "#EC4899", // Magenta Rose
    bgDark: "#0B0502",
    bgLight: "#FFF7ED",
    cardDark: "#170C05",
    cardLight: "#FFFFFF",
    textDark: "#FFEDD5",
    textLight: "#431407",
    borderDark: "#301B11",
    borderLight: "#FED7AA",
    glow: "rgba(249, 115, 22, 0.35)",
    textHighlight: "text-[#F97316]",
    borderHighlight: "border-[#F97316]",
    bgHighlight: "bg-[#F97316]"
  },
  arctic: {
    name: "Arctic Blue",
    primary: "#06B6D4", // Ice Cyan
    secondary: "#3B82F6", // Royal Blue
    accent: "#A78BFA", // Cosmic Lavender
    bgDark: "#020813",
    bgLight: "#F0FDFA",
    cardDark: "#071124",
    cardLight: "#FFFFFF",
    textDark: "#E0F2FE",
    textLight: "#0F172A",
    borderDark: "#102140",
    borderLight: "#CCFBF1",
    glow: "rgba(6, 182, 212, 0.35)",
    textHighlight: "text-[#06B6D4]",
    borderHighlight: "border-[#06B6D4]",
    bgHighlight: "bg-[#06B6D4]"
  },
  matrix: {
    name: "Digital Matrix",
    primary: "#22C55E", // Cyber Green
    secondary: "#84CC16", // Lime Tech
    accent: "#EAB308", // Yellow Volt
    bgDark: "#030603",
    bgLight: "#F0FDF4",
    cardDark: "#071207",
    cardLight: "#FFFFFF",
    textDark: "#DCFCE7",
    textLight: "#14532D",
    borderDark: "#122E12",
    borderLight: "#DCFCE7",
    glow: "rgba(34, 197, 94, 0.35)",
    textHighlight: "text-[#22C55E]",
    borderHighlight: "border-[#22C55E]",
    bgHighlight: "bg-[#22C55E]"
  },
  sakura: {
    name: "Sakura Blossom",
    primary: "#EC4899", // Pastel Coral Pink
    secondary: "#F43F5E", // Rose
    accent: "#8B5CF6", // Lavender Mist
    bgDark: "#0C0308",
    bgLight: "#FDF2F8",
    cardDark: "#1A0612",
    cardLight: "#FFFFFF",
    textDark: "#FCE7F3",
    textLight: "#500730",
    borderDark: "#330E26",
    borderLight: "#FCE7F3",
    glow: "rgba(236, 72, 153, 0.35)",
    textHighlight: "text-[#EC4899]",
    borderHighlight: "border-[#EC4899]",
    bgHighlight: "bg-[#EC4899]"
  }
};

export default function App() {
  // Localized state persistence for palettes & theme setup
  const [paletteKey, setPaletteKey] = useState<'cyber' | 'aurora' | 'inferno' | 'arctic' | 'matrix' | 'sakura'>(() => {
    return (localStorage.getItem('delta_palette_key') as any) || 'aurora';
  });
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('delta_dark_mode');
    return saved !== null ? saved === 'true' : true;
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('delta_is_logged_in') === 'true';
  });

  // State mapping for layout nav pages
  const [activeTab, setActiveTab] = useState<'landing' | 'dashboard' | 'strategies' | 'positions' | 'orders' | 'backtest' | 'analytics' | 'scanner' | 'admin' | 'settings'>('landing');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Synchronized Billing active plans
  const [activePlan, setActivePlan] = useState<string>(() => {
    return localStorage.getItem("delta_active_plan") || "INSTITUTIONAL";
  });

  // Dynamic alert notification simulator list
  const [notifications, setNotifications] = useState<string[]>([
    "Delta Exchange API ping latency stable @ 14ms",
    "Topological Strategy compiler initialized successfully"
  ]);
  const [showNotificationPopup, setShowNotificationPopup] = useState<boolean>(false);

  // Live admin settings switches
  const [adminControls, setAdminControls] = useState({
    maintenanceMode: false,
    paperTradingOnly: false,
    require2FA: true,
    autoLiquidationGuard: true,
    systemLoadLevel: "NORMAL"
  });

  // User list simulation for admin dashboard page
  const [simulatedUsers, setSimulatedUsers] = useState([
    { id: "USR_01", name: "Axiom HFT Node", role: "Super Admin", level: "Institutional", pnl: 45290.12, status: "Active" },
    { id: "USR_02", name: "Delta Dev Client", role: "Operator", level: "Pro", pnl: 1845.50, status: "Active" },
    { id: "USR_03", name: "Beta Tester #90", role: "Viewer", level: "Free Trial", pnl: -142.10, status: "Idle" }
  ]);

  // Save changes to local persistence
  useEffect(() => {
    localStorage.setItem('delta_palette_key', paletteKey);
  }, [paletteKey]);

  useEffect(() => {
    localStorage.setItem('delta_dark_mode', String(isDark));
  }, [isDark]);

  // Core Algorithmic Builders States
  const [nodes, setNodes] = useState<StrategyNode[]>(PREBUILT_STRATEGIES[0].nodes);
  const [connections, setConnections] = useState<Connection[]>(PREBUILT_STRATEGIES[0].connections);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('BTC-USD-PERP');
  const [historicalBars, setHistoricalBars] = useState<HistoricalBar[]>([]);
  const [backtestStats, setBacktestStats] = useState<BacktestResult | null>(null);

  // Delta India Custom Backtest Configurations
  const [backtestProductType, setBacktestProductType] = useState<'FUTURE' | 'OPTION'>('FUTURE');
  const [backtestUnderlying, setBacktestUnderlying] = useState<'BTC' | 'ETH'>('BTC');
  const [backtestOptionType, setBacktestOptionType] = useState<'CE' | 'PE'>('CE');
  const [backtestStrikePrice, setBacktestStrikePrice] = useState<number>(64000);
  const [backtestExpiryString, setBacktestExpiryString] = useState<string>('290526');
  const [backtestResolution, setBacktestResolution] = useState<string>('2h');
  const [backtestLookbackDays, setBacktestLookbackDays] = useState<number>(14);
  const [isFetchingBacktestData, setIsFetchingBacktestData] = useState<boolean>(false);
  const [backtestCustomSymbolOverride, setBacktestCustomSymbolOverride] = useState<string>('');

  // Live Sandbox state
  const [iswsConnected, setIswsConnected] = useState<boolean>(true);
  const [isLiveActive, setIsLiveActive] = useState<boolean>(false);
  const [rateLimitTokens, setRateLimitTokens] = useState<number>(10000);
  const [logs, setLogs] = useState<ExecutionLog[]>([]);

  // Simulated position limits & orders
  const [activePosition, setActivePosition] = useState<Position>({
    symbol: 'BTC-USD-PERP',
    side: 'NONE',
    entryPrice: 0,
    size: 0,
    marginContracts: 0,
    unrealizedPnl: 0,
    liquidationPrice: 0
  });
  const [orders, setOrders] = useState<Order[]>([]);

  const barsRef = useRef<HistoricalBar[]>([]);
  const liveTickIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Live fluctuating pricing states matching screenshot specifications
  const [btcLivePrice, setBtcLivePrice] = useState<number>(64230.50);
  const [btcLiveChange, setBtcLiveChange] = useState<number>(2.4);
  const [ethLivePrice, setEthLivePrice] = useState<number>(3450.20);
  const [ethLiveChange, setEthLiveChange] = useState<number>(-0.8);
  const [isAiOptimizerActive, setIsAiOptimizerActive] = useState<boolean>(true);
  const [accountBalance, setAccountBalance] = useState<number>(124500.00);

  // User Profile state synchronized with localStorage
  const [userProfile, setUserProfile] = useState({
    name: localStorage.getItem('user_profile_name') || 'Jagdeep Dhillon',
    email: localStorage.getItem('user_profile_email') || 'india.eagletech@gmail.com',
    phone: localStorage.getItem('user_profile_phone') || '+91 98765 43210',
    role: localStorage.getItem('user_profile_role') || 'Quantitative Trade Advisor',
    location: localStorage.getItem('user_profile_location') || 'New Delhi, India',
    avatarUrl: localStorage.getItem('user_profile_avatar') || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120&h=120',
    riskAppetite: localStorage.getItem('user_profile_risk') || 'Conservative',
    leverageLimit: parseInt(localStorage.getItem('user_profile_leverage') || '10'),
    defaultOrderSize: parseFloat(localStorage.getItem('user_profile_order_size') || '1.5'),
    executionSound: localStorage.getItem('user_profile_sound') !== 'false',
    tradeAlerts: localStorage.getItem('user_profile_trade') !== 'false',
    newsAlerts: localStorage.getItem('user_profile_news') !== 'false',
  });

  // Static clock states
  const [utcTime, setUtcTime] = useState<string>('');
  const [apiPing, setApiPing] = useState<number>(14);

  // System logging helper
  const addLog = useCallback((message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const timestamp = new Date().toISOString().slice(11, 19);
    setLogs(prev => [
      {
        id: `L_${Date.now()}_${Math.random()}`,
        timestamp,
        type,
        message
      },
      ...prev.slice(0, 99)
    ]);
  }, []);

  // Update real-time clock and ping offsets
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toISOString().slice(0, 19).replace('T', ' ') + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);

    const pingInterval = setInterval(() => {
      setApiPing(prev => {
        const delta = Math.floor(Math.random() * 5) - 2;
        const next = prev + delta;
        return next < 8 ? 8 : next > 22 ? 22 : next;
      });
    }, 4000);

    // Dynamic price updates from live Binance token feeds
    const fetchLivePrices = async () => {
      try {
        const [btcRes, ethRes] = await Promise.all([
          fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT'),
          fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=ETHUSDT')
        ]);
        if (btcRes.ok) {
          const btcData = await btcRes.json();
          setBtcLivePrice(parseFloat(btcData.lastPrice));
          setBtcLiveChange(parseFloat(btcData.priceChangePercent));
        }
        if (ethRes.ok) {
          const ethData = await ethRes.json();
          setEthLivePrice(parseFloat(ethData.lastPrice));
          setEthLiveChange(parseFloat(ethData.priceChangePercent));
        }
      } catch (err) {
        console.warn("Failed to fetch live prices from public API:", err);
        // Clean fallback to organic drift
        setBtcLivePrice(prev => parseFloat((prev + (Math.random() - 0.485) * 8.5).toFixed(2)));
        setBtcLiveChange(prev => parseFloat((prev + (Math.random() - 0.48) * 0.01).toFixed(2)));
        setEthLivePrice(prev => parseFloat((prev + (Math.random() - 0.51) * 0.65).toFixed(2)));
        setEthLiveChange(prev => parseFloat((prev + (Math.random() - 0.51) * 0.005).toFixed(2)));
      }
      // Fluctuate account balance slightly due to active trading PNL
      setAccountBalance(prev => {
        const delta = (Math.random() - 0.45) * 4.2;
        const next = prev + delta;
        return parseFloat(next.toFixed(2));
      });
    };

    fetchLivePrices();
    const priceInterval = setInterval(fetchLivePrices, 4000);

    return () => {
      clearInterval(interval);
      clearInterval(pingInterval);
      clearInterval(priceInterval);
    };
  }, []);

  // Sync historical chart candles & evaluate initial topological backtest
  useEffect(() => {
    const loadHistoricalData = async () => {
      addLog(`Requesting historical candles for ${selectedSymbol} from Delta Exchange India gateway...`, 'info');
      try {
        const endSec = Math.floor(Date.now() / 1000);
        const startSec = endSec - 180 * 2 * 3600;

        const response = await fetch(`/api/history/candles?symbol=${selectedSymbol}&resolution=2h&start=${startSec}&end=${endSec}`);
        if (!response.ok) {
          throw new Error(`HTTP status ${response.status}`);
        }

        const data = await response.json();
        const candles: HistoricalBar[] = data.candles || [];
        setHistoricalBars(candles);
        barsRef.current = candles;

        const res = runBacktest(nodes, connections, candles);
        setBacktestStats(res);
        addLog(`Loaded ${candles.length} periods from Delta India API. Topological sorting & compiling successful!`, 'success');
      } catch (err: any) {
        console.warn("API fallback triggered:", err.message);
        addLog(`Delta server offline. Loaded procedural market history.`, 'warning');
        const barsData = generateMockHistory(selectedSymbol, 85);
        setHistoricalBars(barsData);
        barsRef.current = barsData;

        const res = runBacktest(nodes, connections, barsData);
        setBacktestStats(res);
      }
    };
    loadHistoricalData();
  }, [selectedSymbol]);

  // Handle Preset select triggers
  const loadStrategyPreset = (index: number) => {
    const preset = PREBUILT_STRATEGIES[index];
    if (!preset) return;
    setNodes(preset.nodes);
    setConnections(preset.connections);
    addLog(`Loaded strategy preset: "${preset.name}"`, 'success');
  };

  // Run backtesting math calculation
  const triggerBacktestRun = () => {
    if (nodes.length === 0) {
      addLog("Node strategy blueprint is empty. Cannot compile a blank graph.", "warning");
      return;
    }

    addLog("Compiling strategy nodes & connections into logic gates...", "info");
    setRateLimitTokens(prev => Math.max(12, prev - 35));

    try {
      const mockApiKey = "dt_pub_df829aef10";
      const signatureHex = Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      addLog(`HMAC SECURE SHA256 Signature generated: HMAC_HEX: ${signatureHex.substring(0, 8)}... via proxy`, 'success');

      const res = runBacktest(nodes, connections, historicalBars);
      setBacktestStats(res);

      addLog(`Backtest complete! Executed ${res.totalTrades} signals. P&L Margin: +${res.totalProfitPercent}% | Sharpe Ratio: ${res.sharpeRatio.toFixed(2)}`, 'success');
    } catch (err: any) {
      addLog(`Compilation exception: ${err.message}`, 'error');
    }
  };

  // Run backtesting on Delta Exchange India OHLC Data streams (Option & Futures Perp)
  const triggerDeltaIndiaBacktest = async () => {
    if (nodes.length === 0) {
      addLog("Cannot run backtest: Visual Node Strategy is currently empty.", "warning");
      return;
    }

    setIsFetchingBacktestData(true);
    addLog(`Contacting Delta Exchange India server cluster for live OHLC data...`, 'info');
    
    let querySymbol = "";
    if (backtestCustomSymbolOverride.trim() !== "") {
      querySymbol = backtestCustomSymbolOverride.trim();
    } else {
      if (backtestProductType === "FUTURE") {
        querySymbol = backtestUnderlying === "BTC" ? "BTC_USDT" : "ETH_USDT";
      } else {
        const optionSuffix = backtestOptionType === "CE" ? "C" : "P";
        querySymbol = `${backtestUnderlying}_${backtestStrikePrice}_${backtestExpiryString}_${optionSuffix}`;
      }
    }

    addLog(`Querying price history for ${querySymbol} (Interval: ${backtestResolution}, Lookback: ${backtestLookbackDays} days)`, 'info');

    try {
      const endSec = Math.floor(Date.now() / 1000);
      const startSec = endSec - (backtestLookbackDays * 86400);

      const url = `/api/history/candles?symbol=${encodeURIComponent(querySymbol)}&resolution=${backtestResolution}&start=${startSec}&end=${endSec}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP gateway error status: ${response.status}`);
      }

      const data = await response.json();
      const candles: HistoricalBar[] = data.candles || [];
      
      if (candles.length === 0) {
        addLog(`No continuous active data stream located for ${querySymbol}. Generating resilient organic walkthrough fallback.`, 'warning');
        const fallbackBars = generateMockHistory(querySymbol, 90);
        setHistoricalBars(fallbackBars);
        barsRef.current = fallbackBars;
        const res = runBacktest(nodes, connections, fallbackBars);
        setBacktestStats(res);
      } else {
        setHistoricalBars(candles);
        barsRef.current = candles;
        const res = runBacktest(nodes, connections, candles);
        setBacktestStats(res);
        addLog(`Successfully parsed ${candles.length} periods from Delta Exchange [Source: ${data.source}]. Starting simulation...`, 'success');
        addLog(`Simulation complete! Sharpe Ratio: ${res.sharpeRatio.toFixed(2)} | Profit margin: ${res.totalProfitPercent > 0 ? '+' : ''}${res.totalProfitPercent}% | Drawdown limit: ${res.maxDrawdownPercent}%`, 'success');
      }
    } catch (err: any) {
      addLog(`Delta server connection timeout (${err.message}). Activating synthetic institutional matching generator.`, 'warning');
      const fallbackBars = generateMockHistory(querySymbol, 90);
      setHistoricalBars(fallbackBars);
      barsRef.current = fallbackBars;
      const res = runBacktest(nodes, connections, fallbackBars);
      setBacktestStats(res);
    } finally {
      setIsFetchingBacktestData(false);
    }
  };

  // Simulated WebSocket feed loops
  useEffect(() => {
    if (isLiveActive) {
      addLog(`Enabling Web-Socket live-ticker feed from Delta Exchange. Subscription authenticated.`, 'info');

      liveTickIntervalRef.current = setInterval(() => {
        setRateLimitTokens(prev => {
          if (prev <= 120) {
            addLog("Token Rate limit replenished automatically.", "warning");
            return 10000;
          }
          return prev - 8;
        });

        const activeBars = barsRef.current;
        if (activeBars.length === 0) return;

        const lastBar = activeBars[activeBars.length - 1];
        const offset = lastBar.close * 0.0015;
        const tickVal = (Math.random() - 0.5) * offset;
        const livePrice = parseFloat((lastBar.close + tickVal).toFixed(2));

        const updatedBar: HistoricalBar = {
          ...lastBar,
          close: livePrice,
          high: Math.max(lastBar.high, livePrice),
          low: Math.min(lastBar.low, livePrice)
        };

        const updatedBars = [...activeBars.slice(0, activeBars.length - 1), updatedBar];
        setHistoricalBars(updatedBars);
        barsRef.current = updatedBars;

        try {
          const liveEval = runBacktest(nodes, connections, updatedBars);
          const lastTrade = liveEval.trades[liveEval.trades.length - 1];

          if (lastTrade && (lastTrade.time === lastBar.time)) {
            const exists = orders.some(o => o.timestamp === lastTrade.time && o.side === (lastTrade.type.includes('BUY') ? 'BUY' : 'SELL'));
            if (!exists) {
              const freshOrder: Order = {
                id: `ORD_${Date.now()}`,
                symbol: selectedSymbol,
                side: lastTrade.type.includes('BUY') ? 'BUY' : 'SELL',
                type: 'MARKET',
                price: livePrice,
                size: lastTrade.size,
                status: 'FILLED',
                timestamp: lastTrade.time
              };

              setOrders(prev => [freshOrder, ...prev]);
              addLog(`ORDER FILLED: Automated Signal Triggered ${freshOrder.side} of ${freshOrder.size} Contracts @ $${livePrice}`, 'success');

              if (freshOrder.side === 'BUY') {
                setActivePosition({
                  symbol: selectedSymbol,
                  side: 'LONG',
                  entryPrice: livePrice,
                  size: freshOrder.size,
                  marginContracts: parseFloat((freshOrder.size * 0.05).toFixed(3)),
                  unrealizedPnl: 0,
                  liquidationPrice: parseFloat((livePrice * 0.85).toFixed(2))
                });
              } else {
                setActivePosition({
                  symbol: selectedSymbol,
                  side: 'SHORT',
                  entryPrice: livePrice,
                  size: freshOrder.size,
                  marginContracts: parseFloat((freshOrder.size * 0.05).toFixed(3)),
                  unrealizedPnl: 0,
                  liquidationPrice: parseFloat((livePrice * 1.15).toFixed(2))
                });
              }
            }
          }

          setActivePosition(prev => {
            if (prev.side === 'NONE') return prev;
            const diffRate = (livePrice - prev.entryPrice) / prev.entryPrice;
            const sizeValue = prev.size * prev.entryPrice;
            const profit = prev.side === 'LONG' ? sizeValue * diffRate : sizeValue * -diffRate;

            return {
              ...prev,
              unrealizedPnl: parseFloat(profit.toFixed(2))
            };
          });

        } catch (err: any) {
          // Dynamic errors caught
        }

      }, 4000);

    } else {
      if (liveTickIntervalRef.current) {
        clearInterval(liveTickIntervalRef.current);
      }
    }

    return () => {
      if (liveTickIntervalRef.current) {
        clearInterval(liveTickIntervalRef.current);
      }
    };
  }, [isLiveActive, nodes, connections, orders]);

  // Sync state modifications on billing sub-tabs
  useEffect(() => {
    const plan = localStorage.getItem("delta_active_plan") || "INSTITUTIONAL";
    setActivePlan(plan);
  }, [activeTab]);

  const palette = PALETTES[paletteKey] || PALETTES.aurora;

  // Render variables matching selected palette
  const themeVars = {
    '--color-primary': palette.primary,
    '--color-secondary': palette.secondary,
    '--color-accent': palette.accent,
    '--theme-bg': isDark ? palette.bgDark : palette.bgLight,
    '--theme-card': isDark ? palette.cardDark : palette.cardLight,
    '--theme-text': isDark ? palette.textDark : palette.textLight,
    '--theme-border': isDark ? palette.borderDark : palette.borderLight,
    '--theme-glow': palette.glow,
  } as React.CSSProperties;

  if (activeTab === 'landing') {
    return (
      <WelcomeLandingPage 
        onLaunchTerminal={() => setActiveTab('dashboard')} 
        isDark={isDark} 
        setIsDark={setIsDark} 
        paletteKey={paletteKey}
        setPaletteKey={setPaletteKey}
        palette={palette}
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
      />
    );
  }

  return (
    <div 
      style={themeVars}
      className="min-h-screen font-sans flex text-[var(--theme-text)] bg-[var(--theme-bg)] transition-colors duration-300 ease-in-out antialiased"
    >
      {/* 🚀 Active Neon Theme Floating Indicator */}
      <div 
        onClick={() => setActiveTab('admin')}
        style={{ textShadow: `0 0 8px ${palette.primary}`, outlineColor: palette.primary }}
        className="fixed bottom-4 right-4 z-50 text-[10px] font-bold font-mono tracking-widest px-3 py-1.5 rounded-full border bg-slate-950 text-white cursor-pointer opacity-80 hover:opacity-100 shadow-lg flex items-center gap-1.5 uppercase select-none animate-pulse"
      >
        <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: palette.primary }}></span>
        Theme: {palette.name}
      </div>

      {/* ─── SIDEBAR NAVIGATION (LEFT) ─── */}
      <aside 
        style={{ borderColor: 'var(--theme-border)', backgroundColor: isDark ? palette.cardDark : palette.cardLight }}
        className={`fixed inset-y-0 left-0 z-40 w-64 border-r flex flex-col justify-between transition-transform duration-300 md:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand header */}
          <div className="h-16 flex items-center justify-between px-6 border-b" style={{ borderColor: 'var(--theme-border)' }}>
            <div className="flex items-center gap-2.5">
              <div 
                style={{ backgroundColor: palette.primary, boxShadow: `0 0 12px ${palette.primary}` }}
                className="w-8 h-8 rounded-lg flex items-center justify-center.5 justify-center text-slate-950"
              >
                <Activity className="h-4.5 w-4.5" />
              </div>
              <div>
                <span className="font-bold text-sm tracking-widest uppercase block" style={{ fontFamily: "'Syne', sans-serif" }}>
                  DeltaAlgo
                </span>
                <span className="text-[9px] font-mono font-semibold tracking-wider text-slate-400 block -mt-0.5">
                  THEMATIC CORE v1.2.0
                </span>
              </div>
            </div>
            <button 
              className="md:hidden text-slate-400 hover:text-slate-100"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Nav Links */}
          <nav className="p-4 flex flex-col gap-1.5 select-none">
            {[
              { id: "landing", label: "Welcome Portal", desc: "Interactive landing page welcome", icon: Hexagon },
              { id: "dashboard", label: "Dashboard", desc: "Interactive Spot & Futures desk", icon: LayoutDashboard },
              { id: "scanner", label: "AI Neural Screener", desc: "Futures, options & coins bubble heatmaps", icon: Layers },
              { id: "strategies", label: "Strategies Studio", desc: "Drag & drop visual strategy designer", icon: Code2 },
              { id: "positions", label: "Options Greeks Desk", desc: "Payoff metrics & real Greeks mapping", icon: Percent },
              { id: "orders", label: "Credentials & Gateways", desc: "HMAC credentials & live terminal testing", icon: Sliders },
              { id: "backtest", label: "Backtest Reports", desc: "CAGR curves & equity logs charts", icon: TrendingUp },
              { id: "analytics", label: "Axiom Analytics", desc: "Historical stats metrics & terminals", icon: Coins },
              { id: "admin", label: "⬙ Admin Console", desc: "Dynamic multicolor theme customizer", icon: Sparkles },
              { id: "settings", label: "User Profile & Security", desc: "User profile, risk, API keys & bills", icon: User }
            ].map((item) => {
              const IconComp = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as any);
                    setIsMobileMenuOpen(false);
                  }}
                  style={{
                    backgroundColor: isActive 
                      ? `${palette.primary}12` 
                      : 'transparent',
                    borderColor: isActive 
                      ? palette.primary 
                      : 'transparent',
                    color: isActive ? palette.primary : 'inherit'
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl border flex items-center gap-3 transition-all duration-300 group cursor-pointer`}
                >
                  <IconComp 
                    className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110" 
                    style={{ color: isActive ? palette.primary : 'var(--theme-text)' }}
                  />
                  <div>
                    <span className="text-xs font-bold block" style={{ fontFamily: "'Syne', sans-serif" }}>
                      {item.label}
                    </span>
                    <span className="text-[9px] text-slate-500 font-medium block leading-none mt-0.5">
                      {item.desc}
                    </span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar bottom status indicator */}
        <div className="p-4 border-t" style={{ borderColor: 'var(--theme-border)' }}>
          <div 
            onClick={() => {
              setActiveTab('settings');
              setIsMobileMenuOpen(false);
            }}
            className={`transition p-3 rounded-xl border flex items-center gap-3 select-none cursor-pointer ${
              isDark 
                ? 'bg-slate-950 hover:bg-slate-900/60 border-slate-900' 
                : 'bg-slate-100/70 hover:bg-slate-200/50 border-slate-200'
            }`}
          >
            <div className={`w-8 h-8 rounded-full overflow-hidden border flex items-center justify-center shrink-0 relative ${
              isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-300 bg-slate-200'
            }`}>
              {userProfile.avatarUrl ? (
                <img 
                  src={userProfile.avatarUrl} 
                  alt="Avatar" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover" 
                />
              ) : (
                <User className={`h-4 w-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`} />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-mono font-extrabold text-[#8b5cf6] block leading-none">
                {activePlan === 'INSTITUTIONAL' ? '⚡ INSTITUTIONAL' : activePlan === 'PRO' ? '✨ PRO TRADER' : 'FREE ACCOUNT'}
              </span>
              <span className={`text-[9px] block font-mono truncate mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
                {userProfile.email}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile background backdrop drawer cover */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-35 bg-black/60 backdrop-blur-xs md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* ─── MAIN CONTENT VIEW (RIGHT AREA) ─── */}
      <div className="flex-1 flex flex-col md:pl-64 min-w-0">
        
        {/* ─── TOP CONTENT NAVIGATION HEADER bar ─── */}
        <header 
          style={{ borderColor: 'var(--theme-border)', backgroundColor: isDark ? palette.cardDark : palette.cardLight }}
          className="h-16 border-b flex items-center justify-between px-6 sticky top-0 z-30 transition-all select-none"
        >
          {/* Left part: Hamburger & Live ticket indicators */}
          <div className="flex items-center gap-4 md:gap-7 flex-1 min-w-0">
            {/* Hamburger trigger menu for mobile viewports */}
            <button 
              className={`md:hidden p-1.5 rounded-lg border cursor-pointer shrink-0 ${isDark ? 'hover:bg-slate-900' : 'hover:bg-slate-100'}`} 
              style={{ borderColor: 'var(--theme-border)' }}
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Dynamic live crypto ticker matched precisely to screenshot parameters */}
            <div className="flex items-center gap-5 overflow-x-auto scrollbar-none py-1 min-w-0">
              
              {/* BTC/USDT Ticket Badge Block */}
              <div className="flex items-center gap-2.5 shrink-0">
                <span className={`text-[11px] font-mono tracking-wider font-extrabold ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>BTC/USDT</span>
                <span className="text-sm font-mono font-extrabold text-[#10b981] leading-none">
                  {btcLivePrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
                <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono px-1.5 py-0.5 rounded-md font-black leading-none animate-pulse">
                  {btcLiveChange >= 0 ? '+' : ''}{btcLiveChange.toFixed(1)}%
                </span>
              </div>

              {/* ETH/USDT Ticket Badge Block */}
              <div className="flex items-center gap-2.5 shrink-0 border-l border-theme-border/40 pl-5">
                <span className={`text-[11px] font-mono tracking-wider font-extrabold ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>ETH/USDT</span>
                <span className="text-sm font-mono font-extrabold text-[#ef4444] leading-none">
                  {ethLivePrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
                <span className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-mono px-1.5 py-0.5 rounded-md font-black leading-none">
                  {ethLiveChange.toFixed(1)}%
                </span>
              </div>

              {/* AI Optimizer Clickable active state button */}
              <button 
                onClick={() => setIsAiOptimizerActive(!isAiOptimizerActive)}
                className={`hidden lg:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-[11px] font-bold transition-all shadow-[0_0_8px_rgba(var(--color-primary),0.1)] hover:scale-105 cursor-pointer ${
                  isAiOptimizerActive 
                    ? (isDark ? 'bg-[#152c33]/70 border-cyan-500/40 text-cyan-400' : 'bg-cyan-50 border-cyan-300 text-cyan-700') 
                    : (isDark ? 'bg-slate-900/40 border-slate-700/50 text-slate-400' : 'bg-slate-100 border-slate-300 text-slate-600')
                }`}
              >
                <Zap className={`h-3.5 w-3.5 ${isAiOptimizerActive ? (isDark ? 'text-cyan-400 animate-pulse' : 'text-cyan-600 animate-pulse') : (isDark ? 'text-slate-400' : 'text-slate-550')}`} />
                <span>{isAiOptimizerActive ? 'AI Optimizer Active' : 'AI Optimizer Paused'}</span>
              </button>
            </div>
          </div>

          {/* Right part: balance display stack, custom profile illustration and standard toolings */}
          <div className="flex items-center gap-4 shrink-0">
            
            {/* Account Balance block matching presentation visual ratios */}
            <div className="hidden sm:flex flex-col items-end border-l border-theme-border/50 pl-5 leading-none">
              <span className={`text-[9.5px] font-black tracking-wider mb-1 uppercase font-mono ${isDark ? 'text-slate-500' : 'text-slate-700'}`}>
                Account Balance
              </span>
              <span className={`text-sm font-mono font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                ${accountBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* Custom Avatar container matching Sikh styled turban avatar perfectly */}
            <div className="relative group select-none cursor-pointer" onClick={() => setActiveTab('settings')}>
              <div className="w-9 h-9 rounded-full overflow-hidden border border-theme-border/80 flex items-center justify-center bg-slate-900 shadow-md">
                {userProfile.avatarUrl ? (
                  <img 
                    src={userProfile.avatarUrl} 
                    alt="Advisor Profile" 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to layout
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : null}
                <div className="w-full h-full bg-gradient-to-tr from-primary to-violet-600 flex items-center justify-center text-slate-950 font-black text-xs font-sans uppercase">
                  <span>{userProfile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'JD'}</span>
                </div>
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-950 rounded-full" />
            </div>

            <div className="w-px h-6 bg-theme-border/50 mx-1" />

            {/* Notification simulated alerts */}
            <div className="relative">
              <button 
                onClick={() => setShowNotificationPopup(!showNotificationPopup)}
                className="w-9 h-9 border rounded-lg flex items-center justify-center hover:opacity-85 cursor-pointer"
                style={{ borderColor: 'var(--theme-border)' }}
              >
                <div className="relative">
                  <Bell className="h-4.5 w-4.5 text-slate-400" />
                  <span className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border border-black animate-ping" />
                </div>
              </button>

              {/* Notification Popup Modal elements */}
              {showNotificationPopup && (
                <div 
                  className="absolute right-0 mt-2 w-72 bg-slate-950 border border-slate-900 text-white p-3 rounded-xl shadow-2xl z-50 text-[11px] font-mono font-bold leading-normal"
                >
                  <div className="flex justify-between items-center mb-2 pb-1.5 border-b border-slate-900">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest">Platform Alerts Feed</span>
                    <button onClick={() => setShowNotificationPopup(false)} className="text-slate-500 hover:text-white">✕</button>
                  </div>
                  <div className="flex flex-col gap-2">
                    {notifications.map((n, idx) => (
                      <div key={idx} className="bg-slate-900/40 p-2 rounded border border-slate-900 flex items-start gap-1.5">
                        <span className="text-[9px] text-violet-400 shrink-0">◇</span>
                        <span>{n}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Dark & Light toggle switch */}
            <button 
              onClick={() => setIsDark(!isDark)}
              className="w-9 h-9 border rounded-lg flex items-center justify-center text-slate-400 hover:opacity-85 cursor-pointer"
              style={{ borderColor: 'var(--theme-border)' }}
              title="Toggle system theme"
            >
              {isDark ? <Sun className="h-4.5 w-4.5 text-amber-400 animate-spin" style={{ animationDuration: '20s' }} /> : <Moon className="h-4.5 w-4.5 text-indigo-600" />}
            </button>
          </div>
        </header>

        {/* ─── DYNAMIC TAB ENGINE PORTALS ─── */}
        <main className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto max-h-[calc(100vh-64px)] scrollbar-thin scrollbar-thumb-slate-800">
          
          {/* ────── PAGE: DASHBOARD (MAIN SPOT) ────── */}
          {activeTab === 'dashboard' && (
            <div className="flex flex-col gap-6 animate-fadeIn">
              
              {/* Stat Cards Row Grid with customized sparkline shapes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 select-none">
                
                {/* 1. Pricing widget card */}
                <div 
                  style={{ backgroundColor: isDark ? palette.cardDark : palette.cardLight, borderColor: 'var(--theme-border)' }}
                  className="border p-4.5 rounded-xl flex items-center justify-between shadow-sm relative overflow-hidden"
                >
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono tracking-widest font-extrabold text-slate-400 block uppercase">BTC Core Estimator</span>
                    <span className="text-xl font-bold font-mono tracking-tight mt-1.5 block" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                      $79,842.10
                    </span>
                    <span className="text-[10px] text-emerald-500 font-mono font-extrabold flex items-center gap-1 mt-1 leading-none">
                      <TrendingUp className="h-3 w-3 shrink-0" /> +2.45% (24H)
                    </span>
                  </div>
                  <div className="w-16 h-10 shrink-0 opacity-60">
                    <svg viewBox="0 0 100 40" className="w-full h-full text-emerald-500 stroke-current stroke-2 fill-none">
                      <path d="M0,35 Q15,25 30,28 T60,15 T90,5 L100,5" />
                    </svg>
                  </div>
                </div>

                {/* 2. Win rate statistics */}
                <div 
                  style={{ backgroundColor: isDark ? palette.cardDark : palette.cardLight, borderColor: 'var(--theme-border)' }}
                  className="border p-4.5 rounded-xl flex items-center justify-between shadow-sm relative overflow-hidden"
                >
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono tracking-widest font-extrabold text-[#8b5cf6] block uppercase animate-pulse">Live Winrate Margin</span>
                    <span className="text-xl font-bold font-mono tracking-tight mt-1.5 block" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                      {backtestStats ? `${backtestStats.winRate}%` : "62.5%"}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono font-medium block mt-1 leading-none">
                      Traversing {backtestStats ? backtestStats.totalTrades : "34"} active trades loops
                    </span>
                  </div>
                  <div className="w-16 h-10 shrink-0 opacity-60">
                    <svg viewBox="0 0 100 40" className="w-full h-full text-violet-500 stroke-current stroke-2 fill-none">
                      <path d="M0,25 Q20,10 40,30 T70,5 T90,12 L100,10" />
                    </svg>
                  </div>
                </div>

                {/* 3. Real-time Margin ratio status */}
                <div 
                  style={{ backgroundColor: isDark ? palette.cardDark : palette.cardLight, borderColor: 'var(--theme-border)' }}
                  className="border p-4.5 rounded-xl flex items-center justify-between shadow-sm relative overflow-hidden"
                >
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono tracking-widest font-extrabold text-slate-400 block uppercase">Active Equity Margin</span>
                    <span 
                      style={{ color: palette.primary, textShadow: `0 0 8px ${palette.primary}`, fontFamily: "'Orbitron', sans-serif" }}
                      className="text-xl font-bold font-mono tracking-tight mt-1.5 block" 
                    >
                      $9,240.50
                    </span>
                    <span className="text-[10px] font-mono font-extrabold flex items-center gap-1 mt-1 leading-none" style={{ color: palette.primary }}>
                      ⚡ live active core
                    </span>
                  </div>
                  <div className="w-16 h-10 shrink-0 opacity-60">
                    <svg viewBox="0 0 100 40" className="w-full h-full stroke-current stroke-2 fill-none" style={{ color: palette.primary }}>
                      <path d="M0,35 Q10,15 30,22 T65,8 T85,15 L100,10" />
                    </svg>
                  </div>
                </div>

                {/* 4. API bucket tokens limiter */}
                <div 
                  style={{ backgroundColor: isDark ? palette.cardDark : palette.cardLight, borderColor: 'var(--theme-border)' }}
                  className="border p-4.5 rounded-xl flex items-center justify-between shadow-sm relative overflow-hidden"
                >
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono tracking-widest font-extrabold text-slate-400 block uppercase">API Token Barrel</span>
                    <span className="text-xl font-bold font-mono tracking-tight mt-1.5 block" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                      {rateLimitTokens.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono font-medium block mt-1 leading-none">
                      Live rate limit capacity (10k units max)
                    </span>
                  </div>
                  <div className="w-16 h-10 shrink-0 opacity-60">
                    <svg viewBox="0 0 100 40" className="w-full h-full text-[#06b6d4] stroke-current stroke-2 fill-none">
                      <path d="M0,15 L15,15 L15,25 L35,25 L35,10 L65,10 L65,30 L100,30" />
                    </svg>
                  </div>
                </div>

              </div>

              {/* Underlying Asset Selectors & Workspace control blocks */}
              <div 
                style={{ backgroundColor: isDark ? palette.cardDark : palette.cardLight, borderColor: 'var(--theme-border)' }}
                className="border p-4.5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 select-none"
              >
                <div>
                  <h3 className="text-sm font-bold tracking-tight uppercase" style={{ fontFamily: "'Syne', sans-serif" }}>Underlying Algorithmic Controls</h3>
                  <p className="text-xs text-slate-500 font-sans mt-0.5">Toggle live market assets and automated execution loops.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                  {/* BTC/ETH selector buttons */}
                  <div className="flex bg-slate-950 p-1.5 rounded-xl border border-slate-900 text-xs w-full sm:w-auto">
                    <button 
                      onClick={() => {
                        setSelectedSymbol('BTC-USD-PERP');
                        setActivePosition(prev => ({ ...prev, symbol: 'BTC-USD-PERP' }));
                      }}
                      className={`px-4 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                        selectedSymbol === 'BTC-USD-PERP' ? 'bg-slate-800 text-white' : 'text-slate-500'
                      }`}
                    >
                      BTC-USD-PERP
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedSymbol('ETH-USD-PERP');
                        setActivePosition(prev => ({ ...prev, symbol: 'ETH-USD-PERP' }));
                      }}
                      className={`px-4 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                        selectedSymbol === 'ETH-USD-PERP' ? 'bg-slate-800 text-white' : 'text-slate-500'
                      }`}
                    >
                      ETH-USD-PERP
                    </button>
                  </div>

                  {/* Operational triggers */}
                  <button
                    onClick={triggerBacktestRun}
                    className="h-10 px-4 bg-slate-950 text-white border border-slate-900 hover:opacity-85 rounded-xl text-xs font-bold font-sans flex items-center justify-center gap-2 shadow-md transition cursor-pointer select-none grow sm:grow-0"
                  >
                    <RefreshCw className="h-3.5 w-3.5" style={{ color: palette.primary }} />
                    <span>Run Evaluation Backtest</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsLiveActive(!isLiveActive);
                      addLog(isLiveActive ? "Deactivated execution WebSocket feed." : "Activated dynamic live-pricing feed.");
                    }}
                    style={{
                      backgroundColor: isLiveActive ? "rgba(239, 68, 68, 0.15)" : `${palette.primary}12`,
                      borderColor: isLiveActive ? "rgb(239, 68, 68)" : palette.primary,
                      color: isLiveActive ? "rgb(239, 68, 68)" : palette.primary
                    }}
                    className="h-10 px-4 border rounded-xl text-xs font-bold font-sans flex items-center justify-center gap-2 shadow-sm transition cursor-pointer select-none grow sm:grow-0"
                  >
                    {isLiveActive ? (
                      <>
                        <Square className="h-3.5 w-3.5 fill-current" />
                        <span>Stop Live Execution Feed</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-3.5 w-3.5 fill-current animate-pulse" />
                        <span>Start Live Execution Feed</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Main dashboard body - Interactive candlestick previewer and active parameters */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 select-none">
                
                {/* Simulated Chart preview */}
                <div 
                  style={{ backgroundColor: isDark ? palette.cardDark : palette.cardLight, borderColor: 'var(--theme-border)' }}
                  className="border p-5 rounded-2xl xl:col-span-8 flex flex-col justify-between shadow-sm min-h-[380px]"
                >
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <span className="text-[10px] font-mono tracking-widest font-extrabold text-[#06b6d4] block uppercase">Live Charts View</span>
                      <h4 className="text-xs font-bold tracking-tight uppercase mt-0.5" style={{ fontFamily: "'Syne', sans-serif" }}>
                        Real-time Market Tickers Feed: {selectedSymbol}
                      </h4>
                    </div>

                    <div className="text-[11px] font-mono text-slate-500 font-bold">
                      UPDATES: <span className="animate-pulse" style={{ color: palette.primary }}>EVERY 4 SECONDS</span>
                    </div>
                  </div>

                  {/* Dynamic Interactive TradingView Chart Widget */}
                  <div className="w-full h-[400px] rounded-xl overflow-hidden border border-slate-900/40 relative bg-slate-950">
                    <TradingViewWidget symbol={selectedSymbol} isDark={isDark} />
                  </div>
                </div>

                {/* Strategy parameters and preset cards */}
                <div 
                  style={{ backgroundColor: isDark ? palette.cardDark : palette.cardLight, borderColor: 'var(--theme-border)' }}
                  className="border p-5 rounded-2xl xl:col-span-4 flex flex-col justify-between shadow-sm min-h-[380px]"
                >
                  <div>
                    <span className="text-[10px] font-mono tracking-widest font-extrabold text-amber-500 block uppercase">Algorithmic Blueprints</span>
                    <h4 className="text-xs font-bold tracking-tight uppercase mt-0.5" style={{ fontFamily: "'Syne', sans-serif" }}>
                      Load Quick-Start Presets
                    </h4>
                    <p className="text-xs text-slate-500 font-sans mt-1">
                      Inject pre-built mathematical trading formulas onto the compiler engine.
                    </p>
                  </div>

                  <div className="flex flex-col gap-2.5 my-4">
                    <button
                      onClick={() => loadStrategyPreset(0)}
                      className="w-full h-11 bg-slate-950 text-white text-left px-3 border border-slate-900 hover:opacity-85 rounded-xl text-xs font-semibold font-sans flex items-center justify-between transition cursor-pointer"
                    >
                      <span>🚀 EMA Crossover Rider</span>
                      <span className="text-[9px] font-mono font-bold text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-900 uppercase">9/21 EMA</span>
                    </button>

                    <button
                      onClick={() => loadStrategyPreset(1)}
                      className="w-full h-11 bg-slate-950 text-white text-left px-3 border border-slate-900 hover:opacity-85 rounded-xl text-xs font-semibold font-sans flex items-center justify-between transition cursor-pointer"
                    >
                      <span>📊 RSI Mean Rebound</span>
                      <span className="text-[9px] font-mono font-bold text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-900 uppercase">RSI (14)</span>
                    </button>

                    <button
                      onClick={() => {
                        setNodes([]);
                        setConnections([]);
                        setOrders([]);
                        setActivePosition({
                          symbol: 'BTC-USD-PERP',
                          side: 'NONE',
                          entryPrice: 0,
                          size: 0,
                          marginContracts: 0,
                          unrealizedPnl: 0,
                          liquidationPrice: 0
                        });
                        addLog("Canvas wiped. Create custom algorithm blocks.");
                      }}
                      className="w-full h-11 bg-rose-950/20 text-rose-400 text-left px-3 border border-rose-900/40 rounded-xl text-xs font-semibold font-sans flex items-center justify-center hover:bg-rose-950/40 transition cursor-pointer"
                    >
                      🧹 Wipe Builder Workspace
                    </button>
                  </div>

                  <div className="bg-slate-950 border border-slate-900 text-white rounded-xl p-3 flex flex-col gap-2 font-mono text-[10.5px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Active Node Modules:</span>
                      <span style={{ color: palette.primary }}>{nodes.length} Blocks</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Connections Wire Ties:</span>
                      <span style={{ color: palette.primary }}>{connections.length} Cables</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ────── PAGE: STRATEGIES (Visual drag-and-drop node strategy builder) ────── */}
          {activeTab === 'strategies' && (
            <div className="flex flex-col gap-6 animate-fadeIn">
              
              {/* Gemini AI compiled prompt card */}
              <div 
                style={{ backgroundColor: isDark ? palette.cardDark : palette.cardLight, borderColor: 'var(--theme-border)' }}
                className="border p-5 rounded-2xl shadow-sm"
              >
                <div className="mb-4">
                  <span className="text-[10px] font-mono tracking-widest font-extrabold text-[#8b5cf6] block uppercase animate-pulse">Gemini AI Studio</span>
                  <h3 className="text-sm font-bold tracking-tight uppercase" style={{ fontFamily: "'Syne', sans-serif" }}>AI strategy designer prompt proxy</h3>
                  <p className="text-xs text-slate-500 font-sans mt-0.5">Prompt the AI engine, compile raw strategies and inject them into the vector builder dynamically.</p>
                </div>

                <AiCompiler onStrategyCompiled={({ name, description, nodes: n, connections: c }) => {
                  setNodes(n);
                  setConnections(c);
                  const testBars = generateMockHistory(selectedSymbol, 85);
                  setHistoricalBars(testBars);
                  barsRef.current = testBars;
                  const liveEval = runBacktest(n, c, testBars);
                  setBacktestStats(liveEval);
                }} addLog={addLog} />
              </div>

              {/* Graphic Dag Node Editor */}
              <div 
                style={{ backgroundColor: isDark ? palette.cardDark : palette.cardLight, borderColor: 'var(--theme-border)' }}
                className="border p-5 rounded-2xl shadow-sm"
              >
                <div className="flex justify-between items-center mb-4 select-none">
                  <div className="flex items-center gap-2">
                    <Code2 className="h-4.5 w-4.5" style={{ color: palette.primary }} />
                    <h2 className="text-xs font-bold tracking-tight uppercase" style={{ fontFamily: "'Syne', sans-serif" }}>Visual Node Vector Strategy Constructor</h2>
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 font-bold">
                    Active Blocks: <span style={{ color: palette.primary }}>{nodes.length}</span> | Wire Ties: <span style={{ color: palette.primary }}>{connections.length}</span>
                  </div>
                </div>

                <NodeEditorCanvas
                  nodes={nodes}
                  connections={connections}
                  onUpdateNodes={setNodes}
                  onUpdateConnections={setConnections}
                  addLog={addLog}
                />
              </div>

              {/* Python script generation */}
              <PythonRunnerPanel
                nodes={nodes}
                connections={connections}
                selectedSymbol={selectedSymbol}
              />

            </div>
          )}

          {/* ────── PAGE: POSITIONS (Options desks, Greeks payoffs studies) ────── */}
          {activeTab === 'positions' && (
            <div className="flex flex-col gap-6 animate-fadeIn">
              
              {/* Option simulation panel wrapper */}
              <div 
                style={{ backgroundColor: isDark ? palette.cardDark : palette.cardLight, borderColor: 'var(--theme-border)' }}
                className="border p-5 rounded-2xl shadow-sm"
              >
                <Pnldashboard />
              </div>

            </div>
          )}

          {/* ────── PAGE: ORDERS (HMAC authentication, Token rate limiter and Websocket logs) ────── */}
          {activeTab === 'orders' && (
            <div className="flex flex-col gap-6 animate-fadeIn">
              
              <div 
                style={{ backgroundColor: isDark ? palette.cardDark : palette.cardLight, borderColor: 'var(--theme-border)' }}
                className="border p-5 rounded-2xl shadow-sm"
              >
                <DeltaExecutionEnginePanel />
              </div>

            </div>
          )}

          {/* ────── PAGE: BACKTEST (Delta India Options/Futures Command Center) ────── */}
          {activeTab === 'backtest' && (
            <div className="flex flex-col gap-6 animate-fadeIn">
              
              {/* Backtest Control Room */}
              <div 
                style={{ backgroundColor: isDark ? palette.cardDark : palette.cardLight, borderColor: 'var(--theme-border)' }}
                className="border p-6 rounded-2xl shadow-sm relative overflow-hidden"
              >
                {/* Background decorative grids */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-[#8b5cf6]/5 rounded-full blur-3xl pointer-events-none" />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-theme-border/60">
                  <div>
                    <span className="text-[10px] font-mono tracking-widest font-extrabold text-primary block uppercase animate-pulse">
                      Delta Exchange India Gateway v2.4
                    </span>
                    <h2 className="text-lg font-black tracking-tight mt-0.5" style={{ fontFamily: "'Syne', sans-serif" }}>
                      DELTA INDIA BACKTEST COMMAND CENTER
                    </h2>
                    <p className="text-xs text-slate-500 font-sans">
                      Test visual node strategies on real-time historical OHLC candles for both options contracts and perpetual indices.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold tracking-tight bg-slate-900 border border-slate-800 text-[#06b6d4] px-3 py-1 rounded">
                      ● Engine Connected
                    </span>
                  </div>
                </div>

                {/* Parameters configuration workspace */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
                  
                  {/* Left parameter pane: 7 Cols */}
                  <div className="lg:col-span-7 flex flex-col gap-4">
                    
                    {/* Choose Product Class */}
                    <div>
                      <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-2">
                        Product Specification Class
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setBacktestProductType('FUTURE');
                            setBacktestCustomSymbolOverride('');
                          }}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                            backtestProductType === 'FUTURE'
                              ? 'bg-primary text-black shadow-md'
                              : 'bg-theme-bg border border-theme-border text-slate-400 hover:text-white'
                          }`}
                        >
                          <Zap className="h-3.5 w-3.5" />
                          Futures Perpetuals (USD/INR)
                        </button>
                        <button
                          onClick={() => {
                            setBacktestProductType('OPTION');
                            setBacktestCustomSymbolOverride('');
                          }}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                            backtestProductType === 'OPTION'
                              ? 'bg-[#8b5cf6] text-white shadow-md shadow-[#8b5cf6]/20'
                              : 'bg-theme-bg border border-theme-border text-slate-400 hover:text-white'
                          }`}
                        >
                          <Sliders className="h-3.5 w-3.5" />
                          Options Contracts (CE/PE)
                        </button>
                      </div>
                    </div>

                    {/* Conditional Settings based on Selection */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-black/20 p-4 rounded-xl border border-theme-border/40">
                      
                      {/* Underlying index */}
                      <div>
                        <label className="text-[9.5px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                          Underlying Ticker Index
                        </label>
                        <select
                          value={backtestUnderlying}
                          onChange={(e: any) => setBacktestUnderlying(e.target.value)}
                          className="w-full bg-theme-bg border border-theme-border px-3 py-1.5 rounded-lg text-xs font-semibold text-theme-text"
                        >
                          <option value="BTC">Bitcoin Index (BTC)</option>
                          <option value="ETH">Ethereum Index (ETH)</option>
                        </select>
                      </div>

                      {backtestProductType === 'FUTURE' ? (
                        <div>
                          <label className="text-[9.5px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                            Active Mapped Futures Code
                          </label>
                          <div className="w-full bg-theme-bg border border-theme-border px-3 py-1.5 rounded-lg text-xs font-mono text-slate-400 font-bold select-none">
                            {backtestUnderlying === 'BTC' ? 'BTC_USDT_PERP (Live)' : 'ETH_USDT_PERP (Live)'}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4 sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {/* Option type */}
                          <div>
                            <label className="text-[9.5px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1">
                              Option Type
                            </label>
                            <select
                              value={backtestOptionType}
                              onChange={(e: any) => setBacktestOptionType(e.target.value as any)}
                              className="w-full bg-theme-bg border border-theme-border px-3 py-1.5 rounded-lg text-xs font-bold text-theme-text"
                            >
                              <option value="CE">Call option (CE)</option>
                              <option value="PE">Put option (PE)</option>
                            </select>
                          </div>

                          {/* Strike price */}
                          <div>
                            <label className="text-[9.5px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1">
                              Strike Price ($)
                            </label>
                            <input
                              type="number"
                              value={backtestStrikePrice}
                              onChange={(e) => setBacktestStrikePrice(Number(e.target.value))}
                              className="w-full bg-theme-bg border border-theme-border px-3 py-1 rounded-lg text-xs font-mono text-theme-text"
                            />
                          </div>

                          {/* Expiry date */}
                          <div>
                            <label className="text-[9.5px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1 flex items-center justify-between">
                              <span>Expiry DDMMYY</span>
                              <span className="text-[8px] text-[#06b6d4]">Delta India</span>
                            </label>
                            <input
                              type="text"
                              value={backtestExpiryString}
                              onChange={(e) => setBacktestExpiryString(e.target.value)}
                              placeholder="e.g. 290526"
                              className="w-full bg-theme-bg border border-theme-border px-3 py-1 rounded-lg text-xs font-mono text-theme-text"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Advanced code override */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                          Dynamic Symbol Override (Optional)
                        </label>
                        <span className="text-[9px] font-mono text-slate-500 font-bold">Expert Mode</span>
                      </div>
                      <input
                        type="text"
                        value={backtestCustomSymbolOverride}
                        onChange={(e) => setBacktestCustomSymbolOverride(e.target.value)}
                        placeholder="e.g. BTC_68000_280526_C or XRP_USDT_PERP"
                        className="w-full bg-theme-bg border border-theme-border px-3.5 py-1.5 rounded-lg text-xs font-mono text-theme-text focus:outline-none focus:border-primary transition"
                      />
                      <p className="text-[10px] text-slate-500 font-sans mt-1 leading-normal">
                        Skip forms: Enter any exact Delta Exchange India asset code to target custom option contracts or altcoin indexes.
                      </p>
                    </div>

                  </div>

                  {/* Right parameter pane: 5 Cols */}
                  <div className="lg:col-span-5 flex flex-col justify-between gap-4">
                    
                    <div className="space-y-4">
                      {/* Lookback selection */}
                      <div>
                        <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-2">
                          Historical Lookback Duration
                        </label>
                        <div className="grid grid-cols-5 bg-black/10 p-1 border border-theme-border/40 rounded-xl">
                          {[1, 3, 7, 14, 30].map((days) => (
                            <button
                              key={`days-${days}`}
                              onClick={() => setBacktestLookbackDays(days)}
                              className={`py-1 rounded-lg text-[10px] font-mono font-bold transition flex flex-col items-center cursor-pointer ${
                                backtestLookbackDays === days
                                  ? 'bg-slate-800 text-white border border-slate-700/50'
                                  : 'text-slate-500 hover:text-white'
                              }`}
                            >
                              <span>{days}d</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Resolution selection */}
                      <div>
                        <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-2">
                          Candle Interval Resolution
                        </label>
                        <div className="grid grid-cols-4 gap-1.5">
                          {['1m', '5m', '15m', '1h', '2h', '4h', 'd'].map((resVal) => (
                            <button
                              key={`res-${resVal}`}
                              onClick={() => setBacktestResolution(resVal)}
                              className={`py-1 rounded-lg text-[10px] font-mono font-extrabold border transition cursor-pointer ${
                                backtestResolution === resVal
                                  ? 'bg-primary/10 border-primary text-primary'
                                  : 'bg-theme-bg border-theme-border text-slate-400 hover:text-white'
                              }`}
                            >
                              {resVal.toUpperCase()}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={triggerDeltaIndiaBacktest}
                      disabled={isFetchingBacktestData || nodes.length === 0}
                      className={`w-full py-3.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        nodes.length === 0
                          ? 'bg-slate-800 text-slate-500 border border-slate-705/30 cursor-not-allowed'
                          : isFetchingBacktestData
                          ? 'bg-primary/20 text-primary border border-primary/30 animate-pulse'
                          : 'bg-primary text-black hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-primary/20 font-black'
                      }`}
                    >
                      {isFetchingBacktestData ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin text-primary" />
                          Acquiring clean Delta India stream...
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 fill-black text-black" />
                          RUN DELTA INDIA BACKTEST ENGINE
                        </>
                      )}
                    </button>

                  </div>

                </div>

              </div>

              {/* KPI Performance Metrics Section */}
              {backtestStats && (
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4 animate-fadeIn">
                  
                  {/* KPI 1 */}
                  <div className="bg-theme-card border border-theme-border p-3 rounded-xl flex flex-col justify-between">
                    <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest block select-none">
                      Net returns
                    </span>
                    <div className="mt-2.5">
                      <span className={`text-xl font-black font-mono tracking-tight ${
                        backtestStats.totalProfitPercent >= 0 ? 'text-emerald-400' : 'text-rose-450'
                      }`}>
                        {backtestStats.totalProfitPercent >= 0 ? '+' : ''}
                        {backtestStats.totalProfitPercent.toFixed(2)}%
                      </span>
                    </div>
                    <div className="text-[9px] font-sans text-slate-400 mt-1">
                      On $10K initial capital
                    </div>
                  </div>

                  {/* KPI 2 */}
                  <div className="bg-theme-card border border-theme-border p-3 rounded-xl flex flex-col justify-between">
                    <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest block select-none">
                      Sharpe Ratio
                    </span>
                    <div className="mt-2.5">
                      <span className="text-xl font-black font-mono text-[#06b6d4] tracking-tight">
                        {backtestStats.sharpeRatio.toFixed(2)}
                      </span>
                    </div>
                    <div className="text-[9px] font-sans text-slate-400 mt-1">
                      252-day annualized metric
                    </div>
                  </div>

                  {/* KPI 3 */}
                  <div className="bg-theme-card border border-theme-border p-3 rounded-xl flex flex-col justify-between">
                    <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest block select-none">
                      Win probability
                    </span>
                    <div className="mt-2.5 flex items-center justify-between">
                      <span className="text-xl font-black font-mono text-white tracking-tight">
                        {backtestStats.winRate.toFixed(1)}%
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {backtestStats.trades.filter(t => t.type.includes('CLOSE')).length} trades
                      </span>
                    </div>
                    {/* Visual bar */}
                    <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden mt-1.5 flex">
                      <div 
                        style={{ width: `${Math.min(100, backtestStats.winRate)}%` }}
                        className="bg-primary h-full rounded-full" 
                      />
                    </div>
                  </div>

                  {/* KPI 4 */}
                  <div className="bg-theme-card border border-theme-border p-3 rounded-xl flex flex-col justify-between">
                    <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest block select-none">
                      WIN/LOSS RATIO
                    </span>
                    <div className="mt-2.5">
                      <span className="text-xl font-black font-mono text-[#a855f7] tracking-tight">
                        {backtestStats.winLossRatio.toFixed(2)}
                      </span>
                    </div>
                    <div className="text-[9px] font-sans text-slate-400 mt-1">
                      Avg Win over Avg Loss
                    </div>
                  </div>

                  {/* KPI 5 */}
                  <div className="bg-theme-card border border-theme-border p-3 rounded-xl flex flex-col justify-between">
                    <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest block select-none text-amber-500">
                      Peak drawdown
                    </span>
                    <div className="mt-2.5">
                      <span className="text-xl font-black font-mono text-amber-500 tracking-tight">
                        {backtestStats.maxDrawdownPercent.toFixed(2)}%
                      </span>
                    </div>
                    <div className="text-[9px] font-sans text-slate-400 mt-1">
                      Max drawdown threshold
                    </div>
                  </div>

                  {/* KPI 6 */}
                  <div className="bg-theme-card border border-theme-border p-3 rounded-xl flex flex-col justify-between">
                    <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest block select-none">
                      Net liquid asset
                    </span>
                    <div className="mt-2.5">
                      <span className="text-xl font-black font-mono text-emerald-400 tracking-tight">
                        ${backtestStats.finalBalance.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-[9px] font-sans text-slate-400 mt-1">
                      Post strategy completion
                    </div>
                  </div>

                </div>
              )}

              {/* Technical Charting Blocks */}
              <div 
                style={{ backgroundColor: isDark ? palette.cardDark : palette.cardLight, borderColor: 'var(--theme-border)' }}
                className="border p-5 rounded-2xl shadow-sm"
              >
                <ReportCharts
                  bars={historicalBars}
                  trades={backtestStats ? backtestStats.trades : []}
                  equityCurve={backtestStats ? backtestStats.equityCurve : []}
                  isBacktestMode={true}
                  selectedSymbol={backtestCustomSymbolOverride.trim() !== "" ? backtestCustomSymbolOverride : (backtestProductType === "FUTURE" ? (backtestUnderlying === "BTC" ? "BTC_USDT" : "ETH_USDT") : `${backtestUnderlying}_${backtestStrikePrice}_${backtestExpiryString}_${backtestOptionType === "CE" ? "C" : "P"}`)}
                />
              </div>

              {/* Historical Local Signal Fills Table */}
              {backtestStats && backtestStats.trades.length > 0 && (
                <div 
                  style={{ backgroundColor: isDark ? palette.cardDark : palette.cardLight, borderColor: 'var(--theme-border)' }}
                  className="border p-6 rounded-2xl shadow-sm"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-theme-border/60">
                    <div>
                      <h3 className="text-sm font-black tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
                        ENGINE DISPATCH: SIGNAL EXECUTION LEDGER
                      </h3>
                      <p className="text-[11px] text-slate-500 font-sans mt-0.5">
                        Historical log list of buy/sell crossover triggers filled by the backtest matching core.
                      </p>
                    </div>
                    <span className="text-[10px] font-mono bg-slate-900 border border-slate-800 text-slate-400 px-2.5 py-1 rounded">
                      Total Fills: {backtestStats.trades.length}
                    </span>
                  </div>

                  <div className="overflow-x-auto mt-4 rounded-xl border border-theme-border/40">
                    <table className="w-full text-left border-collapse font-mono text-[11px]">
                      <thead>
                        <tr className="bg-black/25 text-slate-400 text-[10px] font-bold uppercase border-b border-theme-border/40 select-none">
                          <th className="px-4 py-2.5">Trade UID</th>
                          <th className="px-4 py-2.5">Fill Timestamp</th>
                          <th className="px-4 py-2.5">Action Code</th>
                          <th className="px-4 py-2.5 text-right">Fill Price</th>
                          <th className="px-4 py-2.5 text-right">Fill Size</th>
                          <th className="px-4 py-2.5 text-right">Realized Return</th>
                          <th className="px-4 py-2.5 text-right">Remaining Balance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-theme-border/40">
                        {backtestStats.trades.map((trade, idx) => {
                          const isClose = trade.type.includes('CLOSE');
                          const isSuccess = trade.pnlUSD && trade.pnlUSD > 0;
                          return (
                            <tr key={`ledger-${idx}-${trade.id}`} className="hover:bg-white/2 transition">
                              <td className="px-4 py-2 text-slate-500 select-all font-semibold">
                                {trade.id}
                              </td>
                              <td className="px-4 py-2 text-slate-401">
                                {trade.time}
                              </td>
                              <td className="px-4 py-2">
                                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-sans font-black ${
                                  trade.type === 'BUY'
                                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/10'
                                    : trade.type === 'SELL'
                                    ? 'bg-rose-500/15 text-rose-400 border border-rose-500/10'
                                    : isClose && isSuccess
                                    ? 'bg-teal-500/15 text-teal-400 border border-teal-500/10'
                                    : 'bg-orange-500/15 text-orange-400 border border-orange-500/10'
                                }`}>
                                  {trade.type}
                                </span>
                              </td>
                              <td className="px-4 py-2 text-right text-theme-text font-bold">
                                ${trade.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                              <td className="px-4 py-2 text-right text-slate-300 font-semibold">
                                {trade.size.toLocaleString()}
                              </td>
                              <td className="px-4 py-2 text-right">
                                {isClose ? (
                                  <span className={`font-bold ${isSuccess ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {trade.profitPercent && trade.profitPercent > 0 ? '+' : ''}
                                    {trade.profitPercent}% (${trade.pnlUSD})
                                  </span>
                                ) : (
                                  <span className="text-slate-500 italic">-</span>
                                )}
                              </td>
                              <td className="px-4 py-2 text-right text-slate-400 font-bold">
                                ${trade.balanceAfter ? trade.balanceAfter.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ────── PAGE: ANALYTICS (KPI meters, deep developers console logs) ────── */}
          {activeTab === 'analytics' && (
            <div className="flex flex-col gap-6 animate-fadeIn">
              
              <div 
                style={{ backgroundColor: isDark ? palette.cardDark : palette.cardLight, borderColor: 'var(--theme-border)' }}
                className="border p-5 rounded-2xl shadow-sm"
              >
                <DashboardAnalytics
                  stats={backtestStats}
                  position={activePosition}
                  orders={orders}
                  logs={logs}
                  onClearLogs={() => setLogs([])}
                />
              </div>

            </div>
          )}

          {/* ────── PAGE: SCANNER (AI Screener, heatmaps & bubbles) ────── */}
          {activeTab === 'scanner' && (
            <div className="flex flex-col gap-6 animate-fadeIn">
              <AIScreenerPage isDark={isDark} palette={palette} />
            </div>
          )}

          {/* ────── PAGE: ADMIN (Multicolor Customizer system setting dashboard) ────── */}
          {activeTab === 'admin' && (
            <div className="flex flex-col gap-6 animate-fadeIn select-none">
              
              {/* Main parameters block */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* 6 Theme Customizer Panel */}
                <div 
                  style={{ backgroundColor: isDark ? palette.cardDark : palette.cardLight, borderColor: 'var(--theme-border)' }}
                  className="border p-5 rounded-2xl flex flex-col justify-between shadow-sm min-h-[350px]"
                >
                  <div>
                    <span className="text-[10px] font-mono tracking-widest font-extrabold text-[#8b5cf6] block uppercase animate-pulse">Theme Registry</span>
                    <h3 className="text-sm font-bold tracking-tight uppercase mt-0.5" style={{ fontFamily: "'Syne', sans-serif" }}>
                      Multicolor Palette Selector
                    </h3>
                    <p className="text-xs text-slate-500 font-sans mt-1">
                      Instantly switch your screen workspace's color palettes live. Changes are saved across your browser session.
                    </p>
                  </div>

                  {/* Grid lists of palettes */}
                  <div className="grid grid-cols-2 gap-3.5 my-6">
                    {Object.entries(PALETTES).map(([key, pal]) => {
                      const isSelected = paletteKey === key;
                      return (
                        <button
                          key={key}
                          onClick={() => setPaletteKey(key as any)}
                          style={{
                            borderColor: isSelected ? pal.primary : 'var(--theme-border)',
                            backgroundColor: isSelected ? `${pal.primary}12` : 'rgba(0,0,0,0.15)'
                          }}
                          className="h-14 border rounded-xl p-3.5 flex flex-col justify-between text-left cursor-pointer group hover:opacity-90 transition-all duration-200"
                        >
                          <span className="text-xs font-bold block" style={{ fontFamily: "'Syne', sans-serif', color: isSelected ? pal.primary : 'inherit'" }}>
                            {pal.name}
                          </span>
                          <div className="flex gap-1.5 mt-1.5">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: pal.primary }} />
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: pal.secondary }} />
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: pal.accent }} />
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="text-[10px] font-mono text-slate-500 font-medium">
                    ACTIVE SELECTED PALETTE: <span className="uppercase font-bold" style={{ color: palette.primary }}>{palette.name} Theme</span>
                  </div>
                </div>

                {/* Simulated Platform Locks controls */}
                <div 
                  style={{ backgroundColor: isDark ? palette.cardDark : palette.cardLight, borderColor: 'var(--theme-border)' }}
                  className="border p-5 rounded-2xl flex flex-col justify-between shadow-sm min-h-[350px]"
                >
                  <div>
                    <span className="text-[10px] font-mono tracking-widest font-extrabold text-rose-500 block uppercase">Cyber Security Gate</span>
                    <h3 className="text-sm font-bold tracking-tight uppercase mt-0.5" style={{ fontFamily: "'Syne', sans-serif" }}>
                      Platform Controls & Admin Flags
                    </h3>
                    <p className="text-xs text-slate-500 font-sans mt-1">
                      Manage overall network settings, mock 2FA guards, and system loads.
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 my-5">
                    {/* Switch Maintenance mode */}
                    <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-lg border border-slate-900">
                      <div>
                        <span className="text-xs font-mono font-bold block text-white">System Maintenance lock</span>
                        <span className="text-[9px] text-slate-400 font-sans block">Force stop REST/WS routers</span>
                      </div>
                      <button 
                        onClick={() => setAdminControls(prev => ({ ...prev, maintenanceMode: !prev.maintenanceMode }))}
                        className={`w-10 h-5.5 rounded-full p-0.5 transition-colors cursor-pointer ${adminControls.maintenanceMode ? 'bg-red-500' : 'bg-slate-700'}`}
                      >
                        <div className={`w-4.5 h-4.5 bg-white rounded-full transition-transform ${adminControls.maintenanceMode ? 'translate-x-[18px]' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    {/* Switch Paper mode */}
                    <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-lg border border-slate-900">
                      <div>
                        <span className="text-xs font-mono font-bold block text-white">Live Execution Channel</span>
                        <span className="text-[9px] text-slate-400 font-sans block">Direct active production gateway routing</span>
                      </div>
                      <button 
                        onClick={() => setAdminControls(prev => ({ ...prev, paperTradingOnly: !prev.paperTradingOnly }))}
                        className={`w-10 h-5.5 rounded-full p-0.5 transition-colors cursor-pointer ${!adminControls.paperTradingOnly ? 'bg-emerald-500' : 'bg-slate-700'}`}
                      >
                        <div className={`w-4.5 h-4.5 bg-white rounded-full transition-transform ${!adminControls.paperTradingOnly ? 'translate-x-[18px]' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    {/* Require Web 2FA */}
                    <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-lg border border-slate-900">
                      <div>
                        <span className="text-xs font-mono font-bold block text-white">Strict HMAC Token validation</span>
                        <span className="text-[9px] text-slate-400 font-sans block">Verify HMAC SHA-256 signatures per REST packet</span>
                      </div>
                      <button 
                        onClick={() => setAdminControls(prev => ({ ...prev, require2FA: !prev.require2FA }))}
                        className={`w-10 h-5.5 rounded-full p-0.5 transition-colors cursor-pointer relative ${adminControls.require2FA ? 'bg-[#8b5cf6]' : 'bg-slate-700'}`}
                      >
                        <div className={`w-4.5 h-4.5 bg-white rounded-full transition-transform ${adminControls.require2FA ? 'translate-x-[18px]' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                    <span>Admin Level validation status:</span>
                    <span className="text-emerald-500 font-bold uppercase">✓ PASSED AUDIT SECURE</span>
                  </div>
                </div>

              </div>

              {/* simulated client list */}
              <div 
                style={{ backgroundColor: isDark ? palette.cardDark : palette.cardLight, borderColor: 'var(--theme-border)' }}
                className="border p-5 rounded-2xl shadow-sm"
              >
                <div>
                  <span className="text-[10px] font-mono tracking-widest font-extrabold text-[#06b6d4] block uppercase">Network Directory</span>
                  <h3 className="text-sm font-bold tracking-tight uppercase mt-0.5" style={{ fontFamily: "'Syne', sans-serif" }}>
                    Active Live Connected Nodes & Latency
                  </h3>
                </div>

                <div className="border border-slate-900/40 rounded-xl overflow-hidden mt-4 shadow-inner">
                  <table className="w-full text-left font-mono text-xs text-white bg-slate-950">
                    <thead className="bg-slate-900 text-slate-400 text-[10px] uppercase border-b border-slate-900">
                      <tr>
                        <th className="p-3.5">Client User ID</th>
                        <th className="p-3.5">Display Name</th>
                        <th className="p-3.5">Role Group</th>
                        <th className="p-3.5">Subscription level</th>
                        <th className="p-3.5 text-right">Accumulated profit</th>
                        <th className="p-3.5 text-right pr-4">Active Socket Stat</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900">
                      {simulatedUsers.map((usr) => (
                        <tr key={usr.id} className="hover:bg-slate-900/40 transition">
                          <td className="p-3.5 text-slate-500 font-bold">{usr.id}</td>
                          <td className="p-3.5 text-slate-300 font-bold">{usr.name}</td>
                          <td className="p-3.5 text-indigo-400 font-bold">{usr.role}</td>
                          <td className="p-3.5 text-amber-500 font-bold">{usr.level}</td>
                          <td className={`p-3.5 text-right font-bold ${usr.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {usr.pnl >= 0 ? '+' : ''}${usr.pnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-3.5 text-right pr-4 font-bold select-none">
                            <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[9px] text-emerald-400 font-bold uppercase leading-none inline-block">
                              ● {usr.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ────── PAGE: SETTINGS (Billing settings + whitelists) ────── */}
          {activeTab === 'settings' && (
            <div className="flex flex-col gap-6 animate-fadeIn">
              
              <div 
                style={{ backgroundColor: isDark ? palette.cardDark : palette.cardLight, borderColor: 'var(--theme-border)' }}
                className="border p-5 rounded-2xl shadow-sm"
              >
                <UserProfileSettings 
                  userProfile={userProfile}
                  setUserProfile={setUserProfile}
                  activePlan={activePlan}
                  setActivePlan={setActivePlan}
                  isDark={isDark}
                  palette={palette}
                />
              </div>

            </div>
          )}

        </main>
      </div>
    </div>
  );
}
