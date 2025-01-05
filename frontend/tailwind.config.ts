import type { Config } from 'tailwindcss';
import { withUt } from 'uploadthing/tw';

export default withUt({
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
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
        nezeza_dark_blue: '#3182ce', //0074d9
        nezeza_light_blue: '#e2f3fd',
        nezeza_powder_blue: '#A7C7E7', //87CEEB
        nezeza_light: '#232F3E',
        nezeza_yellow: '#febd69',
        lightText: '#ccc',
        nezeza_dark_slate: 'slate-700',
        nezeza_light_slate: 'slate-50',
        nezeza_green_500: '#4CAF50',
        nezeza_green_600: '#38a169', //43A047
        nezeza_green_800: '#276749', //2E7D32
        nezeza_red_200: '#fed7d7',
        nezeza_red_600: '#e53e3e', // E53935
        nezeza_red_700: '#c53030', //D32F2F
        nezeza_gray_600: '#718096', //757575
        nezeza_gray_200: '#edf2f7', //dee2e6
        nezeza_yellow_600: '#d69e2e',
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      fontFamily: {
        bodyFont: ['Poppins', 'sans-serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/forms')],
  //  content: ["./src/**/*.{ts,tsx,mdx}"],
  // ...
});

// const config: Config = {
//   darkMode: ['class'],
//   content: [
//     './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
//     './src/components/**/*.{js,ts,jsx,tsx,mdx}',
//     './src/app/**/*.{js,ts,jsx,tsx,mdx}',
//   ],
//   theme: {
//     extend: {
//       screens: {
//         xs: '320px',
//         sm: '375px',
//         sml: '500px',
//         md: '667px',
//         mdl: '768px',
//         lg: '960px',
//         lgl: '1024px',
//         xl: '1280px',
//       },
//       colors: {
//         nezeza_dark_blue: '#0074d9',
//         nezeza_light_blue: '#e2f3fd',
//         nezeza_light: '#232F3E',
//         nezeza_yellow: '#febd69',
//         lightText: '#ccc',
//         nezeza_dark_slate: 'slate-700',
//         nezeza_light_slate: 'slate-50',
//         nezeza_green_500: '#4CAF50',
//         nezeza_green_600: '#43A047',
//         nezeza_green_800: '#2E7D32',
//         nezeza_red_600: '#E53935',
//         nezeza_red_700: '#D32F2F',
//         nezeza_gray_600: '#757575',
//         sidebar: {
//           DEFAULT: 'hsl(var(--sidebar-background))',
//           foreground: 'hsl(var(--sidebar-foreground))',
//           primary: 'hsl(var(--sidebar-primary))',
//           'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
//           accent: 'hsl(var(--sidebar-accent))',
//           'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
//           border: 'hsl(var(--sidebar-border))',
//           ring: 'hsl(var(--sidebar-ring))',
//         },
//       },
//       fontFamily: {
//         bodyFont: ['Poppins', 'sans-serif'],
//       },
//       borderRadius: {
//         lg: 'var(--radius)',
//         md: 'calc(var(--radius) - 2px)',
//         sm: 'calc(var(--radius) - 4px)',
//       },
//     },
//   },
//   plugins: [require('tailwindcss-animate'), require('@tailwindcss/forms')],
// };
// export default config;
