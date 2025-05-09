import { INodeProperties } from 'n8n-workflow';

export const folderOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['folder'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a folder',
				action: 'Create a folder',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a folder',
				action: 'Delete a folder',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a folder',
				action: 'Get a folder',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many folders',
				action: 'Get many folders',
			},
		],
		default: 'getAll',
	},
];

export const folderFields: INodeProperties[] = [
	/* -------------------------------------------------------------------------- */
	/*                                folder:getAll                                */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				operation: ['getAll'],
				resource: ['folder'],
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
				resource: ['folder'],
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
				resource: ['folder'],
			},
		},
		options: [
			{
				displayName: 'Parent Folder UUID',
				name: 'parent_uuid',
				type: 'string',
				default: '',
				description: 'UUID of the parent folder',
			},
		],
	},

	/* -------------------------------------------------------------------------- */
	/*                                folder:get                                   */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Folder',
		name: 'folderId',
		type: 'resourceLocator',
		default: { mode: 'list', value: '' },
		required: true,
		description: 'The folder to retrieve',
		displayOptions: {
			show: {
				operation: ['get'],
				resource: ['folder'],
			},
		},
		modes: [
			{
				displayName: 'From List (Searchable)',
				name: 'list',
				type: 'list',
				placeholder: 'Search and select a folder...',
				typeOptions: {
					searchListMethod: 'searchFolders',
					searchable: true,
				},
			},
			{
				displayName: 'By ID',
				name: 'id',
				type: 'string',
				placeholder: 'e.g., fds89f6ds98fds89f',
				validation: [
					{
						type: 'regex',
						properties: {
							regex: '[a-zA-Z0-9-]{16,}',
							errorMessage: 'Not a valid Folder ID',
						},
					},
				],
			},
		],
	},

	/* -------------------------------------------------------------------------- */
	/*                                folder:create                                */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				operation: ['create'],
				resource: ['folder'],
			},
		},
		description: 'Name of the folder to create',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				operation: ['create'],
				resource: ['folder'],
			},
		},
		options: [
			{
				displayName: 'Parent Folder',
				name: 'parent_uuid',
				type: 'resourceLocator',
				default: { mode: 'list', value: '' },
				description: 'The parent folder where new folder will be created',
				modes: [
					{
						displayName: 'From List',
						name: 'list',
						type: 'list',
						placeholder: 'Select a parent folder',
						typeOptions: {
							searchListMethod: 'searchFolders',
							searchable: true,
						},
					},
					{
						displayName: 'By ID',
						name: 'id',
						type: 'string',
						placeholder: 'e.g., fds89f6ds98fds89f',
						validation: [
							{
								type: 'regex',
								properties: {
									regex: '[a-zA-Z0-9-]{16,}',
									errorMessage: 'Not a valid Folder ID',
								},
							},
						],
					},
					{
						displayName: 'None (Root Level)',
						name: 'none',
						type: 'string',
					},
				],
			},
		],
	},

	/* -------------------------------------------------------------------------- */
	/*                                folder:delete                                */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Folder',
		name: 'folderId',
		type: 'resourceLocator',
		default: { mode: 'list', value: '' },
		required: true,
		description: 'The folder to delete',
		displayOptions: {
			show: {
				operation: ['delete'],
				resource: ['folder'],
			},
		},
		modes: [
			{
				displayName: 'From List',
				name: 'list',
				type: 'list',
				placeholder: 'Select a folder',
				typeOptions: {
					searchListMethod: 'searchFolders',
					searchable: true,
				},
			},
			{
				displayName: 'By ID',
				name: 'id',
				type: 'string',
				placeholder: 'e.g., fds89f6ds98fds89f',
				validation: [
					{
						type: 'regex',
						properties: {
							regex: '[a-zA-Z0-9-]{16,}',
							errorMessage: 'Not a valid Folder ID',
						},
					},
				],
			},
		],
	},
];
