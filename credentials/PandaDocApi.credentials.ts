import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class PandaDocApi implements ICredentialType {
	name = 'pandaDocApi';

	displayName = 'PandaDoc API';

	documentationUrl = 'https://developers.pandadoc.com/reference/api-key-authentication-process';

	icon: Icon = { light: 'file:../icons/pandadoc.svg', dark: 'file:../icons/pandadoc.dark.svg' };

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description:
				'API key from the PandaDoc Developer Dashboard. Use a sandbox key to work against sandbox data.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=API-Key {{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.pandadoc.com/public/v1',
			url: '/members/current',
			method: 'GET',
		},
	};
}
