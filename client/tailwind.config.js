/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F8FAFC", // Cool Grey 50
        surface: "#FFFFFF",
        
        primary: "#6366F1", // Indigo 500
        primaryHover: "#4F46E5", // Indigo 600
        primaryLight: "#E0E7FF", // Indigo 100
        
        secondary: "#10B981", // Emerald 500
        secondaryLight: "#D1FAE5", // Emerald 100
        
        slateText: "#1E293B", // Slate 800 (Headings)
        mutedText: "#64748B", // Slate 500 (Body)
        border: "#E2E8F0", // Slate 200
        
        danger: "#EF4444",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        heading: ["Space Grotesk", "sans-serif"],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(99, 102, 241, 0.05)',
        'card': '0 10px 40px -10px rgba(0,0,0,0.05)',
        'glow': '0 0 20px rgba(99, 102, 241, 0.4)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
};