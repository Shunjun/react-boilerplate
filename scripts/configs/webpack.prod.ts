import { merge } from 'webpack-merge';
import { resolve } from 'path';
import { BannerPlugin } from 'webpack';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin';
import SpeedMeasurePlugin from 'speed-measure-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import SizePlugin from 'size-plugin';

import commonConfig from './webpack.common';
import { ENABLE_ANALYZE, PROJECT_ROOT } from '../utils/constants';

const mergedConfig = merge(commonConfig, {
  mode: 'production',
  plugins: [
    new BannerPlugin({
      raw: true,
      banner: `/** @preserve Powered by react-boilerplate (https://github.com/shunjun/react-boilerplate) */`,
    }),
    new ForkTsCheckerWebpackPlugin({
      typescript: {
        memoryLimit: 1024 * 2,
        // babel 转换的是我们前端代码，所以是指向前端代码的 tsconfig.json
        configFile: resolve(PROJECT_ROOT, './src/tsconfig.json'),
      },
    }),
    // @ts-ignore
    new MiniCssExtractPlugin({
      // 文件名中插入文件内容的 hash 值
      filename: 'css/[name].[contenthash].css',
      chunkFilename: 'css/[id].[contenthash].css',
      ignoreOrder: false,
    }),
    new SizePlugin({ writeFile: false }),
  ],
  optimization: {
    runtimeChunk: 'single',
    minimize: true,
    // @ts-ignore
    minimizer: [new TerserPlugin({ extractComments: false }), new OptimizeCSSAssetsPlugin()],
  },
});

// eslint-disable-next-line import/no-mutable-exports
let prodConfig = mergedConfig;

// 使用 --analyze 参数构建时，会输出各个阶段的耗时和自动打开浏览器访问 bundle 分析页面
if (ENABLE_ANALYZE) {
  mergedConfig.plugins!.push(new BundleAnalyzerPlugin());
  const smp = new SpeedMeasurePlugin();
  prodConfig = smp.wrap(mergedConfig);
}

export default prodConfig;
