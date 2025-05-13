import React, { useEffect, useState } from "react";
import {
  motion,
  useMotionValue,
  useAnimation,
  useTransform,
  PanInfo,
} from "framer-motion";

interface RollingGalleryProps {
  autoplay?: boolean;
  pauseOnHover?: boolean;
  items: React.ReactNode[];
}

const RollingGallery: React.FC<RollingGalleryProps> = ({
  autoplay = false,
  pauseOnHover = false,
  items = [],
}) => {
  const [screenWidth, setScreenWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 3D geometry calculations based on screen size
  let cylinderWidth: number;
  let faceWidth: number;
  
  if (screenWidth <= 480) {
    // Extra small screens (mobile)
    cylinderWidth = 800;
  } else if (screenWidth <= 640) {
    // Small screens
    cylinderWidth = 1000;
  } else if (screenWidth <= 768) {
    // Medium screens
    cylinderWidth = 1200;
  } else if (screenWidth <= 1024) {
    // Large screens
    cylinderWidth = 2000;
  } else {
    // Extra large screens
    cylinderWidth = 2000;
  }
  
  const faceCount: number = items.length;
  // Adjust face width based on screen size
  faceWidth = Math.min((cylinderWidth / faceCount) * 1.5, screenWidth * 0.7);
  
  // Calculate radius - adjust for different screen sizes to prevent overlapping
  let radiusAdjustment;
  if (screenWidth <= 480) {
    radiusAdjustment = 1.5; // Extra space for very small screens
  } else if (screenWidth <= 640) {
    radiusAdjustment = 1.4; // More space for small screens
  } else if (screenWidth <= 768) {
    radiusAdjustment = 1.2; // Slightly more space for medium screens
  } else {
    radiusAdjustment = 1; // Default for larger screens
  }
  
  const radius: number = (cylinderWidth / (2 * Math.PI)) * radiusAdjustment;

  // Framer Motion values and controls
  const dragFactor: number = 0.05;
  const rotation = useMotionValue(0);
  const controls = useAnimation();

  // Create a 3D transform based on the rotation motion value
  const transform = useTransform(
    rotation,
    (val: number) => `rotate3d(0,1,0,${val}deg)`
  );

  const startInfiniteSpin = (startAngle: number) => {
    controls.start({
      rotateY: [startAngle, startAngle - 360],
      transition: {
        duration: 15,
        ease: "linear",
        repeat: Infinity,
      },
    });
  };

  useEffect(() => {
    if (autoplay) {
      const currentAngle = rotation.get();
      startInfiniteSpin(currentAngle);
    } else {
      controls.stop();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay]);

  const handleUpdate = (latest: any) => {
    if (typeof latest.rotateY === "number") {
      rotation.set(latest.rotateY);
    }
  };

  const handleDrag = (_: any, info: PanInfo): void => {
    controls.stop();
    rotation.set(rotation.get() + info.offset.x * dragFactor);
  };

  const handleDragEnd = (_: any, info: PanInfo): void => {
    const finalAngle = rotation.get() + info.velocity.x * dragFactor;
    rotation.set(finalAngle);
    if (autoplay) {
      startInfiniteSpin(finalAngle);
    }
  };

  const handleMouseEnter = (): void => {
    if (autoplay && pauseOnHover) {
      controls.stop();
    }
  };

  const handleMouseLeave = (): void => {
    if (autoplay && pauseOnHover) {
      const currentAngle = rotation.get();
      startInfiniteSpin(currentAngle);
    }
  };

  return (
    <div className="rolling-gallery-container relative h-[400px] sm:h-[450px] md:h-[500px] w-full overflow-hidden px-6 sm:px-12 md:px-16">
      <div
        className="absolute top-0 left-0 h-full w-[0px] sm:w-[30px] z-10"
        style={{
          background:
            "linear-gradient(to left, rgba(0,0,0,0) 0%, var(--bg-gradient-end,rgba(249, 250, 251, 0.14)) 100%)",
        }}
      />
      <div
        className="absolute top-0 right-0 h-full w-[0px] sm:w-[30px] z-10"
        style={{
          background:
            "linear-gradient(to right, rgba(0,0,0,0) 0%, var(--bg-gradient-end,rgba(249, 250, 251, 0.14)) 100%)",
        }}
      />
      <div className="rolling-gallery-wrapper flex h-full items-center justify-center [perspective:1000px] [transform-style:preserve-3d]">
        <motion.div
          drag="x"
          dragElastic={0}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          animate={controls}
          onUpdate={handleUpdate}
          style={{
            transform: transform,
            rotateY: rotation,
            width: cylinderWidth,
            transformStyle: "preserve-3d",
          }}
          className="flex min-h-[200px] cursor-grab items-center justify-center [transform-style:preserve-3d]"
        >
          {items.map((item, i) => {
            // Calculate angle for each item
            const angle = (360 / faceCount) * i;
            
            // Only render items that are potentially visible
            // This helps with performance and prevents overlapping on small screens
            let isVisible;
            
            if (screenWidth <= 480) {
              // For very small screens, show fewer items like mobile
              isVisible = (angle <= 30 || angle >= 25 || (angle >= 135 && angle <= 225));
            } else if (screenWidth <= 640) {
              // For small screens
              isVisible = (angle <= 60 || angle >= 300 || (angle >= 120 && angle <= 240));
            } else {
              // For larger screens, show all items
              
              isVisible = true;
            }
              
            return isVisible ? (
              <div
                key={i}
                className="rolling-gallery-item group absolute flex h-fit items-center justify-center p-[4%] sm:p-[6%] md:p-[8%] [backface-visibility:hidden]"
                style={{
                  width: `${faceWidth}px`,
                  transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
                  opacity: screenWidth <= 480 ? (angle <= 30 || angle >= 30 || (angle >= 150 && angle <= 210) ? 1 : 0.6) : 1,
                }}
              >
                {item}
              </div>
            ) : null;
          })}
        </motion.div>
      </div>
    </div>
  );
};

export default RollingGallery;