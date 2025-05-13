import React from 'react';

interface SvgBackgroundProps {
  className?: string;
}

const SvgBackground: React.FC<SvgBackgroundProps> = ({ className = '' }) => {
  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden ${className}`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        version="1.1"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        xmlnsSvgjs="http://svgjs.dev/svgjs"
        viewBox="0 0 1422 800"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient x1="50%" y1="0%" x2="500%" y2="100%" id="oooscillate-grad">
            <stop stopColor="hsl(206, 75%, 49%)" stopOpacity="-1" offset="0%"></stop>
            <stop stopColor="hsl(331, 90%, 56%)" stopOpacity="1" offset="100%"></stop>
          </linearGradient>
        </defs>
        <g stroke="url(#oooscillate-grad)" fill="none" strokeLinecap="round" strokeWidth="2">
          <path d="M -110 572 Q 355.5 -100 711 400 Q 1066.5 900 1422 572" opacity="0.61"></path>
          <path d="M -110 550 Q 355.5 -100 711 400 Q 1066.5 900 1422 550" opacity="0.99"></path>
          <path d="M -110 528 Q 355.5 -100 711 400 Q 1066.5 900 1422 528" opacity="0.28"></path>
          <path d="M -110 506 Q 355.5 -100 711 400 Q 1066.5 900 1422 506" opacity="0.17"></path>
          <path d="M -110 484 Q 355.5 -100 711 400 Q 1066.5 900 1422 484" opacity="0.98"></path>
          <path d="M -110 462 Q 355.5 -100 711 400 Q 1066.5 900 1422 462" opacity="0.51"></path>
          <path d="M -110 440 Q 355.5 -100 711 400 Q 1066.5 900 1422 440" opacity="0.09"></path>
          <path d="M -110 418 Q 355.5 -100 711 400 Q 1066.5 900 1422 418" opacity="0.41"></path>
          <path d="M -110 396 Q 355.5 -100 711 400 Q 1066.5 900 1422 396" opacity="0.99"></path>
          <path d="M -110 374 Q 355.5 -100 711 400 Q 1066.5 900 1422 374" opacity="0.88"></path>
          <path d="M -110 352 Q 355.5 -100 711 400 Q 1066.5 900 1422 352" opacity="0.78"></path>
          <path d="M -110 330 Q 355.5 -100 711 400 Q 1066.5 900 1422 330" opacity="0.67"></path>
          <path d="M -110 308 Q 355.5 -100 711 400 Q 1066.5 900 1422 308" opacity="0.27"></path>
          <path d="M -110 286 Q 355.5 -100 711 400 Q 1066.5 900 1422 286" opacity="0.60"></path>
          <path d="M -110 264 Q 355.5 -100 711 400 Q 1066.5 900 1422 264" opacity="0.31"></path>
          <path d="M -110 242 Q 355.5 -100 711 400 Q 1066.5 900 1422 242" opacity="0.36"></path>
          <path d="M -110 220 Q 355.5 -100 711 400 Q 1066.5 900 1422 220" opacity="0.45"></path>
          <path d="M -110 198 Q 355.5 -100 711 400 Q 1066.5 900 1422 198" opacity="0.24"></path>
          <path d="M -110 176 Q 355.5 -100 711 400 Q 1066.5 900 1422 176" opacity="0.58"></path>
          <path d="M -110 154 Q 355.5 -100 711 400 Q 1066.5 900 1422 154" opacity="0.81"></path>
          <path d="M -110 132 Q 355.5 -100 711 400 Q 1066.5 900 1422 132" opacity="0.91"></path>
          <path d="M -110 110 Q 355.5 -100 711 400 Q 1066.5 900 1422 110" opacity="0.17"></path>
          <path d="M-11 0 88 Q 355.5 -100 711 400 Q 1066.5 900 1422 88" opacity="0.71"></path>
          <path d="M-11 0 66 Q 355.5 -100 711 400 Q 1066.5 900 1422 66" opacity="0.68"></path>
          <path d="M-11 0 44 Q 355.5 -100 711 400 Q 1066.5 900 1422 44" opacity="0.40"></path>
        </g>
      </svg>
    </div>
  );
};

export default SvgBackground;
