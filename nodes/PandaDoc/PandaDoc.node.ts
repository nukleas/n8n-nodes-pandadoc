import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError, NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

import { contactFields, contactOperations } from './descriptions/ContactDescription';
import { documentFields, documentOperations } from './descriptions/DocumentDescription';
import { folderFields, folderOperations } from './descriptions/FolderDescription';
import { templateFields, templateOperations } from './descriptions/TemplateDescription';
import * as contactMethods from './methods/contactMethods';
import * as documentMethods from './methods/documentMethods';
import * as folderMethods from './methods/folderMethods';
import { searchDocuments, searchFolders, searchTemplates } from './methods/listSearch';
import * as templateMethods from './methods/templateMethods';

type OperationResult = IDataObject | IDataObject[] | INodeExecutionData[];
type OperationHandler = (this: IExecuteFunctions, i: number) => Promise<OperationResult>;

const operations: Record<string, Record<string, OperationHandler>> = {
	contact: {
		create: contactMethods.createContact,
		delete: contactMethods.deleteContact,
		get: contactMethods.getContact,
		getAll: contactMethods.getAllContacts,
		update: contactMethods.updateContact,
	},
	document: {
		createDocumentLink: documentMethods.createDocumentLink,
		createFromPdf: documentMethods.createDocumentFromPdf,
		createFromTemplate: documentMethods.createDocumentFromTemplate,
		delete: documentMethods.deleteDocument,
		download: documentMethods.downloadDocument,
		get: documentMethods.getDocument,
		getAll: documentMethods.getAllDocuments,
		getStatus: documentMethods.getDocumentStatus,
		send: documentMethods.sendDocument,
		update: documentMethods.updateDocument,
	},
	folder: {
		create: folderMethods.createFolder,
		getAll: folderMethods.getAllFolders,
		rename: folderMethods.renameFolder,
	},
	template: {
		get: templateMethods.getTemplate,
		getAll: templateMethods.getAllTemplates,
	},
};

function isExecutionData(result: OperationResult): result is INodeExecutionData[] {
	return Array.isArray(result) && result.length > 0 && 'json' in result[0];
}

export class PandaDoc implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'PandaDoc',
		name: 'pandaDoc',
		icon: { light: 'file:../../icons/pandadoc.svg', dark: 'file:../../icons/pandadoc.dark.svg' },
		group: ['output'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Consume the PandaDoc API',
		defaults: {
			name: 'PandaDoc',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
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
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Contact',
						value: 'contact',
					},
					{
						name: 'Document',
						value: 'document',
					},
					{
						name: 'Folder',
						value: 'folder',
					},
					{
						name: 'Template',
						value: 'template',
					},
				],
				default: 'document',
			},
			...contactOperations,
			...contactFields,
			...documentOperations,
			...documentFields,
			...folderOperations,
			...folderFields,
			...templateOperations,
			...templateFields,
		],
	};

	methods = {
		listSearch: {
			searchDocuments,
			searchFolders,
			searchTemplates,
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;

				const handler = operations[resource]?.[operation];
				if (!handler) {
					throw new NodeOperationError(
						this.getNode(),
						`The operation "${operation}" is not supported for resource "${resource}"`,
						{ itemIndex: i },
					);
				}

				const result = await handler.call(this, i);
				if (isExecutionData(result)) {
					returnData.push(...result);
				} else {
					returnData.push(
						...this.helpers.constructExecutionMetaData(this.helpers.returnJsonArray(result), {
							itemData: { item: i },
						}),
					);
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: error.message }, pairedItem: { item: i } });
					continue;
				}
				if (error instanceof NodeApiError) {
					error.context.itemIndex = i;
					throw new NodeApiError(this.getNode(), error as unknown as JsonObject);
				}
				throw new NodeOperationError(this.getNode(), error as Error, { itemIndex: i });
			}
		}

		return [returnData];
	}
}
