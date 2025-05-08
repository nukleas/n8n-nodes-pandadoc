/**
 * PandaDoc API Interfaces
 */

// Common interfaces
export interface IDataObject {
	[key: string]: any;
}

// Document interfaces
export interface IDocumentRecipient {
	email: string;
	first_name?: string;
	last_name?: string;
	role?: string;
	signing_order?: number;
}

export interface IDocumentPricing {
	tables?: IPricingTable[];
	enable_per_recipient_pricing?: boolean;
	enable_total?: boolean;
}

export interface IPricingTable {
	name?: string;
	id?: string;
	data_merge?: boolean;
	items?: IPricingTableItem[];
}

export interface IPricingTableItem {
	id?: string;
	name?: string;
	description?: string;
	price?: number;
	qty?: number;
	discount?: number;
	tax_first?: number;
	tax_second?: number;
}

export interface IDocumentMetadata {
	[key: string]: string;
}

export interface IDocumentLink {
	document_id?: string;
	name?: string;
}

export interface IDocumentContentPlaceholder {
	block_id: string;
	content: any[];
}

// Template interfaces
export interface ITemplateFolder {
	uuid: string;
	name: string;
	parent_uuid?: string;
	created_by: string;
	shared: boolean;
}

// Contact interfaces
export interface IContactBase {
	id?: string;
	email: string;
	first_name?: string;
	last_name?: string;
}

export interface IContactDetails extends IContactBase {
	company?: string;
	job_title?: string;
	phone?: string;
	country?: string;
	state?: string;
	postal_code?: string;
	address_line_1?: string;
	address_line_2?: string;
	metadata?: IDataObject;
}

// Response interfaces
export interface IDocumentCreateResponse {
	id: string;
	status: string;
	name: string;
	date_created: string;
	date_modified: string;
	expiration_date: string | null;
	version: string;
}

export interface IDocumentListResponse {
	results: IDocumentListItem[];
}

export interface IDocumentListItem {
	id: string;
	name: string;
	status: string;
	date_created: string;
	date_modified: string;
	expiration_date: string | null;
	version: string;
}

export interface ITemplateListResponse {
	results: ITemplateListItem[];
}

export interface ITemplateListItem {
	id: string;
	name: string;
	date_created: string;
	date_modified: string;
	version: string;
	content_date_modified: string;
}

export interface IFolderListResponse {
	results: IFolderListItem[];
}

export interface IFolderListItem {
	uuid: string;
	name: string;
	parent_uuid?: string;
	created_by: string;
	shared: boolean;
}

export interface IContactListResponse {
	results: IContactListItem[];
}

export interface IContactListItem {
	id: string;
	email: string;
	first_name?: string;
	last_name?: string;
	company?: string;
	created_date: string;
}
