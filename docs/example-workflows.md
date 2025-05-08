# PandaDoc Example Workflows

This guide provides complete, ready-to-use workflow examples for common PandaDoc integration scenarios.

## Sales Contract Automation

This workflow automates the entire sales contract process from CRM opportunity to signed document.

### Workflow Summary

1. When a deal reaches "Contract Stage" in your CRM
2. Generate a contract from a PandaDoc template
3. Send it to the customer for signature
4. Wait for completion
5. Download the signed document
6. Store it in your document management system
7. Update the CRM with contract status

### Implementation

```json
{
  "nodes": [
    {
      "name": "When Deal Reaches Contract Stage",
      "type": "webhook",
      "parameters": {
        "path": "deal-contract-stage",
        "responseMode": "onReceived",
        "responseData": "firstEntryJson"
      }
    },
    {
      "name": "Create Contract from Template",
      "type": "n8n-nodes-base.pandaDoc",
      "parameters": {
        "authentication": "apiKey",
        "resource": "document",
        "operation": "create",
        "templateId": "{{$json.template_id}}",
        "name": "Contract for {{$json.company_name}}",
        "recipients": [
          {
            "email": "{{$json.client_email}}",
            "firstName": "{{$json.client_first_name}}",
            "lastName": "{{$json.client_last_name}}",
            "role": "client"
          }
        ],
        "tokens": [
          {
            "name": "client.company",
            "value": "{{$json.company_name}}"
          },
          {
            "name": "contract.value",
            "value": "{{$json.deal_value}}"
          },
          {
            "name": "contract.term",
            "value": "{{$json.contract_term}}"
          }
        ],
        "metadata": {
          "deal_id": "{{$json.deal_id}}",
          "opportunity_source": "{{$json.lead_source}}"
        }
      }
    },
    {
      "name": "Send Contract for Signature",
      "type": "n8n-nodes-base.pandaDoc",
      "parameters": {
        "authentication": "apiKey",
        "resource": "document",
        "operation": "send",
        "documentId": "{{$node[\"Create Contract from Template\"].json.id}}",
        "subject": "Contract for Review and Signature",
        "message": "Dear {{$json.client_first_name}},\n\nPlease review and sign the attached contract at your earliest convenience.\n\nThank you,\nYour Sales Team"
      }
    },
    {
      "name": "Wait for Contract Completion",
      "type": "n8n-nodes-base.pandaDocTrigger",
      "parameters": {
        "authentication": "apiKey",
        "resource": "document",
        "event": "document_completed",
        "options": {
          "includeDocumentDetails": true
        }
      },
      "webhookId": "contract-completion"
    },
    {
      "name": "Download Signed Contract",
      "type": "n8n-nodes-base.pandaDoc",
      "parameters": {
        "authentication": "apiKey",
        "resource": "document",
        "operation": "download",
        "documentId": "{{$node[\"Wait for Contract Completion\"].json.data.id}}",
        "format": "pdf"
      }
    },
    {
      "name": "Store Document in Drive",
      "type": "n8n-nodes-base.googleDrive",
      "parameters": {
        "operation": "upload",
        "name": "{{$node[\"Wait for Contract Completion\"].json.data.name}}.pdf",
        "folderId": "your-contracts-folder-id",
        "binary": {
          "data": "data"
        }
      }
    },
    {
      "name": "Update CRM",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "PATCH",
        "url": "https://your-crm-api.com/deals/{{$json.metadata.deal_id}}",
        "bodyParameters": {
          "status": "Contract Signed",
          "contract_id": "{{$node[\"Wait for Contract Completion\"].json.data.id}}",
          "contract_signed_date": "{{$node[\"Wait for Contract Completion\"].json.data.date_completed}}"
        }
      }
    }
  ]
}
```

## Document Approval Workflow

This workflow implements an internal document approval process using PandaDoc.

### Workflow Summary

1. Receive a document approval request (e.g., from a form or Slack)
2. Create a document from a template with approval fields
3. Send to relevant managers for approval
4. Wait for document completion
5. Notify the requestor
6. Store the approved document

### Implementation

