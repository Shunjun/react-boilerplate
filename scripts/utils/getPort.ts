import _getPort from 'get-port';

export default async function getPort(HOST: string, PORT: number): Promise<number> {
  const resPort = await _getPort({ host: HOST, port: PORT });

  if (resPort === PORT) {
    return resPort;
  }

  // 递归 返回下一个PORT
  return getPort(HOST, PORT + 1);
}
