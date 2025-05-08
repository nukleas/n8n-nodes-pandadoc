# PandaDoc Trigger Node Guide

This guide explains how to use the PandaDoc Trigger node to start n8n workflows when specific PandaDoc events occur.

## Understanding PandaDoc Webhooks

PandaDoc's webhook system allows you to receive real-time notifications when documents change status, are viewed, completed, or updated. The PandaDoc Trigger node creates and manages these webhooks automatically.

## Available Trigger Events

The PandaDoc Trigger node supports the following events:

1. **Document State Changed**: Triggers when a document changes state (e.g., from draft to sent, or sent to completed)
2. **Document Updated**: Triggers when any updates are made to a document
3. **Document Viewed**: Triggers when a recipient views a document
4. **Document Completed**: Triggers when all required signers have completed a document

## Setting Up the PandaDoc Trigger Node

### Step 1: Add the Node to Your Workflow

1. Create a new workflow or open an existing one
2. Add a new node, search for "PandaDoc Trigger" and select it
3. This node should typically be the first node in your workflow, as it initiates the workflow execution

### Step 2: Configure Authentication

1. In the node settings, select your authentication method:
   - **API Key**: Use your PandaDoc API key (simpler, but less secure)
   - **OAuth2**: Use OAuth2 authentication (more secure, recommended for production)
2. Create or select the appropriate credential

### Step 3: Configure the Trigger

1. **Resource**: Select "Document" (currently the only supported resource)
2. **Event**: Choose the specific event to listen for:
   - **Document State Changed**
   - **Document Updated**
   - **Document Viewed**
   - **Document Completed**
3. **Webhook Name** (optional): Provide a name to identify this webhook in PandaDoc
4. **Options**:
   - **Include Document Details**: Toggle to include full document details in the trigger output
   - **Only For Workspace**: Specify a workspace ID to filter events to a specific workspace

### Step 4: Activate the Workflow

1. Click the "Active" toggle at the top of the workflow editor
2. The PandaDoc Trigger node will automatically register a webhook with PandaDoc
3. The webhook will remain active until you deactivate the workflow

## Event Payload Structure

When a webhook event is received, the PandaDoc Trigger node provides the following data:

### Basic Event Structure

```json
{
  "event": "document_state_changed",
  "data": {
    "id": "5ECrsBCuWkzJXkdi88KxC5",
    "name": "Test Document",
    "status": "document.completed",
    "date_created": "2025-05-08T10:30:45.000Z",
    "date_modified": "2025-05-08T11:45:12.000Z",
    "expiration_date": "2025-06-08T10:30:45.000Z",
    "version": "3",
    "uuid": "abcdefg-1234-5678-abcd-12345678abcd",
    "sender": {
      "email": "sender@example.com"
    },
    "sharing": {
      "enabled": true
    },
    "recipients": [
      {
        "email": "recipient@example.com",
        "first_name": "John",
        "last_name": "Doe",
        "has_completed": true,
        "role": "signer"
      }
    ]
  }
}
```

### Additional Document Details (when enabled)

If you enable "Include Document Details," additional comprehensive information about the document is included in the `documentDetails` field:

```json
{
  "documentDetails": {
    "id": "5ECrsBCuWkzJXkdi88KxC5",
    "name": "Test Document",
    "status": "document.completed",
    "date_created": "2025-05-08T10:30:45.000Z",
    "date_modified": "2025-05-08T11:45:12.000Z",
    "expiration_date": "2025-06-08T10:30:45.000Z",
    "version": "3",
    "uuid": "abcdefg-1234-5678-abcd-12345678abcd",
    "template": {
      "id": "8kCz5ErusXWdxJ5id83KS7"
    },
    "folder": {
      "id": "3KErLQdpT7HzC9jS4k5xW8",
      "name": "Contracts"
    },
    "tokens": [
      {
        "name": "client.name",
        "value": "Acme Corporation"
      }
    ],
    "fields": [
      {
        "uuid": "hdTG5Jdu73hDuT6hdKs63d",
        "name": "Signature",
        "assigned_to": "recipient@example.com",
        "role": "signer",
        "value": "John Doe",
        "type": "signature"
      }
    ],
    "metadata": {
      "opportunity_id": "OPP-12345",
      "customer_id": "CUST-67890"
    },
    "tags": ["contract", "renewal"],
    "pricing": {
      "tables": [
        {
          "name": "Products",
          "total": 1000.00,
          "items": [
            {
              "sku": "PRD-001",
              "name": "Product 1",
              "price": 500.00,
              "quantity": 2
            }
          ]
        }
      ]
    }
  }
}
```

