module.exports = {
  plugins: ['unused-imports'],
  extends: ['next', 'next/core-web-vitals'],
  rules: {
    'no-unused-vars': 'off',
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': [
      'warn',
      {
        vars: 'all',
        varsIgnorePattern: '^_',
        args: 'after-used',
        argsIgnorePattern: '^_',
      },
    ],
  },
};

// import unusedImports from 'eslint-plugin-unused-imports';

// export default [
//   {
//     plugins: {
//       'unused-imports': unusedImports,
//     },
//     extends: ['next', 'next/core-web-vitals'],
//     rules: {
//       'no-unused-vars': 'off',
//       'unused-imports/no-unused-imports': 'error',

//       'unused-imports/no-unused-vars': [
//         'warn',
//         {
//           vars: 'all',
//           varsIgnorePattern: '^_',
//           args: 'after-used',
//           argsIgnorePattern: '^_',
//         },
//       ],
//     },
//   },
// ];
