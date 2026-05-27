import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceDot,
  ComposedChart
} from 'recharts';
import { HistoricalBar, BacktestTrade } from '../types';
import { TrendingUp, Award, AwardIcon } from 'lucide-react';

interface ReportChartsProps {
  bars: HistoricalBar[];
  trades: BacktestTrade[];
  equityCurve: { time: string; equity: number }[];
  isBacktestMode: boolean;
  selectedSymbol: string;
}

export default function ReportCharts({
  bars,
  trades,
  equityCurve,
  isBacktestMode,
  selectedSymbol
}: ReportChartsProps) {

  // Prepare combined price data with trade markers for Recharts
  const chartData = bars.map(bar => {
    // Find if a trade happened exactly at this bar timeframe
    const trade = trades.find(t => t.time === bar.time);
    return {
      time: bar.time.slice(11), // Keep just HH:MM to reduce clutter
      fullTime: bar.time,
      price: bar.close,
      open: bar.open,
      high: bar.high,
      low: bar.low,
      volume: bar.volume,
      tradeType: trade ? trade.type : null,
      tradePrice: trade ? trade.price : null,
      tradeSize: trade ? trade.size : null
    };
  });

  // Prepare equity curve data for area charting
  const formattedEquityData = equityCurve.map(pt => ({
    time: pt.time.slice(5), // Keep MM-DD HH:MM
    equity: pt.equity,
    benchmarkPrice: 10000 // Placeholder metric if needed
  }));

  // Custom tooltips to present gorgeous technical breakdowns
  const PriceTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-theme-card border border-theme-border p-3 rounded-lg shadow-xl font-mono text-[11px] text-theme-text">
          <p className="text-slate-405 font-bold mb-1 opacity-80">{data.fullTime}</p>
          <p><span className="text-slate-400">PRICE:</span> <span className="text-primary font-semibold">${data.price.toLocaleString()}</span></p>
          <p><span className="text-slate-400">VOLUME:</span> <span className="text-theme-text">{data.volume.toLocaleString()} contracts</span></p>
          {data.tradeType && (
            <div className={`mt-2 p-1.5 rounded-md border text-center ${
              data.tradeType.includes('BUY') || data.tradeType === 'CLOSE_SHORT'
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                : 'bg-rose-500/15 border-rose-500/30 text-rose-400'
            }`}>
              <span className="font-bold">{data.tradeType}</span> @ ${data.tradePrice} (Size: {data.tradeSize})
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const EquityTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-theme-card border border-theme-border p-3 rounded-lg shadow-xl font-mono text-[11px] text-theme-text">
          <p className="text-slate-405 font-bold mb-1 opacity-80">{data.time}</p>
          <p>
            <span className="text-slate-400 font-bold">PORTFOLIO VAL:</span>{' '}
            <span className="text-primary font-bold">${data.equity.toLocaleString()}</span>
          </p>
          <p>
            <span className="text-slate-400 font-bold">DELTA CHG:</span>{' '}
            <span className={data.equity > 10000 ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
              {(((data.equity - 10000) / 10000) * 100).toFixed(2)}%
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-6 select-none text-theme-text">
      
      {/* 1. Underlying Asset Price Chart with overlayed trade execution marks */}
      <div className="bg-theme-card border border-theme-border p-4 rounded-xl shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary">Live Asset Chart</span>
            <h3 className="font-sans font-bold text-theme-text text-sm">{selectedSymbol} Trading Log & Signal Fills</h3>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono text-slate-400 font-semibold">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500"></span> Buy Trigger</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-rose-500"></span> Sell Trigger</span>
          </div>
        </div>

        <div className="h-64 mt-2">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="price-line" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--theme-border)" opacity={0.6} />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={9} tickLine={false} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={9}
                  tickLine={false}
                  domain={['auto', 'auto']}
                  tickFormatter={(val) => `$${val.toLocaleString()}`}
                />
                <Tooltip content={<PriceTooltip />} />
                
                {/* Simulated Candle/Boundary shading Area */}
                <Area type="monotone" dataKey="price" stroke="var(--color-primary)" strokeWidth={1.5} fillOpacity={1} fill="url(#price-line)" />

                {/* Plot Buy Execution Markers */}
                {chartData
                  .filter(d => d.tradeType === 'BUY' || d.tradeType === 'CLOSE_SHORT')
                  .map((d, idx) => (
                    <ReferenceDot
                      key={`buy-${idx}`}
                      x={d.time}
                      y={d.price}
                      r={6}
                      fill="#10b981"
                      stroke="#ffffff"
                      strokeWidth={1.5}
                      isFront
                    />
                  ))}

                {/* Plot Sell Execution Markers */}
                {chartData
                  .filter(d => d.tradeType === 'SELL' || d.tradeType === 'CLOSE_LONG')
                  .map((d, idx) => (
                    <ReferenceDot
                      key={`sell-${idx}`}
                      x={d.time}
                      y={d.price}
                      r={6}
                      fill="#ef4444"
                      stroke="#ffffff"
                      strokeWidth={1.5}
                      isFront
                    />
                  ))}
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs font-mono">
              Synchronizing price telemetry...
            </div>
          )}
        </div>
      </div>

      {/* 2. Portfolio Balance Equity Progression Curve */}
      <div className="bg-theme-card border border-theme-border p-4 rounded-xl shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary font-sans">Portfolio Performance</span>
            <h3 className="font-sans font-bold text-theme-text text-sm">Equity Growth Curve (Cumulative Portfolio Balance)</h3>
          </div>
          <div className="px-2.5 py-1 rounded bg-primary/10 border border-primary/20 text-primary text-[10px] font-sans font-bold flex items-center gap-1 shadow-sm animate-pulse">
            <TrendingUp className="h-3 w-3" />
            <span>Init: $10,000 USD</span>
          </div>
        </div>

        <div className="h-56">
          {formattedEquityData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={formattedEquityData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="equity-glow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--theme-border)" opacity={0.6} />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={9} tickLine={false} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={9}
                  tickLine={false}
                  domain={['auto', 'auto']}
                  tickFormatter={(val) => `$${val.toLocaleString()}`}
                />
                <Tooltip content={<EquityTooltip />} />
                
                <Area
                  type="monotone"
                  dataKey="equity"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#equity-glow)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs font-mono">
              Run strategy compile + backtest to plot performance.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
