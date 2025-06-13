/**
 * CircularGallery Component
 * 
 * Features mobile-specific scrolling configuration for better touch experience:
 * - Vertical scroll gestures control horizontal card rotation on mobile
 * - Configurable scroll speed multiplier (default: 2.5x faster than desktop)
 * - Momentum scrolling with customizable decay
 * - Haptic feedback support
 * - Scroll threshold to prevent accidental scrolling
 * 
 * Usage:
 * <CircularGallery 
 *   items={galleryItems}
 *   mobileScrollConfig={{
 *     verticalScrollSpeedMultiplier: 3.0, // Custom speed
 *     enableMomentumScrolling: true,
 *     enableHapticFeedback: false
 *   }}
 * />
 */

import { useRef, useEffect } from "react";
import {
  Renderer,
  Camera,
  Transform,
  Plane,
  Mesh,
  Program,
  Texture,
} from "ogl";

type GL = Renderer["gl"];

function debounce<T extends (...args: any[]) => void>(func: T, wait: number) {
  let timeout: number;
  return function (this: any, ...args: Parameters<T>) {
    window.clearTimeout(timeout);
    timeout = window.setTimeout(() => func.apply(this, args), wait);
  };
}

function lerp(p1: number, p2: number, t: number): number {
  return p1 + (p2 - p1) * t;
}

function autoBind(instance: any): void {
  const proto = Object.getPrototypeOf(instance);
  Object.getOwnPropertyNames(proto).forEach((key) => {
    if (key !== "constructor" && typeof instance[key] === "function") {
      instance[key] = instance[key].bind(instance);
    }
  });
}

function getFontSize(font: string): number {
  const match = font.match(/(\d+)px/);
  return match ? parseInt(match[1], 10) : 30;
}

function createTextTexture(
  gl: GL,
  text: string,
  font: string = "bold 30px monospace",
  color: string = "black"
): { texture: Texture; width: number; height: number } {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not get 2d context");

  context.font = font;
  const metrics = context.measureText(text);
  const textWidth = Math.ceil(metrics.width);
  const fontSize = getFontSize(font);
  const textHeight = Math.ceil(fontSize * 1.2);

  canvas.width = textWidth + 20;
  canvas.height = textHeight + 20;

  context.font = font;
  context.fillStyle = color;
  context.textBaseline = "middle";
  context.textAlign = "center";
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new Texture(gl, { generateMipmaps: false });
  texture.image = canvas;
  return { texture, width: canvas.width, height: canvas.height };
}

interface TextPositionSettings {
  // Icon positioning
  iconYOffset?: number; // Percentage offset from default position (0.12)
  iconSize?: number; // Multiplier for icon size (1.0 = default)
  
  // Title positioning
  titleYOffset?: number; // Percentage offset from default position (0.28)
  titleMaxWidthPercent?: number; // Percentage of card width for title (0.85 = default)
  titleAlignment?: 'left' | 'center' | 'right';
  
  // Description positioning
  descriptionYOffset?: number; // Percentage offset from default position (0.4)
  descriptionMaxWidthPercent?: number; // Percentage of card width for description (0.88 = default)
  descriptionAlignment?: 'left' | 'center' | 'right';
  descriptionLineHeight?: number; // Multiplier for line height (1.0 = default)
  descriptionMaxLines?: number; // Override max lines
  
  // Link text positioning
  linkYOffset?: number; // Percentage offset from default position (0.9)
  linkMaxWidthPercent?: number; // Percentage of card width for link text (0.85 = default)
  linkAlignment?: 'left' | 'center' | 'right';
  
  // General padding
  horizontalPadding?: number; // Additional horizontal padding multiplier
  verticalPadding?: number; // Additional vertical padding multiplier
}

// Mobile-specific scrolling configuration
interface MobileScrollConfig {
  // Enable vertical scroll to control horizontal rotation on mobile
  enableVerticalScroll?: boolean;
  
  // Speed multiplier for vertical scroll gesture (higher = faster scrolling)
  verticalScrollSpeedMultiplier?: number;
  
  // Minimum scroll threshold to prevent accidental scrolling
  scrollThreshold?: number;
  
  // Enable momentum scrolling (continues scrolling after gesture ends)
  enableMomentumScrolling?: boolean;
  
  // Momentum decay factor (0-1, lower = longer momentum)
  momentumDecay?: number;
  
  // Maximum momentum speed
  maxMomentumSpeed?: number;
  
  // Enable haptic feedback on supported devices
  enableHapticFeedback?: boolean;
  
  // Scroll direction sensitivity (1 = normal, -1 = inverted)
  scrollDirectionMultiplier?: number;
}

// Default mobile scroll configuration
const DEFAULT_MOBILE_SCROLL_CONFIG: MobileScrollConfig = {
  enableVerticalScroll: true,
  verticalScrollSpeedMultiplier: 10, // 2.5x faster than desktop for better mobile experience
  scrollThreshold: 5, // Minimum pixel movement to register as scroll
  enableMomentumScrolling: true,
  momentumDecay: 0.95, // Smooth momentum decay
  maxMomentumSpeed: 15, // Maximum momentum speed
  enableHapticFeedback: true,
  scrollDirectionMultiplier: 1 // Normal direction (positive = right, negative = left)
};

