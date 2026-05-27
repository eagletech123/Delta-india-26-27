import React from 'react';
import {
  TrendingUp,
  Percent,
  TrendingDown,
  BarChart3,
  Award,
  Terminal,
  Eraser,
  FileSpreadsheet,
  AlertOctagon,
  ShieldCheck,
  Coins
} from 'lucide-react';
import { BacktestResult, Position, Order, ExecutionLog } from '../types';

interface DashboardAnalyticsProps {
  stats: BacktestResult | null;
  position: Position;
  orders: Order[];
  logs: ExecutionLog[];
  onClearLogs: () => void;
}

export default function DashboardAnalytics({
  stats,
  position,
  orders,
  logs,
  onClearLogs
}: DashboardAnalyticsProps) {

  return (
    <div className="flex flex-col gap-6">
      
      {/* 1. Quick KPI Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 select-none text-theme-text">
        
        {/* Total Trades Count */}
        <div className="bg-theme-card border border-theme-border p-3.5 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase block">Total Trades</span>
            <span className="text-xl font-bold font-mono text-theme-text mt-0.5 block">
              {stats ? stats.totalTrades : '0'}
            </span>
          </div>
          <div className="p-2 rounded-lg bg-theme-bg border border-theme-border text-slate-400 shadow-inner">
            <FileSpreadsheet className="h-4 w-4 text-slate-500" />
          </div>
        </div>

        {/* Win Rate */}
        <div className="bg-theme-card border border-theme-border p-3.5 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase block">Win Rate</span>
            <span className="text-xl font-bold font-mono text-theme-text mt-0.5 block">
              {stats ? `${stats.winRate}%` : '0.0%'}
            </span>
          </div>
          <div className="p-2 rounded-lg bg-theme-bg border border-theme-border text-slate-400 shadow-inner">
            <Percent className="h-4 w-4 text-slate-500" />
          </div>
        </div>

        {/* Cumulative Profit / Loss Percentage Offset */}
        <div className="bg-theme-card border border-theme-border p-3.5 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase block">Total P&L</span>
            <span className={`text-xl font-bold font-mono mt-0.5 block ${
              stats && stats.totalProfitPercent >= 0 
                ? 'text-emerald-500 font-extrabold' 
                : stats && stats.totalProfitPercent < 0 
                  ? 'text-rose-500 font-extrabold' 
                  : 'text-slate-500'
            }`}>
              {stats ? `${stats.totalProfitPercent >= 0 ? '+' : ''}${stats.totalProfitPercent}%` : '0.00%'}
            </span>
          </div>
          <div className={`p-2 rounded-lg bg-theme-bg border border-theme-border shadow-inner ${
            stats && stats.totalProfitPercent >= 0 ? 'text-emerald-500' : 'text-slate-400'
          }`}>
            {stats && stats.totalProfitPercent < 0 ? <TrendingDown className="h-4 w-4 text-rose-500" /> : <TrendingUp className="h-4 w-4 text-emerald-500" />}
          </div>
        </div>

        {/* Win/Loss Ratio */}
        <div className="bg-theme-card border border-theme-border p-3.5 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase block font-sans">Win/Loss Ratio</span>
            <span className="text-xl font-bold font-mono text-primary mt-0.5 block font-extrabold">
              {stats ? stats.winLossRatio.toFixed(2) : '0.00'}
            </span>
          </div>
          <div className="p-2 rounded-lg bg-theme-bg border border-theme-border text-slate-400 shadow-inner">
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
        </div>

        {/* Sharpe Ratio */}
        <div className="bg-theme-card border border-theme-border p-3.5 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase block">Sharpe Ratio</span>
            <span className="text-xl font-bold font-mono text-theme-text mt-0.5 block">
              {stats ? stats.sharpeRatio.toFixed(2) : '0.00'}
            </span>
          </div>
          <div className="p-2 rounded-lg bg-theme-bg border border-theme-border text-slate-400 shadow-inner">
            <Award className="h-4 w-4 text-slate-500" />
          </div>
        </div>

        {/* Maximum Drawdowns Ratio */}
        <div className="bg-theme-card border border-theme-border p-3.5 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase block">Max Drawdown</span>
            <span className="text-xl font-bold font-mono text-rose-500 mt-0.5 block">
              {stats ? `-${stats.maxDrawdownPercent}%` : '0.00%'}
            </span>
          </div>
          <div className="p-2 rounded-lg bg-theme-bg border border-theme-border text-rose-500 shadow-inner">
            <BarChart3 className="h-4 w-4 text-rose-500" />
          </div>
        </div>

      </div>

      {/* 2. Active Delta Exchange Positions & Live Order book */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 select-none text-theme-text">
        
        {/* Active Margin Positions Tracker */}
        <div className="bg-theme-card border border-theme-border p-4 rounded-xl flex flex-col gap-4 shadow-sm">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary">Telemetry Feed</span>
            <h3 className="font-sans font-bold text-theme-text text-xs mt-0.5">Active Delta Exchange Futures Positions</h3>
          </div>

          <div className="bg-theme-bg border border-theme-border rounded-xl p-4 flex flex-col gap-3.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-sans font-medium">Contracts Under management:</span>
              <span className="font-mono text-theme-text font-bold">{position.symbol} (Margin linear-perp)</span>
            </div>

            <div className="grid grid-cols-3 gap-2 border-y border-theme-border py-3 text-center">
              <div>
                <span className="text-[10px] font-mono text-slate-400 font-bold block uppercase">Direction</span>
                <span className={`text-xs font-bold font-mono mt-1 pr-1.5 pl-1.5 py-0.5 rounded inline-block ${
                  position.side === 'LONG'
                    ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                    : position.side === 'SHORT'
                      ? 'bg-rose-500/15 border border-rose-500/30 text-rose-400'
                      : 'bg-slate-550 border border-theme-border text-slate-400'
                }`}>
                  {position.side}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-400 font-bold block uppercase">Entry Price</span>
                <span className="text-xs font-bold font-mono mt-1.5 text-theme-text block">
                  {position.entryPrice > 0 ? `$${position.entryPrice.toLocaleString()}` : '—'}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-400 font-bold block uppercase">Unrealized P&L</span>
                <span className={`text-xs font-bold font-mono mt-1.5 block ${
                  position.unrealizedPnl > 0 
                    ? 'text-emerald-500' 
                    : position.unrealizedPnl < 0 
                      ? 'text-rose-500' 
                      : 'text-slate-500'
                }`}>
                  {position.unrealizedPnl > 0 ? '+' : ''}
                  ${position.unrealizedPnl.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex justify-between text-[11px] font-mono text-slate-400 pt-0.5">
              <span className="flex items-center gap-1.5"><AlertOctagon className="h-3.5 w-3.5 text-rose-500 shrink-0" /> Liq threshold:</span>
              <span className="text-rose-500 font-bold font-mono">
                {position.liquidationPrice > 0 ? `$${position.liquidationPrice.toLocaleString()}` : 'No active exposure'}
              </span>
            </div>
          </div>
        </div>

        {/* Live Real orderbook matches */}
        <div className="bg-theme-card border border-theme-border p-4 rounded-xl flex flex-col gap-3 shadow-sm">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-500">Order matching core</span>
            <h3 className="font-sans font-bold text-theme-text text-xs mt-0.5">Live Order Matchbook Log</h3>
          </div>

          <div className="border border-theme-border rounded-xl overflow-hidden bg-theme-bg grow min-h-[140px] max-h-[160px] overflow-y-auto shadow-inner">
            <table className="w-full text-left font-mono text-[10.5px]">
              <thead className="bg-theme-card text-slate-400 border-b border-theme-border uppercase text-[9px] select-none">
                <tr>
                  <th className="px-3 py-2 leading-none">Side</th>
                  <th className="px-3 py-2 leading-none">Type</th>
                  <th className="px-3 py-2 leading-none">Contracts qty</th>
                  <th className="px-1 py-1 leading-none text-right pr-3 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-border select-text">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-slate-400 font-sans text-xs">
                      Waiting for algorithmic signals to fire buy/sell structures...
                    </td>
                  </tr>
                ) : (
                  orders.map((ord, idx) => (
                    <tr key={ord.id || idx} className="hover:bg-theme-card/50 transition">
                      <td className="px-3 py-2 font-bold select-none">
                        <span className={ord.side === 'BUY' ? 'text-emerald-500' : 'text-rose-500'}>
                          {ord.side}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-slate-400">{ord.type}</td>
                      <td className="px-3 py-2 text-theme-text/85 font-medium">{ord.size}</td>
                      <td className="px-3 py-2 text-right text-emerald-500 font-bold leading-none pr-3 select-none">
                        <span className="inline-block px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-bold">
                          {ord.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* 3. Deep Logging terminaloint and loop events */}
      <div className="bg-theme-card border border-theme-border p-4 rounded-xl flex flex-col gap-3 shadow-sm text-theme-text">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="h-4.5 w-4.5 text-slate-400" />
            <h3 className="font-sans font-bold text-theme-text text-xs">Axiom Developer Terminal & Loop Log</h3>
          </div>
          <button
            onClick={onClearLogs}
            className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] text-theme-text/80 hover:text-theme-text bg-theme-bg border border-theme-border hover:bg-theme-card rounded shadow-sm transition font-sans select-none cursor-pointer"
            title="Wipe terminal buffer"
          >
            <Eraser className="h-3 w-3 text-slate-400" />
            Clear Terminal
          </button>
        </div>

        {/* Console viewport */}
        <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 font-mono text-[11px] leading-relaxed h-[170px] overflow-y-auto flex flex-col select-text scrollbar-thin scrollbar-thumb-slate-800">
          {logs.length === 0 ? (
            <div className="text-slate-500 italic self-center my-auto select-none">
              Console idle. Drag nodes, wire indicators, or load template strategy loops.
            </div>
          ) : (
            logs.map((log) => {
              const logColor =
                log.type === 'success' ? 'text-emerald-400' :
                log.type === 'warning' ? 'text-amber-400' :
                log.type === 'error' ? 'text-rose-450 text-rose-400 font-bold' :
                'text-slate-350';

              const logTag = 
                log.type === 'success' ? '[ OK ]' :
                log.type === 'warning' ? '[WARN]' :
                log.type === 'error' ? '[ FAIL ]' :
                '[INFO]';

              return (
                <div key={log.id} className="flex gap-2 py-0.5 border-b border-slate-900/40 hover:bg-slate-900/20">
                  <span className="text-slate-600 select-none shrink-0">{log.timestamp}</span>
                  <span className="text-slate-500 shrink-0 uppercase tracking-wide font-bold">{logTag}</span>
                  <span className={logColor}>{log.message}</span>
                </div>
              );
            })
          )}
        </div>

        {/* Safety standards checks */}
        <div className="flex flex-col md:flex-row gap-3 justify-between text-[11px] text-slate-500 font-mono select-none px-1">
          <div className="flex items-center gap-1.5 font-sans font-medium">
            <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>Delta Auth protocol: HMAC-SHA256 headers generated securely on back-proxy.</span>
          </div>
          <div className="flex items-center gap-1.5 font-sans font-medium">
            <Coins className="h-4 w-4 text-indigo-500 shrink-0" />
            <span>Linear Margin standard: 1 contract = BTC/USD margin linear-perp specs.</span>
          </div>
        </div>
      </div>

    </div>
  );
}
