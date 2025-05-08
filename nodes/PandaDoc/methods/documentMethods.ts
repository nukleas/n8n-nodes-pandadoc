import {
	IExecuteFunctions,
	IDataObject,
	IBinaryKeyData,
	NodeApiError,
	INodeExecutionData,
} from 'n8n-workflow';
import { pandaDocApiRequest, getAllResourceItems } from '../../../shared/GenericFunctions';
import {
	IDocumentRecipient,
	IDocumentPricing,
	IDocumentMetadata,
	IPricingTable,
	IDocumentContentPlaceholder,
} from '../../../shared/Interfaces';

/**
 * Get all documents with optimized implementation
 */
export async function getAllDocuments(
	this: IExecuteFunctions,
	i: number,
): Promise<INodeExecutionData[]> {
	const filters = this.getNodeParameter('filters', i) as IDataObject;

	// Transform filters to query parameters directly
	const documentFilters: IDataObject = {};
	
	// Map all possible document filters
	const filterFields = [
		'template_id', 'form_id', 'folder_uuid', 'contact_id', 'status',
		'created_from', 'created_to', 'deleted', 'id', 'completed_from',
		'completed_to', 'modified_from', 'modified_to', 'order_by', 'q'
	];
	
	// Apply all provided filters
	for (const field of filterFields) {
		if (filters[field] !== undefined) {
			documentFilters[field] = filters[field];
		}
	}

	// Use the shared fetch function to reduce code duplication
	return getAllResourceItems.call(
		this,
		i,
		'/documents',
		'documents',
		documentFilters,
	) as Promise<INodeExecutionData[]>;
}

/**
 * Helper function to extract document ID from resource locator
 */
export function getDocumentId(this: IExecuteFunctions, i: number): string {
	const documentIdSource = this.getNodeParameter('documentId', i) as IDataObject;
	let documentId: string;

	// Extract document ID based on the resource locator mode
	if (documentIdSource.mode === 'list') {
		documentId = documentIdSource.value as string;
	} else {
		// 'id' mode - direct ID entry
		documentId = documentIdSource.value as string;
	}

	return documentId;
}

/**
 * Get a document
 */
export async function getDocument(this: IExecuteFunctions, i: number): Promise<IDataObject[]> {
	const documentId = getDocumentId.call(this, i);
	const response = await pandaDocApiRequest.call(this, 'GET', `/documents/${documentId}/details`);
	return this.helpers.returnJsonArray(response);
}

/**
 * Get document status
 */
export async function getDocumentStatus(
	this: IExecuteFunctions,
	i: number,
): Promise<IDataObject[]> {
	const documentId = getDocumentId.call(this, i);
	const response = await pandaDocApiRequest.call(this, 'GET', `/documents/${documentId}`);
	return this.helpers.returnJsonArray(response);
}

/**
 * Create a document from a template
 */
