/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#F59E0B",
          50: "#FEF3C7",
          100: "#FDE68A",
          200: "#FCD34D",
          300: "#FBBF24",
          400: "#F59E0B",
          500: "#D97706",
          600: "#B45309",
          700: "#92400E",
          800: "#78350F",
          900: "#451A03",
        },
        secondary: "#059669",
      },
    },
  },
  plugins: [],
};