async function createCardTexture(
  gl: GL,
  title: string,
  description: string,
  iconSvg: string,
  linkText: string,
  bgColor: string = "#ffffff",
  textColor: string = "#000000",
  textSettings: TextPositionSettings = {}
): Promise<{ texture: Texture; width: number; height: number }>{
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not get 2d context");

  // Extract settings with defaults
  const {
    iconYOffset = 0,
    iconSize = 1.0,
    titleYOffset = 0,
    titleMaxWidthPercent = 0.85,
    titleAlignment = 'center',
    descriptionYOffset = 0,
    descriptionMaxWidthPercent = 0.45,
    descriptionAlignment = 'center',
    descriptionLineHeight = 1.5,
    descriptionMaxLines,
    linkYOffset = 0,
    linkMaxWidthPercent = 0.85,
    linkAlignment = 'center',
    horizontalPadding = 1.0,
    verticalPadding = 1.0
  } = textSettings;

  // Detect if we're on a mobile device for responsive design
  const isMobile = window.innerWidth <= 768;
  
  // Set canvas dimensions with better mobile scaling
  const isVerySmall = window.innerWidth <= 480;
  let width, height;
  
  if (isVerySmall) {
    width = 400;
    height = 350;
  } else if (isMobile) {
    width = 480;
    height = 380;
  } else {
    width = 550;
    height = 550;
  }
  canvas.width = width;
  canvas.height = height;

  // Clear and set background
  context.fillStyle = bgColor;
  context.fillRect(0, 0, width, height);

  // Draw border radius (optional) with better padding
  context.strokeStyle = "rgba(255,255,255,0.2)";
  context.lineWidth = 2;
  const borderPadding = (isVerySmall ? 1 : (isMobile ? 1 : 2)) * horizontalPadding;
  context.strokeRect(borderPadding, borderPadding, width - borderPadding * 2, height - borderPadding * 2);

  // Draw SVG icon
  const tempImg = new Image();
  tempImg.src = 'data:image/svg+xml;base64,' + btoa(iconSvg);
  
  // We need to ensure the image is loaded before drawing
  return new Promise<{ texture: Texture; width: number; height: number }>((resolve) => {
    tempImg.onload = () => {
      // Draw icon at the top with responsive sizing and custom positioning
      const baseIconSize = isVerySmall ? 40 : (isMobile ? 55 : 70);
      const adjustedIconSize = baseIconSize * iconSize;
      const iconX = (width - adjustedIconSize) / 2;
      const baseIconY = height * (isVerySmall ? 0.1 : 0.12);
      const iconY = baseIconY + (height * iconYOffset * verticalPadding);
      context.drawImage(tempImg, iconX, iconY, adjustedIconSize, adjustedIconSize);

      // Draw title with custom positioning and alignment
      context.font = isVerySmall ? 'bold 19px Inter' : (isMobile ? 'bold 22px Inter' : 'bold 28px Inter');
      context.fillStyle = textColor;
      context.textAlign = titleAlignment;
      context.textBaseline = 'middle';
      
      // Ensure title fits within bounds with custom width
      const titleMaxWidth = width * titleMaxWidthPercent * horizontalPadding;
      let titleText = title;
      const titleMetrics = context.measureText(titleText);
      if (titleMetrics.width > titleMaxWidth) {
        // Truncate title if too long
        while (context.measureText(titleText + '...').width > titleMaxWidth && titleText.length > 0) {
          titleText = titleText.slice(0, -1);
        }
        titleText += '...';
      }
      
      // Calculate title X position based on alignment
      let titleX = width / 2; // center default
      if (titleAlignment === 'left') {
        titleX = borderPadding + (titleMaxWidth * 0.1);
      } else if (titleAlignment === 'right') {
        titleX = width - borderPadding - (titleMaxWidth * 0.1);
      }
      
      const baseTitleY = height * (isVerySmall ? 0.28 : 0.30);
      const titleY = baseTitleY + (height * titleYOffset * verticalPadding);
      context.fillText(titleText, titleX, titleY);

      // Draw description with custom positioning and alignment
      context.font = isVerySmall ? '14px Inter' : (isMobile ? '16px Inter' : '21px Inter');
      context.textAlign = descriptionAlignment;
      const maxWidth = width * descriptionMaxWidthPercent * horizontalPadding;
      const baseLineHeight = isVerySmall ? 19 : (isMobile ? 22 : 27);
      const lineHeight = baseLineHeight * descriptionLineHeight;
      const words = description.split(' ');
      let line = '';
      const baseY = height * (isVerySmall ? 0.38 : 0.4);
      let y = baseY + (height * descriptionYOffset * verticalPadding);
      const defaultMaxLines = isVerySmall ? 5 : (isMobile ? 6 : 8);
      const maxLines = descriptionMaxLines || defaultMaxLines;
      let lineCount = 0;
      let wordIndex = 0;

      // Calculate description X position based on alignment
      let descriptionX = width / 2; // center default
      if (descriptionAlignment === 'left') {
        descriptionX = borderPadding + (maxWidth * 0.1);
      } else if (descriptionAlignment === 'right') {
        descriptionX = width - borderPadding - (maxWidth * 0.1);
      }

      while (wordIndex < words.length && lineCount < maxLines) {
        const word = words[wordIndex];
        const testLine = line + (line ? ' ' : '') + word;
        const metrics = context.measureText(testLine);
        
        if (metrics.width > maxWidth && line !== '') {
          // Current line is full, draw it and start a new line
          context.fillText(line, descriptionX, y);
          line = word;
          y += lineHeight;
          lineCount++;
          wordIndex++;
        } else if (metrics.width > maxWidth && line === '') {
          // Single word is too long, truncate it
          let truncatedWord = word;
          while (context.measureText(truncatedWord + '...').width > maxWidth && truncatedWord.length > 0) {
            truncatedWord = truncatedWord.slice(0, -1);
          }
          line = truncatedWord + '...';
          wordIndex++;
        } else {
          // Word fits, add it to current line
          line = testLine;
          wordIndex++;
        }
      }
      
      // Handle the last line
      if (line.length > 0) {
        // Check if there are more words that couldn't fit
        if (wordIndex < words.length && lineCount >= maxLines - 1) {
          // Need to add ellipsis
          while (context.measureText(line + '...').width > maxWidth && line.length > 0) {
            const lineWords = line.split(' ');
            if (lineWords.length > 1) {
              lineWords.pop();
              line = lineWords.join(' ');
            } else {
              // Single word, truncate it
              line = line.slice(0, -1);
            }
          }
          if (line.length > 0) {
            line += '...';
          }
        }
        context.fillText(line, descriptionX, y);
      }

      // Draw link text at bottom with custom positioning and alignment
      context.font = isVerySmall ? 'bold 14px Inter' : (isMobile ? 'bold 15px Inter' : 'bold 22px Inter');
      context.fillStyle = textColor;
      context.textAlign = linkAlignment;
      context.textBaseline = 'middle';
      
      // Ensure link text fits within bounds with custom width
      const linkMaxWidth = width * linkMaxWidthPercent * horizontalPadding;
      let linkTextDisplay = linkText;
      const linkMetrics = context.measureText(linkTextDisplay);
      if (linkMetrics.width > linkMaxWidth) {
        while (context.measureText(linkTextDisplay + '...').width > linkMaxWidth && linkTextDisplay.length > 0) {
          linkTextDisplay = linkTextDisplay.slice(0, -1);
        }
        linkTextDisplay += '...';
      }
      
      // Calculate link X position based on alignment
      let linkX = width / 2; // center default
      if (linkAlignment === 'left') {
        linkX = borderPadding + (linkMaxWidth * 0.1);
      } else if (linkAlignment === 'right') {
        linkX = width - borderPadding - (linkMaxWidth * 0.1);
      }
      
      const baseLinkY = height * (isVerySmall ? 0.92 : 0.9);
      const linkY = baseLinkY + (height * linkYOffset * verticalPadding);
      context.fillText(linkTextDisplay, linkX, linkY);

      // Create and return the texture
      const texture = new Texture(gl, { generateMipmaps: false });
      texture.image = canvas;
      resolve({ texture, width: canvas.width, height: canvas.height });
    };
  });
}

