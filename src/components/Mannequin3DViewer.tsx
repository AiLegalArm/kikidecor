import { useRef, useState, useMemo, Suspense } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { useLanguage } from "@/i18n/LanguageContext";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ShoppingBag, RotateCcw, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type Product = {
  id: string;
  name: string;
  name_en: string | null;
  price: number;
  images: string[];
  sizes: string[];
  colors: string[];
  category: string | null;
};

// Mannequin body built from primitives
const MannequinBody = ({ size, productImage }: { size: string; productImage?: string }) => {
  const groupRef = useRef<THREE.Group>(null!);

  // Scale based on size
  const sizeScale = useMemo(() => {
    const scales: Record<string, { x: number; y: number; z: number }> = {
      XS: { x: 0.88, y: 0.97, z: 0.88 },
      S: { x: 0.93, y: 0.99, z: 0.93 },
      M: { x: 1, y: 1, z: 1 },
      L: { x: 1.07, y: 1.01, z: 1.07 },
      XL: { x: 1.14, y: 1.02, z: 1.14 },
      XXL: { x: 1.2, y: 1.03, z: 1.2 },
    };
    return scales[size] || scales.M;
  }, [size]);

  // Load product texture if available
  const texture = useMemo(() => {
    if (!productImage) return null;
    const tex = new THREE.TextureLoader().load(productImage);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }, [productImage]);

  const skinMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#e8cdb5",
    roughness: 0.7,
    metalness: 0.05,
  }), []);

  const clothMat = useMemo(() => {
    if (texture) {
      return new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.6,
        metalness: 0.05,
      });
    }
    return new THREE.MeshStandardMaterial({
      color: "#2a2a2a",
      roughness: 0.5,
      metalness: 0.1,
    });
  }, [texture]);

  return (
    <group ref={groupRef} scale={[sizeScale.x, sizeScale.y, sizeScale.z]}>
      {/* Head */}
      <mesh position={[0, 2.1, 0]} material={skinMat}>
        <sphereGeometry args={[0.22, 32, 32]} />
      </mesh>
      {/* Neck */}
      <mesh position={[0, 1.85, 0]} material={skinMat}>
        <cylinderGeometry args={[0.08, 0.1, 0.12, 16]} />
      </mesh>
      {/* Torso - uses cloth material */}
      <mesh position={[0, 1.35, 0]} material={clothMat}>
        <capsuleGeometry args={[0.3, 0.7, 16, 32]} />
      </mesh>
      {/* Left arm upper */}
      <mesh position={[-0.42, 1.55, 0]} rotation={[0, 0, 0.15]} material={clothMat}>
        <capsuleGeometry args={[0.08, 0.35, 8, 16]} />
      </mesh>
      {/* Left arm lower */}
      <mesh position={[-0.48, 1.15, 0]} rotation={[0, 0, 0.05]} material={skinMat}>
        <capsuleGeometry args={[0.065, 0.3, 8, 16]} />
      </mesh>
      {/* Right arm upper */}
      <mesh position={[0.42, 1.55, 0]} rotation={[0, 0, -0.15]} material={clothMat}>
        <capsuleGeometry args={[0.08, 0.35, 8, 16]} />
      </mesh>
      {/* Right arm lower */}
      <mesh position={[0.48, 1.15, 0]} rotation={[0, 0, -0.05]} material={skinMat}>
        <capsuleGeometry args={[0.065, 0.3, 8, 16]} />
      </mesh>
      {/* Hips/waist */}
      <mesh position={[0, 0.78, 0]} material={clothMat}>
        <capsuleGeometry args={[0.25, 0.2, 16, 32]} />
      </mesh>
      {/* Left leg upper */}
      <mesh position={[-0.14, 0.42, 0]} material={clothMat}>
        <capsuleGeometry args={[0.1, 0.35, 8, 16]} />
      </mesh>
      {/* Left leg lower */}
      <mesh position={[-0.14, 0, 0]} material={skinMat}>
        <capsuleGeometry args={[0.075, 0.35, 8, 16]} />
      </mesh>
      {/* Right leg upper */}
      <mesh position={[0.14, 0.42, 0]} material={clothMat}>
        <capsuleGeometry args={[0.1, 0.35, 8, 16]} />
      </mesh>
      {/* Right leg lower */}
      <mesh position={[0.14, 0, 0]} material={skinMat}>
        <capsuleGeometry args={[0.075, 0.35, 8, 16]} />
      </mesh>
      {/* Left foot */}
      <mesh position={[-0.14, -0.22, 0.04]} material={new THREE.MeshStandardMaterial({ color: "#1a1a1a", roughness: 0.4 })}>
        <boxGeometry args={[0.1, 0.06, 0.18]} />
      </mesh>
      {/* Right foot */}
      <mesh position={[0.14, -0.22, 0.04]} material={new THREE.MeshStandardMaterial({ color: "#1a1a1a", roughness: 0.4 })}>
        <boxGeometry args={[0.1, 0.06, 0.18]} />
      </mesh>
    </group>
  );
};

