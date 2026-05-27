import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core Palette
        espresso: {
          DEFAULT: "#3E2723",
          light: "#5D4037",
          deep: "#2C1A14",
        },
        latte: {
          DEFAULT: "#DDbea9",
          light: "#EBD8C9",
          muted: "#C9A88E",
        },
        sage: {
          DEFAULT: "#6B9080",
          light: "#8FB3A3",
          deep: "#4A7565",
        },
        cream: {
          DEFAULT: "#FCFAF6",
          warm: "#F5F0E8",
        },

        // Dashboard
        dash: {
          bg: "var(--dash-bg)",
          surface: "var(--dash-surface)",
          "surface-hover": "var(--dash-surface-hover)",
        },

        // Legacy Mapping
        metro: "#3E2723",
        cheese: "#6B9080",
        plate: "#FCFAF6",
      },
      fontFamily: {
        sans: ["var(--font-lato)"],
        heading: ["var(--font-playfair)"],
      },
      borderRadius: {
        "4xl": "2rem",
      },
      boxShadow: {
        "aromatic-xs": "0 1px 3px rgba(62, 39, 35, 0.03)",
        "aromatic-sm": "0 4px 12px -2px rgba(62, 39, 35, 0.05)",
        "aromatic-md": "0 8px 24px -4px rgba(62, 39, 35, 0.08)",
        "aromatic-lg": "0 16px 40px -8px rgba(62, 39, 35, 0.12)",
        "aromatic-xl": "0 24px 56px -12px rgba(62, 39, 35, 0.16)",
        "glow-sage": "0 8px 32px -4px rgba(107, 144, 128, 0.35)",
        "glow-espresso": "0 8px 32px -4px rgba(62, 39, 35, 0.3)",
        "inner-warm": "inset 0 2px 8px rgba(62, 39, 35, 0.04)",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};
export default config;
