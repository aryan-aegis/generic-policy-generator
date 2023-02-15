import chromium from '@sparticuz/chromium';
import { CHROMIUM_PATH, NODE_ENV } from './../env.js';

const executablePath = async () => {
  if (NODE_ENV === 'DEV') return CHROMIUM_PATH;
  return await chromium.executablePath();
};

export default executablePath;
