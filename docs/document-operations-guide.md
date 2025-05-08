# PandaDoc Document Operations Guide

This guide covers the various document operations available in the PandaDoc node for n8n.

## Document Lifecycle in PandaDoc

A typical document in PandaDoc goes through the following stages:

1. **Creation**: Document is created from a template or PDF
2. **Draft**: Document can be edited before sending
3. **Sent**: Document is sent to recipients for review and signing
4. **Completed**: All recipients have signed the document
5. **Archived**: Document is stored for record-keeping

## Document Operations

### Listing Documents

The **Get All Documents** operation retrieves a list of your documents with optional filtering.

#### Parameters:

- **Return All**: Toggle to retrieve all documents automatically
- **Limit**: Number of documents to return when not returning all
- **Additional Fields**:
  - **Folder ID**: Filter documents from a specific folder
  - **Status**: Filter by document status (draft, sent, completed, etc.)
  - **Tag**: Filter documents by tag
  - **Template ID**: Filter documents created from a specific template
  - **Date Created**: Filter by creation date
  - **Date Modified**: Filter by modification date

#### Example: List Recently Created Documents

1. Add a **PandaDoc** node
2. Select **Document** as Resource
3. Select **Get All** as Operation
4. Enable **Return All**
5. Under **Additional Fields**, set:
   - **Date Created > Greater Than**: (set to 30 days ago)
   - **Sort**: `date_created DESC`

### Creating Documents

#### From Template

The **Create Document from Template** operation generates a new document based on an existing template.

#### Required Parameters:

- **Template ID**: The ID of the template to use
- **Name**: Name for the new document

#### Optional Parameters:

- **Recipients**: People who will receive the document
  - **Email**: Recipient's email address
  - **First Name**: Recipient's first name
  - **Last Name**: Recipient's last name
  - **Role**: Recipient's role (e.g., client, contractor)
  - **Signing Order**: Order in which recipients should sign (leave empty for all at once)
- **Tokens**: Dynamic content for the template using key-value pairs
- **Pricing Tables**: Update pricing tables in the template
- **Metadata**: Custom metadata to associate with the document
- **Tags**: Tags to assign to the document
- **Folder ID**: Folder to store the document in

#### Example: Create a Sales Proposal

1. Add a **PandaDoc** node
2. Select **Document** as Resource
3. Select **Create Document from Template** as Operation
4. Set **Template ID** to your sales proposal template ID
5. Set **Name** to `Sales Proposal - {{$json["client_name"]}}`
6. Add a recipient with:
   - **Email**: `{{$json["client_email"]}}`
   - **First Name**: `{{$json["client_first_name"]}}`
   - **Last Name**: `{{$json["client_last_name"]}}`
   - **Role**: `client`
7. Add tokens for dynamic content:
   - **Name**: `client_company` | **Value**: `{{$json["company_name"]}}`
   - **Name**: `proposal_amount` | **Value**: `{{$json["deal_amount"]}}`
   - **Name**: `valid_until` | **Value**: `{{$json["expiration_date"]}}`

#### From PDF

The **Create Document from PDF** operation uploads a PDF and converts it to a PandaDoc document.

#### Required Parameters:

- **Document Name**: Name for the new document
- **File**: The binary data of the PDF to upload (connect to a node that outputs binary data)

#### Optional Parameters:

- **Recipients**: People who will receive the document
- **Fields**: Add fillable fields to the PDF
- **Parse Form Fields**: Whether to automatically convert PDF form fields to PandaDoc fields
- **Folder ID**: Folder to store the document in

#### Example: Upload a Contract for Signing

1. Add an **HTTP Request** or **Read Binary File** node to get the PDF
2. Add a **PandaDoc** node
3. Select **Document** as Resource
4. Select **Create Document from PDF** as Operation
5. Set **Document Name** to `Contract - {{$json["contract_number"]}}`
6. For **File**, select the binary field from the previous node
7. Add recipients as needed
8. Enable **Parse Form Fields** to convert existing form fields

### Sending Documents

The **Send Document** operation sends a document to recipients for review and signing.

#### Required Parameters:

- **Document ID**: ID of the document to send
- **Subject**: Email subject line
- **Message**: Email message body

#### Optional Parameters:

- **Silent**: Whether to send the document without an email notification
- **Scheduled Send**: Schedule when to send the document

#### Example: Send a Document for Signature

1. Create a document using previous operations
2. Add a new **PandaDoc** node
3. Select **Document** as Resource
4. Select **Send** as Operation
5. Set **Document ID** to the ID from the previous step
6. Set **Subject** to `Please sign: {{$node["Create_Document"].json["name"]}}`
7. Set **Message** to `Please review and sign this document at your earliest convenience.`

### Downloading Documents

The **Download Document** operation downloads a document in various formats.

#### Required Parameters:

- **Document ID**: ID of the document to download
- **Format**: Format to download (PDF, DOCX, etc.)

#### Example: Download a Signed Document

1. Add a **PandaDoc** node
2. Select **Document** as Resource
3. Select **Download** as Operation
4. Set **Document ID** to the target document ID
5. Set **Format** to `pdf`
6. Connect to an **Email** node to send the downloaded document as an attachment

### Other Document Operations

- **Get Document Details**: Retrieve comprehensive information about a document
- **Get Document Status**: Check the current status of a document
- **Delete Document**: Remove a document from your account
- **Update Document**: Modify document properties, metadata, or move to a folder
- **Create Document Link**: Generate a sharing link for a document

## Working with Document Webhooks

For real-time document updates, use the **PandaDoc Trigger** node to listen for document events:

1. Add a **PandaDoc Trigger** node
2. Select **Document** as Resource
3. Choose the desired Event:
   - **Document State Changed**: Triggers when the status changes
   - **Document Viewed**: Triggers when a recipient views the document
   - **Document Completed**: Triggers when all recipients complete the document

## Best Practices

1. **Use Templates**: Create templates in PandaDoc for recurring document types to ensure consistency

2. **Dynamic Content**: Utilize tokens to personalize documents with data from your n8n workflow

3. **Error Handling**: Add error handling for API failures:
   ```
   IF
   -- PandaDoc: Error
   NoOp
   ```

4. **Document Tracking**: Store document IDs in a database to track their status throughout the lifecycle

5. **Pagination**: For large document collections, use pagination or the "Return All" option judiciously to avoid performance issues

6. **Rate Limiting**: Be mindful of PandaDoc's API rate limits, especially for high-volume operations

## Troubleshooting Document Operations

1. **Template ID Not Found**: Verify the template ID exists and is accessible with your API credentials

2. **Document Creation Failed**: Check that all required fields in the template have values

3. **PDF Upload Issues**: Ensure the PDF is valid and not password-protected

4. **Sending Failures**: Verify recipient email addresses are correctly formatted

5. **Download Issues**: Ensure the document is in a status that allows downloading (usually completed)

## Example: Complete E-Signature Workflow

This example demonstrates a complete e-signature workflow:

1. **HTTP Request** trigger receives client data
2. **PandaDoc** node creates a document from a template
3. **PandaDoc** node sends the document for signing
4. **PandaDoc Trigger** node waits for the document to be completed
5. **PandaDoc** node downloads the signed document
6. **Google Drive** node uploads the document for archiving
7. **Email** node sends a confirmation to the internal team
