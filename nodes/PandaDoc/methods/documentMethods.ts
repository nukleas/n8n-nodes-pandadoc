import type { IDataObject, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import {
	buildMultipartBody,
	collectMetadata,
	compact,
	getMany,
	pandaDocApiRequest,
	splitTags,
} from '../../../shared/GenericFunctions';
import type {
	IDocumentContentPlaceholder,
	IDocumentRecipient,
	IPricingTable,
} from '../../../shared/Interfaces';

function getDocumentId(this: IExecuteFunctions, i: number): string {
	return this.getNodeParameter('documentId', i, undefined, { extractValue: true }) as string;
}

function collectRecipients(recipientsUi: IDataObject): IDocumentRecipient[] {
	return ((recipientsUi.recipientsValues as IDataObject[] | undefined) ?? []).map(
		(value) =>
			compact({
				email: value.email,
				first_name: value.first_name,
				last_name: value.last_name,
				role: value.role,
				signing_order: value.signing_order,
			}) as unknown as IDocumentRecipient,
	);
}

function collectPricingTables(pricingTablesUi: IDataObject | undefined): IPricingTable[] {
	return ((pricingTablesUi?.pricingTablesValues as IDataObject[] | undefined) ?? []).map(
		(table) => ({
			name: table.name as string,
			items: (((table.itemsUi as IDataObject)?.itemsValues as IDataObject[] | undefined) ?? []).map(
				(item) => ({
					name: item.name as string,
					description: item.description as string,
					price: item.price as number,
					qty: item.qty as number,
				}),
			),
		}),
	);
}

function collectContentPlaceholders(
	this: IExecuteFunctions,
	i: number,
	contentPlaceholdersUi: IDataObject | undefined,
): IDocumentContentPlaceholder[] {
	const values =
		(contentPlaceholdersUi?.contentPlaceholdersValues as IDataObject[] | undefined) ?? [];
	return values.map((placeholder) => {
		const raw = placeholder.content;
		let content: unknown;
		try {
			content = typeof raw === 'string' ? JSON.parse(raw) : raw;
		} catch {
			throw new NodeOperationError(
				this.getNode(),
				`Content for block "${placeholder.block_id}" must be a valid JSON array`,
				{ itemIndex: i },
			);
		}
		if (!Array.isArray(content)) {
			throw new NodeOperationError(
				this.getNode(),
				`Content for block "${placeholder.block_id}" must be a JSON array`,
				{ itemIndex: i },
			);
		}
		return { block_id: placeholder.block_id as string, content };
	});
}

export async function getAllDocuments(this: IExecuteFunctions, i: number) {
	return await getMany.call(this, i, '/documents');
}

export async function getDocument(this: IExecuteFunctions, i: number) {
	const documentId = getDocumentId.call(this, i);
	return (await pandaDocApiRequest.call(
		this,
		'GET',
		`/documents/${documentId}/details`,
	)) as IDataObject;
}

export async function getDocumentStatus(this: IExecuteFunctions, i: number) {
	const documentId = getDocumentId.call(this, i);
	return (await pandaDocApiRequest.call(this, 'GET', `/documents/${documentId}`)) as IDataObject;
}

export async function createDocumentFromTemplate(this: IExecuteFunctions, i: number) {
	const templateId = this.getNodeParameter('templateId', i, undefined, {
		extractValue: true,
	}) as string;
	const name = this.getNodeParameter('name', i) as string;
	const recipientsUi = this.getNodeParameter('recipientsUi', i, {}) as IDataObject;
	const options = this.getNodeParameter('options', i, {}) as IDataObject;

	const metadata = collectMetadata(options.metadataUi as IDataObject | undefined);
	const tags = splitTags(options.tags as string | undefined);
	const pricingTables = collectPricingTables(options.pricingTablesUi as IDataObject | undefined);
	const contentPlaceholders = collectContentPlaceholders.call(
		this,
		i,
		options.contentPlaceholdersUi as IDataObject | undefined,
	);

	const body: IDataObject = {
		template_uuid: templateId,
		name,
		recipients: collectRecipients(recipientsUi),
	};
	if (Object.keys(metadata).length > 0) body.metadata = metadata;
	if (tags.length > 0) body.tags = tags;
	if (pricingTables.length > 0) body.pricing_tables = pricingTables;
	if (contentPlaceholders.length > 0) body.content_placeholders = contentPlaceholders;
	if (options.folder_uuid) body.folder_uuid = options.folder_uuid as string;

	return (await pandaDocApiRequest.call(this, 'POST', '/documents', body)) as IDataObject;
}

export async function createDocumentFromPdf(this: IExecuteFunctions, i: number) {
	const name = this.getNodeParameter('name', i) as string;
	const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
	const recipientsUi = this.getNodeParameter('recipientsUi', i, {}) as IDataObject;
	const options = this.getNodeParameter('options', i, {}) as IDataObject;

	const binaryData = this.helpers.assertBinaryData(i, binaryPropertyName);
	const fileBuffer = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);

	const data = compact({
		name,
		recipients: collectRecipients(recipientsUi),
		tags: splitTags(options.tags as string | undefined),
		metadata: collectMetadata(options.metadataUi as IDataObject | undefined),
		parse_form_fields: options.parse_form_fields === true,
		folder_uuid: options.folder_uuid,
	});

	const { body, contentType } = buildMultipartBody([
		{
			name: 'File',
			value: fileBuffer,
			filename: binaryData.fileName ?? 'document.pdf',
			contentType: binaryData.mimeType ?? 'application/pdf',
		},
		{ name: 'Data', value: JSON.stringify(data), contentType: 'application/json' },
	]);

	// PandaDoc distinguishes multipart uploads from JSON creation by the `upload` query flag.
	return (await pandaDocApiRequest.call(
		this,
		'POST',
		'/documents',
		body,
		{ upload: '' },
		{ headers: { 'Content-Type': contentType } },
	)) as IDataObject;
}

