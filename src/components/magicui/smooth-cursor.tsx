"use client";

import { motion, useSpring } from "framer-motion";
import { FC, JSX, useEffect, useRef, useState } from "react";

interface Position {
  x: number;
  y: number;
}

export interface SmoothCursorProps {
  cursor?: JSX.Element;
  springConfig?: {
    damping: number;
    stiffness: number;
    mass: number;
    restDelta: number;
  };
  size?: 'small' | 'medium' | 'large' | number;
  color?: string;
  enabled?: boolean;
}

interface DefaultCursorProps {
  color?: string;
  size?: 'small' | 'medium' | 'large' | number;
}

const DefaultCursorSVG: FC<DefaultCursorProps> = ({ color = '#000000', size = 'small' }) => {
  // Convert size to a numeric scale
  let scaleValue = 0.5; // Default medium size
  
  if (size === 'small') {
    scaleValue = 0.35;
  } else if (size === 'medium') {
    scaleValue = 0.5;
  } else if (size === 'large') {
    scaleValue = 0.7;
  } else if (typeof size === 'number') {
    scaleValue = size / 100; // Convert percentage to scale
  }
  
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={30}
      height={35}
      viewBox="0 0 50 54"
      fill="none"
      style={{ scale: scaleValue }}
    >
      <g filter="url(#filter0_d_91_7928)">
        <path
          d="M42.6817 41.1495L27.5103 6.79925C26.7269 5.02557 24.2082 5.02558 23.3927 6.79925L7.59814 41.1495C6.75833 42.9759 8.52712 44.8902 10.4125 44.1954L24.3757 39.0496C24.8829 38.8627 25.4385 38.8627 25.9422 39.0496L39.8121 44.1954C41.6849 44.8902 43.4884 42.9759 42.6817 41.1495Z"
          fill={color}
        />
        <path
          d="M43.7146 40.6933L28.5431 6.34306C27.3556 3.65428 23.5772 3.69516 22.3668 6.32755L6.57226 40.6778C5.3134 43.4156 7.97238 46.298 10.803 45.2549L24.7662 40.109C25.0221 40.0147 25.2999 40.0156 25.5494 40.1082L39.4193 45.254C42.2261 46.2953 44.9254 43.4347 43.7146 40.6933Z"
          stroke="white"
          strokeWidth={2.25825}
        />
      </g>
      <defs>
        <filter
          id="filter0_d_91_7928"
          x={0.602397}
          y={0.952444}
          width={49.0584}
          height={52.428}
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity={0} result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy={2.25825} />
          <feGaussianBlur stdDeviation={2.25825} />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.08 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_91_7928"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_91_7928"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
  );
};

// Function to detect if device is desktop/laptop (has a cursor)
const isDesktopDevice = () => {
  if (typeof window === 'undefined') return false;
  
  // Check for touch capability - if primary input is touch, it's likely mobile/tablet
  const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  // Check user agent for mobile/tablet indicators
  const userAgent = navigator.userAgent.toLowerCase();
  const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/i.test(userAgent);
  
  // Check screen size - tablets and phones typically have smaller screens
  const isSmallScreen = window.innerWidth < 1024; // Less than typical laptop width
  
  // Check for pointer type - 'fine' indicates mouse/trackpad, 'coarse' indicates touch
  const hasFinePrimaryPointer = window.matchMedia('(pointer: fine)').matches;
  
  // Device is considered desktop if:
  // 1. Has fine pointer (mouse/trackpad) AND
  // 2. Not identified as mobile in user agent AND
  // 3. Either has no touch screen OR has large screen (hybrid devices like Surface)
  return hasFinePrimaryPointer && !isMobileUA && (!hasTouchScreen || !isSmallScreen);
};

export function SmoothCursor({
  cursor,
  springConfig = {
    damping: 45,
    stiffness: 400,
    mass: 1,
    restDelta: 0.001,
  },
  size = 'medium',
  color = '#000000',
  enabled = true,
}: SmoothCursorProps) {
  // If cursor is not provided, use the default cursor with the specified size and color
  const defaultCursor = <DefaultCursorSVG size={size} color={color} />;
  const cursorElement = cursor || defaultCursor;
  const [isMoving, setIsMoving] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const lastMousePos = useRef<Position>({ x: 0, y: 0 });
  const velocity = useRef<Position>({ x: 0, y: 0 });
  const lastUpdateTime = useRef(Date.now());
  const previousAngle = useRef(0);
  const accumulatedRotation = useRef(0);

  const cursorX = useSpring(0, springConfig);
  const cursorY = useSpring(0, springConfig);
  const rotation = useSpring(0, {
    ...springConfig,
    damping: 60,
    stiffness: 300,
  });
  const scale = useSpring(1, {
    ...springConfig,
    stiffness: 500,
    damping: 35,
  });

  useEffect(() => {
    // Check if device is desktop on mount
    setIsDesktop(isDesktopDevice());
  }, []);

  useEffect(() => {
    // If cursor is disabled or not on desktop device, don't do anything
    if (!enabled || !isDesktop) {
      document.body.style.cursor = "auto";
      return;
    }
    
    const updateVelocity = (currentPos: Position) => {
      const currentTime = Date.now();
      const deltaTime = currentTime - lastUpdateTime.current;

      if (deltaTime > 0) {
        velocity.current = {
          x: (currentPos.x - lastMousePos.current.x) / deltaTime,
          y: (currentPos.y - lastMousePos.current.y) / deltaTime,
        };
      }

      lastUpdateTime.current = currentTime;
      lastMousePos.current = currentPos;
    };

    const smoothMouseMove = (e: MouseEvent) => {
      const currentPos = { x: e.clientX, y: e.clientY };
      updateVelocity(currentPos);

      const speed = Math.sqrt(
        Math.pow(velocity.current.x, 2) + Math.pow(velocity.current.y, 2),
      );

      cursorX.set(currentPos.x);
      cursorY.set(currentPos.y);

      if (speed > 0.1) {
        const currentAngle =
          Math.atan2(velocity.current.y, velocity.current.x) * (180 / Math.PI) +
          90;

        let angleDiff = currentAngle - previousAngle.current;
        if (angleDiff > 180) angleDiff -= 360;
        if (angleDiff < -180) angleDiff += 360;
        accumulatedRotation.current += angleDiff;
        rotation.set(accumulatedRotation.current);
        previousAngle.current = currentAngle;

        scale.set(0.95);
        setIsMoving(true);

        const timeout = setTimeout(() => {
          scale.set(1);
          setIsMoving(false);
        }, 150);

        return () => clearTimeout(timeout);
      }
    };

    let rafId: number;
    const throttledMouseMove = (e: MouseEvent) => {
      if (rafId) return;

      rafId = requestAnimationFrame(() => {
        smoothMouseMove(e);
        rafId = 0;
      });
    };

    document.body.style.cursor = "none";
    window.addEventListener("mousemove", throttledMouseMove);
    
    return () => {
      window.removeEventListener("mousemove", throttledMouseMove);
      document.body.style.cursor = "auto";
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [cursorX, cursorY, rotation, scale, enabled, isDesktop]);

  // If cursor is disabled or not on desktop device, don't render anything
  if (!enabled || !isDesktop) {
    return null;
  }

  return (
    <motion.div
      style={{
        position: "fixed",
        left: cursorX,
        top: cursorY,
        translateX: "-50%",
        translateY: "-50%",
        rotate: rotation,
        scale: scale,
        zIndex: 100,
        pointerEvents: "none",
        willChange: "transform",
      }}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 30,
      }}
    >
      {cursorElement}
    </motion.div>
  );
}