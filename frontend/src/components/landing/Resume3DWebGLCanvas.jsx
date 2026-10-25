/**
 * Resume3DWebGLCanvas.jsx — High-fidelity interactive WebGL 3D scene powered by Three.js.
 *
 * Features:
 * - Photorealistic 3D document model with physical depth and specular highlights.
 * - Exploding 3D layer planes during Chapter 2 (Evidence).
 * - Real-time animated ATS laser scanner beam with volumetric glow.
 * - Floating 3D holographic score ring with orbiting data particle.
 * - Interactive mouse parallax, lighting tracking, and drag-to-rotate orbital controls.
 * - Ambient 3D particle constellation drifting through depth.
 * - Full chapter interpolation (rotations, layer offsets, camera zooms).
 */

import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

export default function Resume3DWebGLCanvas({ activeChapter = 0, reducedMotion = false }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const docGroupRef = useRef(null);
  const layersRef = useRef([]);
  const laserRef = useRef(null);
  const scoreRingRef = useRef(null);
  const particlesRef = useRef(null);
  const pointLightRef = useRef(null);
  const requestRef = useRef(null);

  // Mouse & Drag State
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const dragRotationRef = useRef({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Target chapter transformations
  const CHAPTER_TARGETS = [
    // 0: Potential (Tilted, floating, mystery)
    { rx: 0.28, ry: -0.38, rz: 0.05, tz: 0, explode: 0, laser: false, ring: false },
    // 1: Clarity (Upright, laser scanning)
    { rx: 0.15, ry: -0.15, rz: 0.0, tz: 0.2, explode: 0, laser: true, ring: false },
    // 2: Evidence (Exploded depth planes separated along Z)
    { rx: 0.35, ry: -0.45, rz: 0.08, tz: -0.1, explode: 1.0, laser: false, ring: true },
    // 3: Rewrite (Sharp angle, focused view)
    { rx: 0.12, ry: 0.25, rz: -0.02, tz: 0.1, explode: 0.2, laser: true, ring: true },
    // 4: Final Ready (Polished, hero trophy angle)
    { rx: 0.06, ry: -0.08, rz: 0.01, tz: 0.3, explode: 0, laser: false, ring: true },
  ];

  // Helper to draw realistic high-resolution resume canvas texture
  const createResumeTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1400;
    const ctx = canvas.getContext('2d');

    // Paper background
    ctx.fillStyle = '#FCFBF7';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle paper grain pattern
    ctx.fillStyle = 'rgba(212, 210, 202, 0.15)';
    for (let i = 0; i < 800; i++) {
      const gx = Math.random() * canvas.width;
      const gy = Math.random() * canvas.height;
      ctx.fillRect(gx, gy, 2, 2);
    }

    // Outer subtle border
    ctx.strokeStyle = '#D4D2CA';
    ctx.lineWidth = 4;
    ctx.strokeRect(16, 16, canvas.width - 32, canvas.height - 32);

    // Header Name
    ctx.fillStyle = '#242523';
    ctx.font = 'bold 44px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('ALEXANDER MORGAN', 60, 110);

    // Contact info
    ctx.fillStyle = '#696A65';
    ctx.font = '22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('Senior Distributed Systems Engineer  •  San Francisco, CA  •  alex@domain.io', 60, 150);

    // Decorative separator line
    ctx.strokeStyle = '#8E9185';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(60, 175);
    ctx.lineTo(canvas.width - 60, 175);
    ctx.stroke();

    // Section 1: Executive Summary
    ctx.fillStyle = '#8E9185';
    ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('01 // PROFESSIONAL SUMMARY', 60, 225);

    ctx.fillStyle = '#343632';
    ctx.font = '20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('Architected resilient multi-tenant cloud platforms processing 250M+ requests daily.', 60, 260);
    ctx.fillText('Specialized in low-latency event pipelines, PostgreSQL indexing, and zero-trust auth.', 60, 290);

    // Section 2: Experience
    ctx.fillStyle = '#8E9185';
    ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('02 // WORK EXPERIENCE', 60, 355);

    // Job 1
    ctx.fillStyle = '#242523';
    ctx.font = 'bold 26px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('Staff Infrastructure Engineer  —  Aether Systems', 60, 395);
    ctx.fillStyle = '#8E9185';
    ctx.font = '18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('2022 — Present  •  Core Platform Team', 60, 425);

    // Bullet points
    const bullets1 = [
      '• Reduced p99 API latency by 42% through Redis cluster sharding and query memoization.',
      '• Orchestrated seamless PostgreSQL schema migrations across 18 regional database clusters.',
      '• Designed automated tenant-isolation security checks eliminating cross-tenant leakage.',
    ];
    ctx.fillStyle = '#444641';
    ctx.font = '20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    bullets1.forEach((b, idx) => {
      ctx.fillText(b, 80, 465 + idx * 34);
    });

    // Job 2
    ctx.fillStyle = '#242523';
    ctx.font = 'bold 26px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('Senior Backend Engineer  —  Vector Metrics', 60, 600);
    ctx.fillStyle = '#8E9185';
    ctx.font = '18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('2019 — 2022  •  Real-Time Analytics', 60, 630);

    const bullets2 = [
      '• Scaled streaming ingestion engine from 12k to 140k events/sec using Kafka & Go.',
      '• Built end-to-end telemetry collector with sub-second alerting and Slack webhooks.',
    ];
    ctx.fillStyle = '#444641';
    ctx.font = '20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    bullets2.forEach((b, idx) => {
      ctx.fillText(b, 80, 670 + idx * 34);
    });

    // Section 3: Technical Competencies
    ctx.fillStyle = '#8E9185';
    ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('03 // TECHNICAL COMPETENCIES', 60, 775);

    const skills = [
      'Python', 'FastAPI', 'Go', 'PostgreSQL', 'Docker',
      'Kubernetes', 'Redis', 'Kafka', 'GraphQL', 'AWS',
    ];
    let chipX = 60;
    let chipY = 810;
    skills.forEach((skill) => {
      ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      const textWidth = ctx.measureText(skill).width;
      const chipWidth = textWidth + 28;

      ctx.fillStyle = '#EDF0E8';
      ctx.strokeStyle = '#D4D2CA';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(chipX, chipY, chipWidth, 34, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#242523';
      ctx.fillText(skill, chipX + 14, chipY + 24);

      chipX += chipWidth + 12;
      if (chipX > canvas.width - 160) {
        chipX = 60;
        chipY += 46;
      }
    });

    // Section 4: Projects & Education
    ctx.fillStyle = '#8E9185';
    ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('04 // EDUCATION & RESEARCH', 60, 930);

    ctx.fillStyle = '#242523';
    ctx.font = 'bold 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('B.S. in Computer Science  —  University of California, Berkeley', 60, 965);
    ctx.fillStyle = '#696A65';
    ctx.font = '18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('Honors in Distributed Operating Systems  •  Algorithms & Data Structures TA', 60, 995);

    // Certified ATS Verified Watermark Stamp
    ctx.strokeStyle = '#8E9185';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(canvas.width - 130, canvas.height - 130, 60, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#8E9185';
    ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ATS READY', canvas.width - 130, canvas.height - 135);
    ctx.fillText('SCORE 94', canvas.width - 130, canvas.height - 115);
    ctx.textAlign = 'left';

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    return texture;
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 460;
    const height = container.clientHeight || 560;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 6.2);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xfffef9, 1.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff7ea, 2.2);
    dirLight.position.set(4, 6, 5);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight(0xdde1d4, 1.2);
    rimLight.position.set(-5, -3, -2);
    scene.add(rimLight);

    const pointLight = new THREE.PointLight(0x8e9185, 1.5, 8);
    pointLight.position.set(0, 0, 3);
    scene.add(pointLight);
    pointLightRef.current = pointLight;

    // 5. Main Document Group
    const docGroup = new THREE.Group();
    scene.add(docGroup);
    docGroupRef.current = docGroup;

    // Document Dimensions (aspect ratio 1 : 1.36)
    const docW = 2.4;
    const docH = 3.28;
    const docD = 0.04;

    // Paper Texture
    const paperTexture = createResumeTexture();

    // Material with subtle specular sheen
    const frontMaterial = new THREE.MeshStandardMaterial({
      map: paperTexture,
      roughness: 0.45,
      metalness: 0.05,
    });
    const edgeMaterial = new THREE.MeshStandardMaterial({
      color: 0xe5e2d9,
      roughness: 0.8,
    });
    const backMaterial = new THREE.MeshStandardMaterial({
      color: 0xedeae1,
      roughness: 0.8,
    });

    const docMaterials = [
      edgeMaterial, // right
      edgeMaterial, // left
      edgeMaterial, // top
      edgeMaterial, // bottom
      frontMaterial, // front
      backMaterial, // back
    ];

    // Main Paper Mesh
    const docGeometry = new THREE.BoxGeometry(docW, docH, docD);
    const mainDocMesh = new THREE.Mesh(docGeometry, docMaterials);
    mainDocMesh.castShadow = true;
    mainDocMesh.receiveShadow = true;
    docGroup.add(mainDocMesh);

    // Offset backing shadow card
    const backingGeometry = new THREE.BoxGeometry(docW * 1.01, docH * 1.01, 0.02);
    const backingMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4d2ca,
      roughness: 0.9,
    });
    const backingMesh = new THREE.Mesh(backingGeometry, backingMaterial);
    backingMesh.position.set(0.04, -0.04, -0.04);
    backingMesh.rotation.z = -0.02;
    docGroup.add(backingMesh);

    // 6. Explodable 3D Layers (Separated in Chapter 2)
    const layers = [];

    // Layer A: ATS Semantic Parser Layer (Transparent grid + bounding box wireframes)
    const layerAGeo = new THREE.PlaneGeometry(docW * 0.9, docH * 0.9);
    const layerAMat = new THREE.MeshBasicMaterial({
      color: 0x2e7d32,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const layerAMesh = new THREE.Mesh(layerAGeo, layerAMat);
    layerAMesh.position.set(0, 0, 0.1);
    docGroup.add(layerAMesh);
    layers.push({ mesh: layerAMesh, baseZ: 0.08, explodeMultiplier: 0.8 });

    // Layer B: Quantitative Metrics Pin Layer (Floating badges)
    const layerBGroup = new THREE.Group();
    const pinGeo = new THREE.BoxGeometry(0.55, 0.18, 0.02);
    const pinMat = new THREE.MeshStandardMaterial({
      color: 0x242523,
      roughness: 0.2,
      metalness: 0.3,
    });
    const pin1 = new THREE.Mesh(pinGeo, pinMat);
    pin1.position.set(0.65, 0.45, 0);
    const pin2 = new THREE.Mesh(pinGeo, pinMat);
    pin2.position.set(-0.6, -0.2, 0);
    layerBGroup.add(pin1);
    layerBGroup.add(pin2);
    layerBGroup.position.set(0, 0, 0.15);
    docGroup.add(layerBGroup);
    layers.push({ mesh: layerBGroup, baseZ: 0.15, explodeMultiplier: 1.4 });

    layersRef.current = layers;

    // 7. Holographic Laser Scanning Beam
    const laserGeo = new THREE.PlaneGeometry(docW * 1.15, 0.06);
    const laserMat = new THREE.MeshBasicMaterial({
      color: 0x4ade80,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
    });
    const laserMesh = new THREE.Mesh(laserGeo, laserMat);
    laserMesh.position.set(0, 0, 0.06);
    docGroup.add(laserMesh);
    laserRef.current = laserMesh;

    // 8. Holographic Score Ring
    const ringGroup = new THREE.Group();
    const ringGeo = new THREE.TorusGeometry(0.52, 0.024, 16, 64);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x8e9185,
      roughness: 0.2,
      metalness: 0.7,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringGroup.add(ringMesh);

    // Orbiting data crystal
    const crystalGeo = new THREE.OctahedronGeometry(0.08);
    const crystalMat = new THREE.MeshStandardMaterial({
      color: 0x242523,
      roughness: 0.1,
      metalness: 0.8,
    });
    const crystalMesh = new THREE.Mesh(crystalGeo, crystalMat);
    crystalMesh.position.set(0.52, 0, 0);
    ringGroup.add(crystalMesh);

    ringGroup.position.set(1.4, -0.9, 0.2);
    ringGroup.rotation.x = 0.4;
    ringGroup.rotation.y = -0.3;
    docGroup.add(ringGroup);
    scoreRingRef.current = { group: ringGroup, crystal: crystalMesh };

    // 9. Ambient Floating Particles
    const particleCount = 220;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePos[i] = (Math.random() - 0.5) * 12;
      particlePos[i + 1] = (Math.random() - 0.5) * 10;
      particlePos[i + 2] = (Math.random() - 0.5) * 6;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x8e9185,
      size: 0.035,
      transparent: true,
      opacity: 0.55,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);
    particlesRef.current = particles;

    // 10. Animation Loop
    let clock = new THREE.Clock();
    let currentExplode = 0;

    const animate = () => {
      requestRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      const target = CHAPTER_TARGETS[activeChapter] || CHAPTER_TARGETS[0];

      // Smooth pointer parallax with spring damping
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.08;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.08;

      if (!reducedMotion && docGroupRef.current) {
        // Floating ambient breathing wave
        const floatY = Math.sin(elapsed * 1.5) * 0.04;
        const floatRx = Math.cos(elapsed * 1.2) * 0.02;

        // Base rotation + Drag rotation + Mouse parallax
        const targetRx = target.rx + dragRotationRef.current.x + mouseRef.current.y * 0.35 + floatRx;
        const targetRy = target.ry + dragRotationRef.current.y + mouseRef.current.x * 0.45;
        const targetRz = target.rz - mouseRef.current.x * 0.1;

        docGroupRef.current.rotation.x += (targetRx - docGroupRef.current.rotation.x) * 0.07;
        docGroupRef.current.rotation.y += (targetRy - docGroupRef.current.rotation.y) * 0.07;
        docGroupRef.current.rotation.z += (targetRz - docGroupRef.current.rotation.z) * 0.07;

        docGroupRef.current.position.y += (floatY - docGroupRef.current.position.y) * 0.07;
        docGroupRef.current.position.z += (target.tz - docGroupRef.current.position.z) * 0.07;

        // Move cursor light in 3D space
        if (pointLightRef.current) {
          pointLightRef.current.position.x = mouseRef.current.x * 3.5;
          pointLightRef.current.position.y = mouseRef.current.y * 3.5;
        }

        // Animated laser scanner beam
        if (laserRef.current) {
          if (target.laser) {
            laserRef.current.visible = true;
            // Sweep between top and bottom
            const scanY = Math.sin(elapsed * 2.2) * (docH * 0.42);
            laserRef.current.position.y = scanY;
            laserRef.current.material.opacity = 0.6 + Math.abs(Math.sin(elapsed * 5)) * 0.3;
          } else {
            laserRef.current.visible = false;
          }
        }

        // Interpolate exploded depth layers
        currentExplode += (target.explode - currentExplode) * 0.08;
        layersRef.current.forEach((l) => {
          l.mesh.position.z = l.baseZ + currentExplode * l.explodeMultiplier;
          if (l.mesh.material) {
            l.mesh.material.opacity = 0.2 + currentExplode * 0.6;
          }
        });

        // Rotate score ring & crystal
        if (scoreRingRef.current) {
          scoreRingRef.current.group.rotation.z = elapsed * 0.4;
          scoreRingRef.current.crystal.rotation.x = elapsed * 1.5;
          scoreRingRef.current.crystal.rotation.y = elapsed * 1.2;
          scoreRingRef.current.group.visible = target.ring || activeChapter >= 2;
        }

        // Slowly drift ambient particle constellation
        if (particlesRef.current) {
          particlesRef.current.rotation.y = elapsed * 0.03;
          particlesRef.current.rotation.x = elapsed * 0.015;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 460;
      const h = container.clientHeight || 560;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      paperTexture.dispose();
    };
  }, [activeChapter, reducedMotion]);

  // Pointer move handler for parallax & light following
  const handlePointerMove = (e) => {
    if (reducedMotion) return;
    const rect = mountRef.current?.getBoundingClientRect();
    if (!rect) return;

    if (isDraggingRef.current) {
      const deltaX = (e.clientX - dragStartRef.current.x) * 0.01;
      const deltaY = (e.clientY - dragStartRef.current.y) * 0.01;
      dragRotationRef.current.y += deltaX;
      dragRotationRef.current.x += deltaY;
      dragStartRef.current = { x: e.clientX, y: e.clientY };
    } else {
      const nx = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      mouseRef.current.targetX = nx * 1.8;
      mouseRef.current.targetY = -ny * 1.8;
    }
  };

  const handlePointerDown = (e) => {
    isDraggingRef.current = true;
    setDragActive(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
    setDragActive(false);
  };

  const handleResetOrbit = () => {
    dragRotationRef.current = { x: 0, y: 0 };
    mouseRef.current = { x: 0, y: 0, targetX: 0, targetY: 0 };
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '560px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        isDraggingRef.current = false;
        setDragActive(false);
        mouseRef.current.targetX = 0;
        mouseRef.current.targetY = 0;
      }}
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      {/* Three.js canvas mount container */}
      <div
        ref={mountRef}
        style={{
          width: '100%',
          height: '100%',
          cursor: dragActive ? 'grabbing' : 'grab',
        }}
      />

      {/* Floating 3D Interaction Badge & Reset Button */}
      <div
        style={{
          position: 'absolute',
          bottom: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(255, 254, 249, 0.88)',
          backdropFilter: 'blur(10px)',
          border: '1px solid #D4D2CA',
          borderRadius: '9999px',
          padding: '6px 14px',
          fontSize: '11px',
          fontWeight: 600,
          color: '#4B4D47',
          boxShadow: '0 4px 16px rgba(36, 37, 35, 0.08)',
          pointerEvents: 'auto',
          zIndex: 10,
        }}
      >
        <span
          style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: '#15803D',
            boxShadow: '0 0 8px rgba(34, 197, 94, 0.6)',
          }}
        />
        <span>Interactive 3D Studio  •  Drag to Orbit</span>
        {(dragRotationRef.current.x !== 0 || dragRotationRef.current.y !== 0) && (
          <button
            type="button"
            onClick={handleResetOrbit}
            style={{
              background: '#242523',
              color: '#FFFEF9',
              border: 'none',
              borderRadius: '9999px',
              padding: '2px 8px',
              fontSize: '10px',
              fontWeight: 700,
              cursor: 'pointer',
              marginLeft: '4px',
            }}
          >
            Reset Angle
          </button>
        )}
      </div>

      {/* Chapter 2 Exploded Layers Indicator */}
      {activeChapter === 2 && (
        <div
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(36, 37, 35, 0.92)',
            color: '#FFFEF9',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
          }}
        >
          ✦ 3D Exploded Layer Architecture
        </div>
      )}
    </div>
  );
}