export async function createDocumentFromTemplate(
	this: IExecuteFunctions,
	i: number,
): Promise<IDataObject[]> {
	// Handle the resource locator for template ID
	const templateIdSource = this.getNodeParameter('templateId', i) as IDataObject;
	let templateId: string;

	// Extract the template ID based on the resource locator mode
	if (templateIdSource.mode === 'list') {
		templateId = templateIdSource.value as string;
	} else {
		// 'id' mode - direct ID entry
		templateId = templateIdSource.value as string;
	}

	const name = this.getNodeParameter('name', i) as string;
	const options = this.getNodeParameter('options', i, {}) as IDataObject;

	// Process recipients
	const recipientsUi = this.getNodeParameter('recipientsUi', i, {}) as IDataObject;
	const recipients: IDocumentRecipient[] = [];
	if (recipientsUi && recipientsUi.recipientsValues) {
		for (const recipientValue of recipientsUi.recipientsValues as IDataObject[]) {
			const recipient: IDocumentRecipient = {
				email: recipientValue.email as string,
			};
			if (recipientValue.first_name) recipient.first_name = recipientValue.first_name as string;
			if (recipientValue.last_name) recipient.last_name = recipientValue.last_name as string;
			if (recipientValue.role) recipient.role = recipientValue.role as string;
			if (recipientValue.signing_order)
				recipient.signing_order = recipientValue.signing_order as number;
			recipients.push(recipient);
		}
	}

	// Process metadata
	const metadata: IDocumentMetadata = {};
	if (options.metadataUi && (options.metadataUi as IDataObject).metadataValues) {
		for (const metadataItem of (options.metadataUi as IDataObject)
			.metadataValues as IDataObject[]) {
			metadata[metadataItem.key as string] = metadataItem.value as string;
		}
	}

	// Process tags
	const tags: string[] = [];
	if (options.tags) {
		const tagsString = options.tags as string;
		const tagsList = tagsString.split(',');
		for (const tag of tagsList) {
			tags.push(tag.trim());
		}
	}

	// Process pricing tables
	const pricing: IDocumentPricing = {
		tables: [],
	};
	if (options.pricingTablesUi && (options.pricingTablesUi as IDataObject).pricingTablesValues) {
		for (const tableData of (options.pricingTablesUi as IDataObject)
			.pricingTablesValues as IDataObject[]) {
			const table: IPricingTable = {
				name: tableData.name as string,
				items: [],
			};

			if (tableData.itemsUi && (tableData.itemsUi as IDataObject).itemsValues) {
				for (const itemData of (tableData.itemsUi as IDataObject).itemsValues as IDataObject[]) {
					table.items?.push({
						name: itemData.name as string,
						description: itemData.description as string,
						price: itemData.price as number,
						qty: itemData.qty as number,
					});
				}
			}
			pricing.tables?.push(table);
		}
	}

	// Process content placeholders
	const content_placeholders: IDocumentContentPlaceholder[] = [];
	if (
		options.contentPlaceholdersUi &&
		(options.contentPlaceholdersUi as IDataObject).contentPlaceholdersValues
	) {
		for (const placeholderData of (options.contentPlaceholdersUi as IDataObject)
			.contentPlaceholdersValues as IDataObject[]) {
			let content;
			try {
				content = JSON.parse(placeholderData.content as string);
			} catch (err) {
				throw new NodeApiError(this.getNode(), { message: 'Content must be a valid JSON array' });
			}
			content_placeholders.push({
				block_id: placeholderData.block_id as string,
				content,
			});
		}
	}

	// Build request body
	const body: IDataObject = {
		template_uuid: templateId,
		name,
		recipients,
	};

	if (Object.keys(metadata).length > 0) {
		body.metadata = metadata;
	}

	if (tags.length > 0) {
		body.tags = tags;
	}

	if (pricing.tables && pricing.tables.length > 0) {
		body.pricing_tables = pricing.tables;
	}

	if (content_placeholders.length > 0) {
		body.content_placeholders = content_placeholders;
	}

	if (options.folder_uuid) {
		body.folder_uuid = options.folder_uuid as string;
	}

	const response = await pandaDocApiRequest.call(this, 'POST', '/documents', body);
	return this.helpers.returnJsonArray(response);
}

/**
 * Create a document from a PDF
 */
export async function createDocumentFromPdf(
	this: IExecuteFunctions,
	i: number,
): Promise<IDataObject[]> {
	const name = this.getNodeParameter('name', i) as string;
	const options = this.getNodeParameter('options', i, {}) as IDataObject;
	const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;

	// Check if binary data exists
	const currentItem = this.getInputData()[i];
	if (currentItem.binary === undefined || currentItem.binary[binaryPropertyName] === undefined) {
		throw new NodeApiError(this.getNode(), {
			message: `No binary data property "${binaryPropertyName}" exists on item`,
		});
	}

	// Process recipients
	const recipientsUi = this.getNodeParameter('recipientsUi', i, {}) as IDataObject;
	const recipients: IDocumentRecipient[] = [];
	if (recipientsUi && recipientsUi.recipientsValues) {
		for (const recipientValue of recipientsUi.recipientsValues as IDataObject[]) {
			const recipient: IDocumentRecipient = {
				email: recipientValue.email as string,
			};
			if (recipientValue.first_name) recipient.first_name = recipientValue.first_name as string;
			if (recipientValue.last_name) recipient.last_name = recipientValue.last_name as string;
			if (recipientValue.role) recipient.role = recipientValue.role as string;
			if (recipientValue.signing_order)
				recipient.signing_order = recipientValue.signing_order as number;
			recipients.push(recipient);
		}
	}

	// Process metadata
	const metadata: IDocumentMetadata = {};
	if (options.metadataUi && (options.metadataUi as IDataObject).metadataValues) {
		for (const metadataItem of (options.metadataUi as IDataObject)
			.metadataValues as IDataObject[]) {
			metadata[metadataItem.key as string] = metadataItem.value as string;
		}
	}

	// Process tags
	const tags: string[] = [];
	if (options.tags) {
		const tagsString = options.tags as string;
		const tagsList = tagsString.split(',');
		for (const tag of tagsList) {
			tags.push(tag.trim());
		}
	}

	const inputItem = this.getInputData()[i];
	const binaryData = inputItem.binary as IBinaryKeyData;
	const binaryProperty = binaryData[binaryPropertyName];
	const binaryDataBuffer = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);

	// Prepare form data for file upload
	const formData = {
		file: {
			value: binaryDataBuffer,
			options: {
				filename: binaryProperty.fileName || 'document.pdf',
				contentType: binaryProperty.mimeType || 'application/pdf',
			},
		},
		data: {
			value: JSON.stringify({
				name,
				recipients,
				tags,
				metadata,
				parse_form_fields: options.parse_form_fields || false,
				folder_uuid: options.folder_uuid,
			}),
			options: {
				contentType: 'application/json',
			},
		},
	};

	const response = await pandaDocApiRequest.call(
		this,
		'POST',
		'/documents/upload',
		{},
		{},
		undefined,
		{ formData },
	);
	return this.helpers.returnJsonArray(response);
}