## Common Use Cases

### 1. Document Completion Notification

Create a workflow that sends a notification when a document is completed:

1. **PandaDoc Trigger** node: Listen for "Document Completed" events
2. **Slack** node: Send a message to a channel about the completed document
3. **Email** node: Send an email notification to the sales team

### 2. Document Status Tracking

Create a workflow that updates your CRM when a document status changes:

1. **PandaDoc Trigger** node: Listen for "Document State Changed" events
2. **IF** node: Check the new document status
3. **HTTP Request** node: Update the corresponding opportunity in your CRM

### 3. Document Analytics

Track document viewing patterns:

1. **PandaDoc Trigger** node: Listen for "Document Viewed" events
2. **Google Sheets** node: Log viewing data (recipient, time, document)
3. **Code** node: Calculate average time to first view

### 4. Automated Document Processing

Process documents automatically when they're completed:

1. **PandaDoc Trigger** node: Listen for "Document Completed" events
2. **PandaDoc** node: Download the completed document
3. **Google Drive** node: Archive the document
4. **HTTP Request** node: Initiate the next step in your business process

## Troubleshooting

### Webhook Not Triggering

1. **Verify Workflow is Active**: Ensure your workflow is activated for webhooks to work
2. **Check Authentication**: Verify your API key or OAuth2 token is valid and has the necessary permissions
3. **Webhook Limits**: Check if you've reached the maximum number of webhooks allowed in your PandaDoc plan
4. **Event Testing**: Use PandaDoc's interface to manually trigger the event (e.g., change a document status)

### Webhook Registration Errors

1. **API Permissions**: Ensure your credentials have webhook creation permissions
2. **Network Issues**: Verify n8n can receive incoming webhooks (check firewall, routing, etc.)
3. **URL Accessibility**: Make sure your n8n instance is accessible from the internet

### Processing Large Volumes

1. **Rate Limiting**: Be aware of PandaDoc's API rate limits, especially for high-frequency events
2. **Queue Processing**: For high-volume scenarios, consider implementing queue processing

## Webhook Security

PandaDoc webhooks are secured in several ways:

1. **HTTPS**: All webhook traffic is encrypted via HTTPS
2. **Webhook Secret**: The PandaDoc Trigger node stores and manages webhook secrets securely
3. **Authentication**: The node uses your authenticated PandaDoc credentials to manage webhooks

## Best Practices

1. **Be Specific**: Listen only for the specific events you need to process
2. **Error Handling**: Add error handling in your workflows to manage cases where processing fails
3. **Idempotency**: Design your workflows to handle potential duplicate webhook deliveries
4. **Monitoring**: Implement monitoring to ensure your webhooks are working as expected
5. **Filtering**: Use workspace filtering to reduce unnecessary triggers
6. **Document Details**: Only enable "Include Document Details" when you need the additional information, as it requires an extra API call

## Performance Considerations

1. **Webhook Response Time**: The PandaDoc Trigger node acknowledges webhook receipt immediately and processes the data asynchronously
2. **API Rate Limits**: Be mindful of PandaDoc's API rate limits, especially when "Include Document Details" is enabled
3. **Concurrent Processing**: n8n can handle multiple webhook triggers concurrently
