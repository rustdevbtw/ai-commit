import process from "node:process";
import "./configFile.js";

function addGitmojiToCommitMessage(commitMessage) {
  let typeToGitmoji = {};
  for (const env in process.env) {
    if (env.includes("GITMOJI_")) {
      let k = env.replace("GITMOJI_", "").toLowerCase();
      typeToGitmoji[k] = process.env[env];
    }
  }

  // Extract the first alphabetic character of the commit message
  const match = commitMessage.match(/[a-zA-Z]+/);
  if (!match) return commitMessage;
  const type = match[0];

  // If the type is valid, add the corresponding gitmoji to the message
  if (typeToGitmoji[type]) {
    return `${typeToGitmoji[type]} ${commitMessage}`;
  } else {
    // If the type is not recognized, return the original message
    return commitMessage;
  }
}

export { addGitmojiToCommitMessage }
