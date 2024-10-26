import { motion } from "framer-motion";
import React from "react";

// Define the interface for the component props
interface PulseDivProps {
  children?: React.ReactNode; // Content to be displayed inside the container
  duration?: number; // Duration of the pulsation animation (in seconds)
  easing?: string; // Easing function for the transition (e.g., 'easeInOut')
}

// Create the functional component using the props interface
const PulseDiv: React.FC<PulseDivProps> = ({
  children,
  duration = 1, // Default duration of 1 second
  easing = "easeInOut", // Default easing function
}) => {
  return (
    <motion.div
      style={{
        display: "inline-block", // Ensure the container takes up only the space of its children
        overflow: "hidden", // Prevent child elements from overflowing
      }}
      initial={{ opacity: 1 }} // Initial opacity
      animate={{ opacity: [1, 0.5, 1] }} // Animate opacity between 1 and 0.5
      transition={{
        duration: duration, // Duration of the pulsation
        repeat: Infinity, // Repeat the animation infinitely
        repeatType: "loop",
        ease: easing, // Apply easing function
      }}
    >
      {children} {/* Render any children passed to the component */}
    </motion.div>
  );
};

export default PulseDiv;
