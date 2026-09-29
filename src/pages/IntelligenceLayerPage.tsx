import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  RotateCcw,
  Search,
  ExternalLink,
  Layers,
  Network,
  FolderTree,
  CheckSquare,
  Square,
  ArrowLeft,
  SlidersHorizontal,
  Info,
  X
} from 'lucide-react';
import CodebaseMemory3DView, { CodebaseNode, NODE_COLORS } from '@/components/intelligence/CodebaseMemory3DView';
import Logo from '@/components/brand/Logo';
import graphData from '@/data/codebaseMemoryData.json';

export default function IntelligenceLayerPage() {
  // All initial node labels active
  const initialLabels = useMemo(() => new Set(Object.keys(graphData.nodeCounts)), []);
  // All initial edge types active
  const initialEdgeTypes = useMemo(() => new Set(Object.keys(graphData.edgeCounts)), []);

  const [activeLabels, setActiveLabels] = useState<Set<string>>(initialLabels);
  const [activeEdgeTypes, setActiveEdgeTypes] = useState<Set<string>>(initialEdgeTypes);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDirectory, setSelectedDirectory] = useState<string | null>(null);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [hoveredNode, setHoveredNode] = useState<CodebaseNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<CodebaseNode | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState<boolean>(false);

  // Directory listing with counts
  const directories = [
    { name: 'src', count: 571, sub: ['components', 'features', 'content', 'services', 'pages', 'utils'] },
    { name: 'server', count: 52, sub: ['leads'] },
    { name: '.project-intelligence', count: 48, sub: ['knowledge', 'decisions', 'reports'] },
    { name: 'functions', count: 5, sub: ['src'] },
    { name: 'public', count: 5, sub: [] },
    { name: 'scripts', count: 4, sub: [] }
  ];

  // Filter actions
  const selectAllFilters = () => {
    setActiveLabels(new Set(Object.keys(graphData.nodeCounts)));
    setActiveEdgeTypes(new Set(Object.keys(graphData.edgeCounts)));
    setSelectedDirectory(null);
  };

  const selectNoneFilters = () => {
    setActiveLabels(new Set());
    setActiveEdgeTypes(new Set());
  };

  const toggleLabel = (label: string) => {
    setActiveLabels((prev) => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  };

  const toggleEdgeType = (edgeType: string) => {
    setActiveEdgeTypes((prev) => {
      const next = new Set(prev);
      if (next.has(edgeType)) {
        next.delete(edgeType);
      } else {
        next.add(edgeType);
      }
      return next;
    });
  };

  const activeInspectNode = selectedNode || hoveredNode;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0a0d14] text-[#e6e8ec] font-sans select-none">
      {/* =========================================================================
          TOP NAVBAR: MATCHING CODEBASE MEMORY HEADER
         ========================================================================= */}
      <header className="h-12 shrink-0 border-b border-[#1f2430] bg-[#0c1017] px-4 flex items-center justify-between text-xs z-30">
        {/* Left: Website Logo & Live Memory Indicator */}
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-2 sm:gap-2.5 group cursor-pointer hover:opacity-90 transition-opacity"
            aria-label="Abdullah Malik Consultancy — Home"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#00FF66] shadow-[0_0_8px_#00FF66]" />
            <Logo tone="white" tagline={false} className="text-xs sm:text-sm tracking-wide" />
            <span className="hidden sm:inline text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-white/60">
              WEBSITE MEMORY
            </span>
          </Link>
        </div>

        {/* Right: Project Title, Counts & Refresh */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden md:flex items-center gap-2 font-mono text-[11px] text-white/50 bg-[#141923] px-3 py-1 rounded-md border border-[#232936]">
            <span className="text-[#00F0FF]">GRAPH</span>
            <span className="text-white/80 font-bold truncate max-w-xs">malikconsultancywebsite</span>
          </div>

          <div className="text-[10px] sm:text-[11px] font-mono text-white/60">
            <span className="text-[#00FF66] font-bold">{graphData.totalNodes.toLocaleString()}</span>
            <span className="hidden sm:inline"> nodes</span> /{' '}
            <span className="text-[#00F0FF] font-bold">{graphData.totalEdges.toLocaleString()}</span>
            <span className="hidden sm:inline"> edges</span>
          </div>

          <button
            onClick={() => {
              selectAllFilters();
              setSelectedNode(null);
            }}
            title="Reset Graph Filters & Camera"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded bg-[#1b2230] hover:bg-[#252f42] text-white/80 hover:text-white border border-[#2d374d] text-xs font-mono transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3 text-[#00F0FF]" />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={() => setMobileFiltersOpen((prev) => !prev)}
            className="md:hidden flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1b2230] text-[#00F0FF] border border-[#2d374d] text-xs font-mono cursor-pointer"
          >
            <SlidersHorizontal className="w-3 h-3" />
            <span>Filters</span>
          </button>

          <Link
            to="/"
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#00F0FF]/15 hover:bg-[#00F0FF]/25 text-[#00F0FF] border border-[#00F0FF]/30 text-xs font-mono font-bold transition-all"
          >
            <ArrowLeft className="w-3 h-3" />
            <span className="hidden sm:inline">Return to Site</span>
          </Link>
        </div>
      </header>

      {/* =========================================================================
          MAIN WORKSPACE: SIDEBAR FILTERS + 3D KNOWLEDGE GRAPH
         ========================================================================= */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* --- LEFT SIDEBAR: FILTERS & EXPLORER --- */}
        <aside
          style={{ backgroundColor: '#0a0d14', borderColor: '#1e293b' }}
          className={`fixed md:relative top-12 md:top-0 bottom-0 left-0 w-80 shrink-0 border-r flex flex-col justify-between overflow-y-auto text-xs z-30 transition-transform duration-300 ${
            mobileFiltersOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
        >
          <div className="p-4 space-y-6">
            {/* Header / Actions */}
            <div style={{ borderColor: '#1e293b' }} className="flex items-center justify-between pb-2 border-b">
              <span style={{ color: '#94a3b8' }} className="font-mono text-xs uppercase tracking-widest font-bold">
                FILTERS
              </span>
              <div className="flex items-center gap-3 text-xs font-mono">
                <button
                  onClick={selectAllFilters}
                  style={{ color: '#38bdf8' }}
                  className="hover:underline cursor-pointer font-semibold"
                >
                  All
                </button>
                <span style={{ color: '#334155' }}>|</span>
                <button
                  onClick={selectNoneFilters}
                  style={{ color: '#64748b' }}
                  className="hover:text-white cursor-pointer"
                >
                  None
                </button>
              </div>
            </div>

            {/* NODES FILTERS */}
            <div>
              <div style={{ color: '#94a3b8' }} className="font-mono text-[11px] uppercase tracking-wider mb-2.5">
                Nodes
              </div>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(graphData.nodeCounts).map(([label, count]) => {
                  const isActive = activeLabels.has(label);
                  const color = NODE_COLORS[label] || '#38bdf8';

                  return (
                    <button
                      key={label}
                      onClick={() => toggleLabel(label)}
                      style={{
                        backgroundColor: isActive ? '#172033' : '#0b0f19',
                        borderColor: isActive ? color : '#1e293b',
                        color: isActive ? '#f8fafc' : '#64748b'
                      }}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono border transition-all cursor-pointer shadow-xs"
                    >
                      <span
                        className="w-2 h-2 rounded-full inline-block"
                        style={{ backgroundColor: color }}
                      />
                      <span className="font-medium">{label}</span>
                      <span style={{ color: isActive ? '#94a3b8' : '#475569' }} className="text-[10px]">
                        {count.toLocaleString()}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* EDGES FILTERS */}
            <div>
              <div style={{ color: '#94a3b8' }} className="font-mono text-[11px] uppercase tracking-wider mb-2.5">
                Edges
              </div>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(graphData.edgeCounts).map(([etype, count]) => {
                  const isActive = activeEdgeTypes.has(etype);

                  return (
                    <button
                      key={etype}
                      onClick={() => toggleEdgeType(etype)}
                      style={{
                        backgroundColor: isActive ? '#172554' : '#0b1329',
                        borderColor: isActive ? '#3b82f6' : '#1e293b',
                        color: isActive ? '#93c5fd' : '#475569'
                      }}
                      className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono border transition-all cursor-pointer"
                    >
                      <span>{etype.toLowerCase().replace(/_/g, ' ')}</span>
                      <span style={{ color: isActive ? '#bfdbfe' : '#334155' }}>
                        {count.toLocaleString()}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SHOW LABELS TOGGLE */}
            <div style={{ borderColor: '#1e293b' }} className="pt-2 border-t">
              <label style={{ color: '#cbd5e1' }} className="flex items-center gap-2 cursor-pointer text-xs font-mono hover:text-white">
                <input
                  type="checkbox"
                  checked={showLabels}
                  onChange={(e) => setShowLabels(e.target.checked)}
                  className="rounded border-[#2a3449] bg-[#141a26] text-[#00F0FF] focus:ring-0"
                />
                <span>Show labels in 3D</span>
              </label>
            </div>

            {/* SEARCH INPUT */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#64748b]" />
              <input
                type="text"
                placeholder="Search nodes, variables, files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ backgroundColor: '#131926', borderColor: '#1e293b', color: '#f8fafc' }}
                className="w-full border rounded-lg pl-8 pr-3 py-1.5 text-xs font-mono placeholder-[#64748b] focus:outline-none focus:border-[#38bdf8]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-[#64748b] hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* DIRECTORY EXPLORER TREE */}
            <div>
              <div style={{ color: '#94a3b8' }} className="font-mono text-[11px] uppercase tracking-wider mb-2">
                Subsystems & Folders
              </div>
              <div className="space-y-1 font-mono text-xs">
                {directories.map((dir) => {
                  const isSelected = selectedDirectory === dir.name;
                  return (
                    <div key={dir.name}>
                      <button
                        onClick={() => setSelectedDirectory(isSelected ? null : dir.name)}
                        style={{
                          backgroundColor: isSelected ? '#1e293b' : 'transparent',
                          color: isSelected ? '#38bdf8' : '#cbd5e1'
                        }}
                        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-left transition-colors cursor-pointer hover:bg-[#1e293b]"
                      >
                        <span className="truncate flex items-center gap-1.5">
                          <span style={{ color: '#38bdf8' }}>•</span> {dir.name}
                        </span>
                        <span style={{ color: '#64748b' }} className="text-[11px]">
                          {dir.count}
                        </span>
                      </button>

                      {/* Sub-branches */}
                      {isSelected && dir.sub.length > 0 && (
                        <div style={{ borderColor: '#1e293b', color: '#94a3b8' }} className="pl-4 py-1 space-y-0.5 border-l ml-2 text-[11px]">
                          {dir.sub.map((s) => (
                            <div
                              key={s}
                              onClick={() => setSearchQuery(s)}
                              className="px-1.5 py-0.5 hover:text-[#38bdf8] cursor-pointer truncate"
                            >
                              ↳ {s}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar Footer info */}
          <div style={{ backgroundColor: '#070a0f', borderColor: '#1e293b', color: '#475569' }} className="p-4 border-t text-[10px] font-mono">
            <div>AST PERSISTENCE: .codebase-memory</div>
            <div>COMPRESSION: zstd Level 9</div>
          </div>
        </aside>

        {/* --- CENTER 3D VIEWPORT --- */}
        <main className="flex-1 relative h-full w-full overflow-hidden">
          <CodebaseMemory3DView
            activeLabels={activeLabels}
            activeEdgeTypes={activeEdgeTypes}
            searchQuery={searchQuery}
            selectedDirectory={selectedDirectory}
            showLabels={showLabels}
            onSelectNode={setSelectedNode}
            hoveredNode={hoveredNode}
            setHoveredNode={setHoveredNode}
          />

          {/* FLOATING HOVER / CLICK INSPECTOR CARD (MATCHING CODEBASE MEMORY TOOLTIP) */}
          {activeInspectNode && (
            <div className="absolute top-6 left-6 z-30 max-w-sm rounded-xl border border-white/20 bg-[#0e131d]/90 p-4 shadow-2xl backdrop-blur-xl transition-all">
              <div className="flex items-center justify-between gap-3 mb-2">
                <span
                  className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded font-bold"
                  style={{
                    backgroundColor: `${NODE_COLORS[activeInspectNode.label] || '#38bdf8'}20`,
                    color: NODE_COLORS[activeInspectNode.label] || '#38bdf8'
                  }}
                >
                  {activeInspectNode.label}
                </span>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-white/40">
                    ID #{activeInspectNode.id}
                  </span>
                  {selectedNode && (
                    <button
                      onClick={() => setSelectedNode(null)}
                      className="text-white/40 hover:text-white cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <h3 className="text-sm font-mono font-bold text-white mb-1.5 break-all">
                {activeInspectNode.name}
              </h3>

              {activeInspectNode.file && (
                <div className="text-[11px] font-mono text-[#00F0FF] mb-2 truncate">
                  📄 {activeInspectNode.file}
                  {activeInspectNode.startLine > 0 && `:${activeInspectNode.startLine}`}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-[10px] font-mono text-white/60">
                <div>FAN-IN: {activeInspectNode.inDegree || 0}</div>
                <div>FAN-OUT: {activeInspectNode.outDegree || 0}</div>
              </div>
            </div>
          )}

          {/* BOTTOM CONTROLS HINT */}
          <div className="pointer-events-none absolute bottom-4 right-4 z-20 flex items-center gap-3 px-3 py-1.5 rounded-lg border border-white/10 bg-[#0c1017]/80 backdrop-blur-md text-[10px] font-mono text-white/50">
            <span>[LEFT DRAG: ORBIT]</span>
            <span>[RIGHT DRAG: PAN]</span>
            <span>[SCROLL: ZOOM]</span>
            <span>[CLICK: INSPECT]</span>
          </div>
        </main>
      </div>
    </div>
  );
}
