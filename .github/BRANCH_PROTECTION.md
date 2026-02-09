# Branch Protection Setup Guide

This guide explains how to configure branch protection rules in GitHub to require PR reviews before merging.

## Prerequisites

- You must be a repository administrator
- Repository: `hjsad1994/Tester_Wordexe_Project`

## Step-by-Step Instructions

### 1. Navigate to Branch Protection Settings

1. Go to your repository on GitHub
2. Click **Settings** (top right of the repository)
3. In the left sidebar, click **Branches** under "Code and automation"

### 2. Add Branch Protection Rule

1. Click **Add branch protection rule** (or **Add rule**)
2. In "Branch name pattern", enter: `main`

### 3. Configure Protection Settings

Enable the following options:

#### Required Reviews
- [x] **Require a pull request before merging**
  - [x] **Require approvals**: Set to `1`
  - [x] **Dismiss stale pull request approvals when new commits are pushed**
  - [x] **Require review from Code Owners**

#### Required Status Checks
- [x] **Require status checks to pass before merging**
  - [x] **Require branches to be up to date before merging**
  - Search and add these status checks:
    - `Backend CI`
    - `Frontend CI`
    - `Playwright Tests`
    - `CI Status`

#### Additional Settings (Recommended)
- [x] **Require conversation resolution before merging**
- [x] **Do not allow bypassing the above settings**
- [ ] **Allow force pushes** (keep unchecked)
- [ ] **Allow deletions** (keep unchecked)

### 4. Save Changes

Click **Create** (or **Save changes**) at the bottom of the page.

## Verification

After setup, verify the protection is working:

1. Create a test branch
2. Make a small change
3. Open a PR to `main`
4. Verify that:
   - CI checks run automatically
   - "Review required" badge appears
   - Merge button is disabled until review is approved

## CODEOWNERS Integration

The `CODEOWNERS` file automatically requests reviews from:
- `@hjsad1994` for all file changes

This integrates with the "Require review from Code Owners" setting above.

## Troubleshooting

### Status checks not appearing
- Wait for the first PR to trigger CI
- Status checks only appear after they've run at least once

### CODEOWNERS not working
- Ensure the file is at `.github/CODEOWNERS`
- Verify the username is correct: `@hjsad1994`
- Check that "Require review from Code Owners" is enabled

### CI failing
- Check the Actions tab for detailed logs
- Ensure all dependencies are installed correctly
- Verify Node.js version matches `.nvmrc` (20)

## Quick Reference

| Setting | Value |
|---------|-------|
| Protected branch | `main` |
| Required approvals | 1 |
| Code owner | `@hjsad1994` |
| Required status checks | Backend CI, Frontend CI, Playwright Tests, CI Status |
