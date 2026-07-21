'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { itemsQueryOptions, searchQueryOptions } from '@/lib/queries';
import { PathBreadcrumb } from './path-breadcrumb';
import { SearchBar } from './search-bar';
import { UploadDialog } from './upload-dialog';
import { NewFolderDialog } from './new-folder-dialog';
import { FileTable } from './file-table';
import { UploadProgress } from './upload-progress';
import { Loader2, AlertCircle } from 'lucide-react';

interface StorageBrowserProps {
	currentPath: string;
}

export function StorageBrowser({ currentPath }: StorageBrowserProps) {
	const [searchQuery, setSearchQuery] = useState('');
	const queryClient = useQueryClient();

	// 1. Fetch directory items
	const itemsQuery = useQuery({
		...itemsQueryOptions(currentPath),
		// Only run if search query is empty to avoid redundant requests
		enabled: searchQuery.trim() === '',
	});

	// 2. Fetch search results
	const searchQueryOpts = searchQueryOptions(currentPath, searchQuery);
	const searchResultsQuery = useQuery(searchQueryOpts);

	// Invalidate queries on successful upload
	const handleUploadSuccess = () => {
		queryClient.invalidateQueries({ queryKey: ['items', currentPath] });
	};

	const isSearchActive = searchQuery.trim().length > 0;

	// Decide which data and states to display
	const isLoading = isSearchActive
		? searchResultsQuery.isLoading
		: itemsQuery.isLoading;
	const isError = isSearchActive
		? searchResultsQuery.isError
		: itemsQuery.isError;
	const error = isSearchActive ? searchResultsQuery.error : itemsQuery.error;

	const displayItems = isSearchActive
		? searchResultsQuery.data || []
		: itemsQuery.data || [];

	return (
		<div className="flex flex-col gap-6 w-full">
			{/* Page Title */}
			<div>
				<h1 className="text-3xl font-bold tracking-tight text-white mb-1">
					My Storage
				</h1>
			</div>

			{/* Navigation & Breadcrumbs */}
			<div className="flex flex-wrap items-center justify-between gap-4 bg-[#0d121f] p-4 rounded-lg border border-slate-800">
				<PathBreadcrumb currentPath={currentPath} />
			</div>

			{/* Toolbar: Search and Actions */}
			<div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
				<SearchBar onSearch={setSearchQuery} />

				<div className="flex items-center gap-3">
					<UploadDialog
						currentPath={currentPath}
						onSuccess={handleUploadSuccess}
					/>
					<NewFolderDialog currentPath={currentPath} />
				</div>
			</div>

			{/* Main Content Area */}
			{isLoading ? (
				<div className="flex flex-col items-center justify-center py-20 gap-3 border border-slate-800 rounded-lg bg-[#0d121f]">
					<Loader2 className="size-8 text-blue-500 animate-spin" />
					<p className="text-slate-400 text-sm">Loading storage items...</p>
				</div>
			) : isError ? (
				<div className="flex flex-col items-center justify-center py-16 gap-3 border border-red-950/40 rounded-lg bg-red-950/10 text-rose-400 p-6">
					<AlertCircle className="size-8 text-rose-500" />
					<p className="font-semibold">Failed to load content</p>
					<p className="text-xs text-rose-400/80 text-center max-w-md">
						{error instanceof Error
							? error.message
							: 'An error occurred while contacting the server.'}
					</p>
				</div>
			) : (
				<FileTable items={displayItems} currentPath={currentPath} />
			)}

			{/* Upload Progress Overlay */}
			<UploadProgress />
		</div>
	);
}
