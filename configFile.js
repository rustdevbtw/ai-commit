import edn from "jsedn";
import { readFile, access, constants } from "node:fs/promises";
import { homedir } from "node:os";
import process from "node:process";

async function exists(path) {
  try {
    await access(path, constants.F_OK);
    return true; // File or directory exists
  } catch (err) {
    if (err.code === 'ENOENT') {
      return false; // File or directory does not exist
    } else {
      throw err; // Other error (permission denied, etc.)
    }
  }
}

const paths = [
  `${homedir()}/.cts/config.edn`,
  `${process.env.XDG_CONFIG_HOME || `${homedir()}/.config`}/cts/config.edn`,
  `${homedir()}/.config/cts/config.edn`,
  `${process.cwd()}/.cts/config.edn`
];

async function loadConfigAndSetEnv(path) {
  const fileContent = await readFile(path, 'utf8');
  const config = edn.toJS(edn.parse(fileContent));

  function formatKey(key) {
    return key.replace(":", "").toUpperCase();
  }

  function setEnvVars(configObject, prefix = "") {
    for (const key in configObject) {
      const formattedKey = formatKey(prefix + key);
      const value = configObject[key];

      if (typeof value === 'object' && !Array.isArray(value)) {
        setEnvVars(value, `${formattedKey}_`);
      } else {
        const formattedValue = Array.isArray(value) ? value.join(",") : (typeof value === 'boolean' ? (value ? 1 : 0) : value);
        process.env[formattedKey] = formattedValue;
      }
    }
  }

  setEnvVars(config);
}

for (const path of paths) {
  if (await exists(path)) {
    await loadConfigAndSetEnv(path);
  }
}
