import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./features/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Light brown/gold/white theme. Class names (bg-canvas, text-ivory,
        // etc.) are unchanged from the original dark theme so no component
        // markup needed to change — only the colors they point to.
        canvas: "#FBF7F0", // page background — warm white
        surface: "#F1E4CE", // card/section backgrounds — light tan
        surface2: "#E8D6B4", // slightly deeper tan, for nested surfaces
        ivory: "#3A2A18", // primary text — deep coffee brown (was light text on dark bg)
        muted: "#8A7357", // secondary/muted text — warm brown-gray
        brass: "#B8863F", // gold accent
        brassdim: "#8E6E38", // darker gold, for subtler accents
        clay: "#96432E", // terracotta accent
        line: "#E0CDA6", // borders/dividers — soft tan
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        body: ["var(--font-jakarta)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      letterSpacing: {
        widest2: "0.25em",
      },
      maxWidth: {
        content: "1400px",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        fadeUp: "fadeUp 0.6s ease forwards",
      },
    },
  },
  plugins: [],
};
export default config;
