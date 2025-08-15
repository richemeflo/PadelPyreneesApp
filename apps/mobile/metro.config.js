// apps/mobile/metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;

const config = getDefaultConfig(projectRoot);

// IMPORTANT : empêcher Metro de remonter au-dessus du workspace mobile
config.resolver.disableHierarchicalLookup = true;

module.exports = config;
