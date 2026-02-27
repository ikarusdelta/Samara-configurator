import React, { Suspense, useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Center, useGLTF, PerspectiveCamera, Environment, Html, useProgress, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

const VIEWPOINTS_AZIMUTH = [
    Math.PI * 0.25,  // 45 deg
    Math.PI * 0.75,  // 135 deg
    Math.PI * 1.25,  // 225 deg
    Math.PI * 1.75,  // 315 deg
];

// Rendered OUTSIDE the Canvas — useProgress hooks into a global Zustand store so this works fine.
function LoadingOverlay() {
    const { active, progress } = useProgress();
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        if (!active && progress >= 100) {
            const t = setTimeout(() => setVisible(false), 400);
            return () => clearTimeout(t);
        }
    }, [active, progress]);

    if (!visible) return null;

    return (
        <div
            className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
            style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.4s ease-out' }}
        >
            <div className="w-[200px] md:w-[240px] h-1 bg-black/5 rounded-full overflow-hidden backdrop-blur-sm border border-black/5">
                <div
                    className="h-full bg-black transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
}

function CameraHandler({ viewIndex, viewMode, distance, onInteraction }) {
    const { camera } = useThree();
    const controlsRef = useRef();
    const isTransitioning = useRef(false);
    const lastIndex = useRef(viewIndex);
    const lastMode = useRef(viewMode);

    useEffect(() => {
        if (viewIndex !== lastIndex.current || viewMode !== lastMode.current) {
            isTransitioning.current = true;
            lastIndex.current = viewIndex;
            lastMode.current = viewMode;

            // On any mode transition, we should also transition the target back to center
            // but for immediate fix, we can just snap it here if not already transitioning
            // Let's handle it inside useFrame for smoothness
        }
    }, [viewIndex, viewMode]);

    useFrame((state, delta) => {
        if (!controlsRef.current) return;

        if (isTransitioning.current) {
            let targetAzimuth, targetPolar;
            const targetCenter = new THREE.Vector3(0, 0, 0);

            if (viewMode === 'interior') {
                targetAzimuth = controlsRef.current.getAzimuthalAngle();
                targetPolar = 0.05;
            } else {
                targetAzimuth = VIEWPOINTS_AZIMUTH[viewIndex];
                targetPolar = Math.PI * 0.35;
            }

            const currentAzimuth = controlsRef.current.getAzimuthalAngle();
            const currentPolar = controlsRef.current.getPolarAngle();
            const currentTarget = controlsRef.current.target;

            let aziDiff = targetAzimuth - currentAzimuth;
            while (aziDiff < -Math.PI) aziDiff += Math.PI * 2;
            while (aziDiff > Math.PI) aziDiff -= Math.PI * 2;

            const polDiff = targetPolar - currentPolar;
            const centerDiff = targetCenter.clone().sub(currentTarget);

            if (Math.abs(aziDiff) < 0.001 && Math.abs(polDiff) < 0.001 && centerDiff.length() < 0.01) {
                isTransitioning.current = false;
                controlsRef.current.target.set(0, 0, 0);
                return;
            }

            const lerpFactor = delta * 3;
            const newAzimuth = currentAzimuth + aziDiff * lerpFactor;
            const newPolar = currentPolar + polDiff * lerpFactor;

            controlsRef.current.target.lerp(targetCenter, lerpFactor);

            const r = distance;
            camera.position.x = controlsRef.current.target.x + r * Math.sin(newPolar) * Math.sin(newAzimuth);
            camera.position.y = controlsRef.current.target.y + r * Math.cos(newPolar);
            camera.position.z = controlsRef.current.target.z + r * Math.sin(newPolar) * Math.cos(newAzimuth);

            controlsRef.current.update();
        }
    });

    return (
        <OrbitControls
            ref={controlsRef}
            enableZoom={false}
            enablePan={true}
            screenSpacePanning={true}
            minPolarAngle={viewMode === 'interior' ? 0.01 : 10 * Math.PI / 180}
            maxPolarAngle={viewMode === 'interior' ? Math.PI * 0.2 : Math.PI * 0.45}
            minDistance={distance}
            maxDistance={distance}
            onStart={() => {
                isTransitioning.current = false;
                if (onInteraction) onInteraction();
            }}
            makeDefault
        />
    );
}

function AnimatedModel({ url, visible = true, onLoaded }) {
    const { scene } = useGLTF(url);
    const groupRef = useRef();
    const [shouldRender, setShouldRender] = useState(visible);

    useEffect(() => {
        if (scene && onLoaded) onLoaded(scene);
    }, [scene, onLoaded]);

    useFrame((state, delta) => {
        if (!groupRef.current) return;

        // Target Y position: 0 when visible, 2 when hidden (slides up)
        const targetY = visible ? 0 : 2;
        const targetOpacity = visible ? 1 : 0;

        groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, delta * 4);

        // Handle actual rendering lifecycle to prevent shadows from hidden objects
        if (!visible && groupRef.current.position.y > 1.9) {
            setShouldRender(false);
        } else if (visible) {
            setShouldRender(true);
        }
    });

    return (
        <group ref={groupRef}>
            {shouldRender && <primitive object={scene} />}
        </group>
    );
}

