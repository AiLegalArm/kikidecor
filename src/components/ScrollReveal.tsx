import { forwardRef } from "react";
import { useScrollReveal, useParallax } from "@/hooks/useScrollReveal";
import { cn } from "@/lib/utils";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  variant?: "fade-up" | "fade" | "slide-left" | "slide-right" | "scale" | "blur-up";
  parallax?: boolean;
  parallaxSpeed?: number;
}

const variantStyles = {
  "fade-up": {
    hidden: "opacity-0 translate-y-8",
    visible: "opacity-100 translate-y-0"
  },
  fade: {
    hidden: "opacity-0",
    visible: "opacity-100"
  },
  "slide-left": {
    hidden: "opacity-0 -translate-x-8",
    visible: "opacity-100 translate-x-0"
  },
  "slide-right": {
    hidden: "opacity-0 translate-x-8",
    visible: "opacity-100 translate-x-0"
  },
  scale: {
    hidden: "opacity-0 scale-[0.97]",
    visible: "opacity-100 scale-100"
  },
  "blur-up": {
    hidden: "opacity-0 translate-y-6 blur-[6px]",
    visible: "opacity-100 translate-y-0 blur-0"
  }
};

const ScrollReveal = forwardRef<HTMLDivElement, ScrollRevealProps>(({
  children,
  className,
  delay = 0,
  variant = "fade-up",
  parallax = false,
  parallaxSpeed = 0.1
}, _forwardedRef) => {
  const { ref, isVisible } = useScrollReveal();
  const { ref: parallaxRef, offset } = useParallax(parallaxSpeed);

  const styles = variantStyles[variant];

  const setRef = (node: HTMLDivElement | null) => {
    (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
    if (parallax) {
      (parallaxRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    }
  };

  return (
    <div
      ref={setRef}
      className={cn("transition-all duration-[1.1s] ease-[cubic-bezier(0.16,1,0.3,1)] px-[3px]",
        isVisible ? styles.visible : styles.hidden,
        className
      )}
      style={{
        transitionDelay: `${delay}ms`,
        willChange: isVisible ? "auto" : "transform, opacity, filter",
        ...(parallax && isVisible ? { transform: `translateY(${offset}px)` } : {})
      }}>
      {children}
    </div>
  );
});

ScrollReveal.displayName = "ScrollReveal";

export default ScrollReveal;