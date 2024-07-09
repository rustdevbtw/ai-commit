#!/usr/bin/env node

/*
 * Copyright (c) 2024, Rajdeep Malakar
 * All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

'use strict'
import process from "node:process"
import { exec, execSync } from "node:child_process";
import { promisify } from "node:util";
import inquirer from "inquirer";
import { checkGitRepository } from "./helpers.js";
import { addGitmojiToCommitMessage } from './gitmoji.js';
import { AI_PROVIDER, MODEL, args } from "./config.js"
import openai from "./openai.js"
import ollama from "./ollama.js"
import "./configFile.js"
import { writeFile } from "node:fs/promises";

const execPromise = promisify(exec);

const REGENERATE_MSG = "♻️ Regenerate Commit Messages";

console.log('AI Provider: ', AI_PROVIDER);

const apiKey = args.apiKey || process.env.OPENAI_API_KEY;

const language = args.language || process.env.CTS_LANGUAGE || process.env.AI_COMMIT_LANGUAGE || 'english';

const pass = args.pass || process.env.GIT_PASS || false;

if (AI_PROVIDER == 'openai' && !apiKey) {
  console.error("Please set the OPENAI_API_KEY environment variable.");
  process.exit(1);
}

let template = args.template || process.env.CTS_TEMPLATE || process.env.AI_COMMIT_COMMIT_TEMPLATE
const doAddEmoji = args.emoji || process.env.CTS_GITMOJI || process.env.AI_COMMIT_ADD_EMOJI

let types = process.env.CTS_TYPES;

const provider = AI_PROVIDER === 'ollama' ? ollama : openai

const processTemplate = ({ template, commitMessage }) => {
  if (!template.includes('COMMIT_MESSAGE')) {
    console.log(`Warning: template doesn't include {COMMIT_MESSAGE}`)

    return commitMessage;
  }

  let finalCommitMessage = template.replaceAll("{COMMIT_MESSAGE}", commitMessage);

  if (finalCommitMessage.includes('GIT_BRANCH')) {
    const currentBranch = execSync("git branch --show-current").toString().replaceAll("\n", "");

    console.log('Using currentBranch: ', currentBranch);

    finalCommitMessage = finalCommitMessage.replaceAll("{GIT_BRANCH}", currentBranch)
  }

  return finalCommitMessage;
}

const makeCommit = async (input) => {
  try {
    if (process.env.GIT_HOOKS && args["as-hook"]) {
      const sign = process.env.GIT_SIGN;
      const name = process.env["GIT_COMMITTER_NAME"];
      const email = process.env["GIT_COMMITTER_EMAIL"];
      if (sign) {
        console.log("Signing...");
        input += `\n\nSigned-off-by: ${name} <${email}>`;
      }
      console.log("Git hook detected. Storing to .cts/msg");
      await writeFile(".cts/msg", input);
      console.log("Stored!");
    } else {
      console.log("Committing Message... 🚀 ");
      await execPromise(`git commit ${pass || ""} -m "${input || ""}"`);
      console.log("Commit Successful! 🎉");
    }
  } catch (err) {
    throw new Error(`Error:\n${err}`);
  }
};


const processEmoji = (msg, doAddEmoji) => {
  if (doAddEmoji) {
    return addGitmojiToCommitMessage(msg);
  }

  return msg;
}

const getPromptForSingleCommit = (diff) => {
  return provider.getPromptForSingleCommit(diff, { types, language })
};

const generateSingleCommit = async (diff) => {
  const prompt = getPromptForSingleCommit(diff)
  console.log(prompt)
  if (!await provider.filterApi({ prompt, filterFee: args['filter-fee'] || process.env.CTS_FEE })) process.exit(1);

  const text = await provider.sendMessage(prompt, { apiKey, model: MODEL });

  let finalCommitMessage = processEmoji(text, doAddEmoji);

  if (template) {
    finalCommitMessage = await processTemplate({
      template,
      commitMessage: finalCommitMessage,
    })

    console.log(
      `Proposed Commit With Template:\n------------------------------\n${finalCommitMessage}\n------------------------------`
    );
  } else {

    console.log(
      `Proposed Commit:\n------------------------------\n${finalCommitMessage}\n------------------------------`
    );

  }

  if (args.force || process.env.CTS_FORCE) {
    await makeCommit(finalCommitMessage);
    return;
  }

  const answer = await inquirer.prompt([
    {
      type: "confirm",
      name: "continue",
      message: "Do you want to continue?",
      default: true,
    },
  ]);

  if (!answer.continue) {
    console.log("Commit aborted by user 🙅‍♂️");
    process.exit(1);
  }

  await makeCommit(finalCommitMessage);
};

const generateListCommits = async (diff, numOptions = 5) => {
  const prompt = provider.getPromptForMultipleCommits(diff, { types, numOptions, language })
  if (!await provider.filterApi({ prompt, filterFee: args['filter-fee'] || process.env.CTS_FEE, numCompletion: numOptions })) process.exit(1);

  const text = await provider.sendMessage(prompt, { apiKey, model: MODEL });

  let msgs = text.split(";").map((msg) => msg.trim()).map(msg => processEmoji(msg, doAddEmoji));

  if (template) {
    msgs = msgs.map(msg => processTemplate({
      template,
      commitMessage: msg,
    }))
  }

  // add regenerate option
  msgs.push(REGENERATE_MSG);

  const answer = await inquirer.prompt([
    {
      type: "list",
      name: "commit",
      message: "Select a commit message",
      choices: msgs,
    },
  ]);

  if (answer.commit === REGENERATE_MSG) {
    await generateListCommits(diff);
    return;
  }

  makeCommit(answer.commit);
};

async function generateAICommit() {
  const isGitRepository = await checkGitRepository();

  if (!isGitRepository) {
    console.error("This is not a git repository 🙅‍♂️");
    process.exit(1);
  }

  const diff = (await execPromise("git diff --staged")).stdout.toString();

  // Handle empty diff
  if (!diff) {
    console.log("No changes to commit 🙅");
    console.log(
      "May be you forgot to add the files? Try git add . and then run this script again."
    );
    process.exit(1);
  }


  (process.env.CTS_LIST || args.list)
    ? await generateListCommits(diff)
    : await generateSingleCommit(diff);
}

await generateAICommit();
