export interface Item {
	name: string;
	path: string;
	size: number;
	isDirectory: boolean;
	modifiedAt: string; // ISO 8601 string
}
