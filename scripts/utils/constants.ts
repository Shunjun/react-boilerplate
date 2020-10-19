import path from 'path';
import { argv } from 'yargs';

const __DEV__ = process.env.NODE_ENV !== 'production';
const ENABLE_ANALYZE = !!argv.analyze;

const PROJECT_ROOT = path.resolve(__dirname, '../../');
const PROJECT_NAME = path.parse(PROJECT_ROOT).name;
const HMR_PATH = '/__webpack_hmr';

const ENABLE_OPEN = argv.open;

const HOST = '127.0.0.1';
const DEFAULT_PORT = 3000;

export {
  __DEV__,
  ENABLE_ANALYZE,
  HOST,
  HMR_PATH,
  PROJECT_NAME,
  PROJECT_ROOT,
  DEFAULT_PORT,
  ENABLE_OPEN,
};
