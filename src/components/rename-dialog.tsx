'use client';

import { useActionState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Item } from '@/lib/types';
import { renameItem } from '@/lib/api';

interface RenameDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	item: Item | null;
	currentPath: string;
}

interface FormState {
	error?: string;
	success?: boolean;
}

export function RenameDialog({
	open,
	onOpenChange,
	item,
	currentPath,
}: RenameDialogProps) {
	const queryClient = useQueryClient();

	async function handleRenameAction(
		_prevState: FormState,
		formData: FormData
	): Promise<FormState> {
		const newName = (formData.get('newName') as string)?.trim();
		const itemPath = formData.get('itemPath') as string;

		if (!newName || !itemPath) {
			return { error: 'Name is required' };
		}

		try {
			await renameItem(itemPath, newName);
			await queryClient.invalidateQueries({ queryKey: ['items', currentPath] });
			onOpenChange(false);
			return { success: true };
		} catch (err: any) {
			console.error(err);
			return { error: err.message || 'Failed to rename item' };
		}
	}

	const [state, formAction, isPending] = useActionState(handleRenameAction, {});

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="bg-[#121824] border border-slate-800 text-slate-200 p-6 rounded-xl max-w-md w-full">
				<DialogHeader>
					<DialogTitle className="text-lg font-semibold text-slate-100">
						{item?.isDirectory ? 'Rename Folder' : 'Rename File'}
					</DialogTitle>
				</DialogHeader>

				<form action={formAction} key={item?.path || 'rename'} className="flex flex-col gap-4 mt-4">
					<input type="hidden" name="itemPath" value={item?.path || ''} />
					<Input
						name="newName"
						type="text"
						defaultValue={item?.name || ''}
						placeholder="Name"
						className="bg-[#172033] border-slate-700 text-slate-200 focus-visible:ring-blue-500 rounded-lg h-10"
						autoFocus
						required
					/>

					{state.error && (
						<p className="text-rose-500 text-xs">{state.error}</p>
					)}

					<Button
						type="submit"
						disabled={isPending}
						className="w-full bg-[#10a37f] hover:bg-[#0e8a6b] text-white font-medium py-2 rounded-lg disabled:opacity-50 cursor-pointer"
					>
						{isPending ? 'Submitting...' : 'Submit'}
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	);
}
