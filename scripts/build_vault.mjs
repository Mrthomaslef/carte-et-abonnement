// Construit le coffre chiffré des Pass Zoo/MNHN à partir de private/ (non versionné).
// Usage : node scripts/build_vault.mjs
// Même mot de passe et même sel que Voyages-Voyages (t3-vault « voyages-coffre ») : un appareil déjà déverrouillé l’est aussi ici.
// Chiffrement : PBKDF2-SHA256 (600 000 itérations) -> AES-GCM 256 bits.
import { webcrypto as crypto } from "node:crypto";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const PRIV = path.join(ROOT, "private");
const OUT = path.join(ROOT, "assets", "vault");
const ITER = 600000;

const pass = process.env.VAULT_PASS ||
  execFileSync("/Users/thomaslefevre/.t3/bin/t3-vault", ["get", "voyages-coffre", "--field", "password"], { encoding: "utf8" }).trim();
if (!pass) throw new Error("Mot de passe du coffre introuvable");

const src = JSON.parse(fs.readFileSync(path.join(PRIV, "vault_source.json"), "utf8"));
const b64 = (buf) => Buffer.from(buf).toString("base64");

// Le sel est conservé d'une construction à l'autre pour que les appareils déjà déverrouillés le restent.
const saltFile = path.join(PRIV, "vault_salt.txt");
let salt;
if (fs.existsSync(saltFile)) salt = Buffer.from(fs.readFileSync(saltFile, "utf8").trim(), "base64");
else { salt = Buffer.from(crypto.getRandomValues(new Uint8Array(16))); fs.writeFileSync(saltFile, b64(salt)); }

const baseKey = await crypto.subtle.importKey("raw", new TextEncoder().encode(pass), "PBKDF2", false, ["deriveKey"]);
const key = await crypto.subtle.deriveKey(
  { name: "PBKDF2", salt, iterations: ITER, hash: "SHA-256" },
  baseKey, { name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]
);
const rawKey = Buffer.from(await crypto.subtle.exportKey("raw", key));
// Vérification : clé brute utilisable dans un lien de déverrouillage (#cle=...), jamais versionnée.
fs.writeFileSync(path.join(PRIV, "vault_key_b64url.txt"), rawKey.toString("base64url"));

async function enc(bytes) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, bytes);
  return { iv, ct: new Uint8Array(ct) };
}

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(path.join(OUT, "docs"), { recursive: true });

const docsIndex = {};
for (const [id, d] of Object.entries(src.docs)) {
  const { iv, ct } = await enc(fs.readFileSync(path.join(PRIV, "docs", d.file)));
  fs.writeFileSync(path.join(OUT, "docs", id + ".enc"), Buffer.concat([Buffer.from(iv), Buffer.from(ct)]));
  docsIndex[id] = d.mime;
}

const payload = new TextEncoder().encode(JSON.stringify({ secrets: src.secrets }));
const { iv, ct } = await enc(payload);
const data = { v: 1, kdf: "PBKDF2-SHA256", iter: ITER, salt: b64(salt), iv: b64(iv), ct: b64(ct), docs: docsIndex };
fs.writeFileSync(path.join(OUT, "data.js"),
  "/* Coffre chiffré Pass Zoo/MNHN (AES-GCM). Généré par scripts/build_vault.mjs — ne pas éditer. */\n" +
  "window.PASS_VAULT = " + JSON.stringify(data) + ";\n");

console.log(`Coffre OK : ${Object.keys(src.secrets).length} secrets, ${Object.keys(docsIndex).length} documents chiffrés.`);
