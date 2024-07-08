import edn from "jsedn";
import { readFile, access, constants } from "fs/promises";
import { homedir } from "os";

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

const local = process.cwd() + "/.cts/config.edn";
const global = homedir() + "/.cts/config.edn";

async function setit(p) {
  let f = (await readFile(p)).toString("utf8");
  let conf = edn.toJS(edn.parse(f));

  function strip(key) {
    return key.replace(":", "");
  }

  function set(c, prefix) {
    for (const key in c) {
      let k = strip(key);
      let is_obj = (c[key] instanceof Object) && !(c[key] instanceof Array);
      if (is_obj) {
        set(c[key], `${k}_`);
      } else {
        let is_arr = c[key] instanceof Array;
        let is_bool = typeof c[key] == "boolean";
        if (is_arr) {
          c[key] = c[key].join(",");
        } else if (is_bool) {
          c[key] = c[key] ? 1 : 0;
        }

        let n = `${prefix}${k}`.toUpperCase();
        process.env[n] = c[key];
      }
    }
  }

  set(conf, "");
}

if (await exists(global)) await setit(global);
if (await exists(local)) await setit(local);
