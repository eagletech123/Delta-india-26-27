import { StrategyNode, Connection, HistoricalBar } from './types';

// Predefined available node definitions that can be dragged/placed
export const NODE_TEMPLATES: Omit<StrategyNode, 'id' | 'position'>[] = [
  // --- INDICATORS ---
  {
    type: 'indicator',
    name: 'EMA',
    label: 'EMA (Exp Moving Avg)',
    inputs: [{ id: 'price', name: 'Price', type: 'number' }],
    outputs: [{ id: 'value', name: 'Output', type: 'number' }],
    parameters: [
      { name: 'period', type: 'number', value: 9 },
      { name: 'source', type: 'select', value: 'close', options: ['close', 'open', 'high', 'low'] }
    ]
  },
  {
    type: 'indicator',
    name: 'RSI',
    label: 'RSI (Relative Strength)',
    inputs: [{ id: 'price', name: 'Price', type: 'number' }],
    outputs: [{ id: 'value', name: 'Output', type: 'number' }],
    parameters: [
      { name: 'period', type: 'number', value: 14 }
    ]
  },
  {
    type: 'indicator',
    name: 'MACD',
    label: 'MACD Indicator',
    inputs: [{ id: 'price', name: 'Price', type: 'number' }],
    outputs: [
      { id: 'macd', name: 'MACD Line', type: 'number' },
      { id: 'signal', name: 'Signal Line', type: 'number' },
      { id: 'hist', name: 'Histogram', type: 'number' }
    ],
    parameters: [
      { name: 'fastPeriod', type: 'number', value: 12 },
      { name: 'slowPeriod', type: 'number', value: 26 },
      { name: 'signalPeriod', type: 'number', value: 9 }
    ]
  },
  {
    type: 'indicator',
    name: 'Bollinger_Bands',
    label: 'Bollinger Bands',
    inputs: [{ id: 'price', name: 'Price', type: 'number' }],
    outputs: [
      { id: 'upper', name: 'Upper Band', type: 'number' },
      { id: 'middle', name: 'Basis (SMA)', type: 'number' },
      { id: 'lower', name: 'Lower Band', type: 'number' }
    ],
    parameters: [
      { name: 'period', type: 'number', value: 20 },
      { name: 'stdDev', type: 'number', value: 2 }
    ]
  },

  // --- SIGNALS ---
  {
    type: 'signal',
    name: 'Crossover',
    label: 'Crossover Detector',
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
    type: 'signal',
    name: 'Threshold',
    label: 'Threshold trigger',
    inputs: [
      { id: 'value', name: 'Value', type: 'number' }
    ],
    outputs: [
      { id: 'above', name: 'Value > High Thresh', type: 'boolean' },
      { id: 'below', name: 'Value < Low Thresh', type: 'boolean' }
    ],
    parameters: [
      { name: 'highThresh', type: 'number', value: 70 },
      { name: 'lowThresh', type: 'number', value: 30 }
    ]
  },

  // --- CONDITIONS ---
  {
    type: 'condition',
    name: 'AND_Gate',
    label: 'AND Logic Gate',
    inputs: [
      { id: 'cond1', name: 'Condition 1', type: 'boolean' },
      { id: 'cond2', name: 'Condition 2', type: 'boolean' }
    ],
    outputs: [{ id: 'out', name: 'Output', type: 'boolean' }],
    parameters: []
  },
  {
    type: 'condition',
    name: 'OR_Gate',
    label: 'OR Logic Gate',
    inputs: [
      { id: 'cond1', name: 'Condition 1', type: 'boolean' },
      { id: 'cond2', name: 'Condition 2', type: 'boolean' }
    ],
    outputs: [{ id: 'out', name: 'Output', type: 'boolean' }],
    parameters: []
  },
  {
    type: 'condition',
    name: 'NOT_Gate',
    label: 'NOT Logic Gate',
    inputs: [
      { id: 'cond', name: 'Condition', type: 'boolean' }
    ],
    outputs: [{ id: 'out', name: 'Output', type: 'boolean' }],
    parameters: []
  },

  // --- ACTIONS ---
  {
    type: 'action',
    name: 'BUY_LONG',
    label: 'Buy Long Action',
    inputs: [
      { id: 'trigger', name: 'Trigger (ON)', type: 'boolean' },
      { id: 'sizePercent', name: 'Size %', type: 'number' }
    ],
    outputs: [{ id: 'executed', name: 'Executed', type: 'boolean' }],
    parameters: [
      { name: 'size', type: 'number', value: 100 }
    ]
  },
  {
    type: 'action',
    name: 'SELL_SHORT',
    label: 'Sell Short Action',
    inputs: [
      { id: 'trigger', name: 'Trigger (ON)', type: 'boolean' },
      { id: 'sizePercent', name: 'Size %', type: 'number' }
    ],
    outputs: [{ id: 'executed', name: 'Executed', type: 'boolean' }],
    parameters: [
      { name: 'size', type: 'number', value: 100 }
    ]
  },
  {
    type: 'action',
    name: 'CLOSE_POSITION',
    label: 'Close Position',
    inputs: [
      { id: 'trigger', name: 'Trigger (ON)', type: 'boolean' }
    ],
    outputs: [{ id: 'executed', name: 'Executed', type: 'boolean' }],
    parameters: []
  },

  // --- RISK MANAGEMENT ---
  {
    type: 'risk',
    name: 'StopLoss',
    label: 'Stop Loss Guard',
    inputs: [
      { id: 'price', name: 'Current Price', type: 'number' }
    ],
    outputs: [{ id: 'triggered', name: 'Trigger Out', type: 'boolean' }],
    parameters: [
      { name: 'lossPercent', type: 'number', value: 2.5 }
    ]
  },
  {
    type: 'risk',
    name: 'TakeProfit',
    label: 'Take Profit Guard',
    inputs: [
      { id: 'price', name: 'Current Price', type: 'number' }
    ],
    outputs: [{ id: 'triggered', name: 'Trigger Out', type: 'boolean' }],
    parameters: [
      { name: 'profitPercent', type: 'number', value: 5.0 }
    ]
  },
  {
    type: 'risk',
    name: 'SmartTrailingSL',
    label: 'Smart Trailing SL',
    inputs: [
      { id: 'price', name: 'Current Price', type: 'number' }
    ],
    outputs: [
      { id: 'triggered', name: 'Trigger Out', type: 'boolean' },
      { id: 'current_sl_px', name: 'Active SL Px', type: 'number' }
    ],
    parameters: [
      { name: 'trail_type', type: 'select', value: 'Percentage', options: ['Percentage', 'ATR-Based', 'Step-Lock'] },
      { name: 'activation_pct', type: 'number', value: 1.5 },
      { name: 'trail_pct', type: 'number', value: 1.0 },
      { name: 'atr_multiplier', type: 'number', value: 2.5 },
      { name: 'step_profit_pct', type: 'number', value: 2.0 },
      { name: 'initial_loss_pct', type: 'number', value: 3.0 }
    ]
  },
  {
    type: 'derivative',
    name: 'Future_Perp',
    label: 'Future Perp Contract',
    inputs: [
      { id: 'underlying_price', name: 'Underlying Px', type: 'number' }
    ],
    outputs: [
      { id: 'perp_price', name: 'Perp Price', type: 'number' },
      { id: 'funding_rate', name: 'Funding %', type: 'number' }
    ],
    parameters: [
      { name: 'ticker', type: 'select', value: 'BTC-USD-PERP', options: ['BTC-USD-PERP', 'ETH-USD-PERP', 'SOL-USD-PERP', 'ARB-USD-PERP'] },
      { name: 'leverage', type: 'number', value: 10 }
    ]
  },
  {
    type: 'derivative',
    name: 'Option_Contract',
    label: 'Call/Put Option Structer',
    inputs: [
      { id: 'underlying_price', name: 'Underlying Px', type: 'number' }
    ],
    outputs: [
      { id: 'premium', name: 'Premium Price', type: 'number' },
      { id: 'strike', name: 'Strike Price', type: 'number' },
      { id: 'delta', name: 'Delta Value', type: 'number' }
    ],
    parameters: [
      { name: 'option_type', type: 'select', value: 'Call', options: ['Call', 'Put'] },
      { name: 'moneyness', type: 'select', value: 'ATM', options: ['ATM', 'OTM', 'ITM', 'Premium-Based', 'Custom'] },
      { name: 'target_premium', type: 'number', value: 150 },
      { name: 'strike_offset', type: 'number', value: 0 },
      { name: 'dte', type: 'number', value: 7 }
    ]
  },
  {
    type: 'derivative',
    name: 'Premium_Strike_Selector',
    label: 'Premium Strike Filter',
    inputs: [
      { id: 'underlying_price', name: 'Underlying Px', type: 'number' },
      { id: 'target_premium', name: 'Target Premium', type: 'number' }
    ],
    outputs: [
      { id: 'selected_strike', name: 'Selected Strike', type: 'number' },
      { id: 'actual_premium', name: 'Actual Premium', type: 'number' },
      { id: 'dte_days', name: 'DTE Days', type: 'number' }
    ],
    parameters: [
      { name: 'option_type', type: 'select', value: 'Call', options: ['Call', 'Put'] },
      { name: 'days_min', type: 'number', value: 1 },
      { name: 'days_max', type: 'number', value: 30 },
      { name: 'max_deviation', type: 'number', value: 15 }
    ]
  }
];