// Helper function to wrap text
function wrapText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(' ');
  let line = '';
  
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = context.measureText(testLine);
    const testWidth = metrics.width;
    
    if (testWidth > maxWidth && n > 0) {
      context.fillText(line, x, y);
      line = words[n] + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  
  context.fillText(line, x, y);
}

interface TitleProps {
  gl: GL;
  plane: Mesh;
  renderer: Renderer;
  text: string;
  textColor?: string;
  font?: string;
}

class Title {
  gl: GL;
  plane: Mesh;
  renderer: Renderer;
  text: string;
  textColor: string;
  font: string;
  mesh!: Mesh;

  constructor({
    gl,
    plane,
    renderer,
    text,
    textColor = "#545050",
    font = "30px sans-serif",
  }: TitleProps) {
    autoBind(this);
    this.gl = gl;
    this.plane = plane;
    this.renderer = renderer;
    this.text = text;
    this.textColor = textColor;
    this.font = font;
    this.createMesh();
  }

  createMesh() {
    const { texture, width, height } = createTextTexture(
      this.gl,
      this.text,
      this.font,
      this.textColor
    );
    const geometry = new Plane(this.gl);
    const program = new Program(this.gl, {
      vertex: `
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragment: `
        precision highp float;
        uniform sampler2D tMap;
        varying vec2 vUv;
        void main() {
          vec4 color = texture2D(tMap, vUv);
          if (color.a < 0.1) discard;
          gl_FragColor = color;
        }
      `,
      uniforms: { tMap: { value: texture } },
      transparent: true,
    });
    this.mesh = new Mesh(this.gl, { geometry, program });
    const aspect = width / height;
    const textHeightScaled = this.plane.scale.y * 0.15;
    const textWidthScaled = textHeightScaled * aspect;
    this.mesh.scale.set(textWidthScaled, textHeightScaled, 1);
    this.mesh.position.y =
      -this.plane.scale.y * 0.5 - textHeightScaled * 0.5 - 0.05;
    this.mesh.setParent(this.plane);
  }
}

interface ScreenSize {
  width: number;
  height: number;
}

interface Viewport {
  width: number;
  height: number;
}

interface MediaProps {
  geometry: Plane;
  gl: GL;
  image?: string;
  index: number;
  length: number;
  renderer: Renderer;
  scene: Transform;
  screen: ScreenSize;
  text: string;
  viewport: Viewport;
  bend: number;
  textColor: string;
  borderRadius?: number;
  font?: string;
  link?: string;
  description?: string;
  icon?: string;
  linkText?: string;
  bgColor?: string;
  textSettings?: TextPositionSettings;
}

class Media {
  extra: number = 0;
  geometry: Plane;
  gl: GL;
  image?: string;
  index: number;
  length: number;
  renderer: Renderer;
  scene: Transform;
  screen: ScreenSize;
  text: string;
  description: string;
  icon: string;
  linkText: string;
  bgColor: string;
  viewport: Viewport;
  bend: number;
  textColor: string;
  borderRadius: number;
  font?: string;
  link?: string;
  textSettings: TextPositionSettings;
  program!: Program;
  plane!: Mesh;
  title!: Title;
  scale!: number;
  padding!: number;
  width!: number;
  widthTotal!: number;
  x!: number;
  speed: number = 0;
  isBefore: boolean = false;
  isAfter: boolean = false;

  constructor({
    geometry,
    gl,
    image,
    index,
    length,
    renderer,
    scene,
    screen,
    text,
    viewport,
    bend,
    textColor,
    borderRadius = 0,
    font,
    link,
    description = "",
    icon = "",
    linkText = "Learn More",
    bgColor = "#3a3a3a",
    textSettings = {},
  }: MediaProps) {
    this.geometry = geometry;
    this.gl = gl;
    this.image = image;
    this.index = index;
    this.length = length;
    this.renderer = renderer;
    this.scene = scene;
    this.screen = screen;
    this.text = text;
    this.description = description;
    this.icon = icon;
    this.linkText = linkText;
    this.bgColor = bgColor;
    this.viewport = viewport;
    this.bend = bend;
    this.textColor = textColor;
    this.borderRadius = borderRadius;
    this.font = font;
    this.link = link;
    this.textSettings = textSettings;
    this.createShader();
    this.createMesh();
    this.createTitle();
    this.onResize();
  }

  createShader() {
    const texture = new Texture(this.gl, { generateMipmaps: false });
    this.program = new Program(this.gl, {
      depthTest: false,
      depthWrite: false,
      vertex: `
        precision highp float;
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        uniform float uTime;
        uniform float uSpeed;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vec3 p = position;
          p.z = (sin(p.x * 4.0 + uTime) * 1.5 + cos(p.y * 2.0 + uTime) * 1.5) * (0.1 + uSpeed * 0.5);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
      fragment: `
        precision highp float;
        uniform vec2 uImageSizes;
        uniform vec2 uPlaneSizes;
        uniform sampler2D tMap;
        uniform float uBorderRadius;
        varying vec2 vUv;
        
        float roundedBoxSDF(vec2 p, vec2 b, float r) {
          vec2 d = abs(p) - b;
          return length(max(d, vec2(0.0))) + min(max(d.x, d.y), 0.0) - r;
        }
        
        void main() {
          vec2 ratio = vec2(
            min((uPlaneSizes.x / uPlaneSizes.y) / (uImageSizes.x / uImageSizes.y), 1.0),
            min((uPlaneSizes.y / uPlaneSizes.x) / (uImageSizes.y / uImageSizes.x), 1.0)
          );
          vec2 uv = vec2(
            vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
            vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
          );
          vec4 color = texture2D(tMap, uv);
          
          float d = roundedBoxSDF(vUv - 0.5, vec2(0.5 - uBorderRadius), uBorderRadius);
          if(d > 0.0) {
            discard;
          }
          
          gl_FragColor = vec4(color.rgb, 1.0);
        }
      `,
      uniforms: {
        tMap: { value: texture },
        uPlaneSizes: { value: [0, 0] },
        uImageSizes: { value: [0, 0] },
        uSpeed: { value: 0 },
        uTime: { value: 100 * Math.random() },
        uBorderRadius: { value: this.borderRadius },
      },
      transparent: true,
    });
      // If we have an icon and description, create a rich card texture
    if (this.icon && this.description) {
      createCardTexture(
        this.gl,
        this.text,
        this.description,
        this.icon,
        this.linkText,
        this.bgColor,
        this.textColor,
        this.textSettings
      ).then(({ texture: cardTexture, width, height }) => {
        texture.image = cardTexture.image;
        this.program.uniforms.uImageSizes.value = [width, height];
      });
    } 
    // Otherwise use a regular image if provided
    else if (this.image) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = this.image;
      img.onload = () => {
        texture.image = img;
        this.program.uniforms.uImageSizes.value = [
          img.naturalWidth,
          img.naturalHeight,
        ];
      };
    }
    // Fallback to a basic colored rectangle with text
    else {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (context) {
        canvas.width = 800;
        canvas.height = 600;
        context.fillStyle = this.bgColor;
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.font = "bold 40px sans-serif";
        context.fillStyle = this.textColor;
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(this.text, canvas.width / 2, canvas.height / 2);
        texture.image = canvas;
        this.program.uniforms.uImageSizes.value = [canvas.width, canvas.height];
      }
    }
  }

  createMesh() {
    this.plane = new Mesh(this.gl, {
      geometry: this.geometry,
      program: this.program,
    });
    this.plane.setParent(this.scene);
  }

  createTitle() {
    this.title = new Title({
      gl: this.gl,
      plane: this.plane,
      renderer: this.renderer,
      text: this.text,
      textColor: this.textColor,
      font: this.font,
    });
  }

  update(
    scroll: { current: number; last: number },
    direction: "right" | "left"
  ) {
    this.plane.position.x = this.x - scroll.current - this.extra;

    const x = this.plane.position.x;
    const H = this.viewport.width / 2;
    
    // Determine if we're on a mobile device
    const isMobile = this.screen.width <= 768;
    const isVerySmall = this.screen.width <= 480;
    
    // Adjust bend factor for mobile to prevent extreme curvature
    let adjustedBend = this.bend;
    if (isVerySmall) {
      adjustedBend = Math.min(Math.abs(this.bend), 0.8) * Math.sign(this.bend);
    } else if (isMobile) {
      adjustedBend = Math.min(Math.abs(this.bend), 1.2) * Math.sign(this.bend);
    }

    if (adjustedBend === 0) {
      this.plane.position.y = 0;
      this.plane.rotation.z = 0;
    } else {
      const B_abs = Math.abs(adjustedBend);
      
      // Calculate radius of the circular path - adjusted for mobile
      const R = (H * H + B_abs * B_abs) / (2 * B_abs);
      
      // Limit how far the cards can go along the x-axis to prevent overlap
      const maxXFactor = isVerySmall ? 0.7 : (isMobile ? 0.8 : 1.0);
      const effectiveX = Math.min(Math.abs(x), H * maxXFactor);

      // Calculate vertical position based on circular arc
      const arc = R - Math.sqrt(Math.max(0, R * R - effectiveX * effectiveX));
      
      if (adjustedBend > 0) {
        // Position cards along the arc with smoother transitions on mobile
        this.plane.position.y = -arc;
        
        // Rotate cards to follow the circular path with reduced rotation on mobile
        const rotationAngle = Math.asin(effectiveX / R);
        const rotationFactor = isVerySmall ? 0.4 : (isMobile ? 0.5 : 1.0);
        this.plane.rotation.z = -Math.sign(x) * rotationAngle * rotationFactor;
        
      } else {
        this.plane.position.y = arc;
        const rotationAngle = Math.asin(effectiveX / R);
        const rotationFactor = isVerySmall ? 0.3 : (isMobile ? 0.5 : 1.0);
        this.plane.rotation.z = Math.sign(x) * rotationAngle * rotationFactor;
      }
    }

    this.speed = scroll.current - scroll.last;
    this.program.uniforms.uTime.value += 0.04;
    this.program.uniforms.uSpeed.value = this.speed;

    // Adjust viewport offset calculation for better card wrapping
    const planeOffset = this.plane.scale.x / 2;
    const viewportOffset = this.viewport.width / 2;
    
    // Add a small buffer to prevent cards from disappearing too early
    const buffer = isMobile ? 0.2 : 0;
    this.isBefore = this.plane.position.x + planeOffset < -(viewportOffset + buffer);
    this.isAfter = this.plane.position.x - planeOffset > (viewportOffset + buffer);
    
    if (direction === "right" && this.isBefore) {
      this.extra -= this.widthTotal;
      this.isBefore = this.isAfter = false;
    }
    if (direction === "left" && this.isAfter) {
      this.extra += this.widthTotal;
      this.isBefore = this.isAfter = false;
    }
  }

  onResize({
    screen,
    viewport,
  }: { screen?: ScreenSize; viewport?: Viewport } = {}) {
    if (screen) this.screen = screen;
    if (viewport) {
      this.viewport = viewport;
      if (this.plane.program.uniforms.uViewportSizes) {
        this.plane.program.uniforms.uViewportSizes.value = [
          this.viewport.width,
          this.viewport.height,
        ];
      }
    }
    
    // Determine device type for better responsive handling
    const isMobile = this.screen.width <= 768;
    const isVerySmall = this.screen.width <= 480;
    const isTablet = this.screen.width > 768 && this.screen.width <= 1024;
    
    // Adjust scale based on screen size with better mobile handling
    if (isVerySmall) {
      this.scale = Math.min(this.screen.height / 2200, this.screen.width / 1400);
    } else if (isMobile) {
      this.scale = Math.min(this.screen.height / 1900, this.screen.width / 1300);
    } else if (isTablet) {
      this.scale = Math.min(this.screen.height / 1600, this.screen.width / 1100);
    } else {
      this.scale = this.screen.height / 1500;
    }
    
    // Calculate card sizes with better responsive adjustments
    let heightScale, widthScale;
    if (isVerySmall) {
      heightScale = 100;
      widthScale = 100;
    } else if (isMobile) {
      heightScale = 750;
      widthScale = 520;
    } else if (isTablet) {
      heightScale = 850;
      widthScale = 650;
    } else {
      heightScale = 900;
      widthScale = 700;
    }
    
    this.plane.scale.y =
      (this.viewport.height * (heightScale * this.scale)) / this.screen.height;
    this.plane.scale.x =
      (this.viewport.width * (widthScale * this.scale)) / this.screen.width;
    
    // Ensure proper size constraints for different devices
    if (isVerySmall) {
      // Very small devices - ensure cards are visible but not too large
      this.plane.scale.x = Math.min(this.plane.scale.x, this.viewport.width * 0.75);
      this.plane.scale.y = Math.min(this.plane.scale.y, this.viewport.height * 0.65);
      // Ensure minimum size for readability
      this.plane.scale.x = Math.max(this.plane.scale.x, this.viewport.width * 0.4);
      this.plane.scale.y = Math.max(this.plane.scale.y, this.viewport.height * 0.35);
    } else if (isMobile) {
      // Mobile devices
      this.plane.scale.x = Math.min(this.plane.scale.x, this.viewport.width * 0.7);
      this.plane.scale.y = Math.min(this.plane.scale.y, this.viewport.height * 0.7);
      this.plane.scale.x = Math.max(this.plane.scale.x, this.viewport.width * 0.45);
      this.plane.scale.y = Math.max(this.plane.scale.y, this.viewport.height * 0.4);
    } else if (isTablet) {
      // Tablet devices
      this.plane.scale.x = Math.min(this.plane.scale.x, this.viewport.width * 0.65);
      this.plane.scale.y = Math.min(this.plane.scale.y, this.viewport.height * 0.75);
    }
    
    this.program.uniforms.uPlaneSizes.value = [
      this.plane.scale.x,
      this.plane.scale.y,
    ];
    
    // Adjust padding based on screen size for better spacing
    if (isVerySmall) {
      this.padding = 0.8;
    } else if (isMobile) {
      this.padding = 1.0;
    } else if (isTablet) {
      this.padding = 1.5;
    } else {
      this.padding = 2.0;
    }
    
    this.width = this.plane.scale.x + this.padding;
    this.widthTotal = this.width * this.length;
    this.x = this.width * this.index;
  }
}

