import type { Config } from 'tailwindcss'

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
        primary: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1F4E79',
          950: '#172554',
        },
        navy: '#1F4E79',
        gold: '#C9A96E',
        warm: '#F5F0EB',
        business: {
          concierge: '#5B8FB9',
          dx: '#9B72CF',
          reskilling: '#E8945A',
          careguide: '#D4756B',
          funding: '#6B8E7B',
          marketing: '#B5A27F',
        }
      },
      fontFamily: {
        sans: ['"Noto Sans JP"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
