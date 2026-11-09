import vue from 'eslint-plugin-vue';
import tseslint from 'typescript-eslint';
import vuetify from 'eslint-config-vuetify';

const typescriptRules = {
  '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports', disallowTypeAnnotations: false }],
  '@typescript-eslint/unified-signatures': 'off',
  '@typescript-eslint/method-signature-style': 'off',
  '@typescript-eslint/member-ordering': 'off'
};

/**
 * Formatting is owned by oxfmt. These Vue rules are disabled so ESLint never
 * reformats templates or script blocks differently.
 */
const vueRules = {
  'vue/script-indent': 'off',
  'vue/attributes-order': 'off',
  'vue/padding-line-between-tags': 'off',
  'vue/padding-line-between-blocks': 'off',
  'vue/max-attributes-per-line': 'off',
  'vue/html-self-closing': 'off',
  'vue/html-closing-bracket-newline': 'off',
  'vue/html-closing-bracket-spacing': 'off',
  'vue/html-indent': 'off',
  'vue/html-quotes': 'off',
  'vue/mustache-interpolation-spacing': 'off',
  'vue/no-multi-spaces': 'off',
  'vue/no-spaces-around-equal-signs-in-attribute': 'off',
  'vue/attribute-hyphenation': 'off',
  'vue/v-bind-style': 'off',
  'vue/v-on-style': 'off',
  'vue/v-slot-style': 'off',
  'vue/multiline-html-element-content-newline': 'off',
  'vue/singleline-html-element-content-newline': 'off',
  'vue/define-macros-order': 'off',
  'vue/first-attribute-linebreak': 'off',
  'vue/v-on-event-hyphenation': 'off',
  'vue/block-order': ['warn', { order: ['script', 'template', 'style'] }],
  'vue/component-name-in-template-casing': [
    'warn',
    'PascalCase',
    { registeredComponentsOnly: false, ignores: ['/^icon-/'] }
  ],
  'vue/custom-event-name-casing': ['warn', 'camelCase']
};

export default vuetify(
  {
    ts: { preset: 'strict' },
    perfectionist: false,
    stylistic: false,
    unicorn: false,
    regexp: false,
    antfu: false,
    imports: false,
    json: false,
    pnpm: false,
    autoimports: false,
    test: false
  },
  {
    rules: {
      curly: 'off',
      'no-empty': ['error', { allowEmptyCatch: true }]
    }
  },
  {
    files: ['**/*.{ts,tsx,vue}'],
    plugins: { '@typescript-eslint': tseslint.plugin },
    rules: typescriptRules
  },
  {
    files: ['**/*.vue'],
    plugins: { vue },
    rules: vueRules
  }
);
