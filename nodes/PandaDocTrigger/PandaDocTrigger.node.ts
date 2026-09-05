import { createHmac, timingSafeEqual } from 'node:crypto';
import type {
	IDataObject,
	IHookFunctions,
	INodeType,
	INodeTypeDescription,
	IWebhookFunctions,
	IWebhookResponseData,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError, NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

import { pandaDocApiRequest } from '../../shared/GenericFunctions';
import { triggerProperties } from './descriptions/TriggerDescription';

interface IPandaDocWebhookEvent {
	event: string;
	data: IDataObject;
}

/**
 * PandaDoc signs every delivery with HMAC-SHA256 over the raw request body using the
 * subscription's shared key and sends the hex digest as the `signature` query parameter.
 */
function isValidSignature(rawBody: Buffer, sharedKey: string, signature: unknown): boolean {
	if (typeof signature !== 'string') return false;
	const expected = createHmac('sha256', sharedKey).update(rawBody).digest('hex');
	return (
		signature.length === expected.length &&
		timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
	);
}

export class PandaDocTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'PandaDoc Trigger',
		name: 'pandaDocTrigger',
		icon: { light: 'file:../../icons/pandadoc.svg', dark: 'file:../../icons/pandadoc.dark.svg' },
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["events"].join(", ")}}',
		description: 'Starts the workflow when PandaDoc events occur',
		defaults: {
			name: 'PandaDoc Trigger',
		},
		inputs: [],
		outputs: [NodeConnectionTypes.Main],
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
			...triggerProperties,
		],
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');
				if (webhookData.webhookId === undefined) {
					return false;
				}
				try {
					await pandaDocApiRequest.call(
						this,
						'GET',
						`/webhook-subscriptions/${webhookData.webhookId}`,
					);
					return true;
				} catch (error) {
					if ((error as NodeApiError).httpCode === '404') {
						delete webhookData.webhookId;
						delete webhookData.webhookSharedKey;
						return false;
					}
					throw new NodeApiError(this.getNode(), error as JsonObject);
				}
			},

			async create(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');
				const events = this.getNodeParameter('events') as string[];
				const options = this.getNodeParameter('options', {}) as IDataObject;

				const body: IDataObject = {
					name: (options.name as string) || `n8n: ${this.getWorkflow().name ?? 'workflow'}`,
					url: this.getNodeWebhookUrl('default'),
					active: true,
					triggers: events,
				};
				const payload = options.payload as string[] | undefined;
				if (payload?.length) {
					body.payload = payload;
				}

				const response = (await pandaDocApiRequest.call(
					this,
					'POST',
					'/webhook-subscriptions',
					body,
				)) as IDataObject;

				if (typeof response.uuid !== 'string') {
					throw new NodeOperationError(
						this.getNode(),
						'PandaDoc did not return a webhook subscription ID',
					);
				}

				webhookData.webhookId = response.uuid;
				webhookData.webhookSharedKey = response.shared_key;
				return true;
			},

			async delete(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');
				if (webhookData.webhookId === undefined) {
					return true;
				}
				try {
					await pandaDocApiRequest.call(
						this,
						'DELETE',
						`/webhook-subscriptions/${webhookData.webhookId}`,
					);
				} catch (error) {
					if ((error as NodeApiError).httpCode !== '404') {
						throw new NodeApiError(this.getNode(), error as JsonObject);
					}
				}
				delete webhookData.webhookId;
				delete webhookData.webhookSharedKey;
				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const webhookData = this.getWorkflowStaticData('node');
		const events = this.getNodeParameter('events') as string[];
		const options = this.getNodeParameter('options', {}) as IDataObject;
		const bodyData = this.getBodyData();

		const sharedKey = webhookData.webhookSharedKey;
		if (typeof sharedKey === 'string' && sharedKey.length > 0) {
			const request = this.getRequestObject() as ReturnType<
				IWebhookFunctions['getRequestObject']
			> & {
				rawBody?: Buffer;
			};
			const rawBody = request.rawBody ?? Buffer.from(JSON.stringify(bodyData));
			const { signature } = this.getQueryData() as IDataObject;
			if (!isValidSignature(rawBody, sharedKey, signature)) {
				this.getResponseObject().status(401).json({ message: 'Invalid webhook signature' });
				return { noWebhookResponse: true };
			}
		}

		const receivedEvents = (Array.isArray(bodyData)
			? bodyData
			: [bodyData]) as unknown as IPandaDocWebhookEvent[];
		const matching = receivedEvents.filter(
			(entry) => typeof entry?.event === 'string' && events.includes(entry.event),
		);
		if (matching.length === 0) {
			return { noWebhookResponse: false };
		}

		const output: IDataObject[] = [];
		for (const entry of matching) {
			const item: IDataObject = { ...entry };
			const documentId = entry.data?.id;
			if (
				options.includeDocumentDetails === true &&
				entry.event.startsWith('document_') &&
				typeof documentId === 'string'
			) {
				item.documentDetails = (await pandaDocApiRequest.call(
					this,
					'GET',
					`/documents/${documentId}/details`,
				)) as IDataObject;
			}
			output.push(item);
		}

		return {
			workflowData: [this.helpers.returnJsonArray(output)],
		};
	}
}
