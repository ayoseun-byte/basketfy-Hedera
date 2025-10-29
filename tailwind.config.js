/** @type {import('tailwindcss').Config} */

// tailwind.config.js
export default  {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#8B5CF6", // example purple
          dark: "#6D28D9",
          light: "#C4B5FD",
        },
        accent: {
          DEFAULT: "#22C55E", // green
          dark: "#15803D",
          light: "#86EFAC",
        },
        background: {
          DEFAULT: "#0F172A", // slate black
          light: "#1E293B",
        },
        text: {
          DEFAULT: "#F1F5F9", // light gray
          muted: "#94A3B8",
        },
        // if you want exact Cashflakes colors you can replace above
      },
    },
  },
  plugins: [],
}
