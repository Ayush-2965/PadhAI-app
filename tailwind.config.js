/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Poppins-400", "sans-serif"],
        poppins: ["Poppins-300", "Poppins-400", "Poppins-500", "Poppins-600", "Poppins-700", "Poppins-800"],
        sf: ["SF-400", "SF-700"],
      },
    },
  },
  plugins: [],
};
