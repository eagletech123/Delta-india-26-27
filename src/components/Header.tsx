import React, { useState, useEffect } from 'react';
import { Activity, ShieldCheck, Zap, Server, RefreshCw } from 'lucide-react';

interface HeaderProps {
  iswsConnected: boolean;
  rateLimitTokens: number;
}

export default function Header({ iswsConnected, rateLimitTokens }: HeaderProps) {
  const [utcTime, setUtcTime] = useState<string>('');
  const [apiPing, setApiPing] = useState<number>(14);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setUtcTime(now.toISOString().slice(0, 19).replace('T', ' ') + ' UTC');
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);

    // Track subtle ping fluctuation
    const pingInterval = setInterval(() => {
      setApiPing(prev => {
        const delta = Math.floor(Math.random() * 5) - 2;
        const next = prev + delta;
        return next < 8 ? 8 : next > 22 ? 22 : next;
      });
    }, 4000);

    return () => {
      clearInterval(interval);
      clearInterval(pingInterval);
    };
  }, []);

  return (
    <header className="border-b border-theme-border bg-theme-card/75 backdrop-blur-md px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 select-none">
      {/* Brand & Concept */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/10">
          <Zap className="h-5 w-5 text-black" />
        </div>
        <div>
          <h1 className="text-[16px] font-sans font-bold tracking-tight text-theme-text flex items-center gap-2">
            DeltaAlgo <span className="text-primary font-mono font-medium text-[10px] px-2 py-0.5 rounded bg-primary/10 border border-primary/20">v1.2.0</span>
          </h1>
          <p className="text-xs text-slate-400 font-sans mt-0.5">Vector visual node compiler, state machine compiler & backtester</p>
        </div>
      </div>

      {/* Connection and telemetry metrics */}
      <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
        {/* UTC Clock */}
        <div className="bg-theme-bg/60 border border-theme-border rounded-lg px-3 py-1.5 text-slate-300">
          <span className="text-slate-450 font-bold mr-1.5">TIME:</span>
          <span className="text-theme-text font-medium">{utcTime || 'Loading...'}</span>
        </div>

        {/* Rate Limiting state (Token Bucket) */}
        <div className="bg-theme-bg/60 border border-theme-border rounded-lg px-3 py-1.5 text-slate-300 flex items-center gap-1.5">
          <RefreshCw className="h-3.5 w-3.5 text-primary animate-spin" style={{ animationDuration: '6s' }} />
          <span className="text-slate-450 font-bold">RATE:</span>
          <span className="text-theme-text font-bold">{rateLimitTokens.toLocaleString()}</span>
          <span className="text-[10px] text-slate-450 font-normal">/ 10k bkt</span>
        </div>

        {/* API Latency */}
        <div className="bg-theme-bg/60 border border-theme-border rounded-lg px-3 py-1.5 text-slate-300 flex items-center gap-1.5">
          <Server className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-slate-450 font-bold">LATENCY:</span>
          <span className="text-theme-text font-bold">{apiPing}ms</span>
        </div>

        {/* Websocket State */}
        <div className="bg-theme-bg/60 border border-theme-border rounded-lg px-3 py-1.5 flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${iswsConnected ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
          <span className="text-slate-450 font-bold">WS-FEED:</span>
          <span className={iswsConnected ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
            {iswsConnected ? 'CONNECTED' : 'OFFLINE'}
          </span>
        </div>

        {/* Compliance */}
        <div className="hidden lg:flex bg-primary/10 border border-primary/20 rounded-lg px-3 py-1.5 text-primary items-center gap-1.5 font-sans font-semibold">
          <ShieldCheck className="h-3.5 w-3.5 text-primary" />
          <span>SERVED SECURELY</span>
        </div>
      </div>
    </header>
  );
}