```json
{
  "nodes": [
    {
      "name": "Document Approval Request",
      "type": "webhook",
      "parameters": {
        "path": "document-approval",
        "responseMode": "onReceived",
        "responseData": "firstEntryJson"
      }
    },
    {
      "name": "Get Approvers from Database",
      "type": "n8n-nodes-base.postgres",
      "parameters": {
        "operation": "executeQuery",
        "query": "SELECT email, first_name, last_name FROM approvers WHERE department = '{{$json.department}}'"
      }
    },
    {
      "name": "Prepare Approvers",
      "type": "n8n-nodes-base.function",
      "parameters": {
        "functionCode": "const approvers = $input.all()[0].map(approver => {\n  return {\n    email: approver.email,\n    firstName: approver.first_name,\n    lastName: approver.last_name,\n    role: \"approver\"\n  };\n});\n\nreturn [{json: { approvers }}];"
      }
    },
    {
      "name": "Create Approval Document",
      "type": "n8n-nodes-base.pandaDoc",
      "parameters": {
        "authentication": "apiKey",
        "resource": "document",
        "operation": "create",
        "templateId": "your-approval-template-id",
        "name": "Approval: {{$json.document_name}}",
        "recipients": "{{$node[\"Prepare Approvers\"].json.approvers}}",
        "tokens": [
          {
            "name": "document.name",
            "value": "{{$json.document_name}}"
          },
          {
            "name": "document.description",
            "value": "{{$json.document_description}}"
          },
          {
            "name": "requestor.name",
            "value": "{{$json.requestor_name}}"
          },
          {
            "name": "requestor.department",
            "value": "{{$json.department}}"
          }
        ],
        "metadata": {
          "request_id": "{{$json.request_id}}",
          "priority": "{{$json.priority}}"
        }
      }
    },
    {
      "name": "Send for Approval",
      "type": "n8n-nodes-base.pandaDoc",
      "parameters": {
        "authentication": "apiKey",
        "resource": "document",
        "operation": "send",
        "documentId": "{{$node[\"Create Approval Document\"].json.id}}",
        "subject": "Document Approval Required: {{$json.document_name}}",
        "message": "Please review and approve the attached document."
      }
    },
    {
      "name": "Wait for Approval Completion",
      "type": "n8n-nodes-base.pandaDocTrigger",
      "parameters": {
        "authentication": "apiKey",
        "resource": "document",
        "event": "document_completed",
        "options": {
          "includeDocumentDetails": true
        }
      },
      "webhookId": "approval-completion"
    },
    {
      "name": "Check Approval Status",
      "type": "n8n-nodes-base.function",
      "parameters": {
        "functionCode": "// Check if everyone approved\nconst fields = $input.first().documentDetails.fields || [];\nconst allApproved = fields.every(field => {\n  return field.type !== 'approve' || field.value === 'approved';\n});\n\nreturn [{\n  json: {\n    approved: allApproved,\n    document: $input.first().data,\n    documentDetails: $input.first().documentDetails,\n    metadata: $input.first().documentDetails.metadata\n  }\n}];"
      }
    },
    {
      "name": "Notify Requestor",
      "type": "n8n-nodes-base.slack",
      "parameters": {
        "channel": "{{$json.metadata.requestor_slack_id}}",
        "text": "Your document \"{{$json.document.name}}\" has been {{$json.approved ? 'approved! ✅' : 'rejected. ❌'}}",
        "attachments": [
          {
            "fields": [
              {
                "title": "Document",
                "value": "{{$json.document.name}}",
                "short": true
              },
              {
                "title": "Status",
                "value": "{{$json.approved ? 'Approved' : 'Rejected'}}",
                "short": true
              }
            ],
            "actions": [
              {
                "type": "button",
                "text": "View Document",
                "url": "https://app.pandadoc.com/document/{{$json.document.id}}"
              }
            ]
          }
        ]
      }
    },
    {
      "name": "IF",
      "type": "n8n-nodes-base.if",
      "parameters": {
        "conditions": [
          {
            "value1": "{{$json.approved}}",
            "value2": true
          }
        ]
      }
    },
    {
      "name": "Download Approved Document",
      "type": "n8n-nodes-base.pandaDoc",
      "parameters": {
        "authentication": "apiKey",
        "resource": "document",
        "operation": "download",
        "documentId": "{{$json.document.id}}",
        "format": "pdf"
      }
    },
    {
      "name": "Store in Document System",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "POST",
        "url": "https://your-document-system-api.com/documents",
        "bodyParameters": {
          "name": "{{$json.document.name}}",
          "approved_date": "{{$now}}",
          "request_id": "{{$json.metadata.request_id}}",
          "department": "{{$json.metadata.department}}",
          "document_type": "approval"
        },
        "options": {
          "formData": {
            "file": {
              "value": "={{$binary.data.data}}",
              "options": {
                "filename": "{{$json.document.name}}.pdf"
              }
            }
          }
        }
      }
    }
  ]
}
```

