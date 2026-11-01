export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          // Primary Colors
          beige: "#f1eae2",
          black: "#000000",
          brown: "#470707",
          "light-brown": "#66391b",
          white: "#ffffff",
          
          // Extended Palette - Variants
          "beige-dark": "#e5d5c3",
          "beige-light": "#faf7f5",
          "brown-dark": "#3a0505",
          "brown-light": "#8b5a3c",
          "brown-accent": "#a65d3b",
          
          // Neutral Tones
          charcoal: "#2a2a2a",
          gray: "#5a5a5a",
          "light-gray": "#e8e5e0",
          "off-white": "#fefdfb",
          
          // Accent Colors for contrast
          gold: "#c9a566",
          "gold-dark": "#a68553",
          "gold-light": "#dab88f",
          
          // Secondary colors
          cream: "#f5f2ed",
          taupe: "#8b8680",
          "rose-brown": "#6b4423",
          
          // For interactive elements
          copper: "#b87333",
          bronze: "#8c4e1c",
          
          // Legacy colors (keeping for compatibility during transition)
          navy: "#470707",
          ivory: "#f1eae2",
          purple: "#6b4423",
          mist: "#faf7f5",
          maroon: "#470707"
        }
      },
      fontFamily: {
             serifFancy: ['Playfair Display', 'serif'],
             sansTrend: ['Poppins', 'sans-serif'],
             heading: ["'Playfair Display'", "serif"],
             body: ["'Lato'", "sans-serif"],
             fancy: ["'Great Vibes'", "cursive"],
             script: ["'Dancing Script'", "cursive"],

      },
      boxShadow: {
        luxe: "0 10px 30px rgba(0,0,0,0.15)"
      },
      borderRadius: {
        xl2: "1.25rem"
      }
    }
  },
  plugins: []
};
