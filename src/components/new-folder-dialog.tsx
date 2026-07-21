'use client';

import { useActionState, useState } from 'react';
import { FolderPlus } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createFolder } from '@/lib/api';

interface NewFolderDialogProps {
	currentPath: string;
}

interface FormState {
	error?: string;
	success?: boolean;
}

export function NewFolderDialog({ currentPath }: NewFolderDialogProps) {
	const [open, setOpen] = useState(false);
	const queryClient = useQueryClient();

	async function handleCreateAction(
		_prevState: FormState,
		formData: FormData
	): Promise<FormState> {
		const folderName = (formData.get('folderName') as string)?.trim();
		if (!folderName) {
			return { error: 'Folder name is required' };
		}

		try {
			await createFolder(currentPath, folderName);
			await queryClient.invalidateQueries({ queryKey: ['items', currentPath] });
			setOpen(false);
			return { success: true };
		} catch (err: any) {
			console.error(err);
			return { error: err.message || 'Failed to create folder' };
		}
	}

	const [state, formAction, isPending] = useActionState(handleCreateAction, {});

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger
				render={
					<Button className="bg-[#10a37f] hover:bg-[#0e8a6b] text-white flex items-center gap-2 px-4 h-10 rounded font-medium cursor-pointer" />
				}
			>
				<FolderPlus className="size-4" />
				New Folder
			</DialogTrigger>

			<DialogContent className="bg-[#121824] border border-slate-800 text-slate-200 p-6 rounded-xl max-w-md w-full">
				<DialogHeader>
					<DialogTitle className="text-lg font-semibold text-slate-100">
						New Folder
					</DialogTitle>
				</DialogHeader>

				<form action={formAction} className="flex flex-col gap-4 mt-4">
					<Input
						name="folderName"
						type="text"
						placeholder="Folder Name"
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
						{isPending ? 'Creating...' : 'Create'}
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	);
}
