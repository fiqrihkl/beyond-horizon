import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            screens: {
                'xs': '375px',
                ...defaultTheme.screens,
            },
            fontFamily: {
                sans: ['Inter', ...defaultTheme.fontFamily.sans],
                rounded: ['Nunito Sans', 'sans-serif'],
                serif: ['Playfair Display', 'Georgia', 'ui-serif', 'serif'],
                cinzel: ['Cinzel', 'serif'],
                script: ['Great Vibes', 'cursive'],
            },
            colors: {
                primary: {
                    DEFAULT: '#F48C06',
                    hover: '#E87D00',
                },
                navy: {
                    DEFAULT: '#2F327D',
                    light: '#5A5DB4',
                },
                slate: {
                    DEFAULT: '#696984',
                    light: '#A0A0B4',
                },
                background: {
                    light: '#FFFFFF',
                    warm: '#FFF2E1',
                    dark: '#0F172A',
                }
            },
        },
    },

    plugins: [forms],
};
