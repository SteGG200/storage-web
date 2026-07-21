import { queryOptions } from '@tanstack/react-query';
import { listItems, searchItems } from './api';

// Query keys structure:
// ['items', path]
// ['items', path, { q: query }]

export const itemsQueryOptions = (path: string) =>
	queryOptions({
		queryKey: ['items', path] as const,
		queryFn: () => listItems(path),
	});

export const searchQueryOptions = (path: string, query: string) =>
	queryOptions({
		queryKey: ['items', path, { q: query }] as const,
		queryFn: () => searchItems(path, query),
		enabled: query.trim().length > 0,
	});
