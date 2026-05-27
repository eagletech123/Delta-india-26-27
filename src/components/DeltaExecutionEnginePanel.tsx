import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  Clock, 
  Coins, 
  Send, 
  AlertTriangle, 
  Zap, 
  RefreshCw, 
  Terminal, 
  Sliders, 
  Activity, 
  Check, 
  Lock, 
  Flame,
  Wifi,
  WifiOff
} from 'lucide-react';
import { 
  AuthManager, 
  buildBracketOrder, 
  calculateUnrealizedPnl, 
  TokenBucketRateLimiter, 
  WebSocketCoordinator,
  WsSubscription
} from '../utils/deltaExecutionEngine';

export default function DeltaExecutionEnginePanel() {
  // 1. Instances refs
  const authManagerRef = useRef(new AuthManager());
  const rateLimiterRef = useRef(new TokenBucketRateLimiter());
  
  // 2. Auth State
  const [authMethod, setAuthMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE'>('POST');
  const [authPath, setAuthPath] = useState('/v2/orders');
  const [authQuery, setAuthQuery] = useState('');
  const [authBody, setAuthBody] = useState('{"product_id":27,"side":"buy","size":20}');
  const [sigOutput, setSigOutput] = useState('');
  const [headersOutput, setHeadersOutput] = useState<any>(null);
  const [apiKey, setApiKey] = useState('delta_98fc2e31bc334ea0');
  const [apiSecret, setApiSecret] = useState('secret_66fdecba871a2e9bcf2e88100efc8f331');
  const [isClockSynced, setIsClockSynced] = useState(false);
  const [clockOffset, setClockOffset] = useState(0);
  const [currSyncedTime, setCurrSyncedTime] = useState('');

  // 3. Bracket Order State
  const [orderSide, setOrderSide] = useState<'buy' | 'sell'>('buy');
  const [orderType, setOrderType] = useState<'market' | 'limit'>('limit');
  const [orderPrice, setOrderPrice] = useState<number>(68150.0);
  const [orderSize, setOrderSize] = useState<number>(50);
  const [slPct, setSlPct] = useState<number>(2.5);
  const [tpPct, setTpPct] = useState<number>(5.0);
  const [bracketPayload, setBracketPayload] = useState<any>(null);
  const [orderLog, setOrderLog] = useState<string[]>([]);

  // 4. Unrealized PNL State
  const [pnlSide, setPnlSide] = useState<'LONG' | 'SHORT'>('LONG');
  const [pnlEntryPrice, setPnlEntryPrice] = useState<number>(68150.0);
  const [pnlMarkPrice, setPnlMarkPrice] = useState<number>(68420.0);
  const [pnlContracts, setPnlContracts] = useState<number>(80);
  const [calculatedPnl, setCalculatedPnl] = useState<number>(0);

  // 5. Rate Limiter State
  const [availableTokens, setAvailableTokens] = useState<number>(10000);
  const [rateLimitBlock, setRateLimitBlock] = useState(false);
  const [consumedCount, setConsumedCount] = useState(0);

  // 6. WS State
  const [wsStatus, setWsStatus] = useState<string>('DISCONNECTED');
  const [wsSubs, setWsSubs] = useState<WsSubscription[]>([]);
  const [wsLogs, setWsLogs] = useState<{ id: string; msg: string; type: string; timestamp: string }[]>([]);

  // Initialize and run interval updates
  useEffect(() => {
    // Keep rate limiter state synced to React component state
    const limitInterval = setInterval(() => {
      setAvailableTokens(rateLimiterRef.current.getTokensCount());
    }, 100);

    // Keep clock synced state updated locally
    const clockInterval = setInterval(() => {
      const liveSynced = authManagerRef.current.getSyncedTimestamp();
      setCurrSyncedTime(new Date(liveSynced).toISOString());
    }, 1000);

    // Automatically calculate initial bracket
    updateBracketPreview();

    // Setup initial WS coordinator
    const coordinator = new WebSocketCoordinator(
      (state) => {
        setWsStatus(state);
      },
      (msg, type) => {
        const timestamp = new Date().toLocaleTimeString();
        setWsLogs(prev => [
          { id: Math.random().toString(), msg, type, timestamp },
          ...prev.slice(0, 39)
        ]);
      }
    );
    (window as any).__wsCoordinator = coordinator;
    coordinator.connectAndAuthenticate().then(() => {
      setWsSubs(coordinator.getSubscriptionsState());
    });

    return () => {
      clearInterval(limitInterval);
      clearInterval(clockInterval);
    };
  }, []);

  // Sync PNL live as pricing slider variables move
  useEffect(() => {
    const pnl = calculateUnrealizedPnl(pnlSide, pnlEntryPrice, pnlMarkPrice, pnlContracts);
    setCalculatedPnl(pnl);
  }, [pnlSide, pnlEntryPrice, pnlMarkPrice, pnlContracts]);

  // Recalculate HMAC signatures live as inputs change
  useEffect(() => {
    const computeSig = async () => {
      const timestampStr = Math.floor(authManagerRef.current.getSyncedTimestamp() / 1000).toString();
      const payloadString = `${authMethod}${timestampStr}${authPath}${authQuery}${authBody}`;
      
      // Compute using dynamic Web Crypto Standard
      try {
        const encoder = new TextEncoder();
        const keyData = encoder.encode(apiSecret);
        const messageData = encoder.encode(payloadString);

        const cryptoKey = await window.crypto.subtle.importKey(
          "raw",
          keyData,
          { name: "HMAC", hash: "SHA-256" },
          false,
          ["sign"]
        );

        const signatureBuffer = await window.crypto.subtle.sign(
          "HMAC",
          cryptoKey,
          messageData
        );

        const byteArray = new Uint8Array(signatureBuffer);
        const outSig = Array.prototype.map.call(byteArray, (x: number) => ('00' + x.toString(16)).slice(-2)).join('');
        setSigOutput(outSig);
        setHeadersOutput({
          "api-key": apiKey,
          "signature": outSig,
          "timestamp": timestampStr
        });
      } catch (err) {
        setSigOutput(`compiling_hmac_sha256_err`);
      }
    };
    computeSig();
  }, [authMethod, authPath, authQuery, authBody, apiKey, apiSecret, isClockSynced]);

  // Handle NTP trigger sync check
  const handleNtpSync = () => {
    // Calculate current remote server clock skew skew (e.g. +73ms offset delay)
    const simulatedSkew = 73 + Math.floor(Math.random() * 150);
    const mockNtpServerMs = Date.now() + simulatedSkew;
    
    authManagerRef.current.syncClockWithNTP(mockNtpServerMs);
    setIsClockSynced(true);
    setClockOffset(simulatedSkew);

    const coordinator = (window as any).__wsCoordinator as WebSocketCoordinator;
    if (coordinator) {
      coordinator.incrementEventCount('positions');
    }
  };

  // Bracket payload rebuilder helper
  const updateBracketPreview = () => {
    const payload = buildBracketOrder({
      side: orderSide,
      price: orderPrice,
      size: orderSize,
      orderType: orderType,
      stopLossPercent: slPct,
      takeProfitPercent: tpPct
    });
    setBracketPayload(payload);
  };

  useEffect(() => {
    updateBracketPreview();
  }, [orderSide, orderType, orderPrice, orderSize, slPct, tpPct]);

  // Execute bracket deployment action with token bucket checks
  const handleDeployOrder = async () => {
    const rateCheck = rateLimiterRef.current.attemptAction();
    const nowStr = new Date().toLocaleTimeString();
    
    // Increment event ticks on user trades WS channel to simulate interaction
    const coordinator = (window as any).__wsCoordinator as WebSocketCoordinator;
    if (coordinator) {
      coordinator.incrementEventCount('orders');
      coordinator.incrementEventCount('v2/user_trades');
    }

    if (!rateCheck.allowed) {
      setRateLimitBlock(true);
      setOrderLog(prev => [
        `[${nowStr}] ❌ ORDER DECLINED: HTTP 429 Rate Limit Exceeded. Bucket exhausted (Current tokens < 5).`,
        ...prev
      ]);
      return;
    }

    setRateLimitBlock(false);
    setConsumedCount(prev => prev + rateCheck.cost);
    setAvailableTokens(rateCheck.remainingTokens);

    // Dynamic output response demo simulated
    setOrderLog(prev => [
      `[${nowStr}] 🚀 POST /v2/orders (product_id: 27) signature compiled and dispatched.`,
      `  └─ Response Delta API: {"status":"success","data":{"order_id":"ord_0928a881bc3aa9","product_id":27,"status":"filled","qty":${orderSize},"bracket_tp":${bracketPayload?.bracket_take_profit_price},"bracket_sl":${bracketPayload?.bracket_stop_loss_price}}}`,
      ...prev
    ]);
  };

  // Deplete rate limiter bucket artificially to showcase 429 blocking state
  const handleSpamAttack = () => {
    rateLimiterRef.current.forceDeclineTokens();
    setAvailableTokens(rateLimiterRef.current.getTokensCount());
    setRateLimitBlock(true);
    const nowStr = new Date().toLocaleTimeString();
    setOrderLog(prev => [
      `[${nowStr}] ⚠️ Rate limit spam attack simulated! Tokens artificially depleted below standard cost.`,
      ...prev
    ]);
  };

  const handleResetRateLimit = () => {
    rateLimiterRef.current.resetTokens();
    setAvailableTokens(rateLimiterRef.current.getTokensCount());
    setRateLimitBlock(false);
    const nowStr = new Date().toLocaleTimeString();
    setOrderLog(prev => [
      `[${nowStr}] ✅ Rate limit Token Bucket reset to 10,000 units. Replenishing active.`,
      ...prev
    ]);
  };

  // WS Disconnect & Auto Re-subscription simulation loop trigger
  const handleWsDisconnectTrigger = async () => {
    const coordinator = (window as any).__wsCoordinator as WebSocketCoordinator;
    if (coordinator) {
      await coordinator.simulateNetworkDisconnectAndReauth();
      setWsSubs(coordinator.getSubscriptionsState());
    }
  };

  return (
    <section className="bg-theme-card border border-theme-border p-4 rounded-2xl shadow-sm mt-6 select-none flex flex-col gap-6 text-theme-text">
      
      {/* 1. Header Spec banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-theme-border pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600">
            <Activity className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-600">Delta Execution Engine</span>
              <span className="bg-emerald-50 border border-emerald-150 text-[9px] font-mono text-emerald-600 px-1.5 py-0.5 rounded font-bold">Phase 3 Integrated</span>
            </div>
            <h2 className="font-sans font-extrabold text-theme-text text-sm mt-0.5">
              Live Interactive Delta API Console & Bracket Order Compiler
            </h2>
          </div>
        </div>

        {/* Sync clock status widget */}
        <div className="flex items-center gap-2 text-xs">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-mono ${
            isClockSynced
              ? 'bg-emerald-50 border-emerald-150 text-emerald-700 font-bold'
              : 'bg-amber-50 border-amber-150 text-amber-700 font-bold'
          }`}>
            <Clock className="h-3.5 w-3.5" />
            <span>NTP Offset: {isClockSynced ? `+${clockOffset}ms (Synced)` : "Clock Skew Unknown"}</span>
          </div>

          <button
            onClick={handleNtpSync}
            className="px-3 py-1.5 bg-primary text-black font-semibold rounded-lg hover:bg-primary/90 hover:shadow-sm transition text-xs cursor-pointer flex items-center gap-1"
          >
            <RefreshCw className="h-3 w-3" />
            Sync Clock
          </button>
        </div>
      </div>

      {/* Grid container layout for widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Interactive column Left — Auth & HMAC Signing */}
        <div className="lg:col-span-6 flex flex-col gap-5">
          
          {/* Card: HMAC Generator */}
          <div className="bg-theme-bg border border-theme-border rounded-xl p-4 flex flex-col gap-3 shadow-inner">
            <div className="flex justify-between items-center text-xs">
              <span className="font-sans font-bold text-theme-text flex items-center gap-1.5">
                <Lock className="h-4 w-4 text-slate-400" />
                AuthManager: HMAC-SHA256 Signature Builder
              </span>
              <span className="text-[10px] text-primary font-bold font-mono uppercase bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded">
                Live Crypto
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase font-mono block mb-1">Method</label>
                <select 
                  value={authMethod} 
                  onChange={(e) => setAuthMethod(e.target.value as any)}
                  className="w-full border border-theme-border rounded p-1.5 bg-theme-bg text-xs font-mono text-theme-text focus:border-primary outline-none"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase font-mono block mb-1">Path</label>
                <input 
                  type="text" 
                  value={authPath} 
                  onChange={(e) => setAuthPath(e.target.value)}
                  className="w-full border border-theme-border rounded p-1.5 bg-theme-bg text-xs font-mono text-theme-text focus:border-primary outline-none"
                />
              </div>
            </div>

            <div className="text-xs">
              <label className="text-[10px] font-bold text-slate-500 uppercase font-mono block mb-1">Request Body payload</label>
              <textarea 
                value={authBody} 
                onChange={(e) => setAuthBody(e.target.value)}
                rows={1}
                className="w-full border border-theme-border rounded p-1.5 bg-theme-bg text-xs font-mono text-theme-text focus:border-primary outline-none resize-none"
              />
            </div>

            {/* Generated Signature view codes */}
            <div className="bg-slate-950 text-slate-300 font-mono text-[10.5px] rounded-lg p-3 border border-slate-900 leading-relaxed">
              <p className="text-slate-500 font-bold select-none border-b border-slate-900 pb-1 mb-1.5">SIGNED PAYLOAD OUTPUT STRUCTURE:</p>
              <div className="flex flex-col gap-1 select-text">
                <div><span className="text-slate-500">api-key:</span> <span className="text-emerald-400 font-bold">{headersOutput ? headersOutput['api-key'] : apiKey}</span></div>
                <div><span className="text-slate-500">signature:</span> <span className="text-amber-300 break-all">{sigOutput}</span></div>
                <div><span className="text-slate-500">timestamp:</span> <span className="text-indigo-400">{headersOutput?.timestamp || 'Waiting...'}</span></div>
                <div className="border-t border-slate-900/80 pt-1 mt-1 font-sans text-[10px] text-slate-500 flex items-center gap-1.5 select-none font-semibold">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Computed: HMAC(Secret, "{authMethod}" + Timestamp + Path + Query + Body)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card: Position Unrealized P&L Calculator */}
          <div className="bg-theme-bg border border-theme-border rounded-xl p-4 flex flex-col gap-3 shadow-inner">
            <div className="flex justify-between items-center text-xs">
              <span className="font-sans font-bold text-theme-text flex items-center gap-1.5">
                <Sliders className="h-4 w-4 text-primary shrink-0" />
                Dynamic Position P&L Math Engine
              </span>
              <span className="text-[10.5px] font-mono text-emerald-400 font-bold uppercase bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                (Mark_Price - Entry_Price) * Size * 0.001
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs mb-1">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase font-mono block mb-1">Position Side</label>
                <div className="flex bg-theme-card border border-theme-border rounded overflow-hidden">
                  <button 
                    onClick={() => setPnlSide('LONG')}
                    className={`flex-1 py-1 font-bold transition text-xs ${
                      pnlSide === 'LONG' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-theme-card/60'
                    }`}
                  >
                    LONG (+Bull)
                  </button>
                  <button 
                    onClick={() => setPnlSide('SHORT')}
                    className={`flex-1 py-1 font-bold transition text-xs ${
                      pnlSide === 'SHORT' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:bg-theme-card/60'
                    }`}
                  >
                    SHORT (-Bear)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase font-mono block mb-1">Contracts Size</label>
                <div className="flex items-center border border-theme-border rounded overflow-hidden bg-theme-card">
                  <input 
                    type="number" 
                    value={pnlContracts} 
                    onChange={(e) => setPnlContracts(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-transparent p-1 text-xs font-mono font-bold text-center outline-none text-theme-text"
                  />
                  <span className="bg-theme-bg text-[9px] font-bold uppercase px-2 py-1 select-none text-slate-400 border-l border-theme-border">Contracts</span>
                </div>
              </div>
            </div>

            {/* Slider to interactively skew Mark Price */}
            <div className="flex flex-col gap-1.5 bg-theme-card border border-theme-border rounded-lg p-3">
              <div className="flex justify-between text-xs">
                <div>
                  <span className="text-slate-400 font-bold">Entry Price:</span>{' '}
                  <span className="font-mono text-theme-text font-bold">${pnlEntryPrice.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold">Mark Price:</span>{' '}
                  <span className="font-mono text-primary font-bold">${pnlMarkPrice.toLocaleString()}</span>
                </div>
              </div>

              <input 
                type="range" 
                min={pnlEntryPrice * 0.88} 
                max={pnlEntryPrice * 1.12} 
                step={5} 
                value={pnlMarkPrice} 
                onChange={(e) => setPnlMarkPrice(Number(e.target.value))}
                className="w-full accent-primary cursor-ew-resize h-1.5 bg-theme-bg rounded-lg outline-none"
              />
              <span className="text-[9.5px] italic text-slate-400 font-mono text-center">
                Drag slider to dynamically fluctuate Bitcoin mark price to test PNL response live.
              </span>
            </div>

            {/* Visual Formula Result Code */}
            <div className={`p-3 rounded-lg flex items-center justify-between border ${
              calculatedPnl >= 0 
                ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
                : 'bg-rose-50 border-rose-100 text-rose-800'
            }`}>
              <div>
                <span className="text-[10px] font-mono text-slate-500 block uppercase font-bold">Unrealized profit/loss value:</span>
                <span className="text-lg font-mono font-bold">
                  {calculatedPnl >= 0 ? '+' : ''}${calculatedPnl.toFixed(2)} USD
                </span>
              </div>
              
              <div className="text-right text-[10.5px] font-mono select-none">
                <span className="text-slate-400 block font-bold leading-none">Contracts Specs Math:</span>
                <span className="text-xs font-bold font-mono">
                  {pnlSide === 'LONG' ? '' : '-'}({pnlMarkPrice} - {pnlEntryPrice}) * {pnlContracts} * 0.001
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Interactive column Right — Orders & Rate Limiter & WS */}
        <div className="lg:col-span-6 flex flex-col gap-5">

          {/* Card: Bracket Order Placement (product_id = 27) */}
          <div className="bg-theme-bg border border-theme-border rounded-xl p-4 flex flex-col gap-3 shadow-inner">
            <div className="flex justify-between items-center text-xs">
              <span className="font-sans font-bold text-theme-text flex items-center gap-1.5">
                <Coins className="h-4.5 w-4.5 text-primary shrink-0" />
                POST /v2/orders (Product 27 : BTCUSD Perp)
              </span>
              <span className="text-[10px] font-bold text-amber-500 font-mono bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded uppercase">
                One-shot Bracket
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
              <div>
                <label className="text-[10px] text-slate-400 font-mono font-bold block mb-0.5">Side</label>
                <select 
                  value={orderSide} 
                  onChange={(e) => setOrderSide(e.target.value as any)}
                  className="w-full border border-theme-border rounded bg-theme-card p-1 text-xs font-mono outline-none text-theme-text"
                >
                  <option value="buy">BUY LONG</option>
                  <option value="sell">SELL SHORT</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-mono font-bold block mb-0.5">Type</label>
                <select 
                  value={orderType} 
                  onChange={(e) => setOrderType(e.target.value as any)}
                  className="w-full border border-theme-border rounded bg-theme-card p-1 text-xs font-mono outline-none text-theme-text"
                >
                  <option value="limit">LIMIT</option>
                  <option value="market">MARKET</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-mono font-bold block mb-0.5">Price</label>
                <input 
                  type="number" 
                  value={orderPrice} 
                  onChange={(e) => setOrderPrice(Number(e.target.value))}
                  className="w-full border border-theme-border rounded bg-theme-card p-1 text-xs font-mono font-bold outline-none text-theme-text"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-mono font-bold block mb-0.5">Qty</label>
                <input 
                  type="number" 
                  value={orderSize} 
                  onChange={(e) => setOrderSize(Math.max(1, Number(e.target.value)))}
                  className="w-full border border-theme-border rounded bg-theme-card p-1 text-xs font-mono font-bold outline-none text-theme-text"
                />
              </div>
            </div>

            {/* Action Targets Stop & Profit inputs */}
            <div className="grid grid-cols-2 gap-3 bg-theme-card p-2.5 rounded-lg border border-theme-border text-xs">
              <div>
                <label className="text-[10px] font-bold text-rose-500 font-mono block mb-1">Stop-Loss Offset (%)</label>
                <div className="flex items-center gap-1.5 bg-theme-bg border border-theme-border p-1.5 rounded">
                  <span className="text-slate-400 font-bold font-mono text-[9.5px]">Loss:</span>
                  <input 
                    type="number" 
                    step={0.5} 
                    value={slPct} 
                    onChange={(e) => setSlPct(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-transparent outline-none text-xs font-mono font-bold text-theme-text"
                  />
                  <span className="text-slate-400 font-bold font-mono">%</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-emerald-500 font-mono block mb-1">Take-Profit Offset (%)</label>
                <div className="flex items-center gap-1.5 bg-theme-bg border border-theme-border p-1.5 rounded">
                  <span className="text-slate-400 font-bold font-mono text-[9.5px]">Gain:</span>
                  <input 
                    type="number" 
                    step={0.5} 
                    value={tpPct} 
                    onChange={(e) => setTpPct(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-transparent outline-none text-xs font-mono font-bold"
                  />
                  <span className="text-slate-400 font-bold font-mono">%</span>
                </div>
              </div>
            </div>

            {/* Generated serialized orders dictionary preview */}
            <div className="text-[10.5px] font-mono bg-slate-900 border border-slate-950 p-2.5 rounded-lg text-amber-300 max-h-[140px] overflow-y-auto whitespace-pre">
              <span className="text-slate-500 font-bold uppercase block select-none mb-1">POST BODY BRACKETS SERIALIZABLY SCHEMA:</span>
              {bracketPayload ? JSON.stringify(bracketPayload, null, 2) : 'Loading payload...'}
            </div>

            {/* Submit buttons */}
            <div className="flex gap-2 text-xs">
              <button
                onClick={handleDeployOrder}
                className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-700 font-bold text-white rounded-lg flex items-center justify-center gap-1.5 shadow-sm hover:shadow cursor-pointer transition"
              >
                <Send className="h-4 w-4 text-white" />
                <span>Transmit Bracket Order</span>
              </button>
            </div>
          </div>

          {/* Card: Rate Limiter Token Bucket */}
          <div className="bg-theme-bg/40 border border-theme-border rounded-xl p-4 flex flex-col gap-2.5 shadow-inner">
            <div className="flex justify-between items-center text-xs">
              <span className="font-sans font-bold text-theme-text flex items-center gap-1.5">
                <Flame className="h-4.5 w-4.5 text-primary fill-primary/35" />
                Token Bucket Rate Limiter
              </span>
              <span className="text-[10px] font-mono text-slate-300 font-bold bg-theme-bg/65 border border-theme-border px-1.5 py-0.5 rounded">
                10,000 Action Limits / 5 Min
              </span>
            </div>

            {/* Token Bar Meter */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs font-mono font-bold">
                <span className="text-slate-400">Available units:</span>
                <span className={rateLimitBlock ? 'text-rose-400' : 'text-emerald-400'}>
                  {availableTokens.toLocaleString()} / 10,000 Units
                </span>
              </div>
              <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden shadow-inner border border-theme-border/50">
                <div 
                  className={`h-full transition-all duration-300 rounded ${
                    availableTokens < 1000 ? 'bg-rose-500' : 'bg-primary'
                  }`}
                  style={{ width: `${(availableTokens / 10000) * 100}%` }}
                ></div>
              </div>
            </div>

            <p className="text-[10.5px] text-slate-400 italic">
              * Rates decrement by <strong>5 units</strong> per Order place/edit/cancel action. Refills continuously at a rate of <strong>0.0333 units / millisecond</strong> (10,000 max every 5 mins).
            </p>

            {/* Test buttons representing rates */}
            <div className="flex gap-2 text-[10.5px] select-none">
              <button
                onClick={handleSpamAttack}
                className="flex-1 py-1 bg-rose-950/20 hover:bg-rose-950/40 text-rose-400 border border-rose-500/30 rounded font-semibold transition cursor-pointer flex items-center justify-center gap-1"
                title="Test rate-limit threshold"
              >
                <AlertTriangle className="h-3 w-3 text-rose-400" />
                Test Rate-Limit Threshold (429)
              </button>

              <button
                onClick={handleResetRateLimit}
                className="flex-1 py-1 bg-theme-bg border border-theme-border text-theme-text hover:bg-theme-bg/70 rounded font-semibold transition cursor-pointer flex items-center justify-center gap-1"
              >
                <RefreshCw className="h-3 w-3 text-slate-400" />
                Reset Bucket Level
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Row: WebSocket auto re-subscribe channels monitor */}
      <div className="bg-theme-bg/40 border border-theme-border rounded-xl p-4 flex flex-col gap-3 shadow-inner">
        <div className="flex items-center justify-between col-span-full">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-primary/10 border border-primary/20 text-primary">
              <Terminal className="h-4 w-4" />
            </span>
            <div>
              <span className="text-[10px] font-mono font-bold text-primary block uppercase">Auto Reauth WebSocket</span>
              <h4 className="text-xs font-bold font-sans text-theme-text leading-none">
                Delta WS Streaming Coordinator
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Status indicators */}
            <span className={`text-[10.5px] font-mono font-bold flex items-center gap-1.5 px-2 py-0.5 rounded border uppercase select-none ${
              wsStatus === 'SUBSCRIBED' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
              wsStatus === 'AUTHENTICATED' ? 'bg-primary/10 border-primary/20 text-primary' :
              wsStatus === 'CONNECTING' ? 'bg-amber-500/10 border-amber-500/20 text-amber-405 text-amber-400 animate-pulse' :
              'bg-rose-500/10 border-rose-500/20 text-rose-400'
            }`}>
              {wsStatus === 'SUBSCRIBED' ? (
                <>
                  <Wifi className="h-3.5 w-3.5" />
                  Live Syncing channels
                </>
              ) : (
                <>
                  <WifiOff className="h-3.5 w-3.5" />
                  {wsStatus}
                </>
              )}
            </span>

            <button
              onClick={handleWsDisconnectTrigger}
              className="px-3 py-1 bg-theme-bg hover:bg-rose-950/40 text-theme-text hover:text-rose-400 border border-theme-border hover:border-rose-500/30 rounded-lg shadow-sm transition text-xs font-semibold cursor-pointer flex items-center gap-1"
              title="Trigger dynamic network reauth check"
            >
              Trigger Dynamic Network Reauth Link
            </button>
          </div>
        </div>

        {/* WebSocket visual cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          {wsSubs.map((sub, idx) => (
            <div key={idx} className="bg-theme-card border border-theme-border p-2.5 rounded-lg flex items-center justify-between shadow-sm">
              <div className="truncate pr-2">
                <span className="text-[9.5px] font-mono text-slate-450 block uppercase font-bold">Channel</span>
                <span className="font-mono text-theme-text font-bold truncate block">{sub.channel}</span>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[9px] font-mono font-bold uppercase block text-primary">Events ticks</span>
                <span className="font-mono text-slate-300 font-bold">{sub.eventsCount}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Web socket console feed terminal output log buffer */}
        <div className="bg-slate-950 text-slate-300 font-mono text-[10.5px] leading-relaxed rounded-lg p-3 border border-slate-900 h-[100px] overflow-y-auto flex flex-col select-text scrollbar-thin scrollbar-thumb-slate-800">
          {wsLogs.length === 0 ? (
            <span className="text-slate-600 italic self-center my-auto">Waiting for socket signals feeds...</span>
          ) : (
            wsLogs.map((log) => {
              const color =
                log.type === 'success' ? 'text-emerald-400' :
                log.type === 'warning' ? 'text-amber-400' :
                log.type === 'error' ? 'text-rose-500 font-bold' :
                'text-slate-400';
              return (
                <div key={log.id} className="flex gap-2.5 py-0.5 border-b border-slate-900/50">
                  <span className="text-slate-500 shrink-0 select-none">[{log.timestamp}]</span>
                  <span className={color}>{log.msg}</span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Row Order active log terminal buffer */}
      {orderLog.length > 0 && (
        <div className="bg-slate-950 border border-slate-900 rounded-xl p-3 flex flex-col gap-1 text-[11px] font-mono select-text max-h-[140px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
          <span className="text-slate-500 font-bold tracking-wide uppercase select-none pb-0.5 mb-1 border-b border-slate-900">ORDER ROUTER DISPATCH LOGS BUFFER:</span>
          {orderLog.map((log, i) => (
            <div key={i} className={`whitespace-pre-wrap leading-relaxed py-0.5 ${
              log.includes('Response Delta API') ? 'text-indigo-400 font-bold pl-4' :
              log.includes('RATE LIMIT') ? 'text-rose-500 font-bold' :
              'text-slate-300'
            }`}>
              {log}
            </div>
          ))}
        </div>
      )}

    </section>
  );
}
