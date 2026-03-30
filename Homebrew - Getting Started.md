---
title: Homebrew - Getting Started
description: Installing and using Homebrew on macOS — essential commands, Cask for GUI apps, and Brewfile for reproducible setups.
---

# Homebrew - Getting Started

## What is Homebrew?

Homebrew is the most popular package manager for macOS (and Linux). It lets you install command-line tools, languages, databases, and other software with a single terminal command — no manual downloads or installers required.

## Prerequisites

- A Mac running macOS Sonoma (14) or later (Intel or Apple Silicon)
- Terminal access (built-in Terminal app or iTerm2)
- An internet connection
- Xcode Command Line Tools (the installer will prompt you if they're missing)

## Installing Homebrew

Visit [Homebrew](https://brew.sh)'s website & run their installer:

- This should be `install.sh` from their GitHub repository (`github.com/homebrew/install`)
- For more information please see: [Installation](https://docs.brew.sh/Installation) 
- The script will explain what it plans to do and pause before making changes. Follow the on-screen prompts.
- **If your user login is not the Admin, then you will need Admin access to your Mac for this step** - after this, you can run as your local user.

### Apple Silicon (M-series) users

After installation, Homebrew lives in `/opt/homebrew` instead of `/usr/local`. The installer will print two commands to add Homebrew to your shell `PATH` — make sure you run them:

```bash
echo >> ~/.zprofile
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```

Verify the installation:

```bash
brew --version
```

You should see output like `Homebrew 5.x.x`.

## Essential commands

| Command | What it does |
|---|---|
| `brew install <package>` | Install a package (called a "formula") |
| `brew uninstall <package>` | Remove a package |
| `brew list` | Show all installed packages |
| `brew search <term>` | Search for available packages |
| `brew update` | Fetch the latest package definitions |
| `brew upgrade` | Upgrade all installed packages to their latest versions |
| `brew doctor` | Diagnose common issues with your Homebrew setup |
| `brew info <package>` | Show details and dependencies for a package |

## Installing a standard toolchain

Useful packages to initially install could be:

```bash
# Version control
brew install git

# Runtime environments
brew install node
brew install python@3.12

# Databases
brew install postgresql@16

# Utilities
brew install jq
brew install awscli
brew install gh
```

## Homebrew Cask — GUI applications

Homebrew can also install desktop applications (browsers, editors, etc.) via **Cask**:

```bash
brew install --cask visual-studio-code
brew install --cask slack
brew install --cask 1password
```

Search for casks the same way you search for formulas:

```bash
brew search --cask <term>
```

If you're not able to install applications into `/Applications` (e.g. you don't have Administrator permissions on a regular basis) then set the following env var in your profile to direct Homebrew to install casks to `~/Applications` instead:

```bash
$ echo 'export HOMEBREW_CASK_OPTS="--appdir=~/Applications"' >> ~/.zprofile
$ source ~/.zprofile
```

## Using a Brewfile (recommended)

A `Brewfile` lets you declare all your packages in a single file and install them in one shot — great for reproducible setups.

Create a file called `Brewfile`:

```ruby
# Brewfile
tap "homebrew/bundle"

# CLI tools
brew "git"
brew "node"
brew "python@3.12"
brew "jq"
brew "awscli"
brew "gh"
brew "docker" # the CLI, not the Desktop app
brew "colima" # much better than Docker Desktop

# Desktop apps
cask "visual-studio-code"
cask "slack"
```

Then run:

```bash
brew bundle --file=./Brewfile
```

## Keeping things up to date

Run these periodically (or set a weekly reminder):

```bash
brew update && brew upgrade
```

To clean up old versions and free disk space:

```bash
brew cleanup
```

## Troubleshooting

| Problem | Fix |
|---|---|
| `command not found: brew` | Re-run the shell PATH commands from the install step, then open a new terminal window. |
| Permission errors | Never use `sudo` with Homebrew. Run `brew doctor` and follow its suggestions. |
| Package won't install | Run `brew update` first, then retry. Check `brew doctor` for warnings. |
| Conflicting versions | Use `brew link --overwrite <package>` carefully, or uninstall the conflicting version first. |

## Useful links

- [Homebrew documentation](https://docs.brew.sh)
- [Homebrew Formulae search](https://formulae.brew.sh)
