/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        bodoni: ['Bodoni Moda', 'serif'],
        isidora: ['Montserrat', 'sans-serif'], // Using Montserrat as a substitute for Isidora
        teko: ['Teko', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
        alegreya: ['Alegreya', 'serif'],
        roboto: ['Roboto', 'sans-serif'],
        ogg: ['EB Garamond', 'serif'], // Using EB Garamond as a substitute for Ogg
        larish: ['Playfair Display', 'serif'], // Using Playfair Display as a substitute for Larish Neue
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Custom LearnFlow colors
        learnflow: {
          50: "#f0f7ff",
          100: "#e0eefe",
          200: "#bae0fd",
          300: "#7cc8fb",
          400: "#36aaf5",
          500: "#0c8ee0",
          600: "#0072c3",
          700: "#0059a0",
          800: "#064b85",
          900: "#0a3f6f",
          950: "#072a4d",
        },
        "learnflow-purple": "#7c5cfc",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      translate: {
        '101': '101%',
      },
      boxShadow: {
        sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        DEFAULT: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
        none: "none",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        "slide-in": {
          "0%": { transform: "translateY(20px)", opacity: 0 },
          "100%": { transform: "translateY(0)", opacity: 1 },
        },
        "slide-down": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(0)" },
        },
        "slide-up": {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(-100%)" },
        },
        "fade-in": {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        "fade-in-up": {
          "0%": { opacity: 0, transform: "translateY(40px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        "fade-in-down": {
          "0%": { opacity: 0, transform: "translateY(-40px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        "hover-zoom": {
          "0%": { transform: "scale(1)" },
          "100%": { transform: "scale(1.05)" },
        },
        "star-movement-bottom": {
          "0%": { transform: "translate(0%, 0%)", opacity: "1000" },
          "100%": { transform: "translate(-100%, 0%)", opacity: "1000" },
        },
        "star-movement-top": {
          "0%": { transform: "translate(0%, 0%)", opacity: "1000" },
          "100%": { transform: "translate(100%, 0%)", opacity: "1000" },
        },
        "hamburger-to-x": {
          "0%": { transform: "rotate(0deg) scale(1)", opacity: "1" },
          "50%": { transform: "rotate(90deg) scale(0.8)", opacity: "0.5" },
          "100%": { transform: "rotate(180deg) scale(0.75)", opacity: "0" },
        },
        "x-to-hamburger": {
          "0%": { transform: "rotate(180deg) scale(0.75)", opacity: "0" },
          "50%": { transform: "rotate(90deg) scale(0.8)", opacity: "0.5" },
          "100%": { transform: "rotate(0deg) scale(1)", opacity: "1" },
        },
        "menu-slide-down": {
          "0%": { transform: "translateY(-20px) scale(0.95)", opacity: "0" },
          "100%": { transform: "translateY(0) scale(1)", opacity: "1" },
        },
        "menu-slide-up": {
          "0%": { transform: "translateY(0) scale(1)", opacity: "1" },
          "100%": { transform: "translateY(-20px) scale(0.95)", opacity: "0" },
        },
        marquee: {
          'from': { transform: 'translateX(0%)' },
          'to': { transform: 'translateX(-50%)' }
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "slide-in": "slide-in 0.3s ease-out",
        "slide-down": "slide-down 0.5s ease-out",
        "slide-up": "slide-up 0.5s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "fade-in-up": "fade-in-up 0.8s ease-out",
        "fade-in-down": "fade-in-down 0.8s ease-out",
        "hover-zoom": "hover-zoom 0.2s ease-out forwards",
        "star-movement-bottom": "star-movement-bottom linear infinite alternate",
        "star-movement-top": "star-movement-top linear infinite alternate",
        "hamburger-to-x": "hamburger-to-x 0.3s ease-in-out forwards",
        "x-to-hamburger": "x-to-hamburger 0.3s ease-in-out forwards",
        "menu-slide-down": "menu-slide-down 0.3s ease-out forwards",
        "menu-slide-up": "menu-slide-up 0.3s ease-in forwards",
        marquee: 'marquee 15s linear infinite',
      },
    },
  },
  // plugins: [require("tailwindcss-animate"), require("@tailwindcss/line-clamp")],
}

