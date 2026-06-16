const { getDefaultConfig } = require("expo/metro-config");
const exclusionList = require("metro-config/src/defaults/exclusionList");
const path = require("path");

const root = __dirname;
const config = getDefaultConfig(root);

config.resolver.blockList = exclusionList([
  new RegExp(`${path.resolve(root, "backend/.venv").replace(/[/\\]/g, "[/\\\\]")}.*`),
  new RegExp(`${path.resolve(root, "backend/storage").replace(/[/\\]/g, "[/\\\\]")}.*`),
  new RegExp(`${path.resolve(root, "UI").replace(/[/\\]/g, "[/\\\\]")}.*`),
  new RegExp(`${path.resolve(root, ".git").replace(/[/\\]/g, "[/\\\\]")}.*`)
]);

module.exports = config;

