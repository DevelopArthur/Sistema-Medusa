/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect, MouseEvent, FormEvent, WheelEvent } from 'react';
import {
  RotateCcw,
  Sparkles,
  CheckCircle,
  Plus,
  Minus,
  ChevronDown,
  Wifi,
  ChevronUp,
  X,
  Target,
  FolderOpen,
  Send,
  Lock,
  MessageSquare,
  ShieldAlert,
  RefreshCw,
  User,
  Users,
  Terminal,
  Building,
  Coins,
  Settings
} from 'lucide-react';
import { Node, Edge, Entity, Case } from '../types';
import { CASE_GRAPHS_DATA } from '../caseGraphs';

interface CommentItem {
  id: string;
  author: string;
  role: string;
  text: string;
  timestamp: string;
  avatar: string;
}

interface LinkAnalysisViewProps {
  entities?: Entity[];
  cases?: Case[];
  selectedCaseId?: string;
  setSelectedCaseId?: (id: string) => void;
  activeUserName?: string;
}

// Statically define the 26 satellites shown in the target's circular star chart
const SATELLITES_DATA = [
  { id: 'sat-1', name: 'Erik Adam Moon', val: '$16,902.00', angle: -90, level: 'low' },
  { id: 'sat-2', name: 'Shannon Melissa Watson', val: '$4,861.00', angle: -77, level: 'low' },
  { id: 'sat-3', name: 'Linda Jeremy Peterson', val: '$9,800.00', angle: -64, level: 'medium' },
  { id: 'sat-4', name: 'Theresa Andrew White', val: '$12,083.00', angle: -51, level: 'low' },
  { id: 'sat-5', name: 'Kristin Kara Howell', val: '$9,245.00', angle: -38, level: 'low' },
  { id: 'sat-6', name: 'Christopher Adams', val: '$13,661.00', angle: -25, level: 'low' },
  { id: 'sat-7', name: 'Tiffany Tiffany Ward', val: '$4,424.00', angle: -12, level: 'low' },
  { id: 'sat-8', name: 'Jonathan Jesus Smith', val: '$14,468.00', angle: 1, level: 'low' },
  { id: 'sat-9', name: 'Lucy Linda Smith', val: '$10,315.00', angle: 14, level: 'low' },
  { id: 'sat-10', name: 'Linda Michael Beck', val: '$14,856.00', angle: 27, level: 'low' },
  { id: 'sat-11', name: 'Deborah Dana Tyler', val: '$14,856.00', angle: 40, level: 'low' },
  { id: 'sat-12', name: 'Theresa Michelle Miller', val: '$6,741.00', angle: 53, level: 'low' },
  { id: 'sat-13', name: 'Reginald Nicola Bell', val: '$13,153.00', angle: 66, level: 'low' },
  { id: 'sat-14', name: 'Christine Tony Peters', val: '$10,870.00', angle: 79, level: 'low' },
  { id: 'sat-15', name: 'Jon Miguel Diaz', val: '$6,203.00', angle: 92, level: 'low' },
  { id: 'sat-16', name: 'Deborah James White', val: '$13,487.50', angle: 105, level: 'low' },
  { id: 'sat-17', name: 'William Bruce Campbell', val: '$22,221.00', angle: 118, level: 'medium' },
  { id: 'sat-18', name: 'James Eric Johnston', val: '$1,820.00', angle: 131, level: 'low' },
  { id: 'sat-19', name: 'Morgan Adam Wilson', val: '$14,567.00', angle: 144, level: 'low' },
  { id: 'sat-20', name: 'Daniel Jesse White', val: '$9,448.00', angle: 157, level: 'low' },
  { id: 'sat-21', name: 'Julia Juan Kelly', val: '$3,600.00', angle: -116, level: 'low' },
  { id: 'sat-22', name: 'Lisa Jane Yates', val: '$10,063.00', angle: -129, level: 'low' },
  { id: 'sat-23', name: 'Hannah Vincent Boyd', val: '$5,885.00', angle: -142, level: 'low' },
  { id: 'sat-24', name: 'Bruce Lisa Walter', val: '$1,832.00', angle: -155, level: 'low' },
  { id: 'sat-25', name: 'Malik Michael Parker', val: '$8,240.00', angle: -168, level: 'low' },
  { id: 'sat-26', name: 'Eric Rhonda Garcia', val: '$10,839.00', angle: -181, level: 'low' }
];

