import { useScrollReveal, useParallax } from "@/hooks/useScrollReveal";
import { cn } from "@/lib/utils";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  /** Animation variant */
  variant?: "fade-up" | "fade" | "slide-left" | "slide-right" | "scale";
  /** Enable parallax on this element */
  parallax?: boolean;
  parallaxSpeed?: number;
}

const variantStyles = {
  "fade-up": {
    hidden: "opacity-0 translate-y-10",
    visible: "opacity-100 translate-y-0",
  },
  fade: {
    hidden: "opacity-0",
    visible: "opacity-100",
  },
  "slide-left": {
    hidden: "opacity-0 -translate-x-10",
    visible: "opacity-100 translate-x-0",
  },
  "slide-right": {
    hidden: "opacity-0 translate-x-10",
    visible: "opacity-100 translate-x-0",
  },
  scale: {
    hidden: "opacity-0 scale-95",
    visible: "opacity-100 scale-100",
  },
};

const ScrollReveal = ({
  children,
  className,
  delay = 0,
  variant = "fade-up",
  parallax = false,
  parallaxSpeed = 0.12,
}: ScrollRevealProps) => {
  const { ref, isVisible } = useScrollReveal();
  const { ref: parallaxRef, offset } = useParallax(parallaxSpeed);

  const styles = variantStyles[variant];

  // Merge refs when parallax is enabled
  const setRef = (node: HTMLDivElement | null) => {
    (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
    if (parallax) {
      (parallaxRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    }
  };

  return (
    <div
      ref={setRef}
      className={cn(
        "transition-all duration-[1s] ease-[cubic-bezier(0.25,0.46,0.45,0.94)]",
        isVisible ? styles.visible : styles.hidden,
        className
      )}
      style={{
        transitionDelay: `${delay}ms`,
        ...(parallax && isVisible ? { transform: `translateY(${offset}px)` } : {}),
      }}
    >
      {children}
    </div>
  );
};

export default ScrollReveal;
