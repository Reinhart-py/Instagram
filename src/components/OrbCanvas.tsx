
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const OrbCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);

    // Create orbs
    const createOrb = (radius: number, color: number, position: [number, number, number]) => {
      const geometry = new THREE.SphereGeometry(radius, 64, 64);
      const material = new THREE.MeshStandardMaterial({ 
        color, 
        roughness: 0.2,
        metalness: 0.8,
        emissive: color,
        emissiveIntensity: 0.2
      });
      const orb = new THREE.Mesh(geometry, material);
      orb.position.set(...position);
      return orb;
    };

    const orbs = [
      createOrb(0.5, 0xa855f7, [0, 0, 0]),
      createOrb(0.3, 0x6366f1, [1.5, -0.5, -1]),
      createOrb(0.2, 0x3b82f6, [-1.2, 0.8, -2])
    ];

    orbs.forEach(orb => scene.add(orb));

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0xa855f7, 2, 10);
    pointLight1.position.set(2, 1, 2);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x6366f1, 2, 10);
    pointLight2.position.set(-2, -1, 2);
    scene.add(pointLight2);

    // Animation
    let frame = 0;
    const animate = () => {
      frame++;
      
      orbs.forEach((orb, i) => {
        orb.rotation.x = 0.01 * frame * (i + 1);
        orb.rotation.z = 0.01 * frame * (i + 1);
        
        // Float animation
        orb.position.y = Math.sin((frame + i * 50) * 0.01) * 0.2;
      });
      
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    
    animate();

    // Responsive
    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full"></div>;
};

export default OrbCanvas;
