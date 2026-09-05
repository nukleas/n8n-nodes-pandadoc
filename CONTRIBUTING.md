# Contributing to n8n-nodes-pandadoc

Thank you for considering contributing to the PandaDoc integration for n8n! This document outlines the process for contributing to this project.

## Development Setup

Requirements: Node.js 22 or newer and npm.

1. Fork and clone the repository
2. Install dependencies: `npm install`
3. Start n8n with the nodes loaded and hot reload: `npm run dev`
4. Lint: `npm run lint` (auto-fix with `npm run lint:fix`)
5. Build: `npm run build`

The project uses the official [`@n8n/node-cli`](https://www.npmjs.com/package/@n8n/node-cli). Its ESLint configuration is enforced in strict mode (`"n8n": { "strict": true }` in `package.json`) so the package stays eligible for n8n verification.

## Development Workflow

1. Create a new branch for your feature or bugfix: `git checkout -b feature/your-feature-name`
2. Make your changes
3. Ensure `npm run lint` and `npm run build` pass
4. Verify the change against the [PandaDoc API reference](https://developers.pandadoc.com/reference/about). New operations must use documented endpoints, methods and request bodies.
5. Push your changes and create a pull request

## Code Structure

- `credentials/`: Credential definitions for API Key and OAuth2 authentication
- `nodes/PandaDoc/`: The regular node
  - `descriptions/`: UI parameters per resource
  - `methods/`: One handler per operation, plus the resource-locator search methods
- `nodes/PandaDocTrigger/`: The webhook trigger node
- `shared/`: The HTTP transport (`GenericFunctions.ts`), constants and request interfaces
- `icons/`: Node and credential icons (light and dark variants)

## Coding Guidelines

1. Route every API call through `pandaDocApiRequest` so both credential types work
2. Read resource-locator parameters with `{ extractValue: true }`
3. Let `NodeApiError` from the transport surface API failures; only add `catch` blocks when the node adds real handling
4. Keep node parameters in English and follow the linter's naming and ordering rules

## Release Process

Releases are published from GitHub Actions with npm provenance, which n8n requires for verified community nodes.

1. Make sure `master` is clean and up to date
2. Run `npm run release`. It lints, builds, prompts for the version bump, updates the changelog, commits, tags and pushes.
3. The tag push triggers `.github/workflows/publish.yml`, which publishes to npm.

## Questions?

If you have any questions about contributing, please open an issue in the repository.
