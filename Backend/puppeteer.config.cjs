if (process.env.NODE_ENV == 'production') {
  const { join } = require('path');
  /**
  * @type {import("puppeteer").Configuration}
  */
  module.exports = {cacheDirectory: join(__dirname, '.cache', 'puppeteer')};
}