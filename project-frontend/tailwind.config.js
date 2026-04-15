/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#534AB7',
          light: '#EEEDFE',
          dark: '#3C3489',
          mid: '#AFA9EC',
          success: '#3B6D11',
          successBg: '#EAF3DE',
          warning: '#633806',
          warningBg: '#FAEEDA',
          error: '#A32D2D',
          errorBg: '#FCEBEB',
        }
      },
      borderRadius: {
        'brand': '12px',
      },
      borderWidth: {
        '0.5': '0.5px',
        '1.5': '1.5px',
        '3': '3px',
      },
      fontWeight: {
        regular: 400,
        medium: 500,
      }
    },
  },
  plugins: [],
}

