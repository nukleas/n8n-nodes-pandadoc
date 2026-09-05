import { randomUUID } from 'node:crypto';
import type {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	ILoadOptionsFunctions,
	IWebhookFunctions,
} from 'n8n-workflow';

import { PANDADOC_API_URL, PANDADOC_PAGE_SIZE } from './Constants';
import type { IDocumentMetadata } from './Interfaces';

export type PandaDocContext =
	| IExecuteFunctions
	| ILoadOptionsFunctions
	| IHookFunctions
	| IWebhookFunctions;

function getCredentialType(this: PandaDocContext): 'pandaDocApi' | 'pandaDocOAuth2Api' {
	return this.getNodeParameter('authentication', 0) === 'oAuth2'
		? 'pandaDocOAuth2Api'
		: 'pandaDocApi';
}

/**
 * Send an authenticated request to the PandaDoc public API. The credential selected
 * in the node's Authentication parameter is applied by n8n.
 */
export async function pandaDocApiRequest(
	this: PandaDocContext,
	method: IHttpRequestMethods,
	endpoint: string,
	body?: IDataObject | IDataObject[] | Buffer,
	qs: IDataObject = {},
	options: Partial<IHttpRequestOptions> = {},
) {
	const requestOptions: IHttpRequestOptions = {
		method,
		url: `${PANDADOC_API_URL}${endpoint}`,
		qs,
		json: true,
		...options,
	};
	if (body !== undefined) {
		requestOptions.body = body;
	}
	return await this.helpers.httpRequestWithAuthentication.call(
		this,
		getCredentialType.call(this),
		requestOptions,
	);
}

/**
 * Page through a PandaDoc list endpoint. Stops early once `limit` items are collected.
 */
export async function pandaDocApiRequestAllItems(
	this: PandaDocContext,
	endpoint: string,
	qs: IDataObject = {},
	limit?: number,
): Promise<IDataObject[]> {
	const items: IDataObject[] = [];
	let page = 1;
	let batch: IDataObject[];
	do {
		const response = (await pandaDocApiRequest.call(this, 'GET', endpoint, undefined, {
			...qs,
			page,
			count: PANDADOC_PAGE_SIZE,
		})) as { results?: IDataObject[] };
		batch = response.results ?? [];
		items.push(...batch);
		page += 1;
	} while (batch.length === PANDADOC_PAGE_SIZE && (limit === undefined || items.length < limit));

	return limit === undefined ? items : items.slice(0, limit);
}

/**
 * Shared implementation of every "Get Many" operation: reads `filters`, `returnAll`
 * and `limit` from the node parameters and lists `endpoint`.
 */
export async function getMany(
	this: IExecuteFunctions,
	i: number,
	endpoint: string,
): Promise<IDataObject[]> {
	const filters = compact(this.getNodeParameter('filters', i, {}) as IDataObject);
	const returnAll = this.getNodeParameter('returnAll', i) as boolean;
	const limit = returnAll ? undefined : (this.getNodeParameter('limit', i) as number);
	return await pandaDocApiRequestAllItems.call(this, endpoint, filters, limit);
}

/** Drop empty-string, null and undefined entries so they are not sent to the API. */
export function compact(data: IDataObject): IDataObject {
	return Object.fromEntries(
		Object.entries(data).filter(
			([, value]) => value !== '' && value !== null && value !== undefined,
		),
	);
}

/** Convert a Metadata fixedCollection (`{ metadataValues: [{ key, value }] }`) into a map. */
export function collectMetadata(metadataUi: IDataObject | undefined): IDocumentMetadata {
	const metadata: IDocumentMetadata = {};
	for (const item of (metadataUi?.metadataValues as IDataObject[] | undefined) ?? []) {
		metadata[item.key as string] = item.value as string;
	}
	return metadata;
}

/** Split a comma separated tag string into trimmed, non-empty tags. */
export function splitTags(tags: string | undefined): string[] {
	return (tags ?? '')
		.split(',')
		.map((tag) => tag.trim())
		.filter((tag) => tag.length > 0);
}

export interface IMultipartPart {
	name: string;
	value: string | Buffer;
	filename?: string;
	contentType?: string;
}

/**
 * Build a multipart/form-data body without depending on the `form-data` package,
 * which verified community nodes are not allowed to ship.
 */
export function buildMultipartBody(parts: IMultipartPart[]): {
	body: Buffer;
	contentType: string;
} {
	const boundary = `----n8n-pandadoc-${randomUUID()}`;
	const chunks: Buffer[] = [];
	for (const part of parts) {
		let header = `--${boundary}\r\nContent-Disposition: form-data; name="${part.name}"`;
		if (part.filename) {
			header += `; filename="${part.filename}"`;
		}
		header += '\r\n';
		if (part.contentType) {
			header += `Content-Type: ${part.contentType}\r\n`;
		}
		header += '\r\n';
		chunks.push(
			Buffer.from(header),
			Buffer.isBuffer(part.value) ? part.value : Buffer.from(part.value),
			Buffer.from('\r\n'),
		);
	}
	chunks.push(Buffer.from(`--${boundary}--\r\n`));
	return {
		body: Buffer.concat(chunks),
		contentType: `multipart/form-data; boundary=${boundary}`,
	};
}
