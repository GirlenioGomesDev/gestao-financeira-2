const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const config = getDefaultConfig(__dirname);

const nativeWindConfig = withNativeWind(config, { input: './global.css' });

nativeWindConfig.maxWorkers = 1;
nativeWindConfig.resolver.extraNodeModules = {
  ...nativeWindConfig.resolver.extraNodeModules,
  'react-native-reanimated': path.resolve(__dirname, 'src/shims/react-native-reanimated.js'),
};

module.exports = nativeWindConfig;
