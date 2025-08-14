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
      // screens: {
      //   xs: '320px',
      //   sm: '375px',
      //   sml: '500px',
      //   md: '667px',
      //   mdl: '768px',
      //   lg: '960px',
      //   lgl: '1024px',
      //   xl: '1280px',
      // },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },
      colors: {
        // Updated Vesoko Brand Colors - Orange & Brown Theme (matching logo)
        vesoko_primary: '#ff7a00', // Primary orange - main brand color
        vesoko_primary_dark: '#e66a00', // Darker orange for hover states
        vesoko_primary_light: '#ff8f33', // Lighter orange for subtle accents
        vesoko_secondary: '#3d1f00', // Deep brown - secondary brand color
        vesoko_secondary_light: '#5c2f00', // Lighter brown for hover states
        vesoko_background: '#f7ede2', // Light cream/beige background
        vesoko_background_light: '#faf6f1', // Even lighter background
        vesoko_accent: '#ff7a00', // Same as primary for consistency
        
        // Functional colors (keeping some for alerts, success, etc.)
        lightText: '#ccc',
        vesoko_green_500: '#4CAF50',
        vesoko_green_600: '#38a169', //43A047
        vesoko_green_800: '#276749', //2E7D32
        vesoko_red_200: '#fed7d7',
        vesoko_red_600: '#e53e3e', // E53935
        vesoko_red_700: '#c53030', //D32F2F
        vesoko_gray_600: '#718096', //757575
        vesoko_gray_200: '#edf2f7', //dee2e6
        
        // Legacy color mappings for backward compatibility
        vesoko_dark_blue: '#3d1f00', // Mapped to deep brown
        vesoko_dark_blue_2: '#5c2f00', // Mapped to lighter brown
        vesoko_light_blue: '#f7ede2', // Mapped to light background
        vesoko_powder_blue: '#ff7a00', // Mapped to primary orange
        vesoko_light: '#3d1f00', // Mapped to deep brown
        vesoko_yellow: '#ff7a00', // Mapped to primary orange
        vesoko_dark_slate: '#3d1f00', // Mapped to deep brown
        vesoko_light_slate: '#f7ede2', // Mapped to light background
        vesoko_yellow_600: '#ff7a00', // Mapped to primary orange
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
//         vesoko_dark_blue: '#0074d9',
//         vesoko_light_blue: '#e2f3fd',
//         vesoko_light: '#232F3E',
//         vesoko_yellow: '#febd69',
//         lightText: '#ccc',
//         vesoko_dark_slate: 'slate-700',
//         vesoko_light_slate: 'slate-50',
//         vesoko_green_500: '#4CAF50',
//         vesoko_green_600: '#43A047',
//         vesoko_green_800: '#2E7D32',
//         vesoko_red_600: '#E53935',
//         vesoko_red_700: '#D32F2F',
//         vesoko_gray_600: '#757575',
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