export default function LinkAnalysisView({
  entities = [],
  cases = [],
  selectedCaseId = 'CAS-301',
  setSelectedCaseId,
  activeUserName = 'Arthur',
}: LinkAnalysisViewProps) {
  // Filters State
  const [amountFilter, setAmountFilter] = useState<string>('all');
  const [visibleObjectsFilter, setVisibleObjectsFilter] = useState<string>('all');
  const [groupingFilter, setGroupingFilter] = useState<'None' | 'Status' | 'Entity Type' | 'Entity Subtype' | 'Links'>('None');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Interactive audit checklist for compliance analysts
  const [auditChecklist, setAuditChecklist] = useState({
    identity: true,
    ipProxy: false,
    smurfing: false,
    pepSanction: false,
  });

  // Primary Workspace Coordinates
  // Malik Montgomery center point
  const cx = 480;
  const cy = 250;
  const R = 215; // Radius of concentric circle

  // Coordinate scaling function to provide spacious breathing room between nodes
  const getScaledCoords = (node: Node) => {
    const isTarget = node.id.startsWith('target-') || node.id === 'target-malik';
    if (isTarget) {
      return { x: cx, y: cy }; // Keep the target node precisely at the center
    }
    const dx = node.x - cx;
    const dy = node.y - cy;
    
    // Scale factor: expand coordinates radially from center by 45% (1.45x) to give maximum breathing room
    const scale = 1.45;
    
    return {
      x: cx + dx * scale,
      y: cy + dy * scale
    };
  };

  // Helper interface for label collision detection
  interface LabelRect {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  }

  // Calculate non-colliding edge label coordinates
  const getEdgeLabelCoords = (
    srcCoords: { x: number; y: number },
    tgtCoords: { x: number; y: number },
    edgeValue: string,
    visibleNodes: Node[],
    placedLabels: LabelRect[]
  ) => {
    const labelWidth = Math.max(68, edgeValue.length * 5.8 + 10);
    const labelHeight = 15;

    // Test a smart range of interpolations (primarily in the outer half to stay near external nodes)
    const candidateTs = [0.65, 0.58, 0.72, 0.50, 0.78, 0.42, 0.83, 0.35, 0.55, 0.70];

    for (const t of candidateTs) {
      const mx = srcCoords.x * t + tgtCoords.x * (1 - t);
      const my = srcCoords.y * t + tgtCoords.y * (1 - t);

      const curMinX = mx - labelWidth / 2 - 4; // safety margins
      const curMaxX = mx + labelWidth / 2 + 4;
      const curMinY = my - labelHeight / 2 - 3;
      const curMaxY = my + labelHeight / 2 + 3;

      let hasOverlap = false;

      // 1. Check overlaps with all visible nodes and their text labels
      for (const node of visibleNodes) {
        const sc = getScaledCoords(node);
        const isTargetNode = node.id === 'target-malik' || node.id.startsWith('target-') || node.id.startsWith('target-nexus');
        const isNodeAboveCenter = sc.y < cy - 10;
        const labelY = isTargetNode ? 46 : isNodeAboveCenter ? -26 : 32;

        const nodeR = isTargetNode ? 28 : 20; // safe node radius estimate
        const nodeMinX = sc.x - 52;
        const nodeMaxX = sc.x + 52;

        // Vertical span of circle + label combination
        const nodeMinY = Math.min(sc.y - nodeR, sc.y + labelY - 12);
        const nodeMaxY = Math.max(sc.y + nodeR, sc.y + labelY + 14);

        if (curMinX < nodeMaxX && curMaxX > nodeMinX && curMinY < nodeMaxY && curMaxY > nodeMinY) {
          hasOverlap = true;
          break;
        }
      }

      // 2. Check overlaps with already placed labels (so labels don't cover each other!)
      if (!hasOverlap) {
        for (const rect of placedLabels) {
          if (curMinX < rect.maxX && curMaxX > rect.minX && curMinY < rect.maxY && curMaxY > rect.minY) {
            hasOverlap = true;
            break;
          }
        }
      }

      if (!hasOverlap) {
        return { x: mx, y: my, minX: curMinX, maxX: curMaxX, minY: curMinY, maxY: curMaxY };
      }
    }

    // Fallback: Use 0.68
    const fallbackT = 0.68;
    const fx = srcCoords.x * fallbackT + tgtCoords.x * (1 - fallbackT);
    const fy = srcCoords.y * fallbackT + tgtCoords.y * (1 - fallbackT);
    return {
      x: fx,
      y: fy,
      minX: fx - labelWidth / 2 - 4,
      maxX: fx + labelWidth / 2 + 4,
      minY: fy - labelHeight / 2 - 3,
      maxY: fy + labelHeight / 2 + 3
    };
  };

  // Nodes Generation based on Mockup layout
  const buildInitialNodes = (): Node[] => {
    if (entities.length === 0) {
      return [];
    }
    const baseNodes: Node[] = [
      { id: 'target-malik', label: 'Malik Michael Montgomery', type: 'individual', riskLevel: 'high', x: cx, y: cy },
      { id: 'device-ip', label: '185.83.57.247', type: 'ip_address', riskLevel: 'medium', x: 230, y: 460 },
      
      // IP Subgraph nodes
      { id: 'ip-sat-1', label: 'Daniel Tyler Galvan', type: 'individual', riskLevel: 'low', x: 130, y: 360 },
      { id: 'ip-sat-2', label: 'Hannah Sarah Adams', type: 'individual', riskLevel: 'low', x: 90, y: 490 },
      
      // Double connections
      { id: 'shared-sat-1', label: 'Jack Jennifer Wal...', type: 'individual', riskLevel: 'low', x: 300, y: 400 },
      { id: 'shared-sat-2', label: 'Jorge Matthew Bar...', type: 'individual', riskLevel: 'low', x: 350, y: 490 }
    ];

    // Combine with programmatically generated satellite circle
    const satellites: Node[] = SATELLITES_DATA.map((sat) => {
      const rad = (sat.angle * Math.PI) / 180;
      let nx = Math.round(cx + R * Math.cos(rad));
      let ny = Math.round(cy + R * Math.sin(rad));

      // Overwrite individual node positions slightly based on Grouping toggle to make it responsive
      if (groupingFilter === 'Status') {
        if (sat.level === 'medium') {
          // Pull medium risk closer
          nx = Math.round(cx + (R - 60) * Math.cos(rad));
          ny = Math.round(cy + (R - 60) * Math.sin(rad));
        } else {
          // Push low risk further
          nx = Math.round(cx + (R + 40) * Math.cos(rad));
          ny = Math.round(cy + (R + 40) * Math.sin(rad));
        }
      } else if (groupingFilter === 'Entity Type') {
        // Segregate into structured left and right banks
        nx = nx + (sat.angle < 0 ? -30 : 30);
      }

      return {
        id: sat.id,
        label: sat.name,
        type: 'individual',
        riskLevel: sat.level as 'low' | 'medium' | 'high',
        x: nx,
        y: ny
      };
    });

    return [...baseNodes, ...satellites];
  };

  // Edges Generation
  const buildInitialEdges = (): Edge[] => {
    if (entities.length === 0) {
      return [];
    }
    const list: Edge[] = [];

    // Red dashed lines matching the star cluster mockup
    SATELLITES_DATA.forEach((sat) => {
      list.push({
        source: 'target-malik',
        target: sat.id,
        type: 'transfer',
        value: sat.val,
        isRisk: parseFloat(sat.val.replace(/[^0-9.]/g, '')) > 12000
      });
    });

    // Device grey lines connects to its proxies
    list.push({ source: 'device-ip', target: 'ip-sat-1', type: 'control', isRisk: false });
    list.push({ source: 'device-ip', target: 'ip-sat-2', type: 'control', isRisk: false });
    list.push({ source: 'device-ip', target: 'shared-sat-1', type: 'control', isRisk: false });
    list.push({ source: 'device-ip', target: 'shared-sat-2', type: 'control', isRisk: false });

    // Shared nodes also connect to target Malik
    list.push({ source: 'target-malik', target: 'shared-sat-1', type: 'transfer', value: '$11,731.00', isRisk: false });
    list.push({ source: 'target-malik', target: 'shared-sat-2', type: 'transfer', value: '$7,414.00', isRisk: false });

    return list;
  };

  const [nodes, setNodes] = useState<Node[]>(buildInitialNodes());
  const [edges, setEdges] = useState<Edge[]>(buildInitialEdges());
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const [graphMode, setGraphMode] = useState<'malik' | 'neo4j'>('neo4j');
  const [isConsoleOpen, setIsConsoleOpen] = useState<boolean>(false);
  
  // Neo4j state
  const [cypherQuery, setCypherQuery] = useState<string>('MATCH (n) RETURN n LIMIT 25');
  const [naturalPrompt, setNaturalPrompt] = useState<string>('');
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [isQuerying, setIsQuerying] = useState<boolean>(false);
  const [neo4jStatus, setNeo4jStatus] = useState<string | null>(null);
  const [neo4jNodes, setNeo4jNodes] = useState<Node[]>([]);
  const [neo4jEdges, setNeo4jEdges] = useState<Edge[]>([]);

  // Translate search prompt using Gemini to raw Cypher query
  const handleTranslatePrompt = async () => {
    if (!naturalPrompt.trim()) return;
    setIsTranslating(true);
    try {
      const res = await fetch('/api/neo4j/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: naturalPrompt })
      });
      const data = await res.json();
      if (res.ok && data.query) {
        setCypherQuery(data.query);
        setNeo4jStatus(`Traduzido com sucesso: "${naturalPrompt}"`);
      } else {
        throw new Error(data.error || 'Falha na tradução');
      }
    } catch (err: any) {
      console.warn('Erro ao traduzir:', err);
      // Fallback translations based on query keyword matching
      const pLower = naturalPrompt.toLowerCase();
      let query = 'MATCH (n) RETURN n LIMIT 25';
      if (pLower.includes('transa') || pLower.includes('envi') || pLower.includes('transfer')) {
        query = 'MATCH (p:Pessoa)-[r:TRANSFER]->(m:Conta) RETURN p, r, m LIMIT 20';
      } else if (pLower.includes('risco') || pLower.includes('suspei') || pLower.includes('perigo')) {
        query = "MATCH (n) WHERE n.riskLevel = 'high' RETURN n LIMIT 10";
      } else if (pLower.includes('socio') || pLower.includes('mei') || pLower.includes('dona')) {
        query = 'MATCH (p:Pessoa)-[r:OWNERSHIP]->(e:Empresa) RETURN p, r, e';
      } else if (pLower.includes('para') || pLower.includes('offshore') || pLower.includes('cayman')) {
        query = 'MATCH (t:Trust)-[r:TRANSFER]->(o:Offshore) RETURN t, r, o';
      }
      setCypherQuery(query);
      setNeo4jStatus(`Traduzido offline (Simulado): "${naturalPrompt}"`);
    } finally {
      setIsTranslating(false);
    }
  };

  // Run Cypher Query against database (falls back to high-fidelity mock graph in server)
  const handleExecuteCypher = async () => {
    setIsQuerying(true);
    setNeo4jStatus('Conectando e executando query Cypher...');
    try {
      const res = await fetch('/api/neo4j/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: cypherQuery })
      });
      const data = await res.json();
      if (res.ok && data.success && data.graph) {
        setNeo4jNodes(data.graph.nodes);
        setNeo4jEdges(data.graph.edges);
        setNeo4jStatus(data.isSimulated 
          ? `Simulado com sucesso: Encontrados ${data.graph.nodes.length} nós e ${data.graph.edges.length} relacionamentos.`
          : `Executado com sucesso no Neo4j: Encontrados ${data.graph.nodes.length} nós e ${data.graph.edges.length} relacionamentos.`
        );
      } else {
        throw new Error(data.error || 'Nenhum resultado retornado do banco.');
      }
    } catch (err: any) {
      console.warn('Erro ao executar query Cypher:', err);
      setNeo4jStatus(`Erro operacional: ${err.message || 'Falha ao conectar ao container Neo4j.'}`);
    } finally {
      setIsQuerying(false);
    }
  };

  // Load corresponding high-fidelity case graph when selectedCaseId changes
  useEffect(() => {
    if (selectedCaseId) {
      if (CASE_GRAPHS_DATA[selectedCaseId]) {
        const graph = CASE_GRAPHS_DATA[selectedCaseId];
        setNodes(graph.nodes);
        setEdges(graph.edges);
        setNeo4jNodes(graph.nodes);
        setNeo4jEdges(graph.edges);
        
        const targetNode = graph.nodes.find((n) => n.id.startsWith('target-')) || graph.nodes[0];
        setSelectedNode(targetNode || null);
        
        setZoomLevel(1.0);
        setPanX(0);
        setPanY(0);
        
        setNeo4jStatus(`Grafo do caso ${selectedCaseId} carregado: ${graph.nodes.length} nós e ${graph.edges.length} vínculos sob perícia.`);
      } else {
        // Dynamic graph generator for newly created or custom cases!
        const foundCase = cases.find((c) => c.id === selectedCaseId);
        if (foundCase) {
          const targetNodeId = `target-${foundCase.id}`;
          const dynamicNodes: Node[] = [
            { id: targetNodeId, label: foundCase.target, type: 'individual', riskLevel: foundCase.riskLevel, x: cx, y: cy },
            { id: `op-${foundCase.id}`, label: `Auditor: ${foundCase.assignedTo}`, type: 'individual', riskLevel: 'low', x: cx - 180, y: cy - 120 },
            { id: `ip-${foundCase.id}`, label: 'Autenticação IP: 177.34.82.91', type: 'ip_address', riskLevel: 'medium', x: cx - 180, y: cy + 120 },
            { id: `shell-${foundCase.id}`, label: `Offshore: ${foundCase.target.split(' ')[0] || 'Alvo'} Holding Ltd`, type: 'trust', riskLevel: 'high', x: cx + 220, y: cy },
            { id: `laranja-1`, label: 'Conta Beneficiada A (Repasse PIX)', type: 'account', riskLevel: 'medium', x: cx - 80, y: cy - 160 },
            { id: `laranja-2`, label: 'Conta Laranja B (Interposto)', type: 'account', riskLevel: 'medium', x: cx + 80, y: cy - 160 },
            { id: `banco-${foundCase.id}`, label: 'Banco Correspondente Bahamas', type: 'company', riskLevel: 'high', x: cx + 180, y: cy + 120 }
          ];

          const dynamicEdges: Edge[] = [
            { source: `laranja-1`, target: targetNodeId, type: 'transfer', value: 'R$ 450k (Lote PIX)', isRisk: true },
            { source: `laranja-2`, target: targetNodeId, type: 'transfer', value: 'R$ 380k (Lote PIX)', isRisk: true },
            { source: `op-${foundCase.id}`, target: targetNodeId, type: 'control', isRisk: false },
            { source: `ip-${foundCase.id}`, target: targetNodeId, type: 'control', isRisk: false },
            { source: targetNodeId, target: `shell-${foundCase.id}`, type: 'transfer', value: foundCase.associatedValue, isRisk: true },
            { source: `shell-${foundCase.id}`, target: `banco-${foundCase.id}`, type: 'control', isRisk: true }
          ];

          setNodes(dynamicNodes);
          setEdges(dynamicEdges);
          setNeo4jNodes(dynamicNodes);
          setNeo4jEdges(dynamicEdges);
          setSelectedNode(dynamicNodes[0]);
          
          setZoomLevel(1.0);
          setPanX(0);
          setPanY(0);

          setNeo4jStatus(`Grafo do caso síncrono ${selectedCaseId} gerado dinamicamente com ${dynamicNodes.length} nós.`);
        }
      }
    }
  }, [selectedCaseId, cases]);

  // Sync state values on filter change to rebuild coordinates or apply rules
  useEffect(() => {
    if (graphMode === 'malik') {
      setNodes(buildInitialNodes());
      setEdges(buildInitialEdges());
    } else {
      setNodes(neo4jNodes);
      setEdges(neo4jEdges);
    }
  }, [groupingFilter, entities, graphMode, neo4jNodes, neo4jEdges]);

  // Initial node selection
  useEffect(() => {
    if (nodes.length > 0) {
      const target = nodes.find((n) => n.id.startsWith('target-') || n.id === 'target-malik') || nodes[0];
      setSelectedNode(target);
    } else {
      setSelectedNode(null);
    }
  }, [nodes]);

  // Zoom / Pan state
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // SVG ref
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Priya's Operations Settings
  const [assignedAnalyst, setAssignedAnalyst] = useState<string>(activeUserName);
  const [currentQueue, setCurrentQueue] = useState<string>('Fila Geral de Alertas');
  const [workflowStatus, setWorkflowStatus] = useState<string | null>(null);

  // Comments stream state
  const [commentsList, setCommentsList] = useState<CommentItem[]>([]);
  const [newComment, setNewComment] = useState<string>('');

  // Synchronize dynamic analyst, queue, and comments list based on prototype reset/entities presence
  useEffect(() => {
    if (entities.length === 0) {
      setAssignedAnalyst('-');
      setCurrentQueue('-');
      setCommentsList([]);
    } else if (assignedAnalyst === '-' || currentQueue === '-') {
      setAssignedAnalyst(activeUserName);
      setCurrentQueue('Fila Geral de Alertas');
    }
  }, [entities, assignedAnalyst, currentQueue, activeUserName]);

  // Execute base search query on mount (starts empty per user request)
  useEffect(() => {
    // Grafo inicia vazio por padrão conforme solicitado
  }, []);

  // AI Diagnostic State
  const [aiReport, setAiReport] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  // Search logic
  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const found = nodes.find((n) => n.label.toLowerCase().includes(searchQuery.toLowerCase()));
    if (found) {
      setSelectedNode(found);
      const sc = getScaledCoords(found);
      // Center pan slightly towards searched node
      setPanX(400 - sc.x);
      setPanY(250 - sc.y);
      setZoomLevel(1.2);
    }
  };

  // Zoom / Pan actions
  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.15, 2.5));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.15, 0.5));
  const handleResetZoom = () => {
    setZoomLevel(1.0);
    setPanX(0);
    setPanY(0);
  };

  const handleMouseDown = (e: MouseEvent<SVGSVGElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panX, y: e.clientY - panY });
  };

  const handleMouseMove = (e: MouseEvent<SVGSVGElement>) => {
    if (!isDragging) return;
    setPanX(e.clientX - dragStart.x);
    setPanY(e.clientY - dragStart.y);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    if (!svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const zoomFactor = 0.06;
    const oldZoom = zoomLevel;
    let newZoom = oldZoom;

    if (e.deltaY < 0) {
      newZoom = Math.min(oldZoom + zoomFactor, 2.5);
    } else {
      newZoom = Math.max(oldZoom - zoomFactor, 0.5);
    }

    if (newZoom !== oldZoom) {
      const ratio = newZoom / oldZoom;
      const newPanX = mx - (mx - panX) * ratio;
      const newPanY = my - (my - panY) * ratio;

      setZoomLevel(newZoom);
      setPanX(newPanX);
      setPanY(newPanY);
    }
  };

  // Re-Assign analyst trigger
  const handleReassign = () => {
    const names = ['Amadeus', 'Arthur', 'João Vitor', 'Analista Souza'];
    const currentIdx = names.indexOf(assignedAnalyst);
    const nextIdx = (currentIdx + 1) % names.length;
    const nextAnalyst = names[nextIdx];
    
    setAssignedAnalyst(nextAnalyst);
    setWorkflowStatus(null);
    setAiReport('');
    setSelectedNode(null);
    
    // Clear previous comment history completely (no system logs)
    setCommentsList([]);
  };

  // Queue change trigger
  const handleChangeQueue = () => {
    const queues = ['Fila Geral de Alertas', 'Casos de Alta Prioridade', 'Revisão de Conformidade'];
    const currentIdx = queues.indexOf(currentQueue);
    const nextIdx = (currentIdx + 1) % queues.length;
    const nextQueueName = queues[nextIdx];
    
    setCurrentQueue(nextQueueName);
    setWorkflowStatus(null);
    setAiReport('');
    setSelectedNode(null);
    
    // Clear previous comment history completely (no system logs)
    setCommentsList([]);
  };

  // Workflow Button click trigger
  const executeWorkflow = (workflowName: string, colorClass: string) => {
    setWorkflowStatus(workflowName);
    
    // Automatically add a beautiful, immersive audit log with user action
    const newAuditLog: CommentItem = {
      id: `wf-${Date.now()}`,
      author: assignedAnalyst,
      role: 'Operações de Conformidade',
      text: `Ação realizada com sucesso: "${workflowName}" aplicada ao perfil sob auditoria por ${assignedAnalyst}.`,
      timestamp: new Date().toLocaleString('pt-BR'),
      avatar: assignedAnalyst.charAt(0).toUpperCase()
    };
    
    setCommentsList(prev => [...prev, newAuditLog]);

    // Clear alert banner after some time
    setTimeout(() => {
      setWorkflowStatus(null);
    }, 4000);
  };

  // Submit hand-written comment
  const handleAddComment = (e: FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const logItem: CommentItem = {
      id: `comment-${Date.now()}`,
      author: assignedAnalyst,
      role: 'Analista Sênior',
      text: newComment.trim(),
      timestamp: new Date().toLocaleString('pt-BR'),
      avatar: assignedAnalyst.charAt(0).toUpperCase()
    };

    setCommentsList((prev) => [...prev, logItem]);
    setNewComment('');
  };

  // Render automatic AI connections analysis utilizing the secure Gemini API proxy
  const handleTriggerAiAnalysis = async (node: Node) => {
    setIsAiLoading(true);
    setAiReport('');

    // Map immediately connected neighbours in our graph data
    const directNeighbors = edges
      .filter((e) => e.source === node.id || e.target === node.id)
      .map((e) => {
        const otherId = e.source === node.id ? e.target : e.source;
        const otherNode = nodes.find((n) => n.id === otherId);
        return {
          entity: otherNode?.label || 'Vínculo Sem Registro',
          relationship: e.type,
          value: e.value || 'Tráfego sem valor',
          suspicious: e.isRisk
        };
      });

    try {
      const response = await fetch('/api/analyze-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ node, neighbors: directNeighbors })
      });
      const data = await response.json();
      if (response.ok && data.summary) {
        setAiReport(data.summary);
      } else {
        throw new Error(data.error || 'Nenhum laudo gerado.');
      }
    } catch (err: any) {
      console.warn('Erro ao acionar laudo:', err);
      // Dynamic simulated fallback report reflecting visual layout constraints
      let reportText = `Laudo Técnico Inteligente: O alvo ${node.label} centraliza uma volumosa teia de fracionamento de valores (remessas estruturadas de Smurfing) com 26 contas satélites conectadas. Adicionalmente, detectou-se o uso concomitantemente do endereço de IP proxy por parte das contas de Jack Jennifer e Jorge Matthew, configurando fraude de interposição cadastral ou simulação de residência digital cruzada.`;
      
      const lbl = node.label.toLowerCase();
      if (lbl.includes('filipe') || lbl.includes('nexus') || lbl.includes('fintech') || node.id.includes('nexus')) {
        reportText = `Diagnóstico de Vínculos (Caso CAS-301 - Fintech Nexus): O Alvo Principal ${node.label} atua como facilitador de saques expressos e ocultamento patrimonial via contas de passagem automatizadas (Smurfing Digital). Apresenta transações fracionadas de alto risco e conexões de alta velocidade com laranjas digitais cadastrados sob o mesmo proxy.`;
      } else if (lbl.includes('valter') || lbl.includes('oeste') || node.id.includes('commodities')) {
        reportText = `Diagnóstico de Vínculos (Caso CAS-302 - Oeste S.A.): O Alvo Principal ${node.label} opera e emite notas fiscais de venda de grãos e corretagem agrícola de commodities sem lastro logístico ou operacional real (Commodities Fantasmas). Recursos financeiros circulam por interposição de empresas de fachada e contas em paraísos fiscais.`;
      } else if (lbl.includes('marina') || lbl.includes('rastro') || node.id.includes('pep')) {
        reportText = `Diagnóstico de Vínculos (Caso CAS-303 - Rastro Oculto): O Alvo Principal ${node.label} (Pessoa Politicamente Exposta - PEP) recebe fluxos financeiros atípicos e não declarados sob pretexto de contestações judiciais e falsas consultorias. Integra múltiplos trustes familiares e offshores sediadas em paraísos fiscais do Caribe e Leste Europeu.`;
      } else if (lbl.includes('roberto') || lbl.includes('continental') || node.id.includes('hotel')) {
        reportText = `Diagnóstico de Vínculos (Caso CAS-304 - Hotelaria Fantasma): O Alvo Principal ${node.label} realiza lavagem de capitais por meio de faturamento fictício e inflação artificial das taxas de ocupação da Rede Continental. Os ativos do crime organizado são integrados e distribuídos sob a falsa rubrica de dividendos corporativos legítimos.`;
      } else if (lbl.includes('juliana') || lbl.includes('natureza') || node.id.includes('ong')) {
        reportText = `Diagnóstico de Vínculos (Caso CAS-305 - Triangulação de ONGs): O Alvo Principal ${node.label} coordena o desvio de verbas de fomento ambiental recebidas pelo Instituto Natureza Viva, pulverizando recursos públicos em contas de pessoas físicas e empresas de fachada vinculadas aos diretores.`;
      } else if (lbl.includes('kripto') || lbl.includes('token') || node.id.includes('kripto')) {
        reportText = `Diagnóstico de Vínculos (Caso CAS-306 - Evasão por Tokens Imobiliários): O Alvo Principal ${node.label} facilita o escoamento irregular de provisões financeiras integrando carteiras de custódia e fracionamento descentralizado por contratos inteligentes e evasão de divisas através de mixers.`;
      } else if (lbl.includes('medlife') || lbl.includes('saude') || node.id.includes('medlife')) {
        reportText = `Diagnóstico de Vínculos (Caso CAS-307 - Esquema de Licitações de Oxigênio): O Alvo Principal ${node.label} centraliza pagamentos atípicos derivados de editais superfaturados municipais, distribuindo propinas a agentes e sacando frações volumosas correspondentes a saques dirigidos em caixas automáticos.`;
      } else if (lbl.includes('diamond') || lbl.includes('blindagem') || node.id.includes('diamond')) {
        reportText = `Diagnóstico de Vínculos (Caso CAS-308 - Ocultação em Blindagem de Luxo): O Alvo Principal ${node.label} é suspeito de interposição de laranjas de fachada na compra de utilitários superesportivos de luxo em dinheiro vivo, pulverizando as receitas por trusts e transações para Miami, Flórida.`;
      }
      setAiReport(reportText);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Filter out edges and nodes dynamically based on active filter choices
  const isEdgeVisible = (edge: Edge) => {
    // Amount Filter
    if (amountFilter !== 'all' && edge.value) {
      const valueNum = parseFloat(edge.value.replace(/[^0-9.]/g, ''));
      if (amountFilter === 'under-5000' && valueNum >= 5000) return false;
      if (amountFilter === 'above-5000' && valueNum < 5000) return false;
      if (amountFilter === 'above-12000' && valueNum < 12000) return false;
    }

    return true;
  };

  const isNodeVisible = (node: Node) => {
    // Search Query highlight/filter
    if (searchQuery.trim() && !node.label.toLowerCase().includes(searchQuery.toLowerCase())) {
      // Don't hide, let style handle fading out for better workspace visibility
    }

    // Visible Objects Filter dropdown
    if (visibleObjectsFilter === 'only-risk' && node.riskLevel !== 'high') {
      return false;
    }
    if (visibleObjectsFilter === 'only-ip') {
      // Keep only IP node and its direct connections
      const connectedToIp = ['device-ip', 'ip-sat-1', 'ip-sat-2', 'shared-sat-1', 'shared-sat-2'];
      if (!connectedToIp.includes(node.id)) return false;
    }

    return true;
  };

  // Build filtered node list for actual drawing
  const visibleNodes = nodes.filter(isNodeVisible);
  const visibleEdges = edges.filter((e) => {
    const srcNode = nodes.find((n) => n.id === e.source);
    const tgtNode = nodes.find((n) => n.id === e.target);
    if (!srcNode || !tgtNode) return false;
    if (!isNodeVisible(srcNode) || !isNodeVisible(tgtNode)) return false;
    return isEdgeVisible(e);
  });

  return (
    <div className="flex flex-col h-full bg-[#f6f6f9] overflow-hidden text-[#1d1d1f] font-sans antialiased">
      
      {/* Caso em Análise Sub-Header bar */}
      <div className="bg-white border-b border-[#e5e5e7] px-8 py-3.5 flex flex-col xl:flex-row xl:items-center justify-between gap-4 shrink-0 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100/60 shrink-0">
              <FolderOpen className="w-4 h-4 text-primary" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-text-secondary uppercase block tracking-wider leading-none">Dossiê sob Análise</span>
              <div className="flex items-center gap-2 mt-1">
                <select
                  value={selectedCaseId}
                  onChange={(e) => setSelectedCaseId && setSelectedCaseId(e.target.value)}
                  className="bg-[#f3f3f5] hover:bg-[#e5e5e7] text-[#1d1d1f] font-bold text-xs px-3 py-1.5 rounded-xl border border-transparent outline-none focus:border-emerald-500/50 transition cursor-pointer select-none max-w-sm"
                >
                  {cases.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.id} // {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-text-secondary">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-[#003526]" />
              <span>Nós no Workspace: <strong>{nodes.length}</strong></span>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl">
              <span className="w-2 h-2 bg-amber-400 rotate-45 rounded-xs" />
              <span>Vínculos Suspeitos: <strong>{edges.filter(e => e.isRisk).length}</strong></span>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl">
              <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-md">NEO4J</span>
              <span>Motor de Vínculos</span>
            </div>
          </div>
        </div>

        {/* Action Controls directly integrated into Sub-Header row removed as requested */}
      </div>

      {/* Collapsible Prime Control Hub */}
      {isConsoleOpen && (
        <div id="prime-control-hub" className="flex flex-col lg:flex-row items-center justify-between gap-6 px-8 py-4 bg-white border-b border-[#e5e5e7] shrink-0 shadow-xs animate-in slide-in-from-top-3 duration-200">
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
            {/* Prompt Translator */}
            <div className="lg:col-span-4 flex items-center gap-2">
              <div className="relative flex-1">
                <Sparkles className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-600 animate-pulse" />
                <input
                  type="text"
                  value={naturalPrompt}
                  onChange={(e) => setNaturalPrompt(e.target.value)}
                  placeholder="Buscar por linguagem natural (Ex: Sócios)..."
                  className="w-full bg-[#f3f3f5] focus:bg-white border border-[#e5e5e7] focus:border-sky-300 pl-10 pr-4 py-2 rounded-xl text-xs outline-none transition"
                  onKeyDown={(e) => { if (e.key === 'Enter') handleTranslatePrompt(); }}
                />
              </div>
              <button
                onClick={handleTranslatePrompt}
                disabled={isTranslating}
                className="px-3 py-2 bg-sky-50 text-sky-700 hover:bg-sky-100 disabled:opacity-55 border border-sky-100 rounded-xl text-xs font-bold cursor-pointer transition shrink-0"
              >
                {isTranslating ? 'Traduzindo...' : 'Traduzir'}
              </button>
            </div>

            {/* Cypher Direct Input */}
            <div className="lg:col-span-6 flex items-center gap-2">
              <span className="font-mono text-[10px] text-text-secondary select-none">Cypher:</span>
              <input
                type="text"
                value={cypherQuery}
                onChange={(e) => setCypherQuery(e.target.value)}
                placeholder="Query Cypher"
                className="w-full bg-slate-900 text-emerald-400 font-mono text-xs px-3.5 py-2 rounded-xl border border-slate-800 outline-none focus:border-emerald-500/50 transition"
                onKeyDown={(e) => { if (e.key === 'Enter') handleExecuteCypher(); }}
              />
            </div>

            {/* Run Button */}
            <div className="lg:col-span-2 flex justify-end">
              <button
                onClick={handleExecuteCypher}
                disabled={isQuerying}
                className="w-full bg-[#003526] hover:bg-[#0f4d3a] disabled:opacity-55 text-white py-2 px-4 rounded-xl text-xs font-bold cursor-pointer transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isQuerying ? 'animate-spin' : ''}`} />
                <span>{isQuerying ? 'Pesquisando...' : 'Executar Query'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {isConsoleOpen && graphMode === 'neo4j' && neo4jStatus && (
        <div className="bg-slate-50 border-b border-[#e5e5e7] px-8 py-2.5 text-[10px] font-mono text-slate-500 flex items-center justify-between shrink-0">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>ESTADO DO BANCO DE GRAFOS: {neo4jStatus}</span>
          </span>
          <button onClick={() => setNeo4jStatus(null)} className="hover:text-slate-700">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Main Layout Area: Split between SVG area (left) and Compliance Panel (right) */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        
        {/* Interactive Drawing Canvas (Left) */}
        <main className="flex-1 relative flex flex-col min-w-0 bg-white">
          
          {/* Zoom controls float on upper Right inside canvas frame per mockup design */}
          <div className="absolute top-6 right-6 z-20 flex gap-1 bg-white/95 border border-[#e5e5e7] rounded-xl p-1.5 shadow-md">
            <button
              onClick={handleZoomIn}
              className="p-2 hover:bg-[#f3f3f5] rounded-lg text-text-secondary hover:text-text-primary transition"
              title="Aproximar Vídeo"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-2 hover:bg-[#f3f3f5] rounded-lg text-text-secondary hover:text-text-primary transition"
              title="Afastar"
            >
              <Minus className="w-4 h-4" />
            </button>
            <div className="w-[1px] bg-slate-200 self-stretch my-1.5" />
            <button
              onClick={handleResetZoom}
              className="p-2 hover:bg-[#f3f3f5] rounded-lg text-text-secondary hover:text-text-primary transition"
              title="Restaurar Posição Original"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {searchQuery.trim() && (
            <div className="absolute top-6 left-6 z-10 text-xs pointer-events-none select-none text-slate-400 font-mono">
              <span className="bg-amber-50 text-amber-800 px-3 py-1.5 rounded-lg border border-amber-200 shadow-xs">
                Filtro de busca ativo: "{searchQuery}"
              </span>
            </div>
          )}

          {/* Workflow success banner */}
          {workflowStatus && (
            <div className="absolute top-16 left-6 right-6 z-30 bg-[#2e7d32] text-white text-xs font-bold px-5 py-4 rounded-xl shadow-lg flex items-center justify-between border border-[#1b5e20] animate-bounce">
              <div className="flex items-center gap-2.5">
                <CheckCircle className="w-4 h-4 text-white shrink-0" />
                <span>Fluxo operacional aplicado com sucesso: "{workflowStatus}"!</span>
              </div>
              <button onClick={() => setWorkflowStatus(null)} className="hover:opacity-75 transition p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* SVG Canvas Viewport */}
          <div className="w-full flex-1 overflow-hidden relative select-none bg-white min-h-[450px] flex">
            {nodes.length === 0 && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center p-12 bg-slate-50/40 pointer-events-none">
                <RefreshCw className="w-12 h-12 text-[#aeaeae] opacity-40 mb-4" />
                <h3 className="font-bold text-sm text-text-primary font-display">Análise Gráfica Vazia</h3>
                <p className="text-xs text-text-secondary mt-1.5 max-w-xs leading-relaxed">
                  Não há vínculos carregados. Restaure as marcas originais de simulação no painel de **Configurações** para examinar os grafos em detalhes.
                </p>
              </div>
            )}
            <svg
              ref={svgRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
              className={`w-full h-full transform origin-center transition-all bg-[#0a0f1d]/[0.015] ${
                isDragging ? 'cursor-grabbing' : 'cursor-grab'
              }`}
            >
              <defs>
                {/* Arrowhead markers */}
                <marker
                  id="arrow-dashed"
                  viewBox="0 0 10 10"
                  refX="33"
                  refY="5"
                  markerWidth="7"
                  markerHeight="7"
                  orient="auto"
                >
                  <path d="M 0 1 L 9 5 L 0 9 z" fill="#ba1a1a" />
                </marker>
                <marker
                  id="arrow-grey"
                  viewBox="0 0 10 10"
                  refX="33"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto"
                >
                  <path d="M 0 1 L 9 5 L 0 9 z" fill="#8e8e93" />
                </marker>
              </defs>

              {/* Pan and Zoom dynamic Group */}
              <g transform={`translate(${panX}, ${panY}) scale(${zoomLevel})`}>
                
                {/* Drawing Links / Edges */}
                {(() => {
                  const placedLabels: LabelRect[] = [];
                  return visibleEdges.map((edge, idx) => {
                    const src = visibleNodes.find((n) => n.id === edge.source);
                    const tgt = visibleNodes.find((n) => n.id === edge.target);

                    if (!src || !tgt) return null;

                    const srcCoords = getScaledCoords(src);
                    const tgtCoords = getScaledCoords(tgt);

                    const isIPConnection = edge.source === 'device-ip' || edge.target === 'device-ip';
                    const isNodeSelected = selectedNode && (selectedNode.id === edge.source || selectedNode.id === edge.target);

                    // Compute label position if value exists using overlap avoidance
                    let labelPos = null;
                    if (edge.value) {
                      const res = getEdgeLabelCoords(srcCoords, tgtCoords, edge.value, visibleNodes, placedLabels);
                      labelPos = { x: res.x, y: res.y };
                      placedLabels.push({ minX: res.minX, maxX: res.maxX, minY: res.minY, maxY: res.maxY });
                    }

                    return (
                      <g key={`edge-${idx}`}>
                        <line
                          x1={srcCoords.x}
                          y1={srcCoords.y}
                          x2={tgtCoords.x}
                          y2={tgtCoords.y}
                          stroke={isIPConnection ? '#aeaeb2' : '#ba1a1a'}
                          strokeWidth={isNodeSelected ? 2.5 : isIPConnection ? 1.5 : 1.2}
                          strokeDasharray={isIPConnection ? '0' : '5 4'}
                          opacity={selectedNode && !isNodeSelected ? 0.35 : 0.8}
                          markerEnd={`url(#${isIPConnection ? 'arrow-grey' : 'arrow-dashed'})`}
                          className="transition-all duration-300"
                        />

                        {/* Cash Amounts Text pill exactly rendered per mockup */}
                        {edge.value && labelPos && (() => {
                          const labelWidth = Math.max(68, edge.value!.length * 5.8 + 10);
                          const labelHeight = 15;
                          const rxValue = 6;
                          return (
                            <g>
                              {/* Modern soft borderless pill background with minimal opacity drop-shadow */}
                              <rect
                                x={labelPos.x - labelWidth / 2}
                                y={labelPos.y - labelHeight / 2}
                                width={labelWidth}
                                height={labelHeight}
                                rx={rxValue}
                                fill="#ffffff"
                                filter="drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.06))"
                                opacity={selectedNode && !isNodeSelected ? 0.45 : 1}
                                className="transition-all duration-300"
                              />
                              {/* Premium dark slate value typography - distinct from red dashes */}
                              <text
                                x={labelPos.x}
                                y={labelPos.y + 3}
                                fill="#374151" /* Gray-700/Slate: highly legible and distinct from red line */
                                fontSize="8.5px"
                                fontWeight="600"
                                fontFamily="monospace"
                                textAnchor="middle"
                                opacity={selectedNode && !isNodeSelected ? 0.45 : 1}
                                className="transition-all duration-300 select-none"
                              >
                                {edge.value}
                              </text>
                            </g>
                          );
                        })()}
                      </g>
                    );
                  });
                })()}

                {/* Drawing Nodes */}
                {visibleNodes.map((node) => {
                  const isNodeSelected = selectedNode?.id === node.id;
                  const isTargetNode = node.id === 'target-malik' || node.id.startsWith('target-');
                  const isIPAddress = node.id === 'device-ip' || node.type === 'ip_address';
                  const searchMatches = searchQuery.trim() && node.label.toLowerCase().includes(searchQuery.toLowerCase());
                  
                  // Style colors from layout
                  let nodeColor = 'bg-[#1e7d5d] text-white'; // Medusa Forest Green default
                  let ringColor = 'border-[#d2d2d7]';
                  let iconElement = <User className="w-5 h-5 text-white" />;

                  if (isTargetNode) {
                    // Center Target Styling (Red, pulsed alert ring)
                    nodeColor = 'bg-[#ba1a1a] text-white animate-pulse';
                    ringColor = 'border-[#ba1a1a] ring-4 ring-red-200';
                    iconElement = <ShieldAlert className="w-6 h-6 text-white" />;
                  } else if (isIPAddress) {
                    // IP Proxy Device styling (Grey)
                    nodeColor = 'bg-[#8e8e93] text-white';
                    ringColor = 'border-gray-400';
                    iconElement = <Wifi className="w-5 h-5 text-white" />;
                  }

                  const sc = getScaledCoords(node);
                  
                  // Determine label placement based on position relative to center (cy = 250)
                  const isNodeAboveCenter = sc.y < cy - 10;
                  const labelY = isTargetNode 
                    ? 46 
                    : isNodeAboveCenter 
                    ? -26 
                    : 32;

                  return (
                    <g
                      key={node.id}
                      transform={`translate(${sc.x}, ${sc.y})`}
                      className="cursor-pointer transition-all duration-300"
                      onClick={() => setSelectedNode(node)}
                    >
                      {/* Interactive Selection border ring */}
                      <circle
                        r={isTargetNode ? 30 : 20}
                        className={`fill-none stroke-2 ${
                          isNodeSelected
                            ? 'stroke-primary stroke-[3px]'
                            : searchMatches
                            ? 'stroke-amber-500 stroke-[3px] animate-bounce'
                            : 'stroke-transparent'
                        }`}
                      />

                      {/* Inner Circular Node */}
                      <circle
                        r={isTargetNode ? 24 : 16}
                        fill={
                          isTargetNode
                            ? '#ba1a1a'
                            : isIPAddress
                            ? '#8e8e93'
                            : node.riskLevel === 'high'
                            ? '#ba1a1a'
                            : node.riskLevel === 'medium'
                            ? '#f57c00'
                            : '#1e7d5d'
                        }
                        stroke="#ffffff"
                        strokeWidth={2}
                        className="shadow-md transition-transform duration-300 hover:scale-110"
                      />

                      {/* Icon projection */}
                      <g transform={`translate(-${isTargetNode ? 12 : 10}, -${isTargetNode ? 12 : 10})`}>
                        {isTargetNode ? (
                          <ShieldAlert className="w-6 h-6 text-white" />
                        ) : isIPAddress ? (
                          <Wifi className="w-5 h-5 text-white" />
                        ) : node.type === 'company' ? (
                          <Building className="w-5 h-5 text-white" />
                        ) : node.type === 'account' ? (
                          <Coins className="w-5 h-5 text-white" />
                        ) : node.type === 'trust' ? (
                          <Lock className="w-5 h-5 text-white" />
                        ) : (
                          <User className="w-5 h-5 text-white" />
                        )}
                      </g>

                      {/* Display Alert Dot on Node */}
                      {node.riskLevel === 'high' && !isTargetNode && (
                        <circle cx={14} cy={-14} r={5} className="fill-[#ba1a1a] stroke-white stroke-1" />
                      )}

                      {/* White text outline/halo for ultra-high legibility */}
                      <text
                        y={labelY}
                        textAnchor="middle"
                        fontSize={isTargetNode ? '12px' : '9.5px'}
                        fontWeight={isTargetNode ? 'bold' : isNodeSelected ? 'bold' : 'medium'}
                        fill="none"
                        stroke="#ffffff"
                        strokeWidth={5.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="font-sans antialiased select-none"
                      >
                        {node.label.length > 20 ? `${node.label.substring(0, 18)}...` : node.label}
                      </text>

                      {/* Node text labels formatted exactly to match search/highlighting */}
                      <text
                        y={labelY}
                        textAnchor="middle"
                        fontSize={isTargetNode ? '12px' : '9.5px'}
                        fontWeight={isTargetNode ? 'bold' : isNodeSelected ? 'bold' : 'normal'}
                        fill={isNodeSelected ? '#1e7d5d' : '#1d1d1f'}
                        className="font-sans antialiased select-none"
                      >
                        {node.label.length > 20 ? `${node.label.substring(0, 18)}...` : node.label}
                      </text>
                    </g>
                  );
                })}

              </g>
            </svg>
          </div>
        </main>

        {/* Right Compliance Operations panel reorganized beautifully */}
        <aside className="w-full md:w-[350px] border-l border-[#e5e5e7] bg-[#fbfbfc] flex flex-col justify-between shrink-0 overflow-y-auto">
          
          <div className="p-6 space-y-6">
            
            {/* Modular Header: Compliance Checklist & Risk Index */}
            <div className="bg-white border border-[#e5e5e7] p-4 rounded-xl space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <span className="text-[10px] font-bold text-[#8e8e93] uppercase tracking-wider">Passos de Verificação</span>
                <span className="text-[10px] font-mono font-bold bg-[#003526]/10 text-primary px-2.5 py-1 rounded-md">
                  {Object.values(auditChecklist).filter(Boolean).length} / 4 Concluídos
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-[#f3f3f5] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-primary h-full transition-all duration-500"
                  style={{ width: `${(Object.values(auditChecklist).filter(Boolean).length / 4) * 100}%` }}
                />
              </div>

              <div className="space-y-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setAuditChecklist(prev => ({ ...prev, identity: !prev.identity }))}
                  className="w-full flex items-center justify-between text-left p-2 hover:bg-slate-50 border border-slate-100 rounded-lg transition text-xs group cursor-pointer"
                >
                  <span className="flex items-center gap-2 text-slate-700">
                    <span className={`w-2.5 h-2.5 rounded-full ${auditChecklist.identity ? 'bg-[#1e7d5d]' : 'bg-slate-300'}`} />
                    <span className={auditChecklist.identity ? 'line-through text-slate-400 font-normal' : 'font-medium'}>
                      Confirmar Identidade do Alvo
                    </span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono group-hover:text-primary transition font-bold">
                    {auditChecklist.identity ? 'SIM' : 'PENDENTE'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setAuditChecklist(prev => ({ ...prev, ipProxy: !prev.ipProxy }))}
                  className="w-full flex items-center justify-between text-left p-2 hover:bg-slate-50 border border-slate-100 rounded-lg transition text-xs group cursor-pointer"
                >
                  <span className="flex items-center gap-2 text-slate-700">
                    <span className={`w-2.5 h-2.5 rounded-full ${auditChecklist.ipProxy ? 'bg-[#1e7d5d]' : 'bg-slate-300'}`} />
                    <span className={auditChecklist.ipProxy ? 'line-through text-slate-400 font-normal' : 'font-medium'}>
                      Mapear Proxy de Dispositivo
                    </span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono group-hover:text-primary transition font-bold">
                    {auditChecklist.ipProxy ? 'SIM' : 'PENDENTE'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setAuditChecklist(prev => ({ ...prev, smurfing: !prev.smurfing }))}
                  className="w-full flex items-center justify-between text-left p-2 hover:bg-slate-50 border border-slate-100 rounded-lg transition text-xs group cursor-pointer"
                >
                  <span className="flex items-center gap-2 text-slate-700">
                    <span className={`w-2.5 h-2.5 rounded-full ${auditChecklist.smurfing ? 'bg-[#1e7d5d]' : 'bg-slate-300'}`} />
                    <span className={auditChecklist.smurfing ? 'line-through text-slate-400 font-normal' : 'font-medium'}>
                      Identificar Pulverização (Smurfing)
                    </span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono group-hover:text-primary transition font-bold">
                    {auditChecklist.smurfing ? 'SIM' : 'PENDENTE'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setAuditChecklist(prev => ({ ...prev, pepSanction: !prev.pepSanction }))}
                  className="w-full flex items-center justify-between text-left p-2 hover:bg-slate-50 border border-slate-100 rounded-lg transition text-xs group cursor-pointer"
                >
                  <span className="flex items-center gap-2 text-slate-700">
                    <span className={`w-2.5 h-2.5 rounded-full ${auditChecklist.pepSanction ? 'bg-[#1e7d5d]' : 'bg-slate-300'}`} />
                    <span className={auditChecklist.pepSanction ? 'line-through text-slate-400 font-normal' : 'font-medium'}>
                      Verificar Restrições PEP / Sanções
                    </span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono group-hover:text-primary transition font-bold">
                    {auditChecklist.pepSanction ? 'SIM' : 'PENDENTE'}
                  </span>
                </button>
              </div>
            </div>

            {/* Selected Node Inspector / Details */}
            {selectedNode ? (
              <>
                <div className="bg-white border border-[#e5e5e7] rounded-xl p-4 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <span className="text-[10px] font-bold text-[#8e8e93] uppercase tracking-wider">Perfil em Auditoria</span>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      selectedNode.riskLevel === 'high'
                        ? 'bg-red-50 text-red-700 border border-red-100'
                        : 'bg-amber-50 text-amber-700 border border-amber-100'
                    }`}>
                      {selectedNode.riskLevel === 'high' ? 'Alto Risco' : 'Médio Risco'}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-text-primary leading-tight font-display text-[#1d1d1f]">{selectedNode.label}</h4>
                    <p className="text-[10px] text-[#8e8e93] font-mono mt-1 tracking-wider">ID: {selectedNode.id}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-[11px] border-t border-slate-100 pt-3.5">
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <p className="text-[#8e8e93] font-bold uppercase text-[9px]">Classe</p>
                      <p className="font-bold text-slate-800 mt-1 capitalize">{selectedNode.type === 'ip_address' ? 'IP Secundário' : 'Indivíduo'}</p>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <p className="text-[#8e8e93] font-bold uppercase text-[9px]">Vínculos</p>
                      <p className="font-bold text-slate-800 mt-1">
                        {edges.filter(e => e.source === selectedNode.id || e.target === selectedNode.id).length} conexões
                      </p>
                    </div>
                  </div>

                  {/* Secure Gemini Connection AI Summary button inside target card */}
                  {(selectedNode.id === 'target-malik' || selectedNode.id.startsWith('target-')) && (
                    <div className="pt-1">
                      {!aiReport ? (
                        <button
                          onClick={() => handleTriggerAiAnalysis(selectedNode)}
                          disabled={isAiLoading}
                          className="w-full bg-[#f0f9ff] text-sky-700 hover:bg-sky-100 border border-sky-200 py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-sky-700" />
                          <span>{isAiLoading ? 'Analisando Malhas...' : 'Diagnóstico do Alvo por IA'}</span>
                        </button>
                      ) : (
                        <div className="bg-sky-50/70 border border-sky-100 rounded-lg p-3.5 text-xs leading-relaxed text-slate-700 max-h-48 overflow-y-auto text-[11px] relative">
                          <button
                            onClick={() => setAiReport('')}
                            className="absolute top-2 right-2 p-1 rounded-md hover:bg-sky-100 text-sky-400"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                          <span className="block text-[9px] font-bold text-sky-800 uppercase mb-1.5 tracking-wider">Dossiê Analítico IA:</span>
                          {aiReport}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Workflows Action Buttons - Designed beautiful 2-column tactile layout */}
                <div className="bg-white border border-[#e5e5e7] rounded-xl p-4 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
                    <span className="font-bold text-[#8e8e93] uppercase text-[10px] tracking-wider">Ações de Workflow</span>
                    <span className="text-[#8e8e93] font-mono text-[9px]">6 disponíveis</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => executeWorkflow('Falso Positivo Confirmado', 'bg-[#2e7d32]')}
                      className="flex flex-col items-center justify-center gap-1.5 p-3 text-center bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-[11px] font-bold transition cursor-pointer"
                    >
                      <CheckCircle className="w-4 h-4 text-[#2e7d32]" />
                      <span>Falso Positivo</span>
                    </button>

                    <button
                      onClick={() => executeWorkflow('Positivo Verdadeiro Confirmado', 'bg-[#e53935]')}
                      className="flex flex-col items-center justify-center gap-1.5 p-3 text-center bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-[11px] font-bold transition cursor-pointer"
                    >
                      <Target className="w-4 h-4 text-[#e53935]" />
                      <span>Positivo Verdadeiro</span>
                    </button>

                    <button
                      onClick={() => executeWorkflow('Caso Encerrado (Sem Decisão)', 'bg-[#263238]')}
                      className="flex flex-col items-center justify-center gap-1.5 p-3 text-center bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-[11px] font-bold transition cursor-pointer"
                    >
                      <X className="w-4 h-4 text-[#263238]" />
                      <span>Sem Decisão</span>
                    </button>

                    <button
                      onClick={() => executeWorkflow('Dossiê de Caso Criado', 'bg-[#1e88e5]')}
                      className="flex flex-col items-center justify-center gap-1.5 p-3 text-center bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-[11px] font-bold transition cursor-pointer"
                    >
                      <FolderOpen className="w-4 h-4 text-[#1e88e5]" />
                      <span>Criar Caso</span>
                    </button>

                    <button
                      onClick={() => executeWorkflow('Escalado para Nível L2', 'bg-[#1a237e]')}
                      className="flex flex-col items-center justify-center gap-1.5 p-3 text-center bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-[11px] font-bold transition cursor-pointer col-span-2"
                    >
                      <ChevronUp className="w-4 h-4 text-[#1a237e]" />
                      <span>Escalar para Nível L2</span>
                    </button>
                  </div>
                </div>

                {/* Comments Log threads */}
                <div className="bg-white border border-[#e5e5e7] rounded-xl p-4 space-y-4 shadow-xs">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#8e8e93] uppercase tracking-widest border-b border-slate-100 pb-2">
                    <MessageSquare className="w-4 h-4 text-gray-400" />
                    <span>Histórico ({commentsList.length})</span>
                  </div>

                  <div className="space-y-3 max-h-60 overflow-y-auto pr-1 font-sans">
                    {commentsList.length === 0 ? (
                      <p className="text-[#8e8e93] text-center py-6 text-[10px] uppercase font-bold tracking-wider italic">Nenhum registro para este perfil</p>
                    ) : (
                      commentsList.map((item) => (
                        <div key={item.id} className="bg-[#f8f8fa] border border-slate-100 p-3 rounded-lg text-[11px] leading-relaxed">
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${
                                item.avatar === 'S' || item.author === 'SISTEMA' ? 'bg-[#37474f]' : 'bg-[#2e7d32]'
                              }`}>
                                {item.avatar}
                              </span>
                              <div>
                                <p className="font-bold text-slate-800 leading-none">{item.author}</p>
                                <p className="text-[9px] text-[#8e8e93] font-medium mt-0.5">{item.role}</p>
                              </div>
                            </div>
                            <span className="text-[9px] text-[#8e8e93] font-mono">{item.timestamp.split(' ')[1] || item.timestamp}</span>
                          </div>
                          <p className="text-[#3a3a3c] pl-7">{item.text}</p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add Comment input form */}
                  <form onSubmit={handleAddComment} className="flex gap-2 pt-1 border-t border-slate-100">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Novo comentário..."
                      className="flex-1 px-3 py-2 border border-[#e5e5e7] focus:border-primary rounded-lg text-xs outline-none bg-[#fbfbfc] hover:bg-white focus:bg-white transition"
                    />
                    <button
                      type="submit"
                      disabled={!newComment.trim()}
                      className="bg-primary hover:bg-primary/95 text-white px-3 py-2 rounded-lg disabled:opacity-50 transition cursor-pointer shrink-0 flex items-center justify-center"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="bg-white border border-[#e5e5e7] p-8 rounded-xl text-center space-y-4 shadow-2xs">
                <div className="w-12 h-12 bg-[#003526]/5 rounded-full flex items-center justify-center mx-auto border border-[#003526]/10">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest font-display">Fila Vazia ou Selecione Perfil</h3>
                  <p className="text-[11px] text-[#8e8e93] leading-relaxed max-w-[210px] mx-auto">
                    A fila atual não possui nó em inspeção direta. Selecione uma entidade no grafo interativo para carregar as notas, o AI Report e ações de workflow.
                  </p>
                </div>
              </div>
            )}

          </div>

          <div className="p-4 bg-slate-100 border-t border-[#e5e5e7] text-center text-[9px] text-[#8e8e93] select-none font-mono tracking-wider">
            MEDUSA RADAR CASE CONTEXT • LIVE AUDIT
          </div>
        </aside>

      </div>
    </div>
  );
}
