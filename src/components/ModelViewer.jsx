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
            maxPolarAngle={viewMode === 'interior' ? Math.PI * 0.2 : Math.PI * 0.55}
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

const SceneContent = ({ viewMode, onHeightChange, onDistanceChange, isFitDone, setIsFitDone, cameraRef, modelHeight }) => {
    const { size, camera: threeCamera } = useThree();

    const handleModelLoaded = useMemo(() => (scene) => {
        if (isFitDone) return;

        const box = new THREE.Box3().setFromObject(scene);
        const sizeBox = box.getSize(new THREE.Vector3());

        const h = sizeBox.y;
        onHeightChange(h);

        const maxSize = Math.max(sizeBox.x, sizeBox.y, sizeBox.z);
        const aspect = size.width / size.height;

        const fov = threeCamera.fov * (Math.PI / 180);
        const fitHeightDistance = maxSize / (2 * Math.tan(fov / 2));
        const fitWidthDistance = fitHeightDistance / aspect;

        const calculatedDistance = 1.5 * Math.max(fitHeightDistance, fitWidthDistance);
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
        setIsFitDone(true);
    }, [size.width, size.height, threeCamera.fov, isFitDone, onHeightChange, onDistanceChange, setIsFitDone, cameraRef]);

    return (
        <Suspense fallback={<Loader />}>
            <Center key="main-center">
                <Model url="/models/Base.glb" onLoaded={handleModelLoaded} />
                <AnimatedModel
                    url="/models/Base_Roof.glb"
                    visible={viewMode === 'exterior'}
                />
            </Center>

            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -modelHeight / 2 - 0.01, 0]} receiveShadow>
                <planeGeometry args={[500, 500]} />
                <shadowMaterial transparent opacity={0.1} />
            </mesh>

            <Environment preset="city" />
        </Suspense>
    );
};

const ModelViewer = ({ viewIndex = 0, viewMode = 'exterior' }) => {
    const cameraRef = useRef();
    const [cameraDistance, setCameraDistance] = useState(30);
    const [isFitDone, setIsFitDone] = useState(false);
    const [modelHeight, setModelHeight] = useState(0);

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

                <SceneContent
                    viewMode={viewMode}
                    onHeightChange={setModelHeight}
                    onDistanceChange={setCameraDistance}
                    isFitDone={isFitDone}
                    setIsFitDone={setIsFitDone}
                    cameraRef={cameraRef}
                    modelHeight={modelHeight}
                />

                <CameraHandler viewIndex={viewIndex} viewMode={viewMode} distance={cameraDistance} />
            </Canvas>
        </div>
    );
};

export default ModelViewer;
