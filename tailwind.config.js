/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        'legiao-blue': '#008CFF', // ou var(--azul-legiao) se preferir
        'legiao-pink': '#ED195C',
      }
    },
  },
  plugins: [],
}