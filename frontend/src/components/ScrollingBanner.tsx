import { motion } from "framer-motion";

const ScrollingBanner: React.FC = () => {
  return (
    <div className="relative w-full overflow-hidden bg-[#041a35] py-4 mt-[5em]">
      {/* LEFT FADE */}
      <div className="pointer-events-none absolute left-0 top-0 h-full w-20 bg-linear-to-r from-[#041a35] to-transparent z-20" />

      {/* RIGHT FADE */}
      <div className="pointer-events-none absolute right-0 top-0 h-full w-20 bg-linear-to-l from-[#041a35] to-transparent z-20" />

      {/* SCROLLING TEXT */}
      <motion.div
        className="flex whitespace-nowrap text-white text-xl font-semibold font-serif z-40"
        animate={{ x: ["0%", "-100%"] }}
        transition={{
          repeat: Infinity,
          duration: 50,
          ease: "linear",
        }}
      >
        <span className="mx-8 text-[1.2em] lg:text-[2em]">VIEW OUR LATEST OFFERING</span>
        <span className="mx-8 text-[1.2em] lg:text-[2em]">VIEW OUR LATEST OFFERING</span>
        <span className="mx-8 text-[1.2em] lg:text-[2em]">VIEW OUR LATEST OFFERING</span>
        <span className="mx-8 text-[1.2em] lg:text-[2em]">VIEW OUR LATEST OFFERING</span>
      </motion.div>
    </div>
  );
};

export default ScrollingBanner;

