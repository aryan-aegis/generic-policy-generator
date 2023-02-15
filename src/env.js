const config =
  process.env.NODE_ENV !== 'production' ? await import('dotenv') : null;

if (config) config.config();

export const NODE_ENV = process.env.NODE_ENV;
export const CHROMIUM_PATH = process.env.CHROMIUM_PATH;
export const LOGIN_MAX_WAIT_TIME =
  Number(process.env.LOGIN_MAX_WAIT_TIME) || 50000;
export const CAPTCHA_MAX_RETRY_LIMIT =
  Number(process.env.CAPTCHA_MAX_RETRY_LIMIT) || 3;
