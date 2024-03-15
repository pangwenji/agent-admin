// @ts-check
const { defineConfig } = require('eslint-define-config')
module.exports = defineConfig({
  root: true,
  env: {
    browser: true,
    node: true,
    es6: true
  },
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2020,
    sourceType: 'module',
    jsxPragma: 'React',
    ecmaFeatures: {
      jsx: true
    }
  },
  extends: [
    'plugin:vue/vue3-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'prettier'
  ],
  rules: {
    'vue/no-setup-props-destructure': 'off',
    'vue/script-setup-uses-vars': 'error',
    'vue/no-reserved-component-names': 'off',
    '@typescript-eslint/ban-ts-ignore': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    'vue/custom-event-name-casing': 'off',
    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/ban-types': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-unused-vars': 'warn', // 没有引用的变量
    'no-unused-vars': 'warn', //
    'space-before-function-paren': 'off',
    'vue/attributes-order': 'warn', // 属性顺序
    'vue/one-component-per-file': 'off',
    'vue/html-closing-bracket-newline': 'off',
    'vue/max-attributes-per-line': 'off',
    'vue/multiline-html-element-content-newline': 'off',
    'vue/singleline-html-element-content-newline': 'off',
    'vue/attribute-hyphenation': 'off',
    'vue/require-explicit-emits': 'off',
    'vue/html-self-closing': [
      'error',
      {
        html: {
          void: 'always',
          normal: 'never',
          component: 'always'
        },
        svg: 'always',
        math: 'always'
      }
    ],
    'vue/multi-word-component-names': 'warn',
    'vue/no-v-html': 'off',
    'vue/require-toggle-inside-transition': 'off',
    eqeqeq: 'error', //全等
    'no-param-reassign': 'warn', // 禁止对函数参数进行重新赋值
    'vue/require-default-prop': 'warn', //属性默认值
    'no-var': 'error', // 禁止使用 var 关键字
    'no-magic-numbers': [
      'warn',
      {
        ignore: [0, 1, -1], // 可以忽略的特定数字
        ignoreArrayIndexes: true, // 忽略数组索引
        enforceConst: true, // 强制使用const定义常量
        detectObjects: false // 是否检测对象中的魔法数字
      }
    ],
    'no-dupe-keys': 'error',
    'no-dupe-args': 'error',
    'no-func-assign': 'error',
    'prettier/prettier': [
      'error',
      {
        endOfLine: 'lf',
      }
    ]
  }
})
