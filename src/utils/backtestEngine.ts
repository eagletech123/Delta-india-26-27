import { StrategyNode, Connection, HistoricalBar, BacktestResult, BacktestTrade } from '../types';

// Helper: Normal CFD approximation
function cdfNormal(x: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp(-x * x / 2);
  const prob = d * t * (0.3193815 * t + t * (-0.3565638 * t + t * (1.781478 * t + t * (-1.821256 * t + 1.330274 * t))));
  const r = 1 - prob;
  return x > 0 ? r : 1 - r;
}

// Black-Scholes option price & delta calculator for backtests
export function calculateBlackScholes(
  S: number, // Spot Price
  K: number, // Strike Price
  dteDays: number, // Days to Expiry
  volatility: number = 0.45,
  optionType: 'Call' | 'Put' = 'Call',
  riskFreeRate: number = 0.05
) {
  const T = Math.max(0.001, dteDays / 365); // in years
  const sigma = Math.max(0.05, volatility);

  const d1 = (Math.log(S / K) + (riskFreeRate + (sigma * sigma) / 2) * T) / (sigma * Math.sqrt(T));
  const d2 = d1 - sigma * Math.sqrt(T);

  const nd1 = cdfNormal(d1);
  const nd2 = cdfNormal(d2);
  const n_d1 = cdfNormal(-d1);
  const n_d2 = cdfNormal(-d2);

  let premium = 0;
  let delta = 0;

  if (optionType === 'Call') {
    premium = S * nd1 - K * Math.exp(-riskFreeRate * T) * nd2;
    delta = nd1;
  } else {
    premium = K * Math.exp(-riskFreeRate * T) * n_d2 - S * n_d1;
    delta = nd1 - 1; // puts have negative delta
  }

  return {
    premium: Math.max(0.1, premium),
    delta: Number(delta.toFixed(4)),
    theta: Number((- (S * sigma * Math.exp(-d1*d1/2)) / (2 * Math.sqrt(2 * Math.PI * T))).toFixed(2)) // approx Theta for Options context
  };
}

// Helper to calculate technical indicators on historical bars
export function computeEMA(prices: number[], period: number): number[] {
  const ema: number[] = [];
  if (prices.length === 0) return ema;
  
  const k = 2 / (period + 1);
  let prevEma = prices[0];
  ema.push(prevEma);

  for (let i = 1; i < prices.length; i++) {
    const curEma = prices[i] * k + prevEma * (1 - k);
    ema.push(curEma);
    prevEma = curEma;
  }
  return ema;
}

export function computeRSI(prices: number[], period: number): number[] {
  const rsi: number[] = [];
  if (prices.length < 2) {
    return Array(prices.length).fill(50);
  }

  // Calculate changes
  const changes: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    changes.push(prices[i] - prices[i - 1]);
  }

  const rsiValues: number[] = [50]; // first item placeholder
  let avgGain = 0;
  let avgLoss = 0;

  // First gain/loss average
  const initialPeriod = Math.min(period, changes.length);
  for (let i = 0; i < initialPeriod; i++) {
    const change = changes[i];
    if (change > 0) avgGain += change;
    else avgLoss += Math.abs(change);
  }
  avgGain /= period;
  avgLoss /= period;

  if (avgLoss === 0) {
    rsiValues.push(100);
  } else {
    const rs = avgGain / avgLoss;
    rsiValues.push(100 - 100 / (1 + rs));
  }

  for (let i = period + 1; i <= prices.length; i++) {
    const change = changes[i - 2];
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    if (avgLoss === 0) {
      rsiValues.push(100);
    } else {
      const rs = avgGain / avgLoss;
      rsiValues.push(100 - 100 / (1 + rs));
    }
  }

  // Pad the beginning with 50s so it matches prices length
  while (rsiValues.length < prices.length) {
    rsiValues.unshift(50);
  }
  return rsiValues;
}

