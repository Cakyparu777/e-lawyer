#!/usr/bin/env node

const { RtcRole, RtcTokenBuilder } = require("agora-token");

const [appId, appCertificate, channelName, account, expiresInRaw] = process.argv.slice(2);
const expiresIn = Number(expiresInRaw || 3600);

if (!appId || !appCertificate || !channelName || !account || !Number.isFinite(expiresIn)) {
  console.error("Usage: agora_rtm_token.cjs <appId> <appCertificate> <channelName> <account> <expiresIn>");
  process.exit(2);
}

const token = RtcTokenBuilder.buildTokenWithRtm(
  appId,
  appCertificate,
  channelName,
  account,
  RtcRole.PUBLISHER,
  expiresIn,
  0
);

process.stdout.write(JSON.stringify({ token }));
