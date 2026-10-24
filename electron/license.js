const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");

const PRODUCT_ID = "foreign-trade-assistant";
const LICENSE_FILE = "offline-license.json";

function publicKeyPath() {
  return path.join(__dirname, "../assets/license-public-key.pem");
}

function readWindowsMachineGuid() {
  if (process.platform !== "win32") return "";
  try {
    const output = execFileSync("reg.exe", [
      "query",
      "HKLM\\SOFTWARE\\Microsoft\\Cryptography",
      "/v",
      "MachineGuid"
    ], { encoding: "utf8", windowsHide: true });
    return String(output).match(/MachineGuid\s+REG_SZ\s+([^\r\n]+)/i)?.[1]?.trim() || "";
  } catch (_) {
    return "";
  }
}

function getMachineId() {
  const stableSource = readWindowsMachineGuid() || `${os.hostname()}|${os.arch()}|${os.platform()}`;
  const digest = crypto.createHash("sha256").update(`JWW-FTA-V1|${stableSource}`).digest("hex").toUpperCase();
  return `FTA-${digest.slice(0, 4)}-${digest.slice(4, 8)}-${digest.slice(8, 12)}-${digest.slice(12, 16)}`;
}

function normalizeActivationCode(code) {
  return String(code || "").replace(/\s+/g, "").trim();
}

function parseAndVerifyActivationCode(code, appVersion) {
  const normalized = normalizeActivationCode(code);
  const [payloadText, signatureText, extra] = normalized.split(".");
  if (!payloadText || !signatureText || extra) throw new Error("授权码格式不正确");

  const publicKey = fs.readFileSync(publicKeyPath(), "utf8");
  const verified = crypto.verify(
    null,
    Buffer.from(payloadText, "utf8"),
    publicKey,
    Buffer.from(signatureText, "base64url")
  );
  if (!verified) throw new Error("授权码签名无效");

  let payload;
  try {
    payload = JSON.parse(Buffer.from(payloadText, "base64url").toString("utf8"));
  } catch (_) {
    throw new Error("授权码内容损坏");
  }
  if (payload.v !== 1 || payload.product !== PRODUCT_ID) throw new Error("授权码不适用于此外贸助手");
  if (String(payload.machineId || "").toUpperCase() !== getMachineId()) throw new Error("授权码与当前电脑不匹配");
  if (payload.expiresAt && Date.now() > new Date(`${payload.expiresAt}T23:59:59`).getTime()) throw new Error("授权已到期");
  if (payload.maxVersion && compareVersions(appVersion, payload.maxVersion) > 0) throw new Error(`当前授权最高支持版本 ${payload.maxVersion}`);
  return payload;
}

function compareVersions(left, right) {
  const a = String(left || "0").split(".").map(value => Number(value) || 0);
  const b = String(right || "0").split(".").map(value => Number(value) || 0);
  for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
    if ((a[i] || 0) !== (b[i] || 0)) return (a[i] || 0) > (b[i] || 0) ? 1 : -1;
  }
  return 0;
}

function licensePath(userDataDir) {
  return path.join(userDataDir, LICENSE_FILE);
}

function getLicenseStatus(userDataDir, appVersion) {
  const machineId = getMachineId();
  try {
    const stored = JSON.parse(fs.readFileSync(licensePath(userDataDir), "utf8"));
    const license = parseAndVerifyActivationCode(stored.activationCode, appVersion);
    return { licensed: true, machineId, license };
  } catch (error) {
    return { licensed: false, machineId, message: error.code === "ENOENT" ? "尚未激活" : error.message };
  }
}

function activateLicense(userDataDir, appVersion, activationCode) {
  const license = parseAndVerifyActivationCode(activationCode, appVersion);
  fs.mkdirSync(userDataDir, { recursive: true });
  const target = licensePath(userDataDir);
  const temp = `${target}.tmp`;
  fs.writeFileSync(temp, JSON.stringify({ activationCode: normalizeActivationCode(activationCode), activatedAt: new Date().toISOString() }, null, 2), { encoding: "utf8", mode: 0o600 });
  fs.renameSync(temp, target);
  return { licensed: true, machineId: getMachineId(), license };
}

module.exports = { getMachineId, getLicenseStatus, activateLicense, parseAndVerifyActivationCode };
