import { IExecuteFunctions, IDataObject, NodeApiError } from 'n8n-workflow';

import { pandaDocApiRequest, getAllResourceItems } from '../../../shared/GenericFunctions';

/**
 * Get all templates with optional filtering using shared function
 */
export async function getAllTemplates(this: IExecuteFunctions, i: number): Promise<IDataObject[]> {
	const filters = this.getNodeParameter('filters', i, {}) as IDataObject;

	// Use the shared function to reduce code duplication
	return getAllResourceItems.call(this, i, '/templates', 'templates', filters) as Promise<
		IDataObject[]
	>;
}

/**
 * Helper function to extract template ID from resource locator
 */
export function getTemplateId(this: IExecuteFunctions, i: number): string {
	const templateIdSource = this.getNodeParameter('templateId', i) as IDataObject;
	let templateId: string;

	// Extract template ID based on the resource locator mode
	if (templateIdSource.mode === 'list') {
		templateId = templateIdSource.value as string;
	} else {
		// 'id' mode - direct ID entry
		templateId = templateIdSource.value as string;
	}

	return templateId;
}

/**
 * Get a specific template by ID
 */
export async function getTemplate(this: IExecuteFunctions, i: number): Promise<IDataObject[]> {
	const templateId = getTemplateId.call(this, i);

	try {
		const response = await pandaDocApiRequest.call(this, 'GET', `/templates/${templateId}`);
		return this.helpers.returnJsonArray(response);
	} catch (error) {
		if (error.statusCode === 404) {
			throw new NodeApiError(this.getNode(), {
				message: `Template with ID ${templateId} not found`,
			});
		}
		throw error;
	}
}
