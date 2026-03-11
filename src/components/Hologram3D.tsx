import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Environment } from '@react-three/drei';
import * as THREE from 'three';

interface Hologram3DProps {
  faceLandmarks?: any;
  palmLandmarks?: any;
  type: 'FACE' | 'PALM';
}

const PointCloud = ({ data, color = "#a78bfa" }: { data: any[], color?: string }) => {
  const geomRef = useRef<THREE.BufferGeometry>(null);

  const pointsData = useMemo(() => {
    const positions = new Float32Array(data.length * 3);
    const visibilityTimes = new Float32Array(data.length);
    for (let i = 0; i < data.length; i++) {
      positions[i * 3] = (data[i].x - 0.5) * 15;
      positions[i * 3 + 1] = -(data[i].y - 0.5) * 15;
      positions[i * 3 + 2] = (data[i].z || 0) * -15; 
      
      // 랜덤으로 점이 찍히는 시간 (0.5s ~ 2.5s)
      visibilityTimes[i] = 0.5 + Math.random() * 2.0;
    }
    return { positions, visibilityTimes };
  }, [data]);

  useFrame((state) => {
    const geom = geomRef.current;
    if (!geom) return;
    
    // 12초 루프 타이머
    const t = state.clock.elapsedTime % 12;
    
    // 3.0s ~ 4.5s: 2D -> 3D 돌출
    // 4.5s ~ 8.5s: 3D 상태 유지
    // 8.5s ~ 10.0s: 3D -> 2D 납작해짐
    let progress3D = 0;
    if (t > 3.0 && t <= 4.5) progress3D = (t - 3.0) / 1.5;
    else if (t > 4.5 && t <= 8.5) progress3D = 1;
    else if (t > 8.5 && t <= 10.0) progress3D = 1 - ((t - 8.5) / 1.5);
    else if (t > 10.0) progress3D = 0;
    
    const ease3D = progress3D < 0.5 ? 2 * progress3D * progress3D : 1 - Math.pow(-2 * progress3D + 2, 2) / 2;
    
    const positionsAttr = geom.attributes.position as THREE.BufferAttribute;
    for(let i = 0; i < data.length; i++) {
        // 루프 마지막엔 모든 점을 다시 렌더에서 숨김 -> 처음부터 그리기 위함
        const isVisible = t > pointsData.visibilityTimes[i] && t < 10.5;
        
        if (isVisible) {
            positionsAttr.array[i * 3] = pointsData.positions[i * 3];
            positionsAttr.array[i * 3 + 1] = pointsData.positions[i * 3 + 1];
            // 2D상태(Z=0)에서 3D 돌출(targetZ)로 보간
            positionsAttr.array[i * 3 + 2] = pointsData.positions[i * 3 + 2] * ease3D;
        } else {
            // 안 보이는 점들은 카메라 너머로 숨김
            positionsAttr.array[i * 3] = 9999;
            positionsAttr.array[i * 3 + 1] = 9999;
            positionsAttr.array[i * 3 + 2] = 9999;
        }
    }
    positionsAttr.needsUpdate = true;
  });

  return (
    <points>
      <bufferGeometry ref={geomRef}>
        <bufferAttribute
          attach="attributes-position"
          count={pointsData.positions.length / 3}
          array={pointsData.positions}
          itemSize={3}
          args={[pointsData.positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        color={color}
        sizeAttenuation={true}
        transparent={true}
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

// Component to render a wireframe connecting the points faintly
const Wireframe = ({ data, color = "#a78bfa" }: { data: any[], color?: string }) => {
  const lineGeomRef = useRef<THREE.BufferGeometry>(null);
  const matRef = useRef<THREE.LineBasicMaterial>(null);

  const geometryData = useMemo(() => {
    const points: number[] = [];
    const targetZs: number[] = [];
    const threshold = 1.2; 

    // Normalize scale logic
    const scaledData = data.map(d => ({
      x: (d.x - 0.5) * 15,
      y: -(d.y - 0.5) * 15,
      z: (d.z || 0) * -15
    }));

    for (let i = 0; i < scaledData.length; i++) {
      for (let j = i + 1; j < scaledData.length; j++) {
        const p1 = scaledData[i];
        const p2 = scaledData[j];
        const dist = Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2 + (p1.z - p2.z) ** 2);
        
        if (dist < threshold) {
          points.push(p1.x, p1.y, p1.z);
          targetZs.push(p1.z);
          points.push(p2.x, p2.y, p2.z);
          targetZs.push(p2.z);
        }
      }
    }
    return { array: new Float32Array(points), zs: new Float32Array(targetZs) };
  }, [data]);

  useFrame((state) => {
    const geom = lineGeomRef.current;
    if (!geom) return;
    const t = state.clock.elapsedTime % 12;
    
    let progress3D = 0;
    if (t > 3.0 && t <= 4.5) progress3D = (t - 3.0) / 1.5;
    else if (t > 4.5 && t <= 8.5) progress3D = 1;
    else if (t > 8.5 && t <= 10.0) progress3D = 1 - ((t - 8.5) / 1.5);
    else if (t > 10.0) progress3D = 0;
    
    const ease3D = progress3D < 0.5 ? 2 * progress3D * progress3D : 1 - Math.pow(-2 * progress3D + 2, 2) / 2;
    
    // 점이 다 찍힌 후(3초)부터 서서히 나타나는 선 애니메이션
    if (matRef.current) {
        if (t > 2.8 && t <= 9.5) {
            matRef.current.opacity = THREE.MathUtils.lerp(matRef.current.opacity, 0.15, 0.05);
        } else {
            matRef.current.opacity = THREE.MathUtils.lerp(matRef.current.opacity, 0, 0.1);
        }
    }

    const positionsAttr = geom.attributes.position as THREE.BufferAttribute;
    for(let i = 0; i < geometryData.zs.length; i++) {
        // Z축 깊이만 애니메이션으로 돌려줌
        positionsAttr.array[i * 3 + 2] = geometryData.zs[i] * ease3D;
    }
    positionsAttr.needsUpdate = true;
  });

  return (
    <lineSegments>
      <bufferGeometry ref={lineGeomRef}>
        <bufferAttribute
          attach="attributes-position"
          count={geometryData.array.length / 3}
          array={geometryData.array}
          itemSize={3}
          args={[geometryData.array, 3]}
        />
      </bufferGeometry>
      <lineBasicMaterial
        ref={matRef}
        color={color}
        transparent={true}
        opacity={0}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </lineSegments>
  );
};

const HologramSequence = ({ data, color }: { data: any[], color: string }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.elapsedTime % 12; // 12초 루프 사이클
      
      // 3초부터 10초까지는 3D 회전 애니메이션
      if (t > 3.0 && t < 10.0) {
        groupRef.current.rotation.y += 0.01;
        groupRef.current.position.y = Math.sin(t * 2) * 0.2;
      } else {
        // 다시 정면(사진 위)으로 원복
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, 0, 0.1);
        groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, 0, 0.1);
      }
    }
  });

  return (
    <group ref={groupRef}>
      <PointCloud data={data} color={color} />
      <Wireframe data={data} color={color} />
    </group>
  );
};

