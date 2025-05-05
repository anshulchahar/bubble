// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add minimal Node.js core modules needed by the WebSocket library
config.resolver.extraNodeModules = {
  stream: require.resolve('stream-browserify'),
  crypto: require.resolve('react-native-crypto'),
  buffer: require.resolve('buffer'),
  events: require.resolve('events'),
  path: require.resolve('path-browserify'),
  // Empty mocks for Node.js modules
  https: require.resolve('./src/lib/empty-module.js'),
  http: require.resolve('./src/lib/empty-module.js'),
  net: require.resolve('./src/lib/empty-module.js'),
  tls: require.resolve('./src/lib/empty-module.js'),
  fs: require.resolve('./src/lib/empty-module.js'),
  zlib: require.resolve('./src/lib/empty-module.js'),
};

module.exports = config;