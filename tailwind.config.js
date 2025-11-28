/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#faf4fd", // custom purple
        "primary-dark": "#c9a6e0", // darker shade of purple
        "primary-darker": "#b388cc", // darkest shade of purple
      },
    },
  },
  plugins: [],
};