## Customer Onboarding Document Package

This workflow generates a complete document package for new customers.

### Workflow Summary

1. When a new customer is created in your system
2. Generate multiple documents from templates (welcome letter, terms, service agreement)
3. Send everything as a single package to the customer
4. Wait for all documents to be signed
5. Update customer status in your system

### Implementation

```json
{
  "nodes": [
    {
      "name": "New Customer Created",
      "type": "webhook",
      "parameters": {
        "path": "new-customer",
        "responseMode": "onReceived",
        "responseData": "firstEntryJson"
      }
    },
    {
      "name": "Create Welcome Letter",
      "type": "n8n-nodes-base.pandaDoc",
      "parameters": {
        "authentication": "apiKey",
        "resource": "document",
        "operation": "create",
        "templateId": "your-welcome-letter-template-id",
        "name": "Welcome to Our Service - {{$json.company_name}}",
        "recipients": [
          {
            "email": "{{$json.email}}",
            "firstName": "{{$json.first_name}}",
            "lastName": "{{$json.last_name}}",
            "role": "client"
          }
        ],
        "tokens": [
          {
            "name": "customer.name",
            "value": "{{$json.company_name}}"
          },
          {
            "name": "customer.plan",
            "value": "{{$json.subscription_plan}}"
          }
        ]
      }
    },
    {
      "name": "Create Terms of Service",
      "type": "n8n-nodes-base.pandaDoc",
      "parameters": {
        "authentication": "apiKey",
        "resource": "document",
        "operation": "create",
        "templateId": "your-terms-template-id",
        "name": "Terms of Service - {{$json.company_name}}",
        "recipients": [
          {
            "email": "{{$json.email}}",
            "firstName": "{{$json.first_name}}",
            "lastName": "{{$json.last_name}}",
            "role": "client"
          }
        ]
      }
    },
    {
      "name": "Create Service Agreement",
      "type": "n8n-nodes-base.pandaDoc",
      "parameters": {
        "authentication": "apiKey",
        "resource": "document",
        "operation": "create",
        "templateId": "your-service-agreement-template-id",
        "name": "Service Agreement - {{$json.company_name}}",
        "recipients": [
          {
            "email": "{{$json.email}}",
            "firstName": "{{$json.first_name}}",
            "lastName": "{{$json.last_name}}",
            "role": "client"
          }
        ],
        "tokens": [
          {
            "name": "customer.name",
            "value": "{{$json.company_name}}"
          },
          {
            "name": "start.date",
            "value": "{{$now}}"
          },
          {
            "name": "service.plan",
            "value": "{{$json.subscription_plan}}"
          },
          {
            "name": "service.price",
            "value": "{{$json.price}}"
          }
        ]
      }
    },
    {
      "name": "Wait for All Documents",
      "type": "n8n-nodes-base.merge",
      "parameters": {
        "mode": "waitForAll",
        "maxItems": 3
      }
    },
    {
      "name": "Prepare Document IDs",
      "type": "n8n-nodes-base.function",
      "parameters": {
        "functionCode": "// Extract document IDs into an array\nconst documentIds = $input.all().map(item => item.json.id);\n\nreturn [{ json: { documentIds } }];"
      }
    },
    {
      "name": "Create Document Bundle",
      "type": "n8n-nodes-base.pandaDoc",
      "parameters": {
        "authentication": "apiKey",
        "resource": "document",
        "operation": "createLink",
        "documentId": "{{$node[\"Prepare Document IDs\"].json.documentIds}}",
        "name": "Onboarding Documents - {{$json.company_name}}",
        "lifetime": 30
      }
    },
    {
      "name": "Send Link to Customer",
      "type": "n8n-nodes-base.emailSend",
      "parameters": {
        "to": "{{$json.email}}",
        "subject": "Your Onboarding Documents - Please Sign",
        "text": "Dear {{$json.first_name}},\n\nThank you for choosing our service! Please review and sign your onboarding documents at the link below:\n\n{{$node[\"Create Document Bundle\"].json.link}}\n\nThis link will expire in 30 days.\n\nBest regards,\nYour Company"
      }
    },
    {
      "name": "Wait for Service Agreement Completion",
      "type": "n8n-nodes-base.pandaDocTrigger",
      "parameters": {
        "authentication": "apiKey",
        "resource": "document",
        "event": "document_completed",
        "options": {
          "includeDocumentDetails": true
        }
      },
      "webhookId": "service-agreement-completion"
    },
    {
      "name": "Check if Target Document",
      "type": "n8n-nodes-base.if",
      "parameters": {
        "conditions": [
          {
            "value1": "={{$node[\"Wait for Service Agreement Completion\"].json.data.name.includes('Service Agreement')}}",
            "operation": "contains",
            "value2": true
          }
        ]
      }
    },
    {
      "name": "Update Customer Status",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "PATCH",
        "url": "https://your-customer-api.com/customers/{{$json.customer_id}}",
        "bodyParameters": {
          "onboarding_status": "documents_completed",
          "agreement_id": "{{$node[\"Wait for Service Agreement Completion\"].json.data.id}}",
          "agreement_signed_date": "{{$now}}"
        }
      }
    },
    {
      "name": "Trigger Service Activation",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "POST",
        "url": "https://your-service-api.com/activate",
        "bodyParameters": {
          "customer_id": "{{$json.customer_id}}",
          "plan": "{{$json.subscription_plan}}",
          "start_date": "{{$now}}"
        }
      }
    }
  ]
}
```

