# Contributing to Net Worth Tracker

Thank you for your interest in contributing! This document covers how to get started and the conventions used in this project.

## Types of Contributions

- **Bug reports** — Open a GitHub Issue describing the problem, steps to reproduce, and expected behaviour.
- **Feature requests** — Open a GitHub Issue describing the use case and proposed solution before opening a PR.
- **Documentation** — Improvements to `README.md`, files under `docs/`, or inline code comments are always welcome.
- **Bug fixes and features** — Open a PR against `main`. Link the related issue.
- **Dependency updates** — Prefer a dedicated PR with a clear description of why the update is needed.

## Environment Setup

See [docs/development.md](./docs/development.md) for full instructions. The short version:

```bash
git clone https://github.com/brpaz/networth-tracker.git
cd networth-tracker

# With direnv (auto-loads on directory entry)
direnv allow

# Or manually
devenv shell
```

## Git Workflow

1. Fork the repository and create a branch from `main`:

   ```bash
   git checkout -b feat/my-feature
   ```

2. Branch naming conventions:

   | Prefix      | Use for                                               |
   | ----------- | ----------------------------------------------------- |
   | `feat/`     | New features                                          |
   | `fix/`      | Bug fixes                                             |
   | `docs/`     | Documentation only changes                            |
   | `chore/`    | Maintenance, tooling, dependencies                    |
   | `refactor/` | Code changes that neither fix a bug nor add a feature |

3. Commit messages must follow [Conventional Commits](https://www.conventionalcommits.org/):

   ```
   feat: add compound interest chart
   fix: correct snapshot date formatting
   docs: update development setup guide
   chore: bump pnpm to 10.5
   ```

   Commit format is enforced by commitlint on `git push`.

4. Open a Pull Request against `main` with:
   - A title that follows Conventional Commits format.
   - At least one label: `feature`, `bug`, `docs`, `dependencies`, `security`, `chore`, or `performance`.

   PR title format and labels are validated automatically by the PR Checker workflow.

## Release Workflow

Releases are managed through GitHub Releases:

1. Merged PRs are automatically collected by [Release Drafter](https://github.com/release-drafter/release-drafter), which maintains a draft release note.
2. A maintainer publishes a new GitHub Release (using [semver](https://semver.org/)).
3. Publishing the release triggers the Release workflow, which updates `CHANGELOG.md` and publishes a new Docker image to the GitHub Container Registry.

Contributors do not need to manage versioning or changelogs manually.

## Code Style

- Formatting is enforced by Prettier and ESLint (run automatically on `pre-commit`).
- TypeScript strict mode is enabled — avoid `any`, `@ts-ignore`, and `@ts-expect-error`.
- Follow the existing patterns described in [AGENTS.md](./AGENTS.md) (server architecture, naming conventions, test setup).
