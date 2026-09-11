import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#050B18',
          card: '#0B1730',
          cardHover: '#102043',
          navy: '#071A3D',
          navyLight: '#0d2657',
          blue: '#1769FF',
          blueGlow: 'rgba(23, 105, 255, 0.25)',
          blueSoft: 'rgba(23, 105, 255, 0.08)',
          orange: '#FF7A00',
          orangeGlow: 'rgba(255, 122, 0, 0.3)',
          border: 'rgba(23, 105, 255, 0.2)',
          borderDark: 'rgba(255, 255, 255, 0.1)',
          textMuted: '#8E9EB5',
        },
        light: {
          bg: '#F6F9FC',
          card: '#FFFFFF',
          border: '#E2E8F0',
          text: '#071A3D',
          muted: '#64748B',
        }
      },
      boxShadow: {
        'cyber-dock': '0 10px 30px -5px rgba(23, 105, 255, 0.2), 0 0 15px rgba(23, 105, 255, 0.15)',
        'cyber-card': '0 4px 20px -2px rgba(7, 26, 61, 0.1), 0 0 10px rgba(23, 105, 255, 0.05)',
        'cyber-card-dark': '0 4px 25px -2px rgba(0, 0, 0, 0.5), 0 0 15px rgba(23, 105, 255, 0.1)',
        'cyber-glow-blue': '0 0 20px rgba(23, 105, 255, 0.4)',
        'cyber-glow-orange': '0 0 20px rgba(255, 122, 0, 0.4)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
};

export default config;
