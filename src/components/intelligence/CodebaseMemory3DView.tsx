import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import graphData from '@/data/codebaseMemoryData.json';

export interface CodebaseNode {
  id: number;
  originalId: number;
  label: string;
  name: string;
  qualifiedName: string;
  file: string;
  startLine: number;
  endLine: number;
  inDegree?: number;
  outDegree?: number;
}

export interface CodebaseEdge {
  source: number;
  target: number;
  type: string;
}

interface CodebaseMemory3DViewProps {
  activeLabels: Set<string>;
  activeEdgeTypes: Set<string>;
  searchQuery: string;
  selectedDirectory: string | null;
  showLabels: boolean;
  onSelectNode?: (node: CodebaseNode | null) => void;
  hoveredNode: CodebaseNode | null;
  setHoveredNode: (node: CodebaseNode | null) => void;
}

export const NODE_COLORS: Record<string, string> = {
  Function: '#38bdf8', // Light Blue
  Variable: '#22d3ee', // Cyan
  File: '#818cf8',     // Indigo
  Module: '#fb923c',   // Orange
  Section: '#94a3b8',  // Slate
  Interface: '#c084fc',// Purple
  Folder: '#4ade80',   // Green
  Type: '#e879f9',     // Fuchsia
  Route: '#fbbf24',    // Gold / Amber
  EnvVar: '#f43f5e',   // Rose
  Method: '#2dd4bf',   // Teal
  Class: '#facc15',    // Bright Yellow
  Project: '#ffffff',  // White
  Branch: '#a78bfa'    // Lilac
};

