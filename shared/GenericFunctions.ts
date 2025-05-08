import {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	IHttpRequestMethods,
	ILoadOptionsFunctions,
	IWebhookFunctions,
	JsonObject,
	NodeApiError,
	INodeExecutionData,
} from 'n8n-workflow';

// Interface for API request options
interface IApiRequestOptions {
	method: IHttpRequestMethods;
	headers: Record<string, string>;
	body?: any;
	query?: Record<string, string | number>;
	uri?: string;
	formData?: any;
	json?: boolean;
}

/**
 * Make an API request to PandaDoc API
 * 
 * @param {IExecuteFunctions | IWebhookFunctions | IHookFunctions | ILoadOptionsFunctions} this - The n8n function context
 * @param {IHttpRequestMethods} method - HTTP method (GET, POST, PUT, DELETE)
 * @param {string} resource - API endpoint path
 * @param {object} body - Request body for POST/PUT requests
 * @param {object} query - Query parameters
 * @param {string} [uri] - Optional override for the full URI
 * @param {IDataObject} [option] - Additional options for the request
 * @returns {Promise<any>} - API response data
 * @throws {NodeApiError} - Throws an error if the request fails
 */
export async function pandaDocApiRequest(
	this: IExecuteFunctions | IWebhookFunctions | IHookFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	resource: string,
	body: object = {},
	query: object = {},
	uri?: string,
	option: IDataObject = {},
) {
	const credentials = await this.getCredentials('pandaDocApi');
	const options: IApiRequestOptions = {
		headers: {
			'Content-Type': 'application/json',
			Authorization: `API-Key ${credentials.apiKey}`,
		},
		method,
		body: Object.keys(body).length === 0 ? undefined : body,
		query: query as Record<string, string | number>,
		uri: uri || `https://api.pandadoc.com/public/v1${resource}`,
		json: true,
	};

	// Note: PandaDoc doesn't use a separate sandbox URL. The Sandbox mode
	// is determined by which API key is used (sandbox key vs production key).
	// The useSandbox setting is kept for informational purposes only.

	// Handle binary data for file uploads
	if (option.formData) {
		options.formData = option.formData;
	}

	try {
		// Using n8n's built-in request helper which handles credentials properly
		return await this.helpers.request!({
			method: options.method,
			url: options.uri,
			headers: options.headers,
			qs: options.query,
			body: options.body,
			formData: options.formData,
			json: options.json !== false,
		});
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}

/**
 * Make an API request to PandaDoc using OAuth2 authentication
 */
export async function pandaDocApiRequestOAuth2(
	this: IExecuteFunctions | IWebhookFunctions | IHookFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	resource: string,
	body: object = {},
	query: object = {},
	uri?: string,
	option: IDataObject = {},
) {
	// Note: We don't need to use the credentials directly as the requestOAuth2 helper handles this
	const options: IApiRequestOptions = {
		headers: {
			'Content-Type': 'application/json',
		},
		method,
		body: Object.keys(body).length === 0 ? undefined : body,
		query: query as Record<string, string | number>,
		uri: uri || `https://api.pandadoc.com/public/v1${resource}`,
		json: true,
	};

	// Handle binary data for file uploads
	if (option.formData) {
		options.formData = option.formData;
	}

	try {
		return await this.helpers.requestOAuth2.call(
			this, 
			'pandaDocOAuth2Api', 
			{
				method: options.method,
				url: options.uri,
				headers: options.headers,
				qs: options.query,
				body: options.body,
				formData: options.formData,
				json: options.json !== false,
			}
		);
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}

/**
 * Helper function to handle pagination
 */
export async function getAllItems(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	propertyName: string,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	query: IDataObject = {},
) {
	const returnData: IDataObject[] = [];
	let responseData;
	query.page = 1;
	query.count = 100; // maximum allowed by PandaDoc API

	do {
		responseData = await pandaDocApiRequest.call(this, method, endpoint, body, query);
		returnData.push.apply(returnData, responseData[propertyName]);
		query.page++;
	} while (responseData[propertyName].length === query.count);

	return returnData;
}

/**
 * Generic function for fetching resources (documents, templates, folders, contacts)
 * 
 * @param {IExecuteFunctions} this - The n8n execute functions context
 * @param {number} i - The index of the item being processed
 * @param {string} resourcePath - API endpoint path for the resource (e.g., '/documents', '/templates')
 * @param {string} resourceName - Name of the resource for logging/display purposes
 * @param {IDataObject} filters - Query parameters to filter the results
 * @param {boolean} [applyGenericFilters=true] - Whether to apply generic filters (order_by, q) to the query string
 * @returns {Promise<INodeExecutionData[] | IDataObject[]>} - Returns either an array of node execution data or raw resource objects
 */
export async function getAllResourceItems<T>(
	this: IExecuteFunctions,
	i: number,
	resourcePath: string,
	resourceName: string,
	filters: IDataObject,
	applyGenericFilters = true,
): Promise<INodeExecutionData[] | IDataObject[]> {
	const returnAll = this.getNodeParameter('returnAll', i) as boolean;
	const limit = this.getNodeParameter('limit', i, 50) as number;

	const qs: IDataObject = {};

	// Apply all filters to query string
	if (Object.keys(filters).length) {
		Object.assign(qs, filters);
	}

	// Add common filtering parameters if needed
	if (applyGenericFilters) {
		if (filters.order_by) qs.order_by = filters.order_by;
		if (filters.q) qs.q = filters.q;
	}

	if (returnAll) {
		const items = await getAllItems.call(this, 'results', 'GET', resourcePath, {}, qs);
		return this.helpers.returnJsonArray(items);
	} else {
		qs.page = 1;
		qs.count = limit; // PandaDoc uses 'count' instead of 'per_page'
		const response = await pandaDocApiRequest.call(this, 'GET', resourcePath, {}, qs);
		return this.helpers.returnJsonArray(response.results as IDataObject[]);
	}
}

// Cache for templates and folders to improve performance
const cache: {
	templates?: { data: IDataObject[]; expires: number };
	folders?: { data: IDataObject[]; expires: number };
} = {};

/**
 * Get cached resources or fetch them if expired
 */
export async function getCachedResources(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	resourceType: 'templates' | 'folders',
	cacheDuration = 5 * 60 * 1000, // 5 minutes default
): Promise<IDataObject[]> {
	const now = Date.now();

	// Return cached data if available and not expired
	if (cache[resourceType] && cache[resourceType]!.expires > now) {
		return cache[resourceType]!.data;
	}

	// Fetch fresh data
	let data: IDataObject[] = [];
	try {
		const response = await pandaDocApiRequest.call(
			this,
			'GET',
			`/${resourceType}`,
			{},
			{ page: 1, count: 100 }, // PandaDoc uses 'count' instead of 'per_page'
		);
		data = response.results as IDataObject[];
		
		// Cache the data
		cache[resourceType] = {
			data,
			expires: now + cacheDuration,
		};
	} catch (error) {
		// If error fetching, use expired cache as fallback
		if (cache[resourceType]) {
			return cache[resourceType]!.data;
		}
		throw error;
	}

	return data;
}

/**
 * Enhanced API request function with retry capability for handling rate limits
 * This simplifies the retry mechanism to avoid setTimeout issues in n8n environment
 */
export async function pandaDocApiRequestWithRetry<T>(
	this: IExecuteFunctions | IWebhookFunctions | IHookFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	resource: string,
	body: object = {},
	query: object = {},
	uri?: string,
	option: IDataObject = {},
): Promise<T> {
	try {
		// Make the API request and explicitly cast the result to the expected type
		const response = await pandaDocApiRequest.call(this, method, resource, body, query, uri, option);
		return response as T;
	} catch (error) {
		// Handle the error (might add rate limiting handling in future)
		this.logger?.error('PandaDoc API request failed:', error);
		throw error;
	}
}

// IDataObject is now imported from n8n-workflow
