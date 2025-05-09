import { INodeProperties } from 'n8n-workflow';

export const templateOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['template'],
			},
		},
		options: [
			{
				name: 'Get',
				value: 'get',
				description: 'Get a template',
				action: 'Get a template',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many templates',
				action: 'Get many templates',
			},
		],
		default: 'getAll',
	},
];

export const templateFields: INodeProperties[] = [
	/* -------------------------------------------------------------------------- */
	/*                                template:getAll                              */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				operation: ['getAll'],
				resource: ['template'],
			},
		},
		default: false,
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				operation: ['getAll'],
				resource: ['template'],
				returnAll: [false],
			},
		},
		typeOptions: {
			minValue: 1,
		},
		default: 50,
		description: 'Max number of results to return',
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				operation: ['getAll'],
				resource: ['template'],
			},
		},
		options: [
			{
				displayName: 'Folder UUID',
				name: 'folder_uuid',
				type: 'string',
				default: '',
				description: 'UUID of the folder to which the templates belong',
			},
			{
				displayName: 'Q',
				name: 'q',
				type: 'string',
				default: '',
				description: 'Search query. Filter by template name.',
			},
			{
				displayName: 'Count',
				name: 'count',
				type: 'boolean',
				default: false,
				description: 'Whether to return only the total count of items',
			},
			{
				displayName: 'Tag',
				name: 'tag',
				type: 'string',
				default: '',
				description: 'Filter by specific tag',
			},
			{
				displayName: 'Shared',
				name: 'shared',
				type: 'boolean',
				default: false,
				description: 'Whether to return only shared templates',
			},
		],
	},

	/* -------------------------------------------------------------------------- */
	/*                                template:get                                 */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Template',
		name: 'templateId',
		type: 'resourceLocator',
		required: true,
		default: { mode: 'list', value: '' },
		modes: [
			{
				displayName: 'From List',
				name: 'list',
				type: 'list',
				typeOptions: {
					searchListMethod: 'searchTemplates',
					searchable: true,
				},
				placeholder: 'Select a Template',
			},
			{
				displayName: 'By ID',
				name: 'id',
				type: 'string',
				placeholder: 'wxyz12345',
				validation: [
					{
						type: 'regex',
						properties: {
							regex: '[a-zA-Z0-9]{2,}',
							errorMessage: 'Not a valid Template ID',
						},
					},
				],
			},
		],
		displayOptions: {
			show: {
				operation: ['get'],
				resource: ['template'],
			},
		},
		description: 'Template to get',
	},
];
