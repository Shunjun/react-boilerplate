import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import { Compiler } from 'webpack';

import devConfig from '../configs/webpack.dev';
import { HMR_PATH } from '../utils/constants';

export default function webpackMiddleware(compiler: Compiler): any[] {
  const publicPath = devConfig.output!.publicPath! as string;

  const devMiddlewareOptions: webpackDevMiddleware.Options = {
    // 保持和 webpack 中配置一致
    publicPath,
    // 只在发生错误或有新的编译时输出
    stats: 'minimal',
    // 需要输出文件到磁盘可以开启
    // writeToDisk: true
  };

  const hotMiddlewareOptions: webpackHotMiddleware.ClientOptions = {
    // sse 路由
    path: HMR_PATH,
    // 编译出错会在网页中显示出错信息遮罩
    overlay: true,
    // webpack 卡住自动刷新页面
    reload: true,
  };

  return [
    webpackDevMiddleware(compiler, devMiddlewareOptions),
    webpackHotMiddleware(compiler, hotMiddlewareOptions),
  ];
}
