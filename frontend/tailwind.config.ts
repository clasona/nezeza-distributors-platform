import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // colors: {
      //   background: "var(--background)",
      //   foreground: "var(--foreground)",
      // },
      screens: {
        xs: '320px',
        sm: '375px',
        sml: '500px',
        md: '667px',
        mdl: '768px',
        lg: '960px',
        lgl: '1024px',
        xl: '1280px',
      },
      colors: {
        // nezeza_dark_blue: "#131921",
        nezeza_dark_blue: '#0074d9',
        nezeza_light_blue: '#e2f3fd',
        nezeza_light: '#232F3E',
        nezeza_yellow: '#febd69',
        lightText: '#ccc',
      },
      fontFamily: {
        bodyFont: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
