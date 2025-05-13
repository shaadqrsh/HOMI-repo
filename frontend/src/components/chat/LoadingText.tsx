import { motion } from "framer-motion";

const LoadingText = () => {
  return (
    <motion.p
      className="ml-10 opacity-50 text-lg mb-2"
      initial={{ opacity: 0.5 }}
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      Thinking...
    </motion.p>
  );
};

export default LoadingText;
