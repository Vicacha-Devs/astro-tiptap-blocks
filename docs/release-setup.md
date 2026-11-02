# Release setup: npm Trusted Publishing + semantic-release

Study notes for how `@vicacha-devs/astro-tiptap-blocks` is released, and every problem we hit getting there (Nov 2026).

## Final architecture

```
push to main ─▶ verify job (format, lint, check, test, build, publint)
              └▶ release job
                   ├─ GitHub App token (short-lived)   → push changelog + version commit, tag, GitHub release
                   └─ GitHub OIDC (id-token: write)    → npm publish with provenance, no npm token
```

| Concern                  | Mechanism                                                       |
| ------------------------ | --------------------------------------------------------------- |
| Authenticate to npm      | Trusted Publisher (OIDC). No `NPM_TOKEN`.                       |
| Push to protected `main` | GitHub App `vicacha-release-bot` (bypass actor on the ruleset). |
| Versioning               | semantic-release from Conventional Commits.                     |
| Provenance               | `publishConfig.provenance: true` + `NPM_CONFIG_PROVENANCE`.     |

Files: `.github/workflows/npm-release.yml`, `.releaserc.json`, `pnpm-workspace.yaml` (override), `package.json`.

## Release rules (`.releaserc.json`)

| Commit type                               | Release |
| ----------------------------------------- | ------- |
| `feat`                                    | minor   |
| `fix`, `perf`, `refactor`, `docs(README)` | patch   |
| `chore`, `ci`, `docs`, `style`, `test`    | none    |

Release commits use `[skip ci]` so they do not trigger another run.

## Setup checklist (per package / repo)

1. Publish the first version by hand (needs npm 2FA via a passkey or phone): `npm publish --access public --provenance=false`.
2. npmjs.com → package → Settings → Trusted Publisher → GitHub Actions:
   - Organization `Vicacha-Devs`, repository, workflow filename `npm-release.yml` (filename only), environment blank.
   - Tick **Allow npm publish**. Leave dist-tag unticked.
3. Tag the commit that was published (`git tag -a vX.Y.Z <sha> -m vX.Y.Z`) so semantic-release knows the baseline.
4. Workflow needs `permissions: id-token: write`; the repo URL in `package.json` must match the GitHub repo.
5. GitHub App token for pushing to `main` (see below).

## GitHub App (replaces the PAT)

- Org-owned App `vicacha-release-bot`, installed on the repos that release. Webhook off.
- Permissions needed: Contents RW, Issues RW, Pull requests RW (Metadata read is automatic).
  Issues is needed because semantic-release comments on and labels PRs through the issues API.
- Repo/org settings: variable `RELEASE_APP_CLIENT_ID`, secret `RELEASE_APP_PRIVATE_KEY`.
- Ruleset "Protect main" → bypass list → add the App (always).
- `actions/create-github-app-token@v3` takes `client-id` (`app-id` is deprecated).
- The built-in GitHub Actions app cannot be a ruleset bypass actor (API returns 422), and the default
  `GITHUB_TOKEN` cannot push to a protected branch, so a PAT or an App is required if
  `@semantic-release/git` stays.
- Docs: semantic-release GitHub Actions recipe ("Pushing package.json changes"), issue #2636
  (`persist-credentials: false` so checkout credentials do not override the token).

## Problems we hit, in order

| #   | Symptom                                                            | Cause                                                                                           | Fix                                                                      |
| --- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| 1   | `EINVALIDNPMTOKEN`                                                 | Token invalid/unsupported (npm discourages automation tokens)                                   | Switched to Trusted Publishing, removed `NPM_TOKEN` and `registry-url`   |
| 2   | `Automatic provenance generation not supported for provider: null` | Local publish with `publishConfig.provenance: true`                                             | `npm publish --provenance=false` locally                                 |
| 3   | `E403 ... 2FA required` on local publish                           | Account had no 2FA                                                                              | Enrolled a passkey (phone QR or password manager), publish with web auth |
| 4   | npm showed "not found" right after publishing                      | Registry/web index lag ("package is being processed")                                           | Wait a few minutes; `npm view` + registry URL were the source of truth   |
| 5   | `OIDC token exchange ... 404 package not found`                    | Trusted Publisher entry not created yet                                                         | Added the entry on npmjs.com                                             |
| 6   | `Missing helper: ...conventionalcommits requires writer@9`         | Preset 10 needs writer 9; `semantic-release@25` bundles `release-notes-generator@14` (writer 8) | pnpm override `conventional-changelog-writer: 9.3.0` (TODO below)        |
| 7   | `GH013 Repository rule violations` on `git push`                   | Ruleset requires PRs; `GITHUB_TOKEN` cannot bypass                                              | Fine-grained PAT, then GitHub App                                        |
| 8   | `E403 OIDC permission denied for this action`                      | Trusted Publisher only had "npm stage publish"                                                  | Edit entry → tick **Allow npm publish**                                  |
| 9   | Re-run said nothing to release after a failed publish              | Tag `v1.2.1` already existed without a published package                                        | Deleted the tag, started a fresh `workflow_dispatch` run on `main`       |

Side effects to remember:

- A failed run also tries to open a failure issue; it fails with `422` if the `semantic-release` label does not exist. That is noise, not the root cause.
- Recovering from a failed publish after the tag was pushed duplicated the `1.2.1` changelog entry and release commit.
- Re-running a failed job uses the old commit SHA; semantic-release then refuses ("local branch is behind"). Start a new run instead.

## Useful commands

```bash
npm view @vicacha-devs/astro-tiptap-blocks version dist-tags --prefer-online
curl -s https://registry.npmjs.org/@vicacha-devs%2fastro-tiptap-blocks | head
gh run list --workflow npm-release.yml --limit 5
gh run watch <run-id> --exit-status
gh run view <run-id> --log-failed
gh workflow run npm-release.yml --ref main        # fresh release run
git ls-remote --tags origin
GITHUB_TOKEN=$(gh auth token) pnpm release:dry    # dry run, publishes nothing
```

## Monorepos (14 and 6 packages)

- Plain `semantic-release` is single-package. Pick a monorepo tool first: Changesets, release-please,
  or nx release / Lerna. A release PR that you merge also removes the need for a bypass.
- Trusted Publishing is configured **per package** (one entry each, all pointing at the same workflow file).
- Each new package still needs one manual first publish before Trusted Publishing can be configured.
- Use one org-level App (secret + variable shared with the selected repos) for all repos.

## Open items

- [ ] Add `RELEASE_APP_CLIENT_ID` (variable) and `RELEASE_APP_PRIVATE_KEY` (secret), and the App as ruleset bypass. Give the App Issues: Read and write.
- [ ] After one release succeeds with the App token: delete `RELEASE_GH_TOKEN` and revoke the fine-grained PAT.
- [ ] Delete the `NPM_TOKEN` repo secret and revoke that token on npmjs.com (OIDC replaces it).
- [ ] Remove the `conventional-changelog-writer` override once `semantic-release` ships `release-notes-generator@15`.
- [ ] Remove the duplicate `1.2.1` section in `CHANGELOG.md`.
- [ ] Optionally create the `semantic-release` label so failure issues can be opened.
- [ ] Decide the release tool for the 14-package and 6-package monorepos.
