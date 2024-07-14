/*
 * Copyright (c) 2024, Rajdeep Malakar
 * All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import process from "node:process"
import dotenv from 'dotenv';
import { getArgs } from './helpers.js';
import "./configFile.js"
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import blakejs from 'blakejs';

const { blake2bHex } = blakejs;

// Helper function to compute BLAKE2 hash
const computeB2 = (input) => {
  return blake2bHex(input);
};

// Resolve __dirname in ES6 modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the paths
const paths = [
  path.join(process.env.HOME, '.cts/env'),
  path.join(process.env.HOME, '.env/cts.env'),
  path.join(process.env.XDG_CONFIG_DIR || path.join(process.env.HOME, '.config'), '/cts/env'),
  path.join(process.env.XDG_CONFIG_DIR || path.join(process.env.HOME, '.config'), '/env/cts.env'),
  path.join(process.cwd(), '.cts/env'),
  path.join(process.cwd(), '.env/cts.env'),
  path.join(process.env.HOME, `.env/${computeB2(process.cwd())}.env`),
  path.join(process.cwd(), '.env')
];

// Load env files in order
for (const envPath of paths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    console.log(`Loaded ENV from ${envPath}`);
  }
}
export const args = getArgs();

/**
 * possible values: 'openai' or 'ollama'
 */
export const AI_PROVIDER = args.PROVIDER || process.env.PROVIDER || 'openai'


/** 
 * name of the model to use.
 * can use this to switch between different local models.
 */
export const MODEL = args.MODEL || process.env.MODEL || process.env.OLLAMA_MODEL;

/**
 * the OpenAI API URL to use
 * can use this to use different OpenAI-compatible APIs (like Groq)
 */
export const OPENAI_API_URL = args.OPENAI_API_URL || process.env.OPENAI_URL || process.env.OPENAI_API_URL || "https://api.openai.com/v1";

/**
 * The OpenAI Model to use
 * can use different models by just changing it
 */
export const OPENAI_MODEL = args.OPENAI_MODEL || process.env.OPENAI_MODEL || "gpt-4-1106-preview";