export default function CodebaseMemory3DView({
  activeLabels,
  activeEdgeTypes,
  searchQuery,
  selectedDirectory,
  showLabels,
  onSelectNode,
  hoveredNode,
  setHoveredNode
}: CodebaseMemory3DViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const controlsRef = useRef<OrbitControls | null>(null);
  const pointsRef = useRef<THREE.Points | null>(null);
  const linesRef = useRef<THREE.LineSegments | null>(null);
  const nodesMapRef = useRef<Map<number, CodebaseNode>>(new Map());
  const nodePositionsRef = useRef<Float32Array | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  // Compute 3D Coordinates for all 1,309 nodes
  const nodeCoords = useMemo(() => {
    const rawNodes = graphData.nodes as CodebaseNode[];
    const coords: Array<{ x: number; y: number; z: number }> = [];

    // Group nodes by directory and cluster
    rawNodes.forEach((node, i) => {
      nodesMapRef.current.set(node.id, node);

      let radius = 28;
      let theta = (i / rawNodes.length) * Math.PI * 2 * 13;
      let phi = Math.acos(2 * (i / rawNodes.length) - 1);

      // Core modules cluster more densely in white-hot hubs
      const isCore =
        node.file.includes('components/service') ||
        node.file.includes('server/leads') ||
        node.file.includes('features/seo') ||
        node.file.includes('admin');

      const isServer = node.file.startsWith('server');
      const isFeatures = node.file.includes('features');
      const isComponents = node.file.includes('components');

      if (isCore) {
        radius = 12 + ((node.id * 17) % 10);
      } else if (isServer) {
        radius = 18 + ((node.id * 13) % 12);
      } else if (isFeatures || isComponents) {
        radius = 22 + ((node.id * 19) % 14);
      } else {
        radius = 26 + ((node.id * 23) % 16);
      }

      // Add regional offsets so subsystems form visible constellations
      let offsetX = 0;
      let offsetY = 0;
      let offsetZ = 0;

      if (node.file.includes('leads')) {
        offsetX = 8;
        offsetY = 10;
        offsetZ = -4;
      } else if (node.file.includes('seo')) {
        offsetX = -12;
        offsetY = 6;
        offsetZ = 8;
      } else if (node.file.includes('components/service')) {
        offsetX = 6;
        offsetY = -12;
        offsetZ = 10;
      } else if (node.file.includes('admin')) {
        offsetX = -8;
        offsetY = -8;
        offsetZ = -10;
      }

      const x = radius * Math.sin(phi) * Math.cos(theta) + offsetX;
      const y = radius * Math.sin(phi) * Math.sin(theta) + offsetY;
      const z = radius * Math.cos(phi) + offsetZ;

      coords.push({ x, y, z });
    });

    return coords;
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // --- 1. Scene, Camera, Renderer ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0d14, 0.012);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 4, 48);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x0a0d14, 1);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    container.appendChild(renderer.domElement);

    const canvas = renderer.domElement;

    // --- 2. OrbitControls ---
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.35;
    controls.maxDistance = 180;
    controls.minDistance = 10;
    controlsRef.current = controls;

    // Stop auto-rotation when user interacts
    controls.addEventListener('start', () => {
      controls.autoRotate = false;
    });

    const graphGroup = new THREE.Group();
    scene.add(graphGroup);

    // --- 3. Build Nodes ---
    const rawNodes = graphData.nodes as CodebaseNode[];
    const nodeCount = rawNodes.length;

    const positions = new Float32Array(nodeCount * 3);
    const colors = new Float32Array(nodeCount * 3);
    const sizes = new Float32Array(nodeCount);

    rawNodes.forEach((node, i) => {
      const pos = nodeCoords[i];
      positions[i * 3] = pos.x;
      positions[i * 3 + 1] = pos.y;
      positions[i * 3 + 2] = pos.z;

      const baseHex = NODE_COLORS[node.label] || '#38bdf8';
      const c = new THREE.Color(baseHex);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;

      // Degree determines physical node scale
      const degree = (node.inDegree || 0) + (node.outDegree || 0);
      sizes[i] = Math.max(3.0, Math.min(10.0, 3.0 + degree * 0.4));
    });

    nodePositionsRef.current = positions;

    // Glowing Node Texture
    const createGlowingCircle = () => {
      const cvs = document.createElement('canvas');
      cvs.width = 128;
      cvs.height = 128;
      const ctx = cvs.getContext('2d');
      if (!ctx) return null;

      const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.2, 'rgba(255, 255, 255, 0.95)');
      grad.addColorStop(0.5, 'rgba(56, 189, 248, 0.75)');
      grad.addColorStop(0.75, 'rgba(192, 132, 252, 0.3)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 128, 128);

      const tex = new THREE.CanvasTexture(cvs);
      tex.flipY = false;
      return tex;
    };

    const nodeTexture = createGlowingCircle();

    const pointsGeometry = new THREE.BufferGeometry();
    pointsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    pointsGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    pointsGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const pointsMaterial = new THREE.PointsMaterial({
      size: 5.6,
      map: nodeTexture || undefined,
      transparent: true,
      opacity: 0.98,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const points = new THREE.Points(pointsGeometry, pointsMaterial);
    graphGroup.add(points);
    pointsRef.current = points;

    // --- 4. Build Edges ---
    const rawEdges = graphData.edges as CodebaseEdge[];
    const edgePositions = new Float32Array(rawEdges.length * 2 * 3);
    const edgeColors = new Float32Array(rawEdges.length * 2 * 3);

    rawEdges.forEach((edge, eIdx) => {
      const pA = nodeCoords[edge.source];
      const pB = nodeCoords[edge.target];
      if (!pA || !pB) return;

      const idx = eIdx * 6;
      edgePositions[idx] = pA.x;
      edgePositions[idx + 1] = pA.y;
      edgePositions[idx + 2] = pA.z;
      edgePositions[idx + 3] = pB.x;
      edgePositions[idx + 4] = pB.y;
      edgePositions[idx + 5] = pB.z;

      const nodeA = rawNodes[edge.source];
      const nodeB = rawNodes[edge.target];
      const colA = new THREE.Color(NODE_COLORS[nodeA?.label] || '#38bdf8').multiplyScalar(0.65);
      const colB = new THREE.Color(NODE_COLORS[nodeB?.label] || '#c084fc').multiplyScalar(0.65);

      edgeColors[idx] = colA.r;
      edgeColors[idx + 1] = colA.g;
      edgeColors[idx + 2] = colA.b;
      edgeColors[idx + 3] = colB.r;
      edgeColors[idx + 4] = colB.g;
      edgeColors[idx + 5] = colB.b;
    });

    const linesGeometry = new THREE.BufferGeometry();
    linesGeometry.setAttribute('position', new THREE.BufferAttribute(edgePositions, 3));
    linesGeometry.setAttribute('color', new THREE.BufferAttribute(edgeColors, 3));

    const linesMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.52,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const lineSegments = new THREE.LineSegments(linesGeometry, linesMaterial);
    graphGroup.add(lineSegments);
    linesRef.current = lineSegments;

    // --- 5. Dense Radiant Core Nebulae ---
    // Generate extra volumetric white-hot glow clusters around major module clusters
    const coreNebulaeGeom = new THREE.BufferGeometry();
    const nebulaeCount = 180;
    const nebulaePositions = new Float32Array(nebulaeCount * 3);
    const nebulaeColors = new Float32Array(nebulaeCount * 3);

    for (let k = 0; k < nebulaeCount; k++) {
      const hubIdx = Math.floor(Math.random() * 4);
      const hubCenters = [
        new THREE.Vector3(8, 10, -4),   // leads hub
        new THREE.Vector3(-12, 6, 8),   // seo hub
        new THREE.Vector3(6, -12, 10),  // service layout hub
        new THREE.Vector3(-8, -8, -10)  // admin hub
      ];
      const center = hubCenters[hubIdx];
      const r = 5.5;

      nebulaePositions[k * 3] = center.x + (Math.random() - 0.5) * r;
      nebulaePositions[k * 3 + 1] = center.y + (Math.random() - 0.5) * r;
      nebulaePositions[k * 3 + 2] = center.z + (Math.random() - 0.5) * r;

      nebulaeColors[k * 3] = 1.0;
      nebulaeColors[k * 3 + 1] = 0.95;
      nebulaeColors[k * 3 + 2] = 1.0;
    }

    coreNebulaeGeom.setAttribute('position', new THREE.BufferAttribute(nebulaePositions, 3));
    coreNebulaeGeom.setAttribute('color', new THREE.BufferAttribute(nebulaeColors, 3));

    const nebulaeMaterial = new THREE.PointsMaterial({
      size: 7.5,
      map: nodeTexture || undefined,
      transparent: true,
      opacity: 0.5,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const nebulaePoints = new THREE.Points(coreNebulaeGeom, nebulaeMaterial);
    graphGroup.add(nebulaePoints);

    // --- 6. Raycaster for Hover & Selection ---
    const raycaster = new THREE.Raycaster();
    raycaster.params.Points = { threshold: 2.2 };
    const pointerNDC = new THREE.Vector2(-1000, -1000);

    const handlePointerMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointerNDC.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointerNDC.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const handleClick = () => {
      if (!camera || !points) return;
      raycaster.setFromCamera(pointerNDC, camera);
      const intersects = raycaster.intersectObject(points);

      if (intersects.length > 0 && intersects[0].index !== undefined) {
        const clickedNode = rawNodes[intersects[0].index];
        onSelectNode?.(clickedNode);
      }
    };

    canvas.addEventListener('mousemove', handlePointerMove);
    canvas.addEventListener('click', handleClick);

    // --- 7. Animation Loop ---
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      controls.update();

      // Check hover
      raycaster.setFromCamera(pointerNDC, camera);
      const intersects = raycaster.intersectObject(points);

      if (intersects.length > 0 && intersects[0].index !== undefined) {
        const found = rawNodes[intersects[0].index];
        if (found.id !== hoveredNode?.id) {
          setHoveredNode(found);
        }
      } else if (hoveredNode !== null) {
        setHoveredNode(null);
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handlePointerMove);
      canvas.removeEventListener('click', handleClick);
      controls.dispose();
      pointsGeometry.dispose();
      pointsMaterial.dispose();
      linesGeometry.dispose();
      linesMaterial.dispose();
      coreNebulaeGeom.dispose();
      nebulaeMaterial.dispose();
      if (nodeTexture) nodeTexture.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Update dynamic visibility and colors when filters change
  useEffect(() => {
    if (!pointsRef.current || !linesRef.current) return;

    const rawNodes = graphData.nodes as CodebaseNode[];
    const rawEdges = graphData.edges as CodebaseEdge[];

    const pointsGeom = pointsRef.current.geometry;
    const linesGeom = linesRef.current.geometry;

    const colorAttr = pointsGeom.attributes.color as THREE.BufferAttribute;
    const edgeColorAttr = linesGeom.attributes.color as THREE.BufferAttribute;

    const queryLower = searchQuery.toLowerCase().trim();

    // Determine matching nodes
    const isNodeActive = (node: CodebaseNode) => {
      if (!activeLabels.has(node.label)) return false;
      if (selectedDirectory && !node.file.startsWith(selectedDirectory)) return false;
      if (queryLower) {
        return (
          node.name.toLowerCase().includes(queryLower) ||
          node.file.toLowerCase().includes(queryLower) ||
          node.label.toLowerCase().includes(queryLower)
        );
      }
      return true;
    };

    const activeNodeSet = new Set<number>();

    rawNodes.forEach((node, i) => {
      const active = isNodeActive(node);
      if (active) activeNodeSet.add(node.id);

      const baseHex = NODE_COLORS[node.label] || '#38bdf8';
      const c = new THREE.Color(baseHex);

      if (active) {
        // High radiance for matching nodes
        c.multiplyScalar(1.2);
      } else {
        // Dim down to dark ghost state
        c.multiplyScalar(0.08);
      }

      colorAttr.setXYZ(i, c.r, c.g, c.b);
    });

    colorAttr.needsUpdate = true;

    // Update lines matching active edge types and active connected nodes
    rawEdges.forEach((edge, eIdx) => {
      const idx = eIdx * 6;
      const edgeTypeActive = activeEdgeTypes.has(edge.type);
      const nodesActive = activeNodeSet.has(edge.source) && activeNodeSet.has(edge.target);
      const isVisible = edgeTypeActive && nodesActive;

      const nodeA = rawNodes[edge.source];
      const nodeB = rawNodes[edge.target];
      const colA = new THREE.Color(NODE_COLORS[nodeA?.label] || '#38bdf8');
      const colB = new THREE.Color(NODE_COLORS[nodeB?.label] || '#c084fc');

      if (isVisible) {
        colA.multiplyScalar(0.4);
        colB.multiplyScalar(0.4);
      } else {
        colA.setRGB(0.01, 0.02, 0.04);
        colB.setRGB(0.01, 0.02, 0.04);
      }

      edgeColorAttr.setXYZ(idx, colA.r, colA.g, colA.b);
      edgeColorAttr.setXYZ(idx + 1, colB.r, colB.g, colB.b);
    });

    edgeColorAttr.needsUpdate = true;
  }, [activeLabels, activeEdgeTypes, searchQuery, selectedDirectory]);

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden bg-[#0a0d14] cursor-grab active:cursor-grabbing" />
  );
}
