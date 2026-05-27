export type NodeType = 'indicator' | 'derivative' | 'signal' | 'condition' | 'action' | 'risk' | 'utility';

export interface Port {
  id: string;
  name: string;
  type: string; // 'number' | 'boolean' | 'any'
}

export interface NodeParameter {
  name: string;
  type: 'number' | 'string' | 'select';
  value: any;
  options?: string[]; // For select inputs
}

export interface StrategyNode {
  id: string;
  type: NodeType;
  name: string;
  label: string;
  position: { x: number; y: number };
  inputs: Port[];
  outputs: Port[];
  parameters: NodeParameter[];
}

export interface Connection {
  id: string;
  fromNodeId: string;
  fromPortId: string;
  toNodeId: string;
  toPortId: string;
}

export interface HistoricalBar {
  time: string; // 'YYYY-MM-DD HH:MM' or timestamp
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface BacktestResult {
  totalTrades: number;
  winRate: number; // percentage
  totalProfitPercent: number;
  sharpeRatio: number;
  maxDrawdownPercent: number;
  winLossRatio: number;
  initialBalance: number;
  finalBalance: number;
  trades: BacktestTrade[];
  equityCurve: { time: string; equity: number }[];
}

export interface BacktestTrade {
  id: string;
  type: 'BUY' | 'SELL' | 'CLOSE_LONG' | 'CLOSE_SHORT';
  price: number;
  size: number;
  time: string;
  profitPercent?: number;
  pnlUSD?: number;
  balanceAfter: number;
}

export interface RealTimeTick {
  time: string;
  price: number;
  volume: number;
  changePercent: number;
}

export interface Order {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  type: 'MARKET' | 'LIMIT';
  price?: number;
  size: number;
  status: 'PENDING' | 'FILLED' | 'CANCELLED';
  timestamp: string;
}

export interface Position {
  symbol: string;
  side: 'LONG' | 'SHORT' | 'NONE';
  entryPrice: number;
  size: number;
  marginContracts: number;
  unrealizedPnl: number;
  liquidationPrice: number;
}

export interface ExecutionLog {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
}
