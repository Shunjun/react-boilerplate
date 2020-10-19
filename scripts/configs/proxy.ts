import { Options } from 'http-proxy-middleware/dist/types';

interface ProxyTable {
  [path: string]: Options;
}

const proxyTable: ProxyTable = {
  // 示例配置
  // '/path_to_be_proxy': { target: 'http://target.domain.com', changeOrigin: true },
};

export default proxyTable;
