module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        regal: {
          gold: '#FFD700',
          dark: '#18181b',
          accent: '#bfa14a',
        },
      },
      fontFamily: {
        display: ['Poppins', 'ui-sans-serif', 'system-ui'],
        body: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [],
}; 