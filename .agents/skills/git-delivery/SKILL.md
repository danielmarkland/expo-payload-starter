---
name: git-delivery
description: Use when asked to commit, push, or create a pull/merge request for this repository. Guides review, validation, authorization, and GitHub PR delivery; it does not authorize actions the user has not requested.
---

# Git Delivery

Use this skill when the user requests one or more Git delivery actions: commit,
push, or create a pull/merge request. The configured `origin` is GitHub, so use
GitHub pull requests even if the user calls them merge requests.

This is a procedural workflow, not a technical permission barrier. Never treat
skill activation, a prior approval, or a request for one delivery step as
authorization for another. A single current-turn request that explicitly names
multiple steps authorizes each named step.

## Workflow

1. Read the repo's `AGENTS.md`, `.instructions/shared.md`, and any applicable
   nested agent instructions. Inspect `git status --short --branch`, the current
   branch, configured remote, and relevant diffs before staging anything.
2. Identify the exact files intended for delivery. Include unrelated or
   pre-existing changes only when the user explicitly asks to include all open
   changes. Review staged content and run `git diff --check`; do not stage
   secrets, local environment files, caches, or unrelated files.
3. Run the repository's required checks before committing. Here that means
   `pnpm check` from the repo root. If it fails, report the failure and do not
   describe the work as verified. Resolve environment access restrictions only
   through the approved permission flow.
4. Create a local commit only when the user explicitly requests a commit. Stage
   only the intended changes and use a concise conventional commit message that
   describes them. A request to push or open a PR alone does not authorize a
   commit.
5. Push only when the user explicitly requests a push, either separately or as
   part of a current-turn request that names the full workflow. Before pushing,
   verify the target remote and branch. Never force-push, rewrite shared
   history, or push unrelated commits. If the push is rejected, stop and report
   the reason rather than rebasing or force-pushing without direction.
6. Create a pull request only when the user explicitly requests one. A PR is a
   separate external action; do not infer it from a commit or push request.
   Creating one requires a pushed topic branch. If the user requested a PR but
   did not authorize the required push, stop before pushing and ask for that
   authorization. Do not merge the PR unless explicitly asked.

## Pull request details

- Use the repository's GitHub remote and `gh` CLI. Confirm that the CLI is
  available and authenticated before attempting PR creation; if not, report
  what is missing and stop.
- Target `develop` for feature pull requests and squash-merge them when merging
  is authorized. Release through a pull request from `develop` into `main`,
  using a merge commit when merging is authorized. Deploy and verify releases
  from `main` after that release pull request is merged.
- Never commit or push changes directly to `main`. Start feature branches
  from `develop` using the type-based naming convention in `.instructions/shared.md`. If the current branch is the base branch, do not open a PR from it;
  create/use a descriptive topic branch for the requested work before pushing.
- Keep the PR title concise and its body factual: summarize the change, list
  checks actually run, and disclose any checks that could not be completed.
- Do not create a draft unless asked. Never merge, close, or edit unrelated PRs.

After the authorized steps, report the commit SHA, branch, remote/PR URL as
applicable, checks run, and any remaining work. Leave unrelated worktree changes
untouched.

Before every public-repository commit, check the current time in
`America/Chicago`. Do not commit Monday–Friday from 08:00 inclusive to 16:00
exclusive; editing, testing, and staging remain allowed. Use actual commit
timestamps and the author Daniel Markland <daniel@codeassassins.com>.