export const Hologram3D: React.FC<Hologram3DProps> = ({ faceLandmarks, palmLandmarks, type }) => {
  // Extra robust finding of data: expects our custom FaceLandmarkData
  const data = type === 'FACE' 
    ? (faceLandmarks?.allLandmarks || [])
    : (palmLandmarks?.allLandmarks || []);

  const themeColor = type === 'FACE' ? '#a78bfa' : '#34d399'; // Purple for face, Emerald for palm

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center bg-mystic-bg/50 border border-white/10 rounded-3xl">
        <p className="text-white/50 text-sm font-black uppercase tracking-widest">3D Data Not Available</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[400px] relative rounded-3xl overflow-hidden bg-white/5 border border-white/10 group">
      {/* Overlay UI hints */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-md border border-white/10 rounded-full shadow-lg">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
          <span className="text-[10px] font-black uppercase text-white tracking-widest">{type} 스캐닝 중...</span>
        </div>
      </div>
      
      {/* Interaction Hint that fades out */}
      <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none transition-opacity duration-1000 opacity-100 group-hover:opacity-0">
        <div className="flex flex-col items-center gap-2">
           {/* UI Hint */}
        </div>
      </div>

      <Canvas camera={{ position: [0, 0, 15], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color={themeColor} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4f46e5" />
        
        {/* Subtle background stars to enhance cosmic feel */}
        <Stars radius={50} depth={50} count={1500} factor={3} saturation={0} fade speed={1} />
        
        {data.length > 0 && (
          <HologramSequence data={data} color={themeColor} />
        )}
        
        {/* Adds mouse/touch controls */}
        <OrbitControls 
          enablePan={false} 
          enableZoom={true} 
          minDistance={5} 
          maxDistance={30}
          autoRotate={false}
          dampingFactor={0.05}
        />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
};
