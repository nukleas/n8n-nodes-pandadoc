import {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

// Import the document operations and fields
import { documentFields, documentOperations } from './descriptions/DocumentDescription';
import * as documentMethods from './methods/documentMethods';

// Import the template operations and fields
import { templateFields, templateOperations } from './descriptions/TemplateDescription';
import * as templateMethods from './methods/templateMethods';

// Import the folder operations and fields
import { folderFields, folderOperations } from './descriptions/FolderDescription';
import * as folderMethods from './methods/folderMethods';

// Import the contact operations and fields
import { contactFields, contactOperations } from './descriptions/ContactDescription';
import * as contactMethods from './methods/contactMethods';

export class PandaDoc implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'PandaDoc',
		name: 'pandaDoc',
		icon: 'file:pandadoc.svg',
		group: ['output'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + ($parameter["resource"] === "documents" ? "document" : $parameter["resource"])}}',
		description: 'Consume PandaDoc API',
		defaults: {
			name: 'PandaDoc',
		},
		inputs: ['main'],
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

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;

				let responseData: INodeExecutionData[] | IDataObject[];

				if (resource === 'document') {
					switch (operation) {
						case 'getAll':
							responseData = await documentMethods.getAllDocuments.call(this, i);
							break;
						case 'get':
							responseData = await documentMethods.getDocument.call(this, i);
							break;
						case 'getStatus':
							responseData = await documentMethods.getDocumentStatus.call(this, i);
							break;
						case 'createFromTemplate':
							responseData = await documentMethods.createDocumentFromTemplate.call(this, i);
							break;
						case 'createFromPdf':
							responseData = await documentMethods.createDocumentFromPdf.call(this, i);
							break;
						case 'send':
							responseData = await documentMethods.sendDocument.call(this, i);
							break;
						case 'download':
							responseData = await documentMethods.downloadDocument.call(this, i);
							break;
						case 'delete':
							responseData = await documentMethods.deleteDocument.call(this, i);
							break;
						case 'update':
							responseData = await documentMethods.updateDocument.call(this, i);
							break;
						case 'createDocumentLink':
							responseData = await documentMethods.createDocumentLink.call(this, i);
							break;
						default:
							throw new NodeOperationError(
								this.getNode(),
								`The operation "${operation}" is not supported for resource "${resource}"!`,
							);
					}
				} else if (resource === 'folder') {
					switch (operation) {
						case 'getAll':
							responseData = await folderMethods.getAllFolders.call(this, i);
							break;
						case 'get':
							responseData = await folderMethods.getFolder.call(this, i);
							break;
						case 'create':
							responseData = await folderMethods.createFolder.call(this, i);
							break;
						case 'delete':
							responseData = await folderMethods.deleteFolder.call(this, i);
							break;
						default:
							throw new NodeOperationError(
								this.getNode(),
								`The operation "${operation}" is not supported for resource "${resource}"!`,
							);
					}
				} else if (resource === 'contact') {
					switch (operation) {
						case 'getAll':
							responseData = await contactMethods.getAllContacts.call(this, i);
							break;
						case 'get':
							responseData = await contactMethods.getContact.call(this, i);
							break;
						case 'create':
							responseData = await contactMethods.createContact.call(this, i);
							break;
						case 'update':
							responseData = await contactMethods.updateContact.call(this, i);
							break;
						case 'delete':
							responseData = await contactMethods.deleteContact.call(this, i);
							break;
						default:
							throw new NodeOperationError(
								this.getNode(),
								`The operation "${operation}" is not supported for resource "${resource}"!`,
							);
					}
				} else if (resource === 'template') {
					switch (operation) {
						case 'getAll':
							responseData = await templateMethods.getAllTemplates.call(this, i);
							break;
						case 'get':
							responseData = await templateMethods.getTemplate.call(this, i);
							break;
						default:
							throw new NodeOperationError(
								this.getNode(),
								`The operation "${operation}" is not supported for resource "${resource}"!`,
							);
					}
				} else {
					// We'll implement these resources in future steps
					throw new NodeOperationError(
						this.getNode(),
						`The resource "${resource}" is not yet implemented!`,
					);
				}

				// Add the response data to the return array
				if (Array.isArray(responseData)) {
					// Check if the responseData is of type INodeExecutionData[] or IDataObject[]
					if (responseData.length > 0 && 'json' in responseData[0]) {
						// It's INodeExecutionData[], we can push directly
						returnData.push(...responseData as INodeExecutionData[]);
					} else {
						// It's IDataObject[], convert to INodeExecutionData
						const convertedData = responseData.map((item) => ({ json: item }));
						returnData.push(...convertedData);
					}
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error.message,
						},
						pairedItem: {
							item: i,
						},
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
