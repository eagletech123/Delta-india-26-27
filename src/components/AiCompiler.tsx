import React, { useState } from 'react';
import { Sparkles, Loader2, Play, CircleAlert } from 'lucide-react';
import { StrategyNode, Connection } from '../types';

interface AiCompilerProps {
  onStrategyCompiled: (strategy: { name: string; description: string; nodes: StrategyNode[]; connections: Connection[] }) => void;
  addLog: (msg: string, type: 'info' | 'success' | 'warning' | 'error') => void;
}

export default function AiCompiler({ onStrategyCompiled, addLog }: AiCompilerProps) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  // Suggestions list to help the user get started
  const PRESET_IDEAS = [
    { text: "RSI Mean Reversion: Buy at RSI < 30, exit Long at RSI > 70", label: "RSI Reversals" },
    { text: "EMA golden cross: EMA(9) crosses above EMA(21) for buys, Stop loss at 3%", label: "Gold Cross" },
    { text: "Bollinger Breakdown: Buy when under lower band, close when above upper band", label: "Bands Break" },
  ];

  const handleAiCompile = async (textToCompile: string) => {
    if (!textToCompile.trim()) return;
    setLoading(true);
    setErrorText(null);
    addLog(`Initiating AI strategy compilation for: "${textToCompile.substring(0, 40)}..."`, 'info');

    try {
      const response = await fetch('/api/strategy/compile-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: textToCompile }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${response.status} Error`);
      }

      const parsed = await response.json();
      if (!parsed.nodes || !parsed.connections) {
        throw new Error("Invalid schema structure returned from Gemini model.");
      }

      // Convert parameters to standard formats if returned as string
      const sanitizedNodes = parsed.nodes.map((node: any) => ({
        ...node,
        inputs: node.inputs || [],
        outputs: node.outputs || [],
        parameters: node.parameters.map((p: any) => ({
          ...p,
          value: isNaN(p.value) ? p.value : Number(p.value)
        }))
      }));

      onStrategyCompiled({
        name: parsed.name || 'AI Generated Strategy',
        description: parsed.description || 'Custom compiled description',
        nodes: sanitizedNodes,
        connections: parsed.connections || []
      });

      addLog(`Gemini successfully compiled "${parsed.name}" into visual DAG graph with ${sanitizedNodes.length} nodes!`, 'success');
    } catch (err: any) {
      console.warn("AI compiling failed, falling back to client-side heuristics helper: ", err.message);
      
      // Fallback Strategy Generator (Failsafe offline compiler)
      const offlineStrategy = runOfflineFailsafeCompiler(textToCompile);
      
      onStrategyCompiled(offlineStrategy);
      
      const missingKeyWarning = err.message.includes('GEMINI_API_KEY') 
        ? "GEMINI_API_KEY is missing/invalid in settings."
        : `Server API issue (${err.message}).`;

      setErrorText(`${missingKeyWarning} Ran heuristics-compiler fallback.`);
      addLog(`Offline heuristics compiler successfully reconstructed "${offlineStrategy.name}"!`, 'warning');
    } finally {
      setLoading(false);
    }
  };

  // Heuristic-based Strategy Compiler that parses words and returns a fully functional strategy node graph
  const runOfflineFailsafeCompiler = (input: string): { name: string; description: string; nodes: StrategyNode[]; connections: Connection[] } => {
    const text = input.toLowerCase();
    
    // Default fallback skeleton is RSI Mean Reversion or EMA Crossover depending on keywords
    if (text.includes('ema') || text.includes('cross') || text.includes('moving')) {
      // Build a fast-slow EMA crossover
      let fastPeriod = 9;
      let slowPeriod = 21;
      let stopLoss = 2.5;

      const fastMatch = text.match(/ema\s*\(?(\d+)\)?/i) || text.match(/fast\s*(\d+)/i);
      if (fastMatch) fastPeriod = parseInt(fastMatch[1]);
      const slowMatch = text.match(/slow\s*(\d+)/i) || text.match(/period\s*of\s*(\d+)/i);
      if (slowMatch) slowPeriod = parseInt(slowMatch[1]);

      return {
        name: `EMA Dual Trend Rider`,
        description: `Constructed offline fallback strategy trigger using EMA(${fastPeriod}) & EMA(${slowPeriod}) triggers.`,
        nodes: [
          {
            id: 'ema_fast_fallback',
            type: 'indicator',
            name: 'EMA',
            label: `Fast EMA (${fastPeriod})`,
            position: { x: 60, y: 70 },
            inputs: [{ id: 'price', name: 'Price', type: 'number' }],
            outputs: [{ id: 'value', name: 'Output', type: 'number' }],
            parameters: [
              { name: 'period', type: 'number', value: fastPeriod },
              { name: 'source', type: 'select', value: 'close', options: ['close', 'open', 'high', 'low'] }
            ]
          },
          {
            id: 'ema_slow_fallback',
            type: 'indicator',
            name: 'EMA',
            label: `Slow EMA (${slowPeriod})`,
            position: { x: 60, y: 240 },
            inputs: [{ id: 'price', name: 'Price', type: 'number' }],
            outputs: [{ id: 'value', name: 'Output', type: 'number' }],
            parameters: [
              { name: 'period', type: 'number', value: slowPeriod },
              { name: 'source', type: 'select', value: 'close', options: ['close', 'open', 'high', 'low'] }
            ]
          },
          {
            id: 'cross_fallback',
            type: 'signal',
            name: 'Crossover',
            label: 'Crossover Detector',
            position: { x: 320, y: 140 },
            inputs: [
              { id: 'a', name: 'Val A (Fast)', type: 'number' },
              { id: 'b', name: 'Val B (Slow)', type: 'number' }
            ],
            outputs: [
              { id: 'bullish', name: 'Cross Above (Bullish)', type: 'boolean' },
              { id: 'bearish', name: 'Cross Below (Bearish)', type: 'boolean' }
            ],
            parameters: []
          },
          {
            id: 'action_buy_fallback',
            type: 'action',
            name: 'BUY_LONG',
            label: 'Trigger Long Position',
            position: { x: 580, y: 60 },
            inputs: [
              { id: 'trigger', name: 'Trigger (ON)', type: 'boolean' },
              { id: 'sizePercent', name: 'Size %', type: 'number' }
            ],
            outputs: [{ id: 'executed', name: 'Executed', type: 'boolean' }],
            parameters: [{ name: 'size', type: 'number', value: 100 }]
          },
          {
            id: 'action_close_fallback',
            type: 'action',
            name: 'CLOSE_POSITION',
            label: 'Close Active Position',
            position: { x: 580, y: 230 },
            inputs: [{ id: 'trigger', name: 'Trigger (ON)', type: 'boolean' }],
            outputs: [{ id: 'executed', name: 'Executed', type: 'boolean' }],
            parameters: []
          }
        ],
        connections: [
          { id: 'fallback_l1', fromNodeId: 'ema_fast_fallback', fromPortId: 'value', toNodeId: 'cross_fallback', toPortId: 'a' },
          { id: 'fallback_l2', fromNodeId: 'ema_slow_fallback', fromPortId: 'value', toNodeId: 'cross_fallback', toPortId: 'b' },
          { id: 'fallback_l3', fromNodeId: 'cross_fallback', fromPortId: 'bullish', toNodeId: 'action_buy_fallback', toPortId: 'trigger' },
          { id: 'fallback_l4', fromNodeId: 'cross_fallback', fromPortId: 'bearish', toNodeId: 'action_close_fallback', toPortId: 'trigger' }
        ]
      };
    } else {
      // Build an RSI reversion structure as general default fallback
      let period = 14;
      let highThresh = 70;
      let lowThresh = 30;

      if (text.includes('rsi(')) {
        const match = text.match(/rsi\((\d+)\)/);
        if (match) period = parseInt(match[1]);
      }

      return {
        name: `RSI Dynamic Oscillator`,
        description: `Constructed offline fallback strategy using RSI(${period}) overbought / oversold bounds.`,
        nodes: [
          {
            id: 'rsi_fallback',
            type: 'indicator',
            name: 'RSI',
            label: `RSI (${period})`,
            position: { x: 60, y: 150 },
            inputs: [{ id: 'price', name: 'Price', type: 'number' }],
            outputs: [{ id: 'value', name: 'Output', type: 'number' }],
            parameters: [{ name: 'period', type: 'number', value: period }]
          },
          {
            id: 'thresh_fallback',
            type: 'signal',
            name: 'Threshold',
            label: 'Overbought / Oversold',
            position: { x: 310, y: 130 },
            inputs: [{ id: 'value', name: 'Value', type: 'number' }],
            outputs: [
              { id: 'above', name: 'Value > High Thresh', type: 'boolean' },
              { id: 'below', name: 'Value < Low Thresh', type: 'boolean' }
            ],
            parameters: [
              { name: 'highThresh', type: 'number', value: highThresh },
              { name: 'lowThresh', type: 'number', value: lowThresh }
            ]
          },
          {
            id: 'buy_fallback',
            type: 'action',
            name: 'BUY_LONG',
            label: 'Oversold Long Fill',
            position: { x: 580, y: 60 },
            inputs: [
              { id: 'trigger', name: 'Trigger (ON)', type: 'boolean' },
              { id: 'sizePercent', name: 'Size %', type: 'number' }
            ],
            outputs: [{ id: 'executed', name: 'Executed', type: 'boolean' }],
            parameters: [{ name: 'size', type: 'number', value: 100 }]
          },
          {
            id: 'sell_fallback',
            type: 'action',
            name: 'SELL_SHORT',
            label: 'Overbought Short Fill',
            position: { x: 580, y: 230 },
            inputs: [
              { id: 'trigger', name: 'Trigger (ON)', type: 'boolean' },
              { id: 'sizePercent', name: 'Size %', type: 'number' }
            ],
            outputs: [{ id: 'executed', name: 'Executed', type: 'boolean' }],
            parameters: [{ name: 'size', type: 'number', value: 100 }]
          }
        ],
        connections: [
          { id: 'f_rsi_1', fromNodeId: 'rsi_fallback', fromPortId: 'value', toNodeId: 'thresh_fallback', toPortId: 'value' },
          { id: 'f_rsi_2', fromNodeId: 'thresh_fallback', fromPortId: 'below', toNodeId: 'buy_fallback', toPortId: 'trigger' },
          { id: 'f_rsi_3', fromNodeId: 'thresh_fallback', fromPortId: 'above', toNodeId: 'sell_fallback', toPortId: 'trigger' }
        ]
      };
    }
  };

  return (
    <div className="bg-theme-card border border-theme-border rounded-xl p-4 flex flex-col gap-3 min-w-0 shadow-sm text-theme-text">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="font-sans font-bold text-theme-text text-sm">AI Natural Strategy Compiler</h3>
      </div>
      
      <p className="text-xs text-slate-400 font-sans leading-relaxed">
        Describe your algorithmic logic in plain text. Gemini will dynamically design nodes, map mathematical flow lines, and plot them instantly.
      </p>

      {/* Input Form */}
      <div className="flex flex-col gap-2">
        <textarea
          rows={3}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="E.g., Create light trend following strategy: Buy when close prices cross above EMA(12). Save a stop loss of 2%..."
          className="w-full bg-theme-bg border border-theme-border rounded-lg p-2.5 text-xs text-theme-text placeholder-slate-500 focus:outline-none focus:border-primary font-sans resize-none leading-normal focus:bg-theme-card transition-colors"
          disabled={loading}
        />

        <button
          onClick={() => handleAiCompile(prompt)}
          disabled={loading || !prompt.trim()}
          className="w-full h-9 bg-primary hover:bg-primary/90 text-black font-sans text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed select-none shadow-sm focus:ring-1 focus:ring-primary cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="h-4.5 w-4.5 animate-spin" />
              <span>Gemini Designing DAG Graph...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4.5 w-4.5 text-black" />
              <span>Compile with Gemini AI</span>
            </>
          )}
        </button>
      </div>

      {/* Error / Failsafe Notification */}
      {errorText && (
        <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-lg text-[11px] text-amber-500 font-mono">
          <CircleAlert className="h-4 w-4 shrink-0 text-amber-500" />
          <span>{errorText}</span>
        </div>
      )}

      {/* Suggestion Presets */}
      <div>
        <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider">Example Templates:</span>
        <div className="flex flex-wrap gap-1.5 mt-1">
          {PRESET_IDEAS.map((idea, idx) => (
            <button
              key={idx}
              disabled={loading}
              onClick={() => {
                setPrompt(idea.text);
                handleAiCompile(idea.text);
              }}
              className="px-2 py-1 text-[10px] text-slate-300 bg-theme-bg hover:bg-theme-card hover:text-theme-text transition border border-theme-border rounded-md font-sans select-none cursor-pointer"
            >
              {idea.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
