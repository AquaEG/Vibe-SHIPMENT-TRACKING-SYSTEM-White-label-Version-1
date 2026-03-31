import type { Config } from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(148, 163, 184, 0.14), 0 32px 80px rgba(2, 6, 23, 0.55)',
      },
      colors: {
        surface: {
          950: '#050816',
          900: '#0b1220',
          850: '#10192d',
          800: '#16213a',
        },
      },
      backgroundImage: {
        'trackflow-grid':
          'radial-gradient(circle at top left, rgba(56,189,248,0.12), transparent 28%), radial-gradient(circle at 80% 10%, rgba(14,165,233,0.09), transparent 24%), linear-gradient(180deg, rgba(2,6,23,0.96), rgba(3,7,18,1))',
      },
    },
  },
  plugins: [],
} satisfies Config;
