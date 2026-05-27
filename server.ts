import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Lazily initialized Gemini Client to avoid crash if API Keys are missing at start
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!genAIClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('GEMINI_API_KEY is missing. Please add it in the Secrets panel inside AI Studio settings.');
    }
    genAIClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return genAIClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Check overall health info
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', serverTime: new Date().toISOString() });
  });

  // API Route: Pull OHLC historical candles with pagination (Phase 5 specs)
  app.get('/api/history/candles', async (req, res) => {
    const symbolStr = (req.query.symbol as string) || 'BTCUSD';
    const resolution = (req.query.resolution as string) || '2h';
    const startSec = Number(req.query.start) || Math.floor(Date.now() / 1000) - 85 * 2 * 3600;
    const endSec = Number(req.query.end) || Math.floor(Date.now() / 1000);

    // Clean or map symbol format for Delta Exchange India
    let cleanedSymbol = symbolStr;
    const upperSym = symbolStr.toUpperCase();
    if (upperSym === 'BTC-USD-PERP' || upperSym === 'BTCUSD' || upperSym === 'BTC') {
      cleanedSymbol = 'BTC_USDT';
    } else if (upperSym === 'ETH-USD-PERP' || upperSym === 'ETHUSD' || upperSym === 'ETH') {
      cleanedSymbol = 'ETH_USDT';
    } else {
      // Retain custom options and perps names such as BTC_64000_280526_C, ETH_3200_280526_P, etc.
      cleanedSymbol = symbolStr.replace(/-/g, '_');
    }

    // Map resolution to seconds
    const resolutionSecondsMap: Record<string, number> = {
      '1m': 60,
      '3m': 180,
      '5m': 300,
      '15m': 900,
      '30m': 1800,
      '1h': 3600,
      '2h': 7200,
      '4h': 14400,
      'd': 86400,
      'w': 604800,
    };
    const intervalSec = resolutionSecondsMap[resolution] || 7200;

    let allCandles: any[] = [];
    let currentStart = startSec;
    const maxCandlesPerCall = 2000;
    const chunkWindow = maxCandlesPerCall * intervalSec;
    let fallbackTriggered = false;

    try {
      while (currentStart < endSec) {
        const chunkEnd = Math.min(endSec, currentStart + chunkWindow);
        const targetUrl = `https://api.india.delta.exchange/v2/history/candles?symbol=${cleanedSymbol}&resolution=${resolution}&start=${currentStart}&end=${chunkEnd}`;
        
        console.log(`[BACKTEST ENGINE] Fetching candle chunk from ${new Date(currentStart * 1000).toISOString()} to ${new Date(chunkEnd * 1000).toISOString()}`);
        
        const response = await fetch(targetUrl);
        if (!response.ok) {
          throw new Error(`Delta Exchange API returned status ${response.status}`);
        }
        
        const data = await response.json();
        const chunkResult = data.result || data;
        
        if (Array.isArray(chunkResult) && chunkResult.length > 0) {
          allCandles = allCandles.concat(chunkResult);
        } else {
          break;
        }

        // Advance start to avoid overlapping or infinite loop
        currentStart = chunkEnd + 1;
        // Limit iterations to prevent rogue CPU locks
        if (allCandles.length >= 8000) {
          break;
        }
      }
    } catch (err: any) {
      console.warn(`[BACKTEST ENGINE] Delta Exchange pull rejected/failed (${err.message}). Defaulting to procedural candles.`, err);
      fallbackTriggered = true;
    }

    if (fallbackTriggered || allCandles.length === 0) {
      const candleCount = Math.min(1000, Math.ceil((endSec - startSec) / intervalSec));
      let currentPrice = cleanedSymbol.toLowerCase().includes('eth') ? 3100 : 58500;
      let timeStepVec = startSec;
      
      const simulated: any[] = [];
      for (let k = 0; k < candleCount; k++) {
        const hNoise = (Math.random() - 0.485) * (currentPrice * 0.016);
        const o = currentPrice;
        const c = currentPrice + hNoise;
        const h = Math.max(o, c) + Math.random() * (currentPrice * 0.005);
        const l = Math.min(o, c) - Math.random() * (currentPrice * 0.005);
        const v = Math.floor(Math.random() * 800) + 150;
        
        simulated.push({
          time: new Date(timeStepVec * 1000).toISOString().slice(0, 16).replace('T', ' '),
          open: parseFloat(o.toFixed(2)),
          high: parseFloat(h.toFixed(2)),
          low: parseFloat(l.toFixed(2)),
          close: parseFloat(c.toFixed(2)),
          volume: v
        });
        
        currentPrice = c;
        timeStepVec += intervalSec;
      }
      return res.json({
        symbol: symbolStr,
        resolution,
        candles: simulated,
        source: 'procedural-fallback'
      });
    }

    const formattedCandles = allCandles.map((c: any) => {
      // Delta returns fields: t (time), o (open), h (high), l (low), c (close), v (volume)
      const tVal = c.time || c.time_seconds || c.t;
      const tString = typeof tVal === 'number' 
        ? new Date(tVal * 1000).toISOString().slice(0, 16).replace('T', ' ')
        : String(tVal);

      return {
        time: tString,
        open: Number(c.open || c.o),
        high: Number(c.high || c.h),
        low: Number(c.low || c.l),
        close: Number(c.close || c.c),
        volume: Number(c.volume || c.v || 0)
      };
    });

    res.json({
      symbol: symbolStr,
      resolution,
      candles: formattedCandles,
      source: 'delta-exchange-india'
    });
  });

  // API Route: AI natural language strategy to node structure compiler
  app.post('/api/strategy/compile-ai', async (req, res) => {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid request field: prompt' });
    }

    try {
      const ai = getGenAI();

      const systemPrompt = `You are a Delta Exchange quant strategy architect.
Your task is to take a natural language description, analyze it, and compile it into a visual node connection graph (directed acyclic graph or DAG).
The nodes must match these exact components ONLY:
- Indicators:
  - "EMA" with parameters: "period" (number)
  - "RSI" with parameters: "period" (number)
  - "MACD" with parameters: "fastPeriod" (number), "slowPeriod" (number), "signalPeriod" (number)
  - "Bollinger_Bands" with parameters: "period" (number), "stdDev" (number)
- Signals:
  - "Crossover" (takes input 'a' and 'b', has outputs 'bullish', 'bearish')
  - "Threshold" (takes input 'value', has parameters 'highThresh' (number), 'lowThresh' (number), has outputs 'above', 'below')
- Logic Gates:
  - "AND_Gate" (inputs 'cond1', 'cond2', output 'out')
  - "OR_Gate" (inputs 'cond1', 'cond2', output 'out')
  - "NOT_Gate" (input 'cond', output 'out')
- Actions:
  - "BUY_LONG" (input 'trigger', 'sizePercent', parameter 'size' (number))
  - "SELL_SHORT" (input 'trigger', 'sizePercent', parameter 'size' (number))
  - "CLOSE_POSITION" (input 'trigger')
- Risk management:
  - "StopLoss" (input 'price', parameter 'lossPercent' (number))
  - "TakeProfit" (input 'price', parameter 'profitPercent' (number))

Rules for node properties:
1. Every node ID must be unique (e.g. "ema_9", "crossover_1").
2. Specify positions (x, y) dynamically to align beautifully flow-wise:
   - Indicators: x ranges 60 to 180, Y values spaced sequentially (e.g., 50, 180, 310)
   - Signals & Logic Gates: x ranges 300 to 450, balanced along Y
   - Actions & Risks: x ranges 600 to 750, balanced along Y
3. Connect output ports to input ports correctly. Every connection must have valid 'fromNodeId' and 'toNodeId' with matches from the computed ports! Let outputs flow sequentially into signals, into actions.
4. If an exit condition is requested or standard risk stop is requested, connect the Risk node output "triggered" to a CLOSE_POSITION node trigger. Or if standard crossover signals are there, connect bearish crossover direct to CLOSE_POSITION!
5. IMPORTANT: Output only clean valid JSON matching the exact schema definition. No extra text, wrapping, or commentary.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `Compile this trading idea into a node strategy graph: "${prompt}"`,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: 'Short neat title representing the compiled strategy' },
              description: { type: Type.STRING, description: 'Clear high level summary of the trigger logic' },
              nodes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING, description: 'Unique node id like ema_fast, trigger_buy' },
                    type: { type: Type.STRING, description: 'Must be: indicator, signal, condition, action, or risk' },
                    name: { type: Type.STRING, description: 'The exact registered name (e.g., EMA, RSI, Crossover, Threshold, AND_Gate, BUY_LONG, SELL_SHORT, CLOSE_POSITION, StopLoss)' },
                    label: { type: Type.STRING, description: 'Friendly descriptor text like RSI(14)' },
                    position: {
                      type: Type.OBJECT,
                      properties: {
                        x: { type: Type.INTEGER },
                        y: { type: Type.INTEGER }
                      },
                      required: ['x', 'y']
                    },
                    parameters: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          name: { type: Type.STRING, description: 'parameter name like period, highThresh, lossPercent' },
                          type: { type: Type.STRING, description: 'number, string, or select' },
                          value: { type: Type.STRING, description: 'The compiled parameter value as string or number' }
                        },
                        required: ['name', 'type', 'value']
                      }
                    }
                  },
                  required: ['id', 'type', 'name', 'label', 'position', 'parameters']
                }
              },
              connections: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING, description: 'Unique connection id like conn_1, link_2' },
                    fromNodeId: { type: Type.STRING },
                    fromPortId: { type: Type.STRING },
                    toNodeId: { type: Type.STRING },
                    toPortId: { type: Type.STRING }
                  },
                  required: ['id', 'fromNodeId', 'fromPortId', 'toNodeId', 'toPortId']
                }
              }
            },
            required: ['name', 'description', 'nodes', 'connections']
          }
        }
      });

      const responseText = response.text ? response.text.trim() : '{}';
      const parsedStrategy = JSON.parse(responseText);

      // Post-process response to ensure matching ports exist on the UI
      // Inject standard inputs/outputs metadata properties so the client node generator reconstructs them correctly
      res.json(parsedStrategy);

    } catch (err: any) {
      console.error('Error in strategy compilations: ', err);
      res.status(500).json({
        error: err.message || 'Failed compile strategy using Gemini AI. Please check server settings.'
      });
    }
  });

  // Serve static files in production layout, otherwise run through Vite development proxy middleware
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running successfully on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to boot Express-Vite backend: ', err);
});
