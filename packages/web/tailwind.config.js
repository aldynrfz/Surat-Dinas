/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                "primary": "#5048e5",
                "primary-dark": "#3f38b1",
                "secondary": "#272546",
                "background-light": "#f6f6f8",
                "background-dark": "#131221",
                "surface-dark": "#1c1b32",
                "border-dark": "#383663",
                "text-secondary": "#9795c6",
                "card-dark": "#1c1b2e",
                "card-light": "#ffffff",
            },
            fontFamily: {
                "display": ["Inter", "sans-serif"]
            },
            borderRadius: {
                "DEFAULT": "0.5rem",
                "lg": "1rem",
                "xl": "1.5rem",
                "full": "9999px"
            },
        },
    },
    plugins: [],
}
