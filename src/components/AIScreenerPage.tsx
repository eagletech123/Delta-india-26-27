import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Search, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Info, 
  Layers, 
  Coins, 
  LayoutGrid, 
  ScatterChart, 
  SlidersHorizontal,
  ChevronRight,
  Database,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

// Structuring mock screener datasets for Coins, Futures, and Options
interface ScreenerItem {
  id: string;
  symbol: string;
  name: string;
  type: 'coin' | 'futures' | 'options';
  price: number;
  change24h: number; // percentage
  volume24h: number; // in USD
  aiScore: number; // 0 to 100 neural model confidence
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  openInterest?: number; // for futures & options
  fundingRate?: number; // for futures
  basisPremium?: number; // for futures
  delta?: number; // for options
  theta?: number; // for options
  iv?: number; // implied volatility for options
  strike?: number; // strike price for options
  supportPrice: number;
  resistancePrice: number;
  aiSignalRationale: string;
}

const INITIAL_SCREENER_ITEMS: ScreenerItem[] = [
  // --- COINS CLASS ---
  {
    id: 'coin_btc',
    symbol: 'BTC',
    name: 'Bitcoin',
    type: 'coin',
    price: 79842.10,
    change24h: 2.45,
    volume24h: 28400000000,
    aiScore: 94,
    sentiment: 'BULLISH',
    supportPrice: 78500,
    resistancePrice: 82000,
    aiSignalRationale: 'Strong orderbook buy clusters at 78k, combined with sustained spot inflow. Neural models show breakout consolidation.'
  },
  {
    id: 'coin_eth',
    symbol: 'ETH',
    name: 'Ethereum',
    type: 'coin',
    price: 3412.50,
    change24h: 1.12,
    volume24h: 14100000000,
    aiScore: 85,
    sentiment: 'BULLISH',
    supportPrice: 3350,
    resistancePrice: 3520,
    aiSignalRationale: 'Sustained layer-2 fee activity and strong gas consumption ratios are supporting the base-layer value accrual model.'
  },
  {
    id: 'coin_sol',
    symbol: 'SOL',
    name: 'Solana',
    type: 'coin',
    price: 145.20,
    change24h: 5.82,
    volume24h: 4500000000,
    aiScore: 91,
    sentiment: 'BULLISH',
    supportPrice: 138.00,
    resistancePrice: 154.00,
    aiSignalRationale: 'High DEX transaction velocity combined with institutional storage integrations are pushing buy momentum above 50-EMA.'
  },
  {
    id: 'coin_xrp',
    symbol: 'XRP',
    name: 'Ripple',
    type: 'coin',
    price: 0.592,
    change24h: -1.45,
    volume24h: 1200000000,
    aiScore: 42,
    sentiment: 'BEARISH',
    supportPrice: 0.550,
    resistancePrice: 0.610,
    aiSignalRationale: 'Resistance build-up at 100-MA combined with active sell clusters from primary whale distribution vectors.'
  },
  {
    id: 'coin_ada',
    symbol: 'ADA',
    name: 'Cardano',
    type: 'coin',
    price: 0.485,
    change24h: -2.10,
    volume24h: 450000000,
    aiScore: 48,
    sentiment: 'NEUTRAL',
    supportPrice: 0.460,
    resistancePrice: 0.510,
    aiSignalRationale: 'Consolidating in structural wedge form. Low whale transaction density suggests sideways movement within a 4.5% range.'
  },
  {
    id: 'coin_doge',
    symbol: 'DOGE',
    name: 'Dogecoin',
    type: 'coin',
    price: 0.138,
    change24h: 12.40,
    volume24h: 3200000000,
    aiScore: 88,
    sentiment: 'BULLISH',
    supportPrice: 0.120,
    resistancePrice: 0.155,
    aiSignalRationale: 'Social mentions and volume triggers have crossed historical standard deviations, pointing to high-momentum continuation.'
  },
  {
    id: 'coin_dot',
    symbol: 'DOT',
    name: 'Polkadot',
    type: 'coin',
    price: 6.42,
    change24h: -0.80,
    volume24h: 210000000,
    aiScore: 55,
    sentiment: 'NEUTRAL',
    supportPrice: 6.10,
    resistancePrice: 6.70,
    aiSignalRationale: 'Sideways channels on low trade volumes. Relayed chains updates have neutral short-term market impact.'
  },
  {
    id: 'coin_link',
    symbol: 'LINK',
    name: 'Chainlink',
    type: 'coin',
    price: 15.40,
    change24h: 3.15,
    volume24h: 680000000,
    aiScore: 79,
    sentiment: 'BULLISH',
    supportPrice: 14.50,
    resistancePrice: 16.20,
    aiSignalRationale: 'CCIP oracle integration expansion onto multiple banking networks boosts long-term accumulation indices.'
  },
  {
    id: 'coin_bnb',
    symbol: 'BNB',
    name: 'Binance Coin',
    type: 'coin',
    price: 584.10,
    change24h: 0.45,
    volume24h: 1100000000,
    aiScore: 72,
    sentiment: 'NEUTRAL',
    supportPrice: 570.00,
    resistancePrice: 605.00,
    aiSignalRationale: 'Accumulation pattern around current pivot point. Launchpool staking demands protect the downside from severe corrections.'
  },
  {
    id: 'coin_avax',
    symbol: 'AVAX',
    name: 'Avalanche',
    type: 'coin',
    price: 34.80,
    change24h: -3.42,
    volume24h: 580000000,
    aiScore: 38,
    sentiment: 'BEARISH',
    supportPrice: 32.50,
    resistancePrice: 36.80,
    aiSignalRationale: 'Token unlock events schedule is pricing in short-term sell pressure. RSI values are sloping down below the 40 mark.'
  },

  // --- FUTURES CLASS ---
  {
    id: 'fut_btc_perp',
    symbol: 'BTC-USD-PERP',
    name: 'Bitcoin Perpetual Futures',
    type: 'futures',
    price: 79910.00,
    change24h: 2.52,
    volume24h: 18200000000,
    aiScore: 93,
    sentiment: 'BULLISH',
    openInterest: 12400000000,
    fundingRate: 0.00012,
    basisPremium: 1.15,
    supportPrice: 78600,
    resistancePrice: 82100,
    aiSignalRationale: 'High leverage open interest buildup paired with positive premium basis indicate strong taker long momentum.'
  },
  {
    id: 'fut_eth_perp',
    symbol: 'ETH-USD-PERP',
    name: 'Ethereum Perpetual Futures',
    type: 'futures',
    price: 3415.50,
    change24h: 1.18,
    volume24h: 9400000000,
    aiScore: 86,
    sentiment: 'BULLISH',
    openInterest: 7100000000,
    fundingRate: 0.00008,
    basisPremium: 0.85,
    supportPrice: 3360,
    resistancePrice: 3535,
    aiSignalRationale: 'Slight leverage long bias. Open interest shows multi-day scaling, projecting steady upward drift forecasts.'
  },
  {
    id: 'fut_sol_perp',
    symbol: 'SOL-USD-PERP',
    name: 'Solana Perpetual Futures',
    type: 'futures',
    price: 145.60,
    change24h: 6.10,
    volume24h: 3100000000,
    aiScore: 92,
    sentiment: 'BULLISH',
    openInterest: 1800000000,
    fundingRate: 0.00024,
    basisPremium: 2.40,
    supportPrice: 139.00,
    resistancePrice: 155.00,
    aiSignalRationale: 'Funding spike highlights intensive speculative taker buying. Expected local volatility but structurally bullish.'
  },
  {
    id: 'fut_xrp_perp',
    symbol: 'XRP-USD-PERP',
    name: 'Ripple Perpetual Futures',
    type: 'futures',
    price: 0.593,
    change24h: -1.35,
    volume24h: 810000000,
    aiScore: 41,
    sentiment: 'BEARISH',
    openInterest: 540000000,
    fundingRate: 0.00005,
    basisPremium: -0.05,
    supportPrice: 0.555,
    resistancePrice: 0.612,
    aiSignalRationale: 'Short positioning is mounting up. Negative funding metrics on several cross-derivative markets suggest downside target.'
  },
  {
    id: 'fut_doge_perp',
    symbol: 'DOGE-USD-PERP',
    name: 'Dogecoin Perpetual Futures',
    type: 'futures',
    price: 0.139,
    change24h: 12.65,
    volume24h: 2200000000,
    aiScore: 87,
    sentiment: 'BULLISH',
    openInterest: 890000000,
    fundingRate: 0.00035,
    basisPremium: 3.12,
    supportPrice: 0.122,
    resistancePrice: 0.158,
    aiSignalRationale: 'Intense short-liquidations cascade triggering price expansion. Momentum algorithms suggest trailing stops above 0.130.'
  },

  // --- OPTIONS CLASS ---
  {
    id: 'opt_btc_120k_c',
    symbol: 'BTC-120K-C-26JUN',
    name: 'BTC $120,000 Call Option',
    type: 'options',
    price: 1450.00,
    change24h: 25.40,
    volume24h: 145000000,
    aiScore: 82,
    sentiment: 'BULLISH',
    openInterest: 320000000,
    delta: 0.35,
    theta: -142.50,
    iv: 62.4,
    strike: 120000,
    supportPrice: 1200,
    resistancePrice: 1850,
    aiSignalRationale: 'Aggressive institutional call-buying flow has entered the June expiration block. High delta leverage signal.'
  },
  {
    id: 'opt_btc_110k_c',
    symbol: 'BTC-110K-C-26JUN',
    name: 'BTC $110,000 Call Option',
    type: 'options',
    price: 2840.00,
    change24h: 18.20,
    volume24h: 180000000,
    aiScore: 85,
    sentiment: 'BULLISH',
    openInterest: 240000000,
    delta: 0.48,
    theta: -165.20,
    iv: 60.1,
    strike: 110000,
    supportPrice: 2500,
    resistancePrice: 3200,
    aiSignalRationale: 'Near-the-money delta acceleration indices reflect positive gamma-squeeze probability as spot scales over 80k.'
  },
  {
    id: 'opt_btc_75k_p',
    symbol: 'BTC-75K-P-26JUN',
    name: 'BTC $75,000 Put Option',
    type: 'options',
    price: 840.00,
    change24h: -32.50,
    volume24h: 90000000,
    aiScore: 28,
    sentiment: 'BEARISH',
    openInterest: 410000000,
    delta: -0.15,
    theta: -98.40,
    iv: 65.8,
    strike: 75000,
    supportPrice: 600,
    resistancePrice: 1150,
    aiSignalRationale: 'Extremely quick implied volatility attrition because of price support at key psychological 78k spot thresholds.'
  },
  {
    id: 'opt_eth_3600_c',
    symbol: 'ETH-3600-C-26JUN',
    name: 'ETH $3,600 Call Option',
    type: 'options',
    price: 145.00,
    change24h: 8.20,
    volume24h: 55000000,
    aiScore: 74,
    sentiment: 'BULLISH',
    openInterest: 110000000,
    delta: 0.41,
    theta: -18.40,
    iv: 58.2,
    strike: 3600,
    supportPrice: 125,
    resistancePrice: 175,
    aiSignalRationale: 'Volatility premium curves on local calls have flattened, inviting cheap protective overlay buys for smart desks.'
  },
  {
    id: 'opt_eth_3200_p',
    symbol: 'ETH-3200-P-26JUN',
    name: 'ETH $3,200 Put Option',
    type: 'options',
    price: 112.00,
    change24h: -15.10,
    volume24h: 72000000,
    aiScore: 34,
    sentiment: 'BEARISH',
    openInterest: 150000000,
    delta: -0.32,
    theta: -21.10,
    iv: 61.4,
    strike: 3200,
    supportPrice: 85,
    resistancePrice: 140,
    aiSignalRationale: 'Time decay theta degradation outpacing downside spot pressure. Put options trading as defensive hedges only.'
  }
];