export async function sendDocument(this: IExecuteFunctions, i: number) {
	const documentId = getDocumentId.call(this, i);
	const options = this.getNodeParameter('options', i, {}) as IDataObject;
	const body = compact({
		subject: options.subject,
		message: options.message,
		silent: options.silent,
		sender: options.sender,
	});
	return (await pandaDocApiRequest.call(
		this,
		'POST',
		`/documents/${documentId}/send`,
		body,
	)) as IDataObject;
}

export async function downloadDocument(
	this: IExecuteFunctions,
	i: number,
): Promise<INodeExecutionData[]> {
	const documentId = getDocumentId.call(this, i);
	const format = this.getNodeParameter('format', i) as string;
	const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;

	const response = (await pandaDocApiRequest.call(
		this,
		'GET',
		`/documents/${documentId}/download`,
		undefined,
		{ format },
		{ encoding: 'arraybuffer', returnFullResponse: true, json: false },
	)) as { body: Buffer | ArrayBuffer; headers: Record<string, string | undefined> };

	const contentDisposition = response.headers['content-disposition'] ?? '';
	const filename = /filename="?([^";]+)"?/.exec(contentDisposition)?.[1] ?? `document.${format}`;
	const mimeType = format === 'pdf' ? 'application/pdf' : 'application/octet-stream';
	const binary = await this.helpers.prepareBinaryData(
		Buffer.from(response.body as ArrayBuffer),
		filename,
		mimeType,
	);

	const item = this.getInputData()[i];
	return [
		{
			json: item.json,
			binary: { ...(item.binary ?? {}), [binaryPropertyName]: binary },
			pairedItem: { item: i },
		},
	];
}

export async function deleteDocument(this: IExecuteFunctions, i: number) {
	const documentId = getDocumentId.call(this, i);
	await pandaDocApiRequest.call(this, 'DELETE', `/documents/${documentId}`);
	return { success: true, documentId };
}

export async function updateDocument(this: IExecuteFunctions, i: number) {
	const documentId = getDocumentId.call(this, i);
	const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;

	const body = compact({ name: updateFields.name, folder_uuid: updateFields.folder_uuid });
	const metadata = collectMetadata(updateFields.metadataUi as IDataObject | undefined);
	if (Object.keys(metadata).length > 0) body.metadata = metadata;

	if (Object.keys(body).length === 0) {
		throw new NodeOperationError(this.getNode(), 'Specify at least one field to update', {
			itemIndex: i,
		});
	}

	return (await pandaDocApiRequest.call(
		this,
		'PATCH',
		`/documents/${documentId}`,
		body,
	)) as IDataObject;
}

export async function createDocumentLink(this: IExecuteFunctions, i: number) {
	const documentId = getDocumentId.call(this, i);
	const options = this.getNodeParameter('options', i, {}) as IDataObject;

	const body: IDataObject = {
		recipient: options.recipient ?? '',
		lifetime: options.lifetime ?? 604800,
	};
	if (options.expiration_date) body.expiration_date = options.expiration_date as string;

	return (await pandaDocApiRequest.call(
		this,
		'POST',
		`/documents/${documentId}/session`,
		body,
	)) as IDataObject;
}
