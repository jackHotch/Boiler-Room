const { join } = require('path');

const isProduction = process.env.NODE_ENV === 'production';

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  cacheDirectory: isProduction
    ? join(__dirname, '.cache', 'puppeteer')  // Production path
    : undefined // Default for local, letting Puppeteer manage it
};
