import { cn } from "@/lib/utils";
import React from "react";
import { AnimatePresence, HTMLMotionProps, motion } from "framer-motion";

const animationVariants = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 24 },
};

interface IAmountProps extends HTMLMotionProps<"div"> {
  value: number;
  includeDollar?: boolean;
  includeCommas?: boolean;
  decimalPlaces?: number;
}

function Amount({
  className,
  value,
  includeDollar = false,
  includeCommas = true,
  decimalPlaces = 2,
  ...props
}: IAmountProps) {
  const amount = includeCommas
    ? Number(value.toFixed(2)).toLocaleString()
    : value.toFixed(decimalPlaces);
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={value}
        variants={animationVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className={cn("font-mono", className)}
        {...props}
      >
        {includeDollar && `$`}
        {amount}
      </motion.div>
    </AnimatePresence>
  );
}

export default Amount;
