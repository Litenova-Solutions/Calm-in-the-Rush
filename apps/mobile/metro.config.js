const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
config.watchFolders = [
  require('path').resolve(__dirname, '../../packages/content'),
  require('path').resolve(__dirname, '../../packages/experience'),
  require('path').resolve(__dirname, '../../packages/ui'),
];
config.resolver.nodeModulesPaths = [
  require('path').resolve(__dirname, 'node_modules'),
  require('path').resolve(__dirname, '../../node_modules'),
];

module.exports = config;
