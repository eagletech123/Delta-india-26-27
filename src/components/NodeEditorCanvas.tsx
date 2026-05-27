import React, { useState, useRef, useEffect } from 'react';
import { Trash2, Link, Plus, Move, Sparkles, X, PlusCircle } from 'lucide-react';
import { StrategyNode, Connection, Port } from '../types';
import { NODE_TEMPLATES } from '../data';

interface NodeEditorCanvasProps {
  nodes: StrategyNode[];
  connections: Connection[];
  onUpdateNodes: (nodes: StrategyNode[]) => void;
  onUpdateConnections: (connections: Connection[]) => void;
  addLog: (msg: string, type: 'info' | 'success' | 'warning' | 'error') => void;
}

export default function NodeEditorCanvas({
  nodes,
  connections,
  onUpdateNodes,
  onUpdateConnections,
  addLog
}: NodeEditorCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [activeSource, setActiveSource] = useState<{ nodeId: string; portId: string } | null>(null);

  // Card dimensions for mathematical line plotting
  const CARD_WIDTH = 220;
  const HEADER_HEIGHT = 44;
  const PORT_HEIGHT = 28;

  // Track cursor position for custom live wire preview
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (canvasRef.current && (draggedNodeId || activeSource)) {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setMousePos({ x, y });
      }
    };
    window.addEventListener('mousemove', handleGlobalMouseMove);
    return () => window.removeEventListener('mousemove', handleGlobalMouseMove);
  }, [draggedNodeId, activeSource]);

  // Handle Drag Start
  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    
    // Check if clicking inside input/select to not block focus parameters editing
    const targetTag = (e.target as HTMLElement).tagName.toLowerCase();
    if (targetTag === 'input' || targetTag === 'select' || targetTag === 'button') {
      return;
    }

    e.preventDefault();
    setDraggedNodeId(nodeId);

    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      setDragOffset({
        x: clickX - node.position.x,
        y: clickY - node.position.y
      });
    }
  };

  // Drag Motion logic
  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!draggedNodeId || !canvasRef.current) return;
    e.preventDefault();
    
    const rect = canvasRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    let targetX = clickX - dragOffset.x;
    let targetY = clickY - dragOffset.y;

    // Bounds limit checking (keep inside canvas)
    targetX = Math.max(10, Math.min(rect.width - CARD_WIDTH - 20, targetX));
    targetY = Math.max(10, Math.min(rect.height - 150, targetY));

    onUpdateNodes(nodes.map(node => {
      if (node.id === draggedNodeId) {
        return {
          ...node,
          position: { x: Math.round(targetX), y: Math.round(targetY) }
        };
      }
      return node;
    }));
  };

  const handleCanvasMouseUp = () => {
    setDraggedNodeId(null);
  };

  // Calculate coordinates of ports dynamically
  const getPortCoordinates = (nodeId: string, portId: string, isInput: boolean) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return { x: 0, y: 0 };

    const portIndex = isInput
      ? node.inputs.findIndex(p => p.id === portId)
      : node.outputs.findIndex(p => p.id === portId);

    if (portIndex === -1) return { x: 0, y: 0 };

    const x = isInput ? node.position.x : node.position.x + CARD_WIDTH;
    const offsetInNode = HEADER_HEIGHT + 16 + portIndex * PORT_HEIGHT + (PORT_HEIGHT / 2);
    const y = node.position.y + offsetInNode;

    return { x, y };
  };

  const isConnectionInvalid = (conn: Connection): boolean => {
    const srcNode = nodes.find(n => n.id === conn.fromNodeId);
    const srcPort = srcNode?.outputs.find(p => p.id === conn.fromPortId);
    const destNode = nodes.find(n => n.id === conn.toNodeId);
    const destPort = destNode?.inputs.find(p => p.id === conn.toPortId);
    
    if (!srcPort || !destPort) return false;
    // Allow any connection involving 'any' type, else must match exactly
    if (srcPort.type === 'any' || destPort.type === 'any') return false;
    return srcPort.type !== destPort.type;
  };

  // Port connection click actions
  const handlePortClick = (nodeId: string, portId: string, isInput: boolean) => {
    if (!isInput) {
      // Set Output as active connecting source
      setActiveSource({ nodeId, portId });
      addLog(`Selected output: Node "${nodeId}". Drag/Click an input port to link.`, 'info');
    } else {
      // Validate and lock Connection
      if (activeSource) {
        if (activeSource.nodeId === nodeId) {
          addLog("Cannot connect a node to itself.", 'warning');
          setActiveSource(null);
          return;
        }

        // Check if connection already exists
        const exists = connections.some(c => c.toNodeId === nodeId && c.toPortId === portId);
        if (exists) {
          addLog("Input port is already mapped to a wire.", 'warning');
          setActiveSource(null);
          return;
        }

        const srcNode = nodes.find(n => n.id === activeSource.nodeId);
        const srcPort = srcNode?.outputs.find(p => p.id === activeSource.portId);
        const destNode = nodes.find(n => n.id === nodeId);
        const destPort = destNode?.inputs.find(p => p.id === portId);

        const isInvalid = srcPort && destPort && srcPort.type !== destPort.type;

        const newConnection: Connection = {
          id: `link_${Date.now()}`,
          fromNodeId: activeSource.nodeId,
          fromPortId: activeSource.portId,
          toNodeId: nodeId,
          toPortId: portId
        };

        onUpdateConnections([...connections, newConnection]);
        
        if (isInvalid) {
          addLog(`⚠️ Type Mismatch! Wired floating ${srcPort.type} into boolean logical ${destPort.type} input (drawn in RED on canvas)`, 'error');
        } else {
          addLog(`Successfully wired output from ${activeSource.nodeId}.${activeSource.portId} to inputs on ${nodeId}.${portId}`, 'success');
        }
        setActiveSource(null);
      }
    }
  };

  // Instantiates a new template node on the center of the viewport grid
  const spawnNode = (template: Omit<StrategyNode, 'id' | 'position'>) => {
    const freshId = `${template.name.toLowerCase()}_${Math.floor(Math.random() * 1000)}`;
    const freshNode: StrategyNode = {
      ...template,
      id: freshId,
      position: { x: 80 + Math.random() * 100, y: 100 + Math.random() * 120 }
    };
    onUpdateNodes([...nodes, freshNode]);
    addLog(`Spawned visual node: ${template.label} [ID: ${freshId}]`, 'info');
  };

  // Custom node parameter update state
  const handleParameterChange = (nodeId: string, paramName: string, nextValue: any) => {
    onUpdateNodes(nodes.map(n => {
      if (n.id === nodeId) {
        return {
          ...n,
          parameters: n.parameters.map(p => {
            if (p.name === paramName) {
              const parse = Number(nextValue);
              return { ...p, value: isNaN(parse) ? nextValue : parse };
            }
            return p;
          })
        };
      }
      return n;
    }));
  };

  // Remove node and its linked connections
  const removeNode = (nodeId: string) => {
    onUpdateNodes(nodes.filter(n => n.id !== nodeId));
    onUpdateConnections(connections.filter(c => c.fromNodeId !== nodeId && c.toNodeId !== nodeId));
    addLog(`Removed node ${nodeId} and cleaned up its connections`, 'info');
  };

  // Remove individual connection wire
  const removeConnection = (connId: string) => {
    onUpdateConnections(connections.filter(c => c.id !== connId));
    addLog(`Dismantled wire link connection`, 'info');
  };

  // Generate SVG Bezier curve string
  const generateBezierPath = (x1: number, y1: number, x2: number, y2: number) => {
    const handleOffset = Math.max(50, Math.min(150, Math.abs(x2 - x1) * 0.5));
    return `M ${x1} ${y1} C ${x1 + handleOffset} ${y1}, ${x2 - handleOffset} ${y2}, ${x2} ${y2}`;
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 h-full min-h-0 min-w-0 select-none">
      
      {/* --- Left Node Selector Panel --- */}
      <div className="w-full xl:w-72 bg-theme-card/85 backdrop-blur-xl border border-theme-border rounded-xl p-4 flex flex-col gap-4 shadow-xl select-none">
        <div>
          <h3 className="font-sans font-bold text-theme-text text-sm">Add Node Blocks</h3>
          <p className="text-xs text-slate-400 font-sans mt-0.5">Click any block below to deploy it into your active graph builder</p>
        </div>

        {/* Templates divided by categories */}
        <div className="flex flex-col gap-3.5 overflow-y-auto max-h-[400px] xl:max-h-[500px] pr-1 scrollbar-thin scrollbar-thumb-theme-border">
          
          {/* Indicators category */}
          <div>
            <span className="text-[10px] font-mono font-bold tracking-wider text-primary block mb-1.5 uppercase">Indicators</span>
            <div className="grid grid-cols-1 gap-1.5">
              {NODE_TEMPLATES.filter(n => n.type === 'indicator').map((tmpl, i) => (
                <button
                  key={i}
                  onClick={() => spawnNode(tmpl)}
                  className="w-full text-left bg-black/40 border border-theme-border hover:border-primary/50 text-slate-300 hover:text-white rounded-lg p-2.5 flex items-center justify-between text-xs transition duration-250 cursor-pointer hover:bg-theme-bg/50 group"
                >
                  <span className="font-medium">{tmpl.label}</span>
                  <PlusCircle className="h-4 w-4 text-primary shrink-0 opacity-75 group-hover:opacity-100 transition" />
                </button>
              ))}
            </div>
          </div>

          {/* Derivatives & Options category */}
          <div>
            <span className="text-[10px] font-mono font-bold tracking-wider text-cyan-400 block mb-1.5 uppercase font-bold">Derivatives & Options</span>
            <div className="grid grid-cols-1 gap-1.5">
              {NODE_TEMPLATES.filter(n => n.type === 'derivative').map((tmpl, i) => (
                <button
                  key={i}
                  onClick={() => spawnNode(tmpl)}
                  className="w-full text-left bg-black/40 border border-theme-border hover:border-cyan-400/50 text-slate-300 hover:text-white rounded-lg p-2.5 flex items-center justify-between text-xs transition duration-250 cursor-pointer hover:bg-theme-bg/50 group"
                >
                  <span className="font-medium">{tmpl.label}</span>
                  <PlusCircle className="h-4 w-4 text-cyan-400 shrink-0 opacity-75 group-hover:opacity-100 transition" />
                </button>
              ))}
            </div>
          </div>

          {/* Signals category */}
          <div>
            <span className="text-[10px] font-mono font-bold tracking-wider text-amber-450 text-amber-450 block mb-1.5 uppercase font-extrabold" style={{ color: "var(--color-secondary, #f59e0b)" }}>Signals</span>
            <div className="grid grid-cols-1 gap-1.5">
              {NODE_TEMPLATES.filter(n => n.type === 'signal').map((tmpl, i) => (
                <button
                  key={i}
                  onClick={() => spawnNode(tmpl)}
                  className="w-full text-left bg-black/40 border border-theme-border hover:border-secondary/50 text-slate-300 hover:text-white rounded-lg p-2.5 flex items-center justify-between text-xs transition duration-250 cursor-pointer hover:bg-theme-bg/50 group"
                >
                  <span className="font-medium">{tmpl.label}</span>
                  <PlusCircle className="h-4 w-4 shrink-0 opacity-75 group-hover:opacity-100 transition text-secondary" style={{ color: "var(--color-secondary, #f59e0b)" }} />
                </button>
              ))}
            </div>
          </div>

          {/* Conditions category */}
          <div>
            <span className="text-[10px] font-mono font-bold tracking-wider text-teal-400 block mb-1.5 uppercase font-bold">Logic Gates</span>
            <div className="grid grid-cols-1 gap-1.5">
              {NODE_TEMPLATES.filter(n => n.type === 'condition').map((tmpl, i) => (
                <button
                  key={i}
                  onClick={() => spawnNode(tmpl)}
                  className="w-full text-left bg-black/40 border border-theme-border hover:border-teal-450/60 text-slate-300 hover:text-white rounded-lg p-2.5 flex items-center justify-between text-xs transition duration-250 cursor-pointer hover:bg-theme-bg/50 group"
                >
                  <span className="font-medium">{tmpl.label}</span>
                  <PlusCircle className="h-4 w-4 text-teal-400 shrink-0 opacity-75 group-hover:opacity-100 transition" />
                </button>
              ))}
            </div>
          </div>

          {/* Actions category */}
          <div>
            <span className="text-[10px] font-mono font-bold tracking-wider text-rose-400 block mb-1.5 uppercase font-bold">Execution Actions</span>
            <div className="grid grid-cols-1 gap-1.5">
              {NODE_TEMPLATES.filter(n => n.type === 'action').map((tmpl, i) => (
                <button
                  key={i}
                  onClick={() => spawnNode(tmpl)}
                  className="w-full text-left bg-black/40 border border-theme-border hover:border-rose-450/60 text-slate-300 hover:text-white rounded-lg p-2.5 flex items-center justify-between text-xs transition duration-250 cursor-pointer hover:bg-theme-bg/50 group"
                >
                  <span className="font-medium">{tmpl.label}</span>
                  <PlusCircle className="h-4 w-4 text-rose-400 shrink-0 opacity-75 group-hover:opacity-100 transition" />
                </button>
              ))}
            </div>
          </div>

          {/* Risk category */}
          <div>
            <span className="text-[10px] font-mono font-bold tracking-wider text-fuchsia-400 block mb-1.5 uppercase font-bold">Risk Guards</span>
            <div className="grid grid-cols-1 gap-1.5">
              {NODE_TEMPLATES.filter(n => n.type === 'risk').map((tmpl, i) => (
                <button
                  key={i}
                  onClick={() => spawnNode(tmpl)}
                  className="w-full text-left bg-black/40 border border-theme-border hover:border-fuchsia-450/60 text-slate-300 hover:text-white rounded-lg p-2.5 flex items-center justify-between text-xs transition duration-250 cursor-pointer hover:bg-theme-bg/50 group"
                >
                  <span className="font-medium">{tmpl.label}</span>
                  <PlusCircle className="h-4 w-4 text-fuchsia-400 shrink-0 opacity-75 group-hover:opacity-100 transition" />
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Helper prompt helper */}
        <div className="border border-theme-border bg-black/55 p-2.5 rounded-lg text-[10px] text-slate-400 leading-normal font-sans">
          💡 <strong className="text-theme-text font-bold">Port Linking Advice:</strong> Click any glowing <span className="text-primary font-bold">output port pin</span> (right edge) first, then click a target matching <span className="text-slate-300">input port pin</span> (left edge) to build dynamic logic gates. No dragging needed!
        </div>
      </div>

      {/* --- Center Interactive Node Editor Grid Workspace --- */}
      <div className="flex-1 min-w-0 bg-theme-bg bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:20px_20px] rounded-xl border border-theme-border h-[500px] xl:h-[620px] relative overflow-hidden flex flex-col shadow-[inset_0_4px_30px_rgba(0,0,0,0.5)]">
        
        {/* Connection status overlay */}
        {activeSource && (
          <div className="absolute top-4 left-4 right-4 bg-primary/10 border border-primary/30 backdrop-blur-md px-4 py-2.5 rounded-lg flex items-center justify-between z-30 shadow-[0_0_15px_rgba(var(--color-primary),0.1)] text-xs font-sans text-white">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span>WIRING PIN ACTIVE: Click an input node port on the left of any other card to bind link!</span>
            </div>
            <button
              onClick={() => setActiveSource(null)}
              className="px-2.5 py-1 bg-primary/20 hover:bg-primary/30 text-primary rounded border border-primary/20 transition text-[10px] font-bold tracking-wide cursor-pointer"
            >
              Cancel Link
            </button>
          </div>
        )}

        {/* Clear/Reset toolbar inside canvas corner */}
        <div className="absolute top-4 right-4 z-20 flex gap-2">
          {connections.length > 0 && (
            <button
              onClick={() => {
                onUpdateConnections([]);
                addLog('Cleared all wiring connect lines.', 'info');
              }}
              className="bg-theme-card/95 border border-theme-border text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg text-xs font-sans hover:bg-theme-bg transition flex items-center gap-1 shadow-md select-none cursor-pointer"
            >
              <Link className="h-3.5 w-3.5" />
              Clear Links
            </button>
          )}
          {nodes.length > 0 && (
            <button
              onClick={() => {
                onUpdateNodes([]);
                onUpdateConnections([]);
                addLog('Clean slate. Cleared workspace.', 'info');
              }}
              className="bg-theme-card/95 border border-theme-border text-rose-450 hover:text-rose-300 px-2.5 py-1.5 rounded-lg text-xs font-sans hover:bg-theme-bg transition flex items-center gap-1 shadow-md select-none cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Reset Grid
            </button>
          )}
        </div>

        {/* Main interactive grid arena */}
        <div
          ref={canvasRef}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
          className="absolute inset-0 z-10 select-none cursor-default"
        >
          {/* Dynamic Wire Layers Drawing */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            <defs>
              <linearGradient id="primary-glow" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="var(--color-primary, #00f0ff)" />
                <stop offset="100%" stopColor="var(--color-secondary, #8b5cf6)" />
              </linearGradient>
            </defs>

            {/* Render actual connections wires */}
            {connections.map((conn) => {
              const start = getPortCoordinates(conn.fromNodeId, conn.fromPortId, false);
              const end = getPortCoordinates(conn.toNodeId, conn.toPortId, true);
              const isInvalid = isConnectionInvalid(conn);

              return (
                <g key={conn.id} className="group pointer-events-auto">
                  {/* Invisible thicker path for generous hover and click-to-delete targeting */}
                  <path
                    d={generateBezierPath(start.x, start.y, end.x, end.y)}
                    fill="none"
                    stroke="transparent"
                    strokeWidth="12"
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeConnection(conn.id);
                    }}
                  />
                  {/* Display node connection logic */}
                  <path
                    d={generateBezierPath(start.x, start.y, end.x, end.y)}
                    fill="none"
                    stroke={isInvalid ? "#ef4444" : "url(#primary-glow)"}
                    strokeWidth={isInvalid ? "2.5" : "2"}
                    className={isInvalid ? "stroke-rose-500 animate-pulse cursor-pointer" : "stroke-current transition cursor-pointer"}
                    style={{ color: isInvalid ? "#ef4444" : "var(--color-primary, #00f0ff)" }}
                  />
                  {/* Pulse signal indicator flowing along bezier wires */}
                  <circle r={isInvalid ? "5.5" : "4.5"} fill={isInvalid ? "#ef4444" : "var(--color-primary, #00f0ff)"}>
                    <animateMotion
                      dur={isInvalid ? "1.8s" : "3.5s"}
                      repeatCount="indefinite"
                      path={generateBezierPath(start.x, start.y, end.x, end.y)}
                    />
                  </circle>
                </g>
              );
            })}

            {/* Custom connecting temporary wire line guide */}
            {activeSource && (
              <path
                d={generateBezierPath(
                  getPortCoordinates(activeSource.nodeId, activeSource.portId, false).x,
                  getPortCoordinates(activeSource.nodeId, activeSource.portId, false).y,
                  mousePos.x,
                  mousePos.y
                )}
                fill="none"
                stroke="var(--color-primary, #00f0ff)"
                strokeWidth="2"
                strokeDasharray="4 4"
                className="opacity-80 animate-pulse"
              />
            )}
          </svg>

          {/* Render individual Active Strategy cards */}
          {nodes.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-450 gap-2.5 px-4 font-sans max-w-sm mx-auto text-center pointer-events-none">
              <Link className="h-10 w-10 text-slate-500/30" />
              <p className="text-sm font-bold text-theme-text/80">Strategy Workspace Empty</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Add visual indicator and action modules from the left toolbar, load a template preset, or ask Gemini AI to design a custom graph for you.
              </p>
            </div>
          ) : (
            nodes.map((node) => {
              const nodeTypeColor = 
                node.type === 'indicator' ? 'border-t-primary' :
                node.type === 'derivative' ? 'border-t-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.15)]' :
                node.type === 'signal' ? 'border-t-amber-500' :
                node.type === 'condition' ? 'border-t-teal-500' :
                node.type === 'action' ? 'border-t-rose-500' :
                'border-t-secondary';

              const activeConnectionSource = activeSource?.nodeId === node.id;

              return (
                <div
                  key={node.id}
                  id={node.id}
                  style={{
                    left: node.position.x,
                    top: node.position.y,
                    width: CARD_WIDTH,
                  }}
                  className={`absolute bg-theme-card/95 border border-theme-border rounded-xl shadow-2xl z-20 backdrop-blur-md transition-all ${nodeTypeColor} border-t-[3.5px] select-none ${
                    activeConnectionSource ? 'ring-1 ring-[var(--color-primary,rgba(0,240,255,1))] shadow-[0_0_15px_rgba(var(--color-primary),0.25)]' : ''
                  }`}
                  onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                >
                  {/* Card Header & Handle */}
                  <div className="px-3 py-2 border-b border-theme-border flex items-center justify-between cursor-move bg-theme-bg/60 rounded-t-xl">
                    <span className="font-sans font-bold text-theme-text text-[11px] truncate tracking-wide max-w-[130px]" title={node.label}>
                      {node.label}
                    </span>
                    <button
                      onClick={() => removeNode(node.id)}
                      className="p-1 text-slate-450 hover:text-rose-400 hover:bg-theme-bg/80 rounded transition cursor-pointer"
                      title="Delete Node block"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Card Body & Input Parameters Form */}
                  <div className="px-3.5 py-3 flex flex-col gap-2 bg-transparent">
                    
                    {/* Render parameters */}
                    {node.parameters.map((p, pIdx) => (
                      <div key={pIdx} className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[9px] text-slate-400 font-bold uppercase">{p.name}:</span>
                        {p.type === 'number' ? (
                          <input
                            type="number"
                            value={p.value}
                            onChange={(e) => handleParameterChange(node.id, p.name, e.target.value)}
                            className="bg-black/50 border border-theme-border focus:border-primary/50 rounded px-1.5 py-0.5 text-right font-mono text-[10px] text-theme-text outline-none w-14 focus:ring-1 focus:ring-primary/20"
                          />
                        ) : p.type === 'select' ? (
                          <select
                            value={p.value}
                            onChange={(e) => handleParameterChange(node.id, p.name, e.target.value)}
                            className="bg-black/50 border border-theme-border text-[10px] font-sans text-theme-text rounded outline-none px-1 py-0.5 focus:border-primary/50 cursor-pointer focus:ring-1 focus:ring-primary/20"
                          >
                            {p.options?.map((opt, oIdx) => (
                              <option key={oIdx} value={opt} className="bg-theme-card text-theme-text">{opt}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={p.value}
                            onChange={(e) => handleParameterChange(node.id, p.name, e.target.value)}
                            className="bg-black/50 border border-theme-border focus:border-primary/50 rounded px-1.5 py-0.5 text-right font-mono text-[10px] text-theme-text outline-none w-16 focus:ring-1 focus:ring-primary/20"
                          />
                        )}
                      </div>
                    ))}

                    {/* Ports visual links wrapper */}
                    <div className="mt-1 border-t border-theme-border/50 pt-2 flex justify-between gap-1 select-none">
                      
                      {/* INPUT Ports (Left aligned) */}
                      <div className="flex flex-col gap-1.5">
                        {node.inputs.map((port) => {
                          const hasIncoming = connections.some(c => c.toNodeId === node.id && c.toPortId === port.id);
                          return (
                            <div
                              key={port.id}
                              onClick={() => handlePortClick(node.id, port.id, true)}
                              className={`flex items-center gap-1.5 py-0.5 text-[9.5px] font-sans cursor-pointer group leading-none ${
                                hasIncoming ? 'text-primary font-bold' : 'text-slate-400 hover:text-primary'
                              }`}
                            >
                              <div className={`h-3 w-3 rounded-full border flex items-center justify-center transition shrink-0 ${
                                hasIncoming 
                                  ? 'bg-primary/20 border-primary shadow-[0_0_8px_rgba(var(--color-primary),0.3)]' 
                                  : 'bg-black/40 border-theme-border group-hover:border-primary/50'
                              }`}>
                                <div className={`h-1.5 w-1.5 rounded-full ${hasIncoming ? 'bg-primary' : 'bg-transparent'}`}></div>
                              </div>
                              <span className="truncate max-w-[55px]">{port.name}</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* OUTPUT Ports (Right aligned) */}
                      <div className="flex flex-col gap-1.5 items-end">
                        {node.outputs.map((port) => {
                          const isActiveSrc = activeSource?.nodeId === node.id && activeSource?.portId === port.id;
                          return (
                            <div
                              key={port.id}
                              onClick={() => handlePortClick(node.id, port.id, false)}
                              className={`flex items-center gap-1.5 py-0.5 text-[9.5px] font-sans cursor-pointer group leading-none ${
                                isActiveSrc ? 'text-primary font-bold' : 'text-slate-400 hover:text-primary'
                              }`}
                            >
                              <span className="truncate max-w-[55px]">{port.name}</span>
                              <div className={`h-3 w-3 rounded-full border flex items-center justify-center transition shrink-0 ${
                                isActiveSrc 
                                  ? 'bg-primary/20 border-primary shadow-[0_0_8px_rgba(var(--color-primary),0.3)]' 
                                  : 'bg-black/40 border-theme-border group-hover:border-primary/50'
                              }`}>
                                <div className={`h-1.5 w-1.5 rounded-full ${isActiveSrc ? 'bg-primary' : 'bg-transparent group-hover:bg-slate-400'}`}></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                    </div>

                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
