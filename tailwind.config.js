/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: {
          blue: "#0052ff",
          ink: "#1c1917",
          line: "#fde68a",
          soft: "#fff8ef",
          yellow: "#ffd166"
        }
      },
      boxShadow: {
        soft: "0 14px 38px rgba(194, 65, 12, 0.12)"
      }
    }
  },
  plugins: [],
};
