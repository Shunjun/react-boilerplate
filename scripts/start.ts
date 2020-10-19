import chalk from 'chalk';
import logSymbols from 'log-symbols';
import express from 'express';
import webpack from 'webpack';
import WebpackOpenBrowser from 'webpack-open-browser';

import devConfig from './configs/webpack.dev';
import { HOST, DEFAULT_PORT, ENABLE_OPEN } from './utils/constants';
import setupMiddlewares from './middlewares';
import getPort from './utils/getPort';

function openBrowser(address: string) {
  // ENABLE_OPEN 参数值可能是 true 或者是一个指定的 URL
  if (ENABLE_OPEN) {
    let openAddress = ENABLE_OPEN as string;
    if (ENABLE_OPEN === true) {
      openAddress = address;

      let publicPath = devConfig.output?.publicPath as string;
      publicPath = publicPath === null || publicPath === '' ? '/' : publicPath;
      if (publicPath !== '/') {
        // 要注意处理没有带 '/' 前缀和后缀的情况
        openAddress = `${address}${publicPath.startsWith('/') ? '' : '/'}${publicPath}${
          publicPath.endsWith('/') ? '' : '/'
        }index.html`;
      }
    }
    // 添加WebpackOpenBrowser插件
    devConfig.plugins!.push(new WebpackOpenBrowser({ url: openAddress }));

    // let hadOpened = false
    // // 编译完成时执行
    // compiler.hooks.done.tap('open-browser-plugin', async (stats: Stats) => {
    //   // 没有打开过浏览器并且没有编译错误就打开浏览器
    //   if (!hadOpened && !stats.hasErrors()) {
    //     await open(address);
    //     hadOpened = true;
    //   }
    // });
  }
}

async function start() {
  const PORT = await getPort(HOST, DEFAULT_PORT);
  const address = `http://${HOST}:${PORT}`;

  openBrowser(address);

  // 加载 webpack 配置
  const compiler = webpack(devConfig);
  const devServer = express();
  setupMiddlewares(compiler, devServer);

  // see: https://github.com/DefinitelyTyped/DefinitelyTyped/commit/bb48ba4feb5ef620b5fe5147a4ee0e31e741dd9c#diff-d4c3ca4364a91014c1024748a43ae185
  const httpServer = devServer.listen(PORT, HOST, () => {
    // logSymbols.success 在 windows 平台渲染为 √ ，支持的平台会显示 ✔
    console.log(
      `DevServer is running at ${chalk.magenta.underline(address)} ${logSymbols.success}`,
    );
  });

  // 我们监听了 node 信号，所以使用 cross-env-shell 而不是 cross-env
  // 参考：https://github.com/kentcdodds/cross-env#cross-env-vs-cross-env-shell
  ['SIGINT', 'SIGTERM'].forEach((signal: any) => {
    process.on(signal, () => {
      // 先关闭 devServer
      httpServer.close();
      // 在 ctrl + c 的时候随机输出 'See you again' 和 'Goodbye'
      console.log(
        chalk.greenBright.bold(`\n${Math.random() > 0.5 ? 'See you again' : 'Goodbye'}!`),
      );
      // 退出 node 进程
      process.exit();
    });
  });
}

// 写过 python 的人应该不会陌生这种写法
// require.main === module 判断这个模块是不是被直接运行的
if (require.main === module) {
  start();
}
