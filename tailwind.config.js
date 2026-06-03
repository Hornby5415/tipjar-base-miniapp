/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: {
          blue: "#0052ff",
          ink: "#172033",
          line: "#dbe5f5",
          soft: "#f4f8ff",
          yellow: "#ffd166"
        }
      },
      boxShadow: {
        soft: "0 12px 36px rgba(0, 82, 255, 0.08)"
      }
    }
  },
  plugins: [],
};
