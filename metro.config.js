const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// ✅ Configure Metro to process SVGs as React components
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve("react-native-svg-transformer"),
};

config.resolver = {
  ...config.resolver,
  assetExts: config.resolver.assetExts.filter(ext => ext !== "svg"), // Remove SVG from asset extensions
  sourceExts: [...config.resolver.sourceExts, "svg"], // Add SVG to source extensions
};

module.exports = withNativeWind(config, { input: "./app/globals.css" });
