# Changelog

All notable changes to the `n8n-nodes-pandadoc` package will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed
- Moved to the official `@n8n/node-cli` toolchain (flat ESLint config in strict mode, `n8n-node build/dev/lint/release`) and to npm with `package-lock.json`. Gulp, the legacy `.eslintrc` files and the pnpm lockfile are gone.
- Added GitHub Actions workflows for CI and for publishing to npm with provenance, plus Dependabot.
- All requests now go through n8n's `httpRequestWithAuthentication`, so the credential selected in the node's **Authentication** parameter is honoured everywhere. Previously OAuth2 was ignored by the regular node and API-key auth was used regardless.
- Resource locators are read with n8n's built-in value extraction; the per-resource ID helpers were removed.
- Consolidated the three copies of the icon into `icons/` and added a dark-theme variant.
- The PandaDoc node is now usable as an AI agent tool (`usableAsTool`).
- Template > Get uses the documented `/templates/{id}/details` endpoint.
- Renamed the template filter **Q** to **Search Query**; option collections are alphabetized.

### Fixed
- **PandaDoc Trigger** now targets PandaDoc's `/webhook-subscriptions` API. The previous `/webhooks` endpoint does not exist in the PandaDoc public API, so webhook registration never worked.
- Webhook deliveries are verified with the subscription's shared key (HMAC-SHA256 over the raw body, `signature` query parameter). Requests with a missing or invalid signature are rejected with `401`.
- PandaDoc posts an array of events per delivery; every event is now emitted as its own item.
- Credential icons pointed at a file that did not exist.
- Downloads use n8n's current HTTP helper with `arraybuffer` encoding instead of the deprecated `request` helper.

### Removed
- **Breaking:** the trigger's single **Event** parameter is replaced by a multi-select **Events** parameter listing the events PandaDoc actually supports (`document_state_changed`, `recipient_completed`, `document_updated`, `document_deleted`, `document_creation_failed`, `document_completed_pdf_ready`, `document_section_added`, `quote_updated`, `template_*`, `content_library_item_*`). `document_viewed` and `document_completed` were never valid PandaDoc webhook triggers. Existing trigger nodes must be reconfigured.
- **Breaking:** the **Webhook Name** and **Only For Workspace** trigger parameters were replaced by **Options > Subscription Name** and **Options > Payload Sections**.
- The unused **Use Sandbox** credential toggle. PandaDoc selects the sandbox by API key, not by URL.
- Dead code: the response cache, the retry wrapper and the duplicate `loadOptions` search.

## [0.1.0] - 2025-05-08

### Added
- Initial release of PandaDoc integration
- PandaDoc node with document, template, folder and contact operations
- PandaDocTrigger node for webhook events
- Support for both API Key and OAuth2 authentication
- Comprehensive documentation in README.md
- Optimized code with shared resource fetching functions
- Caching mechanism for frequently accessed resources
