/*
 * Copyright (c) 2024, Rajdeep Malakar
 * All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import process from "node:process"
import { exec } from "node:child_process";
import { promisify } from "node:util";

const execPromise = promisify(exec);

const getArgs = () => {
  const args = process.argv.slice(2);
  const result = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const key = arg.replace(/^--/, '');
    const nextArg = args[i + 1];
    if (/^--/.test(nextArg) || nextArg === undefined) {
      result[key] = true;
    } else {
      result[key] = nextArg;
      i++;
    }
  }

  return result;
};

const checkGitRepository = async () => {
  try {
    const { stdout, stderr } = await execPromise('git rev-parse --is-inside-work-tree');
    if (!stderr) return stdout.trim() === 'true';
    throw new Error(`Git error:\n${stderr}`);
  } catch (err) {
    console.log(err);
    return false;
  }
};

export { getArgs, checkGitRepository }