interface GalleryItem {
  image?: string;
  text: string;
  link?: string;
  description?: string;
  icon?: string;
  linkText?: string;
  bgColor?: string;
}

interface AppConfig {
  items: GalleryItem[];
  bend?: number;
  textColor?: string;
  borderRadius?: number;
  font?: string;
  onItemClick?: (link: string) => void;
  textSettings?: TextPositionSettings;
  mobileScrollConfig?: MobileScrollConfig;
}

class App {
  container: HTMLElement;
  scroll: {
    ease: number;
    current: number;
    target: number;
    last: number;
    position?: number;
  };
  direction: "left" | "right" = "right";
  onCheckDebounce: (...args: any[]) => void;
  renderer!: Renderer;
  gl!: GL;
  camera!: Camera;
  scene!: Transform;
  planeGeometry!: Plane;
  medias: Media[] = [];
  mediasImages: GalleryItem[] = [];
  screen!: { width: number; height: number };
  viewport!: { width: number; height: number };
  raf: number = 0;
  onItemClick?: (link: string) => void;
  mobileScrollConfig: MobileScrollConfig;

  boundOnResize: () => void;
  boundOnWheel: (e: WheelEvent) => void;
  boundOnTouchDown: (e: MouseEvent | TouchEvent) => void;
  boundOnTouchMove: (e: MouseEvent | TouchEvent) => void;
  boundOnTouchUp: () => void;
  boundOnClick: (e: MouseEvent) => void;

