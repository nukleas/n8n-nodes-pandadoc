import type { Icon, ICredentialType, INodeProperties } from 'n8n-workflow';

export class PandaDocOAuth2Api implements ICredentialType {
	name = 'pandaDocOAuth2Api';

	extends = ['oAuth2Api'];

	displayName = 'PandaDoc OAuth2 API';

	documentationUrl = 'https://developers.pandadoc.com/reference/authentication-process';

	icon: Icon = { light: 'file:../icons/pandadoc.svg', dark: 'file:../icons/pandadoc.dark.svg' };

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
			type: 'hidden',
			default: 'https://app.pandadoc.com/oauth2/authorize',
			required: true,
		},
		{
			displayName: 'Access Token URL',
			name: 'accessTokenUrl',
			type: 'hidden',
			default: 'https://api.pandadoc.com/oauth2/access_token',
			required: true,
		},
		{
			displayName: 'Scope',
			name: 'scope',
			type: 'hidden',
			default: 'read write',
		},
		{
			displayName: 'Auth URI Query Parameters',
			name: 'authQueryParameters',
			type: 'hidden',
			default: '',
		},
		{
			displayName: 'Authentication',
			name: 'authentication',
			type: 'hidden',
			default: 'body',
		},
	];
}
