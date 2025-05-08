import {
	IExecuteFunctions,
	IDataObject,
	NodeApiError,
} from 'n8n-workflow';

import { pandaDocApiRequest, getAllResourceItems } from '../../../shared/GenericFunctions';

/**
 * Get all folders with optional filtering using shared function
 */
export async function getAllFolders(
	this: IExecuteFunctions,
	i: number,
): Promise<IDataObject[]> {
	const filters = this.getNodeParameter('filters', i, {}) as IDataObject;

	// Use the shared function to reduce code duplication
	return getAllResourceItems.call(
		this,
		i,
		'/folders',
		'folders',
		filters,
	) as Promise<IDataObject[]>;
}

/**
 * Get a specific folder by ID
 */
export async function getFolder(
	this: IExecuteFunctions,
	i: number,
): Promise<IDataObject[]> {
	const folderId = this.getNodeParameter('folderId', i) as string;

	try {
		const response = await pandaDocApiRequest.call(this, 'GET', `/folders/${folderId}`);
		return this.helpers.returnJsonArray(response);
	} catch (error) {
		if (error.statusCode === 404) {
			throw new NodeApiError(this.getNode(), { message: `Folder with ID ${folderId} not found` });
		}
		throw error;
	}
}

/**
 * Create a new folder
 */
export async function createFolder(
	this: IExecuteFunctions,
	i: number,
): Promise<IDataObject[]> {
	const name = this.getNodeParameter('name', i) as string;
	const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;
	
	const body: IDataObject = {
		name,
	};

	// Add parent folder if specified
	if (additionalFields.parent_uuid) {
		body.parent_uuid = additionalFields.parent_uuid as string;
	}

	try {
		const response = await pandaDocApiRequest.call(this, 'POST', '/folders', body);
		return this.helpers.returnJsonArray(response);
	} catch (error) {
		if (error.statusCode === 400) {
			throw new NodeApiError(this.getNode(), { message: 'Invalid folder data. Check folder name and parent folder ID.' });
		}
		throw error;
	}
}

/**
 * Delete a folder
 */
export async function deleteFolder(
	this: IExecuteFunctions,
	i: number,
): Promise<IDataObject[]> {
	const folderId = this.getNodeParameter('folderId', i) as string;

	try {
		await pandaDocApiRequest.call(this, 'DELETE', `/folders/${folderId}`);
		return this.helpers.returnJsonArray({ success: true, folderId });
	} catch (error) {
		if (error.statusCode === 404) {
			throw new NodeApiError(this.getNode(), { message: `Folder with ID ${folderId} not found` });
		}
		throw error;
	}
}