function Model({ url, visible = true, onLoaded }) {
    const { scene } = useGLTF(url);
    useEffect(() => {
        if (scene && onLoaded) onLoaded(scene);
    }, [scene, onLoaded]);
    return <primitive object={scene} visible={visible} />;
}

const SceneContent = ({ viewMode, onHeightChange, onDistanceChange, onModelMaxSizeChange, modelMaxSize, cameraRef, modelHeight, onReady }) => {
    const { size, camera: threeCamera } = useThree();

    // Step 1: On model load, measure, cache size, and enable casting shadows on all meshes.
    const handleModelLoaded = useMemo(() => (scene) => {
        const box = new THREE.Box3().setFromObject(scene);
        const sizeBox = box.getSize(new THREE.Vector3());
        onHeightChange(sizeBox.y);
        onModelMaxSizeChange(Math.max(sizeBox.x, sizeBox.y, sizeBox.z));
        // Enable shadow casting on every mesh in the model
        scene.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
    }, [onHeightChange, onModelMaxSizeChange]);

    // Step 2: Recalculate distance whenever canvas size OR cached model size changes.
    // onReady is called only on the first successful fit so the canvas can fade in.
    const readyCalled = useRef(false);
    useEffect(() => {
        if (!modelMaxSize) return;

        const aspect = size.width / size.height;
        const fov = threeCamera.fov * (Math.PI / 180);
        const fitHeightDistance = modelMaxSize / (2 * Math.tan(fov / 2));
        const fitWidthDistance = fitHeightDistance / aspect;
        const calculatedDistance = 2.2 * Math.max(fitHeightDistance, fitWidthDistance);

        onDistanceChange(calculatedDistance);

        if (cameraRef.current) {
            const initialAzimuth = VIEWPOINTS_AZIMUTH[0];
            const initialPolar = Math.PI * 0.35;
            cameraRef.current.position.set(
                calculatedDistance * Math.sin(initialPolar) * Math.sin(initialAzimuth),
                calculatedDistance * Math.cos(initialPolar),
                calculatedDistance * Math.sin(initialPolar) * Math.cos(initialAzimuth)
            );
            cameraRef.current.lookAt(0, 0, 0);
        }

        if (!readyCalled.current) {
            readyCalled.current = true;
            onReady?.();
        }
    }, [modelMaxSize, size.width, size.height, threeCamera.fov, onDistanceChange, cameraRef, onReady]);

    return (
        <Suspense fallback={null}>
            <Center key="main-center">
                <Model url="/models/Base.glb" onLoaded={handleModelLoaded} />
                <AnimatedModel
                    url="/models/Base_Roof.glb"
                    visible={viewMode === 'exterior'}
                />
            </Center>

            <ContactShadows
                position={[0, -modelHeight / 2 - 0.01, 0]}
                opacity={0.45}
                scale={60}
                blur={2.5}
                far={modelHeight * 2 || 10}
                color="#000000"
            />

            <Environment preset="city" />
        </Suspense>
    );
};

const ModelViewer = ({ viewIndex = 0, viewMode = 'exterior' }) => {
    const cameraRef = useRef();
    const [cameraDistance, setCameraDistance] = useState(30);
    const [modelMaxSize, setModelMaxSize] = useState(null);
    const [modelHeight, setModelHeight] = useState(0);
    const [modelReady, setModelReady] = useState(false);

    const handleReady = useCallback(() => setModelReady(true), []);

    return (
        <div className="relative w-full h-full">
            {/* Loader shown while GLB is fetching, outside Canvas so it's always visible */}
            <LoadingOverlay />

            {/* Canvas fades in once the camera is positioned — no abrupt size jump */}
            <div
                className="w-full h-full cursor-grab active:cursor-grabbing"
                style={{
                    opacity: modelReady ? 1 : 0,
                    transition: modelReady ? 'opacity 0.75s ease-in' : 'none',
                }}
            >
                <Canvas shadows dpr={[1, 2]} gl={{ logarithmicDepthBuffer: true }}>
                    <PerspectiveCamera makeDefault ref={cameraRef} fov={17} near={0.1} far={2000} position={[30, 25, 30]} />

                    <ambientLight intensity={0.7} />
                    <directionalLight
                        position={[10, 25, 10]}
                        intensity={1.2}
                        castShadow
                        shadow-mapSize={2048}
                    />
                    <pointLight position={[-15, 15, -15]} intensity={0.5} />

                    <SceneContent
                        viewMode={viewMode}
                        onHeightChange={setModelHeight}
                        onDistanceChange={setCameraDistance}
                        onModelMaxSizeChange={setModelMaxSize}
                        modelMaxSize={modelMaxSize}
                        cameraRef={cameraRef}
                        modelHeight={modelHeight}
                        onReady={handleReady}
                    />

                    <CameraHandler viewIndex={viewIndex} viewMode={viewMode} distance={cameraDistance} />
                </Canvas>
            </div>
        </div>
    );
};

export default ModelViewer;
