import { Item } from './types';

const getBaseUrl = () => {
	return process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:8080';
};

export const getApiUrl = (endpoint: string, path: string) => {
	const base = getBaseUrl();
	const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
	const cleanPath = path.startsWith('/') ? path.slice(1) : path;

	if (!cleanPath) {
		return `${base}/${cleanEndpoint}/`;
	}
	return `${base}/${cleanEndpoint}/${cleanPath}`;
};

export const normalizePath = (path: string | string[] | undefined): string => {
	if (!path) return '';
	if (Array.isArray(path)) {
		return path.join('/');
	}
	return path;
};

export async function listItems(path: string): Promise<Item[]> {
	const url = getApiUrl('src', path);
	const res = await fetch(url);
	if (!res.ok) {
		throw new Error(`Failed to list items: ${res.statusText}`);
	}
	return res.json();
}

export async function searchItems(
	path: string,
	query: string
): Promise<Item[]> {
	const baseUrl = getApiUrl('src', path);
	const url = `${baseUrl}?q=${encodeURIComponent(query)}`;
	const res = await fetch(url);
	if (!res.ok) {
		throw new Error(`Failed to search items: ${res.statusText}`);
	}
	return res.json();
}

export async function createFolder(
	path: string,
	newName: string
): Promise<string> {
	const url = getApiUrl('src', path);
	const formData = new FormData();
	formData.append('newName', newName);

	const res = await fetch(url, {
		method: 'POST',
		body: formData,
	});
	if (!res.ok) {
		throw new Error(`Failed to create folder: ${res.statusText}`);
	}
	return res.text();
}

export async function renameItem(
	path: string,
	newName: string
): Promise<string> {
	const url = getApiUrl('src', path);
	const formData = new FormData();
	formData.append('newName', newName);

	const res = await fetch(url, {
		method: 'PUT',
		body: formData,
	});
	if (!res.ok) {
		throw new Error(`Failed to rename item: ${res.statusText}`);
	}
	return res.text();
}

export async function deleteItem(path: string): Promise<void> {
	const url = getApiUrl('src', path);
	const res = await fetch(url, {
		method: 'DELETE',
	});
	if (!res.ok) {
		throw new Error(`Failed to delete item: ${res.statusText}`);
	}
}

export function getDownloadUrl(path: string): string {
	return getApiUrl('download', path);
}
