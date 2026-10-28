import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/hooks/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          primary: "var(--brand-primary)",
          "primary-dark": "var(--brand-primary-dark)",
          "primary-light": "var(--brand-primary-light)",
          accent: "var(--brand-accent)",
          "accent-dark": "var(--brand-accent-dark)",
          surface: "var(--brand-surface)",
          "surface-raised": "var(--brand-surface-raised)",
          ink: "var(--brand-ink)",
          "ink-muted": "var(--brand-ink-muted)",
          border: "var(--brand-border)",
          success: "var(--brand-success)",
          "success-bg": "var(--brand-success-bg)",
          danger: "var(--brand-danger)",
          "danger-bg": "var(--brand-danger-bg)",
          warning: "var(--brand-warning)",
          "warning-bg": "var(--brand-warning-bg)",
          info: "var(--brand-info)",
          "info-bg": "var(--brand-info-bg)",
        },
        /* Numbered scales used by the marketing/enter/dashboard pages
           (kept alongside the CSS-variable-driven `brand` tokens above so
           both sets of screens render correctly regardless of which part
           of the app was authored first). */
        teal: {
          50: "#EAF3F4",
          100: "#CFE4E7",
          200: "#A2CBD1",
          300: "#75B1BA",
          400: "#4C97A3",
          500: "#2E7C8A",
          600: "#1C616F",
          700: "#164E5A",
          800: "#0F4C5C",
          900: "#0A363F",
          950: "#06262C",
        },
        accent: {
          DEFAULT: "#E36414",
          50: "#FDF1E7",
          100: "#FBE1C8",
          200: "#F6C08C",
          300: "#F19F50",
          400: "#ED8232",
          500: "#E36414",
          600: "#C2530E",
          700: "#98410B",
          800: "#6F2F08",
          900: "#4A2005",
        },
        ink: {
          50: "#F3F6F7",
          100: "#E6ECED",
          200: "#C7D2D4",
          300: "#9FB0B3",
          400: "#6E8386",
          500: "#4C6265",
          600: "#374B4E",
          700: "#293A3C",
          800: "#1A2628",
          900: "#0D1517",
          950: "#070C0D",
        },
      },
      fontFamily: {
        sans: ["var(--font-hind-siliguri)", "Segoe UI", "sans-serif"],
        display: ["var(--font-source-serif)", "Georgia", "Times New Roman", "serif"],
      },
      backgroundImage: {
        "industrial-grid":
          "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
        "hero-radial":
          "radial-gradient(60% 55% at 50% 0%, rgba(227,100,20,0.22) 0%, rgba(227,100,20,0) 60%), radial-gradient(80% 60% at 85% 15%, rgba(46,124,138,0.35) 0%, rgba(46,124,138,0) 60%)",
        "teal-gradient":
          "linear-gradient(160deg, #06262C 0%, #0A363F 35%, #0F4C5C 65%, #164E5A 100%)",
      },
      boxShadow: {
        card: "0 1px 2px rgba(30, 30, 20, 0.04), 0 1px 3px rgba(30, 30, 20, 0.03)",
        "card-hover": "0 4px 10px rgba(30, 30, 20, 0.08), 0 2px 4px rgba(30, 30, 20, 0.05)",
        glow: "0 0 0 1px rgba(227,100,20,0.25), 0 0 40px rgba(227,100,20,0.15)",
      },
      borderRadius: {
        xl: "0.875rem",
      },
    },
  },
  plugins: [],
};
export default config;