  isDown: boolean = false;
  start: number = 0;
  
  // Mobile momentum scrolling properties
  momentum: {
    velocity: number;
    isActive: boolean;
    lastTime: number;
    lastPosition: number;
  } = {
    velocity: 0,
    isActive: false,
    lastTime: 0,
    lastPosition: 0
  };

  constructor(
    container: HTMLElement,
    {
      items,
      bend = 1,
      textColor = "#ffffff",
      borderRadius = 0,
      font = "bold 30px Figtree",
      onItemClick,
      mobileScrollConfig,
    }: AppConfig
  ) {
    document.documentElement.classList.remove("no-js");
    this.container = container;
    
    // Initialize mobile scroll configuration with defaults
    this.mobileScrollConfig = { ...DEFAULT_MOBILE_SCROLL_CONFIG, ...mobileScrollConfig };
    
    // Adjust scroll easing based on device type for better mobile experience
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
    const scrollEase = isMobile ? 0.08 : 0.05; // Slightly faster easing on mobile
    
    this.scroll = { ease: scrollEase, current: 0, target: 0, last: 0 };
    this.onCheckDebounce = debounce(this.onCheck.bind(this), 200);
    this.onItemClick = onItemClick;
    this.mediasImages = items;
    
    // Bind event handlers
    this.boundOnResize = this.onResize.bind(this);
    this.boundOnWheel = this.onWheel.bind(this);
    this.boundOnTouchDown = this.onTouchDown.bind(this);
    this.boundOnTouchMove = this.onTouchMove.bind(this);
    this.boundOnTouchUp = this.onTouchUp.bind(this);
    this.boundOnClick = this.onClick.bind(this);
    
    this.createRenderer();
    this.createCamera();
    this.createScene();
    this.onResize();
    this.createGeometry();
    this.createMedias(items, bend, textColor, borderRadius, font);
    this.update();
    this.addEventListeners();
  }

