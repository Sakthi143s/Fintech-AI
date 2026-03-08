/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0B0B0F', // Keeping deep base
        surface: '#12121A',    // Slightly deeper surface for cards
        primary: '#6366F1',    // Indigo (Income)
        secondary: '#A855F7',  // Purple (AI)
        accent: '#14B8A6',     // Teal
        success: '#10B981',    // Emerald (Savings Rate / Invest)
        warning: '#F59E0B',    // Amber
        danger: '#EF4444',     // Red (Spent)
      },
    },
  },
  plugins: [],
}
