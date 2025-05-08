# PandaDoc Authentication Guide

This guide provides detailed instructions for setting up authentication with PandaDoc in n8n.

## API Key Authentication

The API Key authentication method is the simplest way to connect to PandaDoc.

### Step 1: Generate an API Key in PandaDoc

1. Log in to your [PandaDoc account](https://app.pandadoc.com/)
2. Go to **Settings → Integrations**
3. Select the **API** tab
4. Click on **Generate API Key** if you don't already have one
5. Copy your API key immediately (you won't be able to see it again)

> **Note**: PandaDoc provides two types of API keys:
> - **Sandbox API Key**: For testing purposes only (in the test environment)
> - **Production API Key**: For use in production environments

### Step 2: Configure API Key Authentication in n8n

1. In your n8n workflow, add a PandaDoc node
2. Click on **Create new credential**
3. Select **PandaDoc API**
4. Enter your API key in the **API Key** field
5. Toggle **Use Sandbox** if you want to test in the PandaDoc sandbox environment
6. Click **Save**

## OAuth2 Authentication

OAuth2 authentication provides a more secure connection and is recommended for production environments.

### Step 1: Create an OAuth2 Application in PandaDoc

1. Go to the [PandaDoc Developer Dashboard](https://developers.pandadoc.com/)
2. Sign in with your PandaDoc account 
3. Create a new application or select an existing one
4. Navigate to the **OAuth Settings** section
5. Add your redirect URI:
   - For n8n Cloud: `https://YOUR_INSTANCE.n8n.cloud/rest/oauth2-credential/callback`
   - For self-hosted n8n: `https://YOUR_DOMAIN/rest/oauth2-credential/callback`
6. Save the changes
7. Note your Client ID and Client Secret

### Step 2: Configure OAuth2 Authentication in n8n

1. In your n8n workflow, add a PandaDoc node
2. Change the **Authentication** dropdown to **OAuth2**
3. Click on **Create new credential**
4. Select **PandaDoc OAuth2 API**
5. Enter the following details:
   - **Client ID**: Your PandaDoc OAuth2 client ID
   - **Client Secret**: Your PandaDoc OAuth2 client secret
   - **Authorization URL**: `https://app.pandadoc.com/oauth2/authorize`
   - **Access Token URL**: `https://api.pandadoc.com/oauth2/access_token`
   - **Scope**: `read+write`
   - Add the `webhook` scope if you need webhook functionality
6. Toggle **Use Sandbox** if you want to test in the PandaDoc sandbox environment
7. Click **Save** and authenticate with your PandaDoc account

## Sandbox vs. Production Environment

PandaDoc provides a sandbox environment for testing your integration without affecting your production data.

### Sandbox Environment

- API Base URL: `https://api.sandbox.pandadoc.com`
- Use for development and testing
- Does not affect your production documents and templates
- Data is periodically cleared from the sandbox environment
- Uses a separate Sandbox API Key

### Production Environment

- API Base URL: `https://api.pandadoc.com`
- Used for your actual business processes
- Changes affect real documents and templates
- Be cautious with operations like document deletion or sending
- Uses a Production API Key

### Switching Between Environments

To switch between sandbox and production environments in n8n:

1. Edit your PandaDoc credential
2. Toggle the **Use Sandbox** option
3. Save the credential
4. Re-authenticate if using OAuth2

## Troubleshooting Authentication Issues

### API Key Authentication Issues

1. **Invalid API Key Error**: 
   - Verify the API key is entered correctly
   - Generate a new API key if necessary
   - Ensure you're using the correct key (Sandbox or Production) based on your environment setting

2. **Rate Limit Exceeded**:
   - PandaDoc limits API requests based on your plan
   - Implement a delay between requests in your workflow
   - Consider upgrading your PandaDoc plan for higher limits

### OAuth2 Authentication Issues

1. **Invalid Redirect URI**:
   - Ensure the redirect URI in your PandaDoc developer settings exactly matches the n8n callback URL
   - Check for extra slashes or incorrect domain names

2. **Token Expired**:
   - OAuth2 access tokens expire after a certain period
   - n8n should automatically refresh the token, but if issues persist, re-authenticate

3. **Insufficient Permissions**:
   - Make sure you've requested the appropriate scopes (`read+write` for basic operations, add `webhook` if needed)
   - Ensure your application has been approved for these scopes

## Security Best Practices

1. **Use OAuth2 for Production**:
   - OAuth2 is more secure than API keys for production environments
   - It provides token rotation and explicit user consent

2. **Keep Credentials Secure**:
   - Never expose your API keys or OAuth credentials in client-side code
   - Store credentials securely as n8n credentials, not in workflow data

3. **Use Appropriate Environments**:
   - Use the Sandbox environment for testing and development
   - Only use Production environment when ready to work with real documents

4. **Regularly Rotate Credentials**:
   - Periodically generate new API keys
   - Remove unused credentials from your PandaDoc account

## Additional Resources

- [PandaDoc API Documentation](https://developers.pandadoc.com/reference/about)
- [Authentication Overview](https://developers.pandadoc.com/reference/auth-overview)
- [API Key Authentication](https://developers.pandadoc.com/reference/api-key-authentication-process)
- [OAuth 2.0 Authentication](https://developers.pandadoc.com/reference/oauth-20-authentication)
