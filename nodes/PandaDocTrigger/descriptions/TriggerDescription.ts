import type { INodeProperties } from 'n8n-workflow';

import { WEBHOOK_EVENTS, WEBHOOK_PAYLOAD_SECTIONS } from '../../../shared/Constants';

export const triggerProperties: INodeProperties[] = [
	{
		displayName: 'Events',
		name: 'events',
		type: 'multiOptions',
		required: true,
		options: WEBHOOK_EVENTS,
		default: [],
		description: 'The PandaDoc events that start this workflow',
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add option',
		default: {},
		options: [
			{
				displayName: 'Include Document Details',
				name: 'includeDocumentDetails',
				type: 'boolean',
				default: false,
				description:
					'Whether to fetch the full document details for document events and add them as documentDetails',
			},
			{
				displayName: 'Payload Sections',
				name: 'payload',
				type: 'multiOptions',
				options: WEBHOOK_PAYLOAD_SECTIONS,
				default: [],
				description: 'Additional document sections PandaDoc should include in each event payload',
			},
			{
				displayName: 'Subscription Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Name of the webhook subscription shown in the PandaDoc Developer Dashboard',
			},
		],
	},
];
