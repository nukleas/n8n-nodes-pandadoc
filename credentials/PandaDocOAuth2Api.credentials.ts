import {
	ICredentialType,
	INodeProperties,
	Icon,
} from 'n8n-workflow';

export class PandaDocOAuth2Api implements ICredentialType {
	name = 'pandaDocOAuth2Api';
	displayName = 'PandaDoc OAuth2 API';
	extends = ['oAuth2Api'];
	documentationUrl = 'https://developers.pandadoc.com/reference/authentication-process';
	icon: Icon = {
		light: 'file:pandadoc.svg',
		dark: 'file:pandadoc.svg',
	};
	properties: INodeProperties[] = [
		{
			displayName: 'Grant Type',
			name: 'grantType',
			type: 'hidden',
			default: 'authorizationCode',
		},
		{
			displayName: 'Authorization URL',
			name: 'authUrl',
			type: 'string',
			default: 'https://app.pandadoc.com/oauth2/authorize',
			required: true,
		},
		{
			displayName: 'Access Token URL',
			name: 'accessTokenUrl',
			type: 'string',
			default: 'https://api.pandadoc.com/oauth2/access_token',
			required: true,
		},
		{
			displayName: 'Scope',
			name: 'scope',
			type: 'string',
			default: 'read write',
			description: 'Space-separated list of scopes. Leave empty to use the default scope.',
		},
		{
			displayName: 'Auth URI Query Parameters',
			name: 'authQueryParameters',
			type: 'string',
			default: '',
			description: 'Additional query parameters for the authorization URL',
		},
		{
			displayName: 'Authentication',
			name: 'authentication',
			type: 'hidden',
			default: 'body',
		},
		{
			displayName: 'Use Sandbox',
			name: 'useSandbox',
			type: 'boolean',
			default: false,
			description: 'Whether to use the sandbox environment for testing.',
		},
	];
}
