import type { IDataObject, IExecuteFunctions, INodeParameterResourceLocator } from 'n8n-workflow';

import { getMany, pandaDocApiRequest } from '../../../shared/GenericFunctions';

function getFolderId(this: IExecuteFunctions, i: number): string {
	return this.getNodeParameter('folderId', i, undefined, { extractValue: true }) as string;
}

export async function getAllFolders(this: IExecuteFunctions, i: number) {
	return await getMany.call(this, i, '/documents/folders');
}

export async function getFolder(this: IExecuteFunctions, i: number) {
	const folderId = getFolderId.call(this, i);
	return (await pandaDocApiRequest.call(
		this,
		'GET',
		`/documents/folders/${folderId}`,
	)) as IDataObject;
}

export async function createFolder(this: IExecuteFunctions, i: number) {
	const name = this.getNodeParameter('name', i) as string;
	const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

	const body: IDataObject = { name };
	const parent = additionalFields.parent_uuid as INodeParameterResourceLocator | undefined;
	if (parent?.value) {
		body.parent_uuid = parent.value;
	}

	return (await pandaDocApiRequest.call(this, 'POST', '/documents/folders', body)) as IDataObject;
}

export async function deleteFolder(this: IExecuteFunctions, i: number) {
	const folderId = getFolderId.call(this, i);
	await pandaDocApiRequest.call(this, 'DELETE', `/documents/folders/${folderId}`);
	return { success: true, folderId };
}
