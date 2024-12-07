// @ts-check

import antfu from '@antfu/eslint-config'
import tailwind from 'eslint-plugin-tailwindcss'

export default antfu(
  {
    formatters: true,
    react: true,
    ignores: [
      'src/api/types.ts',
      'src/components/ui/**/*',
      'src/**/*.gen.ts',
    ],
    plugins: [],
  },
  ...tailwind.configs['flat/recommended'],
  {
    rules: {
      'ts/consistent-type-definitions': 'off',
      'tailwindcss/migration-from-tailwind-2': 'off',
      'no-alert': 'warn',
      'no-console': 'warn',
    },
  },
)