// Prebuilt sample strategies: Gold Cross, RSI Mean Reversion
export const PREBUILT_STRATEGIES: {
  name: string;
  description: string;
  nodes: StrategyNode[];
  connections: Connection[];
}[] = [
  {
    name: 'EMA Gold Cross',
    description: 'Fast EMA (9) crosses above Slow EMA (21) for Long entries, with Stop Loss and Take Profit protection.',
    nodes: [
      {
        id: 'ema_fast',
        type: 'indicator',
        name: 'EMA',
        label: 'Fast EMA (9)',
        position: { x: 50, y: 50 },
        inputs: [{ id: 'price', name: 'Price', type: 'number' }],
        outputs: [{ id: 'value', name: 'Output', type: 'number' }],
        parameters: [
          { name: 'period', type: 'number', value: 9 },
          { name: 'source', type: 'select', value: 'close', options: ['close', 'open', 'high', 'low'] }
        ]
      },
      {
        id: 'ema_slow',
        type: 'indicator',
        name: 'EMA',
        label: 'Slow EMA (21)',
        position: { x: 50, y: 220 },
        inputs: [{ id: 'price', name: 'Price', type: 'number' }],
        outputs: [{ id: 'value', name: 'Output', type: 'number' }],
        parameters: [
          { name: 'period', type: 'number', value: 21 },
          { name: 'source', type: 'select', value: 'close', options: ['close', 'open', 'high', 'low'] }
        ]
      },
      {
        id: 'crossover_det',
        type: 'signal',
        name: 'Crossover',
        label: 'Crossover Detector',
        position: { x: 320, y: 120 },
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
        id: 'action_buy',
        type: 'action',
        name: 'BUY_LONG',
        label: 'Buy Long',
        position: { x: 600, y: 60 },
        inputs: [
          { id: 'trigger', name: 'Trigger (ON)', type: 'boolean' },
          { id: 'sizePercent', name: 'Size %', type: 'number' }
        ],
        outputs: [{ id: 'executed', name: 'Executed', type: 'boolean' }],
        parameters: [{ name: 'size', type: 'number', value: 100 }]
      },
      {
        id: 'action_close',
        type: 'action',
        name: 'CLOSE_POSITION',
        label: 'Close Long',
        position: { x: 600, y: 240 },
        inputs: [{ id: 'trigger', name: 'Trigger (ON)', type: 'boolean' }],
        outputs: [{ id: 'executed', name: 'Executed', type: 'boolean' }],
        parameters: []
      }
    ],
    connections: [
      {
        id: 'c1',
        fromNodeId: 'ema_fast',
        fromPortId: 'value',
        toNodeId: 'crossover_det',
        toPortId: 'a'
      },
      {
        id: 'c2',
        fromNodeId: 'ema_slow',
        fromPortId: 'value',
        toNodeId: 'crossover_det',
        toPortId: 'b'
      },
      {
        id: 'c3',
        fromNodeId: 'crossover_det',
        fromPortId: 'bullish',
        toNodeId: 'action_buy',
        toPortId: 'trigger'
      },
      {
        id: 'c4',
        fromNodeId: 'crossover_det',
        fromPortId: 'bearish',
        toNodeId: 'action_close',
        toPortId: 'trigger'
      }
    ]
  },
  {
    name: 'RSI Mean Reversion',
    description: 'Enters Short when RSI is overbought (>70) and Long when RSI is oversold (<30).',
    nodes: [
      {
        id: 'rsi_ind',
        type: 'indicator',
        name: 'RSI',
        label: 'RSI (14)',
        position: { x: 50, y: 150 },
        inputs: [{ id: 'price', name: 'Price', type: 'number' }],
        outputs: [{ id: 'value', name: 'Output', type: 'number' }],
        parameters: [{ name: 'period', type: 'number', value: 14 }]
      },
      {
        id: 'thresh_node',
        type: 'signal',
        name: 'Threshold',
        label: 'RSI Thresholds',
        position: { x: 300, y: 130 },
        inputs: [{ id: 'value', name: 'Value', type: 'number' }],
        outputs: [
          { id: 'above', name: 'Value > High Thresh', type: 'boolean' },
          { id: 'below', name: 'Value < Low Thresh', type: 'boolean' }
        ],
        parameters: [
          { name: 'highThresh', type: 'number', value: 70 },
          { name: 'lowThresh', type: 'number', value: 30 }
        ]
      },
      {
        id: 'action_buy',
        type: 'action',
        name: 'BUY_LONG',
        label: 'Oversold Buy',
        position: { x: 580, y: 50 },
        inputs: [
          { id: 'trigger', name: 'Trigger (ON)', type: 'boolean' },
          { id: 'sizePercent', name: 'Size %', type: 'number' }
        ],
        outputs: [{ id: 'executed', name: 'Executed', type: 'boolean' }],
        parameters: [{ name: 'size', type: 'number', value: 100 }]
      },
      {
        id: 'action_sell',
        type: 'action',
        name: 'SELL_SHORT',
        label: 'Overbought Short',
        position: { x: 580, y: 220 },
        inputs: [
          { id: 'trigger', name: 'Trigger (ON)', type: 'boolean' },
          { id: 'sizePercent', name: 'Size %', type: 'number' }
        ],
        outputs: [{ id: 'executed', name: 'Executed', type: 'boolean' }],
        parameters: [{ name: 'size', type: 'number', value: 100 }]
      }
    ],
    connections: [
      {
        id: 'c1',
        fromNodeId: 'rsi_ind',
        fromPortId: 'value',
        toNodeId: 'thresh_node',
        toPortId: 'value'
      },
      {
        id: 'c2',
        fromNodeId: 'thresh_node',
        fromPortId: 'below',
        toNodeId: 'action_buy',
        toPortId: 'trigger'
      },
      {
        id: 'c3',
        fromNodeId: 'thresh_node',
        fromPortId: 'above',
        toNodeId: 'action_sell',
        toPortId: 'trigger'
      }
    ]
  },
  {
    name: 'Smart Options Trailing Guard',
    description: 'Selects options based on target premiums, executing buys with risk protected by our Step-Lock Smart Trailing Stop Loss system.',
    nodes: [
      {
        id: 'opt_contract',
        type: 'derivative',
        name: 'Option_Contract',
        label: 'Option Target Contract',
        position: { x: 40, y: 150 },
        inputs: [{ id: 'underlying_price', name: 'Underlying Px', type: 'number' }],
        outputs: [
          { id: 'premium', name: 'Premium Price', type: 'number' },
          { id: 'strike', name: 'Strike Price', type: 'number' },
          { id: 'delta', name: 'Delta Value', type: 'number' }
        ],
        parameters: [
          { name: 'option_type', type: 'select', value: 'Call', options: ['Call', 'Put'] },
          { name: 'moneyness', type: 'select', value: 'Premium-Based', options: ['ATM', 'OTM', 'ITM', 'Premium-Based', 'Custom'] },
          { name: 'target_premium', type: 'number', value: 180 },
          { name: 'strike_offset', type: 'number', value: 0 },
          { name: 'dte', type: 'number', value: 14 }
        ]
      },
      {
        id: 'rsi_trigger',
        type: 'indicator',
        name: 'RSI',
        label: 'Option Signals RSI (14)',
        position: { x: 40, y: 340 },
        inputs: [{ id: 'price', name: 'Price', type: 'number' }],
        outputs: [{ id: 'value', name: 'Output', type: 'number' }],
        parameters: [{ name: 'period', type: 'number', value: 14 }]
      },
      {
        id: 'rsi_thresh',
        type: 'signal',
        name: 'Threshold',
        label: 'Momentum Check',
        position: { x: 300, y: 310 },
        inputs: [{ id: 'value', name: 'Value', type: 'number' }],
        outputs: [
          { id: 'above', name: 'Value > High Thresh', type: 'boolean' },
          { id: 'below', name: 'Value < Low Thresh', type: 'boolean' }
        ],
        parameters: [
          { name: 'highThresh', type: 'number', value: 65 },
          { name: 'lowThresh', type: 'number', value: 35 }
        ]
      },
      {
        id: 'buy_exec',
        type: 'action',
        name: 'BUY_LONG',
        label: 'Enter Option long',
        position: { x: 550, y: 100 },
        inputs: [
          { id: 'trigger', name: 'Trigger (ON)', type: 'boolean' },
          { id: 'sizePercent', name: 'Size %', type: 'number' }
        ],
        outputs: [{ id: 'executed', name: 'Executed', type: 'boolean' }],
        parameters: [{ name: 'size', type: 'number', value: 100 }]
      },
      {
        id: 'smart_tsl',
        type: 'risk',
        name: 'SmartTrailingSL',
        label: 'Step-Lock Trailing Stop',
        position: { x: 540, y: 260 },
        inputs: [{ id: 'price', name: 'Current Price', type: 'number' }],
        outputs: [
          { id: 'triggered', name: 'Trigger Out', type: 'boolean' },
          { id: 'current_sl_px', name: 'Active SL Px', type: 'number' }
        ],
        parameters: [
          { name: 'trail_type', type: 'select', value: 'Step-Lock', options: ['Percentage', 'ATR-Based', 'Step-Lock'] },
          { name: 'activation_pct', type: 'number', value: 1.0 },
          { name: 'trail_pct', type: 'number', value: 1.2 },
          { name: 'atr_multiplier', type: 'number', value: 2.5 },
          { name: 'step_profit_pct', type: 'number', value: 1.5 },
          { name: 'initial_loss_pct', type: 'number', value: 2.5 }
        ]
      }
    ],
    connections: [
      {
        id: 'c1',
        fromNodeId: 'rsi_trigger',
        fromPortId: 'value',
        toNodeId: 'rsi_thresh',
        toPortId: 'value'
      },
      {
        id: 'c2',
        fromNodeId: 'rsi_thresh',
        fromPortId: 'below',
        toNodeId: 'buy_exec',
        toPortId: 'trigger'
      }
    ]
  }
];

