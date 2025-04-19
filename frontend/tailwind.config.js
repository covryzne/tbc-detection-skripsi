/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}", // Note the addition of the `app` directory.
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#001A6E", // Warna utama
        primaryBlack: "#000F44", // Warna hitam
        primaryLight: "#3A56A0", // Warna terang
        primaryDark: "#000F44", // Warna gelap
        accent: "#3A82E2", // Warna aksen
      },
    },
  },
  plugins: [],
};
