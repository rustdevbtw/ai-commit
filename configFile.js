import * as edn from "jsedn";
import { readFile } from "fs/promises";

let path = process.cwd() + "/.cts/config.edn";
let f = (await readFile(path)).toString("utf8");
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
