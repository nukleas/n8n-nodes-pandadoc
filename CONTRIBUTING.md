# Contributing to n8n-nodes-pandadoc

Thank you for considering contributing to the PandaDoc integration for n8n! This document outlines the process for contributing to this project.

## Development Setup

1. Fork and clone the repository
2. Install dependencies: `pnpm install`
3. Build the code: `pnpm build`
4. Run linting: `pnpm lint`

## Development Workflow

1. Create a new branch for your feature or bugfix: `git checkout -b feature/your-feature-name`
2. Make your changes
3. Ensure code passes linting: `pnpm lint`
4. Build the project: `pnpm build`
5. Push your changes and create a pull request

## Code Structure

- `credentials/`: Contains credential definitions for API Key and OAuth2 authentication
- `nodes/`: Contains the node implementations
  - `PandaDoc/`: Regular node for document operations
  - `PandaDocTrigger/`: Trigger node for webhooks
- `shared/`: Contains shared utilities and interfaces

## Coding Guidelines

1. Follow TypeScript best practices
2. Provide JSDoc comments for functions and methods
3. Ensure proper error handling
4. Maintain backward compatibility when possible
5. Add unit tests for new functionality

## Release Process

1. Update the version in package.json
2. Update CHANGELOG.md with your changes
3. Create a pull request
4. After approval, a maintainer will handle the release

## Questions?

If you have any questions about contributing, please open an issue in the repository.
