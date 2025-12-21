import {nextui} from '@nextui-org/theme'

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      aspectRatio: {
        '16/9': '16 / 9',
        '9/16': '9/16',
        '4/3': '4 / 3',
      },
    },
  },
  darkMode: "class",
  plugins: [nextui()],
}
