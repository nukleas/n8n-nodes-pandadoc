import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';

import { getMany, pandaDocApiRequest } from '../../../shared/GenericFunctions';

export async function getAllTemplates(this: IExecuteFunctions, i: number) {
	return await getMany.call(this, i, '/templates');
}

export async function getTemplate(this: IExecuteFunctions, i: number) {
	const templateId = this.getNodeParameter('templateId', i, undefined, {
		extractValue: true,
	}) as string;
	return (await pandaDocApiRequest.call(
		this,
		'GET',
		`/templates/${templateId}/details`,
	)) as IDataObject;
}
