import React, { Suspense, useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Center, useGLTF, PerspectiveCamera, Environment, Html, useProgress } from '@react-three/drei';
import * as THREE from 'three';

const VIEWPOINTS_AZIMUTH = [
    Math.PI * 0.25,  // 45 deg
    Math.PI * 0.75,  // 135 deg
    Math.PI * 1.25,  // 225 deg
    Math.PI * 1.75,  // 315 deg
];

function Loader() {
    const { progress } = useProgress();
    return (
        <Html center>
            <div className="flex flex-col items-center w-[200px] md:w-[240px]">
                {/* Progress bar container */}
                <div className="w-full h-1 bg-black/5 rounded-full overflow-hidden backdrop-blur-sm border border-black/5">
                    <div
                        className="h-full bg-black transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        </Html>
    );
}

function CameraHandler({ viewIndex, distance, onInteraction }) {
    const { camera } = useThree();
    const controlsRef = useRef();
    const isTransitioning = useRef(false);
    const lastIndex = useRef(viewIndex);

    useEffect(() => {
        if (viewIndex !== lastIndex.current) {
            isTransitioning.current = true;
            lastIndex.current = viewIndex;
        }
    }, [viewIndex]);

    useFrame((state, delta) => {
        if (!controlsRef.current) return;

        if (isTransitioning.current) {
            const currentAzimuth = controlsRef.current.getAzimuthalAngle();
            const target = VIEWPOINTS_AZIMUTH[viewIndex];

            let diff = target - currentAzimuth;
            while (diff < -Math.PI) diff += Math.PI * 2;
            while (diff > Math.PI) diff -= Math.PI * 2;

            // If very close, stop transitioning
            if (Math.abs(diff) < 0.01) {
                isTransitioning.current = false;
                return;
            }

            const step = diff * delta * 4;
            const newAzimuth = currentAzimuth + step;

            const polar = controlsRef.current.getPolarAngle();
            const r = distance;

            camera.position.x = controlsRef.current.target.x + r * Math.sin(polar) * Math.sin(newAzimuth);
            camera.position.y = controlsRef.current.target.y + r * Math.cos(polar);
            camera.position.z = controlsRef.current.target.z + r * Math.sin(polar) * Math.cos(newAzimuth);

            controlsRef.current.update();
        }
    });

    return (
        <OrbitControls
            ref={controlsRef}
            enableZoom={false} // Disable zoom as requested
            enablePan={true}
            minPolarAngle={10 * Math.PI / 180} // Allow slight tilt but avoid bottom
            maxPolarAngle={Math.PI * 0.55}
            minDistance={distance} // Lock distance to the calculated fit
            maxDistance={distance}
            onStart={() => {
                isTransitioning.current = false;
                if (onInteraction) onInteraction();
            }}
            makeDefault
        />
    );
}

function Model({ url, onLoaded }) {
    const { scene } = useGLTF(url);
    useEffect(() => {
        if (scene) onLoaded(scene);
    }, [scene, onLoaded]);
    return <primitive object={scene} />;
}

const ModelViewer = ({ viewIndex = 0 }) => {
    const cameraRef = useRef();
    const [cameraDistance, setCameraDistance] = useState(30);
    const [isFitDone, setIsFitDone] = useState(false);

    // This component helps us access the Three.js state (size, aspect) inside the handler
    const SceneSetup = () => {
        const { size, camera } = useThree();

        const handleModelLoaded = useMemo(() => (scene) => {
            if (isFitDone) return;

            const box = new THREE.Box3().setFromObject(scene);
            const sizeBox = box.getSize(new THREE.Vector3());
            const center = box.getCenter(new THREE.Vector3());

            const maxSize = Math.max(sizeBox.x, sizeBox.y, sizeBox.z);
            const aspect = size.width / size.height;

            // Calculate distance to fit either width or height
            const fov = camera.fov * (Math.PI / 180);
            const fitHeightDistance = maxSize / (2 * Math.tan(fov / 2));
            const fitWidthDistance = fitHeightDistance / aspect;

            // Use a generous 1.5x multiplier to ensure it's not cutting corners
            const distance = 1.5 * Math.max(fitHeightDistance, fitWidthDistance);

            setCameraDistance(distance);

            if (cameraRef.current) {
                // Set initial top-down-ish angle
                const initialAzimuth = VIEWPOINTS_AZIMUTH[0];
                const initialPolar = Math.PI * 0.35;

                cameraRef.current.position.set(
                    distance * Math.sin(initialPolar) * Math.sin(initialAzimuth),
                    distance * Math.cos(initialPolar),
                    distance * Math.sin(initialPolar) * Math.cos(initialAzimuth)
                );
                cameraRef.current.lookAt(0, 0, 0);
            }
            setIsFitDone(true);
        }, [size.width, size.height, camera.fov, isFitDone]);

        return (
            <Suspense fallback={<Loader />}>
                <Center top>
                    <Model url="/models/Base.glb" onLoaded={handleModelLoaded} />
                </Center>

                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
                    <planeGeometry args={[500, 500]} />
                    <shadowMaterial transparent opacity={0.1} />
                </mesh>

                <Environment preset="city" />
            </Suspense>
        );
    };

    return (
        <div className="w-full h-full cursor-grab active:cursor-grabbing">
            <Canvas shadows dpr={[1, 2]}>
                <PerspectiveCamera makeDefault ref={cameraRef} fov={35} position={[30, 25, 30]} />

                <ambientLight intensity={0.7} />
                <directionalLight
                    position={[10, 25, 10]}
                    intensity={1.2}
                    castShadow
                    shadow-mapSize={2048}
                />
                <pointLight position={[-15, 15, -15]} intensity={0.5} />

                <SceneSetup />

                <CameraHandler viewIndex={viewIndex} distance={cameraDistance} />
            </Canvas>
        </div>
    );
};

export default ModelViewer;
