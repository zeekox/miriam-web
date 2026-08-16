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

### 3. Configure repository variables

Settings → Secrets and variables → Actions → **Variables**.

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `PATH_PREFIX` | Project pages only | `/` | URL subpath the site is served from |
| `SITE_URL` | No | `http://localhost:8080` | Origin used for canonical URLs |

`PATH_PREFIX` must be set to `/<repo-name>/` — for example `/miriam-art/` —
when the site is served from `<username>.github.io/<repo-name>/`. Both the
leading and trailing slash are significant.

It is not needed when a custom domain is attached, or when the repository is
named `<username>.github.io`. In those cases the site is served from the domain
root and the default of `/` is correct.

## Path prefix

An incorrect `PATH_PREFIX` produces a build that succeeds and a site that fails:
pages render, but every stylesheet, font, and image returns 404, because the
URLs remain rooted at `/`.

Two independent mechanisms apply the prefix, and both must agree:

- **Internal links** are passed through Eleventy's `url` filter in the
  templates.
- **Image URLs** are prefixed by `src/_lib/path-prefix.ts`. This is separate
  because `@11ty/eleventy-img` writes URLs directly into the markup and does not
  pass through the `url` filter.

Because of the second mechanism, adding a hard-coded absolute path to a template
will work locally and 404 once deployed to a project page.

## Pipeline

The `build` job runs:

1. `actions/checkout`
2. `actions/setup-node` with `node-version-file: .nvmrc`
3. `npm ci`
4. `npm run typecheck`
5. `npx eleventy`, with `PATH_PREFIX` and `SITE_URL` from repository variables
6. `actions/configure-pages`, then `actions/upload-pages-artifact` on `_site`

The `deploy` job then runs `actions/deploy-pages` in the `github-pages`
environment.

### Typecheck as a build gate

Step 4 gates the build deliberately. Content validation is implemented in the
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
npm run build
```

Reproduce a project-page build, including the path prefix:

```sh
PATH_PREFIX=/miriam-art/ npx eleventy --config=eleventy.config.ts
```

Inspecting the output of the second command is the only reliable way to catch
prefix errors before deploying, since they are invisible in a default build.

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| Deploy step fails with a permissions or configuration error | Pages source not set to **GitHub Actions** |
| Pages load but all CSS, fonts, and images 404 | `PATH_PREFIX` unset or incorrect for a project page |
| Build fails at the typecheck step | Invalid content — the error names the file and field |
| Build fails at `npm ci` | `package-lock.json` out of sync with `package.json` |
| Canonical URLs point at localhost | `SITE_URL` not set |

## Verification status

The workflow has not yet been executed. It has been verified by inspection and
by local builds with `PATH_PREFIX` set, which confirmed that every internal URL
receives the prefix. The first run should be checked in the Actions tab rather
than assumed to succeed.
