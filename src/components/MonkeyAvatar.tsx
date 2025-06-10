import React, { useState, useEffect, useRef } from 'react';
import styles from './MonkeyAvatar.module.css';

interface MonkeyAvatarProps {
  showPassword: boolean;
  passwordFieldRef?: React.RefObject<HTMLInputElement>;
  emailFieldRef?: React.RefObject<HTMLInputElement>;
}

const MonkeyAvatar: React.FC<MonkeyAvatarProps> = ({ showPassword, passwordFieldRef, emailFieldRef }) => {
  const monkeyRef = useRef<HTMLDivElement>(null);
  const eyeLeftRef = useRef<SVGEllipseElement>(null);
  const eyeRightRef = useRef<SVGEllipseElement>(null);
  const [isPasswordFieldFocused, setIsPasswordFieldFocused] = useState(false);
  const [isEmailFieldFocused, setIsEmailFieldFocused] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Check if device is touch-enabled
  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

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

    passwordField.addEventListener('focus', handleFocus);
    passwordField.addEventListener('blur', handleBlur);

    return () => {
      passwordField.removeEventListener('focus', handleFocus);
      passwordField.removeEventListener('blur', handleBlur);
    };
  }, [passwordFieldRef]);

  // Track email field focus
  useEffect(() => {
    if (!emailFieldRef?.current) return;

    const emailField = emailFieldRef.current;

    const handleFocus = () => {
      setIsEmailFieldFocused(true);
    };

    const handleBlur = () => {
      setIsEmailFieldFocused(false);
    };

    emailField.addEventListener('focus', handleFocus);
    emailField.addEventListener('blur', handleBlur);

    return () => {
      emailField.removeEventListener('focus', handleFocus);
      emailField.removeEventListener('blur', handleBlur);
    };
  }, [emailFieldRef]);

  // Handle password visibility change animation
  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 500); // Animation duration

    return () => clearTimeout(timer);
  }, [showPassword]);

  // Track mouse movement for eye following
  useEffect(() => {
    if (isTouchDevice) return; // Skip for touch devices

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isTouchDevice]);

  // Update eye position based on mouse coordinates
  useEffect(() => {
    if (isTouchDevice || isPasswordFieldFocused || isEmailFieldFocused) return; // Skip when text inputs are focused or on touch devices
    
    if (eyeLeftRef.current && eyeRightRef.current && monkeyRef.current) {
      const monkeyRect = monkeyRef.current.getBoundingClientRect();
      const monkeyCenter = {
        x: monkeyRect.left + monkeyRect.width / 2,
        y: monkeyRect.top + monkeyRect.height / 2
      };
      
      // Calculate direction vector from monkey to cursor
      const dx = mousePosition.x - monkeyCenter.x;
      const dy = mousePosition.y - monkeyCenter.y;
      
      // Limit the eye movement (1.5px maximum displacement)
      const maxEyeMovement = 1.5;
      // Normalize and scale the movement
      const distance = Math.sqrt(dx * dx + dy * dy);
      const normalizedDx = distance > 0 ? (dx / distance) * maxEyeMovement : 0;
      const normalizedDy = distance > 0 ? (dy / distance) * maxEyeMovement : 0;
      
      // Apply the transformation to eyes
      eyeLeftRef.current.style.transform = `translate(${normalizedDx}px, ${normalizedDy}px)`;
      eyeRightRef.current.style.transform = `translate(${normalizedDx}px, ${normalizedDy}px)`;
    }
  }, [mousePosition, isTouchDevice, isPasswordFieldFocused, isEmailFieldFocused]);

  // Determine CSS classes based on state
  const containerClasses = [
    styles.monkeyContainer,
    (isPasswordFieldFocused || isEmailFieldFocused) ? styles.inputFocused : '',
    showPassword ? styles.showPassword : ''
  ].filter(Boolean).join(' ');

  return (
    <div 
      ref={monkeyRef} 
      className={containerClasses}
    >
      {/* Monkey SVG */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="35"
        height="35"
        viewBox="0 0 64 64"
        className={styles.monkeySvg}
      >
        <ellipse cx="53.7" cy="33" rx="8.3" ry="8.2" fill="#89664c"></ellipse>
        <ellipse cx="53.7" cy="33" rx="5.4" ry="5.4" fill="#ffc5d3"></ellipse>
        <ellipse cx="10.2" cy="33" rx="8.2" ry="8.2" fill="#89664c"></ellipse>
        <ellipse cx="10.2" cy="33" rx="5.4" ry="5.4" fill="#ffc5d3"></ellipse>
        <g fill="#89664c">
          <path
            d="m43.4 10.8c1.1-.6 1.9-.9 1.9-.9-3.2-1.1-6-1.8-8.5-2.1 1.3-1 2.1-1.3 2.1-1.3-20.4-2.9-30.1 9-30.1 19.5h46.4c-.7-7.4-4.8-12.4-11.8-15.2"
          ></path>
          <path
            d="m55.3 27.6c0-9.7-10.4-17.6-23.3-17.6s-23.3 7.9-23.3 17.6c0 2.3.6 4.4 1.6 6.4-1 2-1.6 4.2-1.6 6.4 0 9.7 10.4 17.6 23.3 17.6s23.3-7.9 23.3-17.6c0-2.3-.6-4.4-1.6-6.4 1-2 1.6-4.2 1.6-6.4"
          ></path>
        </g>
        <path
          d="m52 28.2c0-16.9-20-6.1-20-6.1s-20-10.8-20 6.1c0 4.7 2.9 9 7.5 11.7-1.3 1.7-2.1 3.6-2.1 5.7 0 6.1 6.6 11 14.7 11s14.7-4.9 14.7-11c0-2.1-.8-4-2.1-5.7 4.4-2.7 7.3-7 7.3-11.7"
          fill="#e0ac7e"
        ></path>
        <g fill="#3b302a" className={styles.monkeyEyeNose}>
          <path
            d="m35.1 38.7c0 1.1-.4 2.1-1 2.1-.6 0-1-.9-1-2.1 0-1.1.4-2.1 1-2.1.6.1 1 1 1 2.1"
          ></path>
          <path
            d="m30.9 38.7c0 1.1-.4 2.1-1 2.1-.6 0-1-.9-1-2.1 0-1.1.4-2.1 1-2.1.5.1 1 1 1 2.1"
          ></path>
          <ellipse
            ref={eyeRightRef}
            cx="40.7"
            cy="31.7"
            rx="3.5"
            ry="4.5"
            className={styles.monkeyEyeR}
          ></ellipse>
          <ellipse
            ref={eyeLeftRef}
            cx="23.3"
            cy="31.7"
            rx="3.5"
            ry="4.5"
            className={styles.monkeyEyeL}
          ></ellipse>
        </g>
      </svg>

      {/* Monkey Hands SVG */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="35"
        height="35"
        viewBox="0 0 64 64"
        className={styles.monkeyHandsSvg}
        style={{
          transition: isAnimating ? 'transform 0.5s ease' : ''
        }}
      >
        <path
          fill="#89664C"
          d="M9.4,32.5L2.1,61.9H14c-1.6-7.7,4-21,4-21L9.4,32.5z"
        ></path>
        <path
          fill="#FFD6BB"
          d="M15.8,24.8c0,0,4.9-4.5,9.5-3.9c2.3,0.3-7.1,7.6-7.1,7.6s9.7-8.2,11.7-5.6c1.8,2.3-8.9,9.8-8.9,9.8
          s10-8.1,9.6-4.6c-0.3,3.8-7.9,12.8-12.5,13.8C11.5,43.2,6.3,39,9.8,24.4C11.6,17,13.3,25.2,15.8,24.8"
        ></path>
        <path
          fill="#89664C"
          d="M54.8,32.5l7.3,29.4H50.2c1.6-7.7-4-21-4-21L54.8,32.5z"
        ></path>
        <path
          fill="#FFD6BB"
          d="M48.4,24.8c0,0-4.9-4.5-9.5-3.9c-2.3,0.3,7.1,7.6,7.1,7.6s-9.7-8.2-11.7-5.6c-1.8,2.3,8.9,9.8,8.9,9.8
          s-10-8.1-9.7-4.6c0.4,3.8,8,12.8,12.6,13.8c6.6,1.3,11.8-2.9,8.3-17.5C52.6,17,50.9,25.2,48.4,24.8"
        ></path>
      </svg>
    </div>
  );
};

export default MonkeyAvatar;