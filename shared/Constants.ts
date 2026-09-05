export const PANDADOC_API_URL = 'https://api.pandadoc.com/public/v1';

export const PANDADOC_APP_URL = 'https://app.pandadoc.com';

/** Maximum `count` accepted by the PandaDoc list endpoints. */
export const PANDADOC_PAGE_SIZE = 100;

export const DOCUMENT_STATUS = [
	{ value: '0', name: 'document.draft', description: 'Document is in draft state' },
	{ value: '1', name: 'document.sent', description: 'Document has been sent for signature' },
	{
		value: '2',
		name: 'document.completed',
		description: 'Document has been completed by all parties',
	},
	{ value: '3', name: 'document.uploaded', description: 'Document has been uploaded but not sent' },
	{ value: '4', name: 'document.error', description: 'Document processing error' },
	{ value: '5', name: 'document.viewed', description: 'Document has been viewed by the recipient' },
	{
		value: '6',
		name: 'document.waiting_approval',
		description: 'Document is waiting for approval',
	},
	{ value: '7', name: 'document.approved', description: 'Document has been approved' },
	{ value: '8', name: 'document.rejected', description: 'Document has been rejected' },
	{ value: '9', name: 'document.waiting_pay', description: 'Document is waiting for payment' },
	{ value: '10', name: 'document.paid', description: 'Document payment has been completed' },
	{ value: '11', name: 'document.voided', description: 'Document has been voided' },
	{
		value: '12',
		name: 'document.declined',
		description: 'Document has been declined by the recipient',
	},
	{ value: '13', name: 'document.external_review', description: 'Document is in external review' },
];

export const DOCUMENT_ORDERING_FIELDS = [
	{ value: 'name', name: 'Name (A-Z)' },
	{ value: '-name', name: 'Name (Z-A)' },
	{ value: 'date_created', name: 'Date Created (Oldest First)' },
	{ value: '-date_created', name: 'Date Created (Newest First)' },
	{ value: 'date_modified', name: 'Date Modified (Oldest First)' },
	{ value: '-date_modified', name: 'Date Modified (Newest First)' },
	{ value: 'date_completed', name: 'Date Completed (Oldest First)' },
	{ value: '-date_completed', name: 'Date Completed (Newest First)' },
	{ value: 'date_status_changed', name: 'Date Status Changed (Oldest First)' },
	{ value: '-date_status_changed', name: 'Date Status Changed (Newest First)' },
];

/** Webhook triggers accepted by `POST /webhook-subscriptions`. */
export const WEBHOOK_EVENTS = [
	{ name: 'Content Library Item Created', value: 'content_library_item_created' },
	{ name: 'Content Library Item Creation Failed', value: 'content_library_item_creation_failed' },
	{ name: 'Document Completed PDF Ready', value: 'document_completed_pdf_ready' },
	{ name: 'Document Creation Failed', value: 'document_creation_failed' },
	{ name: 'Document Deleted', value: 'document_deleted' },
	{ name: 'Document Section Added', value: 'document_section_added' },
	{ name: 'Document State Changed', value: 'document_state_changed' },
	{ name: 'Document Updated', value: 'document_updated' },
	{ name: 'Quote Updated', value: 'quote_updated' },
	{ name: 'Recipient Completed', value: 'recipient_completed' },
	{ name: 'Template Created', value: 'template_created' },
	{ name: 'Template Deleted', value: 'template_deleted' },
	{ name: 'Template Updated', value: 'template_updated' },
];

/** Optional payload sections a webhook subscription can include in its events. */
export const WEBHOOK_PAYLOAD_SECTIONS = [
	{ name: 'Fields', value: 'fields' },
	{ name: 'Metadata', value: 'metadata' },
	{ name: 'Pricing', value: 'pricing' },
	{ name: 'Products', value: 'products' },
	{ name: 'Tokens', value: 'tokens' },
];