const AutoRotate = ({ enabled }: { enabled: boolean }) => {
  const controlsRef = useRef<any>(null);
  useFrame((_, delta) => {
    if (enabled && controlsRef.current) {
      controlsRef.current.autoRotate = true;
      controlsRef.current.autoRotateSpeed = 2;
      controlsRef.current.update();
    }
  });
  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      enableZoom={true}
      minDistance={2}
      maxDistance={6}
      minPolarAngle={Math.PI / 6}
      maxPolarAngle={Math.PI / 1.5}
      autoRotate={enabled}
      autoRotateSpeed={2}
    />
  );
};

type Props = {
  product: Product;
};

const Mannequin3DViewer = ({ product }: Props) => {
  const { lang } = useLanguage();
  const { addItem } = useCart();
  const isRu = lang === "ru";

  const availableSizes = product.sizes?.length ? product.sizes : ["XS", "S", "M", "L", "XL"];
  const [selectedSize, setSelectedSize] = useState(availableSizes.includes("M") ? "M" : availableSizes[0]);
  const [autoRotate, setAutoRotate] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);

  return (
    <div className="space-y-4">
      {/* 3D Canvas */}
      <div className={cn(
        "relative border border-border/40 bg-secondary/20 transition-all duration-500",
        fullscreen ? "fixed inset-0 z-50 border-0" : "aspect-[3/4]"
      )}>
        <Canvas
          camera={{ position: [0, 1.2, 3.5], fov: 35 }}
          gl={{ antialias: true, alpha: true }}
          style={{ background: "transparent" }}
        >
          <Suspense fallback={null}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[3, 5, 2]} intensity={1} castShadow />
            <directionalLight position={[-2, 3, -1]} intensity={0.3} />

            <MannequinBody size={selectedSize} productImage={product.images?.[0]} />
            <ContactShadows position={[0, -0.25, 0]} opacity={0.3} scale={3} blur={2.5} />

            <AutoRotate enabled={autoRotate} />
            <Environment preset="studio" />
          </Suspense>
        </Canvas>

        {/* Overlay controls */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={cn(
              "w-8 h-8 bg-background/80 backdrop-blur-sm border border-border/50 flex items-center justify-center transition-colors",
              autoRotate ? "text-primary" : "text-muted-foreground"
            )}
            title={autoRotate ? (isRu ? "Остановить" : "Stop rotation") : (isRu ? "Вращать" : "Auto rotate")}
          >
            <RotateCcw size={14} />
          </button>
          <button
            onClick={() => setFullscreen(!fullscreen)}
            className="w-8 h-8 bg-background/80 backdrop-blur-sm border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            {fullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>

        {/* Drag hint */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-background/70 backdrop-blur-sm text-[9px] uppercase tracking-wider text-muted-foreground border border-border/30">
          {isRu ? "Перетащите для вращения" : "Drag to rotate"}
        </div>

        {/* Fullscreen close */}
        {fullscreen && (
          <button
            onClick={() => setFullscreen(false)}
            className="absolute top-3 left-3 px-3 py-1.5 bg-background/80 backdrop-blur-sm border border-border/50 text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground"
          >
            {isRu ? "Закрыть" : "Close"}
          </button>
        )}
      </div>

      {/* Size selector */}
      <div>
        <p className="overline text-primary mb-2 text-[9px]">{isRu ? "Размер" : "Size"}</p>
        <div className="flex flex-wrap gap-1.5">
          {availableSizes.map(size => (
            <button
              key={size}
              onClick={() => setSelectedSize(size)}
              className={cn(
                "w-10 h-10 text-[10px] font-medium border transition-all duration-300",
                selectedSize === size
                  ? "bg-foreground text-background border-foreground"
                  : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
              )}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Product info + buy */}
      <div className="flex items-center justify-between gap-3 pt-2 border-t border-border/30">
        <div>
          <p className="text-sm font-medium">{isRu ? product.name : (product.name_en || product.name)}</p>
          <p className="font-display text-primary text-lg">{product.price.toLocaleString()} ₽</p>
        </div>
        <Button
          onClick={() => {
            addItem.mutate({ product_id: product.id, size: selectedSize });
            toast.success(`${isRu ? product.name : (product.name_en || product.name)} (${selectedSize}) — ${isRu ? "в корзине" : "added"}`);
          }}
          className="rounded-none gap-1.5 text-[9px] uppercase tracking-wider h-10"
        >
          <ShoppingBag size={13} />
          {isRu ? "В корзину" : "Add to cart"}
        </Button>
      </div>
    </div>
  );
};

export default Mannequin3DViewer;
