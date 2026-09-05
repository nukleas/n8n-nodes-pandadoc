export interface IDocumentRecipient {
	email: string;
	first_name?: string;
	last_name?: string;
	role?: string;
	signing_order?: number;
}

export interface IPricingTableItem {
	name: string;
	description?: string;
	price: number;
	qty: number;
}

export interface IPricingTable {
	name: string;
	items: IPricingTableItem[];
}

export interface IDocumentContentPlaceholder {
	block_id: string;
	content: unknown[];
}

export type IDocumentMetadata = Record<string, string>;
