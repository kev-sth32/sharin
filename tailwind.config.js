/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          pink: "#FF4A7D",
          "pink-light": "#FFF0F4",
          saffron: "#FF8A2B",
          plum: "#5B2063",
          navy: "#13253D",
          cream: "#FFF8F0",
          "cream-dark": "#FDF0E6",
          border: "#F1D9D0",
        }
      },
      fontFamily: {
        jakarta: ["var(--font-jakarta)"],
        display: ["var(--font-display)"],
      },
      animation: {
        marquee: "marquee 30s linear infinite",
      },
      keyframes: {
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
}
