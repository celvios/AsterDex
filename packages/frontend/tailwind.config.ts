import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backdropBlur: { '4xl': '60px' },
      borderRadius: { '4xl': '28px', '5xl': '36px' },
      colors: {
        accent: { DEFAULT: '#1A56DB', light: '#3B82F6', muted: '#DBEAFE' },
        primary: '#111827',
        secondary: '#4B5563',
      },
      boxShadow: {
        glass:     '0 8px 32px rgba(0, 0, 0, 0.06)',
        'glass-lg':'0 16px 64px rgba(0, 0, 0, 0.08)',
      }
    }
  },
  plugins: [],
}
export default config
