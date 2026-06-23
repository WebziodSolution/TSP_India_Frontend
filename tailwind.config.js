/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,jsx,tsx}"], // Include TS files if needed
  theme: {
    extend: {
      colors: {
        primary: "#666cff",
        secondary_light:"#f0eff0",
        color: "#3b4056",
      },
    },
  },
  plugins: [],
};
