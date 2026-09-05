import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import {
	collectMetadata,
	compact,
	getMany,
	pandaDocApiRequest,
} from '../../../shared/GenericFunctions';

function buildContactBody(fields: IDataObject): IDataObject {
	const { metadataUi, ...rest } = fields;
	const body = compact(rest);
	const metadata = collectMetadata(metadataUi as IDataObject | undefined);
	if (Object.keys(metadata).length > 0) body.metadata = metadata;
	return body;
}

export async function getAllContacts(this: IExecuteFunctions, i: number) {
	return await getMany.call(this, i, '/contacts');
}

export async function getContact(this: IExecuteFunctions, i: number) {
	const contactId = this.getNodeParameter('contactId', i) as string;
	return (await pandaDocApiRequest.call(this, 'GET', `/contacts/${contactId}`)) as IDataObject;
}

export async function createContact(this: IExecuteFunctions, i: number) {
	const email = this.getNodeParameter('email', i) as string;
	const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;
	const body = { email, ...buildContactBody(additionalFields) };
	return (await pandaDocApiRequest.call(this, 'POST', '/contacts', body)) as IDataObject;
}

export async function updateContact(this: IExecuteFunctions, i: number) {
	const contactId = this.getNodeParameter('contactId', i) as string;
	const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;
	const body = buildContactBody(updateFields);

	if (Object.keys(body).length === 0) {
		throw new NodeOperationError(this.getNode(), 'Specify at least one field to update', {
			itemIndex: i,
		});
	}

	return (await pandaDocApiRequest.call(
		this,
		'PATCH',
		`/contacts/${contactId}`,
		body,
	)) as IDataObject;
}

export async function deleteContact(this: IExecuteFunctions, i: number) {
	const contactId = this.getNodeParameter('contactId', i) as string;
	await pandaDocApiRequest.call(this, 'DELETE', `/contacts/${contactId}`);
	return { success: true, contactId };
}