  createRenderer() {
    this.renderer = new Renderer({ alpha: true });
    this.gl = this.renderer.gl;
    this.gl.clearColor(0, 0, 0, 0);
    this.container.appendChild(this.renderer.gl.canvas as HTMLCanvasElement);
  }

  createCamera() {
    this.camera = new Camera(this.gl);
    this.camera.fov = 45;
    this.camera.position.z = 20;
  }

  createScene() {
    this.scene = new Transform();
  }

  createGeometry() {
    this.planeGeometry = new Plane(this.gl, {
      widthSegments: 20,
      heightSegments: 20,
    });
  }

  createMedias(
    items: GalleryItem[],
    bend: number,
    textColor: string,
    borderRadius: number,
    font?: string
  ) {
    this.medias = [];
    items.forEach((item, index) => {
      const media = new Media({
        geometry: this.planeGeometry,
        gl: this.gl,
        image: item.image,
        index,
        length: items.length,
        renderer: this.renderer,
        scene: this.scene,
        screen: this.screen,
        text: item.text,
        viewport: this.viewport,
        bend,
        textColor,
        borderRadius,
        font,
        link: item.link,
        description: item.description,
        icon: item.icon,
        linkText: item.linkText,
        bgColor: item.bgColor,
      });
      this.medias.push(media);
    });
  }

  update() {
    // Handle momentum scrolling on mobile
    const isMobile = this.screen.width <= 768;
    if (isMobile && this.momentum.isActive && this.mobileScrollConfig.enableMomentumScrolling) {
      // Apply momentum velocity to scroll target
      this.scroll.target += this.momentum.velocity;
      
      // Apply momentum decay
      this.momentum.velocity *= this.mobileScrollConfig.momentumDecay!;
      
      // Stop momentum when velocity becomes very small
      if (Math.abs(this.momentum.velocity) < 0.01) {
        this.momentum.isActive = false;
        this.momentum.velocity = 0;
      }
    }
    
    this.scroll.current = lerp(
      this.scroll.current,
      this.scroll.target,
      this.scroll.ease
    );
    this.scroll.current = parseFloat(this.scroll.current.toFixed(2));

    if (this.scroll.current > this.scroll.last) {
      this.direction = "right";
    } else {
      this.direction = "left";
    }

    this.medias.forEach((media) => {
      media.update(this.scroll, this.direction);
    });

    this.render();
    this.scroll.last = this.scroll.current;
    this.raf = requestAnimationFrame(this.update.bind(this));
  }

  render() {
    this.renderer.render({ scene: this.scene, camera: this.camera });
  }

  onResize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.renderer.setSize(width, height);
    this.camera.perspective({
      aspect: width / height,
    });
    const fov = this.camera.fov * (Math.PI / 180);
    const height2 = 2 * Math.tan(fov / 2) * this.camera.position.z;
    const width2 = height2 * this.camera.aspect;

    this.screen = {
      width,
      height,
    };

    this.viewport = {
      width: width2,
      height: height2,
    };

