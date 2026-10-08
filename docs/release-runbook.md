# Release runbook

## Ownership and branches

Each task gets a new worktree and `codex/<task>` branch from current `origin/develop`.
Preserve other checkouts. Feature agents open PRs into develop. One designated
release agent owns merges during the authorized release window; pause develop
merges while the develop → main release PR or its production deployment is active.
Feature PRs squash; same-repository develop → main releases use a merge commit.
Never push directly to tracked branches or use administrator bypass.

Required branch protection on develop and main: PRs, latest required `ci`, strict
up-to-date checks on develop, administrators included, no force pushes or branch deletion.
Private repositories require a GitHub plan supporting these controls. Do not
claim enforcement until GitHub confirms the rules. Branch rulesets restrict develop to squash and main to merge commits, with no
bypass actors. Linear develop history also rejects merge commits. No merge queue is needed yet.
Enable/verify them with `node scripts/release/protect.mjs` after `ci` exists.
Main uses passing merge-result checks without requiring develop to contain each
previous main merge commit; release serialization preserves the branch ancestry.
Use `node scripts/release/merge.mjs <PR>` after review; it checks protections,
release ownership window and the exact head before asking GitHub to merge.
The helper cannot distinguish agents sharing one GitHub account; ownership is a
coordination rule, not a new identity boundary. Repository automation serializes
releases and never cancels an active deployment/publication.

## Checks

`ci` is the single required result. PR runs cancel superseded runs for that PR.
Root/context Markdown and documentation assets use lightweight policy validation;
package documentation, dependencies, workflows and executable changes run full
checks. Policy rejects main PRs from any source other than this repo's develop.
A release always validates the exact tracked commit. Never use stale check results
or bypass a failure. Run `git diff --check` and the repository checks locally.

## Controlled deployment and handover

1. Configure GitHub environment `development` and `production` separately:
   secret `VERCEL_TOKEN`, secret `DATABASE_MIGRATION_URL`; variables
   `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, and `RELEASE_SMOKE_TARGETS`.
   The migration connection is privileged and server-only; runtime uses its own
   restricted connection. Package installation uses `PACKAGE_READ_TOKEN` or
   the workflow's scoped GitHub Packages token; publication uses `GITHUB_TOKEN`.
2. Smoke targets are a JSON array, e.g.
   `[{"url":"https://<configured-host>/health","status":200,"contains":"healthy"}]`.
   Supply real existing routes and body markers; do not add runtime host defaults.
   URLs cannot contain credentials or query strings. Only the optional
   `x-groovepost-tenant` header is accepted. Check tenant domains separately too.
3. Leave `RELEASE_AUTOMATION_ENABLED` unset until secrets and projects are verified.
   This rollout state retains the existing tracked Git deployments and package
   workflow. It is not evidence that controlled deployment is operating.
4. Enable the repository variable for a controlled dev run; set the matching
   Vercel project's production environment `RELEASE_AUTOMATION_ENABLED=true` so
   its ignored-build command skips tracked Git deployments. Configure the prod
   project similarly before the first controlled main release. Changes take
   effect with the checked-in ignore command; verify that command is active first.
   Existing manual/package workflows are disabled by the same repository switch.
5. Platform: dev project Preview `RELEASE_CANONICAL_PREVIEW=true`; production
   project Preview `RELEASE_CANONICAL_PREVIEW=false`. Feature previews live only
   on the dev project. These settings do not cancel an already active deployment.
6. Merge into develop, inspect the Controlled release summary and hosted smoke.
   Once enabled, main PR policy requires successful dev deployment for its exact
   head. Open develop → main and merge only after `ci` passes.

Actions validate → build → apply pending Supabase SQL migrations → apply pending
Payload migrations → verify/publish packages on main → deploy prebuilt assets →
promote → smoke. Build commands never migrate. Development validates package
candidates without publishing them. Production checks immutable packed contents,
then verifies publication with a clean registry installation. Shared packages
must release upstream before platform dependency bumps. Changesets version PRs
remain on develop; generated PR checks are explicitly dispatched.

The workflow summary/artifact records source SHA, environment, migration digest
and checked-in migration filenames, registry versions/digests, deployed URL and
previous deployment. Filenames are the migration set, not a claim that every file
ran again. Both migration tools track already-applied versions; retries run only
pending migrations. Inspect migration-tool output for what was applied.

## Recovery and completion

Rerun a failed tracked workflow at the same SHA after resolving its cause. Existing
package versions are verified and never overwritten. Database failure prevents
publication/deployment. Smoke failure rolls back only when the previous deployment
has matching migration-digest evidence; otherwise stop for operator recovery.
Never reverse migrations or unpublish packages automatically. The first managed
release may have no previous compatibility evidence, so operator recovery is needed.

Completion requires the hosted smoke result and recorded deployment, not a merge
or successful local build. Exercise a failed migration in a disposable database,
retry publication, and confirm simultaneous runs queue. Verify direct pushes are
rejected after protections are enabled, without risking main with test changes.
