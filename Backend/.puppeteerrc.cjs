const { join } = require('path');

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // Changes the cache location for Puppeteer to project root so Render / Linux cloud hosts persist Chrome
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};
