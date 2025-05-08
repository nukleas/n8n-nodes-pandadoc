import { INodeProperties } from 'n8n-workflow';
import { DOCUMENT_ORDERING_FIELDS, DOCUMENT_STATUS } from '../../../shared/Constants';

export const documentOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['document'],
			},
		},
		options: [
			{
				name: 'Create Document Link',
				value: 'createDocumentLink',
				description: 'Create a shareable link for a document',
				action: 'Create a document link',
			},
			{
				name: 'Create From PDF',
				value: 'createFromPdf',
				description: 'Create a document from a PDF file',
				action: 'Create a document from a PDF file',
			},
			{
				name: 'Create From Template',
				value: 'createFromTemplate',
				description: 'Create a document from a template',
				action: 'Create a document from a template',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a document',
				action: 'Delete a document',
			},
			{
				name: 'Download',
				value: 'download',
				description: 'Download a document',
				action: 'Download a document',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a document',
				action: 'Get a document',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many documents',
				action: 'Get many documents',
			},
			{
				name: 'Get Status',
				value: 'getStatus',
				description: 'Get document status',
				action: 'Get document status',
			},
			{
				name: 'Send',
				value: 'send',
				description: 'Send a document',
				action: 'Send a document',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a document properties',
				action: 'Update a document',
			},
		],
		default: 'getAll',
	},
];

