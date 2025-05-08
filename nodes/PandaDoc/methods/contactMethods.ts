import {
	IExecuteFunctions,
	IDataObject,
	NodeApiError,
} from 'n8n-workflow';

import { pandaDocApiRequest, getAllResourceItems } from '../../../shared/GenericFunctions';

/**
 * Get all contacts with optional filtering using shared function
 */
export async function getAllContacts(
	this: IExecuteFunctions,
	i: number,
): Promise<IDataObject[]> {
	const filters = this.getNodeParameter('filters', i, {}) as IDataObject;

	// Use the shared function to reduce code duplication
	return getAllResourceItems.call(
		this,
		i,
		'/contacts',
		'contacts',
		filters,
	) as Promise<IDataObject[]>;
}

/**
 * Get a specific contact by ID
 */
export async function getContact(
	this: IExecuteFunctions,
	i: number,
): Promise<IDataObject[]> {
	const contactId = this.getNodeParameter('contactId', i) as string;

	try {
		const response = await pandaDocApiRequest.call(this, 'GET', `/contacts/${contactId}`);
		return this.helpers.returnJsonArray(response);
	} catch (error) {
		if (error.statusCode === 404) {
			throw new NodeApiError(this.getNode(), { message: `Contact with ID ${contactId} not found` });
		}
		throw error;
	}
}

/**
 * Create a new contact
 */
export async function createContact(
	this: IExecuteFunctions,
	i: number,
): Promise<IDataObject[]> {
	const email = this.getNodeParameter('email', i) as string;
	const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;
	
	const body: IDataObject = {
		email,
	};

	// Add additional fields if present
	if (additionalFields.first_name !== undefined) {
		body.first_name = additionalFields.first_name as string;
	}
	if (additionalFields.last_name !== undefined) {
		body.last_name = additionalFields.last_name as string;
	}
	if (additionalFields.company !== undefined) {
		body.company = additionalFields.company as string;
	}
	if (additionalFields.job_title !== undefined) {
		body.job_title = additionalFields.job_title as string;
	}
	if (additionalFields.phone !== undefined) {
		body.phone = additionalFields.phone as string;
	}
	if (additionalFields.country !== undefined) {
		body.country = additionalFields.country as string;
	}
	if (additionalFields.state !== undefined) {
		body.state = additionalFields.state as string;
	}
	if (additionalFields.postal_code !== undefined) {
		body.postal_code = additionalFields.postal_code as string;
	}
	if (additionalFields.address_line_1 !== undefined) {
		body.address_line_1 = additionalFields.address_line_1 as string;
	}
	if (additionalFields.address_line_2 !== undefined) {
		body.address_line_2 = additionalFields.address_line_2 as string;
	}

	// Process metadata if provided
	if (additionalFields.metadataUi && (additionalFields.metadataUi as IDataObject).metadataValues) {
		const metadata: IDataObject = {};
		for (const metadataItem of (additionalFields.metadataUi as IDataObject)
			.metadataValues as IDataObject[]) {
			metadata[metadataItem.key as string] = metadataItem.value;
		}
		body.metadata = metadata;
	}

	try {
		const response = await pandaDocApiRequest.call(this, 'POST', '/contacts', body);
		return this.helpers.returnJsonArray(response);
	} catch (error) {
		if (error.statusCode === 400) {
			throw new NodeApiError(this.getNode(), { message: 'Invalid contact data. Check required fields.' });
		} else if (error.statusCode === 409) {
			throw new NodeApiError(this.getNode(), { message: 'Contact with this email already exists.' });
		}
		throw error;
	}
}

/**
 * Update a contact
 */
export async function updateContact(
	this: IExecuteFunctions,
	i: number,
): Promise<IDataObject[]> {
	const contactId = this.getNodeParameter('contactId', i) as string;
	const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;
	
	const body: IDataObject = {};

	// Ensure at least one field is being updated
	if (Object.keys(updateFields).length === 0) {
		throw new NodeApiError(this.getNode(), { message: 'Please specify at least one field to update.' });
	}

	// Add fields to update
	if (updateFields.email !== undefined) {
		body.email = updateFields.email as string;
	}
	if (updateFields.first_name !== undefined) {
		body.first_name = updateFields.first_name as string;
	}
	if (updateFields.last_name !== undefined) {
		body.last_name = updateFields.last_name as string;
	}
	if (updateFields.company !== undefined) {
		body.company = updateFields.company as string;
	}
	if (updateFields.job_title !== undefined) {
		body.job_title = updateFields.job_title as string;
	}
	if (updateFields.phone !== undefined) {
		body.phone = updateFields.phone as string;
	}
	if (updateFields.country !== undefined) {
		body.country = updateFields.country as string;
	}
	if (updateFields.state !== undefined) {
		body.state = updateFields.state as string;
	}
	if (updateFields.postal_code !== undefined) {
		body.postal_code = updateFields.postal_code as string;
	}
	if (updateFields.address_line_1 !== undefined) {
		body.address_line_1 = updateFields.address_line_1 as string;
	}
	if (updateFields.address_line_2 !== undefined) {
		body.address_line_2 = updateFields.address_line_2 as string;
	}

	// Process metadata if provided
	if (updateFields.metadataUi && (updateFields.metadataUi as IDataObject).metadataValues) {
		const metadata: IDataObject = {};
		for (const metadataItem of (updateFields.metadataUi as IDataObject)
			.metadataValues as IDataObject[]) {
			metadata[metadataItem.key as string] = metadataItem.value;
		}
		body.metadata = metadata;
	}

	try {
		const response = await pandaDocApiRequest.call(this, 'PATCH', `/contacts/${contactId}`, body);
		return this.helpers.returnJsonArray(response);
	} catch (error) {
		if (error.statusCode === 404) {
			throw new NodeApiError(this.getNode(), { message: `Contact with ID ${contactId} not found` });
		} else if (error.statusCode === 409) {
			throw new NodeApiError(this.getNode(), { message: 'Email already in use by another contact.' });
		}
		throw error;
	}
}

/**
 * Delete a contact
 */
export async function deleteContact(
	this: IExecuteFunctions,
	i: number,
): Promise<IDataObject[]> {
	const contactId = this.getNodeParameter('contactId', i) as string;

	try {
		await pandaDocApiRequest.call(this, 'DELETE', `/contacts/${contactId}`);
		return this.helpers.returnJsonArray({ success: true, contactId });
	} catch (error) {
		if (error.statusCode === 404) {
			throw new NodeApiError(this.getNode(), { message: `Contact with ID ${contactId} not found` });
		}
		throw error;
	}
}
