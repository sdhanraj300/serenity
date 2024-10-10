type Direction = "left" | "right" | "top" | "bottom";
export const slideIn = (
  direction: Direction,
  type: "tween" | "spring",
  delay: number,
  duration: number
) => ({
  hidden: {
    x: direction === "left" ? "-100%" : direction === "right" ? "100%" : "0%",
    y: direction === "top" ? "-100%" : direction === "bottom" ? "100%" : "0%",
  },
  visible: {
    x: "0%",
    y: "0%",
    transition: {
      type,
      delay,
      duration,
      ...(type === "spring"
        ? { stiffness: 100, damping: 30, mass: 1 } // Adjust these values
        : { ease: "easeInOut" }),
    },
  },
});

export const imageVariants = (direction: Direction) => ({
  hidden: {
    x: direction === "left" ? "-100%" : "100%",
    rotate: 120,
  },
  show: {
    x: 0,
    rotate: 0,
    transition: {
      type: "spring",
      duration: 1.8,
      delay: 0.5,
    },
  },
});
