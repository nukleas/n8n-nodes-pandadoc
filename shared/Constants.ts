/**
 * PandaDoc API Constants
 */

// Document statuses
export const DOCUMENT_STATUS = [
	{
		value: '0',
		name: 'document.draft',
		description: 'Document is in draft state',
	},
	{
		value: '1',
		name: 'document.sent',
		description: 'Document has been sent for signature',
	},
	{
		value: '2',
		name: 'document.completed',
		description: 'Document has been completed by all parties',
	},
	{
		value: '3',
		name: 'document.uploaded',
		description: 'Document has been uploaded but not sent',
	},
	{
		value: '4',
		name: 'document.error',
		description: 'Document processing error',
	},
	{
		value: '5',
		name: 'document.viewed',
		description: 'Document has been viewed by the recipient',
	},
	{
		value: '6',
		name: 'document.waiting_approval',
		description: 'Document is waiting for approval',
	},
	{
		value: '7',
		name: 'document.approved',
		description: 'Document has been approved',
	},
	{
		value: '8',
		name: 'document.rejected',
		description: 'Document has been rejected',
	},
	{
		value: '9',
		name: 'document.waiting_pay',
		description: 'Document is waiting for payment',
	},
	{
		value: '10',
		name: 'document.paid',
		description: 'Document payment has been completed',
	},
	{
		value: '11',
		name: 'document.voided',
		description: 'Document has been voided',
	},
	{
		value: '12',
		name: 'document.declined',
		description: 'Document has been declined by the recipient',
	},
	{
		value: '13',
		name: 'document.external_review',
		description: 'Document is in external review',
	},
];

// Document ordering fields
export const DOCUMENT_ORDERING_FIELDS = [
	{
		value: 'name',
		name: 'Name (A-Z)',
	},
	{
		value: '-name',
		name: 'Name (Z-A)',
	},
	{
		value: 'date_created',
		name: 'Date Created (Oldest first)',
	},
	{
		value: '-date_created',
		name: 'Date Created (Newest first)',
	},
	{
		value: 'date_modified',
		name: 'Date Modified (Oldest first)',
	},
	{
		value: '-date_modified',
		name: 'Date Modified (Newest first)',
	},
	{
		value: 'date_completed',
		name: 'Date Completed (Oldest first)',
	},
	{
		value: '-date_completed',
		name: 'Date Completed (Newest first)',
	},
	{
		value: 'date_status_changed',
		name: 'Date Status Changed (Oldest first)',
	},
	{
		value: '-date_status_changed',
		name: 'Date Status Changed (Newest first)',
	},
];

// Base URLs
export const API_BASE_URL = 'https://api.pandadoc.com';
export const API_PATH = '/public/v1';
export const API_URL = `${API_BASE_URL}${API_PATH}`;

// Resource Types
export const RESOURCE_TYPES = [
	{
		name: 'Document',
		value: 'document',
	},
	{
		name: 'Documents',
		value: 'documents',
	},
	{
		name: 'Template',
		value: 'template',
	},
	{
		name: 'Templates',
		value: 'templates',
	},
	{
		name: 'Folder',
		value: 'folder',
	},
	{
		name: 'Folders',
		value: 'folders',
	},
	{
		name: 'Contact',
		value: 'contact',
	},
	{
		name: 'Contacts',
		value: 'contacts',
	},
];
