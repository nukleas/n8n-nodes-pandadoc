# PandaDoc Authentication Guide

This guide provides detailed instructions for setting up authentication with PandaDoc in n8n.

## API Key Authentication

The API Key authentication method is the simplest way to connect to PandaDoc.

### Step 1: Generate an API Key in PandaDoc

1. Log in to your [PandaDoc account](https://app.pandadoc.com/)
2. Navigate to **Settings > API** (requires admin permissions)
3. Click on **+ Create New API Key**
4. Enter a name for your API key (e.g., "n8n Integration")
5. Select the appropriate permissions for your use case:
   - **Read-only**: If you only need to view documents and templates
   - **Full access**: If you need to create and modify documents
6. Click **Create API Key**
7. Copy your API key immediately (you won't be able to see it again)

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
2. Create a new application or select an existing one
3. Navigate to the **OAuth Settings** tab
4. Add your redirect URI:
   - For n8n Cloud: `https://YOUR_INSTANCE.n8n.cloud/rest/oauth2-credential/callback`
   - For self-hosted n8n: `https://YOUR_DOMAIN/rest/oauth2-credential/callback`
5. Save the changes
6. Note your Client ID and Client Secret

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
   - **Scope**: `read+write+webhook`
6. Toggle **Use Sandbox** if you want to test in the PandaDoc sandbox environment
7. Click **Save** and authenticate with your PandaDoc account

## Sandbox vs. Production Environment

PandaDoc provides a sandbox environment for testing your integration without affecting your production data.

### Sandbox Environment

- API Base URL: `https://api.sandbox.pandadoc.com`
- Use for development and testing
- Does not affect your production documents and templates
- Data is periodically cleared from the sandbox environment

### Production Environment

- API Base URL: `https://api.pandadoc.com`
- Used for your actual business processes
- Changes affect real documents and templates
- Be cautious with operations like document deletion or sending

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
   - Check that your API key has the required permissions

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
   - Make sure you've requested the appropriate scopes (`read+write+webhook`)
   - Ensure your application has been approved for these scopes

## Security Best Practices

1. **Use OAuth2 for Production**:
   - OAuth2 is more secure than API keys for production environments
   - It provides token rotation and explicit user consent

2. **Restrict API Key Permissions**:
   - Only grant the minimum permissions required for your workflows
   - Create separate API keys for different integration purposes

3. **Regularly Rotate Credentials**:
   - Periodically generate new API keys
   - Remove unused credentials from your PandaDoc account
