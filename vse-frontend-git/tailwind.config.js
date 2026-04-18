/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'admin-saffron': '#FF9933',
        'auditor-green': '#2ECC71',
        'member-white': '#FFFFFF',
      },
      backgroundImage: {
        'burj-khalifa': "url('/assets/images/burj_khalifa_premium_office.png')",
      }
    },
  },
  plugins: [],
}
