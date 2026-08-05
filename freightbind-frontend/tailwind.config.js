/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#070B14",
          900: "#0B1220",
          800: "#111A2E",
          700: "#1A2743",
          600: "#243759",
        },
        harbor: {
          50: "#EFF9F8",
          100: "#D7F0EC",
          200: "#AEE1DA",
          300: "#7FCCC1",
          400: "#4CB0A2",
          500: "#2E9385",
          600: "#217A6F",
          700: "#1B615A",
        },
        signal: {
          amber: "#D98E27",
          rust: "#C1552F",
        },
      },
      fontFamily: {
        display: ["\"Space Grotesk\"", "sans-serif"],
        sans: ["\"Inter\"", "sans-serif"],
        mono: ["\"JetBrains Mono\"", "monospace"],
      },
      boxShadow: {
        panel: "0 1px 2px 0 rgb(15 23 42 / 0.06), 0 1px 3px 0 rgb(15 23 42 / 0.08)",
        panelHover:
          "0 2px 4px 0 rgb(15 23 42 / 0.06), 0 8px 24px -8px rgb(15 23 42 / 0.14)",
      },
      keyframes: {
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        shimmer: "shimmer 1.6s infinite",
      },
    },
  },
  plugins: [],
};
