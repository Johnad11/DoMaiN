/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: '#0A0E1A',
        slate: {
          DEFAULT: '#141A2E',
          deep: '#0e1322',
          light: '#1e2642'
        },
        cyan: {
          plasma: '#00E5FF',
        },
        orange: {
          magma: '#FF6B35',
        },
        green: {
          bio: '#39FF88',
        },
        red: {
          blood: '#FF2E63',
        },
        steel: {
          DEFAULT: '#2A3350',
          dark: '#1c2337',
          light: '#374267'
        },
        bone: '#F2F5FF',
        ash: '#7A85A8',
      },
      fontFamily: {
        heading: ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'cyan-glow': '0 0 20px rgba(0, 229, 255, 0.4)',
        'orange-glow': '0 0 20px rgba(255, 107, 53, 0.4)',
        'green-glow': '0 0 20px rgba(57, 255, 136, 0.4)',
        'red-glow': '0 0 20px rgba(255, 46, 99, 0.4)',
      }
    },
  },
  plugins: [],
}
