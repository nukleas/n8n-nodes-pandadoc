import type {
	IDataObject,
	ILoadOptionsFunctions,
	INodeListSearchItems,
	INodeListSearchResult,
} from 'n8n-workflow';

import { PANDADOC_APP_URL } from '../../../shared/Constants';
import { pandaDocApiRequest } from '../../../shared/GenericFunctions';

const SEARCH_PAGE_SIZE = 50;

async function searchPaged(
	this: ILoadOptionsFunctions,
	endpoint: string,
	toItem: (result: IDataObject) => INodeListSearchItems,
	filter?: string,
	paginationToken?: string,
): Promise<INodeListSearchResult> {
	const page = paginationToken ? parseInt(paginationToken, 10) : 1;
	const qs: IDataObject = { page, count: SEARCH_PAGE_SIZE, deleted: false };
	if (filter) {
		qs.q = filter;
	}
	const response = (await pandaDocApiRequest.call(this, 'GET', endpoint, undefined, qs)) as {
		results?: IDataObject[];
	};
	const results = response.results ?? [];
	return {
		results: results.map(toItem),
		paginationToken: results.length === SEARCH_PAGE_SIZE ? String(page + 1) : undefined,
	};
}

function formatDate(value: unknown): string {
	return typeof value === 'string' ? new Date(value).toLocaleDateString() : 'N/A';
}

export async function searchDocuments(
	this: ILoadOptionsFunctions,
	filter?: string,
	paginationToken?: string,
): Promise<INodeListSearchResult> {
	return await searchPaged.call(
		this,
		'/documents',
		(document) => ({
			name: document.status ? `${document.name} (${document.status})` : String(document.name),
			value: document.id as string,
			url: `${PANDADOC_APP_URL}/documents/${document.id}`,
			description: `Modified: ${formatDate(document.date_modified)}`,
		}),
		filter,
		paginationToken,
	);
}

export async function searchTemplates(
	this: ILoadOptionsFunctions,
	filter?: string,
	paginationToken?: string,
): Promise<INodeListSearchResult> {
	return await searchPaged.call(
		this,
		'/templates',
		(template) => ({
			name: String(template.name),
			value: template.id as string,
			url: `${PANDADOC_APP_URL}/templates/${template.id}`,
			description: `Created: ${formatDate(template.date_created)}`,
		}),
		filter,
		paginationToken,
	);
}

export async function searchFolders(
	this: ILoadOptionsFunctions,
	filter?: string,
	paginationToken?: string,
): Promise<INodeListSearchResult> {
	return await searchPaged.call(
		this,
		'/documents/folders',
		(folder) => ({
			name: String(folder.name),
			value: folder.uuid as string,
			description: folder.shared ? 'Shared folder' : 'Private folder',
		}),
		filter,
		paginationToken,
	);
}
