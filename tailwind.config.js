/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./internal/**/*.{go,js,templ,html}"
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: 'var(--color-primary)',
                secondary: 'var(--color-secondary)',
                accent: 'var(--color-accent)',
                background: 'var(--color-background)',
                text: 'var(--color-text)',
            },
        },
    },
    plugins: [],
}
