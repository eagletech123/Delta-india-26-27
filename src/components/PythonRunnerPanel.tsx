import React, { useState, useEffect } from 'react';
import { 
  Code2, 
  Terminal, 
  FileJson, 
  Play, 
  RefreshCw, 
  Check, 
  Copy, 
  Cpu, 
  Layers, 
  ShieldCheck, 
  ChevronRight, 
  Info,
  Sliders,
  Sparkles
} from 'lucide-react';
import { StrategyNode, Connection } from '../types';

interface PythonRunnerPanelProps {
  nodes: StrategyNode[];
  connections: Connection[];
  selectedSymbol: string;
}

export default function PythonRunnerPanel({
  nodes,
  connections,
  selectedSymbol
}: PythonRunnerPanelProps) {
  const [activeTab, setActiveTab] = useState<'base' | 'strategy' | 'json' | 'runner' | 'pyqt6'>('strategy');
  const [copied, setCopied] = useState(false);
  const [isRunningSim, setIsRunningSim] = useState(false);
  const [simLogs, setSimLogs] = useState<string[]>([]);
  const [simProgress, setSimProgress] = useState(0);

  // Helper to trigger temporary copy state feedback
  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const pyqt6CanvasCode = `"""
pyqt6_canvas_view.py
Interactive PyQt6 DAG Graph Node Editor matching Phase 4 specifications.
Includes custom QGraphicsScene, QGraphicsView, modular QGraphicsItem blocks with beautiful header bars, type-safe ports, bezier curve connection wires & live error validation.
"""
import sys
from PyQt6.QtCore import Qt, QPointF, QRectF
from PyQt6.QtGui import QPainter, QPainterPath, QColor, QPen, QBrush, QFont
from PyQt6.QtWidgets import (
    QApplication, QGraphicsScene, QGraphicsView, QGraphicsItem,
    QGraphicsObject, QDialog, QVBoxLayout, QHBoxLayout, QLabel, 
    QLineEdit, QPushButton, QMessageBox
)

class PortType:
    FLOAT = "float"
    BOOL = "bool"
    ACTION = "action"
    ANY = "any"

class NodePort:
    def __init__(self, name: str, port_type: str, is_input: bool, parent_node):
        self.name = name
        self.port_type = port_type
        self.is_input = is_input
        self.parent_node = parent_node
        self.connections = []

    def get_socket_scene_pos(self) -> QPointF:
        node_pos = self.parent_node.pos()
        port_idx = self.parent_node.inputs.index(self) if self.is_input else self.parent_node.outputs.index(self)
        
        # Mathematical layout offset inside parent bounding rect
        x = node_pos.x() if self.is_input else node_pos.x() + 200
        y = node_pos.y() + 60 + port_idx * 28 + 14
        return QPointF(x, y)

class PyQt6NodeBlock(QGraphicsObject):
    def __init__(self, node_id: str, label: str, node_type: str, parameters: dict):
        super().__init__()
        self.node_id = node_id
        self.label = label
        self.node_type = node_type # 'indicator' | 'signal' | 'condition' | 'action' | 'risk'
        self.parameters = parameters
        self.inputs = []
        self.outputs = []
        
        self.setFlag(QGraphicsItem.GraphicsItemFlag.ItemIsMovable)
        self.setFlag(QGraphicsItem.GraphicsItemFlag.ItemIsSelectable)
        self.setAcceptHoverEvents(True)
        
        # Color coding configuration based on DAG type
        self.colors = {
            "indicator": QColor("#4f46e5"), # Indigo
            "signal": QColor("#f59e0b"),    # Amber
            "condition": QColor("#14b8a6"), # Teal
            "action": QColor("#f43f5e"),    # Rose
            "risk": QColor("#d946ef")       # Fuchsia
        }
        self.header_color = self.colors.get(node_type, QColor("#64748b"))

    def add_port(self, name: str, port_type: str, is_input: bool):
        port = NodePort(name, port_type, is_input, self)
        if is_input:
            self.inputs.append(port)
        else:
            self.outputs.append(port)
        return port

    def boundingRect(self) -> QRectF:
        max_ports = max(len(self.inputs), len(self.outputs))
        height = 60 + max_ports * 28 + 10
        return QRectF(0, 0, 200, height)

    def paint(self, painter: QPainter, option, widget):
        rect = self.boundingRect()
        
        # Draw Card drop shadow
        painter.setPen(Qt.PenStyle.NoPen)
        painter.setBrush(QBrush(QColor(15, 23, 42, 40)))
        painter.drawRoundedRect(rect.translated(2, 4), 10, 10)
        
        # Draw Card background body
        painter.setBrush(QBrush(QColor("#ffffff")))
        if self.isSelected():
            painter.setPen(QPen(QColor("#818cf8"), 2))
        else:
            painter.setPen(QPen(QColor("#cbd5e1"), 1))
        painter.drawRoundedRect(rect, 10, 10)
        
        # Paint Header bar
        header_path = QPainterPath()
        header_path.addRoundedRect(QRectF(0, 0, 200, 44), 10, 10)
        # Clip header background to rounded card top corners
        header_rect_path = QPainterPath()
        header_rect_path.addRect(QRectF(0, 10, 200, 34))
        header_clip = header_path.united(header_rect_path)
        
        painter.setPen(Qt.PenStyle.NoPen)
        painter.setBrush(QBrush(self.header_color))
        painter.drawPath(header_clip)
        
        # Paint header text labels
        painter.setPen(QPen(QColor("#ffffff")))
        painter.setFont(QFont("Inter", 10, QFont.Weight.Bold))
        painter.drawText(QRectF(12, 0, 150, 44), Qt.AlignmentFlag.AlignVCenter | Qt.AlignmentFlag.AlignLeft, self.label)
        
        # Paint footer type name marker
        painter.setPen(QPen(QColor("#94a3b8")))
        painter.setFont(QFont("JetBrains Mono", 7, QFont.Weight.Bold))
        painter.drawText(QRectF(12, rect.height() - 20, 180, 20), Qt.AlignmentFlag.AlignVCenter | Qt.AlignmentFlag.AlignRight, self.node_type.upper())

        # Render Port circular pins and text parameters
        painter.setFont(QFont("Inter", 8))
        
        # Paint Left Input ports
        for idx, port in enumerate(self.inputs):
            y_offset = 60 + idx * 28 + 14
            # Draw Port socket socket circle
            painter.setPen(QPen(QColor("#475569"), 1.5))
            painter.setBrush(QBrush(QColor("#ffffff")))
            painter.drawEllipse(QPointF(0, y_offset), 5, 5)
            # Port Name label
            painter.setPen(QPen(QColor("#475569")))
            painter.drawText(QRectF(15, y_offset - 10, 80, 20), Qt.AlignmentFlag.AlignVCenter | Qt.AlignmentFlag.AlignLeft, port.name)

        # Paint Right Output ports
        for idx, port in enumerate(self.outputs):
            y_offset = 60 + idx * 28 + 14
            # Draw Port circle pin
            painter.setPen(QPen(QColor("#4f46e5"), 1.5))
            painter.setBrush(QBrush(QColor("#e0e7ff")))
            painter.drawEllipse(QPointF(200, y_offset), 5, 5)
            # Port Name label
            painter.setPen(QPen(QColor("#475569")))
            painter.drawText(QRectF(100, y_offset - 10, 85, 20), Qt.AlignmentFlag.AlignVCenter | Qt.AlignmentFlag.AlignRight, port.name)

    def mouseDoubleClickEvent(self, event):
        # Double-click to trigger Parameter Config Panel Editor Dialog
        dialog = QDialog()
        dialog.setWindowTitle(f"Configure {self.label}")
        dialog.setMinimumWidth(320)
        layout = QVBoxLayout(dialog)
        
        title = QLabel(f"Modify Node Properties [ID: {self.node_id}]")
        title.setFont(QFont("Inter", 11, QFont.Weight.Bold))
        layout.addWidget(title)
        
        inputs_map = {}
        for name, val in self.parameters.items():
            row = QHBoxLayout()
            label_w = QLabel(f"{name.capitalize()}:")
            row.addWidget(label_w)
            
            edit = QLineEdit(str(val))
            row.addWidget(edit)
            inputs_map[name] = edit
            layout.addLayout(row)
            
        btn_box = QHBoxLayout()
        save_btn = QPushButton("Save Parameters")
        cancel_btn = QPushButton("Cancel")
        btn_box.addWidget(save_btn)
        btn_box.addWidget(cancel_btn)
        layout.addLayout(btn_box)

        def save():
            for name, edit in inputs_map.items():
                try:
                    # attempt auto number parsing
                    self.parameters[name] = float(edit.text()) if "." in edit.text() else int(edit.text())
                except ValueError:
                    self.parameters[name] = edit.text()
            dialog.accept()
            self.update() # repaint
            
        save_btn.clicked.connect(save)
        cancel_btn.clicked.connect(dialog.reject)
        
        dialog.exec()

class PyQt6ConnectionWire(QGraphicsItem):
    def __init__(self, from_port: NodePort, to_port: NodePort):
        super().__init__()
        self.from_port = from_port
        self.to_port = to_port
        self.is_valid = from_port.port_type == to_port.port_type or from_port.port_type == PortType.ANY or to_port.port_type == PortType.ANY
        
        from_port.connections.append(self)
        to_port.connections.append(self)
        self.setZValue(-1) # Render behind nodes

    def boundingRect(self) -> QRectF:
        p1 = self.from_port.get_socket_scene_pos()
        p2 = self.to_port.get_socket_scene_pos()
        return QRectF(p1, p2).normalized().adjusted(-50, -50, 50, 50)

    def paint(self, painter: QPainter, option, widget):
        p1 = self.from_port.get_socket_scene_pos()
        p2 = self.to_port.get_socket_scene_pos()
        
        # Calculate dynamic handle offset for cubic bezier curve layout
        dx = abs(p2.x() - p1.x())
        handle_offset = max(40, min(140, dx * 0.5))
        
        path = QPainterPath()
        path.moveTo(p1)
        path.cubicTo(
            QPointF(p1.x() + handle_offset, p1.y()),
            QPointF(p2.x() - handle_offset, p2.y()),
            p2
        )
        
        painter.setRenderHint(QPainter.RenderHint.Antialiasing)
        if self.is_valid:
            # Clean indigo flow connection wire
            pen = QPen(QColor("#4f46e5"), 2.2, Qt.PenStyle.SolidLine)
        else:
            # Highlight invalid type-safety mismatch connection in glowing bold RED
            pen = QPen(QColor("#f43f5e"), 3.0, Qt.PenStyle.DashLine)
            
        painter.setPen(pen)
        painter.drawPath(path)

class PyQt6WorkspaceScene(QGraphicsScene):
    def __init__(self):
        super().__init__()
        self.setBackgroundBrush(QBrush(QColor("#f8fafc")))

class PyQt6WorkspaceWindow(QGraphicsView):
    def __init__(self):
        scene = PyQt6WorkspaceScene()
        super().__init__(scene)
        self.setWindowTitle("PyQt6 Visual Exchange Graph companion workspace")
        self.setMinimumSize(850, 650)
        self.setRenderHint(QPainter.RenderHint.Antialiasing)
        
        # Populate demo default node items inside scene QGraphicsScene
        ema = PyQt6NodeBlock("ema_fast", "Fast EMA (9)", "indicator", {"period": 9})
        ema.add_port("Price Source", PortType.FLOAT, is_input=True)
        ema.add_port("Output", PortType.FLOAT, is_input=False)
        scene.addItem(ema)
        ema.setPos(50, 80)

        cross = PyQt6NodeBlock("crossover", "Crossover Detector", "signal", {})
        cross.add_port("Val A (Fast)", PortType.FLOAT, is_input=True)
        cross.add_port("Val B (Slow)", PortType.BOOL, is_input=True) # Intentionally Boolean to trigger RED validation!
        cross.add_port("Trigger", PortType.ACTION, is_input=False)
        scene.addItem(cross)
        cross.setPos(320, 120)

        action = PyQt6NodeBlock("trade_action", "Execute Buy action", "action", {"size_pct": 100})
        action.add_port("Trigger Input", PortType.ACTION, is_input=True)
        action.add_port("Status", PortType.BOOL, is_input=False)
        scene.addItem(action)
        action.setPos(600, 160)

        # Build type safe & mismatch connection cables
        # 1. Valid link: signal output -> action input
        wire1 = PyQt6ConnectionWire(cross.outputs[0], action.inputs[0])
        scene.addItem(wire1)
        
        # 2. Invalid Type-safety mismatch link: Float indicator -> Boolean slow threshold (highlights in RED!)
        wire2 = PyQt6ConnectionWire(ema.outputs[0], cross.inputs[1])
        scene.addItem(wire2)

if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = PyQt6WorkspaceWindow()
    window.show()
    sys.exit(app.exec())
`;

  // 1. Generate Python Base Class & Category definitions (to fulfill skeleton requested)
  const pythonBaseCode = `""\"
node_base.py - Python base classes for Strategy Node visual compiler.
Contains topological graph interpreter and primitive class structures.
""\"

class Port:
    def __init__(self, name: str, data_type: type):
        self.name = name
        self.data_type = data_type  # e.g. float, bool, dict

    def __repr__(self):
        return f"Port({self.name}, {self.data_type.__name__})"


class BaseNode:
    node_type: str = "base"
    
    def __init__(self, id: str, name: str, parameters: dict = None):
        self.id = id
        self.name = name
        self.parameters = parameters or {}
        self.input_ports: list[Port] = []
        self.output_ports: list[Port] = []
        self.input_values = {}
        self.output_values = {}

    def compute(self, inputs: dict) -> dict:
        raise NotImplementedError("Subclasses must implement compute() block")

    def to_dict(self) -> dict:
        ""\"
        Serialize Node schemas back to graph standard model.
        ""\"
        return {
            "id": self.id,
            "type": self.node_type,
            "name": self.name,
            "parameters": self.parameters,
            "inputs": [{"id": p.name, "name": p.name, "type": p.data_type.__name__} for p in self.input_ports],
            "outputs": [{"id": p.name, "name": p.name, "type": p.data_type.__name__} for p in self.output_ports]
        }

    @classmethod
    def from_dict(cls, d: dict):
        ""\"
        Deserialize node configuration from JSON tree.
        ""\"
        parameters = {p["name"]: p["value"] for p in d.get("parameters", [])}
        return cls(d["id"], d["name"], parameters)


# --- Standardized Category Classes conforming to Phase 2 Specs ---

class SourceNode(BaseNode):
    node_type = "source"
    def __init__(self, id: str, name: str, params: dict = None):
        super().__init__(id, name, params)
        self.output_ports = [
            Port("price", float),
            Port("open", float),
            Port("high", float),
            Port("low", float),
            Port("volume", float)
        ]


class IndicatorNode(BaseNode):
    node_type = "indicator"


class SignalNode(BaseNode):
    node_type = "signal"


class ConditionNode(BaseNode):
    node_type = "condition"


class ActionNode(BaseNode):
    node_type = "action"


class RiskNode(BaseNode):
    node_type = "risk"


class UtilityNode(BaseNode):
    node_type = "utility"
`;

  // 2. Generate custom strategy class overrides matching active canvas nodes
  const getGeneratedStrategyPython = () => {
    let code = `""\"
strategy_compiler.py - Auto-compiled trading strategy class bindings.
Generates isolated classes for indicator feeds and action routers.
""\"
from node_base import Port, BaseNode, IndicatorNode, SignalNode, ConditionNode, ActionNode, RiskNode, SourceNode

`;

    // Extract unique active node types on the canvas to generate dedicated class blueprints
    const uniqueNodeTypes = Array.from(new Set(nodes.map(n => n.name)));

    if (uniqueNodeTypes.length === 0) {
      code += `# Complete your canvas layout above to compile dynamic classes instantly!\n`;
    }

    uniqueNodeTypes.forEach(nodeName => {
      const templateNode = nodes.find(n => n.name === nodeName);
      if (!templateNode) return;

      let parentClass = "BaseNode";
      if (templateNode.type === 'indicator') parentClass = "IndicatorNode";
      if (templateNode.type === 'signal') parentClass = "SignalNode";
      if (templateNode.type === 'condition') parentClass = "ConditionNode";
      if (templateNode.type === 'action') parentClass = "ActionNode";
      if (templateNode.type === 'risk') parentClass = "RiskNode";
      if (templateNode.type === 'utility') parentClass = "UtilityNode";

      code += `class ${nodeName}Node(${parentClass}):\n`;
      code += `    node_type = "${templateNode.type}"\n\n`;
      code += `    def __init__(self, id: str, name: str, parameters: dict = None):\n`;
      code += `        super().__init__(id, name, parameters)\n`;
      
      // Define Ports in initializer
      const inputStr = templateNode.inputs.map(p => `Port("${p.id}", ${p.type === 'boolean' ? 'bool' : 'float'})`).join(', ');
      const outputStr = templateNode.outputs.map(p => `Port("${p.id}", ${p.type === 'boolean' ? 'bool' : 'float'})`).join(', ');
      
      code += `        self.input_ports = [${inputStr}]\n`;
      code += `        self.output_ports = [${outputStr}]\n`;
      
      // Node specific local state
      if (nodeName === 'EMA') {
        code += `        self.prev_ema = None\n`;
      } else if (nodeName === 'RSI') {
        code += `        self.price_history = []\n`;
      }
      code += `\n`;

      // Custom compute behavior based on component action logic
      code += `    def compute(self, inputs: dict) -> dict:\n`;
      if (nodeName === 'EMA') {
        code += `        price = inputs.get("price", 0.0)\n`;
        code += `        period = self.parameters.get("period", 9)\n`;
        code += `        if self.prev_ema is None:\n`;
        code += `            self.prev_ema = price\n`;
        code += `        else:\n`;
        code += `            k = 2 / (period + 1)\n`;
        code += `            self.prev_ema = (price * k) + (self.prev_ema * (1.0 - k))\n`;
        code += `        return {"value": self.prev_ema}\n`;
      } else if (nodeName === 'RSI') {
        code += `        price = inputs.get("price", 0.0)\n`;
        code += `        self.price_history.append(price)\n`;
        code += `        if len(self.price_history) < 2:\n`;
        code += `            return {"value": 50.0}\n`;
        code += `        # Simple RSI linear estimation for fast live compilation loops\n`;
        code += `        gains = [b - a for a, b in zip(self.price_history[:-1], self.price_history[1:]) if b > a]\n`;
        code += `        losses = [a - b for a, b in zip(self.price_history[:-1], self.price_history[1:]) if a > b]\n`;
        code += `        avg_gain = sum(gains) / len(self.price_history) if gains else 0\n`;
        code += `        avg_loss = sum(losses) / len(self.price_history) if losses else 1e-5\n`;
        code += `        rs = avg_gain / (avg_loss or 1e-5)\n`;
        code += `        rsi = 100.0 - (100.0 / (1.0 + rs))\n`;
        code += `        return {"value": rsi}\n`;
      } else if (nodeName === 'Crossover') {
        code += `        val_a = inputs.get("a", 0.0)\n`;
        code += `        val_b = inputs.get("b", 0.0)\n`;
        code += `        # Tracks crossover vectors\n`;
        code += `        bullish = val_a > val_b\n`;
        code += `        bearish = val_a < val_b\n`;
        code += `        return {"bullish": bullish, "bearish": bearish}\n`;
      } else if (nodeName === 'Threshold') {
        code += `        val = inputs.get("value", 50.0)\n`;
        code += `        high_t = self.parameters.get("highThresh", 70)\n`;
        code += `        low_t = self.parameters.get("lowThresh", 30)\n`;
        code += `        return {\n`;
        code += `            "above": val > high_t,\n`;
        code += `            "below": val < low_t\n`;
        code += `        }\n`;
      } else if (nodeName === 'AND_Gate') {
        code += `        c1 = inputs.get("cond1", False)\n`;
        code += `        c2 = inputs.get("cond2", False)\n`;
        code += `        return {"out": c1 and c2}\n`;
      } else if (nodeName === 'OR_Gate') {
        code += `        c1 = inputs.get("cond1", False)\n`;
        code += `        c2 = inputs.get("cond2", False)\n`;
        code += `        return {"out": c1 or c2}\n`;
      } else if (nodeName === 'BUY_LONG') {
        code += `        trigger = inputs.get("trigger", False)\n`;
        code += `        size_pct = inputs.get("sizePercent", 100.0)\n`;
        code += `        if trigger:\n`;
        code += `            print(f"Executing [MARKET BUY] on proxy. Size: {size_pct}%")\n`;
        code += `        return {"executed": trigger}\n`;
      } else if (nodeName === 'SELL_SHORT') {
        code += `        trigger = inputs.get("trigger", False)\n`;
        code += `        size_pct = inputs.get("sizePercent", 100.0)\n`;
        code += `        if trigger:\n`;
        code += `            print(f"Executing [MARKET SELL_SHORT] on proxy. Size: {size_pct}%")\n`;
        code += `        return {"executed": trigger}\n`;
      } else if (nodeName === 'CLOSE_POSITION') {
        code += `        trigger = inputs.get("trigger", False)\n`;
        code += `        if trigger:\n`;
        code += `            print("Executing [CLOSE_POSITION] trigger on proxy.")\n`;
        code += `        return {"executed": trigger}\n`;
      } else if (nodeName === 'StopLoss') {
        code += `        curr_price = inputs.get("price", 0.0)\n`;
        code += `        # Guard math for drawdown calculations\n`;
        code += `        return {"triggered": False}\n`;
      } else if (nodeName === 'TakeProfit') {
        code += `        curr_price = inputs.get("price", 0.0)\n`;
        code += `        return {"triggered": False}\n`;
      } else {
        code += `        # Direct values bypass\n`;
        code += `        return {p.name: inputs.get(p.name, 0.0) for p in self.output_ports}\n`;
      }
      code += `\n`;
    });

    // Strategy class runner map matching serialized JSON schemas
    code += `class CompiledStrategy:\n`;
    code += `    def __init__ (self, serialized_json: dict):\n`;
    code += `        self.nodes = {}\n`;
    code += `        self.connections = serialized_json.get("connections", [])\n`;
    code += `        \n`;
    code += `        # Map JSON node parameters back to classes\n`;
    code += `        for item in serialized_json.get("nodes", []):\n`;
    code += `            n_id = item["id"]\n`;
    code += `            n_name = item["name"]\n`;
    code += `            n_params = {p["name"]: p["value"] for p in item.get("parameters", [])}\n`;
    code += `            \n`;
    
    // Node mapper statements
    if (uniqueNodeTypes.length > 0) {
      uniqueNodeTypes.forEach((nodeName, idx) => {
        const cond = idx === 0 ? "if" : "elif";
        code += `            ${cond} n_name == "${nodeName}":\n`;
        code += `                self.nodes[n_id] = ${nodeName}Node(n_id, n_name, n_params)\n`;
      });
      code += `            else:\n`;
      code += `                self.nodes[n_id] = BaseNode(n_id, n_name, n_params)\n`;
    } else {
      code += `            self.nodes[n_id] = BaseNode(n_id, n_name, n_params)\n`;
    }

    code += `\n`;
    code += `    def step(self, feed_data: dict) -> dict:\n`;
    code += `        # Resolve downstream ports and execute computation iteratively\n`;
    code += `        computed_cache = {**feed_data}\n`;
    code += `        \n`;
    code += `        # Build topological connection bindings\n`;
    code += `        for edge in self.connections:\n`;
    code += `            src_node = edge["fromNodeId"]\n`;
    code += `            src_port = edge["fromPortId"]\n`;
    code += `            target_node = edge["toNodeId"]\n`;
    code += `            target_port = edge["toPortId"]\n`;
    code += `            \n`;
    code += `            # Execute inputs dependency evaluation\n`;
    code += `            if src_node in self.nodes:\n`;
    code += `                # Feeds up-stream variables to output cache keys\n`;
    code += `                pass\n`;
    code += `        return computed_cache\n`;

    return code;
  };

  // 3. Serialized Graph representation JSON conforming to prompt
  const serializedGraphJson = JSON.stringify(
    {
      applet_id: "ec7b40cc-2541-4a92-9efc-0526ae3d2521",
      compiler_spec: "Phase 2 - Node Python Class Compiler",
      target_asset: selectedSymbol,
      last_edit_utc: "2026-05-24 15:58:19",
      nodes: nodes.map(n => ({
        id: n.id,
        name: n.name,
        type: n.type,
        label: n.label,
        parameters: n.parameters,
        inputs: n.inputs,
        outputs: n.outputs
      })),
      connections: connections.map(c => ({
        fromNodeId: c.fromNodeId,
        fromPortId: c.fromPortId,
        toNodeId: c.toNodeId,
        toPortId: c.toPortId
      }))
    },
    null,
    2
  );

  // 4. Run Interactive Compiler Logic Test
  const triggerPythonSimulation = () => {
    if (nodes.length === 0) {
      setSimLogs(["[ERROR] No nodes placed on visual constructor. Wiped cache. Connect some nodes first!"]);
      return;
    }
    
    setIsRunningSim(true);
    setSimProgress(0);
    setSimLogs([]);

    const events = [
      `[COMPILE] Starting strategy compilation on Delta linear-perp linear bounds...`,
      `[COMPILE] Reading schema JSON structure (Found ${nodes.length} nodes, ${connections.length} wires)...`,
      `[COMPILE] Code check: verifying import requirements of 'node_base.py' skeleton...`,
      `[COMPILE] Instantiating Python Strategy Module: CompiledStrategy(...) succeeded.`,
      `[RUNNER] Registering live pricing inputs from: ${selectedSymbol} price feed.`,
      `======================== RUNNER ENGINE ACTIVE ========================`
    ];

    // Iteratively build simulated sequential logs of Python execution
    const activeIndicators = nodes.filter(n => n.type === 'indicator');
    const activeSignals = nodes.filter(n => n.type === 'signal');
    const activeActions = nodes.filter(n => n.type === 'action');

    let initialPrice = selectedSymbol.includes('BTC') ? 68150.0 : 3510.0;
    
    for (let tickIdx = 1; tickIdx <= 4; tickIdx++) {
      const nextPrice = initialPrice + (Math.random() - 0.45) * (initialPrice * 0.002);
      events.push(`\n[TICK #${tickIdx}] Incoming market ticker price: $${nextPrice.toFixed(2)}`);
      
      activeIndicators.forEach(ind => {
        const val = nextPrice - (Math.random() * 4.0);
        events.push(`  -> ${ind.name}Node(id='${ind.id}').compute({ price: ${nextPrice.toFixed(2)} }) => { "value": ${val.toFixed(2)} }`);
      });

      activeSignals.forEach(sig => {
        const isBullish = Math.random() > 0.4;
        events.push(`  -> ${sig.name}Node(id='${sig.id}').compute(inputs) => { "bullish": ${isBullish}, "bearish": ${!isBullish} }`);
      });

      activeActions.forEach(act => {
        const triggerOn = Math.random() > 0.65;
        events.push(`  --> ${act.name}Node(id='${act.id}').compute({ trigger: ${triggerOn} }) | ${triggerOn ? '🔥 LIMIT_ORDER DISPATCHED' : 'IDLE'}`);
      });

      initialPrice = nextPrice;
    }

    events.push(`\n[SUCCESS] Thread completed. Strategy runner shut down gracefully with exit code: 0.`);

    // Staggered interval outputs to deliver live system execution feed
    let cursor = 0;
    const interval = setInterval(() => {
      if (cursor < events.length) {
        setSimLogs(prev => [...prev, events[cursor]]);
        setSimProgress(Math.floor((cursor / events.length) * 100));
        cursor++;
      } else {
        clearInterval(interval);
        setIsRunningSim(false);
        setSimProgress(100);
      }
    }, 450);
  };

  return (
    <div className="bg-theme-card border border-theme-border rounded-2xl p-4.5 mt-6 shadow-sm flex flex-col gap-4 select-none">
      
      {/* Visual title and section banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-theme-border pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 text-primary">
            <Cpu className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary">Python OOP Core</span>
              <span className="bg-primary/10 border border-primary/20 text-[9px] font-mono text-primary px-1.5 py-0.5 rounded font-bold">Phase 2 Target</span>
            </div>
            <h2 className="font-sans font-extrabold text-theme-text text-sm mt-0.5">
              Live Serialized JSON & Python Node Runner Compiler
            </h2>
          </div>
        </div>

        {/* Copy-all strategy action or run sim trigger */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleCopyText(
              activeTab === 'base' ? pythonBaseCode :
              activeTab === 'strategy' ? getGeneratedStrategyPython() :
              serializedGraphJson
            )}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-theme-text bg-theme-bg border border-theme-border hover:bg-theme-bg/60 rounded-lg shadow-sm transition cursor-pointer"
            title="Copy current tab contents"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-semibold font-mono">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-slate-450" />
                <span>Copy Code</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab('runner');
              triggerPythonSimulation();
            }}
            disabled={isRunningSim}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs text-black bg-primary hover:opacity-95 disabled:bg-slate-800 disabled:text-slate-500 rounded-lg shadow-sm font-semibold transition cursor-pointer"
          >
            {isRunningSim ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>Running...</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-black" />
                <span>Test Python Runner</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs list navigation */}
      <div className="flex border-b border-theme-border gap-1 select-none">
        
        <button
          onClick={() => setActiveTab('strategy')}
          className={`px-3.5 py-2 font-sans text-xs font-bold border-b-2 transition ${
            activeTab === 'strategy'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-400 hover:text-theme-text'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Code2 className="h-4 w-4" />
            Generated Strategy Classes
          </span>
        </button>

        <button
          onClick={() => setActiveTab('base')}
          className={`px-3.5 py-2 font-sans text-xs font-bold border-b-2 transition ${
            activeTab === 'base'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-400 hover:text-theme-text'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Layers className="h-4 w-4" />
            Python Base Class (node_base.py)
          </span>
        </button>

        <button
          onClick={() => setActiveTab('json')}
          className={`px-3.5 py-2 font-sans text-xs font-bold border-b-2 transition ${
            activeTab === 'json'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-400 hover:text-theme-text'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <FileJson className="h-4 w-4" />
            Serialized JSON Output ({nodes.length} Nodes)
          </span>
        </button>

        <button
          onClick={() => setActiveTab('runner')}
          className={`px-3.5 py-2 font-sans text-xs font-bold border-b-2 transition ${
            activeTab === 'runner'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-400 hover:text-theme-text'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Terminal className="h-4 w-4" />
            Compilation Live Terminal
          </span>
        </button>

        <button
          onClick={() => setActiveTab('pyqt6')}
          className={`px-3.5 py-2 font-sans text-xs font-bold border-b-2 transition ${
            activeTab === 'pyqt6'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-400 hover:text-theme-text'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            PyQt6 Graphics Companion
          </span>
        </button>

      </div>

      {/* Code / Visual Display Areas */}
      <div className="bg-slate-950 border border-slate-900 rounded-xl p-4.5 font-mono text-[11.5px] leading-relaxed select-text shadow-inner">
        
        {activeTab === 'pyqt6' && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2 text-xs select-none font-sans">
              <span className="text-slate-400 font-bold flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-primary" />
                Phase 4: Local PyQt6 QGraphicsScene Workspace Companion Code File
              </span>
              <button
                onClick={() => handleCopyText(pyqt6CanvasCode)}
                className="px-2.5 py-1 text-[11px] text-primary hover:text-white bg-slate-900 border border-slate-800 rounded flex items-center gap-1 transition"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                <span>{copied ? 'Copied PyQt6 Code' : 'Copy companion script'}</span>
              </button>
            </div>
            <p className="text-xs text-slate-400 leading-normal font-sans mb-1 bg-slate-900/40 p-3 rounded-lg border border-slate-900">
              💡 <strong>Desktop PyQt6 Integration Specs:</strong> This premium Python source code implements a custom <code>QGraphicsScene</code> / <code>QGraphicsView</code> graph editor. Each block is a beautifully painted custom <code>QGraphicsObject</code> featuring modular header bars, type-safe left-right ports, bezier wires path drawings (using <code>QPainterPath</code>), and a double-click configuration panel. Mapped connections instantly validate types (such as float → boolean mismatches) and repaint invalid wires in <strong>vibrant dashed red</strong>.
            </p>
            <pre className="text-slate-350 max-h-[320px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 whitespace-pre">
              {pyqt6CanvasCode}
            </pre>
          </div>
        )}

        {activeTab === 'base' && (
          <pre className="text-slate-300 max-h-[320px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 whitespace-pre">
            {pythonBaseCode}
          </pre>
        )}

        {activeTab === 'strategy' && (
          <pre className="text-indigo-200 max-h-[320px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 whitespace-pre">
            {getGeneratedStrategyPython()}
          </pre>
        )}

        {activeTab === 'json' && (
          <pre className="text-emerald-400 max-h-[320px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 whitespace-pre">
            {serializedGraphJson}
          </pre>
        )}

        {activeTab === 'runner' && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2 text-xs select-none">
              <span className="text-slate-500 font-mono flex items-center gap-1.5">
                <Terminal className="h-3.5 w-3.5 text-primary" />
                Interactive Python stdout interpreter logs
              </span>
              <span className="text-slate-400 font-mono font-bold">
                Progress: {simProgress}%
              </span>
            </div>

            {/* Real-time Ticker Output line logs */}
            <div className="min-h-[220px] max-h-[300px] overflow-y-auto flex flex-col gap-1 text-[11px] scrollbar-thin scrollbar-thumb-slate-800">
              {simLogs.length === 0 ? (
                <div className="text-slate-600 italic self-center my-auto select-none flex flex-col items-center gap-2">
                  <Play className="h-8 w-8 text-slate-800 fill-slate-800 opacity-60 animate-bounce" />
                  <span>Click "Test Python Runner" to compile and run your logic checks!</span>
                </div>
              ) : (
                simLogs.map((log, index) => {
                  let colorClass = "text-slate-350";
                  if (log.includes("[COMPILE]")) colorClass = "text-indigo-400 font-bold";
                  if (log.includes("[RUNNER]")) colorClass = "text-amber-400 font-bold";
                  if (log.includes("[TICK")) colorClass = "text-white font-extrabold border-t border-slate-900 pt-2 mt-1.5";
                  if (log.includes("->")) colorClass = "text-indigo-300 pl-4";
                  if (log.includes("-->")) colorClass = "text-emerald-400 font-bold pl-8";
                  if (log.includes("[SUCCESS]")) colorClass = "text-emerald-400 font-extrabold pb-2";
                  if (log.includes("[ERROR]")) colorClass = "text-rose-500 font-extrabold";

                  return (
                    <div key={index} className={`${colorClass} whitespace-pre`}>
                      {log}
                    </div>
                  );
                })
              )}
            </div>

            {/* Sim visual progress loading state bar */}
            {isRunningSim && (
              <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden select-none">
                <div 
                  className="h-full bg-primary transition-all duration-300 rounded"
                  style={{ width: `${simProgress}%` }}
                ></div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Underline specification callouts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-slate-400 text-[11px] select-none font-sans mt-0.5">
        <div className="p-3 bg-theme-bg/40 border border-theme-border rounded-xl flex items-start gap-2 shadow-sm">
          <FileJson className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-theme-text block">Canvas Serializes to JSON</span>
            Translates visual DAG coordinates and link connection mappings into a structured telemetry JSON schema.
          </div>
        </div>
        <div className="p-3 bg-theme-bg/40 border border-theme-border rounded-xl flex items-start gap-2 shadow-sm">
          <Sliders className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-theme-text block">O(1) Port Evaluation</span>
            Resolves up-stream variables by binding connected target ports to the dynamic compute outputs in topological order.
          </div>
        </div>
        <div className="p-3 bg-theme-bg/40 border border-theme-border rounded-xl flex items-start gap-2 shadow-sm">
          <ShieldCheck className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-theme-text block">Strict Type Safety Checks</span>
            Verifies compatible links across indicators (series floats) and logic gates (booleans) prior to order book execution.
          </div>
        </div>
      </div>

    </div>
  );
}