    this.medias.forEach((media) => {
      media.onResize({ screen: this.screen, viewport: this.viewport });
    });
  }

  onCheck() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    if (width !== this.screen.width || height !== this.screen.height) {
      this.onResize();
    }
  }

  onWheel(e: WheelEvent) {
    const isMobile = this.screen.width <= 768;
    
    if (isMobile && this.mobileScrollConfig.enableVerticalScroll) {
      // On mobile, use vertical scroll to control horizontal rotation
      e.preventDefault(); // Prevent default vertical scrolling
      
      // Apply mobile-specific scroll configuration
      const scrollDelta = Math.abs(e.deltaY) > this.mobileScrollConfig.scrollThreshold! 
        ? e.deltaY 
        : 0;
      
      if (scrollDelta !== 0) {
        const normalizedDelta = (scrollDelta / 100) * 
          this.mobileScrollConfig.verticalScrollSpeedMultiplier! * 
          this.mobileScrollConfig.scrollDirectionMultiplier!;
        
        this.scroll.target += normalizedDelta;
        
        // Add haptic feedback if supported and enabled
        if (this.mobileScrollConfig.enableHapticFeedback && 'vibrate' in navigator) {
          navigator.vibrate(10); // Short vibration
        }
      }
    } else {
      // Desktop or mobile with vertical scroll disabled - use normal wheel behavior
      const scrollMultiplier = isMobile ? 0.5 : 1.0;
      const normalized = (e.deltaY / 100) * scrollMultiplier;
      this.scroll.target += normalized;
    }
    
    this.onCheckDebounce();
  }

  onTouchDown(e: MouseEvent | TouchEvent) {
    this.isDown = true;
    this.scroll.position = this.scroll.current;
    this.start = this.getPositionX(e);
    
    // Initialize momentum tracking for mobile
    const isMobile = this.screen.width <= 768;
    if (isMobile && this.mobileScrollConfig.enableMomentumScrolling) {
      this.momentum.isActive = false;
      this.momentum.velocity = 0;
      this.momentum.lastTime = Date.now();
      this.momentum.lastPosition = this.start;
    }
  }

  onTouchMove(e: MouseEvent | TouchEvent) {
    if (!this.isDown) return;
    
    const x = this.getPositionX(e);
    const isMobile = this.screen.width <= 768;
    
    // Calculate movement distance
    const distance = this.start - x;
    
    // Apply mobile scroll configuration
    let touchMultiplier = isMobile ? 0.008 : 0.01;
    if (isMobile && this.mobileScrollConfig.enableVerticalScroll) {
      touchMultiplier *= this.mobileScrollConfig.verticalScrollSpeedMultiplier! * 0.5; // Reduce for touch
    }
    
    const adjustedDistance = distance * touchMultiplier;
    this.scroll.target = this.scroll.position + adjustedDistance;
    
    // Track momentum for mobile
    if (isMobile && this.mobileScrollConfig.enableMomentumScrolling) {
      const currentTime = Date.now();
      const timeDelta = currentTime - this.momentum.lastTime;
      
      if (timeDelta > 0) {
        const positionDelta = x - this.momentum.lastPosition;
        this.momentum.velocity = (positionDelta / timeDelta) * touchMultiplier;
        this.momentum.lastTime = currentTime;
        this.momentum.lastPosition = x;
      }
    }
  }

  onTouchUp() {
    const isMobile = this.screen.width <= 768;
    
    // Apply momentum scrolling on mobile
    if (isMobile && this.mobileScrollConfig.enableMomentumScrolling && Math.abs(this.momentum.velocity) > 0.1) {
      this.momentum.isActive = true;
      // Clamp momentum velocity to maximum
      const maxSpeed = this.mobileScrollConfig.maxMomentumSpeed!;
      this.momentum.velocity = Math.max(-maxSpeed, Math.min(maxSpeed, this.momentum.velocity));
    }
    
    this.isDown = false;
  }

  onClick(e: MouseEvent) {
    // Find which media was clicked
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Convert to normalized device coordinates
    const ndcX = (x / this.screen.width) * 2 - 1;
    const ndcY = -(y / this.screen.height) * 2 + 1;
    
    // Find the media that was clicked
    for (const media of this.medias) {
      const { plane } = media;
      const planePos = plane.position;
      const planeScale = plane.scale;
      
      // Simple hit test (could be improved)
      if (
        ndcX >= planePos.x - planeScale.x / 2 &&
        ndcX <= planePos.x + planeScale.x / 2 &&
        ndcY >= planePos.y - planeScale.y / 2 &&
        ndcY <= planePos.y + planeScale.y / 2
      ) {
        if (media.link && this.onItemClick) {
          this.onItemClick(media.link);
        }
        break;
      }
    }
  }

  getPositionX(e: MouseEvent | TouchEvent): number {
    if ('touches' in e) {
      return e.touches[0].clientX;
    } else {
      return e.clientX;
    }
  }

  addEventListeners() {
    window.addEventListener("resize", this.boundOnResize);
    
    // Handle mouse wheel for scrolling with passive option for better performance
    this.container.addEventListener("wheel", this.boundOnWheel, { passive: false });
    
    // Handle touch/mouse events for dragging
    this.container.addEventListener("mousedown", this.boundOnTouchDown);
    window.addEventListener("mousemove", this.boundOnTouchMove);
    window.addEventListener("mouseup", this.boundOnTouchUp);
    
    // Touch events with passive option for better mobile performance
    this.container.addEventListener("touchstart", this.boundOnTouchDown, { passive: false });
    window.addEventListener("touchmove", this.boundOnTouchMove, { passive: false });
    window.addEventListener("touchend", this.boundOnTouchUp, { passive: true });
    
    // Handle clicks for navigation
    this.container.addEventListener("click", this.boundOnClick);
    
    // Add orientation change listener for mobile devices
    window.addEventListener("orientationchange", () => {
      setTimeout(() => {
        this.onResize();
      }, 100);
    });
  }

  removeEventListeners() {
    window.removeEventListener("resize", this.boundOnResize);
    this.container.removeEventListener("wheel", this.boundOnWheel);
    
    this.container.removeEventListener("mousedown", this.boundOnTouchDown);
    window.removeEventListener("mousemove", this.boundOnTouchMove);
    window.removeEventListener("mouseup", this.boundOnTouchUp);
    
    this.container.removeEventListener("touchstart", this.boundOnTouchDown);
    window.removeEventListener("touchmove", this.boundOnTouchMove);
    window.removeEventListener("touchend", this.boundOnTouchUp);
    
    this.container.removeEventListener("click", this.boundOnClick);
    
    // Remove orientation change listener
    window.removeEventListener("orientationchange", this.onResize);
  }

  destroy() {
    window.cancelAnimationFrame(this.raf);
    this.removeEventListeners();
    this.container.removeChild(this.gl.canvas as HTMLCanvasElement);
  }
}

