# MagicUI Components

This directory contains enhanced UI components with interactive animations and effects.

## Smooth Cursor

`SmoothCursor` is a React component that replaces the default cursor with a smooth, physics-based animated cursor.

### Features

- Spring physics for natural movement
- Rotation based on cursor direction
- Scale animation on movement
- Mobile support with touch events
- Customizable appearance

### Basic Usage

```jsx
import { SmoothCursor } from "@/components/magicui/smooth-cursor";

function YourPage() {
  return (
    <>
      <SmoothCursor />
      {/* Your page content */}
    </>
  );
}
```

### Advanced Configuration

```jsx
import { SmoothCursor } from "@/components/magicui/smooth-cursor";

function YourPage() {
  // Custom cursor component
  const CustomCursor = () => (
    <div className="w-8 h-8 bg-blue-500 rounded-full opacity-70" />
  );

  return (
    <>
      <SmoothCursor 
        cursor={<CustomCursor />}
        springConfig={{
          damping: 40,      // Lower = more oscillation
          stiffness: 350,   // Higher = faster movement
          mass: 1,          // Higher = more inertia
          restDelta: 0.001  // Precision of rest position
        }}
      />
      {/* Your page content */}
    </>
  );
}
```

### Using the Hook

For easier integration, use the `useSmoothCursor` hook:

```jsx
import { useSmoothCursor } from "@/hooks/use-smooth-cursor";

function YourPage() {
  const cursor = useSmoothCursor({
    springConfig: {
      damping: 40,
      stiffness: 350,
      mass: 1,
      restDelta: 0.001,
    }
  });

  return (
    <div>
      {cursor}
      {/* Rest of your component */}
    </div>
  );
}
```

### Tips

- Place the cursor component at the end of your JSX to ensure it renders on top of other elements
- Adjust `damping` and `stiffness` values to change the feel of the cursor movement
- For performance reasons, only use one instance of `SmoothCursor` per page
- If you have interactive elements, ensure they have proper hover states even with cursor: none