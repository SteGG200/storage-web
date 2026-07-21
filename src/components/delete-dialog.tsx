'use client';

import { useActionState } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Item } from '@/lib/types';
import { deleteItem } from '@/lib/api';

interface DeleteDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	item: Item | null;
	currentPath: string;
}

interface FormState {
	error?: string;
	success?: boolean;
}

export function DeleteDialog({
	open,
	onOpenChange,
	item,
	currentPath,
}: DeleteDialogProps) {
	const queryClient = useQueryClient();

	async function handleDeleteAction(
		_prevState: FormState,
		formData: FormData
	): Promise<FormState> {
		const itemPath = formData.get('itemPath') as string;
		if (!itemPath) return { error: 'Item path is missing' };

		try {
			await deleteItem(itemPath);
			await queryClient.invalidateQueries({ queryKey: ['items', currentPath] });
			onOpenChange(false);
			return { success: true };
		} catch (err: any) {
			console.error(err);
			return { error: err.message || 'Failed to delete item' };
		}
	}

	const [state, formAction, isPending] = useActionState(handleDeleteAction, {});

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent className="bg-[#121824] border border-slate-800 text-slate-200 p-6 rounded-xl max-w-md w-full">
				<AlertDialogHeader>
					<AlertDialogTitle className="text-lg font-semibold text-slate-100 flex items-center gap-2">
						<AlertTriangle className="size-5 text-rose-500" />
						Confirm Delete
					</AlertDialogTitle>
				</AlertDialogHeader>

				<form action={formAction} key={item?.path || 'delete'} className="flex flex-col gap-4 mt-3">
					<input type="hidden" name="itemPath" value={item?.path || ''} />

					<div className="border border-red-950 bg-red-950/20 p-4 rounded-lg flex flex-col gap-1.5">
						<p className="text-rose-500 font-medium">
							Are you sure you want to remove &quot;{item?.name}&quot; ?
						</p>
						<p className="text-slate-400 text-xs">
							This {item?.isDirectory ? 'folder' : 'file'} will be permanently
							deleted.
						</p>
						<p className="text-slate-400 text-xs font-semibold">
							This action cannot be undone.
						</p>
					</div>

					{state.error && (
						<p className="text-rose-500 text-xs">{state.error}</p>
					)}

					<div className="flex justify-end gap-3 mt-2">
						<AlertDialogCancel
							type="button"
							className="bg-[#1c2438] hover:bg-[#252f47] border-slate-700 text-slate-200 cursor-pointer"
							disabled={isPending}
						>
							Cancel
						</AlertDialogCancel>

						<Button
							type="submit"
							disabled={isPending}
							className="bg-[#c20a1c] hover:bg-[#a60817] text-white flex items-center gap-2 cursor-pointer"
						>
							<Trash2 className="size-4" />
							{isPending ? 'Removing...' : 'Remove'}
						</Button>
					</div>
				</form>
			</AlertDialogContent>
		</AlertDialog>
	);
}
