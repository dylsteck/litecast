import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        system: {
          label: '#000000',
          'secondary-label': '#8E8E93',
          'tertiary-label': '#C7C7CC',
          separator: 'rgba(60, 60, 67, 0.12)',
          background: '#FFFFFF',
          'secondary-background': '#F2F2F7',
        },
        brand: {
          primary: '#8B5CF6',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'SF Pro Text', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
