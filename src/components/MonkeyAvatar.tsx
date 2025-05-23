import React, { useState, useEffect, useRef } from 'react';
import styles from './MonkeyAvatar.module.css';

interface MonkeyAvatarProps {
  showPassword: boolean;
  passwordFieldRef?: React.RefObject<HTMLInputElement>;
}

const MonkeyAvatar: React.FC<MonkeyAvatarProps> = ({ showPassword, passwordFieldRef }) => {
  const monkeyRef = useRef<HTMLDivElement>(null);
  const [eyePosition, setEyePosition] = useState({ x: 0, y: 0 });
  const [isAnimating, setIsAnimating] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  const [isPasswordFieldFocused, setIsPasswordFieldFocused] = useState(false);

  // Check if device is touch-enabled
  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  // Function to calculate eye position based on pointer coordinates
  const calculateEyePosition = (clientX: number, clientY: number) => {
    if (monkeyRef.current) {
      const monkeyRect = monkeyRef.current.getBoundingClientRect();
      const monkeyCenter = {
        x: monkeyRect.left + monkeyRect.width / 2,
        y: monkeyRect.top + monkeyRect.height / 2,
      };

      // Calculate the angle between pointer and monkey center
      const angle = Math.atan2(clientY - monkeyCenter.y, clientX - monkeyCenter.x);
      
      // Limit eye movement range (max 5px in any direction)
      const maxEyeMove = 5;
      const eyeX = Math.cos(angle) * maxEyeMove;
      const eyeY = Math.sin(angle) * maxEyeMove;

      // Add a small delay for more natural movement
      setTimeout(() => {
        setEyePosition({ x: eyeX, y: eyeY });
      }, 50);
    }
  };

  // Track password field focus
  useEffect(() => {
    if (!passwordFieldRef?.current) return;

    const passwordField = passwordFieldRef.current;
    
    const handleFocus = () => {
      setIsPasswordFieldFocused(true);
    };
    
    const handleBlur = () => {
      setIsPasswordFieldFocused(false);
    };
    
    const handleInput = () => {
      if (isPasswordFieldFocused && passwordField) {
        // Get caret position and field position
        const caretPosition = passwordField.selectionStart || 0;
        const fieldRect = passwordField.getBoundingClientRect();
        
        // Calculate approximate x position of caret
        // This is an approximation as exact caret position is hard to determine
        const charWidth = 8; // Approximate width of a character in pixels
        const paddingLeft = 12; // Approximate padding from CSS
        
        // Adjust for password field (dots/asterisks have consistent width)
        const effectivePosition = showPassword ? caretPosition : Math.min(caretPosition, 8);
        
        // Calculate position with a slight randomization for more natural movement
        const randomOffset = Math.random() * 2 - 1; // Between -1 and 1
        const caretX = fieldRect.left + paddingLeft + (effectivePosition * charWidth) + randomOffset;
        const caretY = fieldRect.top + (fieldRect.height / 2);
        
        // Make eyes look at caret position
        calculateEyePosition(caretX, caretY);
      }
    };
    
    passwordField.addEventListener('focus', handleFocus);
    passwordField.addEventListener('blur', handleBlur);
    passwordField.addEventListener('input', handleInput);
    passwordField.addEventListener('click', handleInput);
    passwordField.addEventListener('keyup', handleInput);
    passwordField.addEventListener('keydown', handleInput);
    passwordField.addEventListener('select', handleInput);
    passwordField.addEventListener('selectionchange', handleInput);
    
    // Set up an interval to track cursor position while field is focused
    let cursorTrackingInterval: number | null = null;
    
    if (isPasswordFieldFocused) {
      cursorTrackingInterval = window.setInterval(handleInput, 100);
    }
    
    return () => {
      passwordField.removeEventListener('focus', handleFocus);
      passwordField.removeEventListener('blur', handleBlur);
      passwordField.removeEventListener('input', handleInput);
      passwordField.removeEventListener('click', handleInput);
      passwordField.removeEventListener('keyup', handleInput);
      passwordField.removeEventListener('keydown', handleInput);
      passwordField.removeEventListener('select', handleInput);
      passwordField.removeEventListener('selectionchange', handleInput);
      
      if (cursorTrackingInterval) {
        clearInterval(cursorTrackingInterval);
      }
    };
  }, [passwordFieldRef, isPasswordFieldFocused]);

  // Track mouse movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Only follow mouse if password field is not focused
      if (!isPasswordFieldFocused) {
        calculateEyePosition(e.clientX, e.clientY);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0 && !isPasswordFieldFocused) {
        calculateEyePosition(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    // Add appropriate event listeners based on device type
    if (isTouchDevice) {
      window.addEventListener('touchmove', handleTouchMove);
    } else {
      window.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      if (isTouchDevice) {
        window.removeEventListener('touchmove', handleTouchMove);
      } else {
        window.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, [isTouchDevice, isPasswordFieldFocused]);

  // Handle password visibility change animation
  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 500); // Animation duration

    return () => clearTimeout(timer);
  }, [showPassword]);
  
  // Random blinking effect
  useEffect(() => {
    const blinkRandomly = () => {
      // Random time between 2 and 6 seconds
      const nextBlinkTime = 2000 + Math.random() * 4000;
      
      const blinkTimer = setTimeout(() => {
        if (showPassword) { // Only blink when eyes are covered (reversed logic)
          // Don't blink when hands are covering eyes
        } else {
          setIsBlinking(true);
          setTimeout(() => setIsBlinking(false), 200); // Blink duration
        }
        blinkRandomly(); // Schedule next blink
      }, nextBlinkTime);
      
      return blinkTimer;
    };
    
    const blinkTimerId = blinkRandomly();
    return () => clearTimeout(blinkTimerId);
  }, [showPassword]);

  return (
    <div ref={monkeyRef} className={styles.monkeyContainer}>
      {/* Circular background */}
      <div className={styles.monkeyBackground}></div>
      
      {/* Monkey face */}
      <div className={styles.monkeyFace}></div>
      
      {/* Ears */}
      <div className={`${styles.ear} ${styles.earLeft}`}></div>
      <div className={`${styles.ear} ${styles.earRight}`}></div>
      
      {/* Inner ears */}
      <div className={`${styles.innerEar} ${styles.innerEarLeft}`}></div>
      <div className={`${styles.innerEar} ${styles.innerEarRight}`}></div>
      
      {/* Eyes container */}
      <div className={styles.eyesContainer}>
        <div className={styles.eyes}>
          {/* Left eye */}
          <div className={isBlinking ? styles.eyeBlinking : styles.eye}>
            <div 
              className={styles.pupil}
              style={{ 
                top: `calc(50% + ${eyePosition.y}px - 6px)`, 
                left: `calc(50% + ${eyePosition.x}px - 6px)`,
                opacity: isBlinking ? 0 : 1
              }}
            ></div>
          </div>
          
          {/* Right eye */}
          <div className={isBlinking ? styles.eyeBlinking : styles.eye}>
            <div 
              className={styles.pupil}
              style={{ 
                top: `calc(50% + ${eyePosition.y}px - 6px)`, 
                left: `calc(50% + ${eyePosition.x}px - 6px)`,
                opacity: isBlinking ? 0 : 1
              }}
            ></div>
          </div>
        </div>
      </div>
      
      {/* Mouth */}
      <div className={styles.mouth}></div>
      
      {/* Nose */}
      <div className={styles.nose}></div>
      
      {/* Hands covering eyes when password is visible */}
      <div 
        className={styles.handsContainer}
        style={{ opacity: showPassword ? 1 : 0, transition: 'opacity 0.5s ease' }}
      >
        {/* Left hand */}
        <div 
          className={`${styles.hand} ${styles.handLeft}`}
          style={{ 
            transform: showPassword ? 'translateY(0)' : 'translateY(20px)',
            transition: isAnimating ? 'transform 0.5s ease' : ''
          }}
        ></div>
        
        {/* Right hand */}
        <div 
          className={`${styles.hand} ${styles.handRight}`}
          style={{ 
            transform: showPassword ? 'translateY(0)' : 'translateY(20px)',
            transition: isAnimating ? 'transform 0.5s ease' : ''
          }}
        ></div>
      </div>
    </div>
  );
};

export default MonkeyAvatar;