interface CircularGalleryProps {
  items?: GalleryItem[];
  bend?: number;
  textColor?: string;
  borderRadius?: number;
  font?: string;
  mobileScrollConfig?: MobileScrollConfig;
}

const CircularGallery: React.FC<CircularGalleryProps> = ({
  items,
  bend = 3,
  textColor = "#ffffff",
  borderRadius = 0.05,
  font = "bold 30px Figtree",
  mobileScrollConfig,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<App | null>(null);

  // Create placeholder items with generic images if none provided
  const getDefaultItems = () => {
    return [
      {
        bgColor: "#2563eb",
        text: "Academic Resources",
        description: "Access comprehensive study materials, notes, assignments, and previous year question papers for all branches and semesters.",
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>',
        linkText: "Browse Resources",
        link: "/resources"
      },
      {
        bgColor: "#10b981",
        text: "Student Tools",
        description: "Powerful tools including CGPA calculator, attendance tracker, and study planners to enhance your academic journey.",
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2h12a2 2 0 0 1 2 2v18H4V4a2 2 0 0 1 2-2z"></path><path d="M6 12a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-2Z"></path></svg>',
        linkText: "Explore Tools",
        link: "/tools"
      },
      {
        bgColor: "#8b5cf6",
        text: "Collaborative Learning",
        description: "Connect with peers, share knowledge, and collaborate on projects in a supportive learning environment.",
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
        linkText: "Learn More",
        link: "/help"
      },
      {
        bgColor: "#f97316",
        text: "Easy Downloads",
        description: "Download study materials, assignments, and resources with just one click. All files are organized and easily accessible.",
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>',
        linkText: "Start Downloading",
        link: "/resources"
      },
      {
        bgColor: "#ef4444",
        text: "24/7 Access",
        description: "Access your learning materials anytime, anywhere. Study at your own pace with our always-available platform.",
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>',
        linkText: "Get Started",
        link: "/help"
      },
      {
        bgColor: "#6366f1",
        text: "Secure & Reliable",
        description: "Your data is safe with us. We use industry-standard security measures to protect your information and privacy.",
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"></path></svg>',
        linkText: "Privacy Policy",
        link: "/privacy-policy"
      }
    ];
  };

  // Calculate optimal bend based on screen size
  const getResponsiveBend = () => {
    // Use less bend on smaller screens for better mobile experience
    if (typeof window !== 'undefined') {
      if (window.innerWidth <= 480) {
        return Math.min(bend, 0.8); // Much less curve for very small devices
      } else if (window.innerWidth <= 768) {
        return Math.min(bend, 1.2); // Less curve for mobile devices
      } else if (window.innerWidth <= 1024) {
        return Math.min(bend, 2.0); // Moderate curve for tablets
      }
    }
    return bend; // Use default for desktop
  };

  // Handle font size for mobile
  const getResponsiveFont = () => {
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      // Use slightly smaller font on mobile
      const currentSize = getFontSize(font);
      const mobileSize = Math.max(Math.floor(currentSize * 0.85), 18);
      return font.replace(/\d+px/, `${mobileSize}px`);
    }
    return font;
  };

  useEffect(() => {
    if (containerRef.current && !appRef.current) {
      const galleryItems = items || getDefaultItems();
      const responsiveBend = getResponsiveBend();
      const responsiveFont = getResponsiveFont();
      
      appRef.current = new App(containerRef.current, {
        items: galleryItems,
        bend: responsiveBend,
        textColor,
        borderRadius,
        font: responsiveFont,
        mobileScrollConfig,
        onItemClick: (link) => {
          window.location.href = link;
        }
      });
    }

    // Add a listener to handle orientation changes on mobile
    const handleOrientationChange = () => {
      if (appRef.current) {
        appRef.current.destroy();
        appRef.current = null;
        
        // Re-initialize with updated responsive values
        if (containerRef.current) {
          const galleryItems = items || getDefaultItems();
          const responsiveBend = getResponsiveBend();
          const responsiveFont = getResponsiveFont();
          
          appRef.current = new App(containerRef.current, {
            items: galleryItems,
            bend: responsiveBend,
            textColor,
            borderRadius,
            font: responsiveFont,
            mobileScrollConfig,
            onItemClick: (link) => {
              window.location.href = link;
            }
          });
        }
      }
    };

    // Listen for orientation changes
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      if (appRef.current) {
        appRef.current.destroy();
        appRef.current = null;
      }
    };
  }, [items, bend, textColor, borderRadius, font, mobileScrollConfig]);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
};

export default CircularGallery;
export type { MobileScrollConfig, GalleryItem, TextPositionSettings };