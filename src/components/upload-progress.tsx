'use client';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import {
	Progress,
	ProgressTrack,
	ProgressIndicator,
} from '@/components/ui/progress';
import { useUploadStore } from '@/lib/upload-store';

export function UploadProgress() {
	const { isUploading, byteWritten, totalBytes } = useUploadStore();
	const percent =
		totalBytes > 0 ? Math.min(100, (byteWritten / totalBytes) * 100) : 0;

	return (
		<Dialog open={isUploading}>
			<DialogContent
				showCloseButton={false}
				className="bg-[#121824] border border-slate-800 text-slate-200 p-6 rounded-xl max-w-md w-full"
			>
				<DialogTitle className="text-lg font-semibold text-slate-100 mb-4">
					Uploading File
				</DialogTitle>
				<div className="flex flex-col gap-4">
					<div className="flex justify-between items-center">
						<span className="bg-[#15ebe0]/10 text-[#15ebe0] font-bold text-xs px-2.5 py-1 rounded-full uppercase tracking-wider">
							Progress
						</span>
						<span className="text-[#15ebe0] font-semibold text-sm tabular-nums">
							{percent.toFixed(1)}%
						</span>
					</div>

					<Progress value={percent} className="flex flex-col">
						<ProgressTrack className="h-2 w-full bg-slate-800 rounded-full">
							<ProgressIndicator className="h-full bg-linear-to-r from-[#15d0eb] to-[#15ebe0] rounded-full transition-all duration-300" />
						</ProgressTrack>
					</Progress>

					<p className="text-slate-400 text-center text-xs mt-2">
						Uploading... Please wait
					</p>
				</div>
			</DialogContent>
		</Dialog>
	);
}
