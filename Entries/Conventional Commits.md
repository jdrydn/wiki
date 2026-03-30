# Conventional Commits

[Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)

## Quick examples

```
feat: new feature
```

```
fix(scope): bug in scope
```

```
feat!: breaking change
feat(scope)!: breaking change in scope
```

```
chore(deps): updated dependencies
```

## Commit Types

| Type       | Description                                                                                                         |
| ---------- | ------------------------------------------------------------------------------------------------------------------- |
| `build`    | Changes that affect the build system or external dependencies (example scopes: Docker, npm, CDK)                    |
| `ci`       | Changes to CI configuration files and scripts (example scopes: Github, CodePipeline)                                |
| `chore`    | **Changes which doesn't change source code or tests e.g. changes to the build process, auxiliary tools, libraries** |
| `docs`     | Documentation only changes                                                                                          |
| `feat`     | **A new feature**                                                                                                   |
| `fix`      | **A bug fix**                                                                                                       |
| `perf`     | A code change that improves performance                                                                             |
| `refactor` | A code change that neither fixes a bug nor adds a feature                                                           |
| `revert`   | Revert something                                                                                                    |
| `style`    | Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)              |
| `test`     | Adding missing tests or correcting existing tests                                                                   |
| `wip`      | Work-in-progress (typically for `feat/` or `fix/` branches)                                                         |
