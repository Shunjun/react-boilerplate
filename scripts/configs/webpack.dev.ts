import { merge } from 'webpack-merge';
import { resolve } from 'path';
import { HotModuleReplacementPlugin } from 'webpack';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';

import commonConfig from './webpack.common';
import { PROJECT_ROOT } from '../utils/constants';

export default merge(commonConfig, {
  mode: 'development',
  devtool: 'eval-source-map',
  plugins: [
    // ts类型检查
    new ForkTsCheckerWebpackPlugin({
      typescript: {
        memoryLimit: 1024,
        // babel 转换的是我们前端代码，所以是指向前端代码的 tsconfig.json
        configFile: resolve(PROJECT_ROOT, './src/tsconfig.json'),
      },
    }),
    new HotModuleReplacementPlugin(),
  ],
});
