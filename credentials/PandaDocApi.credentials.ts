import {
	ICredentialDataDecryptedObject,
	ICredentialType,
	IHttpRequestOptions,
	INodeProperties,
	IAuthenticate,
	Icon,
} from 'n8n-workflow';

export class PandaDocApi implements ICredentialType {
	name = 'pandaDocApi';
	displayName = 'PandaDoc API';
	documentationUrl = 'https://developers.pandadoc.com/reference/api-key-authentication-process';
	icon: Icon = {
		light: 'file:pandadoc.svg',
		dark: 'file:pandadoc.svg',
	};
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'Your PandaDoc API key. You can find this in your PandaDoc Developer Dashboard.',
		},
		{
			displayName: 'Use Sandbox',
			name: 'useSandbox',
			type: 'boolean',
			default: false,
			description: 'Whether to use the sandbox environment for testing.',
		},
	];

	// This allows the credential to be used by other parts of n8n
	authenticate: IAuthenticate = async (
		credentials: ICredentialDataDecryptedObject,
		requestOptions: IHttpRequestOptions,
	): Promise<IHttpRequestOptions> => {
		requestOptions.headers = {
			...requestOptions.headers,
			Authorization: `API-Key ${credentials.apiKey}`,
		};
		return requestOptions;
	};
}
