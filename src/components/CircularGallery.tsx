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

function createCardTexture(
  gl: GL,
  title: string,
  description: string,
  iconSvg: string,
  linkText: string,
  bgColor: string = "#ffffff",
  textColor: string = "#000000"
): { texture: Texture; width: number; height: number } {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not get 2d context");

  // Detect if we're on a mobile device for responsive design
  const isMobile = window.innerWidth <= 768;
  
  // Set canvas dimensions
  const width = 800;
  const height = 600;
  canvas.width = width;
  canvas.height = height;

  // Clear and set background
  context.fillStyle = bgColor;
  context.fillRect(0, 0, width, height);

  // Draw border radius (optional)
  context.strokeStyle = "rgba(255,255,255,0.2)";
  context.lineWidth = 2;
  context.strokeRect(10, 10, width - 20, height - 20);

  // Convert SVG string to data URL
  const svgBlob = new Blob([iconSvg], { type: "image/svg+xml" });
  const svgUrl = URL.createObjectURL(svgBlob);
  
  // Create image for icon
  const iconImg = new Image();
  iconImg.src = svgUrl;
  
  // Create a temporary image to render the SVG, then continue with the rest of the drawing
  const tempImg = new Image();
  tempImg.onload = () => {
    // Calculate spacing and sizes for responsive layouts
    const iconSize = isMobile ? 70 : 80;
    const iconY = isMobile ? 40 : 60;
    const titleY = isMobile ? 150 : 180;
    const descY = isMobile ? 220 : 260;
    const linkY = isMobile ? height - 60 : height - 80;
    
    // Draw icon centered at the top
    context.drawImage(tempImg, (width - iconSize) / 2, iconY, iconSize, iconSize);
    URL.revokeObjectURL(svgUrl);

    // Draw title - larger on mobile for better readability
    const titleFontSize = isMobile ? 36 : 40;
    context.font = `bold ${titleFontSize}px sans-serif`;
    context.fillStyle = textColor;
    context.textAlign = "center";
    context.textBaseline = "middle";
    
    // Limit title length if needed
    const maxTitleLength = isMobile ? 20 : 25;
    const displayTitle = title.length > maxTitleLength 
      ? title.substring(0, maxTitleLength - 3) + "..." 
      : title;
    context.fillText(displayTitle, width / 2, titleY);

    // Draw description - adjust font size for mobile
    const descFontSize = isMobile ? 22 : 24;
    context.font = `${descFontSize}px sans-serif`;
    context.fillStyle = textColor;
    
    // Use tighter line height on mobile for more text
    const lineHeight = isMobile ? 28 : 32;
    const maxWidth = isMobile ? width - 80 : width - 100;
    
    // Truncate description if too long for mobile
    let displayDesc = description;
    if (isMobile && description.length > 120) {
      displayDesc = description.substring(0, 117) + "...";
    }
    
    wrapText(context, displayDesc, width / 2, descY, maxWidth, lineHeight);

    // Draw link text - slightly smaller on mobile
    const linkFontSize = isMobile ? 24 : 28;
    context.font = `bold ${linkFontSize}px sans-serif`;
    context.fillStyle = textColor;
    context.fillText(linkText + " →", width / 2, linkY);

    // Update texture with canvas content
    if (gl && !gl.isContextLost()) {
      texture.image = canvas;
    }
  };
  
  // Set source for the temporary image
  tempImg.src = svgUrl;

  const texture = new Texture(gl, { generateMipmaps: false });
  return { texture, width, height };
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
      const { texture: cardTexture, width, height } = createCardTexture(
        this.gl,
        this.text,
        this.description,
        this.icon,
        this.linkText,
        this.bgColor,
        this.textColor
      );
      texture.image = cardTexture.image;
      this.program.uniforms.uImageSizes.value = [width, height];
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
    
    // Adjust bend factor for mobile to prevent extreme curvature
    const adjustedBend = isMobile ? Math.min(Math.abs(this.bend), 1.5) * Math.sign(this.bend) : this.bend;

    if (adjustedBend === 0) {
      this.plane.position.y = 0;
      this.plane.rotation.z = 0;
    } else {
      const B_abs = Math.abs(adjustedBend);
      
      // Calculate radius of the circular path - adjusted for mobile
      const R = (H * H + B_abs * B_abs) / (2 * B_abs);
      
      // Limit how far the cards can go along the x-axis to prevent overlap
      const effectiveX = Math.min(Math.abs(x), H * (isMobile ? 0.85 : 1.0));

      // Calculate vertical position based on circular arc
      const arc = R - Math.sqrt(R * R - effectiveX * effectiveX);
      
      if (adjustedBend > 0) {
        // Position cards along the arc with smoother transitions on mobile
        this.plane.position.y = -arc;
        
        // Rotate cards to follow the circular path
        const rotationAngle = Math.asin(effectiveX / R);
        this.plane.rotation.z = -Math.sign(x) * rotationAngle;
        
        // Additional scaling effect for off-center cards (optional)
        if (isMobile) {
          const scaleFactor = 1.0 - (Math.abs(x) / (H * 2)) * 0.3;
          this.plane.scale.set(
            this.plane.scale.x * scaleFactor,
            this.plane.scale.y * scaleFactor,
            1
          );
        }
      } else {
        this.plane.position.y = arc;
        this.plane.rotation.z = Math.sign(x) * Math.asin(effectiveX / R);
      }
    }

    this.speed = scroll.current - scroll.last;
    this.program.uniforms.uTime.value += 0.04;
    this.program.uniforms.uSpeed.value = this.speed;

    // Adjust viewport offset calculation for better card wrapping
    const planeOffset = this.plane.scale.x / 2;
    const viewportOffset = this.viewport.width / 2;
    
    // Add a small buffer to prevent cards from disappearing too early
    const buffer = isMobile ? 0.1 : 0;
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
    
    // Determine if we're on a mobile device
    const isMobile = this.screen.width <= 768;
    
    // Adjust scale based on screen size
    this.scale = isMobile 
      ? Math.min(this.screen.height / 1800, this.screen.width / 1200) 
      : this.screen.height / 1500;
    
    // Calculate card sizes with responsive adjustments
    const heightScale = isMobile ? 800 : 900;
    const widthScale = isMobile ? 550 : 700;
    
    this.plane.scale.y =
      (this.viewport.height * (heightScale * this.scale)) / this.screen.height;
    this.plane.scale.x =
      (this.viewport.width * (widthScale * this.scale)) / this.screen.width;
    
    // Ensure minimum size for visibility but prevent overflow
    if (isMobile) {
      // Limit maximum size on mobile
      this.plane.scale.x = Math.min(this.plane.scale.x, this.viewport.width * 0.6);
      this.plane.scale.y = Math.min(this.plane.scale.y, this.viewport.height * 0.6);
    }
    
    this.program.uniforms.uPlaneSizes.value = [
      this.plane.scale.x,
      this.plane.scale.y,
    ];
    
    // Adjust padding based on screen size
    this.padding = isMobile ? 1.2 : 2;
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

  boundOnResize: () => void;
  boundOnWheel: (e: WheelEvent) => void;
  boundOnTouchDown: (e: MouseEvent | TouchEvent) => void;
  boundOnTouchMove: (e: MouseEvent | TouchEvent) => void;
  boundOnTouchUp: () => void;
  boundOnClick: (e: MouseEvent) => void;

  isDown: boolean = false;
  start: number = 0;

  constructor(
    container: HTMLElement,
    {
      items,
      bend = 1,
      textColor = "#ffffff",
      borderRadius = 0,
      font = "bold 30px Figtree",
      onItemClick,
    }: AppConfig
  ) {
    document.documentElement.classList.remove("no-js");
    this.container = container;
    this.scroll = { ease: 0.05, current: 0, target: 0, last: 0 };
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
    const normalized = e.deltaY / 100;
    this.scroll.target += normalized;
    this.onCheckDebounce();
  }

  onTouchDown(e: MouseEvent | TouchEvent) {
    this.isDown = true;
    this.scroll.position = this.scroll.current;
    this.start = this.getPositionX(e);
  }

  onTouchMove(e: MouseEvent | TouchEvent) {
    if (!this.isDown) return;
    const x = this.getPositionX(e);
    const distance = (this.start - x) * 0.01;
    this.scroll.target = this.scroll.position + distance;
  }

  onTouchUp() {
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
    
    // Handle mouse wheel for scrolling
    this.container.addEventListener("wheel", this.boundOnWheel);
    
    // Handle touch/mouse events for dragging
    this.container.addEventListener("mousedown", this.boundOnTouchDown);
    window.addEventListener("mousemove", this.boundOnTouchMove);
    window.addEventListener("mouseup", this.boundOnTouchUp);
    
    this.container.addEventListener("touchstart", this.boundOnTouchDown);
    window.addEventListener("touchmove", this.boundOnTouchMove);
    window.addEventListener("touchend", this.boundOnTouchUp);
    
    // Handle clicks for navigation
    this.container.addEventListener("click", this.boundOnClick);
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
}

const CircularGallery: React.FC<CircularGalleryProps> = ({
  items,
  bend = 3,
  textColor = "#ffffff",
  borderRadius = 0.05,
  font = "bold 30px Figtree",
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
    // Use less bend on smaller screens
    if (typeof window !== 'undefined') {
      if (window.innerWidth <= 480) {
        return Math.min(bend, 1.2); // Much less curve for very small devices
      } else if (window.innerWidth <= 768) {
        return Math.min(bend, 2); // Less curve for tablets/mobile
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
  }, [items, bend, textColor, borderRadius, font]);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
};

export default CircularGallery;