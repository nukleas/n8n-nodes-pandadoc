import {
	IExecuteFunctions,
	IDataObject,
	NodeApiError,
} from 'n8n-workflow';

import { pandaDocApiRequest, getAllResourceItems } from '../../../shared/GenericFunctions';

/**
 * Get all templates with optional filtering using shared function
 */
export async function getAllTemplates(
	this: IExecuteFunctions,
	i: number,
): Promise<IDataObject[]> {
	const filters = this.getNodeParameter('filters', i, {}) as IDataObject;

	// Use the shared function to reduce code duplication
	return getAllResourceItems.call(
		this,
		i,
		'/templates',
		'templates',
		filters,
	) as Promise<IDataObject[]>;
}

/**
 * Get a specific template by ID
 */
export async function getTemplate(
	this: IExecuteFunctions,
	i: number,
): Promise<IDataObject[]> {
	const templateId = this.getNodeParameter('templateId', i) as string;

	try {
		const response = await pandaDocApiRequest.call(this, 'GET', `/templates/${templateId}`);
		return this.helpers.returnJsonArray(response);
	} catch (error) {
		if (error.statusCode === 404) {
			throw new NodeApiError(this.getNode(), { message: `Template with ID ${templateId} not found` });
		}
		throw error;
	}
}
