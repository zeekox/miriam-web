# Deployment

This site is a static build published to GitHub Pages by GitHub Actions. The
workflow is defined in `.github/workflows/deploy.yml`.

A push to `main` is sufficient to trigger a deployment, but only after the
one-time setup below is complete. Two of those steps happen in the GitHub web
interface and cannot be committed to the repository.

## Overview

| | |
|---|---|
| Host | GitHub Pages |
| Trigger | Push to `main`, or manual `workflow_dispatch` |
| Build | Eleventy, output to `_site/` |
| Artifact | `actions/upload-pages-artifact` → `actions/deploy-pages` |
| Node version | Read from `.nvmrc` |
| Package manager | pnpm, pinned by `packageManager` in `package.json` |

## Prerequisites

- A GitHub repository with a remote configured. At time of writing the local
  repository has no remote.
- Pages enabled on that repository, with **GitHub Actions** as the source.

## One-time setup

### 1. Create the remote

```sh
gh repo create miriam-art --public --source=. --remote=origin --push
```

### 2. Set the Pages source

Settings → Pages → Build and deployment → Source: **GitHub Actions**.

The alternative option, "Deploy from a branch", is incompatible with this
workflow. `actions/deploy-pages@v4` fails when the source is not set to GitHub
Actions, and the resulting error does not name this setting.

### 3. Path prefix

The site is served from a custom domain, so it lives at the domain root and
`PATH_PREFIX` is `/`. That is the workflow default and needs no configuration.

It only changes if the site is ever served from a subpath — a project page at
`<username>.github.io/<repo>/`. Then set a repository variable under Settings →
Secrets and variables → Actions → **Variables**:

| Variable | When | Value |
|---|---|---|
| `PATH_PREFIX` | Project page on a subpath | `/<repo-name>/` |

Both the leading and trailing slash are significant.

No `CNAME` file is needed. GitHub's documentation is explicit that a custom
Actions workflow neither creates nor reads one — the domain persists in the Pages
settings.

## Path prefix

An incorrect `PATH_PREFIX` produces a build that succeeds and a site that fails:
pages render, but every stylesheet, font, and image returns 404, because the URLs
remain rooted at `/`.

Verify before deploying by inspecting the output of the project-page build under
[Local verification](#local-verification) — the fault is invisible in a default
build. `CLAUDE.md` covers the two mechanisms that apply the prefix and why a
hard-coded absolute path passes locally and fails once deployed.

## Pipeline

The `build` job runs:

1. `actions/checkout`
2. `pnpm/action-setup`, which reads `packageManager` from `package.json`
3. `actions/setup-node` with `node-version-file: .nvmrc` and `cache: pnpm` —
   it must come after pnpm, or it cannot resolve the pnpm store to cache
4. `pnpm install --frozen-lockfile`
5. `pnpm run typecheck`
6. `pnpm exec eleventy`, with `PATH_PREFIX` from the repository variable or `/`
7. `actions/configure-pages`, then `actions/upload-pages-artifact` on `_site`

The `deploy` job then runs `actions/deploy-pages` in the `github-pages`
environment.

### Typecheck as a build gate

Step 5 gates the build deliberately. Content validation is implemented in the
type layer rather than as a runtime check, so a work with missing `alt` text or
malformed `dimensions` fails here and names the offending file and field,
instead of publishing a page with a broken or unlabelled image.

### Concurrency

The workflow sets `group: pages` with `cancel-in-progress: false`. Deployments
queue rather than race, and an in-progress deployment is allowed to finish, so a
partially written deployment is never published.

## Local verification

Reproduce a default build:

```sh
pnpm run build
```

Reproduce a project-page build, including the path prefix:

```sh
PATH_PREFIX=/miriam-web/ pnpm exec eleventy --config=eleventy.config.ts
```

Inspecting the output of the second command is the only reliable way to catch
prefix errors before deploying, since they are invisible in a default build.

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| Deploy step fails with a permissions or configuration error | Pages source not set to **GitHub Actions** |
| Pages load but all CSS, fonts, and images 404 | `PATH_PREFIX` unset or incorrect for a project page |
| Build fails at the typecheck step | Invalid content — the error names the file and field |
| Build fails at `pnpm install --frozen-lockfile` | `pnpm-lock.yaml` out of sync with `package.json` |

## Verification status

The workflow has not yet been executed. It has been verified by inspection and
by local builds with `PATH_PREFIX` set, which confirmed that every internal URL
receives the prefix. The first run should be checked in the Actions tab rather
than assumed to succeed.
