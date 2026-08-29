import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.ts', 'tests/**/*.ts', 'playwright.config.ts'],
    languageOptions: {
      globals: {
        document: 'readonly', window: 'readonly', navigator: 'readonly', location: 'readonly', history: 'readonly',
        localStorage: 'readonly', sessionStorage: 'readonly', confirm: 'readonly', scrollTo: 'readonly', matchMedia: 'readonly',
        setTimeout: 'readonly', URL: 'readonly', Blob: 'readonly', FormData: 'readonly', HTMLElement: 'readonly',
        HTMLAnchorElement: 'readonly', HTMLDialogElement: 'readonly', HTMLDivElement: 'readonly', HTMLFormElement: 'readonly',
        HTMLInputElement: 'readonly', crypto: 'readonly', globalThis: 'readonly', Buffer: 'readonly', process: 'readonly'
      }
    }
  },
  {
    files: ['api/**/*.js', 'tests/**/*.mjs'],
    languageOptions: { globals: { require: 'readonly', module: 'readonly', Buffer: 'readonly', process: 'readonly', URL: 'readonly', structuredClone: 'readonly' } },
    rules: { '@typescript-eslint/no-require-imports': 'off' }
  },
  { ignores: ['dist/**', 'node_modules/**', '.factory/**'] }
);
