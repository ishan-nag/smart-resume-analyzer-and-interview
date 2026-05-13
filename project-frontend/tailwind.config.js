/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['Inter', 'Outfit', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          // Light theme accents (rose/coral/amber)
          primary:    '#E11D48',
          primaryAlt: '#FB923C',
          light:      '#FFF1F2',
          dark:       '#881337',
          mid:        '#F43F5E',

          // Dark theme accents (teal/cyan)
          teal:       '#14B8A6',
          cyan:       '#06B6D4',
          navy:       '#0F172A',
          navyMid:    '#0C4A6E',

          // Semantic
          success:    '#059669',
          successBg:  '#ECFDF5',
          warning:    '#D97706',
          warningBg:  '#FFFBEB',
          error:      '#DC2626',
          errorBg:    '#FEF2F2',
          muted:      '#78716C',
          faint:      '#A8A29E',
        }
      },
      borderRadius: { brand: '12px' },
      borderWidth:  { '0.5': '0.5px', '1.5': '1.5px', '3': '3px' },
      fontWeight:   { regular: 400, medium: 500 },
      animation: {
        'float-up':    'float-up 0.45s ease both',
        'spin-slow':   'spin-slow 14s linear infinite',
        'blob-morph':  'blob-morph 10s ease-in-out infinite',
        'glow-pulse':  'glow-pulse 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
