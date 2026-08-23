import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
                // Ported from the old Next.js tailwind.config.ts — same
                // Google Fonts, loaded via <link> tags in app.blade.php.
                display: ['Fraunces', 'serif'],
                body: ['"Plus Jakarta Sans"', 'sans-serif'],
                mono: ['"IBM Plex Mono"', 'monospace'],
            },
            colors: {
                // Ported from the old Next.js tailwind.config.ts so the
                // storefront keeps the same light brown/gold/white theme.
                canvas: '#FBF7F0',
                surface: '#F1E4CE',
                surface2: '#E8D6B4',
                ivory: '#3A2A18',
                muted: '#8A7357',
                brass: '#B8863F',
                brassdim: '#8E6E38',
                clay: '#96432E',
                line: '#E0CDA6',
            },
            letterSpacing: {
                widest2: '0.25em',
            },
            maxWidth: {
                content: '1400px',
            },
            keyframes: {
                fadeUp: {
                    '0%': { opacity: '0', transform: 'translateY(16px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
            animation: {
                fadeUp: 'fadeUp 0.6s ease forwards',
            },
        },
    },

    plugins: [forms],
};
