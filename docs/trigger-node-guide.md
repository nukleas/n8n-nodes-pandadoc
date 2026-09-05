# PandaDoc Trigger Node Guide

This guide explains how to use the PandaDoc Trigger node to start n8n workflows when PandaDoc events occur.

## How It Works

When you activate a workflow, the node creates a [webhook subscription](https://developers.pandadoc.com/reference/createwebhooksubscription) in your PandaDoc workspace that points at your n8n instance. When you deactivate the workflow the subscription is deleted again. Every delivery is verified against the subscription's shared key before the workflow runs.

## Available Events

The **Events** parameter is a multi-select. Choose one or more of the events PandaDoc supports:

| Event | Sent when |
| --- | --- |
| Document State Changed | A document moves to a new status (draft, sent, completed, ...) |
| Recipient Completed | A single recipient finishes their part of a document |
| Document Updated | A document is edited |
| Document Deleted | A document is deleted |
| Document Creation Failed | An asynchronous document creation fails |
| Document Completed PDF Ready | The final PDF of a completed document is available |
| Document Section Added | A section is added to a document bundle |
| Quote Updated | A quote inside a document changes |
| Template Created / Updated / Deleted | Templates change |
| Content Library Item Created / Creation Failed | Content library items change |

To react to completed documents, listen for **Document State Changed** and check `data.status` for `document.completed`.

## Setting Up the PandaDoc Trigger Node

### Step 1: Add the Node to Your Workflow

1. Create a new workflow or open an existing one
2. Add a new node, search for "PandaDoc Trigger" and select it

### Step 2: Configure Authentication

1. Select **API Key** or **OAuth2**
2. Create or select the matching credential (see the [authentication guide](authentication-guide.md))

### Step 3: Configure the Trigger

1. **Events**: pick the events that should start the workflow
2. **Options**:
   - **Include Document Details**: fetch `GET /documents/{id}/details` for document events and add the result as `documentDetails`. This costs one API call per event.
   - **Payload Sections**: ask PandaDoc to include `fields`, `metadata`, `pricing`, `products` and/or `tokens` in each event payload
   - **Subscription Name**: the name shown in the PandaDoc Developer Dashboard. Defaults to the workflow name.

### Step 4: Activate the Workflow

Toggle **Active**. The node registers the subscription and stores its ID and shared key with the workflow.

## Event Payload Structure

PandaDoc posts an array of events per delivery. The node emits one item per event that matches your **Events** selection:

```json
{
  "event": "document_state_changed",
  "data": {
    "id": "5ECrsBCuWkzJXkdi88KxC5",
    "name": "Test Document",
    "status": "document.completed",
    "date_created": "2025-05-08T10:30:45.000Z",
    "date_modified": "2025-05-08T11:45:12.000Z",
    "expiration_date": null,
    "version": "3",
    "created_by": { "id": "...", "email": "sender@example.com" },
    "recipients": [
      {
        "email": "recipient@example.com",
        "first_name": "John",
        "last_name": "Doe",
        "has_completed": true,
        "role": "signer"
      }
    ],
    "template": { "id": "8kCz5ErusXWdxJ5id83KS7", "name": "Sample Template" }
  }
}
```

With **Include Document Details** enabled, the full document details response is added under `documentDetails`.

## Webhook Security

PandaDoc signs every delivery with HMAC-SHA256 over the raw request body using the subscription's shared key and sends the hex digest as the `signature` query parameter. The node recomputes the signature and rejects requests that do not match with HTTP 401, so only PandaDoc can start your workflow.

## Common Use Cases

### Document Completion Notification

1. **PandaDoc Trigger**: Events = Document State Changed
2. **IF**: `{{ $json.data.status }}` equals `document.completed`
3. **Slack** / **Email**: notify the team

### Archive Completed Documents

1. **PandaDoc Trigger**: Events = Document Completed PDF Ready
2. **PandaDoc**: Document > Download with `{{ $json.data.id }}`
3. **Google Drive**: upload the binary

### Recipient Tracking

1. **PandaDoc Trigger**: Events = Recipient Completed
2. **Google Sheets**: log recipient and timestamp

## Troubleshooting

### Webhook Not Triggering

1. Ensure the workflow is **Active**
2. Confirm your credential is valid and belongs to the workspace that owns the documents
3. Check the subscription in the PandaDoc Developer Dashboard under **Webhooks**; PandaDoc lists delivery attempts and HTTP status codes there
4. Make sure your n8n instance is reachable from the internet over HTTPS

### 401 Responses in the PandaDoc Dashboard

The signature check failed. Deactivate and reactivate the workflow so the node creates a fresh subscription and stores the current shared key.

## Best Practices

1. Subscribe only to the events you process
2. Design workflows to tolerate duplicate deliveries; PandaDoc retries failed deliveries
3. Enable **Include Document Details** only when you need it, as it adds an API call per event
