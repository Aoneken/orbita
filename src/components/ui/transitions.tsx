import { AnimatePresence, motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

interface DirectionalPageTransitionProps extends PageTransitionProps {
  direction?: "left" | "right";
}

// Variantes de animación para transiciones de página (fade vertical - legacy)
const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 10,
  },
  enter: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1], // easeOut cubic
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.15,
      ease: [0.4, 0, 1, 1], // easeIn cubic
    },
  },
};

// Generador de variantes para slide horizontal direccional
const createSlideVariants = (direction: "left" | "right"): Variants => {
  const slideDistance = 60; // px de desplazamiento
  const enterFrom = direction === "right" ? slideDistance : -slideDistance;
  const exitTo = direction === "right" ? -slideDistance : slideDistance;

  return {
    initial: {
      opacity: 0,
      x: enterFrom,
    },
    enter: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.25,
        ease: [0.4, 0, 0.2, 1], // easeOut cubic
      },
    },
    exit: {
      opacity: 0,
      x: exitTo,
      transition: {
        duration: 0.2,
        ease: [0.4, 0, 1, 1], // easeIn cubic
      },
    },
  };
};

// Wrapper para animar transiciones de página (legacy - vertical fade)
export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <motion.div
      initial="initial"
      animate="enter"
      exit="exit"
      variants={pageVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Wrapper para transiciones direccionales (Smart Slide)
export function DirectionalPageTransition({
  children,
  className,
  direction = "right",
}: DirectionalPageTransitionProps) {
  const variants = createSlideVariants(direction);

  return (
    <motion.div
      initial="initial"
      animate="enter"
      exit="exit"
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Variantes para animación de fade
const fadeVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2 },
  },
};

// Wrapper simple para fade in
export function FadeIn({
  children,
  className,
  delay = 0,
}: PageTransitionProps & { delay?: number }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeVariants}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Variantes para lista con stagger
const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const listItemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
    },
  },
};

// Container animado para listas
export function AnimatedList({ children, className }: PageTransitionProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={listVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Item de lista animado
export function AnimatedListItem({ children, className }: PageTransitionProps) {
  return (
    <motion.div variants={listItemVariants} className={className}>
      {children}
    </motion.div>
  );
}

// Re-export AnimatePresence para uso en App.tsx
export { AnimatePresence };
