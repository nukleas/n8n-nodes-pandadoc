import { INodeProperties } from 'n8n-workflow';

export const triggerOperations: INodeProperties[] = [
	{
		displayName: 'Resource',
		name: 'resource',
		type: 'options',
		noDataExpression: true,
		options: [
			{
				name: 'Document',
				value: 'document',
			},
		],
		default: 'document',
		required: true,
	},
	{
		displayName: 'Event',
		name: 'event',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['document'],
			},
		},
		options: [
			{
				name: 'Document State Changed',
				value: 'document_state_changed',
				description: 'Triggers when a document state changes (e.g., draft, sent, completed)',
			},
			{
				name: 'Document Updated',
				value: 'document_updated',
				description: 'Triggers when a document is updated',
			},
			{
				name: 'Document Viewed',
				value: 'document_viewed',
				description: 'Triggers when a document is viewed by a recipient',
			},
			{
				name: 'Document Completed',
				value: 'document_completed',
				description: 'Triggers when a document is completed by all recipients',
			},
		],
		default: 'document_state_changed',
		required: true,
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Options',
		default: {},
		options: [
			{
				displayName: 'Include Document Details',
				name: 'includeDocumentDetails',
				type: 'boolean',
				default: false,
				description: 'Whether to include full document details in the output'
			},
			{
				displayName: 'Only For Workspace',
				name: 'workspaceId',
				type: 'string',
				default: '',
				description: 'Filter webhook events to a specific workspace ID'
			}
		]
	}
];

// Common fields for webhooks
export const webhookFields: INodeProperties[] = [
	{
		displayName: 'Webhook Name',
		name: 'webhookName',
		type: 'string',
		default: '',
		description: 'Name for this webhook (optional)',
}
];
