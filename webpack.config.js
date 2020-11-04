const currentTask = process.env.npm_lifecycle_event
const path = require('path')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const fse = require('fs-extra')
const { flatMapDeep } = require('lodash')

const postCSSPlugins = [
  require('postcss-import'),
  require('postcss-mixins'),
  require('postcss-simple-vars'),
  require('postcss-nested'),
  require('postcss-hexrgba'),
  require('autoprefixer')
]

class RunAfterCompile {
  apply (compiler) {
    compiler.hooks.done.tap('Copy images', function() {
      fse.copySync('./app/assets/images', './docs/assets/images')
    })
  }
}

let cssConfig = {
  test: /\.css$/i,
  use: ['css-loader?url=false', {loader: 'postcss-loader', options: {plugins: postCSSPlugins}}]
}

let pages = fse.readdirSync('./app').filter(function(file) {
  return file.endsWith('.html')
}).map(function(page) {
  return new HtmlWebpackPlugin({
    filename: page,
    template: `./app/${page}`
  })
})

let config = {
  entry:'./app/assets/scripts/App.js',
  plugins: pages,
  /* for a single file:
  plugins: [new HtmlWebpackPlugin({filename: 'index.html', template: './app/index.html'})],
  */
  module: {
    rules: [
      cssConfig
    ]
  }
}
/* ==================================================================
         D E V E L O P M E N T / T E S T    S E C T I O N
=====================================================================
*/

if (currentTask == 'dev') {
  cssConfig.use.unshift('style-loader')
  config.output = {
    filename: 'bundled.js',
    path: path.resolve(__dirname, 'app')
  }
  config.devServer = {
    before: function(app, server) {
      server._watch('./app/**/*.html')
    },
    contentBase: path.join(__dirname, 'app'),
    hot: true,
    port: 3000,
    host: '0.0.0.0'
  }
  config.mode = 'development'
}
/* ==================================================================
          B U I L D / P R O D U C T I O N   S E C T I O N
=====================================================================
*/
if (currentTask == 'build') {
  /* load babel for browser backward compatibility */
  config.module.rules.push({
    test: /\.js$/,
    exclude: /(node_modules)/,
    use: {
      loader: 'babel-loader',
      options: {
        presets: ['@babel/preset-env']
      }
    }
  })

  cssConfig.use.unshift(MiniCssExtractPlugin.loader)
  postCSSPlugins.push(require('cssnano'))
  config.output = {
    filename: '[name].[chunkhash].js',
    chunkFilename: '[name].[chunkhash].js',
    path: path.resolve(__dirname, 'docs')
  }

  config.mode = 'production'

  config.optimization = {
    splitChunks: {chunks: 'all'}
  }

  config.plugins.push(
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({filename: 'styles.[chunkhash].css'}),
    new RunAfterCompile()
  )
}

module.exports = config