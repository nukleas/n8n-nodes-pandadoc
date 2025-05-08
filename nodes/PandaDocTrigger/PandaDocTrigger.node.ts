import {
	IHookFunctions,
	IWebhookFunctions,
	IDataObject,
	INodeType,
	INodeTypeDescription,
	IWebhookResponseData,
	NodeOperationError,
} from 'n8n-workflow';

import { pandaDocApiRequest, pandaDocApiRequestOAuth2 } from '../../shared/GenericFunctions';
import { triggerOperations, webhookFields } from './descriptions/TriggerDescription';

export class PandaDocTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'PandaDoc Trigger',
		name: 'pandaDocTrigger',
		icon: 'file:../PandaDoc/pandadoc.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["event"]}}',
		description: 'Starts the workflow when PandaDoc events occur',
		defaults: {
			name: 'PandaDoc Trigger',
		},
		inputs: [],
		outputs: ['main'],
		credentials: [
			{
				name: 'pandaDocApi',
				required: true,
				displayOptions: {
					show: {
						authentication: ['apiKey'],
					},
				},
			},
			{
				name: 'pandaDocOAuth2Api',
				required: true,
				displayOptions: {
					show: {
						authentication: ['oAuth2'],
					},
				},
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName: 'Authentication',
				name: 'authentication',
				type: 'options',
				options: [
					{
						name: 'API Key',
						value: 'apiKey',
					},
					{
						name: 'OAuth2',
						value: 'oAuth2',
					},
				],
				default: 'apiKey',
			},
			...triggerOperations,
			...webhookFields,
		],
	};

	methods = {
		loadOptions: {
			// Add any dynamic options loading methods if needed
		},
	};

	// This method will be called when the webhook needs to be created
	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');

				// If webhookId is already saved, check if it still exists
				if (webhookData.webhookId !== undefined) {
					try {
						// Check if the webhook exists
						const endpoint = `/webhooks/${webhookData.webhookId}`;
						
						if (this.getNodeParameter('authentication', 0) === 'oAuth2') {
							await pandaDocApiRequestOAuth2.call(this, 'GET', endpoint);
						} else {
							await pandaDocApiRequest.call(this, 'GET', endpoint);
						}
						
						// If no error is thrown, the webhook exists
						return true;
					} catch (error) {
						// If webhook does not exist, delete the stored data
						if (error.httpCode === '404') {
							delete webhookData.webhookId;
							delete webhookData.webhookSecret;
						}
						return false;
					}
				}
				return false;
			},

			async create(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default');
				const webhookData = this.getWorkflowStaticData('node');
				const authentication = this.getNodeParameter('authentication', 0);
				const event = this.getNodeParameter('event', 0) as string;
				const options = this.getNodeParameter('options', 0) as IDataObject;
				const webhookName = this.getNodeParameter('webhookName', 0) as string;

				// Map n8n event names to PandaDoc API event names
				const eventMap: { [key: string]: string } = {
					document_state_changed: 'document_state_changed',
					document_updated: 'document_updated',
					document_viewed: 'document_viewed',
					document_completed: 'document_completed',
				};

				// Create the webhook data
				const body: IDataObject = {
					name: webhookName || `n8n-webhook-${event}`,
					url: webhookUrl,
					events: [eventMap[event]],
				};

				// Add workspace ID filter if specified
				if (options.workspaceId) {
					body.workspace_id = options.workspaceId;
				}

				try {
					let responseData;
					
					// Create the webhook on PandaDoc
					if (authentication === 'oAuth2') {
						responseData = await pandaDocApiRequestOAuth2.call(this, 'POST', '/webhooks', body);
					} else {
						responseData = await pandaDocApiRequest.call(this, 'POST', '/webhooks', body);
					}

					if (responseData.id === undefined) {
						throw new NodeOperationError(this.getNode(), 'PandaDoc webhook creation failed');
					}

					// Save the webhook data
					webhookData.webhookId = responseData.id as string;
					webhookData.webhookSecret = responseData.secret as string;
					
					return true;
				} catch (error) {
					throw new NodeOperationError(this.getNode(), `PandaDoc webhook creation failed: ${error.message}`);
				}
			},

			async delete(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');
				const authentication = this.getNodeParameter('authentication', 0);

				// Skip if no webhook ID is stored
				if (webhookData.webhookId === undefined) {
					return true;
				}

				try {
					// Delete the webhook from PandaDoc
					const endpoint = `/webhooks/${webhookData.webhookId}`;
					
					if (authentication === 'oAuth2') {
						await pandaDocApiRequestOAuth2.call(this, 'DELETE', endpoint);
					} else {
						await pandaDocApiRequest.call(this, 'DELETE', endpoint);
					}

					// Clear the stored data
					delete webhookData.webhookId;
					delete webhookData.webhookSecret;
					
					return true;
				} catch (error) {
					// If webhook does not exist, consider it successfully deleted
					if (error.httpCode === '404') {
						delete webhookData.webhookId;
						delete webhookData.webhookSecret;
						return true;
					}
					
					throw new NodeOperationError(this.getNode(), `PandaDoc webhook deletion failed: ${error.message}`);
				}
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const webhookData = this.getWorkflowStaticData('node');
		const headerData = this.getHeaderData();
		const body = this.getBodyData();
		const options = this.getNodeParameter('options', 0) as IDataObject;
		const authentication = this.getNodeParameter('authentication', 0);
		const event = this.getNodeParameter('event', 0) as string;

		// Verify webhook signature if secret is available
		if (webhookData.webhookSecret !== undefined && headerData['x-pandadoc-signature']) {
			// Here you would implement signature verification if PandaDoc provides this security feature
			// For now, we'll assume all requests are valid
		}

		// Basic validation of the webhook payload
		if (!body.event || !body.data) {
			return {
				noWebhookResponse: true,
			};
		}

		// Check if this is the correct event type
		const receivedEvent = body.event as string;
		
		// Map received event to our internal events
		const eventMap: { [key: string]: string } = {
			'document_state_changed': 'document_state_changed',
			'document_updated': 'document_updated',
			'document_viewed': 'document_viewed',
			'document_completed': 'document_completed',
		};
		
		const expectedEvent = eventMap[event];
		
		if (receivedEvent !== expectedEvent) {
			// This is not the event we're listening for
			return {
				noWebhookResponse: true,
			};
		}

		// Process the webhook data
		const returnData: IDataObject = {};
		
		// Copy the webhook payload
		Object.assign(returnData, body);
		
		// Get additional document details if requested
		if (options.includeDocumentDetails === true && body.data && typeof body.data === 'object' && 'id' in body.data) {
			try {
				const documentId = (body.data as IDataObject).id as string;
				const endpoint = `/documents/${documentId}`;
				
				let documentDetails;
				if (authentication === 'oAuth2') {
					documentDetails = await pandaDocApiRequestOAuth2.call(this, 'GET', endpoint);
				} else {
					documentDetails = await pandaDocApiRequest.call(this, 'GET', endpoint);
				}
				
				returnData.documentDetails = documentDetails;
			} catch (error) {
				// Just log the error but don't fail the webhook
				this.logger.error('Failed to fetch document details: ' + (error as Error).message);
			}
		}

		return {
			workflowData: [
				this.helpers.returnJsonArray(returnData),
			],
		};
	}
}