export function computeMACD(prices: number[], fastPeriod: number, slowPeriod: number, signalPeriod: number) {
  const fastEma = computeEMA(prices, fastPeriod);
  const slowEma = computeEMA(prices, slowPeriod);
  
  const macdLine: number[] = [];
  for (let i = 0; i < prices.length; i++) {
    macdLine.push(fastEma[i] - slowEma[i]);
  }

  const signalLine = computeEMA(macdLine, signalPeriod);
  const histogram: number[] = [];
  for (let i = 0; i < prices.length; i++) {
    histogram.push(macdLine[i] - signalLine[i]);
  }

  return { macd: macdLine, signal: signalLine, hist: histogram };
}

export function computeBollingerBands(prices: number[], period: number, stdDev: number) {
  const upper: number[] = [];
  const middle: number[] = [];
  const lower: number[] = [];

  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      middle.push(prices[i]);
      upper.push(prices[i]);
      lower.push(prices[i]);
      continue;
    }

    const window = prices.slice(i - period + 1, i + 1);
    const sum = window.reduce((a, b) => a + b, 0);
    const mean = sum / period;

    const variance = window.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / period;
    const std = Math.sqrt(variance);

    middle.push(mean);
    upper.push(mean + stdDev * std);
    lower.push(mean - stdDev * std);
  }

  return { upper, middle, lower };
}

