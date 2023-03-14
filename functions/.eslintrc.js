module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: ['eslint:recommended', 'google'],
  rules: {
    quotes: ['error', 'single'],
    'quote-props': ['error', 'as-needed'],
    'object-curly-spacing': 'off',
    'max-len': 'off',
    indent: 'off',
  },
};
