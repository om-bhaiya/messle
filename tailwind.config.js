/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        turmeric: "#F4C430",
        brick: "#8B1E1E",
        darkBrown: "#3B2F2F",
      },
    },
  },
  plugins: [],
};
