/*
 * Copyright (c) 2024, Rajdeep Malakar
 * All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { encode } from 'gpt-3-encoder';
import inquirer from "inquirer";
import { AI_PROVIDER } from "./config.js"

const FEE_PER_1K_TOKENS = 0.02;
const MAX_TOKENS = 4000;
//this is the approximate cost of a completion (answer) fee from CHATGPT
const FEE_COMPLETION = 0.001;

async function filterApi({ prompt, numCompletion = 1, filterFee }) {
  if (AI_PROVIDER == 'ollama') {
    //ollama dont have any limits and is free so we dont need to filter anything
    return true
  }
  const numTokens = encode(prompt).length;
  const fee = numTokens / 1000 * FEE_PER_1K_TOKENS + (FEE_COMPLETION * numCompletion);

  if (numTokens > MAX_TOKENS) {
    console.log("The commit diff is too large for the ChatGPT API. Max 4k tokens or ~8k characters. ");
    return false;
  }

  if (filterFee) {
    console.log(`This will cost you ~$${+fee.toFixed(3)} for using the API.`);
    const answer = await inquirer.prompt([
      {
        type: "confirm",
        name: "continue",
        message: "Do you want to continue 💸?",
        default: true,
      },
    ]);
    if (!answer.continue) return false;
  }

  return true;
};

export { filterApi }
