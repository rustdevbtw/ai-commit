<!--toc:start-->
- [Forked](#forked)
- [**Comittus: The Commit Message Generator**](#comittus-the-commit-message-generator)
  - [How it Works](#how-it-works)
  - [Using local model (ollama)](#using-local-model-ollama)
  - [Using third-party OpenAI-compatible APIs (e.g Groq)](#using-third-party-openai-compatible-apis-eg-groq)
  - [Options](#options)
  - [Configuration](#configuration)
  - [Git Hooks](#git-hooks)
  - [Contributing](#contributing)
  - [Roadmap](#roadmap)
  - [License](#license)
  - [Happy coding 🚀](#happy-coding-🚀)
<!--toc:end-->

# Forked
This is a fork of [insulineru/ai-commit](https://github.com/insulineru/ai-commit) with support for using other OpenAI-compatible APIs.  
For that, it also comes with [insulineru/ai-commit#26](https://github.com/insulineru/ai-commit/pull/26) merged, which refractors the codebase to split the OpenAI and Ollama providers.


# **Comittus: The Commit Message Generator**

💻 Tired of writing boring commit messages? Let Comittus help!

This package uses the power of OpenAI's GPT-3 model to understand your code changes and generate meaningful commit messages for you. Whether you're working on a solo project or collaborating with a team, Comittus makes it easy to keep your commit history organized and informative.

## How it Works
1. Install Comittus using `npm install -g cts.ai`
2. Generate an OpenAI API key [here](https://platform.openai.com/account/api-keys )
3. Set your `OPENAI_API_KEY` environment variable to your API key
4. Make your code changes and stage them with `git add .`
5. Type `cts` in your terminal
6. Comittus will analyze your changes and generate a commit message
7. Approve the commit message and Comittus will create the commit for you ✅

## Using local model (ollama)

You can also use the local model for free with Ollama.

1. Install Comittus using `npm install -g cts.ai`
2. Install Ollama from https://ollama.ai/
3. Run `ollama run mistral` to fetch model for the first time
4. Set `PROVIDER` in your environment to `ollama`
5. Make your code changes and stage them with `git add .`
6. Type `cts` in your terminal
7. Comittus will analyze your changes and generate a commit message
8. Approve the commit message and Comittus will create the commit for you ✅

## Using third-party OpenAI-compatible APIs (e.g Groq)

You can also use any OpenAI-compatible third-party API as well.

1. Install Comittus using `npm install -g cts.ai`
2. Set `OPENAI_API_URL` to the base URL of your API
3. Set `OPENAI_MODEL` to the model name you want to use
4. Set `OPENAI_API_KEY` to your API Key for that API
5. Make your code changes and stage them with `git add .`
6. Type `cts` in your terminal
7. Comittus will analyze your changes and generate a commit message
8. Approve the commit message and Comittus will create a commit for you ✅

## Options
`--list`: Select from a list of 5 generated messages (or regenerate the list)

`--force`: Automatically create a commit without being prompted to select a message (can't be used with `--list`)

`--filter-fee`: Displays the approximate fee for using the API and prompts you to confirm the request

`--apiKey`: Your OpenAI API key. It is not recommended to pass `apiKey` here, it is better to use `env` variable

`--emoji`: Add a gitmoji to the commit message

`--template`: Specify a custom commit message template. e.g. `--template "Modified {GIT_BRANCH} | {COMMIT_MESSAGE}"`

`--language`: Specify the language to use for the commit message(default: `english`). e.g. `--language english`

`--pass`: Specify arguments to add to `git commit`. They are added as-is.

`--sign`: Enable commit signing (for hooks only).

## Configuration

You can also use a config file to set up cts!  
To do this, create a new file at `.cts/config.edn`.  
For reference, see the [`.cts/config.edn`](./.cts/config.edn).  
This file uses the [Extensible Data Notation (EDN)](https://github.com/edn-format/edn) format.

### Config File Types

There are two types of config files: `global` and `local`.

- **Global Config File:** Located at `~/.cts/config.edn`
- **Local Config File:** Located at `$(cwd)/.cts/config.edn`

### Loading Approach

The data from these config files is merged, with the local config file taking precedence over the global one. The config files are loaded in the following order:

1. **Global Config File:**
   - `$HOME/.cts/config.edn`
   - `$XDG_CONFIG_HOME/cts/config.edn` (if `$XDG_CONFIG_HOME` is set)
   - `$HOME/.config/cts/config.edn`

2. **Local Config File:**
   - `$(cwd)/.cts/config.edn`

## Git Hooks
To use cts as a Git hook, create a new dir `.git_hooks` (or whatever you prefer).  
In it, create a `.git_hooks/prepare-commit-msg` file:
```sh
#!/bin/sh

# Automatically export all variables to child processes
set -a

export GIT_COMMITTER_NAME=$(git config user.name)
export GIT_COMMITTER_EMAIL=$(git config user.email)

# Read from the terminal
exec </dev/tty

# Path to the commit message file
commit_msg_file="$1"

# Read the commit message file content
commit_msg=$(cat "$commit_msg_file")

# Filter out comment lines and empty lines
non_comment_lines=$(echo "$commit_msg" | sed '/^\s*#/d' | sed '/^\s*$/d')

# Check if the commit message is empty or contains only comments
if [ -z "$non_comment_lines" ]; then
  cts --as-hook
  # If the commit message is empty, replace it with .cts/msg
  cat .cts/msg >"$commit_msg_file"
  exit 0
elif [ "$(echo "$non_comment_lines" | wc -l)" -eq 1 ] && echo "$non_comment_lines" | grep -q '^Signed-off-by:'; then
  cts --as-hook
  # If the only non-comment line is "Signed-off-by:", prepend .cts/msg to .git/COMMIT_EDITMSG
  {
    cat .cts/msg
    echo "$commit_msg"
  } >"$commit_msg_file"
  exit 0
else
  # Exit successfully if the commit message is provided and valid
  exit 0
fi
```
Then, configure Git to use it via `git config core.hooksPath ".git_hooks"`.  
Then, you can do `git add .` and `git commit` (yes, without any `-m`).  
Be warned, though, once it generates the commit message, git will open that in your configured editor.  
and that's `vim` by default. So, remember, to `:wq`!

## Contributing
We'd love for you to contribute to Comittus! Here's how:

1. Fork the repository
2. Clone your fork to your local machine
3. Create a new branch
4. Make your changes
5. Commit your changes and push to your fork
6. Create a pull request to the Comittus repository

## Roadmap

- [x] Support for multimple suggestions: Provide multiple suggestions for the commit message.
- [x] Support for custom commit types: Allow users to specify a custom commit type manually.
- [ ] Automated scope detection: Detect the scope of changes and automatically include it in the commit message.
- [ ] Improved emoji suggestions: Enhance the emoji suggestions generated by Comittus to better match the changes made to the code.
- [ ] Commit message templating: Provide a customizable commit message template for users to follow.
- [ ] Interactive commit message generation: Allow users to interact with Comittus during the commit message generation process to provide more context and refine the generated message.
- [x] Integration with Git hooks: Integrate Comittus with Git hooks so that it can automatically generate commit messages whenever changes are staged.
- [ ] Advanced diff analysis: Enhance Comittus's diff analysis capabilities to better understand the changes made to the code.
- [ ] Reverse commit message generation: Allow users to generate code changes from a commit message.

## License
Comittus is licensed under the MIT License.

## Happy coding 🚀
