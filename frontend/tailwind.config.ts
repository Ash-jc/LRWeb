import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg:      "#05050f",
          card:    "#0d0d1f",
          border:  "#00e5ff",
          pink:    "#ff00aa",
          cyan:    "#00e5ff",
          green:   "#39ff14",
          yellow:  "#ffe600",
          muted:   "#4a4a7a",
          text:    "#c8c8f0",
        },
      },
      fontFamily: {
        mono: ["'Share Tech Mono'", "ui-monospace", "monospace"],
      },
      boxShadow: {
        "neon-cyan":  "0 0 8px #00e5ff, 0 0 20px rgba(0,229,255,0.4)",
        "neon-pink":  "0 0 8px #ff00aa, 0 0 20px rgba(255,0,170,0.4)",
        "neon-green": "0 0 8px #39ff14, 0 0 20px rgba(57,255,20,0.4)",
        "neon-card":  "0 0 1px #00e5ff, inset 0 0 30px rgba(0,229,255,0.03)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        flicker: "flicker 4s linear infinite",
        scanline: "scanline 8s linear infinite",
      },
      keyframes: {
        flicker: {
          "0%, 95%, 100%": { opacity: "1" },
          "96%":           { opacity: "0.8" },
          "97%":           { opacity: "1" },
          "98%":           { opacity: "0.6" },
          "99%":           { opacity: "1" },
        },
        scanline: {
          "0%":   { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
