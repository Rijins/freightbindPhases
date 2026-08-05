/**
 * Shared Framer Motion variants for the design system. Durations stay within
 * the 150–250ms window and only transform/opacity are animated, per the
 * animation rules. Reduced motion is handled globally by MotionConfig.
 */

export const EASE = [0.16, 1, 0.3, 1];

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2, ease: EASE } },
};

export const fadeInUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: EASE } },
};

export const fadeInDown = {
  hidden: { opacity: 0, y: -8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: EASE } },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.18, ease: EASE } },
};

export const staggerContainer = (staggerChildren = 0.05, delayChildren = 0) => ({
  hidden: {},
  visible: { transition: { staggerChildren, delayChildren } },
});

export const cardHover = { y: -3, transition: { duration: 0.2, ease: "easeOut" } };