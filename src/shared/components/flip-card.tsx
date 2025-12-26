import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";

type Props = {
  frontNode: ReactNode;
  backNode: ReactNode;
};

const FlipCard = ({ frontNode, backNode }: Props) => {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="perspective-[1000px]">
      <motion.div
        className="relative h-[400px] w-[580px] cursor-pointer [transform-style:preserve-3d]"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        onClick={() => setFlipped((prev) => !prev)}
      >
        <div
          className="absolute inset-0 flex items-center justify-center
            rounded-lg bg-white text-black
            [backface-visibility:hidden]"
        >
          {frontNode}
        </div>
        <div
          className="absolute inset-0 flex items-center justify-center
            rounded-lg bg-gray-800 text-white
            [transform:rotateY(180deg)]
            [backface-visibility:hidden]"
        >
          {backNode}
        </div>
      </motion.div>
    </div>
  );
};

export default FlipCard;
