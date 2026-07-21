'use client';

import { useActionState, useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUploadStore } from '@/lib/upload-store';

interface UploadDialogProps {
	currentPath: string;
	onSuccess: () => void;
}

interface FormState {
	error?: string;
}

export function UploadDialog({ currentPath, onSuccess }: UploadDialogProps) {
	const [open, setOpen] = useState(false);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [fileName, setFileName] = useState('');
	const fileInputRef = useRef<HTMLInputElement>(null);

	const startUpload = useUploadStore((state) => state.startUpload);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			const file = e.target.files[0];
			setSelectedFile(file);
			setFileName(file.name);
		}
	};

	async function handleUploadAction(
		_prevState: FormState,
		formData: FormData
	): Promise<FormState> {
		const file = formData.get('file') as File | null;
		const name = (formData.get('fileName') as string)?.trim();

		if (!selectedFile && (!file || file.size === 0)) {
			return { error: 'Please select a file to upload' };
		}
		if (!name) {
			return { error: 'File name is required' };
		}

		const fileToUpload = selectedFile || file!;

		setOpen(false);
		startUpload(currentPath, name, fileToUpload, () => {
			setSelectedFile(null);
			setFileName('');
			onSuccess();
		});

		return {};
	}

	const [state, formAction, isPending] = useActionState(handleUploadAction, {});

	const triggerBrowse = () => {
		fileInputRef.current?.click();
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger
				render={
					<Button className="bg-[#1b64f2] hover:bg-[#1a56cc] text-white flex items-center gap-2 px-4 h-10 rounded font-medium cursor-pointer" />
				}
			>
				<Upload className="size-4" />
				Upload File
			</DialogTrigger>

			<DialogContent className="bg-[#121824] border border-slate-800 text-slate-200 p-6 rounded-xl max-w-md w-full">
				<DialogHeader>
					<DialogTitle className="text-lg font-semibold text-slate-100">
						Upload File
					</DialogTitle>
				</DialogHeader>

				<form action={formAction} className="flex flex-col gap-5 mt-4">
					<input
						type="file"
						name="file"
						ref={fileInputRef}
						onChange={handleFileChange}
						className="hidden"
					/>

					<div className="flex flex-col gap-2">
						<div
							onClick={triggerBrowse}
							className="flex items-center gap-3 border border-slate-700 bg-[#172033] hover:bg-[#1e2a45] px-3 py-2 rounded-lg cursor-pointer text-slate-300 transition-colors"
						>
							<Button
								type="button"
								variant="secondary"
								size="sm"
								className="h-7 bg-[#24324f] hover:bg-[#2c3e61] border border-slate-600 text-slate-200"
							>
								Browse...
							</Button>
							<span className="text-slate-400 text-sm truncate">
								{selectedFile ? selectedFile.name : 'Select a file...'}
							</span>
						</div>
					</div>

					<div className="flex flex-col gap-2">
						<label className="text-slate-300 text-xs font-medium">
							Enter your file name:
						</label>
						<Input
							name="fileName"
							type="text"
							value={fileName}
							onChange={(e) => setFileName(e.target.value)}
							placeholder="filename.ext"
							className="bg-[#172033] border-slate-700 text-slate-200 focus-visible:ring-blue-500 rounded-lg"
							disabled={!selectedFile}
							required
						/>
					</div>

					{state.error && (
						<p className="text-rose-500 text-xs">{state.error}</p>
					)}

					<Button
						type="submit"
						disabled={!selectedFile || !fileName.trim() || isPending}
						className="w-full bg-[#1b64f2] hover:bg-[#1a56cc] text-white font-medium py-2 rounded-lg mt-2 disabled:opacity-50 cursor-pointer"
					>
						{isPending ? 'Uploading...' : 'Upload'}
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	);
}
