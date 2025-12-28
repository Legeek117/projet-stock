/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'ios-bg': '#000000',      // Fond noir absolu
                'ios-card': '#1C1C1E',    // Gris foncé (cartes iOS)
                'ios-blue': 'var(--primary-color, #0A84FF)',    // Bleu système iOS (Dynamique)
                'ios-gray': '#8E8E93',    // Gris secondaire
                'ios-divider': '#38383A', // Séparateurs
                'glass-bg': 'rgba(28, 28, 30, 0.6)', // Fond pour glassmorphism
            },
            fontFamily: {
                sans: ['-apple-system', 'BlinkMacSystemFont', 'San Francisco', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'sans-serif'],
            },
            backdropBlur: {
                xs: '2px',
            }
        },
    },
    plugins: [],
}
