import { SmoothCursor } from "./magicui/smooth-cursor";
import { useCursor } from "@/context/CursorContext";

export function SmartCursor() {
  const { cursorSize, cursorEnabled, cursorColor } = useCursor();
  
  return (
    <SmoothCursor 
      size={cursorSize}
      enabled={cursorEnabled}
      color={cursorColor}
      springConfig={{
        damping: 45,
        stiffness: 400,
        mass: 1,
        restDelta: 0.001,
      }}
    />
  );
}