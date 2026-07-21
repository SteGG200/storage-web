import { create } from 'zustand';
import { SSE } from 'sse.js';
import { getApiUrl } from './api';

interface UploadState {
	isUploading: boolean;
	byteWritten: number;
	totalBytes: number;
	error: string | null;
	startUpload: (
		path: string,
		fileName: string,
		file: File,
		onComplete: () => void
	) => void;
	resetUpload: () => void;
}

export const useUploadStore = create<UploadState>((set) => ({
	isUploading: false,
	byteWritten: 0,
	totalBytes: 0,
	error: null,
	startUpload: (path, fileName, file, onComplete) => {
		set({
			isUploading: true,
			byteWritten: 0,
			totalBytes: file.size,
			error: null,
		});

		const url = getApiUrl('upload', path);
		const formData = new FormData();
		formData.append('name', fileName);
		formData.append('file', file);

		try {
			const source = new SSE(url, {
				method: 'POST',
				payload: formData,
			});

			source.addEventListener('info', (e: any) => {
				try {
					const rawData = JSON.parse(e.data);
					set({
						byteWritten: rawData.byteWritten || 0,
						totalBytes: rawData.totalBytes || file.size,
					});
				} catch (err) {
					console.error('Failed to parse SSE data', err);
				}
			});

			source.addEventListener('error', (e: any) => {
				set({ error: 'Upload failed. Please try again.', isUploading: false });
				source.close();
			});

			source.addEventListener('readystatechange', (e: any) => {
				// readyState 2 is CLOSED
				if (source.readyState === 2) {
					set((state) => {
						if (!state.error) {
							// Trigger final completion callback
							setTimeout(() => {
								set({ isUploading: false });
								onComplete();
							}, 800); // Brief pause so user sees progress complete
							return { byteWritten: file.size, totalBytes: file.size };
						}
						return {};
					});
				}
			});

			source.stream();
		} catch (err: any) {
			set({
				error: err.message || 'Failed to start upload',
				isUploading: false,
			});
		}
	},
	resetUpload: () => {
		set({
			isUploading: false,
			byteWritten: 0,
			totalBytes: 0,
			error: null,
		});
	},
}));
