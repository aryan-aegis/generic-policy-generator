import Chromium from '@sparticuz/chromium';
import args from './args.js';
import defaultViewport from './defaultViewport.js';
import path from './executablePath.js';

const sparticuzConfig = {
  args,
  defaultViewport,
  executablePath: await path(),
  headless: Chromium.headless,
  ignoreHTTPSErrors: true
};

export default sparticuzConfig;