// Full strategy compilation & execution simulation
export function runBacktest(
  nodes: StrategyNode[],
  connections: Connection[],
  bars: HistoricalBar[],
  initialBalance: number = 10000
): BacktestResult {
  const closePrices = bars.map(b => b.close);
  const highPrices = bars.map(b => b.high);
  const lowPrices = bars.map(b => b.low);

  // 1. Resolve Indicators first so Node state arrays are fully pre-populated
  const preComputed: Record<string, Record<string, number[]>> = {};

  // Track each node's static parameters easily
  const getParamValue = (node: StrategyNode, name: string, def: any) => {
    const p = node.parameters.find(x => x.name === name);
    return p ? p.value : def;
  };

  nodes.forEach(node => {
    if (node.type === 'indicator') {
      preComputed[node.id] = {};
      if (node.name === 'EMA') {
        const period = Number(getParamValue(node, 'period', 9));
        preComputed[node.id]['value'] = computeEMA(closePrices, period);
      } else if (node.name === 'RSI') {
        const period = Number(getParamValue(node, 'period', 14));
        preComputed[node.id]['value'] = computeRSI(closePrices, period);
      } else if (node.name === 'MACD') {
        const fast = Number(getParamValue(node, 'fastPeriod', 12));
        const slow = Number(getParamValue(node, 'slowPeriod', 26));
        const sig = Number(getParamValue(node, 'signalPeriod', 9));
        const res = computeMACD(closePrices, fast, slow, sig);
        preComputed[node.id]['macd'] = res.macd;
        preComputed[node.id]['signal'] = res.signal;
        preComputed[node.id]['hist'] = res.hist;
      } else if (node.name === 'Bollinger_Bands') {
        const period = Number(getParamValue(node, 'period', 20));
        const dev = Number(getParamValue(node, 'stdDev', 2));
        const res = computeBollingerBands(closePrices, period, dev);
        preComputed[node.id]['upper'] = res.upper;
        preComputed[node.id]['middle'] = res.middle;
        preComputed[node.id]['lower'] = res.lower;
      }
    }
  });

  // 2. Play the ticks sequentially to simulate live signals over-time
  let currentBalance = initialBalance;
  let currentPosition: {
    side: 'LONG' | 'SHORT' | 'NONE';
    entryPrice: number;
    sizeUSD: number;
    sizeContracts: number;
  } = { side: 'NONE', entryPrice: 0, sizeUSD: 0, sizeContracts: 0 };

  const trades: BacktestTrade[] = [];
  const equityCurve: { time: string; equity: number }[] = [];

  // Trailing stop loss state caches for active positions
  const activeTrailingSls: Record<string, { trailingSl: number; highestHigh: number; lowestLow: number; initialized: boolean }> = {};

  // Helper inside loop to check what values flow into a node port
  const getPortDataSeriesOrConstant = (nodeId: string, portId: string, barIndex: number): number | boolean => {
    // Check if there is an incoming connection to this port
    const conn = connections.find(c => c.toNodeId === nodeId && c.toPortId === portId);
    if (!conn) {
      // Return constant from node parameter if applicable, or default fallback
      const node = nodes.find(n => n.id === nodeId);
      if (node) {
        // StopLoss percentage, Take Profit etc
        if (portId === 'price') return closePrices[barIndex];
        const val = getParamValue(node, portId, null);
        if (val !== null) return val;
      }
      return 0;
    }

    // Is it referencing an indicator output port?
    if (preComputed[conn.fromNodeId] && preComputed[conn.fromNodeId][conn.fromPortId]) {
      return preComputed[conn.fromNodeId][conn.fromPortId][barIndex];
    }

    // It is connected to another signal, condition or risk node. We must evaluate dynamically.
    return evaluateDynamicNode(conn.fromNodeId, conn.fromPortId, barIndex);
  };

  // Memoized evaluation for bar index to prevent infinite recursion in complex graphs
  const memoEval: Record<string, Record<number, boolean | number>> = {};
  function evaluateDynamicNode(nodeId: string, portId: string, idx: number): boolean | number {
    const key = `${nodeId}-${portId}`;
    if (!memoEval[key]) memoEval[key] = {};
    if (memoEval[key][idx] !== undefined) return memoEval[key][idx];

    const node = nodes.find(n => n.id === nodeId);
    if (!node) return 0;

    let result: boolean | number = 0;

    if (node.name === 'Crossover') {
      const valA0 = getPortDataSeriesOrConstant(nodeId, 'a', idx);
      const valB0 = getPortDataSeriesOrConstant(nodeId, 'b', idx);
      
      const valAPrev = idx > 0 ? getPortDataSeriesOrConstant(nodeId, 'a', idx - 1) : valA0;
      const valBPrev = idx > 0 ? getPortDataSeriesOrConstant(nodeId, 'b', idx - 1) : valB0;

      if (portId === 'bullish') {
        result = (valA0 > valB0) && (valAPrev <= valBPrev);
      } else if (portId === 'bearish') {
        result = (valA0 < valB0) && (valAPrev >= valBPrev);
      }
    } else if (node.name === 'Threshold') {
      const val = Number(getPortDataSeriesOrConstant(nodeId, 'value', idx));
      const high = Number(getParamValue(node, 'highThresh', 70));
      const low = Number(getParamValue(node, 'lowThresh', 30));

      if (portId === 'above') result = val > high;
      if (portId === 'below') result = val < low;
    } else if (node.name === 'AND_Gate') {
      const c1 = !!getPortDataSeriesOrConstant(nodeId, 'cond1', idx);
      const c2 = !!getPortDataSeriesOrConstant(nodeId, 'cond2', idx);
      result = c1 && c2;
    } else if (node.name === 'OR_Gate') {
      const c1 = !!getPortDataSeriesOrConstant(nodeId, 'cond1', idx);
      const c2 = !!getPortDataSeriesOrConstant(nodeId, 'cond2', idx);
      result = c1 || c2;
    } else if (node.name === 'NOT_Gate') {
      const c = !!getPortDataSeriesOrConstant(nodeId, 'cond', idx);
      result = !c;
    } else if (node.name === 'StopLoss') {
      if (currentPosition.side === 'NONE') {
        result = false;
      } else {
        const curPrice = closePrices[idx];
        const lossLimit = Number(getParamValue(node, 'lossPercent', 2.5)) / 100;
        if (currentPosition.side === 'LONG') {
          result = curPrice <= currentPosition.entryPrice * (1 - lossLimit);
        } else {
          result = curPrice >= currentPosition.entryPrice * (1 + lossLimit);
        }
      }
    } else if (node.name === 'TakeProfit') {
      if (currentPosition.side === 'NONE') {
        result = false;
      } else {
        const curPrice = closePrices[idx];
        const gainLimit = Number(getParamValue(node, 'profitPercent', 5.0)) / 100;
        if (currentPosition.side === 'LONG') {
          result = curPrice >= currentPosition.entryPrice * (1 + gainLimit);
        } else {
          result = curPrice <= currentPosition.entryPrice * (1 - gainLimit);
        }
      }
    } else if (node.name === 'SmartTrailingSL') {
      const state = activeTrailingSls[nodeId];
      if (!state || currentPosition.side === 'NONE') {
        if (portId === 'triggered') result = false;
        else if (portId === 'current_sl_px') result = 0;
      } else {
        if (portId === 'triggered') {
          const curPrice = closePrices[idx];
          if (currentPosition.side === 'LONG') {
            result = curPrice <= state.trailingSl;
          } else {
            result = curPrice >= state.trailingSl;
          }
        } else if (portId === 'current_sl_px') {
          result = Number(state.trailingSl.toFixed(2));
        }
      }
    } else if (node.name === 'Future_Perp') {
      const S = Number(getPortDataSeriesOrConstant(nodeId, 'underlying_price', idx) || closePrices[idx]);
      const drift = 1 + (0.0003 * Math.sin(idx / 5));
      if (portId === 'perp_price') {
        result = Number((S * drift).toFixed(2));
      } else if (portId === 'funding_rate') {
        result = Number((0.0001 * Math.sin(idx / 10)).toFixed(5));
      }
    } else if (node.name === 'Option_Contract') {
      const S = Number(getPortDataSeriesOrConstant(nodeId, 'underlying_price', idx) || closePrices[idx]);
      const optionType = getParamValue(node, 'option_type', 'Call') as 'Call' | 'Put';
      const moneyness = getParamValue(node, 'moneyness', 'ATM');
      const dte = Number(getParamValue(node, 'dte', 7));
      const step = S > 10000 ? 500 : (S > 1000 ? 100 : 10);
      let calculatedStrike = S;
      
      if (moneyness === 'ATM') {
        calculatedStrike = Math.round(S / step) * step;
      } else if (moneyness === 'OTM') {
        calculatedStrike = optionType === 'Call' ? Math.round((S * 1.1) / step) * step : Math.round((S * 0.9) / step) * step;
      } else if (moneyness === 'ITM') {
        calculatedStrike = optionType === 'Call' ? Math.round((S * 0.9) / step) * step : Math.round((S * 1.1) / step) * step;
      } else if (moneyness === 'Premium-Based') {
        const targetPremium = Number(getParamValue(node, 'target_premium', 150));
        let closestDiff = Infinity;
        const minK = Math.floor((S * 0.7) / step) * step;
        const maxK = Math.ceil((S * 1.3) / step) * step;
        for (let K = minK; K <= maxK; K += step) {
          const bs = calculateBlackScholes(S, K, dte, 0.45, optionType);
          const diff = Math.abs(bs.premium - targetPremium);
          if (diff < closestDiff) {
            closestDiff = diff;
            calculatedStrike = K;
          }
        }
      } else {
        calculatedStrike = S + Number(getParamValue(node, 'strike_offset', 0));
      }
      
      const bsInfo = calculateBlackScholes(S, calculatedStrike, dte, 0.45, optionType);
      if (portId === 'premium') {
        result = Number(bsInfo.premium.toFixed(2));
      } else if (portId === 'strike') {
        result = calculatedStrike;
      } else if (portId === 'delta') {
        result = bsInfo.delta;
      }
    } else if (node.name === 'Premium_Strike_Selector') {
      const S = Number(getPortDataSeriesOrConstant(nodeId, 'underlying_price', idx) || closePrices[idx]);
      const targetPremium = Number(getPortDataSeriesOrConstant(nodeId, 'target_premium', idx) || 150);
      const optionType = getParamValue(node, 'option_type', 'Call') as 'Call' | 'Put';
      const daysMin = Number(getParamValue(node, 'days_min', 1));
      const daysMax = Number(getParamValue(node, 'days_max', 30));
      const potentialDays = [1, 3, 7, 14, 21, 30].filter(d => d >= daysMin && d <= daysMax);
      if (potentialDays.length === 0) potentialDays.push(daysMin);
      
      const step = S > 10000 ? 500 : (S > 1000 ? 100 : 10);
      let bestK = Math.round(S / step) * step;
      let bestDte = potentialDays[0];
      let closestDiff = Infinity;
      let actualPremium = targetPremium;
      
      for (const dte of potentialDays) {
        const minK = Math.floor((S * 0.7) / step) * step;
        const maxK = Math.ceil((S * 1.3) / step) * step;
        for (let K = minK; K <= maxK; K += step) {
          const bs = calculateBlackScholes(S, K, dte, 0.45, optionType);
          const diff = Math.abs(bs.premium - targetPremium);
          if (diff < closestDiff) {
            closestDiff = diff;
            bestK = K;
            bestDte = dte;
            actualPremium = bs.premium;
          }
        }
      }
      
      if (portId === 'selected_strike') {
        result = bestK;
      } else if (portId === 'actual_premium') {
        result = Number(actualPremium.toFixed(2));
      } else if (portId === 'dte_days') {
        result = bestDte;
      }
    }

    memoEval[key][idx] = result;
    return result;
  }

  // Iterate the backtest bars (skip first 2 bars to allow indicator stability)
  for (let i = 2; i < bars.length; i++) {
    const curBar = bars[i];
    const curPrice = curBar.close;

    // Track dynamic smart trailing Stop Loss state bar by bar
    if (currentPosition.side === 'NONE') {
      nodes.forEach(n => {
        if (n.name === 'SmartTrailingSL') {
          activeTrailingSls[n.id] = { trailingSl: 0, highestHigh: 0, lowestLow: 0, initialized: false };
        }
      });
    } else {
      nodes.forEach(n => {
        if (n.name === 'SmartTrailingSL') {
          const state = activeTrailingSls[n.id] || { trailingSl: 0, highestHigh: 0, lowestLow: 0, initialized: false };
          if (!state.initialized) {
            const initLossPct = Number(getParamValue(n, 'initial_loss_pct', 3.0)) / 100;
            const entryPx = currentPosition.entryPrice;
            state.highestHigh = entryPx;
            state.lowestLow = entryPx;
            state.trailingSl = currentPosition.side === 'LONG'
              ? entryPx * (1 - initLossPct)
              : entryPx * (1 + initLossPct);
            state.initialized = true;
          }

          const highVal = curBar.high;
          const lowVal = curBar.low;
          const trailPct = Number(getParamValue(n, 'trail_pct', 1.0)) / 100;
          const actPct = Number(getParamValue(n, 'activation_pct', 1.5)) / 100;
          const type = getParamValue(n, 'trail_type', 'Percentage');

          if (currentPosition.side === 'LONG') {
            state.highestHigh = Math.max(state.highestHigh, highVal);
            const pnlPct = (state.highestHigh - currentPosition.entryPrice) / currentPosition.entryPrice;
            
            if (pnlPct >= actPct) {
              if (type === 'Percentage') {
                const proposedSl = state.highestHigh * (1 - trailPct);
                state.trailingSl = Math.max(state.trailingSl, proposedSl);
              } else if (type === 'ATR-Based') {
                const atrMult = Number(getParamValue(n, 'atr_multiplier', 2.5));
                const ranges: number[] = [];
                const startIdx = Math.max(0, i - 14);
                for (let k = startIdx + 1; k <= i; k++) {
                  const h = highPrices[k];
                  const l = lowPrices[k];
                  const prevC = closePrices[k - 1];
                  ranges.push(Math.max(h - l, Math.abs(h - prevC), Math.abs(l - prevC)));
                }
                const atr = ranges.reduce((sum, v) => sum + v, 0) / (ranges.length || 1);
                const proposedSl = state.highestHigh - atr * atrMult;
                state.trailingSl = Math.max(state.trailingSl, proposedSl);
              } else if (type === 'Step-Lock') {
                const stepPct = Number(getParamValue(n, 'step_profit_pct', 2.0)) / 100;
                const level = Math.floor(pnlPct / stepPct);
                if (level >= 1) {
                  const proposedSl = currentPosition.entryPrice * (1 + (level - 1) * stepPct);
                  state.trailingSl = Math.max(state.trailingSl, proposedSl);
                }
              }
            }
          } else if (currentPosition.side === 'SHORT') {
            state.lowestLow = Math.min(state.lowestLow, lowVal);
            const pnlPct = (currentPosition.entryPrice - state.lowestLow) / currentPosition.entryPrice;
            
            if (pnlPct >= actPct) {
              if (type === 'Percentage') {
                const proposedSl = state.lowestLow * (1 + trailPct);
                state.trailingSl = state.trailingSl === 0 ? proposedSl : Math.min(state.trailingSl, proposedSl);
              } else if (type === 'ATR-Based') {
                const atrMult = Number(getParamValue(n, 'atr_multiplier', 2.5));
                const ranges: number[] = [];
                const startIdx = Math.max(0, i - 14);
                for (let k = startIdx + 1; k <= i; k++) {
                  const h = highPrices[k];
                  const l = lowPrices[k];
                  const prevC = closePrices[k - 1];
                  ranges.push(Math.max(h - l, Math.abs(h - prevC), Math.abs(l - prevC)));
                }
                const atr = ranges.reduce((sum, v) => sum + v, 0) / (ranges.length || 1);
                const proposedSl = state.lowestLow + atr * atrMult;
                state.trailingSl = state.trailingSl === 0 ? proposedSl : Math.min(state.trailingSl, proposedSl);
              } else if (type === 'Step-Lock') {
                const stepPct = Number(getParamValue(n, 'step_profit_pct', 2.0)) / 100;
                const level = Math.floor(pnlPct / stepPct);
                if (level >= 1) {
                  const proposedSl = currentPosition.entryPrice * (1 - (level - 1) * stepPct);
                  state.trailingSl = state.trailingSl === 0 ? proposedSl : Math.min(state.trailingSl, proposedSl);
                }
              }
            }
          }
          activeTrailingSls[n.id] = state;
        }
      });
    }

    // Evaluate Risk controls (StopLoss & TakeProfit & SmartTrailingSL)
    let exitTriggered = false;
    let exitReason = '';

    const stopLossNodes = nodes.filter(n => n.name === 'StopLoss');
    for (const slNode of stopLossNodes) {
      if (evaluateDynamicNode(slNode.id, 'triggered', i)) {
        exitTriggered = true;
        exitReason = 'Stop Loss Guard';
        break;
      }
    }

    const takeProfitNodes = nodes.filter(n => n.name === 'TakeProfit');
    for (const tpNode of takeProfitNodes) {
      if (evaluateDynamicNode(tpNode.id, 'triggered', i)) {
        exitTriggered = true;
        exitReason = 'Take Profit Guard';
        break;
      }
    }

    const trailingSlNodes = nodes.filter(n => n.name === 'SmartTrailingSL');
    for (const tslNode of trailingSlNodes) {
      if (evaluateDynamicNode(tslNode.id, 'triggered', i)) {
        exitTriggered = true;
        exitReason = tslNode.label;
        break;
      }
    }

    // Evaluate standard Actions nodes
    const buyNodes = nodes.filter(n => n.name === 'BUY_LONG');
    const sellNodes = nodes.filter(n => n.name === 'SELL_SHORT');
    const closeNodes = nodes.filter(n => n.name === 'CLOSE_POSITION');

    let buyTriggered = false;
    let sellTriggered = false;
    let closeActionsTriggered = false;

    for (const bNode of buyNodes) {
      if (getPortDataSeriesOrConstant(bNode.id, 'trigger', i) === true) {
        buyTriggered = true;
      }
    }
    for (const sNode of sellNodes) {
      if (getPortDataSeriesOrConstant(sNode.id, 'trigger', i) === true) {
        sellTriggered = true;
      }
    }
    for (const cNode of closeNodes) {
      if (getPortDataSeriesOrConstant(cNode.id, 'trigger', i) === true) {
        closeActionsTriggered = true;
      }
    }

    // --- State Machine Execution & Delta India Contract specs ---
    const multiplier = 0.001; // 0.001 BTC per contract
    const feeRate = 0.0005;   // 0.05% taker fee

    // Check for open position exit triggers
    if (currentPosition.side !== 'NONE' && (exitTriggered || closeActionsTriggered)) {
      const positionSizeContracts = currentPosition.sizeContracts;
      const positionValueAtClose = positionSizeContracts * multiplier * curPrice;
      const closeFeeUSD = positionValueAtClose * feeRate;

      // Realized PNL calculation: (mark_price - entry_price) * size * 0.001
      const pnlUSD = currentPosition.side === 'LONG'
        ? (curPrice - currentPosition.entryPrice) * positionSizeContracts * multiplier
        : (currentPosition.entryPrice - curPrice) * positionSizeContracts * multiplier;

      // Deduct closing fee and realize PNL
      currentBalance += pnlUSD - closeFeeUSD;

      const pnlRate = pnlUSD / currentPosition.sizeUSD;

      trades.push({
        id: `T_CLOSE_${i}`,
        type: currentPosition.side === 'LONG' ? 'CLOSE_LONG' : 'CLOSE_SHORT',
        price: curPrice,
        size: parseFloat(positionSizeContracts.toFixed(4)),
        time: curBar.time,
        profitPercent: parseFloat((pnlRate * 100).toFixed(2)),
        pnlUSD: parseFloat((pnlUSD - closeFeeUSD).toFixed(2)), // Net PNL after closing fee
        balanceAfter: parseFloat(currentBalance.toFixed(2))
      });

      currentPosition = { side: 'NONE', entryPrice: 0, sizeUSD: 0, sizeContracts: 0 };
    } else if (currentPosition.side === 'NONE') {
      if (buyTriggered && !sellTriggered) {
        // Open Long position
        // Each contract is: 0.001 * current price.
        // Balance available allows sizeContracts to be whole integer
        const contractCostUSD = curPrice * multiplier;
        const sizeContracts = Math.floor(currentBalance / contractCostUSD);

        if (sizeContracts > 0) {
          const positionValueUSD = sizeContracts * multiplier * curPrice;
          const openFeeUSD = positionValueUSD * feeRate;

          // Deduct opening fee immediately
          currentBalance -= openFeeUSD;

          currentPosition = {
            side: 'LONG',
            entryPrice: curPrice,
            sizeUSD: positionValueUSD,
            sizeContracts: sizeContracts
          };

          trades.push({
            id: `T_BUY_${i}`,
            type: 'BUY',
            price: curPrice,
            size: sizeContracts, // integer contract size
            time: curBar.time,
            balanceAfter: parseFloat(currentBalance.toFixed(2))
          });
        }
      } else if (sellTriggered && !buyTriggered) {
        // Open Short position
        const contractCostUSD = curPrice * multiplier;
        const sizeContracts = Math.floor(currentBalance / contractCostUSD);

        if (sizeContracts > 0) {
          const positionValueUSD = sizeContracts * multiplier * curPrice;
          const openFeeUSD = positionValueUSD * feeRate;

          // Deduct opening fee immediately
          currentBalance -= openFeeUSD;

          currentPosition = {
            side: 'SHORT',
            entryPrice: curPrice,
            sizeUSD: positionValueUSD,
            sizeContracts: sizeContracts
          };

          trades.push({
            id: `T_SELL_${i}`,
            type: 'SELL',
            price: curPrice,
            size: sizeContracts, // integer contract size
            time: curBar.time,
            balanceAfter: parseFloat(currentBalance.toFixed(2))
          });
        }
      }
    }

    // Mark equity curve point
    let tempBalance = currentBalance;
    if (currentPosition.side !== 'NONE') {
      const positionValueAtClose = currentPosition.sizeContracts * multiplier * curPrice;
      const potentialCloseFeeUSD = positionValueAtClose * feeRate;
      const pnlUSD = currentPosition.side === 'LONG'
        ? (curPrice - currentPosition.entryPrice) * currentPosition.sizeContracts * multiplier
        : (currentPosition.entryPrice - curPrice) * currentPosition.sizeContracts * multiplier;
      tempBalance += pnlUSD - potentialCloseFeeUSD;
    }
    equityCurve.push({ time: curBar.time, equity: parseFloat(tempBalance.toFixed(2)) });
  }

  // Calculate statistics
  const totalTrades = trades.length;
  const closedTrades = trades.filter(t => t.type.includes('CLOSE'));
  const winningTrades = closedTrades.filter(t => t.pnlUSD && t.pnlUSD > 0);
  const losingTrades = closedTrades.filter(t => t.pnlUSD && t.pnlUSD < 0);
  const winRate = closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0;

  // Exact Win/Loss Ratio = Avg Win / Avg Loss
  const sumWins = winningTrades.reduce((sum, t) => sum + (t.pnlUSD || 0), 0);
  const sumLosses = losingTrades.reduce((sum, t) => sum + Math.abs(t.pnlUSD || 0), 0);
  const avgWin = winningTrades.length > 0 ? sumWins / winningTrades.length : 0;
  const avgLoss = losingTrades.length > 0 ? sumLosses / losingTrades.length : 0;
  const winLossRatio = avgLoss > 0 ? avgWin / avgLoss : 0;
  
  const totalProfitPercent = ((currentBalance - initialBalance) / initialBalance) * 100;

  // Drawdown & Sharpe calculation
  let peak = initialBalance;
  let maxDrawdown = 0;
  let returns: number[] = [];

  equityCurve.forEach((pt, j) => {
    if (pt.equity > peak) peak = pt.equity;
    const dd = ((peak - pt.equity) / peak) * 100;
    if (dd > maxDrawdown) maxDrawdown = dd;

    if (j > 0) {
      const prev = equityCurve[j - 1].equity;
      returns.push(prev > 0 ? (pt.equity - prev) / prev : 0);
    }
  });

  // Simple clean Sharpe Ratio math
  let sharpeRatio = 0;
  if (returns.length > 0) {
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);
    // Annualize Sharpe (using standard 252 trading days adjusted sample size approximation)
    sharpeRatio = stdDev > 0 ? (avgReturn / stdDev) * Math.sqrt(252) : 0;
  }

  // Fail-safe formatting standard
  return {
    totalTrades,
    winRate: parseFloat(winRate.toFixed(1)),
    totalProfitPercent: parseFloat(totalProfitPercent.toFixed(2)),
    sharpeRatio: parseFloat(isNaN(sharpeRatio) ? '0' : sharpeRatio.toFixed(2)),
    maxDrawdownPercent: parseFloat(maxDrawdown.toFixed(2)),
    winLossRatio: parseFloat(winLossRatio.toFixed(2)),
    initialBalance,
    finalBalance: parseFloat(currentBalance.toFixed(2)),
    trades,
    equityCurve
  };
}
