'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
	Folder,
	FileText,
	MoreVertical,
	Download,
	Pencil,
	Trash,
	ArrowUpDown,
	ArrowUp,
	ArrowDown,
} from 'lucide-react';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Item } from '@/lib/types';
import { getDownloadUrl } from '@/lib/api';
import { RenameDialog } from './rename-dialog';
import { DeleteDialog } from './delete-dialog';

interface FileTableProps {
	items: Item[];
	currentPath: string;
}

type SortField = 'name' | 'size' | 'modifiedAt';
type SortDirection = 'asc' | 'desc';

function formatSize(bytes: number): string {
	if (bytes === 0) return '0.0 B';
	const k = 1024;
	const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function formatDate(isoString: string): string {
	const d = new Date(isoString);
	if (isNaN(d.getTime())) return isoString;
	const pad = (n: number) => String(n).padStart(2, '0');
	const day = pad(d.getDate());
	const month = pad(d.getMonth() + 1);
	const year = d.getFullYear();
	const hours = pad(d.getHours());
	const minutes = pad(d.getMinutes());
	const seconds = pad(d.getSeconds());
	return `${day}/${month}/${year}, ${hours}:${minutes}:${seconds}`;
}

export function FileTable({ items, currentPath }: FileTableProps) {
	const [sortField, setSortField] = useState<SortField>('name');
	const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

	// Dialog states
	const [renameItem, setRenameItem] = useState<Item | null>(null);
	const [deleteItem, setDeleteItem] = useState<Item | null>(null);

	const handleSort = (field: SortField) => {
		if (sortField === field) {
			setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
		} else {
			setSortField(field);
			setSortDirection('asc');
		}
	};

	const sortedItems = [...items].sort((a, b) => {
		// Keep directories on top unless sorting by size or date specifically, or we can just sort generally
		if (a.isDirectory && !b.isDirectory) return -1;
		if (!a.isDirectory && b.isDirectory) return 1;

		let comparison = 0;
		if (sortField === 'name') {
			comparison = a.name.localeCompare(b.name);
		} else if (sortField === 'size') {
			comparison = a.size - b.size;
		} else if (sortField === 'modifiedAt') {
			comparison =
				new Date(a.modifiedAt).getTime() - new Date(b.modifiedAt).getTime();
		}

		return sortDirection === 'asc' ? comparison : -comparison;
	});

	const renderSortIcon = (field: SortField) => {
		if (sortField !== field)
			return <ArrowUpDown className="ml-1 size-3 text-slate-500" />;
		return sortDirection === 'asc' ? (
			<ArrowUp className="ml-1 size-3 text-blue-400" />
		) : (
			<ArrowDown className="ml-1 size-3 text-blue-400" />
		);
	};

	return (
		<div className="w-full overflow-hidden rounded-lg border border-slate-800 bg-[#0d121f]">
			<Table>
				<TableHeader className="bg-[#121824] border-b border-slate-800">
					<TableRow className="hover:bg-transparent">
						<TableHead
							onClick={() => handleSort('name')}
							className="w-1/2 text-slate-300 font-semibold cursor-pointer select-none hover:text-slate-100 py-3 h-11"
						>
							<div className="flex items-center">
								Name {renderSortIcon('name')}
							</div>
						</TableHead>
						<TableHead
							onClick={() => handleSort('size')}
							className="w-1/6 text-slate-300 font-semibold cursor-pointer select-none hover:text-slate-100 py-3 h-11"
						>
							<div className="flex items-center">
								Size {renderSortIcon('size')}
							</div>
						</TableHead>
						<TableHead
							onClick={() => handleSort('modifiedAt')}
							className="w-1/4 text-slate-300 font-semibold cursor-pointer select-none hover:text-slate-100 py-3 h-11"
						>
							<div className="flex items-center">
								Date Modified {renderSortIcon('modifiedAt')}
							</div>
						</TableHead>
						<TableHead className="w-1/12 text-slate-300 font-semibold text-right py-3 h-11 pr-6">
							Action
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{sortedItems.length === 0 ? (
						<TableRow>
							<TableCell
								colSpan={4}
								className="text-center py-10 text-slate-500 text-sm"
							>
								No files or folders found
							</TableCell>
						</TableRow>
					) : (
						sortedItems.map((item) => (
							<TableRow
								key={item.path}
								className="border-b border-slate-800/60 hover:bg-[#151c2d] text-slate-200 transition-colors"
							>
								<TableCell className="font-medium py-3 h-12">
									<div className="flex items-center gap-3">
										{item.isDirectory ? (
											<>
												<Folder className="size-4.5 text-blue-400 flex-shrink-0" />
												<Link
													href={`/${item.path}`}
													className="hover:underline text-blue-400 hover:text-blue-300 font-medium truncate max-w-md block"
												>
													{item.name}
												</Link>
											</>
										) : (
											<>
												<FileText className="size-4.5 text-slate-400 flex-shrink-0" />
												<a
													href={getDownloadUrl(item.path)}
													className="hover:underline text-slate-200 hover:text-slate-100 font-normal truncate max-w-md block"
												>
													{item.name}
												</a>
											</>
										)}
									</div>
								</TableCell>
								<TableCell className="text-slate-400 py-3 h-12">
									{item.isDirectory ? '—' : formatSize(item.size)}
								</TableCell>
								<TableCell className="text-slate-400 py-3 h-12 whitespace-nowrap">
									{formatDate(item.modifiedAt)}
								</TableCell>
								<TableCell className="text-right py-3 h-12 pr-6">
									<DropdownMenu>
										<DropdownMenuTrigger
											render={
												<Button
													variant="ghost"
													size="icon-sm"
													className="h-8 w-8 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-md cursor-pointer"
												/>
											}
										>
											<MoreVertical className="size-4" />
										</DropdownMenuTrigger>
										<DropdownMenuContent
											align="end"
											className="bg-[#121824] border border-slate-800 text-slate-200 w-36 py-1 rounded-lg"
										>
											{!item.isDirectory && (
												<DropdownMenuItem
													render={
														<a
															href={getDownloadUrl(item.path)}
															download
															target="_blank"
															className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-800 cursor-pointer focus:bg-slate-800"
														/>
													}
												>
													<Download className="size-3.5 text-slate-400" />
													Download
												</DropdownMenuItem>
											)}
											<DropdownMenuItem
												onClick={() => setRenameItem(item)}
												className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-800 cursor-pointer focus:bg-slate-800"
											>
												<Pencil className="size-3.5 text-slate-400" />
												Rename
											</DropdownMenuItem>
											<DropdownMenuItem
												onClick={() => setDeleteItem(item)}
												className="flex items-center gap-2 px-3 py-2 text-sm text-rose-400 hover:bg-slate-800 cursor-pointer focus:bg-slate-800"
											>
												<Trash className="size-3.5 text-rose-500" />
												Remove
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</TableCell>
							</TableRow>
						))
					)}
				</TableBody>
			</Table>

			{/* Rename Dialog */}
			<RenameDialog
				open={renameItem !== null}
				onOpenChange={(open) => !open && setRenameItem(null)}
				item={renameItem}
				currentPath={currentPath}
			/>

			{/* Delete Dialog */}
			<DeleteDialog
				open={deleteItem !== null}
				onOpenChange={(open) => !open && setDeleteItem(null)}
				item={deleteItem}
				currentPath={currentPath}
			/>
		</div>
	);
}
