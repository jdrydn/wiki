# Git Way of Working

A simple, opinionated workflow for teams shipping continuously. One long-lived branch, short-lived feature branches,
squash merges, and every commit to main goes to production.

::: tip

This assumes GitHub, but the same workflow applies to GitLab, BitBucket, CodeCommit, or any other Git provider.

:::

## The flow

```
main ─────●───────────●─────────────── (deployed continuously)
           \         /
            ○───○───○  feat/add-widget (squash merged)
```

1. Branch off `main`/`master`/default branch.
2. Work in the branch — small commits, pushed often.
3. Open a PR targeting `main`/`master`/default.
4. Squash merge when approved.
5. `main` deploys automatically.

That's it. No `develop` branch, no release branches, no hotfix branches. One branch to rule them all.

## Branch naming

Prefix branches with the conventional commit type. For work projects, try to include the ticket number but don't just
use the ticket number:

::: info Good examples

```yml
Branch name:   feat/PROJ-123-add-widget
PR title:      [PROJ-123] Add widget
Commit title:  [PROJ-123] Add widget (#42)

Branch name:   fix/PROJ-456-null-pointer
PR title:      [PROJ-456] Fix null pointer
Commit title:  [PROJ-456] Fix null pointer (#43)

Branch name:   chore/PROJ-789-bump-deps
PR title:      [PROJ-789] Bump dependencies
Commit title:  [PROJ-789] Bump dependencies (#44)
```

:::

::: danger Bad examples

```yml
PROJ-123           # no type prefix, no description — what is this branch for?
add-widget         # no type prefix, no ticket number
feat/add-widget    # missing ticket number (for a work project)
feat/PROJ-123      # just a ticket number — meaningless without opening Jira
james/PROJ-123     # your name isn't a commit type
bugfix/PROJ-456    # "bugfix" isn't a conventional commit type — use "fix"
```

:::

The branch name traces back to the ticket. The PR title is scannable in GitHub. The squash commit message is just the PR
title — GitHub appends the PR number automatically.

For personal projects, skip the ticket number — just the type prefix is enough (`feat/add-widget`, `fix/null-pointer`).

## Commits in a branch

Commit small, commit often. The history inside your branch is _your scratchpad_ — it doesn't need to be pretty because
it's getting squashed anyway. [Conventional commit](./conventional-commits) format is still useful here (it keeps you
honest about scope), but `wip:` commits are fine too.

The point of small commits isn't a clean graph. It's:

- Easier to `git bisect` locally if you break something
- Easier to discard a bad idea without losing the good bits
- Forces you to think in increments rather than "I'll commit when it's done"

## Pull requests

PRs always target `main`. No branch-to-branch merges, no long-lived integration branches.

**Get at least one approval before merging**. Your repo should have branch protection rules enforcing this, but even if
it doesn't — if you're on a team, get a review. It's not just a quality gate. It's how the rest of the team learns what
you just shipped. A PR merged without review is knowledge that only exists in one person's head.

When should you break a PR into multiple PRs? It depends — but the heuristic is: **if it's hard for a reviewer to hold
in their head, it's too big.** A refactor that enables a feature? That's two PRs. A migration and the code that uses the
new schema? Two PRs. Unrelated drive-by fixes? Separate PR.

## Squash merging

Every PR becomes a single commit on `main`. This gives you:

- A clean, readable history on the main branch — one commit per logical change
- Commit messages that actually describe _what shipped_, not "fix typo" / "address review comments" / "wip"
- Easy reverts — `git revert <sha>` undoes a complete feature, not a fragment

Don't rebase. Don't rewrite history. Just squash-merge and move on.

## Deployment

Every commit to `main` triggers the pipeline. The pipeline should build, test, and deploy. If main is broken, the fix is
another PR — not a rollback of the deploy pipeline.

This only works if you trust your pipeline. Invest in it: fast tests, reliable deploys, easy rollbacks at the
infrastructure level (blue-green, feature flags, whatever fits your stack).

## Further reading

- [Git - Book](https://git-scm.com/book) — the official Pro Git book, free and comprehensive
- [A successful Git branching model](https://nvie.com/posts/a-successful-git-branching-model/) — the original "Git Flow"
  post; influential but heavier than what most teams need
- [GitHub Flow](https://docs.github.com/en/get-started/using-github/github-flow) — GitHub's own guide to a branch-based
  workflow
