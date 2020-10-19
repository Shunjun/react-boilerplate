import { Configuration } from 'webpack';
import { resolve } from 'path';
import WebpackBar from 'webpackbar';
import FriendlyErrorsPlugin from 'friendly-errors-webpack-plugin';
import WebpackBuildNotifierPlugin from 'webpack-build-notifier';
// import CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
// eslint-disable-next-line import/no-unresolved
import { Options as HtmlMinifierOptions } from 'html-minifier';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';
import { loader as MiniCssExtractLoader } from 'mini-css-extract-plugin';

import { __DEV__, PROJECT_NAME, PROJECT_ROOT, HMR_PATH } from '../utils/constants';

const htmlMinifyOptions: HtmlMinifierOptions = {
  collapseWhitespace: true,
  collapseBooleanAttributes: true,
  collapseInlineTagWhitespace: true,
  removeComments: true,
  removeRedundantAttributes: true,
  removeScriptTypeAttributes: true,
  removeStyleLinkTypeAttributes: true,
  minifyCSS: true,
  minifyJS: true,
  minifyURLs: true,
  useShortDoctype: true,
};

function getCssLoaders(importLoaders: number) {
  return [
    __DEV__ ? 'style-loader' : MiniCssExtractLoader,
    {
      loader: 'css-loader',
      options: {
        modules: false,
        sourceMap: true,
        importLoaders,
      },
    },
    {
      loader: 'postcss-loader',
      options: { sourceMap: true },
    },
  ];
}

const commonConfig: Configuration = {
  context: PROJECT_ROOT,
  entry: ['react-hot-loader/patch', resolve(PROJECT_ROOT, './src/index.tsx')],
  output: {
    publicPath: '/',
    path: resolve(PROJECT_ROOT, './dist'),
    filename: 'js/[name]-[hash].bundle.js',
    // 加盐 hash
    hashSalt: PROJECT_NAME || 'react typescript boilerplate',
  },
  resolve: {
    // 我们导入ts 等模块一般不写后缀名，webpack 会尝试使用这个数组提供的后缀名去导入
    extensions: ['.ts', '.tsx', '.js', '.json'],
    alias: {
      'react-dom': '@hot-loader/react-dom',
    },
  },
  module: {
    rules: [
      {
        // 导入 jsx 的人少喝点
        test: /\.(tsx?|js)$/,
        loader: 'babel-loader',
        // 开启缓存
        options: { cacheDirectory: true },
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: [...getCssLoaders(1)],
      },
      {
        test: /\.less$/,
        use: [
          ...getCssLoaders(2),
          {
            // 先让 less-loader 将 less 文件转换成 css 文件
            // 再交给 css-loader 处理
            loader: 'less-loader',
            options: {
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /\.scss$/,
        use: [
          ...getCssLoaders(2),
          {
            loader: 'sass-loader',
            options: {
              // 中间每个 loader 都要开启 sourcemap，才能生成正确的 soucemap
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
        use: [
          {
            loader: 'url-loader',
            options: {
              // 图片低于 10k 会被转换成 base64 格式的 dataUrl
              limit: 10 * 1024,
              // [hash] 占位符和 [contenthash] 是相同的含义
              // 都是表示文件内容的 hash 值，默认是使用 md5 hash 算法
              name: '[name].[contenthash].[ext]',
              // 保存到 images 文件夹下面
              outputPath: 'images',
            },
          },
        ],
      },
      {
        test: /\.(ttf|woff|woff2|eot|otf)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              name: '[name]-[contenthash].[ext]',
              outputPath: 'fonts',
            },
          },
        ],
      },
    ],
  },
  plugins: [
    /* 构建时显示进度条 */
    new WebpackBar({
      name: PROJECT_NAME,
      // react 蓝
      color: '#61dafb',
    }),
    /* 更友好的控制台输出 */
    new FriendlyErrorsPlugin(),
    /* 构建事件的 OS 弹窗通知 */
    // suppressSuccess: true 设置只在第一次编译成功时输出成功的通知, rebuild 成功的时候不通知
    new WebpackBuildNotifierPlugin({ suppressSuccess: true }),
    /* 路径严格的大小写检查,打包速度比较慢 */
    // new CaseSensitivePathsPlugin(),
    /* 清理上次打包的 bundle */
    new CleanWebpackPlugin(),
    /* html-webpack-plugin 自动生成 index.html */
    new HtmlWebpackPlugin({
      // HtmlWebpackPlugin 会调用 HtmlMinifier 对 HTMl 文件进行压缩
      // 只在生产环境压缩
      minify: __DEV__ ? false : htmlMinifyOptions,
      // 指定 html 模板路径
      template: resolve(PROJECT_ROOT, './public/index.html'),
      // 类型不好定义，any 一时爽...
      // 定义一些可以在模板中访问的模板参数
      templateParameters: (...args: any[]) => {
        const [compilation, assets, assetTags, options] = args;
        const rawPublicPath = commonConfig.output!.publicPath! as string;
        return {
          compilation,
          webpackConfig: compilation.options,
          htmlWebpackPlugin: {
            tags: assetTags,
            files: assets,
            options,
          },
          // 除掉 publicPath 的反斜杠，让用户在模板中拼接路径更自然
          PUBLIC_PATH: rawPublicPath.endsWith('/') ? rawPublicPath.slice(0, -1) : rawPublicPath,
        };
      },
    }),
    // 拷贝静态文件到 dist
    new CopyPlugin({
      patterns: [
        {
          context: resolve(PROJECT_ROOT, './public'),
          // 所有一级文件
          from: '*',
          to: resolve(PROJECT_ROOT, './dist'),
          // 目标类型是文件夹
          toType: 'dir',
          // index.html 会通过 html-webpack-plugin 自动生成，所以需要被忽略掉
          globOptions: {
            ignore: ['index.html'],
          },
        },
      ],
    }),
  ],
};

if (__DEV__) {
  (commonConfig.entry as string[]).unshift(`webpack-hot-middleware/client?path=${HMR_PATH}`);
}

export default commonConfig;