/**
 * Send a document
 */
export async function sendDocument(this: IExecuteFunctions, i: number): Promise<IDataObject[]> {
	const documentId = getDocumentId.call(this, i);
	const options = this.getNodeParameter('options', i, {}) as IDataObject;

	const body: IDataObject = {};

	if (options.subject) body.subject = options.subject as string;
	if (options.message) body.message = options.message as string;
	if (options.silent) body.silent = options.silent as boolean;
	if (options.sender) body.sender = options.sender as string;

	const response = await pandaDocApiRequest.call(
		this,
		'POST',
		`/documents/${documentId}/send`,
		body,
	);
	return this.helpers.returnJsonArray(response);
}

/**
 * Download a document
 */
export async function downloadDocument(
	this: IExecuteFunctions,
	i: number,
): Promise<INodeExecutionData[]> {
	const documentId = getDocumentId.call(this, i);
	const format = this.getNodeParameter('format', i) as string;
	const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;

	const downloadUrl = `/documents/${documentId}/download?format=${format}`;
	const buffer = await pandaDocApiRequest.call(this, 'GET', downloadUrl, {}, {}, undefined, {
		encoding: null,
		json: false,
		resolveWithFullResponse: true,
	});

	const contentDisposition = buffer.headers['content-disposition'];
	const filename = contentDisposition
		? contentDisposition.match(/filename="?([^"]+)"?/)[1]
		: `document.${format}`;

	const binaryData = await this.helpers.prepareBinaryData(
		buffer.body,
		filename,
		format === 'pdf' ? 'application/pdf' : 'application/octet-stream',
	);

	const downloadItem = this.getInputData()[i];
	return [
		{
			json: downloadItem.json,
			binary: {
				...(downloadItem.binary || {}),
				[binaryPropertyName]: binaryData,
			},
			pairedItem: downloadItem.pairedItem,
		},
	];
}

/**
 * Delete a document
 */
export async function deleteDocument(this: IExecuteFunctions, i: number): Promise<IDataObject[]> {
	const documentId = getDocumentId.call(this, i);

	try {
		await pandaDocApiRequest.call(this, 'DELETE', `/documents/${documentId}`);
		return [{ json: { success: true, documentId } }];
	} catch (error) {
		if (error.statusCode === 404) {
			throw new NodeApiError(this.getNode(), { message: `Document with ID ${documentId} not found` });
		}
		throw error;
	}
}

/**
 * Update document properties
 */
export async function updateDocument(this: IExecuteFunctions, i: number): Promise<IDataObject[]> {
	const documentId = getDocumentId.call(this, i);
	const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;

	const body: IDataObject = {};

	// Handle name update
	if (updateFields.name) {
		body.name = updateFields.name as string;
	}

	// Handle metadata update
	if (updateFields.metadataUi && (updateFields.metadataUi as IDataObject).metadataValues) {
		const metadata: IDocumentMetadata = {};
		for (const metadataItem of (updateFields.metadataUi as IDataObject)
			.metadataValues as IDataObject[]) {
			metadata[metadataItem.key as string] = metadataItem.value as string;
		}
		body.metadata = metadata;
	}

	// Handle folder update
	if (updateFields.folder_uuid) {
		body.folder_uuid = updateFields.folder_uuid as string;
	}

	// Only proceed if there's something to update
	if (Object.keys(body).length === 0) {
		throw new NodeApiError(this.getNode(), { message: 'Please specify at least one property to update' });
	}

	try {
		const response = await pandaDocApiRequest.call(this, 'PATCH', `/documents/${documentId}`, body);
		return this.helpers.returnJsonArray(response);
	} catch (error) {
		if (error.statusCode === 404) {
			throw new NodeApiError(this.getNode(), { message: `Document with ID ${documentId} not found` });
		}
		throw error;
	}
}

/**
 * Create a document share link
 */
export async function createDocumentLink(this: IExecuteFunctions, i: number): Promise<IDataObject[]> {
	const documentId = getDocumentId.call(this, i);
	const options = this.getNodeParameter('options', i, {}) as IDataObject;

	const body: IDataObject = {
		recipient: options.recipient || '',
		// Default 7 days
		lifetime: options.lifetime ? parseInt(options.lifetime as string, 10) : 604800,
	};

	if (options.expiration_date) {
		body.expiration_date = options.expiration_date as string;
	}

	try {
		const response = await pandaDocApiRequest.call(this, 'POST', `/documents/${documentId}/session`, body);
		return this.helpers.returnJsonArray(response);
	} catch (error) {
		if (error.statusCode === 404) {
			throw new NodeApiError(this.getNode(), { message: `Document with ID ${documentId} not found` });
		}
		throw error;
	}
}
