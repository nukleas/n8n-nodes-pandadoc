# n8n-nodes-pandadoc

<div align="center">
  <a href="https://www.npmjs.com/package/n8n-nodes-pandadoc">
    <img src="https://img.shields.io/npm/v/n8n-nodes-pandadoc.svg?color=orange" alt="NPM Version">
  </a>
  <a href="https://github.com/nukleas/n8n-nodes-pandadoc/blob/master/LICENSE.md">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License">
  </a>
</div>

<p align="center">
  This package contains n8n nodes to integrate with the <a href="https://www.pandadoc.com/">PandaDoc</a> API, allowing you to automate document workflows, e-signatures, and manage contracts within your n8n workflows.
</p>

## Overview

[PandaDoc](https://www.pandadoc.com/) is a document automation platform that helps you streamline your sales documents, create, send, track, and e-sign documents.

### 🚀 Features

This n8n integration provides the following nodes:

- **PandaDoc Node**: For creating, managing, and tracking documents, templates, contacts, and folders. Usable as a tool by n8n AI agents.
- **PandaDoc Trigger Node**: For starting workflows from PandaDoc webhook events (document status changes, recipient completion, template changes, and more) with signature verification

---

## 📦 Installation

Follow the [community nodes installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n documentation.

### In the n8n UI

1. Go to **Settings > Community Nodes**
2. Click **Install**
3. Enter `n8n-nodes-pandadoc` and click **Install**

### Manually

In the n8n user folder of a self-hosted instance:

```bash
npm install n8n-nodes-pandadoc
```

---

## 🔐 Authentication

The PandaDoc nodes support two authentication methods:

### API Key Authentication

1. Log in to your [PandaDoc account](https://app.pandadoc.com/)
2. Go to **Settings > Integrations > API** (you'll need admin permissions)
3. Generate a new API key. Sandbox and production keys use the same endpoint, so create one n8n credential per key.
4. Use this API key in the **PandaDoc API** credential. n8n verifies it against the API when you save.

### OAuth2 Authentication

1. Go to the [PandaDoc Developer Dashboard](https://developers.pandadoc.com/)
2. Create a new application
3. Configure the OAuth2 settings with your redirect URL (typically `https://your-n8n-domain.com/rest/oauth2-credential/callback`)
4. Use the client ID and secret in the PandaDoc OAuth2 credentials in n8n

---

## 📚 Node Usage

### PandaDoc Node

The PandaDoc node allows you to work with several resources:

#### Documents

- **Get All Documents**: Retrieve a list of documents with filtering options
- **Get Document Details**: Get detailed information about a specific document
- **Get Document Status**: Check the current status of a document
- **Create Document from Template**: Generate a new document using an existing template
- **Create Document from PDF**: Upload a PDF and convert it to a PandaDoc document
- **Send Document**: Send a document to recipients for signing
- **Download Document**: Download a completed document as a PDF into a binary property
- **Delete Document**: Remove a document from your account
- **Update Document**: Modify document properties, metadata, or move to a folder
- **Create Document Link**: Generate a sharing link for a document

#### Templates

- **Get All Templates**: List available templates with filtering options
- **Get Template Details**: Get detailed information about a template

#### Folders

- **Get All Folders**: List folders in your account, optionally within a parent folder
- **Create Folder**: Create a new folder
- **Rename Folder**: Rename an existing folder (PandaDoc's API cannot delete or move folders)

#### Contacts

- **Get All Contacts**: List contacts with filtering options
- **Get Contact Details**: Get detailed information about a contact
- **Create Contact**: Add a new contact
- **Update Contact**: Modify contact information
- **Delete Contact**: Remove a contact

### PandaDoc Trigger Node 🔔

The PandaDoc Trigger node registers a webhook subscription in your PandaDoc workspace and starts the workflow for the events you select. Deliveries are verified with the subscription's shared key.

#### Events

- **Document State Changed**, **Document Updated**, **Document Deleted**, **Document Creation Failed**, **Document Completed PDF Ready**, **Document Section Added**
- **Recipient Completed**
- **Quote Updated**
- **Template Created**, **Template Updated**, **Template Deleted**
- **Content Library Item Created**, **Content Library Item Creation Failed**

Optionally include extra payload sections (fields, metadata, pricing, products, tokens) or fetch the full document details for each event. See the [trigger node guide](docs/trigger-node-guide.md).

---

## 💡 Example Workflows

### Document Approval Workflow

This workflow creates a document from a template, sends it for signing, and then processes the document once it's completed:

1. **HTTP Request** node: Receives request with customer data
2. **PandaDoc** node: Creates document from template with customer data
3. **PandaDoc** node: Sends document for signing
4. **PandaDoc Trigger** node: Waits for document to be completed
5. **PandaDoc** node: Downloads completed document
6. **Email** node: Sends confirmation with document attached

### Contract Renewal Notification

This workflow monitors for contracts nearing expiration and sends renewal notifications:

1. **Schedule** node: Runs daily
2. **PandaDoc** node: Gets all documents with filtering for contracts
3. **Function** node: Identifies contracts expiring within 30 days
4. **PandaDoc** node: Creates renewal documents from templates
5. **Slack** node: Notifies account managers of pending renewals

---

## 🧩 Compatibility

Built with the official [`@n8n/node-cli`](https://www.npmjs.com/package/@n8n/node-cli) and tested against n8n 1.x. The package has no runtime dependencies.

---

## ⚠️ API & Usage Limits

PandaDoc has certain API limits that you should be aware of:

- Free accounts: 100 API calls per day
- Business accounts: 1000 API calls per day
- Enterprise accounts: Custom limits

Refer to the [PandaDoc API documentation](https://developers.pandadoc.com/) for the most up-to-date information on limits and quotas.

---

## 🔧 Troubleshooting

### Common Issues

1. **Authentication Failed**: Ensure your API key is valid and has not expired. For OAuth2, you may need to reauthorize if your token has expired.

2. **Rate Limiting**: If you hit the API rate limits, the node will return a 429 error. Try implementing a retry mechanism with exponential backoff.

3. **Document Creation Fails**: When creating documents from templates, ensure all required fields are provided and properly formatted.

### Support

If you encounter issues with the PandaDoc nodes:

1. Check the [PandaDoc API documentation](https://developers.pandadoc.com/)
2. Open an issue on the [GitHub repository](https://github.com/nukleas/n8n-nodes-pandadoc)
3. Contact the author directly: Nader Heidari (nader.c.heidari@gmail.com)
4. Reach out to the n8n community on the [forum](https://community.n8n.io/)

---

## 👥 Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for the development setup.

```bash
npm install
npm run dev     # starts n8n with the nodes loaded and hot reload
npm run lint
npm run build
```

---

## 📄 License

[MIT](LICENSE.md) © 2025 Nader Heidari