export const documentFields: INodeProperties[] = [
	/* -------------------------------------------------------------------------- */
	/*                          document:update                                  */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Document',
		name: 'documentId',
		type: 'resourceLocator',
		default: { mode: 'list', value: '' },
		required: true,
		description: 'The document to update',
		displayOptions: {
			show: {
				resource: ['document'],
				operation: ['update'],
			},
		},
		modes: [
			{
				displayName: 'From List',
				name: 'list',
				type: 'list',
				placeholder: 'Select a document',
				typeOptions: {
					searchListMethod: 'searchDocuments',
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
							regex: '[a-zA-Z0-9]{16,}',
							errorMessage: 'Not a valid Document ID',
						},
					},
				],
			},
		],
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['document'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'New name for the document',
			},
			{
				displayName: 'Folder UUID',
				name: 'folder_uuid',
				type: 'string',
				default: '',
				description: 'Move document to this folder',
			},
			{
				displayName: 'Metadata',
				name: 'metadataUi',
				placeholder: 'Add Metadata',
				type: 'fixedCollection',
				default: {},
				typeOptions: {
					multipleValues: true,
				},
				options: [
					{
						name: 'metadataValues',
						displayName: 'Metadata',
						values: [
							{
								displayName: 'Key',
								name: 'key',
								type: 'string',
								default: '',
								description: 'Name of the metadata key',
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
								description: 'Value of the metadata',
							},
						],
					},
				],
			},
		],
	},

	/* -------------------------------------------------------------------------- */
	/*                      document:createDocumentLink                           */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Document',
		name: 'documentId',
		type: 'resourceLocator',
		default: { mode: 'list', value: '' },
		required: true,
		description: 'The document to create a link for',
		displayOptions: {
			show: {
				resource: ['document'],
				operation: ['createDocumentLink'],
			},
		},
		modes: [
			{
				displayName: 'From List',
				name: 'list',
				type: 'list',
				placeholder: 'Select a document',
				typeOptions: {
					searchListMethod: 'searchDocuments',
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
							regex: '[a-zA-Z0-9]{16,}',
							errorMessage: 'Not a valid Document ID',
						},
					},
				],
			},
		],
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['document'],
				operation: ['createDocumentLink'],
			},
		},
		options: [
			{
				displayName: 'Recipient',
				name: 'recipient',
				type: 'string',
				default: '',
				description: 'Email address of the intended recipient',
			},
			{
				displayName: 'Lifetime (Seconds)',
				name: 'lifetime',
				type: 'number',
				default: 604800,
				description:
					'How long the link will be valid, in seconds. Default is 7 days (604800 seconds).',
			},
			{
				displayName: 'Expiration Date',
				name: 'expiration_date',
				type: 'dateTime',
				default: '',
				description:
					'Exact expiration date for the link. Takes precedence over lifetime if both are specified.',
			},
		],
	},
	/* -------------------------------------------------------------------------- */
	/*                                document:getAll                              */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				operation: ['getAll'],
				resource: ['document'],
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
				resource: ['document'],
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
				resource: ['document'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Template ID',
				name: 'template_id',
				type: 'string',
				default: '',
				description: 'Filter by template ID. This parameter cannot be used with form_id.',
			},
			{
				displayName: 'Form ID',
				name: 'form_id',
				type: 'string',
				default: '',
				description: 'Filter by form ID. This parameter cannot be used with template_id.',
			},
			{
				displayName: 'Folder UUID',
				name: 'folder_uuid',
				type: 'string',
				default: '',
				description: 'Filter documents by the folder where they are stored',
			},
			{
				displayName: 'Contact ID',
				name: 'contact_id',
				type: 'string',
				default: '',
				description: 'Filter by the contact ID of a recipient or approver',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: DOCUMENT_STATUS.map((status) => ({
					name: status.name,
					value: status.value,
					description: status.description,
				})),
				default: '',
				description: 'Filter documents by status',
			},
			{
				displayName: 'Created From',
				name: 'created_from',
				type: 'dateTime',
				default: '',
				description:
					'Filter documents created on or after this date. Format: YYYY-MM-DDThh:mm:ss.sssZ.',
			},
			{
				displayName: 'Created To',
				name: 'created_to',
				type: 'dateTime',
				default: '',
				description: 'Filter documents created before this date. Format: YYYY-MM-DDThh:mm:ss.sssZ.',
			},
			{
				displayName: 'Deleted',
				name: 'deleted',
				type: 'boolean',
				default: false,
				description: 'Whether to return only deleted documents',
			},
			{
				displayName: 'Document ID',
				name: 'id',
				type: 'string',
				default: '',
				description: 'Search for document by ID',
			},
			{
				displayName: 'Completed From',
				name: 'completed_from',
				type: 'dateTime',
				default: '',
				description:
					'Filter by documents completed on or after this date. Format: YYYY-MM-DDThh:mm:ss.sssZ.',
			},
			{
				displayName: 'Completed To',
				name: 'completed_to',
				type: 'dateTime',
				default: '',
				description:
					'Filter by documents completed before this date. Format: YYYY-MM-DDThh:mm:ss.sssZ.',
			},
			{
				displayName: 'Modified From',
				name: 'modified_from',
				type: 'dateTime',
				default: '',
				description:
					'Filter by documents modified on or after this date. Format: YYYY-MM-DDThh:mm:ss.sssZ.',
			},
			{
				displayName: 'Modified To',
				name: 'modified_to',
				type: 'dateTime',
				default: '',
				description:
					'Filter by documents modified before this date. Format: YYYY-MM-DDThh:mm:ss.sssZ.',
			},
			{
				displayName: 'Order By',
				name: 'order_by',
				type: 'options',
				options: DOCUMENT_ORDERING_FIELDS,
				default: 'date_status_changed',
				description: 'Order documents by the specified field',
			},
			{
				displayName: 'Search Query',
				name: 'q',
				type: 'string',
				default: '',
				description: 'Search documents by name or reference number',
			},
		],
	},

	/* -------------------------------------------------------------------------- */
	/*                                document:get                                 */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Document',
		name: 'documentId',
		type: 'resourceLocator',
		default: { mode: 'list', value: '' },
		required: true,
		description: 'The document to operate on',
		displayOptions: {
			show: {
				resource: ['document'],
				operation: ['get', 'delete', 'download', 'getStatus', 'send'],
			},
		},
		modes: [
			{
				displayName: 'From List',
				name: 'list',
				type: 'list',
				placeholder: 'Select a document',
				typeOptions: {
					searchListMethod: 'searchDocuments',
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
							regex: '[a-zA-Z0-9]{16,}',
							errorMessage: 'Not a valid Document ID',
						},
					},
				],
			},
		],
	},

	/* -------------------------------------------------------------------------- */
	/*                          document:createFromTemplate                        */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Template',
		name: 'templateId',
		type: 'resourceLocator',
		default: { mode: 'list', value: '' },
		required: true,
		description: 'The template to use for document creation',
		displayOptions: {
			show: {
				resource: ['document'],
				operation: ['createFromTemplate'],
			},
		},
		modes: [
			{
				displayName: 'From List',
				name: 'list',
				type: 'list',
				placeholder: 'Select a template',
				typeOptions: {
					searchListMethod: 'searchTemplates',
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
							regex: '[a-zA-Z0-9]{16,}',
							errorMessage: 'Not a valid Template ID',
						},
					},
				],
			},
		],
	},
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['document'],
				operation: ['createFromTemplate'],
			},
		},
		description: 'The name of the document',
	},
	{
		displayName: 'Recipients',
		name: 'recipientsUi',
		placeholder: 'Add Recipient',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		displayOptions: {
			show: {
				resource: ['document'],
				operation: ['createFromTemplate'],
			},
		},
		default: {},
		options: [
			{
				name: 'recipientsValues',
				displayName: 'Recipient',
				values: [
					{
						displayName: 'Email',
						name: 'email',
						type: 'string',
						placeholder: 'name@email.com',
						required: true,
						default: '',
						description: "Recipient's email address",
					},
					{
						displayName: 'First Name',
						name: 'first_name',
						type: 'string',
						default: '',
						description: "Recipient's first name",
					},
					{
						displayName: 'Last Name',
						name: 'last_name',
						type: 'string',
						default: '',
						description: "Recipient's last name",
					},
					{
						displayName: 'Role',
						name: 'role',
						type: 'string',
						default: '',
						description:
							'The assigned role of the recipient. Should match a role name configured in the template.',
					},
					{
						displayName: 'Signing Order',
						name: 'signing_order',
						type: 'number',
						typeOptions: {
							minValue: 1,
						},
						default: 1,
						description: 'Order number for signing the document',
					},
				],
			},
		],
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['document'],
				operation: ['createFromTemplate'],
			},
		},
		options: [
			{
				displayName: 'Tags',
				name: 'tags',
				type: 'string',
				default: '',
				description: 'Comma-separated list of tags to assign to the document',
			},
			{
				displayName: 'Metadata',
				name: 'metadataUi',
				placeholder: 'Add Metadata',
				type: 'fixedCollection',
				default: {},
				typeOptions: {
					multipleValues: true,
				},
				options: [
					{
						name: 'metadataValues',
						displayName: 'Metadata',
						values: [
							{
								displayName: 'Key',
								name: 'key',
								type: 'string',
								default: '',
								description: 'Name of the metadata key',
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
								description: 'Value of the metadata',
							},
						],
					},
				],
			},
			{
				displayName: 'Pricing Tables',
				name: 'pricingTablesUi',
				placeholder: 'Add Pricing Table',
				type: 'fixedCollection',
				default: {},
				typeOptions: {
					multipleValues: true,
				},
				options: [
					{
						name: 'pricingTablesValues',
						displayName: 'Pricing Table',
						values: [
							{
								displayName: 'Name',
								name: 'name',
								type: 'string',
								default: '',
								description: 'Name of the pricing table',
							},
							{
								displayName: 'Items',
								name: 'itemsUi',
								placeholder: 'Add Item',
								type: 'fixedCollection',
								default: {},
								typeOptions: {
									multipleValues: true,
								},
								options: [
									{
										name: 'itemsValues',
										displayName: 'Item',
										values: [
											{
												displayName: 'Name',
												name: 'name',
												type: 'string',
												default: '',
												description: 'Name of the pricing table item',
											},
											{
												displayName: 'Description',
												name: 'description',
												type: 'string',
												default: '',
												description: 'Description of the pricing table item',
											},
											{
												displayName: 'Price',
												name: 'price',
												type: 'number',
												default: 0,
												description: 'Price of the item',
											},
											{
												displayName: 'Quantity',
												name: 'qty',
												type: 'number',
												default: 1,
												description: 'Quantity of the item',
											},
										],
									},
								],
							},
						],
					},
				],
			},
			{
				displayName: 'Content Placeholders',
				name: 'contentPlaceholdersUi',
				placeholder: 'Add Content Placeholder',
				type: 'fixedCollection',
				default: {},
				typeOptions: {
					multipleValues: true,
				},
				options: [
					{
						name: 'contentPlaceholdersValues',
						displayName: 'Content Placeholder',
						values: [
							{
								displayName: 'Block ID',
								name: 'block_id',
								type: 'string',
								default: '',
								description: 'ID of the content placeholder block in the template',
								required: true,
							},
							{
								displayName: 'Content',
								name: 'content',
								type: 'json',
								default: '',
								description: 'Content to insert into the placeholder',
								required: true,
							},
						],
					},
				],
			},
			{
				displayName: 'Folder UUID',
				name: 'folder_uuid',
				type: 'string',
				default: '',
				description: 'The UUID of the folder to store the document in',
			},
		],
	},

	/* -------------------------------------------------------------------------- */
	/*                            document:createFromPdf                           */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['document'],
				operation: ['createFromPdf'],
			},
		},
		description: 'The name of the document',
	},
	{
		displayName: 'Binary Property',
		name: 'binaryPropertyName',
		type: 'string',
		default: 'data',
		required: true,
		displayOptions: {
			show: {
				resource: ['document'],
				operation: ['createFromPdf'],
			},
		},
		description:
			'Name of the binary property that contains the PDF file to upload. The file should be less than 150MB.',
	},
	{
		displayName: 'Recipients',
		name: 'recipientsUi',
		placeholder: 'Add Recipient',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		displayOptions: {
			show: {
				resource: ['document'],
				operation: ['createFromPdf'],
			},
		},
		default: {},
		options: [
			{
				name: 'recipientsValues',
				displayName: 'Recipient',
				values: [
					{
						displayName: 'Email',
						name: 'email',
						type: 'string',
						placeholder: 'name@email.com',
						required: true,
						default: '',
						description: "Recipient's email address",
					},
					{
						displayName: 'First Name',
						name: 'first_name',
						type: 'string',
						default: '',
						description: "Recipient's first name",
					},
					{
						displayName: 'Last Name',
						name: 'last_name',
						type: 'string',
						default: '',
						description: "Recipient's last name",
					},
					{
						displayName: 'Role',
						name: 'role',
						type: 'string',
						default: '',
						description: 'The role of the recipient',
					},
					{
						displayName: 'Signing Order',
						name: 'signing_order',
						type: 'number',
						typeOptions: {
							minValue: 1,
						},
						default: 1,
						description: 'Order number for signing the document',
					},
				],
			},
		],
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['document'],
				operation: ['createFromPdf'],
			},
		},
		options: [
			{
				displayName: 'Tags',
				name: 'tags',
				type: 'string',
				default: '',
				description: 'Comma-separated list of tags to assign to the document',
			},
			{
				displayName: 'Metadata',
				name: 'metadataUi',
				placeholder: 'Add Metadata',
				type: 'fixedCollection',
				default: {},
				typeOptions: {
					multipleValues: true,
				},
				options: [
					{
						name: 'metadataValues',
						displayName: 'Metadata',
						values: [
							{
								displayName: 'Key',
								name: 'key',
								type: 'string',
								default: '',
								description: 'Name of the metadata key',
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
								description: 'Value of the metadata',
							},
						],
					},
				],
			},
			{
				displayName: 'Parse Form Fields',
				name: 'parse_form_fields',
				type: 'boolean',
				default: false,
				description: 'Whether to parse PDF form fields and convert them to document editor fields',
			},
			{
				displayName: 'Folder UUID',
				name: 'folder_uuid',
				type: 'string',
				default: '',
				description: 'The UUID of the folder to store the document in',
			},
		],
	},

	/* -------------------------------------------------------------------------- */
	/*                                document:send                                */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['document'],
				operation: ['send'],
			},
		},
		options: [
			{
				displayName: 'Subject',
				name: 'subject',
				type: 'string',
				default: '',
				description: 'Subject of the email to be sent',
			},
			{
				displayName: 'Message',
				name: 'message',
				type: 'string',
				typeOptions: {
					alwaysOpenEditWindow: true,
				},
				default: '',
				description: 'Message to include in the email',
			},
			{
				displayName: 'Silent',
				name: 'silent',
				type: 'boolean',
				default: false,
				description: 'Whether to send the document without sending an email',
			},
			{
				displayName: 'Sender',
				name: 'sender',
				type: 'options',
				options: [
					{
						name: 'Me',
						value: 'me',
					},
				],
				default: 'me',
				description: 'Who should be marked as the sender of the document',
			},
		],
	},

	/* -------------------------------------------------------------------------- */
	/*                              document:download                              */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Format',
		name: 'format',
		type: 'options',
		options: [
			{
				name: 'PDF',
				value: 'pdf',
			},
		],
		default: 'pdf',
		displayOptions: {
			show: {
				resource: ['document'],
				operation: ['download'],
			},
		},
		description: 'The format to download the document in',
	},
	{
		displayName: 'Binary Property',
		name: 'binaryPropertyName',
		type: 'string',
		default: 'data',
		displayOptions: {
			show: {
				resource: ['document'],
				operation: ['download'],
			},
		},
		description: 'Name of the binary property to write the file to',
	},
];
