const { createRequestHandler } = require('expo-server/adapter/vercel');
const path = require('path');

module.exports = createRequestHandler({
  build: path.join(__dirname, '../dist/server'),
});
