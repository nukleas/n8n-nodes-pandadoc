import { IExecuteFunctions, IDataObject, NodeApiError } from 'n8n-workflow';

import { pandaDocApiRequest, getAllResourceItems } from '../../../shared/GenericFunctions';

/**
 * Helper function to extract folder ID from resource locator
 */
function getFolderId(
	this: IExecuteFunctions,
	i: number,
	parameterName: string = 'folderId',
): string {
	const folderIdSource = this.getNodeParameter(parameterName, i) as IDataObject;
	let folderId: string;

	if (folderIdSource.mode === 'list' || folderIdSource.mode === 'id') {
		folderId = folderIdSource.value as string;
	} else if (folderIdSource.mode === 'none') {
		folderId = '';
	} else {
		folderId = folderIdSource.value as string;
	}

	return folderId;
}

/**
 * Get all folders with optional filtering using shared function
 */
export async function getAllFolders(this: IExecuteFunctions, i: number): Promise<IDataObject[]> {
	const filters = this.getNodeParameter('filters', i, {}) as IDataObject;

	// Use the shared function to reduce code duplication
	return getAllResourceItems.call(this, i, '/documents/folders', 'folders', filters) as Promise<
		IDataObject[]
	>;
}

/**
 * Get a specific folder by ID
 */
export async function getFolder(this: IExecuteFunctions, i: number): Promise<IDataObject[]> {
	const folderId = getFolderId.call(this, i, 'folderId');

	try {
		const response = await pandaDocApiRequest.call(this, 'GET', `/documents/folders/${folderId}`);
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
export async function createFolder(this: IExecuteFunctions, i: number): Promise<IDataObject[]> {
	const name = this.getNodeParameter('name', i) as string;
	const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

	const body: IDataObject = {
		name,
	};

	// Add parent folder if specified
	if (additionalFields.parent_uuid) {
		// Extract parent folder ID from resource locator if present
		const parentFolderSource = additionalFields.parent_uuid as IDataObject;
		if (
			parentFolderSource &&
			typeof parentFolderSource === 'object' &&
			'mode' in parentFolderSource
		) {
			if (parentFolderSource.mode === 'none') {
				// If 'none' selected, don't set parent_uuid
				delete additionalFields.parent_uuid;
			} else if (parentFolderSource.mode === 'list' || parentFolderSource.mode === 'id') {
				body.parent_uuid = parentFolderSource.value as string;
			}
		} else {
			body.parent_uuid = additionalFields.parent_uuid as string;
		}
	}

	try {
		const response = await pandaDocApiRequest.call(this, 'POST', '/documents/folders', body);
		return this.helpers.returnJsonArray(response);
	} catch (error) {
		if (error.statusCode === 400) {
			throw new NodeApiError(this.getNode(), {
				message: 'Invalid folder data. Check folder name and parent folder ID.',
			});
		}
		throw error;
	}
}

/**
 * Delete a folder
 */
export async function deleteFolder(this: IExecuteFunctions, i: number): Promise<IDataObject[]> {
	const folderId = getFolderId.call(this, i, 'folderId');

	try {
		await pandaDocApiRequest.call(this, 'DELETE', `/documents/folders/${folderId}`);
		return this.helpers.returnJsonArray({ success: true, folderId });
	} catch (error) {
		if (error.statusCode === 404) {
			throw new NodeApiError(this.getNode(), { message: `Folder with ID ${folderId} not found` });
		}
		throw error;
	}
}
