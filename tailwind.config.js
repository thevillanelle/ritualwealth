/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        rw: {
          bg:      '#0D0F0E',
          surface: '#141917',
          card:    '#1C2320',
          border:  '#2A3530',
          ink:     '#F0EDE8',
          muted:   '#8A9E96',
          gold:    '#C8A86B',
          gold2:   '#E8C88B',
          sage:    '#4A8C6A',
          sage2:   '#6AAD8A',
          rose:    '#C4717A',
        }
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        serif:   ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans:    ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono:    ['"Courier Prime"', 'Courier', 'monospace'],
      },
      borderRadius: { pill: '9999px' },
    },
  },
  plugins: [],
}
