/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'inj-dark':     '#0D1B2E',
        'inj-midnight': '#182E4B',
        'inj-navy':     '#1E3558',
        'inj-border':   '#2A4A6E',
        'inj-ocean':    '#4D3DFF',
        'inj-snow':     '#EEEFFF',
        'inj-muted':    '#8CA3BE',
        'inj-lime':     '#CEFFC8',
        'inj-green':    '#22C55E',
        'inj-red':      '#EF4444',
        'inj-amber':    '#F59E0B',
        'inj-coral':    '#FFA36E',
        'inj-forest':   '#144E1A',
      },
      fontFamily: {
        marist: ['ABC Marist', 'Inter', 'system-ui', 'sans-serif'],
        whyte:  ['ABC Whyte',  'Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display':  ['3rem',    { lineHeight: '1.1', fontWeight: '700' }],
        'body-md':  ['1rem',    { lineHeight: '1.5', fontWeight: '400' }],
        'label-sm': ['0.75rem', { lineHeight: '1.4', fontWeight: '400' }],
        'label-xs': ['0.65rem', { lineHeight: '1.3', fontWeight: '400' }],
      },
      spacing: {
        'inj-sm': '8px',
        'inj-md': '16px',
        'inj-lg': '24px',
        'inj-xl': '32px',
      },
      borderRadius: {
        'inj-sm':   '4px',
        'inj-md':   '8px',
        'inj-lg':   '16px',
        'inj-full': '9999px',
      },
    },
  },
  plugins: [],
}