## Document Renewal Reminder Workflow

This workflow identifies documents nearing expiration and sends renewal reminders.

### Workflow Summary

1. Run on a schedule (e.g., daily)
2. Retrieve all active documents
3. Filter for documents expiring in the next 30 days
4. Send renewal notifications
5. Create renewal documents if needed

### Implementation

```json
{
  "nodes": [
    {
      "name": "Schedule",
      "type": "n8n-nodes-base.schedule",
      "parameters": {
        "rule": {
          "interval": [
            {
              "field": "days",
              "value": 1
            }
          ]
        }
      }
    },
    {
      "name": "Get All Documents",
      "type": "n8n-nodes-base.pandaDoc",
      "parameters": {
        "authentication": "apiKey",
        "resource": "document",
        "operation": "getAll",
        "returnAll": true,
        "additionalFields": {
          "status": "document.completed"
        }
      }
    },
    {
      "name": "Filter Expiring Documents",
      "type": "n8n-nodes-base.function",
      "parameters": {
        "functionCode": "// Calculate dates\nconst now = new Date();\nconst thirtyDaysFromNow = new Date();\nthirtyDaysFromNow.setDate(now.getDate() + 30);\n\n// Filter documents\nconst expiringDocuments = $input.first().json.filter(doc => {\n  // Only process documents with expiration_date\n  if (!doc.expiration_date) return false;\n  \n  const expirationDate = new Date(doc.expiration_date);\n  \n  // Filter for documents that expire in the next 30 days\n  return expirationDate > now && expirationDate <= thirtyDaysFromNow;\n});\n\nreturn [{ json: { expiringDocuments } }];"
      }
    },
    {
      "name": "Split by Document",
      "type": "n8n-nodes-base.splitInBatches",
      "parameters": {
        "batchSize": 1,
        "options": {
          "includeBatchSize": true
        }
      }
    },
    {
      "name": "Get Document Metadata",
      "type": "n8n-nodes-base.pandaDoc",
      "parameters": {
        "authentication": "apiKey",
        "resource": "document",
        "operation": "get",
        "documentId": "={{$json.id}}"
      }
    },
    {
      "name": "Get Account Owner",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "GET",
        "url": "https://your-crm-api.com/contacts/{{$json.recipients[0].email}}"
      }
    },
    {
      "name": "Send Renewal Notification",
      "type": "n8n-nodes-base.emailSend",
      "parameters": {
        "to": "{{$node[\"Get Account Owner\"].json.account_manager_email}}",
        "subject": "Document Renewal Required: {{$json.name}}",
        "text": "Hello {{$node[\"Get Account Owner\"].json.account_manager_name}},\n\nThe following document for {{$json.recipients[0].first_name}} {{$json.recipients[0].last_name}} will expire on {{$json.expiration_date}}:\n\n{{$json.name}}\n\nPlease initiate the renewal process.\n\nDocument ID: {{$json.id}}\nCustomer: {{$json.recipients[0].email}}\nExpiration Date: {{$json.expiration_date}}\nDays until expiration: {{Math.floor((new Date($json.expiration_date) - new Date()) / (1000 * 60 * 60 * 24))}}\n\nView Document: https://app.pandadoc.com/document/{{$json.id}}\n\nThank you,\nYour Renewal System"
      }
    },
    {
      "name": "IF Within 7 Days",
      "type": "n8n-nodes-base.if",
      "parameters": {
        "conditions": [
          {
            "value1": "={{Math.floor((new Date($json.expiration_date) - new Date()) / (1000 * 60 * 60 * 24))}}",
            "operation": "smallerEqual",
            "value2": 7
          }
        ]
      }
    },
    {
      "name": "Create Renewal Document",
      "type": "n8n-nodes-base.pandaDoc",
      "parameters": {
        "authentication": "apiKey",
        "resource": "document",
        "operation": "create",
        "templateId": "your-renewal-template-id",
        "name": "Renewal: {{$json.name}}",
        "recipients": "{{$json.recipients}}",
        "tokens": [
          {
            "name": "previous.document",
            "value": "{{$json.name}}"
          },
          {
            "name": "expiration.date",
            "value": "{{$json.expiration_date}}"
          },
          {
            "name": "renewal.term",
            "value": "1 year"
          }
        ],
        "metadata": {
          "original_document_id": "{{$json.id}}",
          "renewal_type": "expiration"
        }
      }
    },
    {
      "name": "Log Renewal Activity",
      "type": "n8n-nodes-base.spreadsheetFile",
      "parameters": {
        "operation": "append",
        "filePath": "/path/to/renewal-tracking.xlsx",
        "options": {
          "range": "Renewals!A:F"
        },
        "columns": [
          {
            "column": "Original Document ID",
            "value": "{{$json.id}}"
          },
          {
            "column": "Document Name",
            "value": "{{$json.name}}"
          },
          {
            "column": "Expiration Date",
            "value": "{{$json.expiration_date}}"
          },
          {
            "column": "Renewal Document ID",
            "value": "{{$node[\"Create Renewal Document\"].json.id}}"
          },
          {
            "column": "Customer Email",
            "value": "{{$json.recipients[0].email}}"
          },
          {
            "column": "Renewal Created Date",
            "value": "{{$now}}"
          }
        ]
      }
    }
  ]
}
```

## Adapting These Workflows

You can customize these example workflows for your specific needs:

1. **Authentication**: Replace the authentication type with your preferred method (API Key or OAuth2)
2. **Template IDs**: Update with your actual template IDs from PandaDoc
3. **API Endpoints**: Replace the example URLs with your actual CRM/system endpoints
4. **Field Mappings**: Adjust the data mapping to match your specific data structure
5. **Notification Channels**: Change email notifications to your preferred channels (Slack, Microsoft Teams, etc.)

## Tips for Working With These Examples

1. **Import Workflow**: You can import these examples directly into n8n using the Import from JSON feature
2. **Test Mode**: Use n8n's Test Webhook feature to simulate triggers without actual events
3. **Credentials**: Set up your PandaDoc credentials before testing these workflows
4. **Sandbox Testing**: Use PandaDoc's sandbox environment for initial testing
5. **Error Handling**: Add error handling nodes to manage potential failures

For more detailed information on specific node operations, refer to the other documentation guides in this package.
