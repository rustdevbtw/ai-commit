/*
 * Copyright (c) 2024, Rajdeep Malakar
 * All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Config } from "@internal/edn";
import { homedir } from "node:os";
import process from "node:process";

const paths = [
  `${homedir()}/.cts/config.edn`,
  `${process.env.XDG_CONFIG_HOME || `${homedir()}/.config`}/cts/config.edn`,
  `${homedir()}/.config/cts/config.edn`,
  `${process.cwd()}/.cts/config.edn`
];

async function loadConfigs(paths) {
  for (const path of paths) {
    try {
      const conf = new Config(path);
      await conf.load();
      conf.injectEnv();
    } catch (err) {
      continue;
    }
  }
}

// Load configurations from predefined paths
await loadConfigs(paths);
