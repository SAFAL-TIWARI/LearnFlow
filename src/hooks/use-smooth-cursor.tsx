import { useEffect, useState } from 'react';
import { SmoothCursor, SmoothCursorProps } from '@/components/magicui/smooth-cursor';

export function useSmoothCursor(props?: SmoothCursorProps, enabled = true) {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient || !enabled) {
    return null;
  }

  return <SmoothCursor {...props} />;
}

// Example usage:
// function YourComponent() {
//   const cursor = useSmoothCursor({
//     springConfig: {
//       damping: 40,
//       stiffness: 350,
//       mass: 1,
//       restDelta: 0.001,
//     }
//   });
//
//   return (
//     <div>
//       {cursor}
//       {/* Rest of your component */}
//     </div>
//   );
// }