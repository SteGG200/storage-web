import { StorageBrowser } from '@/components/storage-browser';
import { normalizePath } from '@/lib/api';

interface PageProps {
	params: Promise<{
		path?: string[];
	}>;
}

export default async function Page({ params }: PageProps) {
	const resolvedParams = await params;
	const pathString = normalizePath(resolvedParams.path);

	return (
		<main className="flex-1 flex flex-col py-6 px-4 md:px-8 max-w-7xl mx-auto w-full">
			<StorageBrowser currentPath={pathString} />
		</main>
	);
}