// Helper to generate a realistic looking historical price series
export function generateMockHistory(symbol: string, barsCount: number = 80): HistoricalBar[] {
  const bars: HistoricalBar[] = [];
  let basePrice = symbol.includes('BTC') ? 68000 : 3500;
  let currentTime = new Date();
  
  // Set starting state based on real-world trends
  currentTime.setHours(currentTime.getHours() - barsCount * 2);

  let currentPrice = basePrice;
  // Make a beautiful volatile sinusoid trend with micro noises
  for (let i = 0; i < barsCount; i++) {
    const scale = currentPrice * 0.005;
    // trend component (long waves)
    const trend = Math.sin(i / 10) * currentPrice * 0.012;
    // noise factor
    const noise = (Math.random() - 0.48) * scale;
    
    const open = currentPrice;
    const close = currentPrice + trend + noise;
    
    const high = Math.max(open, close) + Math.random() * scale * 0.5;
    const low = Math.min(open, close) - Math.random() * scale * 0.5;
    const volume = Math.floor(100 + Math.random() * 900);

    bars.push({
      time: new Date(currentTime.getTime() + i * 2 * 60 * 60 * 1000).toISOString().slice(0, 16).replace('T', ' '),
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume
    });

    currentPrice = close;
  }

  return bars;
}