export default function AIScreenerPage({ 
  isDark = true, 
  palette 
}: { 
  isDark?: boolean; 
  palette?: {
    primary: string;
    secondary: string;
    accent: string;
    bgDark: string;
    bgLight: string;
    cardDark: string;
    cardLight: string;
    textDark: string;
    textLight: string;
    borderDark: string;
    borderLight: string;
    glow: string;
  }
}) {
  const [items, setItems] = useState<ScreenerItem[]>(INITIAL_SCREENER_ITEMS);
  const [selectedAssetClass, setSelectedAssetClass] = useState<'all' | 'coin' | 'futures' | 'options'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState<'ALL' | 'BULLISH' | 'BEARISH' | 'NEUTRAL'>('ALL');
  const [minAiScore, setMinAiScore] = useState(0);
  const [minVolumeUSD, setMinVolumeUSD] = useState<number>(0);
  const [activeVisualMode, setActiveVisualMode] = useState<'heatmap' | 'bubble' | 'ledger'>('bubble');
  const [selectedItem, setSelectedItem] = useState<ScreenerItem | null>(INITIAL_SCREENER_ITEMS[0]);

  // Periodic random live fluctuation logic to keep the page highly interactive
  useEffect(() => {
    const interval = setInterval(() => {
      setItems(prev => prev.map(item => {
        // Slighter percentage changes fluctuating
        const changeDelta = (Math.random() - 0.5) * 0.4;
        const newChange = parseFloat((item.change24h + changeDelta).toFixed(2));
        
        let multiplier = 1 + (changeDelta / 100);
        let newPrice = parseFloat((item.price * multiplier).toFixed(item.price < 10 ? 3 : 2));
        
        // Sometimes AI score re-rates slightly
        let scoreOffset = Math.random() > 0.85 ? (Math.random() > 0.5 ? 1 : -1) : 0;
        let newScore = Math.max(0, Math.min(100, item.aiScore + scoreOffset));

        return {
          ...item,
          price: newPrice,
          change24h: newChange,
          aiScore: newScore
        };
      }));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Filter calculations
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchClass = selectedAssetClass === 'all' || item.type === selectedAssetClass;
      const matchSearch = item.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchSentiment = sentimentFilter === 'ALL' || item.sentiment === sentimentFilter;
      const matchScore = item.aiScore >= minAiScore;
      const matchVolume = item.volume24h >= minVolumeUSD;

      return matchClass && matchSearch && matchSentiment && matchScore && matchVolume;
    });
  }, [items, selectedAssetClass, searchQuery, sentimentFilter, minAiScore, minVolumeUSD]);

  // Handle selecting an item
  const handleSelectItem = (item: ScreenerItem) => {
    setSelectedItem(item);
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn text-theme-text select-none">
      
      {/* SECTION HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] font-mono tracking-widest font-extrabold text-primary block uppercase bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-md w-fit mb-1.5 shadow-[0_0_10px_rgba(var(--color-primary),0.1)]">
            ⚡ PHASE 3 NEURAL MATRIX ENGINE
          </span>
          <h2 className={`text-xl md:text-2xl font-bold font-sans tracking-tight uppercase ${isDark ? 'text-white' : 'text-slate-900'}`} style={{ fontFamily: "'Syne', sans-serif" }}>
            Axiom AI Neural Screener
          </h2>
          <p className={`text-xs mt-1 max-w-2xl leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-650'}`}>
            Deploy live regression models across Perpetual futures premium basis targets, option Greek delta spreads, and altcoin spot volumes.
          </p>
        </div>

        {/* STAT OVERVIEW BANNER */}
        <div className="flex items-center gap-3.5 bg-theme-card/60 border border-theme-border p-3.5 rounded-xl shadow-inner text-xs font-mono">
          <div className="text-center px-2">
            <span className={`text-[10px] uppercase font-bold block ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>TRACKING</span>
            <span className={`font-black text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{items.length} Markets</span>
          </div>
          <div className="w-px h-8 bg-theme-border/50" />
          <div className="text-center px-2">
            <span className={`text-[10px] uppercase font-bold block ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>AI SIGNAL RATE</span>
            <span className={`font-black text-sm ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>68.4% Bullish</span>
          </div>
          <div className="w-px h-8 bg-theme-border/50" />
          <div className="text-center px-2">
            <span className={`text-[10px] uppercase font-bold block ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>MODEL BIAS</span>
            <span className="font-black text-sm" style={{ color: isDark ? 'var(--color-primary)' : '#7C3AED' }}>ACCELERATIVE</span>
          </div>
        </div>
      </div>

      {/* --- FILTER CONTROL BOARD PANEL --- */}
      <div className="bg-theme-card border border-theme-border p-4.5 rounded-2xl flex flex-col gap-4 shadow-md bg-gradient-to-br from-theme-card/90 to-theme-bg/95 relative overflow-hidden backdrop-blur-md">
        <div className="flex items-center gap-2 mb-1">
          <SlidersHorizontal className="h-4.5 w-4.5 text-primary" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-theme-text font-sans">
            AI Screening Threshold Controls
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* SEARCH BAR INPUT */}
          <div className="flex flex-col gap-1.5">
            <label className={`text-[10px] font-mono uppercase font-black ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Search Instruments</label>
            <div className="relative">
              <input
                type="text"
                placeholder="BTC, SOL, option call..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-theme-bg/85 border border-theme-border rounded-lg pl-8 pr-3 py-1.5 text-xs text-theme-text outline-none focus:border-primary/50 transition-colors"
              />
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-500" />
            </div>
          </div>

          {/* SENTIMENT RE-RATING DROPDOWN */}
          <div className="flex flex-col gap-1.5">
            <label className={`text-[10px] font-mono uppercase font-black ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>AI Sentiment Bias</label>
            <select
              value={sentimentFilter}
              onChange={(e) => setSentimentFilter(e.target.value as any)}
              className="w-full bg-theme-bg/85 border border-theme-border rounded-lg px-3 py-1.5 text-xs text-theme-text outline-none focus:border-primary/50 cursor-pointer transition-colors animate-fadeIn"
            >
              <option value="ALL" className="bg-theme-card text-theme-text">ALL SENTIMENTS</option>
              <option value="BULLISH" className="bg-theme-card text-theme-text">🟢 BULLISH SCORE</option>
              <option value="BEARISH" className="bg-theme-card text-theme-text">🔴 BEARISH SCORE</option>
              <option value="NEUTRAL" className="bg-theme-card text-theme-text">⚪ NEUTRAL RANGE</option>
            </select>
          </div>

          {/* AI SCORE THRESHOLD SLIDER */}
          <div className="flex flex-col gap-1.5">
            <div className={`flex justify-between items-center text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              <span className="uppercase font-black">Min Neural Confidence Score</span>
              <span className="text-primary font-bold">{minAiScore}</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="range"
                min="0"
                max="95"
                value={minAiScore}
                onChange={(e) => setMinAiScore(Number(e.target.value))}
                className="w-full h-1 bg-theme-border rounded-lg appearance-none cursor-pointer accent-[var(--color-primary)]"
              />
            </div>
          </div>

          {/* MINIMUM VOLUME FILTER */}
          <div className="flex flex-col gap-1.5">
            <label className={`text-[10px] font-mono uppercase font-black ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Min 24H Liquidity</label>
            <select
              value={minVolumeUSD}
              onChange={(e) => setMinVolumeUSD(Number(e.target.value))}
              className="w-full bg-theme-bg/85 border border-theme-border rounded-lg px-3 py-1.5 text-xs text-theme-text outline-none focus:border-primary/50 cursor-pointer transition-colors"
            >
              <option value={0} className="bg-theme-card text-theme-text">ALL LIQUIDITY RATES</option>
              <option value={100000000} className="bg-theme-card text-theme-text">🎯 ABOVE $100M USD</option>
              <option value={500000000} className="bg-theme-card text-theme-text">💎 INSTITUTIONAL &gt; $500M</option>
              <option value={5000000000} className="bg-theme-card text-theme-text">🐋 ULTRA-WHALE &gt; $5B</option>
            </select>
          </div>

        </div>

        {/* ASSET CLASS SELECTOR TABS BAR */}
        <div className="flex border-t border-theme-border/50 pt-3.5 mt-1 items-center justify-between flex-wrap gap-3">
          <div className={`flex border p-1 rounded-xl text-xs sm:w-auto ${isDark ? 'bg-black/40 border-theme-border' : 'bg-slate-100 hover:bg-slate-200/20 border-slate-200'}`}>
            <button
              onClick={() => setSelectedAssetClass('all')}
              className={`px-4 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                selectedAssetClass === 'all' 
                  ? (isDark ? 'bg-theme-border text-white' : 'bg-white text-slate-900 shadow-sm border border-slate-200/60') 
                  : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')
              }`}
            >
              All Instruments
            </button>
            <button
              onClick={() => setSelectedAssetClass('coin')}
              className={`px-4 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                selectedAssetClass === 'coin' 
                  ? 'bg-primary text-slate-950 font-black shadow-sm' 
                  : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')
              }`}
            >
              <Coins className="h-3.5 w-3.5" />
              <span>Coins</span>
            </button>
            <button
              onClick={() => setSelectedAssetClass('futures')}
              className={`px-4 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                selectedAssetClass === 'futures' 
                  ? 'bg-[#06b6d4] text-white font-black shadow-sm' 
                  : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')
              }`}
            >
              <Activity className="h-3.5 w-3.5" />
              <span>Perp Futures</span>
            </button>
            <button
              onClick={() => setSelectedAssetClass('options')}
              className={`px-4 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                selectedAssetClass === 'options' 
                  ? (isDark ? 'bg-cyan-400/20 border border-cyan-400/35 text-cyan-400 font-extrabold shadow-sm' : 'bg-cyan-100 border border-cyan-300 text-cyan-700 font-extrabold shadow-sm') 
                  : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Options Greeks</span>
            </button>
          </div>

          {/* CHANGER FOR SYSTEM LAYOUT VIEWS */}
          <div className={`flex border p-1 rounded-xl text-xs ${isDark ? 'bg-black/40 border-theme-border' : 'bg-slate-100 border-slate-200'}`}>
            <button
              onClick={() => setActiveVisualMode('bubble')}
              className={`px-3 py-1.2 rounded-lg font-bold transition duration-200.5 flex items-center gap-1 cursor-pointer ${
                activeVisualMode === 'bubble' 
                  ? 'bg-primary text-black font-black' 
                  : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')
              }`}
            >
              <span>Vector Bubble Map</span>
            </button>
            <button
              onClick={() => setActiveVisualMode('heatmap')}
              className={`px-3 py-1.2 rounded-lg font-bold transition duration-200.5 flex items-center gap-1 cursor-pointer ${
                activeVisualMode === 'heatmap' 
                  ? 'bg-primary text-black font-black' 
                  : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-100')
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Grid Heatmap</span>
            </button>
            <button
              onClick={() => setActiveVisualMode('ledger')}
              className={`px-3 py-1.2 rounded-lg font-bold transition duration-200.5 flex items-center gap-1 cursor-pointer ${
                activeVisualMode === 'ledger' 
                  ? 'bg-primary text-black font-black' 
                  : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-100')
              }`}
            >
              <span>Screener Ledger</span>
            </button>
          </div>
        </div>
      </div>

      {/* --- MIDDLE PLACEMENT SHAPES GRIDS --- */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* VIEW COLUMN 8_OF_12 */}
        <div className="xl:col-span-8 flex flex-col gap-6">
          
          {/* DISPLAY RENDERING AREA */}
          <div className="bg-theme-card border border-theme-border rounded-2xl p-5 shadow-sm min-h-[460px] flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center pb-3 border-b border-theme-border mb-4">
                <div>
                  <h3 className={`text-sm font-sans font-black uppercase tracking-wide ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {activeVisualMode === 'bubble' ? 'Neural Vector Volatility Cluster' : 
                     activeVisualMode === 'heatmap' ? 'Screener Core Heatmap Grid Matrix' : 
                     'Market Screener Ledger Record Matrix'}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono">
                    FILTER MATCHES: <span className="text-primary font-bold">{filteredItems.length} Instruments</span> out of {items.length} total active matrices.
                  </p>
                </div>
                <span className="text-[10.5px] font-mono text-slate-500 font-black flex items-center gap-1.5 select-none uppercase">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                  Live Sync Engine Active
                </span>
              </div>

              {/* BUBBLE HEATMAP VIEWPORT */}
              {activeVisualMode === 'bubble' && (
                <div className={`relative w-full h-[360px] rounded-xl overflow-hidden border flex flex-col justify-end p-2 ${isDark ? 'bg-black/60 border-theme-border' : 'bg-slate-100/90 border-slate-200'}`}>
                  
                  {/* BUBBLE SCATTER PLOT BACKGROUND AXIS LABELS */}
                  <div className="absolute top-4 left-4 text-[9px] font-mono text-slate-500 flex flex-col gap-0.5">
                    <span className="text-primary font-bold">Y-Axis: Neural Confidence Bias (0% to 100%)</span>
                    <span>X-Axis: Asset 24H Price Change (-15% to +15%)</span>
                    <span>Bubble Radius: 24H Trade Volume Density (USD)</span>
                  </div>

                  {/* Y-axis indicators */}
                  <div className="absolute left-3 top-10 bottom-10 flex flex-col justify-between text-[8px] font-mono text-slate-650 select-none pointer-events-none">
                    <span>100% Neural</span>
                    <span>75% Max</span>
                    <span>50% Mid</span>
                    <span>25% Vol</span>
                    <span>0% Neutral</span>
                  </div>

                  {/* X-axis indicators */}
                  <div className="absolute bottom-6 left-12 right-12 flex justify-between text-[8px] font-mono text-slate-655 select-none pointer-events-none">
                    <span>-15% Bearish Limit</span>
                    <span>0% Flat Pivot</span>
                    <span>+15% Bullish Scale</span>
                  </div>

                  {/* Midline horizontal guideline */}
                  <div className="absolute left-10 right-4 top-1/2 h-px border-t border-dashed border-theme-border/25 pointer-events-none" />
                  {/* Vertical midline */}
                  <div className="absolute top-4 bottom-4 left-1/2 w-px border-l border-dashed border-theme-border/25 pointer-events-none" />

                  {/* HTML/SVG Interactive scatter bubble chart */}
                  <svg className="w-full h-[320px] pb-4 z-10" viewBox="0 0 1000 320" preserveAspectRatio="none">
                    {filteredItems.map((item) => {
                      // Map Daily Change from -15% to +15% onto X coordinates (100 to 900 px)
                      const xMin = 100;
                      const xMax = 900;
                      const xPercent = (item.change24h + 15) / 30; // 0 to 1
                      const xCoord = Math.max(xMin, Math.min(xMax, xMin + (xMax - xMin) * xPercent));

                      // Map AI Score from 0 to 100 onto Y coordinates (280 to 40 px)
                      const yMin = 280;
                      const yMax = 40;
                      const yPercent = item.aiScore / 100; // 0 to 1
                      const yCoord = Math.max(yMax, Math.min(yMin, yMin - (yMin - yMax) * yPercent));

                      // Map Volume onto radius scale (8px to 36px)
                      const logVol = Math.log10(item.volume24h); // ranges from e.g. 7 (10M) to 11 (100B)
                      const baseLog = 7;
                      const ratio = Math.max(0, Math.min(1.2, (logVol - baseLog) / 4));
                      const radius = 10 + ratio * 28;

                      // Colors from theme
                      const isPositive = item.change24h >= 0;
                      const circleColor = isPositive 
                        ? (isDark ? 'rgba(16, 185, 129, 0.25)' : 'rgba(5, 150, 105, 0.35)') 
                        : (isDark ? 'rgba(239, 68, 68, 0.25)' : 'rgba(220, 38, 38, 0.35)');
                      const circleStroke = isPositive
                        ? (isDark ? 'rgb(16, 185, 129)' : 'rgb(5, 150, 105)')
                        : (isDark ? 'rgb(239, 68, 68)' : 'rgb(220, 38, 38)');
                      
                      const isSelected = selectedItem?.id === item.id;

                      return (
                        <g 
                          key={item.id}
                          className="cursor-pointer transition hover:opacity-100"
                          onClick={() => handleSelectItem(item)}
                          opacity={isSelected ? 1.0 : 0.72}
                        >
                          <circle
                            cx={xCoord}
                            cy={yCoord}
                            r={radius}
                            fill={circleColor}
                            stroke={isSelected ? 'var(--color-primary)' : circleStroke}
                            strokeWidth={isSelected ? 3.5 : 1.5}
                            className="transition-all duration-300 transform origin-center hover:scale-110"
                            style={{ filter: isSelected ? 'drop-shadow(0 0 8px var(--theme-glow))' : 'none' }}
                          />
                          <text
                            x={xCoord}
                            y={yCoord + 3}
                            textAnchor="middle"
                            fill={isDark ? '#FFFFFF' : '#0F172A'}
                            fontSize="9"
                            fontFamily="monospace"
                            fontWeight="bold"
                            pointerEvents="none"
                          >
                            {item.symbol}
                          </text>
                          {/* Inner percentage indicator above bubble */}
                          <text
                            x={xCoord}
                            y={yCoord - radius - 4}
                            textAnchor="middle"
                            fill={isPositive ? (isDark ? '#34d399' : '#047857') : (isDark ? '#f87171' : '#b91c1c')}
                            fontSize="8"
                            fontFamily="monospace"
                            pointerEvents="none"
                          >
                            {isPositive ? '+' : ''}{item.change24h}%
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              )}

              {/* GRID HEATMAP COMPONENT */}
              {activeVisualMode === 'heatmap' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 w-full select-none animate-fadeIn">
                  {filteredItems.map((item) => {
                    const isPositive = item.change24h >= 0;
                    const isSelected = selectedItem?.id === item.id;

                    // Calculate color volume based on gain/loss percentage intensity
                    const magnitude = Math.min(10, Math.abs(item.change24h));
                    const opacities = 0.1 + (magnitude / 10) * 0.45; // 0.1 to 0.55 opacity

                    return (
                      <div
                        key={item.id}
                        onClick={() => handleSelectItem(item)}
                        style={{
                          backgroundColor: isPositive 
                            ? `rgba(16, 185, 129, ${opacities})` 
                            : `rgba(239, 68, 68, ${opacities})`,
                          borderColor: isSelected 
                            ? 'var(--color-primary)' 
                            : isPositive ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'
                        }}
                        className={`p-3 rounded-xl border flex flex-col justify-between transition gap-2.5 cursor-pointer hover:scale-[1.02] scale-100 ${
                          isSelected ? 'shadow-[0_0_12px_rgba(var(--color-primary),0.3)] ring-1 ring-primary/30' : 'opacity-85 hover:opacity-100'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className={`text-[10px] font-mono font-black px-1.5 py-0.5 rounded leading-none ${isDark ? 'text-white bg-black/45' : 'text-slate-900 bg-white/75 border border-slate-200/50'}`}>
                              {item.symbol}
                            </span>
                            <span className={`text-[8.5px] font-sans font-bold block mt-1 truncate max-w-[80px] ${isDark ? 'text-slate-300' : 'text-slate-705'}`}>
                              {item.name}
                            </span>
                          </div>
                          
                          {/* Asset Class Badge tag */}
                          <span className={`text-[8px] font-mono tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-650 font-bold'}`}>
                            {item.type.toUpperCase()}
                          </span>
                        </div>

                        <div className="mt-1">
                          <span className={`text-[9.5px] font-mono font-bold block ${isDark ? 'text-white' : 'text-slate-950 font-heavy'}`}>
                            ${item.price.toLocaleString(undefined, { minimumFractionDigits: item.price < 1 ? 4 : 2 })}
                          </span>
                          <span className={`text-[10px] font-mono font-bold flex items-center gap-0.5 mt-0.5 ${isPositive ? (isDark ? 'text-emerald-400' : 'text-emerald-700') : (isDark ? 'text-red-400' : 'text-red-700')}`}>
                            {isPositive ? '▲' : '▼'} {isPositive ? '+' : ''}{item.change24h}%
                          </span>
                        </div>

                        <div className={`flex justify-between items-center text-[8.5px] font-mono border-t pt-1.5 ${isDark ? 'text-slate-350 border-white/10' : 'text-slate-600 border-black/10'}`}>
                          <span>AI SCORE</span>
                          <span className={`font-bold px-1 rounded ${isDark ? 'text-white bg-black/25' : 'text-slate-950 bg-white/65 shadow-sm border border-slate-200'}`}>{item.aiScore}</span>
                        </div>
                      </div>
                    );
                  })}

                  {filteredItems.length === 0 && (
                    <div className="col-span-full border border-dashed border-theme-border/40 p-12 rounded-xl text-center flex flex-col items-center justify-center text-slate-500 gap-3">
                      <AlertCircle className="h-8 w-8 text-slate-600" />
                      <span className="text-xs font-mono">No matching matrices found for the active filter configuration.</span>
                    </div>
                  )}
                </div>
              )}

              {/* LIST MATRICES LEDGER VIEW */}
              {activeVisualMode === 'ledger' && (
                <div className={`border rounded-xl overflow-x-auto shadow-inner ${isDark ? 'border-theme-border bg-black/35' : 'border-slate-200 bg-slate-50/50'}`}>
                  <table className="w-full text-left font-mono text-xs text-theme-text">
                    <thead className={`text-[9.5px] uppercase border-b border-theme-border select-none ${isDark ? 'bg-[#0b0c15]/65 text-slate-400' : 'bg-slate-150/80 text-slate-700 border-slate-200'}`}>
                      <tr>
                        <th className="p-3">Symbol</th>
                        <th className="p-3">Asset Group</th>
                        <th className="p-3 text-right">Price Value</th>
                        <th className="p-3 text-right">24H Metrics</th>
                        <th className="p-3 text-right">Neural Confidence Score</th>
                        <th className="p-3 text-right">Recommended Action</th>
                        <th className="p-3 text-right pr-4">Details Vector</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-theme-border/40">
                      {filteredItems.map((item) => {
                        const isPositive = item.change24h >= 0;
                        const isSelected = selectedItem?.id === item.id;
                        return (
                          <tr 
                            key={item.id} 
                            onClick={() => handleSelectItem(item)}
                            className={`cursor-pointer transition-colors ${
                              isSelected 
                                ? 'bg-primary/10 text-primary font-black' 
                                : (isDark ? 'hover:bg-theme-bg/35' : 'hover:bg-slate-100')
                            }`}
                          >
                            <td className="p-3">
                              <span className={`font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.symbol}</span>
                              <span className="text-[8.5px] text-slate-500 block truncate font-sans max-w-[120px]">{item.name}</span>
                            </td>
                            <td className={`p-3 uppercase text-[10px] font-sans font-extrabold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{item.type}</td>
                            <td className={`p-3 text-right font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                              ${item.price.toLocaleString(undefined, { minimumFractionDigits: item.price < 1 ? 4 : 2 })}
                            </td>
                            <td className={`p-3 text-right font-black ${isPositive ? (isDark ? 'text-emerald-400' : 'text-emerald-700 font-bold') : (isDark ? 'text-red-400' : 'text-red-700 font-bold')}`}>
                              {isPositive ? '+' : ''}{item.change24h}%
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-1.5 justify-end">
                                <div className={`w-16 h-1.5 rounded-full overflow-hidden border border-theme-border/20 ${isDark ? 'bg-slate-900' : 'bg-slate-200/60'}`}>
                                  <div 
                                    className="h-full bg-primary" 
                                    style={{ width: `${item.aiScore}%` }}
                                  />
                                </div>
                                <span className={`font-bold text-[10.5px] ${isDark ? 'text-white' : 'text-slate-900 font-black'}`}>{item.aiScore}%</span>
                              </div>
                            </td>
                            <td className="p-3 text-right">
                              <span className={`px-2 py-0.5 rounded text-[8.5px] font-sans font-extrabold inline-block text-center ${
                                item.sentiment === 'BULLISH' 
                                  ? (isDark ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400' : 'bg-emerald-50 border border-emerald-300 text-emerald-750 font-black') :
                                item.sentiment === 'BEARISH' 
                                  ? (isDark ? 'bg-rose-500/15 border border-rose-500/30 text-rose-400' : 'bg-rose-50 border border-rose-300 text-rose-750 font-black') :
                                  (isDark ? 'bg-slate-500/15 border border-slate-500/30 text-slate-400' : 'bg-slate-100 border border-slate-300 text-slate-600 font-black')
                              }`}>
                                {item.sentiment === 'BULLISH' ? 'STRONG BUY' : 
                                 item.sentiment === 'BEARISH' ? 'TARGET SHORT' : 'NEUTRAL ZONE'}
                              </span>
                            </td>
                            <td className={`p-3 text-right pr-4 font-bold select-none text-slate-500 ${isDark ? 'hover:text-white' : 'hover:text-slate-900'}`}>
                              <ChevronRight className="h-4 w-4 inline-block" />
                            </td>
                          </tr>
                        );
                      })}

                      {filteredItems.length === 0 && (
                        <tr>
                          <td colSpan={7} className="border border-dashed border-theme-border/40 p-12 text-center text-slate-500">
                            No match datasets found matching ledger pivots.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

            </div>

            {/* LOWER STATS AND INFORMATION EXPLAINER FOR USER SCREENER MATRICES */}
            <div className="mt-4 pt-3.5 border-t border-theme-border/50 flex flex-col sm:flex-row justify-between items-center text-[10px] font-mono text-slate-500 gap-3 select-none">
              <span className="flex items-center gap-1.5">
                <Database className="h-3.5 w-3.5 text-primary" />
                Data proxy sources: Delta Exchange Real-time API & Axiom Network Quant nodes.
              </span>
              <span>All Implied Volatilities calculated dynamically using Black-Scholes solvers.</span>
            </div>

          </div>
        </div>

        {/* ANALYST INSIGHT VECTOR SIDE PANEL IN CHAIR 4_OF_12 */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          
          {/* PANEL CAPTAIN CONTAINER */}
          {selectedItem ? (
            <div 
              style={{ borderColor: 'var(--theme-border)' }}
              className="bg-theme-card border p-5 rounded-2xl flex flex-col gap-4.5 shadow-md bg-gradient-to-b from-theme-card to-theme-bg/90 relative overflow-hidden"
            >
              <div>
                <span className="text-[10px] font-mono tracking-widest font-extrabold text-secondary block uppercase">
                  📡 Neuro Analytica Forecast
                </span>
                <div className="flex items-center justify-between mt-1 select-text">
                  <h4 className={`text-sm font-bold font-sans uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {selectedItem.symbol} Model Card
                  </h4>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase ${isDark ? 'text-slate-400 bg-black/45' : 'text-slate-650 bg-slate-200 border border-slate-300/40'}`}>
                    {selectedItem.type} index
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-sans mt-0.5">
                  Deep intelligence analysis of the underlying coin and derivatives vector.
                </p>
              </div>

              {/* CORE METRICS BLOCK CARD LEDGERS */}
              <div className={`border p-3.5 flex flex-col gap-3 font-mono text-[11px] rounded-xl ${isDark ? 'bg-black/40 border-theme-border' : 'bg-slate-100/70 border-slate-200 text-slate-900'}`}>
                
                {/* 1. Underlying price */}
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Real Ticker Value:</span>
                  <span className={`font-black text-xs ${isDark ? 'text-white' : 'text-slate-950 font-black'}`}>
                    ${selectedItem.price.toLocaleString(undefined, { minimumFractionDigits: selectedItem.price < 1 ? 4 : 2 })}
                  </span>
                </div>

                {/* 2. 24h absolute change */}
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">24H Momentum:</span>
                  <span className={`font-black flex items-center gap-0.5 ${selectedItem.change24h >= 0 ? (isDark ? 'text-emerald-400' : 'text-emerald-700') : (isDark ? 'text-red-400' : 'text-red-700')}`}>
                    {selectedItem.change24h >= 0 ? '▲' : '▼'}{selectedItem.change24h}%
                  </span>
                </div>

                {/* 3. 24h trade volume density */}
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">24H Volume Weight:</span>
                  <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900 font-extrabold'}`}>
                    ${selectedItem.volume24h.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </div>

                {/* 4. Support and Resistance Targets */}
                <div className="flex justify-between items-center border-t border-theme-border/30 pt-2 bg-[rgba(var(--color-primary),0.02)]">
                  <span className="text-slate-500">Resist Limit:</span>
                  <span className={`font-black ${isDark ? 'text-red-400' : 'text-red-700'}`}>
                    ${selectedItem.resistancePrice.toLocaleString(undefined, { minimumFractionDigits: selectedItem.resistancePrice < 1 ? 3 : 2 })}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Support Block:</span>
                  <span className={`font-black ${isDark ? 'text-emerald-400' : 'text-emerald-750'}`}>
                    ${selectedItem.supportPrice.toLocaleString(undefined, { minimumFractionDigits: selectedItem.supportPrice < 1 ? 3 : 2 })}
                  </span>
                </div>

                {/* Conditional rendering of futures variables */}
                {selectedItem.type === 'futures' && (
                  <>
                    <div className="flex justify-between items-center border-t border-theme-border/30 pt-2">
                      <span className="text-slate-500">Perp Open Interest:</span>
                      <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        ${selectedItem.openInterest?.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Funding Rate:</span>
                      <span className={`font-bold ${isDark ? 'text-cyan-400' : 'text-cyan-700'}`}>
                        {(selectedItem.fundingRate! * 100).toFixed(4)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Basis Premium Rate:</span>
                      <span className="font-bold" style={{ color: isDark ? 'var(--color-primary)' : '#7C3AED' }}>
                        +{selectedItem.basisPremium}%
                      </span>
                    </div>
                  </>
                )}

                {/* Conditional Options variables values */}
                {selectedItem.type === 'options' && (
                  <>
                    <div className="flex justify-between items-center border-t border-theme-border/30 pt-2">
                      <span className="text-slate-500">Dynamic Option Delta:</span>
                      <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedItem.delta} Δ</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Implied Vol (IV):</span>
                      <span className={`font-bold ${isDark ? 'text-cyan-400' : 'text-cyan-700'}`}>{selectedItem.iv}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Theta Decay Rating:</span>
                      <span className={`font-bold ${isDark ? 'text-red-400' : 'text-red-700'}`}>{selectedItem.theta} Θ</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Strike Level:</span>
                      <span className="font-bold" style={{ color: isDark ? 'var(--color-secondary)' : '#1E40AF' }}>${selectedItem.strike?.toLocaleString()}</span>
                    </div>
                  </>
                )}
              </div>

              {/* SIGNAL AI CONFIDENCE CARD GAUGES */}
              <div className={`border p-3.5 rounded-xl flex items-center justify-between gap-3 ${isDark ? 'bg-black/40 border-theme-border' : 'bg-slate-100/70 border-slate-200'}`}>
                <div className="shrink-0 relative w-12 h-12 flex items-center justify-center">
                  {/* Circle progress ring */}
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      stroke={isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}
                      strokeWidth="4"
                      fill="transparent"
                    />
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      stroke="var(--color-primary)"
                      strokeWidth="4"
                      fill="transparent"
                      strokeDasharray={125.6}
                      strokeDashoffset={125.6 - (125.6 * selectedItem.aiScore) / 100}
                    />
                  </svg>
                  <span className={`absolute text-[10.5px] font-mono font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {selectedItem.aiScore}%
                  </span>
                </div>
                
                <div>
                  <span className="text-[9.5px] font-mono text-slate-500 font-extrabold uppercase block leading-none">
                    Model Predictive Accuracy
                  </span>
                  <p className={`text-[11px] font-sans font-bold mt-1 leading-normal select-text ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {selectedItem.aiScore >= 80 ? 'Classified as HIGH momentum breakout channel.' :
                     selectedItem.aiScore >= 50 ? 'Sub-system displays sideways low-confidence range.' :
                     'High volatility danger zone detected by core weights.'}
                  </p>
                </div>
              </div>

              {/* NEURAL RATIONALE PARAGRAPHS */}
              <div className="flex flex-col gap-1.5 select-text">
                <span className={`text-[9.5px] font-mono uppercase font-black tracking-wide ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  🤖 Neural Rationale Reroute Output:
                </span>
                <div className={`p-3 rounded-lg border text-[11px] leading-normal font-sans italic ${isDark ? 'bg-[#0b0c15]/65 border-theme-border/40 text-slate-300' : 'bg-slate-100/70 border-slate-200 text-slate-705 text-slate-700'}`}>
                  &quot;{selectedItem.aiSignalRationale}&quot;
                </div>
              </div>

              {/* DYNAMIC BACKTEST MODEL CORE TARGET RANGE GRAPH */}
              <div className={`border rounded-xl p-3 flex flex-col gap-2 ${isDark ? 'bg-black/45 border-theme-border' : 'bg-slate-100/70 border-slate-200 text-slate-900'}`}>
                <span className="text-[9.5px] font-mono text-slate-500 uppercase font-black block">
                  Live Neural pricing corridor (6H Forecast)
                </span>
                
                <div className="h-10 relative flex items-center justify-between text-xs px-2 select-none">
                  {/* Progress Line */}
                  <div className="absolute left-10 right-10 top-1/2 h-1 bg-theme-border rounded-full" />
                  
                  {/* Underlyer point indicator */}
                  <div className={`absolute top-1/2 -mt-1.5 h-3 w-3 rounded-full border bg-white ${
                    selectedItem.change24h >= 0 ? 'border-emerald-500 animate-ping' : 'border-red-500'
                  }`} style={{ left: `${Math.max(15, Math.min(85, 40 + selectedItem.change24h * 3))}%` }} />
                  
                  <span className={`font-mono text-[9px] font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                    ${selectedItem.supportPrice.toLocaleString(undefined, { maximumFractionDigits: selectedItem.supportPrice < 1 ? 3 : 0 })}
                  </span>
                  
                  <span className={`font-mono text-[9px] font-bold ${isDark ? 'text-red-400' : 'text-red-700'}`}>
                    ${selectedItem.resistancePrice.toLocaleString(undefined, { maximumFractionDigits: selectedItem.resistancePrice < 1 ? 3 : 0 })}
                  </span>
                </div>
              </div>

              {/* SIGNAL ACTION SUBMIT BUTTON & TOAST FEEDBACK */}
              <button
                onClick={() => {
                  const toast = document.createElement('div');
                  toast.className = `fixed bottom-4 right-4 z-50 p-4 rounded-xl border shadow-xl flex items-center gap-3 transition-all duration-300 transform translate-y-0.5 font-bold text-xs select-none ${
                    isDark 
                      ? 'bg-slate-950 border-emerald-500/30 text-emerald-400 shadow-emerald-950/20' 
                      : 'bg-white border-emerald-500 text-emerald-800 shadow-slate-200'
                  }`;
                  toast.innerHTML = `
                    <svg class="h-4 w-4 shrink-0" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    <span>Targeting ${selectedItem.symbol}: AI Strategy execution gates successfully compiled!</span>
                  `;
                  document.body.appendChild(toast);
                  setTimeout(() => {
                    toast.style.opacity = '0';
                    setTimeout(() => toast.remove(), 300);
                  }, 3500);
                }}
                className="w-full py-2 bg-primary hover:bg-[#ebfa02] text-slate-950 font-black uppercase text-[10.5px] tracking-wider rounded-lg shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Sparkles className="h-4 w-4 text-slate-950 animate-pulse" />
                <span>Inject Automated AI Trade Orders</span>
              </button>

            </div>
          ) : (
            <div className="border border-theme-border bg-theme-card/50 rounded-2xl p-8 text-center text-slate-500 font-mono text-xs shadow-inner flex flex-col items-center justify-center h-[350px]">
              <span>Select an instrument node from the screener view to overlay AI forecasting indices here.</span>
            </div>
          )}

          {/* SECOND MINI CARD FOR TIPS AND NEURO EDUCATION GLOSSARY */}
          <div className="bg-theme-card border border-theme-border rounded-2xl p-4 flex items-start gap-3 shadow-inner">
            <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div className="text-xs shrink">
              <span className={`font-sans font-extrabold uppercase tracking-wider block ${isDark ? 'text-white' : 'text-slate-900'}`}>Neural Matrix Mechanics</span>
              <p className={`font-sans mt-1 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-650 font-bold'}`}>
                The Bubble Map segments assets on multi-axial planes: horizontal representation indicates <strong>Volatility % rate</strong>, vertical displacement marks <strong>AI scoring weights</strong>, and bubble diameter maps <strong>aggregate block volume</strong>.
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
