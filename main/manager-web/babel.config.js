module.exports = {
  presets: [
    ['@vue/cli-plugin-babel/preset', {
      useBuiltIns: 'usage',
      corejs: 3
    }]
  ],
  plugins: [
    '@babel/plugin-syntax-dynamic-import',  // đảm bảo hỗ trợ import động (Lazy Loading)
    '@babel/plugin-transform-runtime'
  ]
}
