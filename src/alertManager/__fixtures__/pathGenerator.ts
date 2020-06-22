import crypto from "crypto";

export const pathGenerator = () => {
  const dbPathPrefix = `tmp/tests-${crypto.randomBytes(16).toString("hex")}`;
  const alertManagerDbPath = () =>
    `${dbPathPrefix}/alertmanager-${crypto.randomBytes(16).toString("hex")}`;
  const alertsDbPath = () =>
    `${dbPathPrefix}/alerts-${crypto.randomBytes(16).toString("hex")}`;

  return {
    dbPathPrefix,
    alertManagerDbPath,
    alertsDbPath
  };
};

export default pathGenerator;
