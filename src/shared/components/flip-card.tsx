import { useState, useEffect, type ReactNode } from "react";
import { motion } from "framer-motion";

type Props = {
  frontNode: ReactNode;
  backNode: ReactNode;
  isActive?: boolean;
  autoFlip?: boolean;
};

const FlipCard = ({
  frontNode,
  backNode,
  isActive = true,
  autoFlip = true,
}: Props) => {
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    if (!isActive) {
      // deactive 상태가 되면 즉시 앞면으로 리셋
      setFlipped(false);
      return;
    }

    // active 상태가 되면 2초 후 자동으로 뒤집기
    const timer = setTimeout(() => {
      setFlipped(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, [isActive]);

  const handleClick = () => {
    if (autoFlip) return;

    setFlipped((prev) => !prev);
  };

  return (
    <div className="perspective-[1000px]">
      <motion.div
        className="relative h-[800px] w-[1000px] [transform-style:preserve-3d] bg-amber-100 border border-gray-200 rounded-lg"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        onClick={handleClick}
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
